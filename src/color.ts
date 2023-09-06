/**
 * hsv2rgb
 * @param h
 * @param s
 * @param v
 */
export function hsv2rgb(h: number, s: number, v: number) {
  h === 360 && (h = 0);
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - s * f);
  const t = v * (1 - s * (1 - f));
  let r = 0;
  let g = 0;
  let b = 0;
  if (i === 0) {
    r = v;
    g = t;
    b = p;
  } else if (i === 1) {
    r = q;
    g = v;
    b = p;
  } else if (i === 2) {
    r = p;
    g = v;
    b = t;
  } else if (i === 3) {
    r = p;
    g = q;
    b = v;
  } else if (i === 4) {
    r = t;
    g = p;
    b = v;
  } else if (i === 5) {
    r = v;
    g = p;
    b = q;
  }
  r = Math.floor(r * 255 + 0.5);
  g = Math.floor(g * 255 + 0.5);
  b = Math.floor(b * 255 + 0.5);
  return { r, g, b };
}

/**
 * rgb2hsv
 * @param r
 * @param g
 * @param b
 */
export function rgb2hsv(r: number, g: number, b: number) {
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;
  const cmax = Math.max(r1, g1, b1);
  const cmin = Math.min(r1, g1, b1);
  const d = cmax - cmin;
  let h = 0;
  let s = 0;
  let v = 0;
  if (d === 0) {
    h = 0;
  } else if (cmax === r1) {
    h = ((60 * (g1 - b1)) / d + 360) % 360;
  } else if (cmax === g1) {
    h = 60 * ((b1 - r1) / d + 2);
  } else if (cmax === b1) {
    h = 60 * ((r1 - g1) / d + 4);
  }
  if (cmax === 0) {
    s = 0;
  } else {
    s = d / cmax;
  }
  v = cmax;
  h = Math.floor(h + 0.5);
  s = Math.floor(s * 100 + 0.5) / 100;
  v = Math.floor(v * 100 + 0.5) / 100;
  return { h, s, v };
}

/**
 * rgba2hex
 * @param r
 * @param g
 * @param b
 * @param a
 */
export function rgba2hex(r: any, g: any, b: any, a = 1) {
  r = parseInt(r);
  const r1 = r.toString(16).length !== 2 ? `0${r.toString(16)}` : r.toString(16);
  g = parseInt(g);
  const g1 = g.toString(16).length !== 2 ? `0${g.toString(16)}` : g.toString(16);
  b = parseInt(b);
  const b1 = b.toString(16).length !== 2 ? `0${b.toString(16)}` : b.toString(16);
  a = parseFloat(a.toString());
  let a1 = '';
  if (a !== 1) {
    const temp = Math.floor(256 * a);
    a1 = temp.toString(16).length !== 2 ? `0${temp.toString(16)}` : temp.toString(16);
  }
  return `#${r1}${g1}${b1}${a1}`.toUpperCase();
}

/**
 * hex2rgba
 * @param s
 */
export function hex2rgba(s: string): { r: number; g: number; b: number; a: number } {
  if (/^#?[0-9a-fA-F]{3}$/.test(s)) {
    const b = s.substring(s.length - 1, s.length);
    const g = s.substring(s.length - 2, s.length - 1);
    const r = s.substring(s.length - 3, s.length - 2);
    return hex2rgba(`${r + r}${g + g}${b + b}`);
  }
  if (/^#?[0-9a-fA-F]{4}$/.test(s)) {
    const a = s.substring(s.length - 1, s.length);
    const b = s.substring(s.length - 2, s.length - 1);
    const g = s.substring(s.length - 3, s.length - 2);
    const r = s.substring(s.length - 4, s.length - 3);
    return hex2rgba(`${r + r}${g + g}${b + b}${a + a}`);
  }
  if (/^#?[0-9a-fA-F]{6}$/.test(s)) {
    const b = parseInt(`0x${s.substring(s.length - 2, s.length)}`);
    const g = parseInt(`0x${s.substring(s.length - 4, s.length - 2)}`);
    const r = parseInt(`0x${s.substring(s.length - 6, s.length - 4)}`);
    return { r, g, b, a: 1 };
  }
  if (/^#?[0-9a-fA-F]{8}$/.test(s)) {
    let a = parseInt(`0x${s.substring(s.length - 2, s.length)}`);
    a = a / 255;
    const b = parseInt(`0x${s.substring(s.length - 4, s.length - 2)}`);
    const g = parseInt(`0x${s.substring(s.length - 6, s.length - 4)}`);
    const r = parseInt(`0x${s.substring(s.length - 8, s.length - 6)}`);
    return { r, g, b, a };
  }
  return { r: 0, g: 0, b: 0, a: 0 };
}

/**
 * colorToHsv
 * @param color
 */
export function colorToHsv(color: any): { h: number; s: number; v: number } {
  // 将颜色转换为 RGBA 格式
  let rgba;
  if (typeof color === 'string') {
    if (!color.startsWith('#')) {
      throw new TypeError('only support for hex/rgb/hsv');
    }
    rgba = hex2rgba(color);
  } else if (typeof color === 'object') {
    if (color.r && color.g && color.b) {
      rgba = color;
    } else if (color.h && color.s && color.v) {
      return color;
    }
  } else {
    throw new TypeError('Invalid color format');
  }

  // 将 RGBA 转换为 HSV
  const { r, g, b } = rgba;
  return rgb2hsv(r, g, b);
}
