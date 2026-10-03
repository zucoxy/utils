import { toString } from './base';

/**
 * 运行时类型判断集合。
 * 全部接受 `unknown`，可直接作为类型守卫使用。
 * @example
 * if (isString(value)) value.toUpperCase();
 */

/** 值不为 `undefined` */
export const isDef = <T>(val?: T): val is T => typeof val !== 'undefined';

/** 值为布尔 */
export const isBoolean = (val: unknown): val is boolean => typeof val === 'boolean';

/** 值为函数 */
export const isFunction = <T extends (...args: any[]) => any>(val: unknown): val is T => typeof val === 'function';

/** 值为数字（包含 `NaN`） */
export const isNumber = (val: unknown): val is number => typeof val === 'number';

/** 值为字符串 */
export const isString = (val: unknown): val is string => typeof val === 'string';

/** 值为普通对象（`[object Object]`，不含数组 / Date / Map 等） */
export const isObject = (val: unknown): val is Record<string, unknown> => toString(val) === '[object Object]';

/** 值为 `undefined` */
export const isUndefined = (val: unknown): val is undefined => toString(val) === '[object Undefined]';

/** 值为 `null` */
export const isNull = (val: unknown): val is null => toString(val) === '[object Null]';

/** 值为 symbol */
export const isSymbol = (val: unknown): val is symbol => toString(val) === '[object Symbol]';

/** 值为正则 */
export const isRegExp = (val: unknown): val is RegExp => toString(val) === '[object RegExp]';

/** 值为日期 */
export const isDate = (val: unknown): val is Date => toString(val) === '[object Date]';

/** 值为 `File` */
export const isFile = (val: unknown): val is File => toString(val) === '[object File]';

/** 值为 `Error` 及其子类 */
export const isError = (val: unknown): val is Error => toString(val) === '[object Error]';

/** 值为 `Map` */
export const isMap = (val: unknown): val is Map<unknown, unknown> => toString(val) === '[object Map]';

/** 值为 `Set` */
export const isSet = (val: unknown): val is Set<unknown> => toString(val) === '[object Set]';

/** 值为数组 */
export const isArray = (val: unknown): val is unknown[] => toString(val) === '[object Array]';

/** 值为 `window`（非浏览器环境返回 false） */
// @ts-ignore
export const isWindow = (val: unknown): boolean => typeof window !== 'undefined' && toString(val) === '[object Window]';

/** 当前是否运行在浏览器环境 */
// @ts-ignore
export const isBrowser = typeof window !== 'undefined';
