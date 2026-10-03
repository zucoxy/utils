import { describe, expect, it } from 'vitest';
import { assert, getTypeName, toString } from '../src/base';

describe('base', () => {
  it('assert 通过时不抛错，失败时抛出给定信息', () => {
    expect(() => assert(true, 'ok')).not.toThrow();
    expect(() => assert(false, 'boom')).toThrow('boom');
  });

  it('toString 返回 Object.prototype.toString 标签', () => {
    expect(toString([])).toBe('[object Array]');
    expect(toString(null)).toBe('[object Null]');
    expect(toString(123)).toBe('[object Number]');
  });

  it('getTypeName 返回小写类型名', () => {
    expect(getTypeName(null)).toBe('null');
    expect(getTypeName([])).toBe('array');
    expect(getTypeName(new Date())).toBe('date');
    expect(getTypeName('str')).toBe('string');
    expect(getTypeName(1)).toBe('number');
    expect(getTypeName(() => {})).toBe('function');
  });
});
