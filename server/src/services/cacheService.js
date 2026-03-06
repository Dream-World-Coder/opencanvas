/**
 * cacheService.js
 *
 * Lightweight in-memory TTL cache. No external dependencies.
 * Exported as a singleton — every file that requires this gets the same instance.
 *
 * Usage:
 *   const { cache, TTL } = require("../services/cacheService");
 *
 *   cache.set("my:key", data, 30);          // store for 30 seconds
 *   const data = cache.get("my:key");       // null if missing or expired
 *   cache.invalidatePrefix("articles:");    // bust all article pages at once
 */

// TTL constants — defined here so every route uses the same values,
// and you can tune them in one place.
const TTL = {
  ARTICLES_FEED: 30, // seconds — public feed pages (acceptable staleness)
  TOP_WRITERS: 5 * 60, // 5 minutes — changes rarely
};

class CacheService {
  constructor() {
    /** @type {Map<string, { value: any, expiresAt: number }>} */
    this.store = new Map();

    // Evict expired entries every 2 minutes to prevent memory growth.
    // .unref() means this interval won't keep the Node process alive on shutdown.
    setInterval(() => this._evictExpired(), 2 * 60 * 1000).unref();
  }

  /**
   * Store a value under a key for `ttlSeconds` seconds.
   * @param {string} key
   * @param {*} value
   * @param {number} ttlSeconds
   */
  set(key, value, ttlSeconds) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Retrieve a value. Returns null if missing or expired.
   * @param {string} key
   * @returns {*|null}
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key); // lazy eviction on read
      return null;
    }

    return entry.value;
  }

  /**
   * Delete a single key.
   * @param {string} key
   */
  del(key) {
    this.store.delete(key);
  }

  /**
   * Delete all keys that start with `prefix`.
   * Use this to invalidate an entire logical group at once.
   *
   * Example: invalidatePrefix("articles:") removes
   *   "articles:p1:l10", "articles:p2:l10", etc.
   *
   * @param {string} prefix
   */
  invalidatePrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  _evictExpired() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

// Singleton — all modules share the same store
const cache = new CacheService();

module.exports = { cache, TTL };
