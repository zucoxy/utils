const CASE_SPLIT_RE = /[^a-zA-Z0-9]+/g;
const LOWER_UPPER_RE = /([a-z0-9])([A-Z])/g;
const UPPER_UPPER_LOWER_RE = /([A-Z]+)([A-Z][a-z])/g;
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;',
};
const DEFAULT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** 按大小写、空格、连字符、下划线等把字符串拆成单词 */
function words(str: string): string[] {
  return str
    .replace(LOWER_UPPER_RE, '$1 $2')
    .replace(UPPER_UPPER_LOWER_RE, '$1 $2')
    .split(CASE_SPLIT_RE)
    .filter(Boolean);
}

/**
 * 首字母大写
 * @example
 * capitalize('abc'); // 'Abc'
 */
export const capitalize = (str: string): string => (str ? str.charAt(0).toUpperCase() + str.slice(1) : str);

/**
 * 首字母小写
 * @example
 * uncapitalize('Abc'); // 'abc'
 */
export const uncapitalize = (str: string): string => (str ? str.charAt(0).toLowerCase() + str.slice(1) : str);

/**
 * 转换为 camelCase
 * @example
 * camelCase('hello-world_foo'); // 'helloWorldFoo'
 * camelCase('FooBar'); // 'fooBar'
 */
export const camelCase = (str: string): string =>
  words(str)
    .map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word.toLowerCase())))
    .join('');

/**
 * 转换为 PascalCase
 * @example
 * pascalCase('hello world'); // 'HelloWorld'
 */
export const pascalCase = (str: string): string =>
  words(str)
    .map(word => capitalize(word.toLowerCase()))
    .join('');

/**
 * 转换为 kebab-case
 * @example
 * kebabCase('FooBar'); // 'foo-bar'
 */
export const kebabCase = (str: string): string =>
  words(str)
    .map(word => word.toLowerCase())
    .join('-');

/**
 * 转换为 snake_case
 * @example
 * snakeCase('FooBar'); // 'foo_bar'
 */
export const snakeCase = (str: string): string =>
  words(str)
    .map(word => word.toLowerCase())
    .join('_');

/**
 * 超长截断，并追加后缀（后缀计入总长度）
 * @param str 原字符串
 * @param length 截断后的总长度上限
 * @param suffix 后缀，默认 `'...'`
 * @example
 * truncate('hello world', 8); // 'hello...'
 * truncate('hi', 5); // 'hi'
 */
export const truncate = (str: string, length: number, suffix = '...'): string => {
  if (length >= str.length) return str;
  const cut = Math.max(0, length - suffix.length);
  return str.slice(0, cut) + suffix;
};

/**
 * 脱敏：保留前 `visibleStart` 位与后 `visibleEnd` 位，中间用 `maskChar` 填充
 * @param str 原字符串
 * @param visibleStart 头部保留位数，默认 3
 * @param visibleEnd 尾部保留位数，默认 4
 * @param maskChar 掩码字符，默认 `'*'`
 * @example
 * mask('13812345678', 3, 4); // '138****5678'
 */
export const mask = (str: string, visibleStart = 3, visibleEnd = 4, maskChar = '*'): string => {
  if (!str) return '';
  const start = Math.max(0, visibleStart);
  const end = Math.max(0, visibleEnd);
  if (start + end >= str.length) return str;
  const tail = end > 0 ? str.slice(-end) : '';
  return str.slice(0, start) + maskChar.repeat(str.length - start - end) + tail;
};

/**
 * 手机号脱敏
 * @example
 * maskPhone('13812345678'); // '138****5678'
 */
export const maskPhone = (phone: string): string => mask(phone, 3, 4);

/**
 * 身份证脱敏（保留前 6 后 4）
 * @example
 * maskIdCard('110101199003077774'); // '110101********7774'
 */
export const maskIdCard = (idCard: string): string => mask(idCard, 6, 4);

