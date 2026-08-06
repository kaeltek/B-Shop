/**
 * Fixed-window rate limiter, in process memory.
 *
 * Honest about what this is: serverless instances do not share memory, so the
 * effective limit is per warm instance rather than global. That still stops the
 * naive case this is aimed at — one script hammering one endpoint — and it
 * costs nothing. If abuse becomes real, move the counter to Postgres or Redis;
 * the call site does not change.
 */

interface Window {
	count: number;
	resetAt: number;
}

const windows = new Map<string, Window>();

/** Keeps the map from growing without bound on a long-lived instance. */
function sweep(now: number) {
	if (windows.size < 5000) return;
	for (const [key, window] of windows) {
		if (window.resetAt <= now) windows.delete(key);
	}
}

export interface RateLimitResult {
	allowed: boolean;
	/** Seconds until the window resets. */
	retryAfter: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
	const now = Date.now();
	sweep(now);

	const existing = windows.get(key);

	if (!existing || existing.resetAt <= now) {
		windows.set(key, { count: 1, resetAt: now + windowMs });
		return { allowed: true, retryAfter: 0 };
	}

	existing.count += 1;

	return {
		allowed: existing.count <= limit,
		retryAfter: Math.ceil((existing.resetAt - now) / 1000)
	};
}

/**
 * Truncates an address to a /24 (IPv4) or /64 (IPv6).
 *
 * Enough to identify an abusive source, not enough to identify a person — the
 * prefix is what gets stored alongside a signup, so data minimisation matters
 * (GDPR). Never store the full address.
 */
export function addressPrefix(address: string): string {
	if (address.includes(':')) {
		return address.split(':').slice(0, 4).join(':') + '::/64';
	}
	const octets = address.split('.');
	if (octets.length === 4) return `${octets.slice(0, 3).join('.')}.0/24`;
	return address;
}
