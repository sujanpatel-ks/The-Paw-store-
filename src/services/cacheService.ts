interface CacheEntry {
  value: any;
  expiry: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry>();

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: any, ttlMs: number): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs,
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cacheService = new CacheService();
