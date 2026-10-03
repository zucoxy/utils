import { afterEach, describe, expect, it, vi } from 'vitest';
import { compose, debounce, memoize, noop, once, pLimit, pipe, retry, sleep, throttle } from '../src/function';

afterEach(() => {
  vi.useRealTimers();
});

describe('debounce', () => {
  it('trailing（默认）只执行最后一次', () => {
    vi.useFakeTimers();
    let count = 0;
    const fn = debounce(() => {
      count++;
    }, 100);
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    vi.advanceTimersByTime(100);
    expect(count).toBe(1);
  });

  it('leading 立即执行一次', () => {
    vi.useFakeTimers();
    let count = 0;
    const fn = debounce(
      () => {
        count++;
      },
      100,
      { leading: true, trailing: false },
    );
    fn();
    fn();
    expect(count).toBe(1);
    vi.advanceTimersByTime(100);
    expect(count).toBe(1);
  });

  it('cancel / flush', () => {
    vi.useFakeTimers();
    let count = 0;
    const fn = debounce(() => {
      count++;
    }, 100);
    fn();
    fn.cancel();
    vi.advanceTimersByTime(200);
    expect(count).toBe(0);

    fn();
    fn.flush();
    expect(count).toBe(1);
  });
});

describe('throttle', () => {
  it('leading + trailing', () => {
    vi.useFakeTimers();
    let count = 0;
    const fn = throttle(() => {
      count++;
    }, 100);
    fn();
    expect(count).toBe(1);
    fn();
    fn();
    expect(count).toBe(1);
    vi.advanceTimersByTime(100);
    expect(count).toBe(2);
  });
});

describe('once / memoize', () => {
  it('once 只执行一次并返回首次结果', () => {
    let calls = 0;
    const fn = once((n: number) => {
      calls++;
      return n * 2;
    });
    expect(fn(2)).toBe(4);
    expect(fn(3)).toBe(4);
    expect(calls).toBe(1);
  });

  it('memoize 按首参缓存', () => {
    let calls = 0;
    const fn = memoize((n: number) => {
      calls++;
      return n * 2;
    });
    expect(fn(2)).toBe(4);
    expect(fn(2)).toBe(4);
    expect(calls).toBe(1);
    expect(fn(3)).toBe(6);
    expect(calls).toBe(2);
  });

  it('memoize 支持自定义 resolver', () => {
    let calls = 0;
    const fn = memoize(
      (a: number, b: number) => {
        calls++;
        return a + b;
      },
      (a, b) => `${a}-${b}`,
    );
    expect(fn(1, 2)).toBe(3);
    expect(fn(1, 2)).toBe(3);
    expect(calls).toBe(1);
  });
});

describe('sleep / retry', () => {
  it('sleep', async () => {
    vi.useFakeTimers();
    let done = false;
    const promise = sleep(100).then(() => {
      done = true;
    });
    await vi.advanceTimersByTimeAsync(100);
    await promise;
    expect(done).toBe(true);
  });

  it('retry 成功后返回结果', async () => {
    let attempt = 0;
    const result = await retry(() => {
      attempt++;
      if (attempt < 3) throw new Error('fail');
      return 'ok';
    });
    expect(result).toBe('ok');
    expect(attempt).toBe(3);
  });

  it('retry 超过次数后抛出并触发 onRetry', async () => {
    const attempts: number[] = [];
    await expect(
      retry(
        () => {
          throw new Error('boom');
        },
        {
          retries: 2,
          onRetry: (_error, attempt) => {
            attempts.push(attempt);
          },
        },
      ),
    ).rejects.toThrow('boom');
    expect(attempts).toEqual([1, 2]);
  });
});

describe('pLimit', () => {
  it('限制并发数量', async () => {
    const limit = pLimit(2);
    let running = 0;
    let maxRunning = 0;
    const task = () =>
      new Promise<number>(resolve => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        setTimeout(() => {
          running--;
          resolve(1);
        }, 10);
      });
    const results = await Promise.all([limit(task), limit(task), limit(task), limit(task)]);
    expect(results).toEqual([1, 1, 1, 1]);
    expect(maxRunning).toBeLessThanOrEqual(2);
  });

  it('并发数非法时抛错', () => {
    expect(() => pLimit(0)).toThrow(RangeError);
  });
});

describe('pipe / compose / noop', () => {
  it('pipe 从左到右', () => {
    const add1 = (n: number) => n + 1;
    const double = (n: number) => n * 2;
    expect(pipe(add1, double)(3)).toBe(8);
  });

  it('compose 从右到左', () => {
    const add1 = (n: number) => n + 1;
    const double = (n: number) => n * 2;
    expect(compose(add1, double)(3)).toBe(7);
  });

  it('noop', () => {
    expect(noop()).toBeUndefined();
  });
});
