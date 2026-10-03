import { describe, expect, it } from 'vitest';
import { filterTree, findTreeNode, findTreeNodes, forEachTree, mapTree, treeToArray } from '../src/tree';

interface TreeNode {
  id: number;
  name: string;
  children?: TreeNode[];
}

const tree: TreeNode[] = [
  {
    id: 1,
    name: 'a',
    children: [
      { id: 2, name: 'b', children: [{ id: 4, name: 'd' }] },
      { id: 3, name: 'c' },
    ],
  },
  { id: 5, name: 'e' },
];

describe('treeToArray', () => {
  it('深度优先扁平化', () => {
    expect(treeToArray(tree).map(node => node.id)).toEqual([1, 2, 4, 3, 5]);
  });

  it('支持自定义子节点字段', () => {
    const custom = [{ id: 1, nodes: [{ id: 2 }] }];
    expect(treeToArray(custom as unknown as TreeNode[], { children: 'nodes' }).map(node => node.id)).toEqual([1, 2]);
  });
});

describe('forEachTree', () => {
  it('回调提供父节点与层级', () => {
    const depths: Record<number, number> = {};
    const parents: Record<number, number | undefined> = {};
    forEachTree(tree, (node, parent, depth) => {
      depths[node.id] = depth;
      parents[node.id] = parent?.id;
    });
    expect(depths).toEqual({ 1: 0, 2: 1, 4: 2, 3: 1, 5: 0 });
    expect(parents[4]).toBe(2);
    expect(parents[1]).toBeUndefined();
  });
});

describe('findTreeNode / findTreeNodes', () => {
  it('查找单个节点', () => {
    expect(findTreeNode(tree, node => node.id === 4)?.name).toBe('d');
    expect(findTreeNode(tree, node => node.id === 99)).toBeUndefined();
  });

  it('查找多个节点', () => {
    expect(findTreeNodes(tree, node => node.id % 2 === 1).map(node => node.id)).toEqual([1, 3, 5]);
  });
});

describe('filterTree', () => {
  it('保留命中节点及其祖先链', () => {
    const result = filterTree(tree, node => node.id === 4);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    expect(result[0].children?.[0].id).toBe(2);
    expect(result[0].children?.[0].children?.[0].id).toBe(4);
    expect(result[0].children?.[0].children?.[0].children).toBeUndefined();
  });
});

describe('mapTree', () => {
  it('逐节点转换并保持层级', () => {
    const mapped = mapTree(tree, node => ({ id: node.id, name: node.name.toUpperCase() })) as unknown as TreeNode[];
    expect(mapped[0].name).toBe('A');
    expect(mapped[0].children?.[0].name).toBe('B');
    expect(mapped[0].children?.[0].children?.[0].name).toBe('D');
    expect(mapped[1].name).toBe('E');
  });
});
