import { toString } from './base';
import {
  isArray,
  isBoolean,
  isDate,
  isError,
  isMap,
  isNumber,
  isObject,
  isRegExp,
  isSet,
  isString,
  isSymbol
} from './is';

const mapTag = '[object Map]';
const setTag = '[object Set]';
const arrayTag = '[object Array]';
const objectTag = '[object Object]';

const deepTags = [mapTag, setTag, arrayTag, objectTag];

const boolTag = '[object Boolean]';
const dateTag = '[object Date]';
const errorTag = '[object Error]';
const numberTag = '[object Number]';
const regexpTag = '[object RegExp]';
const stringTag = '[object String]';
const symbolTag = '[object Symbol]';

function forEach(array: any, iteratee: (value: any, key: any) => void) {
  let index = -1;
  const length = array.length;
  while (++index < length) {
    iteratee(array[index], index);
  }
  return array;
}

function getInit(target: any) {
  const Ctor = target.constructor;
  return new Ctor();
}
function cloneSymbol(target: any) {
  return Object(Symbol.prototype.valueOf.call(target));
}
function cloneReg(target: any) {
  const reFlags = /\w*$/;
  const result = new target.constructor(target.source, reFlags.exec(target));
  result.lastIndex = target.lastIndex;
  return result;
}
function cloneOtherType(target: any) {
  const Ctor = target.constructor;
  switch (target) {
    case isBoolean(target):
    case isNumber(target):
    case isString(target):
    case isError(target):
    case isDate(target):
      return new Ctor(target);
    case isRegExp(target):
      return cloneReg(target);
    case isSymbol(target):
      return cloneSymbol(target);
    default:
      return null;
  }
}

export function deepClone(target: any, map = new WeakMap()) {
  // 克隆原始类型
  if (!isObject(target)) {
    return target;
  }

  if (typeof target === 'function') return target;

  // 初始化
  const type = toString(target);
  let cloneTarget: any;
  if (deepTags.includes(type)) {
    cloneTarget = getInit(target);
  } else {
    return cloneOtherType(target);
  }

  // 防止循环引用
  if (map.get(target)) {
    return map.get(target);
  }
  map.set(target, cloneTarget);

  // 克隆set
  if (isSet(target)) {
    cloneTarget = getInit(target);
    target.forEach(value => {
      cloneTarget.add(deepClone(value, map));
    });
    return cloneTarget;
  }

  // 克隆map
  if (isMap(target)) {
    cloneTarget = getInit(target);
    target.forEach((value, key) => {
      cloneTarget.set(key, deepClone(value, map));
    });
    return cloneTarget;
  }

  // 克隆对象和数组
  const keys = isArray(target) ? undefined : Object.keys(target);
  forEach(keys || target, (value, key) => {
    if (keys) {
      key = value;
    }
    cloneTarget[key] = deepClone((target as any)[key], map);
  });

  return cloneTarget;
}
