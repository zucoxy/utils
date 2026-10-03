import { describe, expect, it, vi } from 'vitest';
import {
  arrayToOption,
  arrayToTree,
  chunk,
  compact,
  difference,
  first,
  groupBy,
  intersection,
  last,
  mean,
  range,
  sample,
  shuffle,
  sortBy,
  sumBy,
  union,
  unique,
  uniqueBy,
} from '../src/array';

describe('arrayToOption', () => {
  it('转换 string[]', () => {
    expect(arrayToOption(['a', 'b'])).toEqual([
      { value: 'a', label: 'a' },
      { value: 'b', label: 'b' },
    ]);
  });

  it('转换 [value, label][]', () => {
    expect(
      arrayToOption([
        [1, 'one'],
        [2, 'two'],
      ]),
    ).toEqual([
      { value: 1, label: 'one' },
      { value: 2, label: 'two' },
    ]);
  });

  it('转换 LabelValue[] 时保留原对象引用', () => {
    const option = { value: 1, label: 'one' };
    expect(arrayToOption([option])[0]).toBe(option);
  });

  it('非数组输入返回空数组', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(arrayToOption('oops')).toEqual([]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('arrayToTree', () => {
  interface Node { key: number; parentKey: number | null; children: Node[] }

  const data = [
    { key: 1, parentKey: null },
    { key: 2, parentKey: 1 },
    { key: 3, parentKey: 1 },
    { key: 4, parentKey: 2 },
  ];

  it('构建树形结构', () => {
    const tree = arrayToTree(data) as unknown as Node[];
    expect(tree).toHaveLength(1);
    expect(tree[0].key).toBe(1);
    expect(tree[0].children).toHaveLength(2);
    expect(tree[0].children[0].key).toBe(2);
    expect(tree[0].children[0].children[0].key).toBe(4);
    expect(tree[0].children[1].children).toBeUndefined();
  });

  it('不会修改原始数据', () => {
    const tree = arrayToTree(data) as unknown as Node[];
    expect('children' in data[0]).toBe(false);
    expect(tree[0].children[0]).not.toBe(data[1]);
  });

  it('支持自定义字段名', () => {
    interface CustomNode { id: string; nodes: Array<{ id: string }> }
    const tree = arrayToTree(
      [
        { id: 'a', pid: null },
        { id: 'b', pid: 'a' },
      ],
      { key: 'id', parentKey: 'pid', children: 'nodes' },
    ) as unknown as CustomNode[];
    expect(tree).toHaveLength(1);
    expect(tree[0].nodes[0].id).toBe('b');
  });
});

describe('uniqueness', () => {
  it('unique', () => {
    expect(unique([1, 1, 2, 3, 3])).toEqual([1, 2, 3]);
  });

  it('uniqueBy', () => {
    expect(uniqueBy([{ id: 1 }, { id: 1 }, { id: 2 }], item => item.id)).toEqual([{ id: 1 }, { id: 2 }]);
  });
});

describe('chunk / groupBy', () => {
  it('chunk', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(() => chunk([1], 0)).toThrow(RangeError);
  });

  it('groupBy', () => {
    const result = groupBy([{ t: 'a', v: 1 }, { t: 'b', v: 2 }, { t: 'a', v: 3 }], item => item.t);
    expect(result.a).toHaveLength(2);
    expect(result.b).toEqual([{ t: 'b', v: 2 }]);
  });
});

describe('sortBy / compact', () => {
  it('sortBy 升序与降序', () => {
    expect(sortBy([3, 1, 2], item => item)).toEqual([1, 2, 3]);
    expect(sortBy([{ n: 1 }, { n: 3 }, { n: 2 }], item => item.n, 'desc')).toEqual([{ n: 3 }, { n: 2 }, { n: 1 }]);
  });

  it('compact 去除假值', () => {
    expect(compact([0, 1, false, 2, '', null, undefined, 3])).toEqual([1, 2, 3]);
  });
});

describe('set operations', () => {
  it('difference / intersection / union', () => {
    expect(difference([1, 2, 3], [2, 3, 4])).toEqual([1]);
    expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
    expect(union([1, 2], [2, 3])).toEqual([1, 2, 3]);
  });
});

describe('shuffle / sample', () => {
  it('shuffle 返回同样元素的新数组', () => {
    const source = [1, 2, 3, 4];
    const result = shuffle(source);
    expect(result).not.toBe(source);
    expect([...result].sort((a, b) => a - b)).toEqual([1, 2, 3, 4]);
  });

  it('sample', () => {
    expect(sample([1])).toBe(1);
    expect(sample([])).toBeUndefined();
  });
});

describe('range', () => {
  it('range', () => {
    expect(range(5)).toEqual([0, 1, 2, 3, 4]);
    expect(range(1, 4)).toEqual([1, 2, 3]);
    expect(range(0, 10, 3)).toEqual([0, 3, 6, 9]);
    expect(range(3, 0, -1)).toEqual([3, 2, 1]);
    expect(() => range(0, 5, 0)).toThrow(RangeError);
  });
});

describe('aggregation', () => {
  it('sumBy / mean', () => {
    expect(sumBy([{ n: 1 }, { n: 2 }], item => item.n)).toBe(3);
    expect(mean([1, 2, 3])).toBe(2);
    expect(mean([])).toBe(0);
  });

  it('first / last', () => {
    expect(first([1, 2])).toBe(1);
    expect(last([1, 2])).toBe(2);
    expect(first([])).toBeUndefined();
  });
});
