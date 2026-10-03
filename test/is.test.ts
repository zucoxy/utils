import { describe, expect, it } from 'vitest';
import {
  isArray,
  isBoolean,
  isDate,
  isDef,
  isError,
  isFunction,
  isMap,
  isNull,
  isNumber,
  isObject,
  isRegExp,
  isSet,
  isString,
  isSymbol,
  isUndefined,
} from '../src/is';

describe('is', () => {
  it('isDef', () => {
    expect(isDef(0)).toBe(true);
    expect(isDef(null)).toBe(true);
    expect(isDef(undefined)).toBe(false);
  });

  it('isBoolean / isNumber / isString', () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean('true')).toBe(false);
    expect(isNumber(1)).toBe(true);
    expect(isNumber(NaN)).toBe(true);
    expect(isString('a')).toBe(true);
    expect(isString(1)).toBe(false);
  });

  it('isFunction', () => {
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(class {})).toBe(true);
    expect(isFunction({})).toBe(false);
  });

  it('isObject only matches plain object', () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(false);
    expect(isObject(new Date())).toBe(false);
    expect(isObject(null)).toBe(false);
  });

  it('isNull / isUndefined', () => {
    expect(isNull(null)).toBe(true);
    expect(isNull(undefined)).toBe(false);
    expect(isUndefined(undefined)).toBe(true);
  });

  it('built-in types', () => {
    expect(isSymbol(Symbol('s'))).toBe(true);
    expect(isRegExp(/a/)).toBe(true);
    expect(isDate(new Date())).toBe(true);
    expect(isError(new Error('e'))).toBe(true);
    expect(isMap(new Map())).toBe(true);
    expect(isSet(new Set())).toBe(true);
    expect(isArray([])).toBe(true);
  });
});
