import { json, type RequestHandler } from '@sveltejs/kit';
import { assertCommerceEnabled } from '$lib/server/guards';

/**
 * POST /cart/add
 *
 * The endpoint §3.5 names directly: with commerce disabled this must answer
 * 403 even when handed a perfectly valid product id.
 *
 * Two independent things enforce that. The hook refuses the path before it
 * gets here, and the guard below refuses it again if the hook's route list
 * ever stops covering this path. Neither is redundant: the hook protects
 * routes that forget the guard, the guard protects paths the hook has not
 * been told about.
 */
export const POST: RequestHandler = async ({ locals, request }) => {
	// First statement. Nothing above this line may read the body, look up a
	// product, or touch a session (§3.3).
	await assertCommerceEnabled(locals);

	const body = await request.json().catch(() => null);
	const productId = typeof body?.productId === 'string' ? body.productId : null;

	if (!productId) return json({ error: 'productId is required' }, { status: 400 });

	// Cart persistence lands in P6. Reaching this line means commerce is on and
	// the request was well formed, so answering 501 is the truth: the endpoint
	// exists and accepted you, and the feature behind it is not built yet.
	return json({ error: 'The cart is not implemented yet.' }, { status: 501 });
};
