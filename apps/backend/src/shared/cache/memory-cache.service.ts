import { Injectable, OnModuleDestroy } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class MemoryCacheService implements OnModuleDestroy {
  private readonly store = new Map<string, CacheEntry<any>>();
  private readonly cleanupTimer: NodeJS.Timeout;

  constructor() {
    // Clean up expired cache items every 60 seconds
    this.cleanupTimer = setInterval(() => {
      this.evictExpired();
    }, 60_000);
  }

  onModuleDestroy() {
    clearInterval(this.cleanupTimer);
    this.store.clear();
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds = 120): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  invalidatePattern(prefixOrRegex: string | RegExp): void {
    const isRegex = prefixOrRegex instanceof RegExp;
    for (const key of this.store.keys()) {
      if (isRegex ? prefixOrRegex.test(key) : key.startsWith(prefixOrRegex)) {
        this.store.delete(key);
      }
    }
  }

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds = 120,
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    const fresh = await fetchFn();
    this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  clear(): void {
    this.store.clear();
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}
