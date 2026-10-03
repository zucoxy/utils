import { type Locale, getMessages } from './locale';

/**
 * 时间日期转换
 * @param date 当前时间，`Date` 格式
 * @param format 需要转换的时间格式字符串，可任意拼接，如 `YYYY-mm-dd HH:MM:SS`
 * @param locale 语言包，默认 `'zh-CN'`
 * @description format 季度：`YYYY-mm-dd HH:MM:SS QQQQ`
 * @description format 星期：`YYYY-mm-dd HH:MM:SS WWW`
 * @description format 几周：`YYYY-mm-dd HH:MM:SS ZZZ`
 * @returns 返回拼接后的时间字符串
 * @example
 * formatDate(new Date(2020, 0, 1, 9, 5, 7), 'YYYY-mm-dd HH:MM:SS'); // '2020-01-01 09:05:07'
 * formatDate(new Date(2020, 4, 1), 'YYYY QQQQ', 'en-US'); // '2020 Q2'
 */
export function formatDate(date: Date, format: string, locale: Locale = 'zh-CN'): string {
  const messages = getMessages(locale).date;
  const we = date.getDay(); // 星期
  const z = getWeek(date); // 周
  const qut = Math.floor((date.getMonth() + 3) / 3).toString(); // 季度
  const opt: { [key: string]: string } = {
    'Y+': date.getFullYear().toString(), // 年
    'm+': (date.getMonth() + 1).toString(), // 月(月份从0开始，要+1)
    'd+': date.getDate().toString(), // 日
    'H+': date.getHours().toString(), // 时
    'M+': date.getMinutes().toString(), // 分
    'S+': date.getSeconds().toString(), // 秒
    'q+': qut, // 季度
  };
  for (const k in opt) {
    // 若输入的长度不为1，则前面补零
    format = format.replace(new RegExp(`(${k})`), match =>
      match.length === 1 ? opt[k] : opt[k].padStart(match.length, '0'),
    );
  }
  // 星期 / 季度 / 周放在数字占位符之后替换，避免替换结果（如 Friday）被再次处理
  format = format.replace(/(W+)/, match => {
    const style = match.length > 2 ? 'full' : match.length > 1 ? 'short' : 'single';
    return messages.week(we, style);
  });
  format = format.replace(/(Q+)/, match => messages.quarter(Number(qut), match.length === 4 ? 'full' : 'single'));
  format = format.replace(/(Z+)/, match => messages.weekNumber(z, match.length === 3 ? 'full' : 'short'));
  return format;
}

/**
 * 获取当前日期是第几周（ISO-8601）
 * @param dateTime 当前传入的日期值
 * @returns 返回第几周数字值（1-53）
 * @example
 * getWeek(new Date(2024, 5, 15)); // 24
 */
export function getWeek(dateTime: Date): number {
  const date = new Date(Date.UTC(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate()));
  // 周一 = 1，周日 = 7
  const dayNum = date.getUTCDay() || 7;
  // 移动到本周的周四（ISO-8601 定义所在周由周四决定）
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * 将时间转换为 `几秒前`、`几分钟前`、`几小时前`、`几天前`，超过 3 天按 format 输出日期
 * @param param 当前时间，`Date` 或可被 `new Date()` 解析的字符串
 * @param format 超过 3 天时使用的日期格式，默认 `'YYYY-mm-dd'`
 * @param locale 语言包，默认 `'zh-CN'`
 * @returns 返回拼接后的时间字符串
 * @example
 * formatPast(new Date()); // '刚刚'
 * formatPast(new Date(Date.now() - 30000)); // '30秒前'
 * formatPast(new Date(Date.now() - 30000), 'YYYY-mm-dd', 'en-US'); // '30 seconds ago'
 */
export function formatPast(param: string | Date, format = 'YYYY-mm-dd', locale: Locale = 'zh-CN'): string {
  const messages = getMessages(locale).date;
  // 获取传入时间的时间戳
  const target = new Date(param).getTime();
  // 当前时间戳 - 传入时间戳
  const time = Number.parseInt(`${Date.now() - target}`);
  if (time < 10000) {
    // 10秒内
    return messages.justNow;
  }
  else if (time < 60000) {
    // 超过10秒少于1分钟内
    return messages.secondsAgo(Math.floor(time / 1000));
  }
  else if (time < 3600000) {
    // 超过1分钟少于1小时
    return messages.minutesAgo(Math.floor(time / 60000));
  }
  else if (time < 86400000) {
    // 超过1小时少于24小时
    return messages.hoursAgo(Math.floor(time / 3600000));
  }
  else if (time < 259200000) {
    // 超过1天少于3天内
    return messages.daysAgo(Math.floor(time / 86400000));
  }
  // 超过3天
  return formatDate(new Date(param), format, locale);
}

/**
 * 时间问候语
 * @param param 当前时间，`Date` 格式
 * @param locale 语言包，默认 `'zh-CN'`
 * @returns 返回拼接后的时间字符串
 * @example
 * formatAxis(new Date(2020, 0, 1, 10)); // '上午好'
 * formatAxis(new Date(2020, 0, 1, 10), 'en-US'); // 'Good morning'
 */
export function formatAxis(param: Date, locale: Locale = 'zh-CN'): string {
  const { greeting } = getMessages(locale).date;
  const hour = new Date(param).getHours();
  if (hour < 6) return greeting.dawn;
  if (hour < 9) return greeting.morning;
  if (hour < 12) return greeting.forenoon;
  if (hour < 14) return greeting.noon;
  if (hour < 17) return greeting.afternoon;
  if (hour < 19) return greeting.dusk;
  if (hour < 22) return greeting.evening;
  return greeting.night;
}

/**
 * 根据起始时间按间隔生成时间刻度列表。 [YYYY-MM-DD HH:mm:ss]
 * @param timeUnit 时间间隔（毫秒）
 * @param startDate 开始时间
 * @param endDate 结束时间
 * @returns 时间戳数组
 * @example
 * createTimeUnitListByTimeRange(1000, '2020-01-01 00:00:00', '2020-01-01 00:00:02').length; // 3
 */
export function createTimeUnitListByTimeRange(timeUnit: number, startDate: string, endDate: string) {
  const startSeconds = new Date(startDate).getTime();
  const endSeconds = new Date(endDate).getTime();

  const rangeTimeUnitList = [];
  let firstDegree = startSeconds;

  rangeTimeUnitList.push(firstDegree);

  // 当最后一个刻度大于截止时间，停止创建刻度数据
  while (firstDegree < endSeconds) {
    firstDegree += timeUnit;
    rangeTimeUnitList.push(firstDegree);
  }

  return rangeTimeUnitList;
}
