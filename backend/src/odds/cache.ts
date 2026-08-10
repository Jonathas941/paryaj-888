/**
 * Minimal in-process TTL cache. Used to avoid wasting provider quota on
 * repeated identical requests. Not distributed — fine for a single Railway
 * service instance. Bet validation bypasses the cache for fresh odds.
 */
interface Entry<T> {
  value: T;
  expires: number;
}

export class TtlCache<T = unknown> {
  private store = new Map<string, Entry<T>>();

  constructor(private defaultTtlMs: number) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T, ttlMs?: number): void {
    this.store.set(key, { value, expires: Date.now() + (ttlMs ?? this.defaultTtlMs) });
  }

  clear(): void {
    this.store.clear();
  }
}