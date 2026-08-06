import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { command: 'npm run build && npm run preview', port: 4173 },
	testMatch: '**/*.e2e.{ts,js}',
	use: { baseURL: 'http://localhost:4173' },

	/**
	 * Single worker, deliberately.
	 *
	 * The gate tests toggle `site_settings` in a shared Supabase project. With
	 * parallel workers, one file flipping commerce on would race another file
	 * asserting gated behaviour, and the suite would fail intermittently for
	 * reasons that have nothing to do with the code under test.
	 *
	 * If the suite grows enough for this to hurt, the fix is a per-worker
	 * database rather than parallelism over a shared one.
	 */
	workers: 1
});
