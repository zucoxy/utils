import type { LabelValue } from './types';
import { isObject } from './is';

/**
 * 把数组转换成 `LabelValue` 格式（常用于下拉选项）
 * @param array 支持 `string[]` / `number[]` / `[value, label][]` / `LabelValue[]`
 * @returns `{ value, label }` 数组；入参不是数组时告警并返回 `[]`
 * @example
 * arrayToOption(['a', 'b']); // [{ value: 'a', label: 'a' }, { value: 'b', label: 'b' }]
 * arrayToOption([[1, 'one']]); // [{ value: 1, label: 'one' }]
 */
export const arrayToOption = <V = unknown>(array: unknown): Required<LabelValue<V>>[] => {
  if (!Array.isArray(array)) {
    console.warn('TypeError: array excepted to be Array');
    return [];
  }
  return (array as unknown[]).map(item => {
    let option: Required<LabelValue<V>>;
    if (Array.isArray(item)) {
      const [value, label] = item as [V, string];
      option = { value, label };
    }
    else if (isObject(item)) {
      option = item as unknown as Required<LabelValue<V>>;
    }
    else {
      option = { value: item as V, label: item as string };
    }
    return option;
  });
};

/**
 * 扁平数组转树形结构（不修改原数组）
 * @param data 扁平数据列表
 * @param fieldNames 字段映射，默认 `{ key: 'key', parentKey: 'parentKey', children: 'children' }`
 * @param parentKey 根节点的 parentKey 值，默认 `null`
 * @returns 树形数组
 * @example
 * arrayToTree([{ key: 1, parentKey: null }, { key: 2, parentKey: 1 }]);
 * // [{ key: 1, parentKey: null, children: [{ key: 2, parentKey: 1, children: [] }] }]
 */
export function arrayToTree<T extends object>(
  data: T[],
  fieldNames = { key: 'key', parentKey: 'parentKey', children: 'children' },
  parentKey: unknown = null,
): T[] {
  const getField = (item: T, field: string): unknown => (item as Record<string, unknown>)[field];
  const filterData = data.filter(item => getField(item, fieldNames.parentKey) !== parentKey);
  return data
    .filter(item => getField(item, fieldNames.parentKey) === parentKey)
    .map(item => {
      const node = { ...item, [fieldNames.children]: [] as unknown[] } as unknown as T;
      if (filterData.length) {
        const children = arrayToTree(filterData, fieldNames, getField(item, fieldNames.key));
        const nodeRecord = node as Record<string, unknown>;
        if (children.length) (nodeRecord[fieldNames.children] as unknown[]).push(...children);
        else delete nodeRecord[fieldNames.children];
      }
      return node;
    });
}

/**
 * 去重（基于 `Set`，适合基本类型）
 * @example
 * unique([1, 1, 2, 3, 3]); // [1, 2, 3]
 */
export const unique = <T>(arr: readonly T[]): T[] => Array.from(new Set(arr));

/**
 * 按 key 去重，保留首次出现的元素
 * @param arr 源数组
 * @param key 取值函数
 * @example
 * uniqueBy([{ id: 1 }, { id: 1 }, { id: 2 }], item => item.id); // [{ id: 1 }, { id: 2 }]
 */
export const uniqueBy = <T, K>(arr: readonly T[], key: (item: T) => K): T[] => {
  const seen = new Set<K>();
  const result: T[] = [];
  for (const item of arr) {
    const k = key(item);
    if (!seen.has(k)) {
      seen.add(k);
      result.push(item);
    }
  }
  return result;
};

/**
 * 按固定长度分块
 * @param size 每块长度，必须为正整数
 * @throws {RangeError} size 非法时
 * @example
 * chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
 */
export const chunk = <T>(arr: readonly T[], size: number): T[][] => {
  if (!Number.isInteger(size) || size < 1) throw new RangeError('size must be a positive integer');
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
};

/**
 * 按 key 分组
 * @param arr 源数组
 * @param iteratee 取值函数，或属性名（等价于 lodash 的 iteratee 简写）
 * @returns 以分组键为 key、分组数组为 value 的对象
 * @example
 * groupBy([{ t: 'a' }, { t: 'b' }, { t: 'a' }], item => item.t);
 * // { a: [{t:'a'}, {t:'a'}], b: [{t:'b'}] }
 * groupBy([{ t: 'a' }, { t: 'b' }, { t: 'a' }], 't');
 * // 同上
 */
export function groupBy<T, K extends PropertyKey>(arr: readonly T[], iteratee: (item: T) => K): Record<K, T[]>;
export function groupBy<T, K extends keyof T>(arr: readonly T[], iteratee: K): Record<Extract<T[K], PropertyKey>, T[]>;
export function groupBy<T>(arr: readonly T[], iteratee: ((item: T) => PropertyKey) | keyof T): Record<PropertyKey, T[]> {
  const getKey = typeof iteratee === 'function' ? iteratee : (item: T) => item[iteratee] as PropertyKey;
  const result: Record<PropertyKey, T[]> = {};
  for (const item of arr) {
    const key = getKey(item);
    (result[key] ??= []).push(item);
  }
  return result;
}

const compareValues = (a: unknown, b: unknown): number => {
  if (Object.is(a, b)) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b));
};

