// utils/rate-limiter.ts
export class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,       // จำนวนโควต้า (3)
    private refillMs: number,       // รอบเติม (60_000)
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  private refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed >= this.refillMs) {
      const refillCount = Math.floor(elapsed / this.refillMs);
      this.tokens = Math.min(this.capacity, this.tokens + refillCount * this.capacity);
      this.lastRefill = now - (elapsed % this.refillMs);
    }
  }

  async removeToken(): Promise<void> {
    while (true) {
      this.refill();
      if (this.tokens > 0) {
        this.tokens -= 1;
        return;
      }
      const waitMs = this.refillMs - (Date.now() - this.lastRefill);
      await new Promise(res => setTimeout(res, Math.max(waitMs, 250)));
    }
  }
}
