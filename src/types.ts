export interface LabelValue<V = any, L = string> {
  label: L;
  value: V;
}

export interface TreeStruct {
  id: number | string;
  parentId: number | string;
  children?: TreeStruct[];
}
