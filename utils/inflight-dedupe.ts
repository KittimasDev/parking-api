// utils/inflight-dedupe.ts
export class InflightMap<K, V> {
  private map = new Map<K, Promise<V>>();
  run(key: K, factory: () => Promise<V>): Promise<V> {
    const existing = this.map.get(key);
    if (existing) return existing;
    const p = factory().finally(() => this.map.delete(key));
    this.map.set(key, p);
    return p;
  }
}
