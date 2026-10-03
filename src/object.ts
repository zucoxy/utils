import { parse } from 'yaml';
import { toString } from './base';
import { isObject } from './is';
import type { LabelValue } from './types';

const dateTag = '[object Date]';
const regexpTag = '[object RegExp]';
const mapTag = '[object Map]';
const setTag = '[object Set]';
const arrayTag = '[object Array]';

/**
 * 两个对象深度合并（原地修改 `baseObj`）
 * @param baseObj 基准对象
 * @param newObj 要合并的新数据
 * @returns 合并后的 `baseObj`
 * @example
 * deepMerge({ a: 1, b: { c: 1 } }, { b: { d: 2 } }); // { a: 1, b: { c: 1, d: 2 } }
 */
export function deepMerge<T extends Record<string, unknown>>(baseObj: T, newObj: Record<string, unknown>): T {
  const target = baseObj as Record<string, unknown>;
  for (const key in newObj) {
    const baseValue = target[key];
    const newValue = newObj[key];
    target[key] = isObject(baseValue) && isObject(newValue) ? deepMerge(baseValue, newValue) : newValue;
  }
  return baseObj;
}

/**
 * 将 yaml 字符串解析为对象（基于 `yaml` 官方解析器，支持任意层级并保留原始类型）
 * @param yamlRaw yaml 字符串
 * @example
 * yamlToObj('a: 1\nb:\n  - 2'); // { a: 1, b: [2] }
 */
export function yamlToObj<T = Record<string, unknown>>(yamlRaw: string): T {
  return parse(yamlRaw) as T;
}

/**
 * 把对象转换成 `LabelValue` 数组
 * @param obj 源对象
 * @param reverse 是否交换 label 与 value，默认 false
 * @returns 默认输出 `{ value: key, label: value }`，`reverse` 时输出 `{ value: value, label: key }`
 * @example
 * objectToOption({ a: 1 }); // [{ value: 'a', label: 1 }]
 * objectToOption({ a: 'x' }, true); // [{ value: 'x', label: 'a' }]
 */
export const objectToOption = (obj: Record<string, unknown>, reverse?: boolean): LabelValue[] => {
  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    return Object.entries(obj).map(([key, value]) =>
      reverse ? { value, label: key } : { value: key, label: value as string },
    );
  }
  return [];
};

/**
 * 选取对象的指定键
 * @example
 * pick({ a: 1, b: 2, c: 3 }, ['a', 'c']); // { a: 1, c: 3 }
 */
export const pick = <T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
};

/**
 * 排除对象的指定键
 * @example
 * omit({ a: 1, b: 2, c: 3 }, ['b']); // { a: 1, c: 3 }
 */
export const omit = <T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> => {
  const result = { ...obj } as Record<string, unknown>;
  for (const key of keys) delete result[key as string];
  return result as unknown as Omit<T, K>;
};

const toPathKeys = (path: string): string[] =>
  path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);

/**
 * 按路径读取值，支持 `'a.b[0].c'`
 * @param obj 源对象
 * @param path 路径字符串
 * @param defaultValue 取不到时的默认值
 * @example
 * getByPath({ a: { b: [{ c: 5 }] } }, 'a.b[0].c'); // 5
 * getByPath({}, 'x.y', 'def'); // 'def'
 */
export function getByPath<T = unknown>(obj: unknown, path: string, defaultValue?: T): T | undefined {
  const keys = toPathKeys(path);
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || typeof current !== 'object') return defaultValue;
    current = (current as Record<string, unknown>)[key];
  }
  return current === undefined ? defaultValue : (current as T);
}

/**
 * 按路径写入值，支持 `'a.b[0].c'`（数字段自动创建数组），返回原对象
 * @example
 * const o = {};
 * setByPath(o, 'a.b[0].c', 1); // o => { a: { b: [{ c: 1 }] } }
 */
export function setByPath(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = toPathKeys(path);
  if (!keys.length) return obj;
  let current: Record<string | number, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const next = current[key];
    if (next === null || typeof next !== 'object') {
      current[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    }
    current = current[key] as Record<string | number, unknown>;
  }
  current[keys[keys.length - 1]] = value;
  return obj;
}

