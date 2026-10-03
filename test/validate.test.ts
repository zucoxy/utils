import { describe, expect, it } from 'vitest';
import { isEmail, isIPv4, isIdCard, isMac, isPhone, isStrongPassword, isUrl } from '../src/validate';

describe('validate', () => {
  it('isEmail', () => {
    expect(isEmail('a.b+c@example.com')).toBe(true);
    expect(isEmail('a@b')).toBe(false);
    expect(isEmail('nope')).toBe(false);
    expect(isEmail(123)).toBe(false);
  });

  it('isPhone', () => {
    expect(isPhone('13812345678')).toBe(true);
    expect(isPhone('12345678901')).toBe(false);
    expect(isPhone('1381234567')).toBe(false);
  });

  it('isUrl', () => {
    expect(isUrl('https://example.com/a?b=1')).toBe(true);
    expect(isUrl('ftp://example.com')).toBe(false);
    expect(isUrl('example.com')).toBe(false);
  });

  it('isIPv4', () => {
    expect(isIPv4('192.168.1.1')).toBe(true);
    expect(isIPv4('256.1.1.1')).toBe(false);
    expect(isIPv4('1.2.3')).toBe(false);
  });

  it('isMac', () => {
    expect(isMac('00:1A:2B:3C:4D:5E')).toBe(true);
    expect(isMac('00-1a-2b-3c-4d-5e')).toBe(true);
    expect(isMac('zz:1a:2b:3c:4d:5e')).toBe(false);
  });

  it('isIdCard（含校验位）', () => {
    expect(isIdCard('110101199003077774')).toBe(true);
    expect(isIdCard('110101199003077775')).toBe(false);
    expect(isIdCard('11010119900307777')).toBe(false);
  });

  it('isStrongPassword', () => {
    expect(isStrongPassword('Abc12345')).toBe(true);
    expect(isStrongPassword('abcdefgh')).toBe(false);
    expect(isStrongPassword('Ab1', 3)).toBe(true);
  });
});
