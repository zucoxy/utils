import type { LabelValue } from './types';

/**
 * 两个对象深度合并
 * @param baseObj 基准对象
 * @param newObj 要合并的新数据
 */
export function deepMerge(baseObj: Record<string, any>, newObj: Record<string, any>) {
  let key;
  for (key in newObj) {
    // 如果target(也就是baseObj[key])存在，且是对象的话再去调用deepMerge，否则就是baseObj[key]里面没这个对象，需要与newObj[key]合并
    // 如果newObj[key]没有值或者值不是对象，此时直接替换baseObj[key]
    baseObj[key] =
      baseObj[key] &&
      baseObj[key].toString() === '[object Object]' &&
      newObj[key] &&
      newObj[key].toString() === '[object Object]'
        ? deepMerge(baseObj[key], newObj[key])
        : (baseObj[key] = newObj[key]);
  }
  return baseObj;
}

/**
 * 将 yaml 文件转为对象格式 注*：目前仅支持两层转换
 * @param yamlRaw
 */
export const yamlToObj = (yamlRaw: string) => {
  const res: Record<string, any> = {};
  const processRes = yamlRaw
    .replace('\r', '')
    .split(':\n  ')
    .map(i => {
      return i.split('\n');
    })
    .flat(Infinity)
    .map(t => (t as string).trim())
    .map(item => item.replace(' ', ''))
    .filter(item => item);
  let curKey = '';
  processRes.forEach(item => {
    if (!item.includes(':') || item.endsWith(':')) {
      curKey = item.replace(':', '');
      res[curKey] = {};
    } else {
      const splitRes = item.split(':');
      res[curKey][splitRes[0]] = splitRes[1];
    }
  });
  return res;
};

/**
 * 传入一个对象，返回 labelValue 格式的数组数据
 * @param obj {[key]: value} || {[value]: key}
 * @param reverse label 和 value 互换
 * @return {value: key, label: value} || {value: value, label: key}
 */
export const objectToOption = (obj: object, reverse?: boolean): LabelValue[] => {
  if (typeof obj === 'object' && !Array.isArray(obj)) {
    return Object.entries(obj).map(item =>
      reverse
        ? {
            value: item[1],
            label: item[0],
          }
        : {
            value: item[0],
            label: item[1],
          }
    );
  }
  return [];
};
