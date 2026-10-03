import { describe, expect, it } from 'vitest';
import { getUrlQueryObject } from '../src/url';

describe('getUrlQueryObject', () => {
  it('解析普通查询参数', () => {
    expect(getUrlQueryObject('https://a.com?x=1&y=2')).toEqual({ x: '1', y: '2' });
  });

  it('没有 ? 时返回空对象', () => {
    expect(getUrlQueryObject('https://a.com')).toEqual({});
    expect(getUrlQueryObject('')).toEqual({});
  });

  it('解码参数值', () => {
    expect(getUrlQueryObject('https://a.com?a=hello%20world')).toEqual({ a: 'hello world' });
  });

  it('忽略 hash', () => {
    expect(getUrlQueryObject('https://a.com?a=1#hash')).toEqual({ a: '1' });
  });

  it('无值参数返回空字符串', () => {
    expect(getUrlQueryObject('https://a.com?flag')).toEqual({ flag: '' });
  });

  it('值中包含 = 时保留', () => {
    expect(getUrlQueryObject('https://a.com?token=a=b')).toEqual({ token: 'a=b' });
  });
});
