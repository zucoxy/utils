import { describe, expect, it } from 'vitest';
import {
  ceilTo,
  clamp,
  floorTo,
  formatFileSize,
  inRange,
  isEven,
  isOdd,
  lerp,
  percentage,
  randomFloat,
  randomInt,
  roundTo,
  thousands,
  toFixed,
} from '../src/number';

describe('clamp / inRange / lerp', () => {
  it('clamp', () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
    expect(clamp(2, 0, 3)).toBe(2);
  });

  it('inRange（闭区间，参数顺序无关）', () => {
    expect(inRange(2, 1, 3)).toBe(true);
    expect(inRange(3, 1, 3)).toBe(true);
    expect(inRange(4, 1, 3)).toBe(false);
    expect(inRange(2, 3, 1)).toBe(true);
  });

  it('lerp', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
  });
});

describe('roundTo', () => {
  it('指定小数位并缓解浮点误差', () => {
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(roundTo(1.2345, 2)).toBe(1.23);
    expect(roundTo(2.5)).toBe(3);
  });
});

describe('ceilTo / floorTo', () => {
  it('向上取整到指定小数位', () => {
    expect(ceilTo(1.001, 2)).toBe(1.01);
    expect(ceilTo(1.0000001, 2)).toBe(1.01);
    expect(ceilTo(0.1 + 0.2, 2)).toBe(0.3);
    expect(ceilTo(2.5)).toBe(3);
    expect(ceilTo(-1.001, 2)).toBe(-1);
  });

  it('向下取整到指定小数位', () => {
    expect(floorTo(1.009, 2)).toBe(1);
    expect(floorTo(1.999, 2)).toBe(1.99);
    expect(floorTo(0.1 + 0.2, 2)).toBe(0.3);
    expect(floorTo(2.5)).toBe(2);
    expect(floorTo(-1.001, 2)).toBe(-1.01);
  });
});

describe('toFixed', () => {
  it('保留固定小数位并补零', () => {
    expect(toFixed(1.001)).toBe('1.00');
    expect(toFixed(1.005)).toBe('1.01');
    expect(toFixed(2.345)).toBe('2.35');
    expect(toFixed(1.2, 3)).toBe('1.200');
    expect(toFixed(2, 0)).toBe('2');
  });

  it('支持 ceil / floor 取整方式', () => {
    expect(toFixed(1.001, 2, 'ceil')).toBe('1.01');
    expect(toFixed(1.009, 2, 'floor')).toBe('1.00');
    expect(toFixed(2.5, 0, 'floor')).toBe('2');
    expect(toFixed(-1.001, 2, 'floor')).toBe('-1.01');
  });
});

describe('thousands', () => {
  it('千分位格式化', () => {
    expect(thousands(1234567.89)).toBe('1,234,567.89');
    expect(thousands(-1234)).toBe('-1,234');
    expect(thousands('1000')).toBe('1,000');
    expect(thousands(1234, ' ')).toBe('1 234');
  });
});

describe('formatFileSize', () => {
  it('字节可读化', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1024)).toBe('1.00 KB');
    expect(formatFileSize(1536)).toBe('1.50 KB');
    expect(formatFileSize(1024, 0)).toBe('1 KB');
  });
});

describe('randomInt / randomFloat', () => {
  it('randomInt 落在闭区间内', () => {
    for (let i = 0; i < 50; i++) {
      const value = randomInt(1, 3);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(3);
    }
    expect(randomInt(5, 5)).toBe(5);
  });

  it('randomFloat 落在 [min, max) 内', () => {
    const value = randomFloat(1, 2);
    expect(value).toBeGreaterThanOrEqual(1);
    expect(value).toBeLessThan(2);
  });
});

describe('isEven / isOdd', () => {
  it('奇偶判断', () => {
    expect(isEven(2)).toBe(true);
    expect(isEven(-2)).toBe(true);
    expect(isEven(3)).toBe(false);
    expect(isOdd(3)).toBe(true);
    expect(isOdd(-3)).toBe(true);
    expect(isOdd(2)).toBe(false);
  });
});

describe('percentage', () => {
  it('百分比计算', () => {
    expect(percentage(1, 4)).toBe(25);
    expect(percentage(1, 3, 0)).toBe(33);
    expect(percentage(1, 0)).toBe(0);
  });
});
