import { describe, expect, it } from 'vitest';
import {
  byteSize,
  camelCase,
  capitalize,
  compareVersion,
  escapeHtml,
  kebabCase,
  mask,
  maskEmail,
  maskIdCard,
  maskPhone,
  pascalCase,
  randomString,
  snakeCase,
  stripHtml,
  template,
  truncate,
  uid,
  uncapitalize,
  uuid,
} from '../src/string';

describe('string 大小写转换', () => {
  it('camelCase', () => {
    expect(camelCase('hello world')).toBe('helloWorld');
    expect(camelCase('hello-world_foo')).toBe('helloWorldFoo');
    expect(camelCase('FooBar')).toBe('fooBar');
  });

  it('pascalCase', () => {
    expect(pascalCase('hello world')).toBe('HelloWorld');
    expect(pascalCase('foo_bar')).toBe('FooBar');
  });

  it('kebabCase / snakeCase', () => {
    expect(kebabCase('FooBar')).toBe('foo-bar');
    expect(snakeCase('FooBar')).toBe('foo_bar');
  });

  it('capitalize / uncapitalize', () => {
    expect(capitalize('abc')).toBe('Abc');
    expect(uncapitalize('Abc')).toBe('abc');
    expect(capitalize('')).toBe('');
  });
});

describe('string 截断与脱敏', () => {
  it('truncate', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
    expect(truncate('hi', 5)).toBe('hi');
  });

  it('mask / maskPhone / maskIdCard / maskEmail', () => {
    expect(mask('13812345678', 3, 4)).toBe('138****5678');
    expect(maskPhone('13812345678')).toBe('138****5678');
    expect(maskIdCard('110101199003077774')).toBe('110101********7774');
    expect(maskEmail('abcdef@qq.com')).toBe('ab****@qq.com');
    expect(maskEmail('a@b.com')).toBe('a@b.com');
  });
});

describe('string 随机', () => {
  it('randomString', () => {
    expect(randomString()).toHaveLength(8);
    expect(randomString(12, 'ab')).toMatch(/^[ab]{12}$/);
  });

  it('uid / uuid', () => {
    expect(uid('u_')).toMatch(/^u_[0-9a-zA-Z]+$/);
    expect(uuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});

describe('string 其它', () => {
  it('escapeHtml / stripHtml', () => {
    expect(escapeHtml('<a href="x">&\'</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
    expect(stripHtml('<p>hi</p>')).toBe('hi');
  });

  it('template', () => {
    expect(template('Hi {{ name }}, {{a.b}}', { name: 'Tom', a: { b: 1 } })).toBe('Hi Tom, 1');
    expect(template('{{missing}}', {})).toBe('');
  });

  it('byteSize', () => {
    expect(byteSize('abc')).toBe(3);
    expect(byteSize('中文')).toBe(6);
  });

  it('compareVersion', () => {
    expect(compareVersion('1.2.0', '1.10.0')).toBe(-1);
    expect(compareVersion('1.2.0', '1.2.0')).toBe(0);
    expect(compareVersion('2.0', '1.9.9')).toBe(1);
  });
});
