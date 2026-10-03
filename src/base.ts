/**
 * 断言：条件为假值时抛出 Error，同时可用于 TypeScript 类型收窄
 * @param condition 断言条件
 * @param message 断言失败时抛出的错误信息
 * @throws {Error} 当 `condition` 为假值时
 * @example
 * assert(user, 'user is required');
 * // 此后 user 被收窄为非空类型
 */
export const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) throw new Error(message);
};

/**
 * 获取值的 `Object.prototype.toString` 标签
 * @param v 任意值
 * @returns 形如 `[object Array]` 的字符串
 * @example
 * toString([]); // '[object Array]'
 * toString(null); // '[object Null]'
 */
export const toString = (v: unknown): string => Object.prototype.toString.call(v);

/**
 * 获取值的小写类型名（基于 `toString` 标签）
 * @param v 任意值
 * @returns 小写类型名
 * @example
 * getTypeName([]); // 'array'
 * getTypeName(new Date()); // 'date'
 * getTypeName(null); // 'null'
 */
export const getTypeName = (v: unknown): string => {
  if (v === null) return 'null';
  const type = toString(v).slice(8, -1).toLowerCase();
  return typeof v === 'object' || typeof v === 'function' ? type : typeof v;
};
