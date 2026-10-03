/** 内部工具，不对外导出 */

/** 是否为自有属性 */
export const hasOwn = (target: object, key: PropertyKey): boolean => Object.prototype.hasOwnProperty.call(target, key);

/**
 * 赋值对象自有属性，规避 `__proto__` 作为 key 时抛错或污染原型
 * @param target 目标对象
 * @param key 属性名
 * @param value 值
 */
export const setOwn = (target: object, key: PropertyKey, value: unknown): void => {
  if (key === '__proto__') {
    Object.defineProperty(target, key, { value, enumerable: true, writable: true, configurable: true });
  }
  else {
    (target as Record<PropertyKey, unknown>)[key] = value;
  }
};