/**
 * 邮箱脱敏（保留用户名前 2 位与完整域名）
 * @example
 * maskEmail('abcdef@qq.com'); // 'ab****@qq.com'
 */
export const maskEmail = (email: string): string => {
  const at = email.indexOf('@');
  if (at <= 0) return email;
  const name = email.slice(0, at);
  const domain = email.slice(at);
  if (name.length <= 1) return name + domain;
  const visible = Math.min(2, name.length);
  return name.slice(0, visible) + '*'.repeat(name.length - visible) + domain;
};

/**
 * 生成随机字符串（优先使用 crypto，保证随机性）
 * @param length 长度，默认 8
 * @param chars 字符集，默认大小写字母 + 数字
 * @example
 * randomString(); // 例如 'a1B2c3D4'
 * randomString(6, '01'); // 例如 '101100'
 */
export const randomString = (length = 8, chars = DEFAULT_CHARS): string => {
  if (length <= 0) return '';
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const values = cryptoObj.getRandomValues(new Uint32Array(length));
    let result = '';
    for (let i = 0; i < length; i++) result += chars[values[i] % chars.length];
    return result;
  }
  let result = '';
  for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

/**
 * 生成唯一 id：前缀 + 时间戳（36 进制）+ 随机串
 * @param prefix 前缀，默认空
 * @example
 * uid('u_'); // 例如 'u_m1k2j3a1B2c3D4e5'
 */
export const uid = (prefix = ''): string => `${prefix}${Date.now().toString(36)}${randomString(8)}`;

/**
 * 生成 uuid v4（优先使用 `crypto.randomUUID`）
 * @example
 * uuid(); // 例如 'b7f3c2a1-...-4...-a...-...'
 */
export const uuid = (): string => {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') return cryptoObj.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ch => {
    const random = Math.floor(Math.random() * 16);
    const value = ch === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

/**
 * 转义 HTML 特殊字符（`& < > " '`）
 * @example
 * escapeHtml('<a>'); // '&lt;a&gt;'
 */
export const escapeHtml = (str: string): string => str.replace(/[&<>"']/g, ch => HTML_ESCAPE_MAP[ch]);

/**
 * 去除 HTML 标签（简单实现，不做安全净化，勿用于 XSS 防护）
 * @example
 * stripHtml('<p>hi</p>'); // 'hi'
 */
export const stripHtml = (str: string): string => str.replace(/<[^>]*>/g, '');

/**
 * 简易模板插值，支持 `{{ key }}` 与 `{{ a.b }}`
 * @param str 模板字符串
 * @param data 数据源
 * @example
 * template('Hi {{ name }}', { name: 'Tom' }); // 'Hi Tom'
 */
export const template = (str: string, data: Record<string, unknown>): string =>
  str.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, path: string) => {
    const value = path
      .split('.')
      .reduce<unknown>(
        (acc, key) => (acc === null || typeof acc !== 'object' ? undefined : (acc as Record<string, unknown>)[key]),
        data,
      );
    return value === null || value === undefined ? '' : String(value);
  });

/**
 * 字符串的 UTF-8 字节长度
 * @example
 * byteSize('abc'); // 3
 * byteSize('中文'); // 6
 */
export const byteSize = (str: string): number => new TextEncoder().encode(str).length;

/**
 * 比较版本号（semver 风格）
 * @returns a > b 返回 1，a < b 返回 -1，相等返回 0
 * @example
 * compareVersion('1.2.0', '1.10.0'); // -1
 * compareVersion('2.0', '1.9.9'); // 1
 */
export const compareVersion = (a: string, b: string): number => {
  const partsA = a.split('.').map(part => Number.parseInt(part, 10) || 0);
  const partsB = b.split('.').map(part => Number.parseInt(part, 10) || 0);
  const length = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < length; i++) {
    const valueA = i < partsA.length ? partsA[i] : 0;
    const valueB = i < partsB.length ? partsB[i] : 0;
    if (valueA !== valueB) return valueA > valueB ? 1 : -1;
  }
  return 0;
};
