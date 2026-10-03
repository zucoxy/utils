import { describe, expect, it } from 'vitest';
import {
  colorDarken,
  colorLighten,
  colorToHsv,
  hex2rgba,
  hsv2rgb,
  isDarkColor,
  randomColor,
  rgb2hsv,
  rgba2hex,
} from '../src/color';

describe('color', () => {
  it('hsv2rgb 转换并处理 360 度', () => {
    expect(hsv2rgb(0, 1, 1)).toEqual({ r: 255, g: 0, b: 0 });
    expect(hsv2rgb(360, 1, 1)).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('rgb2hsv 转换', () => {
    expect(rgb2hsv(255, 0, 0)).toEqual({ h: 0, s: 1, v: 1 });
  });

  it('hex2rgba 支持 3/6/8 位', () => {
    expect(hex2rgba('#ff0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(hex2rgba('#f00')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(hex2rgba('#ff000080').a).toBeCloseTo(128 / 255);
  });

  it('rgba2hex 转换', () => {
    expect(rgba2hex(255, 0, 0)).toBe('#FF0000');
    expect(rgba2hex(255, 0, 0, 0.5)).toBe('#FF000080');
  });

  it('colorToHsv 支持分量为 0 的 rgb 对象', () => {
    expect(colorToHsv('#ff0000')).toEqual({ h: 0, s: 1, v: 1 });
    expect(colorToHsv({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 1, v: 1 });
  });

  it('colorLighten / colorDarken', () => {
    expect(colorLighten('#000000', 0.5)).toBe('#808080');
    expect(colorDarken('#ffffff', 0.5)).toBe('#808080');
  });

  it('isDarkColor', () => {
    expect(isDarkColor('#000000')).toBe(true);
    expect(isDarkColor('#ffffff')).toBe(false);
  });

  it('randomColor 输出合法颜色', () => {
    expect(randomColor()).toMatch(/^#[0-9a-f]{6}$/);
    expect(randomColor('rgb')).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    expect(randomColor('hsl')).toMatch(/^hsl\(\d+deg, \d+%, \d+%\)$/);
  });
});
