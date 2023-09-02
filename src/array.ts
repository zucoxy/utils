import type { LabelValue, TreeStruct } from './types';
import { isObject } from './is';

/**
 * 传入一个数组，返回 labelValue 格式的数组数据
 * @param array - 1. string[]  2. number[]  3. [value, label][] 4. {value: label}[]
 */
export const arrayToOption = <V>(array: any[]): Required<LabelValue<V>>[] => {
  if (!Array.isArray(array)) {
    console.warn('TypeError: array excepted to be Array');
    return array;
  }
  return array
    .map(item => {
      let options: Required<LabelValue<V>> = { value: item, label: item };
      if (Array.isArray(item)) {
        options = { value: item[0], label: item[1] };
      } else if (isObject(item)) {
        if (Object.hasOwn(item, 'value') && Object.hasOwn(item, 'label')) {
          options = item as LabelValue;
        } else {
          const entry: any[] = Object.entries(item);
          return entry.map(i => ({ value: i[0], label: i[1] }));
        }
      } else {
        options = { value: item, label: item };
      }
      return options;
    })
    .flat();
};

/**
 * 扁平化树数据结构转换为树形结构
 * @param data TreeStruct[]
 * @param parentId default is 0
 */
export function arrayToTree(data: TreeStruct[], parentId = 0) {
  const result: any[] = [];
  result.push(
    ...data
      .map(item => {
        if (item.parentId === parentId) {
          item.children = [];
          return item;
        }
        return undefined;
      })
      .filter(item => item)
  );
  const filterData = data.filter(item => item.parentId !== parentId);
  return result.map(item => {
    if (filterData.length) {
      const arr = arrayToTree(filterData, item.id);
      if (arr.length && item.children) item.children.push(...arr);
      if (!arr.length) delete item.children;
    }
    return item;
  });
}
