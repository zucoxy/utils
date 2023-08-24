/**
 * 获取访问地址的参数，返回对象格式
 * @param url - [string] 获取参数的地址
 */
export function getUrlQueryObject(url: string) {
  if (!url) return {};
  const query = url.substring(url.indexOf('?') + 1);
  const vars = query.split('&');
  const obj: Record<string, string> = {};
  for (let i = 0; i < vars.length; i++) {
    const key = vars[i].split('=', 1)[0];
    obj[key] = vars[i].replace(`${key}=`, '');
  }
  return obj;
}
