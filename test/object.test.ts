import { describe, expect, it } from 'vitest';
import {
  deepMerge,
  getByPath,
  hasPath,
  invert,
  isEmpty,
  isEqual,
  mapKeys,
  mapValues,
  objectToOption,
  omit,
  pick,
  setByPath,
  yamlToObj,
} from '../src/object';

describe('deepMerge', () => {
  it('递归合并嵌套对象', () => {
    expect(deepMerge({ a: 1, b: { c: 1 } }, { b: { d: 2 } })).toEqual({ a: 1, b: { c: 1, d: 2 } });
  });

  it('同 key 为基础类型时直接覆盖', () => {
    expect(deepMerge({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
  });
});

describe('objectToOption', () => {
  it('默认 value 为 key、label 为 value', () => {
    expect(objectToOption({ a: 1, b: 2 })).toEqual([
      { value: 'a', label: 1 },
      { value: 'b', label: 2 },
    ]);
  });

  it('reverse 交换 label 与 value', () => {
    expect(objectToOption({ a: 'x' }, true)).toEqual([{ value: 'x', label: 'a' }]);
  });
});

describe('yamlToObj', () => {
  it('解析 yaml（保留原始类型，支持多层）', () => {
    expect(yamlToObj('root:\n  a: 1\n  b: 2')).toEqual({ root: { a: 1, b: 2 } });
  });

  it('解析嵌套数组', () => {
    expect(yamlToObj('list:\n  - 1\n  - 2')).toEqual({ list: [1, 2] });
  });
});

describe('pick / omit', () => {
  it('pick', () => {
    expect(pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 });
  });

  it('omit', () => {
    expect(omit({ a: 1, b: 2, c: 3 }, ['b'])).toEqual({ a: 1, c: 3 });
  });
});

describe('path helpers', () => {
  it('getByPath', () => {
    expect(getByPath({ a: { b: [{ c: 5 }] } }, 'a.b[0].c')).toBe(5);
    expect(getByPath({}, 'x.y', 'def')).toBe('def');
  });

  it('setByPath（数字段生成数组）', () => {
    const target: Record<string, unknown> = {};
    const result = setByPath(target, 'a.b[0].c', 1);
    expect(result).toBe(target);
    expect(target).toEqual({ a: { b: [{ c: 1 }] } });
  });

  it('hasPath', () => {
    expect(hasPath({ a: { b: 1 } }, 'a.b')).toBe(true);
    expect(hasPath({ a: { b: 1 } }, 'a.c')).toBe(false);
    expect(hasPath({}, '')).toBe(false);
  });
});

describe('isEmpty', () => {
  it('各种空值', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
    expect(isEmpty('')).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
    expect(isEmpty(new Map())).toBe(true);
    expect(isEmpty(new Set())).toBe(true);
    expect(isEmpty('a')).toBe(false);
    expect(isEmpty([1])).toBe(false);
    expect(isEmpty({ a: 1 })).toBe(false);
  });
});

describe('invert / mapValues / mapKeys', () => {
  it('invert', () => {
    expect(invert({ a: '1', b: '2' })).toEqual({ 1: 'a', 2: 'b' });
  });

  it('mapValues', () => {
    expect(mapValues({ a: 1, b: 2 }, value => value * 2)).toEqual({ a: 2, b: 4 });
  });

  it('mapKeys', () => {
    expect(mapKeys({ a: 1 }, key => key.toUpperCase())).toEqual({ A: 1 });
  });
});

describe('isEqual', () => {
  it('基本与嵌套结构', () => {
    expect(isEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true);
    expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  it('内置类型', () => {
    expect(isEqual(new Date(0), new Date(0))).toBe(true);
    expect(isEqual(/a/gi, /a/gi)).toBe(true);
    expect(isEqual(new Set([1, 2]), new Set([2, 1]))).toBe(true);
    expect(isEqual(new Map([['a', 1]]), new Map([['a', 1]]))).toBe(true);
  });

  it('循环引用', () => {
    const a: { self?: unknown } = {};
    a.self = a;
    const b: { self?: unknown } = {};
    b.self = b;
    expect(isEqual(a, b)).toBe(true);
  });
});
