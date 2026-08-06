import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listFeaturedProducts } from '$lib/server/db/products';
import { createServiceClient, isSupabaseConfigured } from '$lib/server/supabase';
import { addressPrefix, rateLimit } from '$lib/server/rateLimit';
import type { Product } from '$lib/types/catalogue';

export const load: PageServerLoad = async ({ locals }) => {
	if (!isSupabaseConfigured()) return { featured: [] as Product[] };

	const featured = await listFeaturedProducts(locals.supabase, 3).catch((cause) => {
		console.error('[home] featured products failed:', cause);
		return [] as Product[];
	});

	return { featured };
};

// §8.10 — one signup attempt per five minutes per /24 is generous for a person
// and useless for a script.
const SIGNUP_LIMIT = 3;
const SIGNUP_WINDOW_MS = 5 * 60 * 1000;

/**
 * Deliberately not a full RFC 5322 implementation. Anything stricter rejects
 * addresses that genuinely work; the real validation is that a confirmation
 * email arrives.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const actions: Actions = {
	newsletter: async ({ request, getClientAddress }) => {
		const data = await request.formData();
		const email = String(data.get('email') ?? '').trim();
		const consent = data.get('consent');
		const honeypot = String(data.get('website') ?? '');

		// A filled honeypot means a bot. Answer as though it succeeded — telling
		// it what tripped the detection only helps it try again.
		if (honeypot.length > 0) {
			console.warn('[newsletter] honeypot triggered');
			return { ok: true, message: 'Thank you — please check your inbox to confirm.' };
		}

		if (!EMAIL.test(email)) {
			return fail(400, { ok: false, message: 'That does not look like an email address.', email });
		}

		// Consent is required before submit (§8.10), and required again here:
		// the client-side `required` attribute is a convenience, not a control.
		if (consent !== 'yes') {
			return fail(400, {
				ok: false,
				message: 'Please tick the consent box so we know you want these emails.',
				email
			});
		}

		const prefix = addressPrefix(getClientAddress());
		const limit = rateLimit(`newsletter:${prefix}`, SIGNUP_LIMIT, SIGNUP_WINDOW_MS);
		if (!limit.allowed) {
			return fail(429, {
				ok: false,
				message: 'Too many attempts. Please try again in a few minutes.',
				email
			});
		}

		try {
			// Service-role: `newsletter_subscribers` has no anon insert policy on
			// purpose. Letting the browser write directly would hand anyone an
			// unauthenticated endpoint and make the honeypot and rate limit above
			// trivially bypassable.
			const admin = createServiceClient();

			const { error } = await admin
				.from('newsletter_subscribers')
				.insert({ email: email.toLowerCase(), source_prefix: prefix });

			// 23505 = unique_violation. Already subscribed is not an error worth
			// showing, and confirming which addresses exist would leak the list.
			if (error && error.code !== '23505') throw error;

			return { ok: true, message: 'Thank you — you are on the list.' };
		} catch (cause) {
			console.error('[newsletter] signup failed:', cause);
			return fail(500, {
				ok: false,
				message: 'We could not sign you up just now. Please try again later.',
				email
			});
		}
	}
};
