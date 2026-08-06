import { env } from '$env/dynamic/private';
import { LocalStaticStore } from './local';
import { SupabaseStore } from './supabaseStore';
import type { ImageStore } from './types';

export type StoreName = 'local' | 'supabase';
export { assertSafeKey } from './types';
export type { ImageStore } from './types';

/**
 * Resolves the driver named by `IMAGE_STORE` (§4.1).
 *
 * Defaults to `local`, which is the safe default for a developer running this
 * on their laptop and the wrong one for any real deployment — see the warning
 * on LocalStaticStore. Read fresh each call rather than cached at module load,
 * so changing the variable does not need a rebuild.
 */
export function getImageStore(): ImageStore {
	const name = (env.IMAGE_STORE ?? 'local').toLowerCase();

	switch (name) {
		case 'supabase':
			return new SupabaseStore();
		case 'local':
			return new LocalStaticStore();
		default:
			throw new Error(`Unknown IMAGE_STORE "${env.IMAGE_STORE}". Expected "local" or "supabase".`);
	}
}

export function activeStoreName(): StoreName {
	return (env.IMAGE_STORE ?? 'local').toLowerCase() === 'supabase' ? 'supabase' : 'local';
}
