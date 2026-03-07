const TTL = {
  ARTICLES_FEED: 30, // 30s
  TOP_WRITERS: 5 * 60, // 5mns
};

class CacheService {
  constructor() {
    /** @type {Map<string, { value: any, expiresAt: number }>} */
    this.store = new Map();

    // evicting expired entries every 2 mins to prevent memory growth
    setInterval(() => this._evictExpired(), 2 * 60 * 1000).unref();
  }

  /**
   * store a value under a key for ttlSeconds sec
   * key:string, value:*, ttlSeconds:number
   */
  set(key, value, ttlSeconds) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * retrieves a val & returns null if missing or expired
   * key:string->{*|null}
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

  del(key) {
    // del a single key:string
    this.store.delete(key);
  }

  /**
   * del all keys that start with prefix:string
   * using to invalidate an entire logical group at once
   * eg: invalidatePrefix("articles:") removes "articles:p1:l10", "articles:p2:l10"
   */
  invalidatePrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  _evictExpired() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

const cache = new CacheService();

module.exports = { cache, TTL };
