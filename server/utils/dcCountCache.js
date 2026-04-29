// In-memory DC count cache with static pre-seeding.
//
// Pre-seeded with confirmed production values so the dashboard always has
// a number to show regardless of which forest account the server runs as.
// Live queries run in the background and update the cache when they succeed;
// access-denied failures (e.g. CBS account querying Viacom forest root) are
// silently ignored and the pre-seeded/last-good value is retained.

const STATIC_FALLBACKS = {
  'ad.viacom.com': 238,
  'ad.cbs.net':    60,
};

const TTL_MS = 15 * 60 * 1000; // 15 minutes between background refreshes

const _cache     = {};
const _refreshing = new Set();

// Pre-seed so first request returns immediately
for (const [domain, count] of Object.entries(STATIC_FALLBACKS)) {
  _cache[domain] = { count, ts: 0, source: 'static' };
}

module.exports = {
  get(domain) {
    return _cache[domain]?.count ?? STATIC_FALLBACKS[domain] ?? null;
  },

  set(domain, count) {
    _cache[domain] = { count, ts: Date.now(), source: 'live' };
  },

  source(domain) {
    return _cache[domain]?.source ?? 'static';
  },

  // Stale = never been refreshed, or last refresh > TTL ago
  isStale(domain) {
    const entry = _cache[domain];
    if (!entry || entry.source === 'static') return true;
    return (Date.now() - entry.ts) > TTL_MS;
  },

  isRefreshing(domain) { return _refreshing.has(domain); },
  markRefreshing(domain) { _refreshing.add(domain); },
  markDone(domain) { _refreshing.delete(domain); },
};
