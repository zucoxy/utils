import { toString } from './base';

type Dict = Record<PropertyKey, unknown>;

const boolTag = '[object Boolean]';
const numberTag = '[object Number]';
const stringTag = '[object String]';
const symbolTag = '[object Symbol]';
const dateTag = '[object Date]';
const regexpTag = '[object RegExp]';
const errorTag = '[object Error]';
const mapTag = '[object Map]';
const setTag = '[object Set]';
const arrayTag = '[object Array]';
const objectTag = '[object Object]';
const dataViewTag = '[object DataView]';
const arrayBufferTag = '[object ArrayBuffer]';

// 包装类型：必须用对应构造函数重建，否则会丢失内部槽
const wrapperTags = [boolTag, numberTag, stringTag];

function cloneSymbol(target: object): symbol {
  return (target as { valueOf(): symbol }).valueOf();
}

function cloneReg(target: RegExp): RegExp {
  const result = new RegExp(target.source, target.flags);
  result.lastIndex = target.lastIndex;
  return result;
}

function cloneError(target: Error): Error {
  const Ctor = target.constructor as unknown as new (message?: string) => Error;
  const cloned = new Ctor(target.message);
  cloned.name = target.name;
  cloned.stack = target.stack;
  return cloned;
}

function cloneView(target: ArrayBufferView): ArrayBufferView {
  if (toString(target) === dataViewTag) {
    const view = target as DataView;
    return new DataView(view.buffer.slice(0), view.byteOffset, view.byteLength);
  }
  const Ctor = target.constructor as unknown as new (arg: ArrayBufferView) => ArrayBufferView;
  return new Ctor(target);
}

/**
 * 拷贝函数：返回转发到原函数的新函数，并深拷贝函数自身的可枚举属性
 * 支持普通调用与 `new` 调用，箭头函数 / async 函数按普通调用处理
 */
function cloneFunction<T extends(...args: any[]) => any>(target: T, map: WeakMap<object, unknown>): T {
  if (map.has(target)) {
    return map.get(target) as T;
  }
  const cloned = function (this: unknown, ...args: unknown[]): unknown {
    if (new.target) {
      return Reflect.construct(target, args, new.target) as unknown;
    }
    return target.apply(this, args) as unknown;
  } as unknown as T;
  const proto = (target as unknown as { prototype?: object }).prototype;
  if (proto) {
    (cloned as unknown as { prototype: object }).prototype = proto;
  }
  map.set(target, cloned);
  const sourceRecord = target as unknown as Dict;
  const clonedRecord = cloned as unknown as Dict;
  for (const key of Object.keys(sourceRecord)) {
    clonedRecord[key] = deepClone(sourceRecord[key], map);
  }
  for (const sym of Object.getOwnPropertySymbols(sourceRecord)) {
    if (Object.prototype.propertyIsEnumerable.call(sourceRecord, sym)) {
      clonedRecord[sym] = deepClone(sourceRecord[sym], map);
    }
  }
  return cloned;
}

/**
 * 深拷贝任意值，返回与入参同类型的新值
 * - 支持：普通对象 / 类实例 / 数组 / Map / Set / Date / RegExp / Error / TypedArray / ArrayBuffer / Symbol 包装对象 / 函数
 * - 函数会被包装成转发到原函数的新函数，并深拷贝其自身可枚举属性
 * - 保留循环引用；Clone 后与原值不共享可变结构
 * - 无法安全复制的宿主对象（Promise / WeakMap / WeakSet / DOM 节点等）保持原引用
 * @param target 待拷贝的值
 * @example
 * const cloned = deepClone({ a: 1, fn: () => 'hi' });
 * cloned !== original;
 */
export function deepClone<T>(target: T, map = new WeakMap<object, unknown>()): T {
  // 函数：转发式拷贝
  if (typeof target === 'function') {
    return cloneFunction(target as unknown as (...args: any[]) => any, map) as unknown as T;
  }

  // 原始类型
  if (target === null || typeof target !== 'object') {
    return target;
  }

  // 循环引用
  if (map.has(target)) {
    return map.get(target) as T;
  }

  const tag = toString(target);

  // 二进制数据：ArrayBuffer 复制，TypedArray / DataView 复制其可见数据
  if (tag === arrayBufferTag) {
    return (target as unknown as ArrayBuffer).slice(0) as unknown as T;
  }
  if (ArrayBuffer.isView(target)) {
    return cloneView(target) as unknown as T;
  }
  // 包装类型
  if (wrapperTags.includes(tag)) {
    const Ctor = (target as object).constructor as unknown as new (arg: unknown) => unknown;
    return new Ctor(target) as T;
  }
  // 日期 / 正则 / 错误 / Symbol 包装对象
  if (tag === dateTag) {
    return new Date((target as unknown as Date).getTime()) as unknown as T;
  }
  if (tag === regexpTag) {
    return cloneReg(target as unknown as RegExp) as unknown as T;
  }
  if (tag === errorTag) {
    return cloneError(target as unknown as Error) as unknown as T;
  }
  if (tag === symbolTag) {
    return cloneSymbol(target) as unknown as T;
  }

  // Array / Map / Set / 普通对象
  let cloneTarget: unknown;
  if (tag === arrayTag) {
    cloneTarget = [];
  }
  else if (tag === mapTag) {
    cloneTarget = new Map<unknown, unknown>();
  }
  else if (tag === setTag) {
    cloneTarget = new Set<unknown>();
  }
  else {
    const proto = Object.getPrototypeOf(target) as object | null;
    // 非普通对象（Promise、WeakMap/WeakSet、DOM 节点等）无法安全复制内部槽，保持原引用
    if (tag !== objectTag && proto !== Object.prototype && proto !== null) {
      return target;
    }
    // 普通对象或类实例：用原型创建，避免调用可能带必填参数的构造函数
    cloneTarget = Object.create(proto) as unknown;
  }

  map.set(target, cloneTarget);

  if (tag === setTag) {
    const source = target as unknown as Set<unknown>;
    const cloned = cloneTarget as Set<unknown>;
    source.forEach(value => {
      cloned.add(deepClone(value, map));
    });
    return cloneTarget as T;
  }

  if (tag === mapTag) {
    const source = target as unknown as Map<unknown, unknown>;
    const cloned = cloneTarget as Map<unknown, unknown>;
    source.forEach((value, key) => {
      cloned.set(deepClone(key, map), deepClone(value, map));
    });
    return cloneTarget as T;
  }

  const source = target as unknown as Dict;
  const cloned = cloneTarget as Dict;

  // 数组按索引拷贝，保留 length（含稀疏数组）
  if (tag === arrayTag) {
    const length = (target as unknown as unknown[]).length;
    for (let i = 0; i < length; i++) {
      cloned[i] = deepClone(source[i], map);
    }
  }
  else {
    for (const key of Object.keys(source)) {
      cloned[key] = deepClone(source[key], map);
    }
  }

  // 可枚举的 symbol 键
  for (const sym of Object.getOwnPropertySymbols(source)) {
    if (Object.prototype.propertyIsEnumerable.call(source, sym)) {
      cloned[sym] = deepClone(source[sym], map);
    }
  }

  return cloneTarget as T;
}
