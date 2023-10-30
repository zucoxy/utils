import type { LabelValue } from './types';
import { isObject } from './is';

/**
 * 传入一个数组，返回 labelValue 格式的数组数据
 * @param array - 1. string[]  2. number[]  3. [value, label][] 4. LabelValue[]
 */
export const arrayToOption = <V>(array: any[]): Required<LabelValue<V>>[] => {
  if (!Array.isArray(array)) {
    console.warn('TypeError: array excepted to be Array');
    return array;
  }
  return array
    .map(item => {
      let option: Required<LabelValue<V>>;
      if (Array.isArray(item)) {
        option = { value: item[0], label: item[1] };
      } else if (isObject(item)) {
        option = item as LabelValue;
      } else {
        option = { value: item, label: item };
      }
      return option;
    })
    .flat();
};

/**
 * 扁平化树数据结构转换为树形结构
 * @param data any[]
 * @param fieldNames - { key: 'key', parentKey: 'parentKey', children: 'children' }
 * @param parentKey
 */
export function arrayToTree(
  data: any[],
  fieldNames = { key: 'key', parentKey: 'parentKey', children: 'children' },
  parentKey: any = null
) {
  const result: any[] = [];
  result.push(
    ...data
      .map(item => {
        if (!item[fieldNames.parentKey] || item[fieldNames.parentKey] === parentKey) {
          item[fieldNames.children] = [];
          return item;
        }
        return undefined;
      })
      .filter(item => item)
  );
  const filterData = data.filter(item => item[fieldNames.parentKey] !== parentKey && item[fieldNames.parentKey]);
  return result.map(item => {
    if (filterData.length) {
      const arr = arrayToTree(filterData, item[fieldNames.key], fieldNames);
      if (arr.length && item[fieldNames.children]) item[fieldNames.children].push(...arr);
      if (!arr.length) delete item[fieldNames.children];
    }
    return item;
  });
}