/**
 * 是否存在指定路径（仅判断自有属性）
 * @example
 * hasPath({ a: { b: 1 } }, 'a.b'); // true
 * hasPath({ a: { b: 1 } }, 'a.c'); // false
 */
export function hasPath(obj: unknown, path: string): boolean {
  const keys = toPathKeys(path);
  if (!keys.length) return false;
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || typeof current !== 'object') return false;
    if (!Object.prototype.hasOwnProperty.call(current, key)) return false;
    current = (current as Record<string, unknown>)[key];
  }
  return true;
}

/**
 * 是否为空：`null` / `undefined` / `''` / `[]` / `{}` / 空 `Map`、`Set`
 * @example
 * isEmpty({}); // true
 * isEmpty({ a: 1 }); // false
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * 键值互换
 * @example
 * invert({ a: '1', b: '2' }); // { 1: 'a', 2: 'b' }
 */
export const invert = (obj: Record<string, string>): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const key of Object.keys(obj)) result[obj[key]] = key;
  return result;
};

/**
 * 映射对象的值
 * @example
 * mapValues({ a: 1, b: 2 }, value => value * 2); // { a: 2, b: 4 }
 */
export function mapValues<V, R>(obj: Record<string, V>, fn: (value: V, key: string) => R): Record<string, R> {
  const result: Record<string, R> = {};
  for (const key of Object.keys(obj)) result[key] = fn(obj[key], key);
  return result;
}

/**
 * 映射对象的键
 * @example
 * mapKeys({ a: 1 }, key => key.toUpperCase()); // { A: 1 }
 */
export function mapKeys<K extends PropertyKey>(
  obj: Record<string, unknown>,
  fn: (key: string, value: unknown) => K,
): Record<K, unknown> {
  const result = {} as Record<K, unknown>;
  for (const key of Object.keys(obj)) result[fn(key, obj[key])] = obj[key];
  return result;
}

function equal(a: unknown, b: unknown, seen: WeakMap<object, WeakSet<object>>): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;

  // 循环引用：已比较过的对象对视为相等
  let compared = seen.get(a);
  if (compared?.has(b)) return true;
  if (!compared) {
    compared = new WeakSet<object>();
    seen.set(a, compared);
  }
  compared.add(b);

  const tag = toString(a);
  if (tag !== toString(b)) return false;

  if (tag === dateTag) return (a as Date).getTime() === (b as Date).getTime();
  if (tag === regexpTag) {
    return (a as RegExp).source === (b as RegExp).source && (a as RegExp).flags === (b as RegExp).flags;
  }
  if (tag === arrayTag) {
    const listA = a as unknown[];
    const listB = b as unknown[];
    if (listA.length !== listB.length) return false;
    return listA.every((item, index) => equal(item, listB[index], seen));
  }
  if (tag === setTag) {
    const setA = a as Set<unknown>;
    const setB = b as Set<unknown>;
    if (setA.size !== setB.size) return false;
    const listB = [...setB];
    return [...setA].every(item => listB.some(other => equal(item, other, seen)));
  }
  if (tag === mapTag) {
    const mapA = a as Map<unknown, unknown>;
    const mapB = b as Map<unknown, unknown>;
    if (mapA.size !== mapB.size) return false;
    const entriesB = [...mapB];
    return [...mapA].every(([key, value]) =>
      entriesB.some(([keyB, valueB]) => equal(key, keyB, seen) && equal(value, valueB, seen)),
    );
  }

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  if (keysA.length !== Object.keys(objB).length) return false;
  return keysA.every(key => Object.prototype.hasOwnProperty.call(objB, key) && equal(objA[key], objB[key], seen));
}

/**
 * 深比较两个值（支持 Date / RegExp / Map / Set 与循环引用，且与键顺序无关）
 * @example
 * isEqual({ a: [1, 2] }, { a: [1, 2] }); // true
 * isEqual(new Set([1, 2]), new Set([2, 1])); // true
 */
export const isEqual = (a: unknown, b: unknown): boolean => equal(a, b, new WeakMap());
