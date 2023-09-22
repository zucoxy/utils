export interface LabelValue<V = any, L = string> {
  label: L;
  value: V;
}

export interface TreeStruct {
  id: number | string;
  parentId: number | string;
  children?: TreeStruct[];
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}
