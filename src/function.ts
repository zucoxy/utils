/** 防抖配置 */
export interface DebounceOptions {
  /** 首次调用立即执行，默认 false */
  leading?: boolean;
  /** 停止触发后执行，默认 true */
  trailing?: boolean;
}

/** 防抖函数（带 `cancel` / `flush`） */
export interface Debounced<A extends unknown[]> {
  (...args: A): void;
  /** 取消待执行的调用 */
  cancel(): void;
  /** 立即执行待执行的调用 */
  flush(): void;
}

/** 节流配置 */
export interface ThrottleOptions {
  /** 首次调用立即执行，默认 true */
  leading?: boolean;
  /** 结束后补一次，默认 true */
  trailing?: boolean;
}

/** 节流函数（带 `cancel`） */
export interface Throttled<A extends unknown[]> {
  (...args: A): void;
  /** 取消待执行的调用 */
  cancel(): void;
}

/**
 * 防抖：停止触发 `wait` 毫秒后执行，期间重复调用会重新计时
 * @param fn 目标函数
 * @param wait 等待毫秒，默认 300
 * @param options.leading 首次是否立即执行，默认 false
 * @param options.trailing 停止后是否执行，默认 true
 * @example
 * const onSearch = debounce((kw: string) => query(kw), 300);
 * input.addEventListener('input', () => onSearch(input.value));
 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  wait = 300,
  options: DebounceOptions = {},
): Debounced<A> {
  const { leading = false, trailing = true } = options;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: A | null = null;

  const invoke = () => {
    if (lastArgs) {
      fn(...lastArgs);
      lastArgs = null;
    }
  };

  const debounced = (...args: A) => {
    lastArgs = args;
    if (timer === null && leading) fn(...args);
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (trailing) invoke();
    }, wait);
  };
  debounced.cancel = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    lastArgs = null;
  };
  debounced.flush = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    if (trailing) invoke();
  };
  return debounced;
}

/**
 * 节流：每 `wait` 毫秒最多执行一次
 * @param fn 目标函数
 * @param wait 间隔毫秒，默认 300
 * @param options.leading 首次是否立即执行，默认 true
 * @param options.trailing 结束后是否补一次，默认 true
 * @example
 * const onScroll = throttle(() => update(), 200);
 */
export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  wait = 300,
  options: ThrottleOptions = {},
): Throttled<A> {
  const { leading = true, trailing = true } = options;
  let lastTime = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: A | null = null;

  const invoke = (time: number) => {
    lastTime = time;
    if (lastArgs) {
      fn(...lastArgs);
      lastArgs = null;
    }
  };

  const throttled = (...args: A) => {
    const now = Date.now();
    if (!lastTime && !leading) lastTime = now;
    const remaining = wait - (now - lastTime);
    lastArgs = args;
    if (remaining <= 0 || remaining > wait) {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      invoke(now);
    }
    else if (timer === null && trailing) {
      timer = setTimeout(() => {
        timer = null;
        invoke(Date.now());
      }, remaining);
    }
  };
  throttled.cancel = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    lastTime = 0;
    lastArgs = null;
  };
  return throttled;
}

/**
 * 只执行一次，后续调用直接返回首次结果
 * @example
 * const init = once(() => createStore());
 * init() === init(); // true
 */
export function once<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  let called = false;
  let result!: R;
  return (...args: A) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}

/**
 * 记忆化：按 key 缓存结果
 * @param fn 目标函数
 * @param resolver 自定义缓存 key，缺省用第一个参数
 * @example
 * const add = memoize((a: number, b: number) => a + b, (a, b) => `${a}-${b}`);
 */
export function memoize<A extends unknown[], R>(
  fn: (...args: A) => R,
  resolver?: (...args: A) => unknown,
): (...args: A) => R {
  const cache = new Map<unknown, R>();
  return (...args: A) => {
    const key = resolver ? resolver(...args) : args[0];
    if (cache.has(key)) return cache.get(key) as R;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * 等待指定毫秒
 * @example
 * await sleep(1000);
 */
export const sleep = (ms: number): Promise<void> => new Promise<void>(resolve => setTimeout(resolve, ms));

/** 重试配置 */
export interface RetryOptions {
  /** 重试次数（不含首次），默认 3 */
  retries?: number;
  /** 首次重试前的等待毫秒，默认 0 */
  delay?: number;
  /** 等待时间递增倍数，默认 1 */
  factor?: number;
  /** 每次重试前的回调 */
  onRetry?: (error: unknown, attempt: number) => void;
}

/**
 * 失败自动重试
 * @param fn 返回 Promise 或同步值的任务
 * @param options 重试配置
 * @example
 * const data = await retry(() => fetch(url).then(r => r.json()), { retries: 3, delay: 500, factor: 2 });
 */
export async function retry<T>(fn: () => Promise<T> | T, options: RetryOptions = {}): Promise<T> {
  const { retries = 3, delay = 0, factor = 1, onRetry } = options;
  let attempt = 0;
  let wait = delay;
  for (;;) {
    try {
      return await fn();
    }
    catch (error) {
      attempt++;
      if (attempt > retries) throw error;
      onRetry?.(error, attempt);
      if (wait > 0) await sleep(wait);
      wait *= factor;
    }
  }
}

/** 并发限制器 */
export type Limiter = <T>(task: () => Promise<T> | T) => Promise<T>;

/**
 * 创建并发控制器，最多同时运行 `concurrency` 个任务
 * @param concurrency 并发数（>= 1）
 * @throws {RangeError} 并发数非法时
 * @example
 * const limit = pLimit(2);
 * await Promise.all(urls.map(url => limit(() => fetch(url))));
 */
export function pLimit(concurrency: number): Limiter {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new RangeError('concurrency must be a positive integer');
  }
  let activeCount = 0;
  const queue: Array<() => void> = [];
  const next = () => {
    activeCount--;
    const run = queue.shift();
    if (run) run();
  };
  return <T>(task: () => Promise<T> | T): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const run = () => {
        activeCount++;
        Promise.resolve()
          .then(task)
          .then(resolve, reject)
          .finally(next);
      };
      if (activeCount < concurrency) run();
      else queue.push(run);
    });
}

/**
 * 从左到右组合单值函数
 * @example
 * pipe(add1, double)(3); // (3 + 1) * 2 = 8
 */
export const pipe =
  <T>(...fns: Array<(arg: T) => T>): ((arg: T) => T) =>
    (arg: T) =>
      fns.reduce((acc, fn) => fn(acc), arg);

/**
 * 从右到左组合单值函数
 * @example
 * compose(add1, double)(3); // (3 * 2) + 1 = 7
 */
export const compose = <T>(...fns: Array<(arg: T) => T>): ((arg: T) => T) => pipe(...fns.reverse());

/** 空函数，常用于占位 */
export const noop = (): void => {};
