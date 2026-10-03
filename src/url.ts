/**
 * 获取访问地址的参数，返回对象格式（自动解码）
 * @param url 完整地址
 * @returns 查询参数键值对；无查询串时返回 `{}`
 * @example
 * getUrlQueryObject('https://a.com?x=1&y=2'); // { x: '1', y: '2' }
 * getUrlQueryObject('https://a.com?a=hello%20world#hash'); // { a: 'hello world' }
 */
export function getUrlQueryObject(url: string): Record<string, string> {
  if (!url) return {};
  const queryIndex = url.indexOf('?');
  if (queryIndex === -1) return {};
  const query = url.slice(queryIndex + 1).split('#', 1)[0];
  if (!query) return {};
  const obj: Record<string, string> = {};
  for (const pair of query.split('&')) {
    if (!pair) continue;
    const [key, ...rest] = pair.split('=');
    if (!key) continue;
    obj[key] = decodeURIComponent(rest.join('='));
  }
  return obj;
}
