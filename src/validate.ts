const EMAIL_RE = /^[\w.%+-]+@[\w-]+(\.[\w-]+)+$/;
const PHONE_RE = /^1[3-9]\d{9}$/;
const MAC_RE = /^([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}$/;
const ID_CARD_RE = /^\d{17}[\dXx]$/;
const ID_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const ID_CHECK_CODES = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

/**
 * 校验邮箱
 * @example
 * isEmail('a@b.com'); // true
 */
export const isEmail = (v: unknown): boolean => typeof v === 'string' && EMAIL_RE.test(v);

/**
 * 校验中国大陆手机号
 * @example
 * isPhone('13812345678'); // true
 */
export const isPhone = (v: unknown): boolean => typeof v === 'string' && PHONE_RE.test(v);

/**
 * 校验 http/https URL
 * @example
 * isUrl('https://example.com'); // true
 */
export const isUrl = (v: unknown): boolean => {
  if (typeof v !== 'string' || !v) return false;
  try {
    const url = new URL(v);
    return url.protocol === 'http:' || url.protocol === 'https:';
  }
  catch {
    return false;
  }
};

/**
 * 校验 IPv4 地址
 * @example
 * isIPv4('192.168.1.1'); // true
 * isIPv4('256.1.1.1'); // false
 */
export const isIPv4 = (v: unknown): boolean => {
  if (typeof v !== 'string') return false;
  const parts = v.split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => /^\d{1,3}$/.test(part) && Number(part) <= 255);
};

/**
 * 校验 MAC 地址（支持 `:` 或 `-` 分隔）
 * @example
 * isMac('00:1A:2B:3C:4D:5E'); // true
 */
export const isMac = (v: unknown): boolean => typeof v === 'string' && MAC_RE.test(v);

/**
 * 校验中国大陆 18 位身份证（含校验位）
 * @example
 * isIdCard('110101199003077774'); // true
 */
export const isIdCard = (v: unknown): boolean => {
  if (typeof v !== 'string' || !ID_CARD_RE.test(v)) return false;
  let sum = 0;
  for (let i = 0; i < 17; i++) sum += Number(v[i]) * ID_WEIGHTS[i];
  return ID_CHECK_CODES[sum % 11] === v[17].toUpperCase();
};

/**
 * 密码强度：长度达标且包含「小写 / 大写 / 数字 / 特殊字符」中至少 3 类
 * @param v 待校验密码
 * @param minLength 最小长度，默认 8
 * @example
 * isStrongPassword('Abc12345'); // true
 * isStrongPassword('abcdefgh'); // false
 */
export const isStrongPassword = (v: unknown, minLength = 8): boolean => {
  if (typeof v !== 'string' || v.length < minLength) return false;
  const groups = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/];
  return groups.filter(re => re.test(v)).length >= 3;
};
