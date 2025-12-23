// utils/retry-openai.ts
import OpenAI, { APIError } from 'openai';

export type RetryOpts = {
  retries?: number;           // จำนวนครั้งรวม (เช่น 5)
  baseDelayMs?: number;       // delay พื้นฐาน (เช่น 800ms)
  maxDelayMs?: number;        // เพดาน delay (เช่น 15_000ms)
  jitter?: boolean;           // ใส่สุ่มเพื่อกัน thundering herd
};

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function withOpenAIRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOpts = {},
): Promise<T> {
  const {
    retries = 5,
    baseDelayMs = 800,
    maxDelayMs = 15_000,
    jitter = true,
  } = opts;

  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;

      const isAPIError = err instanceof APIError || (err?.status && err?.error);
      const status = isAPIError ? err.status : undefined;

      // รีทรายเฉพาะเคสที่สมเหตุสมผล
      const retriable =
        status === 429 ||
        (status && status >= 500) ||
        // บางที network error จะไม่มี status
        (!status && (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT'));

      if (!retriable || attempt >= retries) throw err;

      // ถ้ามี Retry-After ให้เคารพก่อน
      let delay =
        Number(err?.headers?.['retry-after']) * 1000 ||
        Math.min(maxDelayMs, Math.round(baseDelayMs * Math.pow(2, attempt - 1)));

      if (jitter) {
        const noise = Math.floor(Math.random() * 400); // 0-400ms
        delay = Math.min(maxDelayMs, delay + noise);
      }

      // คุณ “ห้าม” บอก user ให้รอ แต่ฝั่งเซิร์ฟเวอร์เราหน่วงเองได้
      await sleep(delay);
      continue;
    }
  }
}
