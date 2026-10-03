import { describe, expect, it } from 'vitest';
import { deepClone } from '../src/clone';

describe('deepClone', () => {
  it('原始类型原样返回', () => {
    expect(deepClone(1)).toBe(1);
    expect(deepClone('a')).toBe('a');
    expect(deepClone(null)).toBe(null);
    expect(deepClone(undefined)).toBe(undefined);
    expect(deepClone(Symbol.for('s'))).toBe(Symbol.for('s'));
  });

  it('深拷贝对象与数组且不共享引用', () => {
    const source = { a: 1, b: [1, { c: 2 }] };
    const cloned = deepClone(source);
    expect(cloned).toEqual(source);
    expect(cloned).not.toBe(source);
    expect(cloned.b).not.toBe(source.b);
    expect(cloned.b[1]).not.toBe(source.b[1]);
  });

  it('克隆 Date', () => {
    const source = new Date(0);
    const cloned = deepClone(source);
    expect(cloned).toBeInstanceOf(Date);
    expect(cloned.getTime()).toBe(0);
    expect(cloned).not.toBe(source);
  });

  it('克隆 RegExp', () => {
    const source = /ab+/gi;
    const cloned = deepClone(source);
    expect(cloned).toBeInstanceOf(RegExp);
    expect(cloned.source).toBe('ab+');
    expect(cloned.flags).toBe('gi');
  });

  it('克隆 Map（键与值都克隆）与 Set', () => {
    const key = { id: 1 };
    const map = new Map([[key, { n: 1 }]]);
    const clonedMap = deepClone(map);
    expect(clonedMap).toBeInstanceOf(Map);
    const clonedKey = [...clonedMap.keys()][0];
    expect(clonedKey).not.toBe(key);
    expect(clonedKey).toEqual({ id: 1 });
    expect(clonedMap.get(clonedKey)).toEqual({ n: 1 });

    const set = new Set([1, 2, 3]);
    const clonedSet = deepClone(set);
    expect(clonedSet).toBeInstanceOf(Set);
    expect([...clonedSet]).toEqual([1, 2, 3]);
  });

  it('处理循环引用', () => {
    const source: { name: string; self?: unknown } = { name: 'root' };
    source.self = source;
    const cloned = deepClone(source);
    expect(cloned).not.toBe(source);
    expect(cloned.self).toBe(cloned);
  });

  it('拷贝函数且不共享引用', () => {
    const fn = (n: number) => n + 1;
    const clonedFn = deepClone(fn);
    expect(clonedFn).not.toBe(fn);
    expect(clonedFn(1)).toBe(2);
  });

  it('拷贝 async 函数', async () => {
    const fn = async (n: number) => {
      await Promise.resolve();
      return n * 2;
    };
    const clonedFn = deepClone(fn);
    expect(clonedFn).not.toBe(fn);
    await expect(clonedFn(2)).resolves.toBe(4);
  });

  it('拷贝对象里值为函数的属性', () => {
    const source = { add: (a: number, b: number) => a + b };
    const cloned = deepClone(source);
    expect(cloned.add).not.toBe(source.add);
    expect(cloned.add(1, 2)).toBe(3);
  });

  it('保留函数的 this 绑定并深拷贝其自身属性', () => {
    interface FnWithMeta {
      (this: { value: number }): number;
      meta?: { flag: boolean };
    }
    const fn = function (this: { value: number }) {
      return this.value;
    } as FnWithMeta;
    fn.meta = { flag: true };
    const cloned = deepClone(fn);
    expect(cloned.meta).toEqual({ flag: true });
    expect(cloned.meta).not.toBe(fn.meta);
    expect(cloned.call({ value: 7 })).toBe(7);
  });

  it('同一函数多处引用在克隆后仍指向同一个新函数', () => {
    const fn = () => 1;
    const source = { a: fn, b: fn };
    const cloned = deepClone(source);
    expect(cloned.a).toBe(cloned.b);
    expect(cloned.a).not.toBe(fn);
  });

  it('Promise 无法复制，保持原引用', () => {
    const promise = Promise.resolve(1);
    expect(deepClone(promise)).toBe(promise);
    expect(deepClone({ p: promise }).p).toBe(promise);
  });

  it('WeakMap / WeakSet 无法复制，保持原引用', () => {
    const weakMap = new WeakMap();
    const weakSet = new WeakSet();
    expect(deepClone(weakMap)).toBe(weakMap);
    expect(deepClone(weakSet)).toBe(weakSet);
  });

  it('克隆 Error 并保留 message / name', () => {
    const source = new TypeError('boom');
    const cloned = deepClone(source);
    expect(cloned).toBeInstanceOf(TypeError);
    expect(cloned).not.toBe(source);
    expect(cloned.message).toBe('boom');
    expect(cloned.name).toBe('TypeError');
  });

  it('克隆类实例且不调用其构造函数', () => {
    class Point {
      x: number;
      y: number;
      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
      }

      sum() {
        return this.x + this.y;
      }
    }
    const source = new Point(1, 2);
    const cloned = deepClone(source);
    expect(cloned).toBeInstanceOf(Point);
    expect(cloned).not.toBe(source);
    expect(cloned.sum()).toBe(3);
  });

  it('克隆 TypedArray 与 ArrayBuffer', () => {
    const view = new Uint8Array([1, 2, 3]);
    const clonedView = deepClone(view);
    expect(clonedView).toBeInstanceOf(Uint8Array);
    expect([...clonedView]).toEqual([1, 2, 3]);
    expect(clonedView).not.toBe(view);
    clonedView[0] = 9;
    expect(view[0]).toBe(1);

    const buffer = new ArrayBuffer(8);
    const clonedBuffer = deepClone(buffer);
    expect(clonedBuffer).toBeInstanceOf(ArrayBuffer);
    expect(clonedBuffer).not.toBe(buffer);
    expect(clonedBuffer.byteLength).toBe(8);
  });

  it('拷贝可枚举的 symbol 键', () => {
    const sym = Symbol('s');
    const source = { [sym]: { n: 1 }, a: 1 };
    const cloned = deepClone(source);
    expect(cloned[sym]).toEqual({ n: 1 });
    expect(cloned[sym]).not.toBe(source[sym]);
    expect(cloned.a).toBe(1);
  });
});
