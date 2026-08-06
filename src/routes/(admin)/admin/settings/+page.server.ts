import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listSettingsAudit, updateSettings } from '$lib/server/db/settings';

export const load: PageServerLoad = async ({ locals }) => {
	const [commerce, audit] = await Promise.all([
		locals.getCommerce(),
		listSettingsAudit(locals.supabase, 12)
	]);

	return { commerce, audit };
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		const data = await request.formData();

		// Unchecked checkboxes are simply absent from the payload, so presence is
		// the value. Reading them any other way silently ignores "turn this off".
		const commerceEnabled = data.get('commerceEnabled') === 'on';
		const showPricesWhenGated = data.get('showPricesWhenGated') === 'on';
		const notice = String(data.get('gatedNotice') ?? '').trim();

		try {
			// RLS is what actually authorises this. A non-admin's update matches
			// zero rows and the audit trigger records nothing.
			const commerce = await updateSettings(locals.supabase, {
				commerceEnabled,
				showPricesWhenGated,
				gatedNotice: notice.length > 0 ? notice : null
			});

			return {
				ok: true,
				message: commerce.enabled
					? 'Commerce is on. The shop is live from the next request.'
					: 'Commerce is off. The site is a catalogue from the next request.'
			};
		} catch (cause) {
			console.error('[admin/settings] save failed:', cause);
			return fail(500, { ok: false, message: 'Could not save. Please try again.' });
		}
	}
};
