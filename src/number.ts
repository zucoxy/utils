/**
 * 把数值限制在 [min, max] 区间内
 * @param value 目标数值
 * @param min 下界
 * @param max 上界
 * @example
 * clamp(5, 0, 3); // 3
 * clamp(-1, 0, 3); // 0
 */
export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

/**
 * 判断数值是否落在闭区间 [min, max] 内（不要求入参顺序）
 * @example
 * inRange(2, 1, 3); // true
 * inRange(3, 1, 3); // true
 * inRange(4, 1, 3); // false
 */
export const inRange = (value: number, min: number, max: number): boolean =>
  value >= Math.min(min, max) && value <= Math.max(min, max);

/**
 * 线性插值：t = 0 返回 start，t = 1 返回 end
 * @example
 * lerp(0, 10, 0.5); // 5
 */
export const lerp = (start: number, end: number, t: number): number => start + (end - start) * t;

/**
 * 四舍五入到指定小数位（缓解浮点误差，digits 需 >= 0）
 * @param value 目标数值
 * @param digits 保留的小数位数，默认 0
 * @example
 * roundTo(1.005, 2); // 1.01
 * roundTo(1.2345, 2); // 1.23
 */
export const roundTo = (value: number, digits = 0): number => {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

/**
 * 向上取整到指定小数位（缓解浮点误差）
 * @param value 目标数值
 * @param digits 保留的小数位数，默认 0
 * @example
 * ceilTo(1.001, 2); // 1.01
 * ceilTo(0.1 + 0.2, 2); // 0.3（而非 0.31）
 * ceilTo(-1.001, 2); // -1
 */
export const ceilTo = (value: number, digits = 0): number => {
  const factor = 10 ** digits;
  const scaled = value * factor;
  return Math.ceil(scaled - Number.EPSILON * Math.abs(scaled)) / factor;
};

/**
 * 向下取整到指定小数位（缓解浮点误差）
 * @param value 目标数值
 * @param digits 保留的小数位数，默认 0
 * @example
 * floorTo(1.009, 2); // 1
 * floorTo(0.1 + 0.2, 2); // 0.3
 * floorTo(-1.001, 2); // -1.01
 */
export const floorTo = (value: number, digits = 0): number => {
  const factor = 10 ** digits;
  const scaled = value * factor;
  return Math.floor(scaled + Number.EPSILON * Math.abs(scaled)) / factor;
};

/** 取整方式：`round` 四舍五入 / `ceil` 向上取整 / `floor` 向下取整 */
export type RoundMode = 'round' | 'ceil' | 'floor';

/**
 * 保留固定小数位并返回字符串（不足补零，先按 `mode` 取整并修正浮点误差）
 * @param value 目标数值
 * @param digits 保留的小数位数，默认 2
 * @param mode 取整方式，默认 `'round'`，可传 `'ceil'` / `'floor'`
 * @returns 固定 `digits` 位小数的字符串
 * @example
 * toFixed(1.001); // '1.00'
 * toFixed(1.005); // '1.01'（原生 (1.005).toFixed(2) 会得到 '1.00'）
 * toFixed(1.001, 2, 'ceil'); // '1.01'
 * toFixed(1.009, 2, 'floor'); // '1.00'
 * toFixed(1.2, 3); // '1.200'
 */
export const toFixed = (value: number, digits = 2, mode: RoundMode = 'round'): string => {
  const rounded =
    mode === 'ceil' ? ceilTo(value, digits) : mode === 'floor' ? floorTo(value, digits) : roundTo(value, digits);
  return rounded.toFixed(digits);
};

/**
 * 千分位格式化，支持数字或数字字符串，保留原有小数
 * @param value 目标数值或数字字符串
 * @param separator 分隔符，默认 `','`
 * @example
 * thousands(1234567.89); // '1,234,567.89'
 * thousands(-1234); // '-1,234'
 */
export const thousands = (value: number | string, separator = ','): string => {
  const [integerPart, decimalPart] = String(value).split('.');
  const sign = integerPart.startsWith('-') ? '-' : '';
  const digits = sign ? integerPart.slice(1) : integerPart;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return sign + grouped + (decimalPart === undefined ? '' : `.${decimalPart}`);
};

/**
 * 字节数格式化为可读文件大小
 * @param bytes 字节数
 * @param decimals 小数位数，默认 2（B 级别不带小数）
 * @param base 进制，默认 1024（可传 1000）
 * @example
 * formatFileSize(0); // '0 B'
 * formatFileSize(1536); // '1.50 KB'
 * formatFileSize(1024, 0); // '1 KB'
 */
export const formatFileSize = (bytes: number, decimals = 2, base = 1024): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(base)), units.length - 1);
  if (index === 0) return `${bytes} B`;
  return `${(bytes / base ** index).toFixed(decimals)} ${units[index]}`;
};

/**
 * 生成闭区间 [min, max] 内的随机整数
 * @example
 * randomInt(1, 3); // 1 | 2 | 3
 */
export const randomInt = (min: number, max: number): number => {
  const lower = Math.ceil(Math.min(min, max));
  const upper = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
};

/**
 * 生成 [min, max) 内的随机浮点数
 * @example
 * randomFloat(0, 1); // 0 <= x < 1
 */
export const randomFloat = (min: number, max: number): number =>
  Math.random() * (Math.max(min, max) - Math.min(min, max)) + Math.min(min, max);

/**
 * 是否为偶数
 * @example
 * isEven(2); // true
 * isEven(3); // false
 */
export const isEven = (value: number): boolean => value % 2 === 0;

/**
 * 是否为奇数
 * @example
 * isOdd(3); // true
 * isOdd(-3); // true
 */
export const isOdd = (value: number): boolean => Math.abs(value % 2) === 1;

/**
 * 计算百分比（0-100），`total` 为 0 时返回 0
 * @param value 分子
 * @param total 分母
 * @param digits 保留小数位，默认 2
 * @example
 * percentage(1, 4); // 25
 * percentage(1, 3, 0); // 33
 */
export const percentage = (value: number, total: number, digits = 2): number =>
  total === 0 ? 0 : roundTo((value / total) * 100, digits);
