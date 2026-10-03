/**
 * 下拉选项等场景的通用键值结构
 * @typeParam V - value 类型
 * @typeParam L - label 类型
 * @example
 * const option: LabelValue<number> = { value: 1, label: '一' };
 */
export interface LabelValue<V = unknown, L = string> {
  label: L;
  value: V;
}

/**
 * 扁平树数据的基础结构（配合 `arrayToTree` 使用）
 */
export interface TreeStruct {
  id: number | string;
  parentId: number | string;
  children?: TreeStruct[];
}

/** RGB 颜色，分量 0-255 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/** RGBA 颜色，分量 0-255，a 为 0-1 */
export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** HSV 颜色，h 0-360，s/v 0-1 */
export interface HSV {
  h: number;
  s: number;
  v: number;
}

/** HSL 颜色，h 0-360，s/l 0-1 */
export interface HSL {
  h: number;
  s: number;
  l: number;
}
