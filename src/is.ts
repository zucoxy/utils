import { toString } from './base';

export const isDef = <T = any>(val?: T): val is T => typeof val !== 'undefined';
export const isBoolean = (val: any): val is boolean => typeof val === 'boolean';
export const isFunction = <T extends Function>(val: any): val is T => typeof val === 'function';
export const isNumber = (val: any): val is number => typeof val === 'number';
export const isString = (val: unknown): val is string => typeof val === 'string';
export const isObject = (val: any): val is object => toString(val) === '[object Object]';
export const isUndefined = (val: any): val is undefined => toString(val) === '[object Undefined]';
export const isNull = (val: any): val is null => toString(val) === '[object Null]';
export const isSymbol = (val: any): val is Symbol => toString(val) === '[object Symbol]';
export const isRegExp = (val: any): val is RegExp => toString(val) === '[object RegExp]';
export const isDate = (val: any): val is Date => toString(val) === '[object Date]';
export const isFile = (val: any): val is File => toString(val) === '[object File]';
export const isError = (val: any): val is Error => toString(val) === '[object Error]';
export const isMap = (val: any): val is Map<any, any> => toString(val) === '[object Map]';
export const isSet = (val: any): val is Set<any> => toString(val) === '[object Set]';
export const isArray = (val: any): val is Array<any> => toString(val) === '[object Array]';

// @ts-ignore
export const isWindow = (val: any): boolean => typeof window !== 'undefined' && toString(val) === '[object Window]';
// @ts-ignore
export const isBrowser = typeof window !== 'undefined';
