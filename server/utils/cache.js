/**
 * In-memory TTL cache for expensive PowerShell query results.
 * Cache keys should encode the query type + domain so different
 * domains never share a cache entry.
 */

const store = new Map();

/**
 * Return cached data if still fresh, otherwise call fetchFn, cache the
 * result, and return it.
 *
 * @param {string}   key        - Unique cache key (include domain in key)
 * @param {number}   ttlSeconds - Seconds before the entry expires
 * @param {Function} fetchFn    - Async function that returns fresh data
 */
async function withCache(key, ttlSeconds, fetchFn) {
  const entry = store.get(key);
  const now = Date.now();

  if (entry && now - entry.ts < ttlSeconds * 1000) {
    return { ...entry.value, cached: true };
  }

  const value = await fetchFn();
  store.set(key, { value, ts: now });
  return value;
}

/**
 * Invalidate a single key, or all keys with a given prefix when key ends with '*'.
 */
function invalidate(key) {
  if (key.endsWith('*')) {
    const prefix = key.slice(0, -1);
    for (const k of store.keys()) {
      if (k.startsWith(prefix)) store.delete(k);
    }
  } else {
    store.delete(key);
  }
}

function clearAll() {
  store.clear();
}

module.exports = { withCache, invalidate, clearAll };
