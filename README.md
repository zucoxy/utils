# utils

Commonly used JS/TS utils —— 框架无关，浏览器 / Node 双端可用，可 tree-shaking。

## 环境要求

- **使用方**：Node.js >= 18.18.0（产物为 ES2022；`crypto` 不可用时 `randomString` / `uuid` 自动降级为 `Math.random`）
- **本地开发 / 发布**：Node.js >= 22.20.0（由 eslint / bumpp 等开发依赖决定）
- 包管理器：pnpm

## 安装

```bash
pnpm add @unyu/utils
```

## 快速开始

```ts
import { camelCase, deepClone, formatDate, pLimit } from '@unyu/utils';

camelCase('hello world'); // 'helloWorld'
formatDate(new Date(), 'YYYY-mm-dd'); // '2026-10-03'
const cloned = deepClone({ a: 1, fn: () => 'hi' });
```

## 多语言（locale）

涉及自然语言输出的函数都支持 `locale` 参数，**默认 `'zh-CN'`**，内置 `zh-CN` / `en-US`。

```ts
import { formatAxis, formatPast, getMessages } from '@unyu/utils';

formatPast(new Date(Date.now() - 30000)); // '30秒前'
formatPast(new Date(Date.now() - 30000), 'YYYY-mm-dd', 'en-US'); // '30 seconds ago'
formatAxis(new Date(), 'en-US'); // 'Good morning'
getMessages('en-US').date.justNow; // 'just now'
```

自定义语言：扩展 `LocaleMessages` 并通过 `locales` 注册（或直接参考 `zhCN` / `enUS` 的结构）。

## API 一览

- **base**：`assert` `toString` `getTypeName`
- **is**：`isDef` `isBoolean` `isFunction` `isNumber` `isString` `isObject` `isUndefined` `isNull` `isSymbol` `isRegExp` `isDate` `isFile` `isError` `isMap` `isSet` `isArray` `isWindow` `isBrowser`
- **array**：`arrayToOption` `arrayToTree` `unique` `uniqueBy` `chunk` `groupBy` `keyBy` `countBy` `sortBy` `maxBy` `minBy` `partition` `compact` `difference` `intersection` `union` `shuffle` `sample` `range` `sumBy` `mean` `first` `last` `zip`
- **object**：`deepMerge` `mergeWith` `yamlToObj` `objectToOption` `pick` `omit` `getByPath` `setByPath` `hasPath` `isEmpty` `invert` `mapValues` `mapKeys` `isEqual`
- **number**：`clamp` `inRange` `lerp` `roundTo` `ceilTo` `floorTo` `toFixed` `thousands` `formatFileSize` `randomInt` `randomFloat` `isEven` `isOdd` `percentage`
- **date**：`formatDate` `getWeek` `formatPast` `formatAxis` `createTimeUnitListByTimeRange`（均支持 `locale`）
- **color**：`randomColor` `hsv2rgb` `rgb2hsv` `rgba2hex` `hex2rgba` `colorToHsv` `colorLighten` `colorDarken` `isDarkColor`
- **string**：`capitalize` `uncapitalize` `camelCase` `pascalCase` `kebabCase` `snakeCase` `truncate` `mask` `maskPhone` `maskIdCard` `maskEmail` `randomString` `uid` `uuid` `escapeHtml` `stripHtml` `template` `byteSize` `compareVersion`
- **validate**：`isEmail` `isPhone` `isUrl` `isIPv4` `isMac` `isIdCard` `isStrongPassword`
- **function**：`debounce` `throttle` `once` `memoize` `sleep` `retry` `pLimit` `pipe` `compose` `noop`
- **tree**：`treeToArray` `forEachTree` `findTreeNode` `findTreeNodes` `filterTree` `mapTree`
- **clone**：`deepClone`
- **url**：`getUrlQueryObject`
- **img**：`compressionImage`
- **locale**：`getMessages` `locales` `zhCN` `enUS`

> 每个函数都带有 JSDoc（含 `@param` / `@returns` / `@example`），编辑器悬浮提示与 AI 助手可直接读取。

## 开发

```bash
pnpm install   # 安装依赖
pnpm dev       # 监听构建
pnpm lint      # ESLint 检查（同时承担代码格式化）
pnpm test      # 运行单元测试
pnpm build     # 产出 dist
```