/**
 * 按取值函数排序（不修改原数组）
 * @param selector 取值函数
 * @param order 排序方向，默认 `'asc'`
 * @example
 * sortBy([3, 1, 2], item => item); // [1, 2, 3]
 * sortBy([{ n: 1 }, { n: 3 }], item => item.n, 'desc'); // [{ n: 3 }, { n: 1 }]
 */
export const sortBy = <T>(
  arr: readonly T[],
  selector: (item: T) => unknown,
  order: 'asc' | 'desc' = 'asc',
): T[] => {
  const direction = order === 'desc' ? -1 : 1;
  return [...arr].sort((a, b) => compareValues(selector(a), selector(b)) * direction);
};

/**
 * 去除假值（`null` / `undefined` / `false` / `0` / `''` / `NaN`）
 * @example
 * compact([0, 1, false, 2, '', null, undefined, 3]); // [1, 2, 3]
 */
export const compact = <T>(arr: readonly T[]): NonNullable<T>[] =>
  arr.filter(Boolean) as unknown as NonNullable<T>[];

/**
 * 差集：存在于 a 但不在 b 中
 * @example
 * difference([1, 2, 3], [2, 3, 4]); // [1]
 */
export const difference = <T>(a: readonly T[], b: readonly T[]): T[] => {
  const setB = new Set(b);
  return a.filter(item => !setB.has(item));
};

/**
 * 交集
 * @example
 * intersection([1, 2, 3], [2, 3, 4]); // [2, 3]
 */
export const intersection = <T>(a: readonly T[], b: readonly T[]): T[] => {
  const setB = new Set(b);
  return a.filter(item => setB.has(item));
};

/**
 * 并集（去重）
 * @example
 * union([1, 2], [2, 3]); // [1, 2, 3]
 */
export const union = <T>(a: readonly T[], b: readonly T[]): T[] => Array.from(new Set([...a, ...b]));

/**
 * 洗牌（Fisher-Yates，返回新数组）
 * @example
 * shuffle([1, 2, 3]); // 顺序随机的新数组
 */
export const shuffle = <T>(arr: readonly T[]): T[] => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * 随机取一个元素
 * @example
 * sample([1, 2, 3]); // 1 | 2 | 3
 * sample([]); // undefined
 */
export const sample = <T>(arr: readonly T[]): T | undefined =>
  arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;

/**
 * 生成数字区间（不含 end）
 * @param start 起点；只传一个参数时视为终点（起点为 0）
 * @param end 终点
 * @param step 步长，默认 1（可为负）
 * @throws {RangeError} step 为 0 时
 * @example
 * range(5); // [0, 1, 2, 3, 4]
 * range(1, 4); // [1, 2, 3]
 * range(0, 10, 3); // [0, 3, 6, 9]
 * range(3, 0, -1); // [3, 2, 1]
 */
export const range = (start: number, end?: number, step = 1): number[] => {
  if (step === 0) throw new RangeError('step must not be 0');
  const from = end === undefined ? 0 : start;
  const to = end === undefined ? start : end;
  const result: number[] = [];
  for (let i = from; step > 0 ? i < to : i > to; i += step) result.push(i);
  return result;
};

/**
 * 按取值函数求和
 * @example
 * sumBy([{ n: 1 }, { n: 2 }], item => item.n); // 3
 */
export const sumBy = <T>(arr: readonly T[], getter: (item: T) => number): number =>
  arr.reduce((sum, item) => sum + getter(item), 0);

/**
 * 平均值（空数组返回 0）
 * @example
 * mean([1, 2, 3]); // 2
 */
export const mean = (arr: readonly number[]): number =>
  arr.length ? arr.reduce((sum, value) => sum + value, 0) / arr.length : 0;

/**
 * 首个元素
 * @example
 * first([1, 2]); // 1
 */
export const first = <T>(arr: readonly T[]): T | undefined => arr[0];

/**
 * 最后一个元素
 * @example
 * last([1, 2]); // 2
 */
export const last = <T>(arr: readonly T[]): T | undefined => arr[arr.length - 1];

/** `zip` 结果类型：每行第 K 个元素来自第 K 个入参数组，长度不足为 `undefined` */
export type Zipped<T extends ReadonlyArray<ReadonlyArray<unknown>>> = Array<{
  [K in keyof T]: T[K] extends ReadonlyArray<infer U> ? U | undefined : never;
}>;

/**
 * 按索引把多个数组“拉链”合并（类似 lodash `zip`）
 * @param arrays 任意个数组（各数组元素类型可不同）
 * @returns 二维数组，长度取最长数组，缺失位置为 `undefined`
 * @example
 * zip([1, 2, 3], ['a', 'b']); // [[1, 'a'], [2, 'b'], [3, undefined]]
 */
export function zip<T extends ReadonlyArray<ReadonlyArray<unknown>>>(...arrays: T): Zipped<T> {
  const length = arrays.reduce((max, arr) => Math.max(max, arr.length), 0);
  const result: unknown[][] = [];
  for (let i = 0; i < length; i++) {
    result.push(arrays.map(arr => arr[i]));
  }
  return result as unknown as Zipped<T>;
}
