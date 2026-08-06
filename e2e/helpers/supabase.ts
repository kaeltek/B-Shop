import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Minimal .env reader for the test suite.
 *
 * Playwright does not load .env, and pulling in dotenv for four variables is
 * not worth a dependency.
 */
function readEnv(): Record<string, string> {
	const path = fileURLToPath(new URL('../../.env', import.meta.url));

	let raw: string;
	try {
		raw = readFileSync(path, 'utf8');
	} catch {
		return {};
	}

	const env: Record<string, string> = {};
	for (const line of raw.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;

		const eq = trimmed.indexOf('=');
		if (eq === -1) continue;

		const key = trimmed.slice(0, eq).trim();
		const value = trimmed
			.slice(eq + 1)
			.trim()
			.replace(/^["']|["']$/g, '');

		if (value) env[key] = value;
	}
	return env;
}

const env = readEnv();

export const SUPABASE_URL = env.PUBLIC_SUPABASE_URL ?? '';
export const ANON_KEY = env.PUBLIC_SUPABASE_ANON_KEY ?? '';
export const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY ?? '';

/** Whether the suite can write to the database (needed to toggle the gate). */
export const canWrite = Boolean(SUPABASE_URL && SERVICE_KEY);

/** Whether the suite can read the database. */
export const canRead = Boolean(SUPABASE_URL && ANON_KEY);

/** A published product's id, for tests that need a real one. */
export async function firstPublishedProductId(): Promise<string | null> {
	if (!canRead) return null;

	const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id&limit=1`, {
		headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
	});
	if (!response.ok) return null;

	const rows = (await response.json()) as { id: string }[];
	return rows[0]?.id ?? null;
}

/**
 * Flips the commerce gate.
 *
 * Uses the service-role key because `site_settings` restricts UPDATE to admins
 * and the suite has no admin session until P5 lands. This is the same write the
 * admin console will make.
 */
export async function setCommerceEnabled(enabled: boolean): Promise<void> {
	if (!canWrite) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');

	const response = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?id=eq.true`, {
		method: 'PATCH',
		headers: {
			apikey: SERVICE_KEY,
			Authorization: `Bearer ${SERVICE_KEY}`,
			'Content-Type': 'application/json',
			Prefer: 'return=minimal'
		},
		body: JSON.stringify({ commerce_enabled: enabled })
	});

	if (!response.ok) {
		throw new Error(`Failed to set commerce_enabled=${enabled}: ${await response.text()}`);
	}
}
