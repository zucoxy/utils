/** 树操作配置 */
export interface TreeOptions {
  /** 子节点字段名，默认 `'children'` */
  children?: string;
}

const DEFAULT_CHILDREN_KEY = 'children';

const getChildren = <T extends object>(node: T, childrenKey: string): T[] | undefined => {
  const children = (node as Record<string, unknown>)[childrenKey];
  return Array.isArray(children) ? (children as T[]) : undefined;
};

/**
 * 树转扁平数组（`arrayToTree` 的逆操作，深度优先）
 * @param tree 树形数组
 * @param options.children 子节点字段名，默认 `'children'`
 * @example
 * treeToArray([{ id: 1, children: [{ id: 2 }] }]).map(n => n.id); // [1, 2]
 */
export function treeToArray<T extends object>(tree: readonly T[], options: TreeOptions = {}): T[] {
  const childrenKey = options.children ?? DEFAULT_CHILDREN_KEY;
  const result: T[] = [];
  const walk = (nodes: readonly T[]) => {
    for (const node of nodes) {
      result.push(node);
      const children = getChildren(node, childrenKey);
      if (children) walk(children);
    }
  };
  walk(tree);
  return result;
}

/**
 * 深度优先遍历，回调提供父节点与层级
 * @param tree 树形数组
 * @param callback 回调 `(node, parent, depth)`
 * @param options.children 子节点字段名，默认 `'children'`
 * @example
 * forEachTree(tree, (node, parent, depth) => console.log(depth, node));
 */
export function forEachTree<T extends object>(
  tree: readonly T[],
  callback: (node: T, parent: T | undefined, depth: number) => void,
  options: TreeOptions = {},
): void {
  const childrenKey = options.children ?? DEFAULT_CHILDREN_KEY;
  const walk = (nodes: readonly T[], parent: T | undefined, depth: number) => {
    for (const node of nodes) {
      callback(node, parent, depth);
      const children = getChildren(node, childrenKey);
      if (children) walk(children, node, depth + 1);
    }
  };
  walk(tree, undefined, 0);
}

/**
 * 查找首个匹配的节点
 * @param tree 树形数组
 * @param predicate 判定函数
 * @param options.children 子节点字段名，默认 `'children'`
 * @example
 * findTreeNode(tree, node => node.id === 4);
 */
export function findTreeNode<T extends object>(
  tree: readonly T[],
  predicate: (node: T) => boolean,
  options: TreeOptions = {},
): T | undefined {
  const childrenKey = options.children ?? DEFAULT_CHILDREN_KEY;
  for (const node of tree) {
    if (predicate(node)) return node;
    const children = getChildren(node, childrenKey);
    if (children) {
      const found = findTreeNode(children, predicate, options);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * 查找所有匹配的节点
 * @param tree 树形数组
 * @param predicate 判定函数
 * @param options.children 子节点字段名，默认 `'children'`
 * @example
 * findTreeNodes(tree, node => node.id % 2 === 1);
 */
export function findTreeNodes<T extends object>(
  tree: readonly T[],
  predicate: (node: T) => boolean,
  options: TreeOptions = {},
): T[] {
  const result: T[] = [];
  forEachTree(
    tree,
    node => {
      if (predicate(node)) result.push(node);
    },
    options,
  );
  return result;
}

/**
 * 过滤树：保留命中节点及其祖先链（返回浅拷贝节点）
 * @param tree 树形数组
 * @param predicate 判定函数
 * @param options.children 子节点字段名，默认 `'children'`
 * @example
 * filterTree(tree, node => node.id === 4); // 保留 4 及其祖先
 */
export function filterTree<T extends object>(
  tree: readonly T[],
  predicate: (node: T) => boolean,
  options: TreeOptions = {},
): T[] {
  const childrenKey = options.children ?? DEFAULT_CHILDREN_KEY;
  const result: T[] = [];
  for (const node of tree) {
    const children = getChildren(node, childrenKey);
    const filteredChildren = children ? filterTree(children, predicate, options) : [];
    if (predicate(node) || filteredChildren.length) {
      result.push(children ? { ...node, [childrenKey]: filteredChildren } : { ...node });
    }
  }
  return result;
}

/**
 * 映射树：逐节点转换并保持层级结构
 * @param tree 树形数组
 * @param mapper 转换函数 `(node, depth) => R`
 * @param options.children 子节点字段名，默认 `'children'`
 * @example
 * mapTree(tree, node => ({ id: node.id, label: node.name }));
 */
export function mapTree<T extends object, R extends object>(
  tree: readonly T[],
  mapper: (node: T, depth: number) => R,
  options: TreeOptions = {},
): R[] {
  const childrenKey = options.children ?? DEFAULT_CHILDREN_KEY;
  const walk = (nodes: readonly T[], depth: number): R[] =>
    nodes.map(node => {
      const mapped = mapper(node, depth);
      const children = getChildren(node, childrenKey);
      return children ? ({ ...mapped, [childrenKey]: walk(children, depth + 1) }) : mapped;
    });
  return walk(tree, 0);
}
