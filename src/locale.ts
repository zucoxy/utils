/**
 * 内置语言标识
 * - `zh-CN`：简体中文（默认）
 * - `en-US`：英文
 */
export type Locale = 'zh-CN' | 'en-US';

/** 星期展示样式：`single` = 一，`short` = 周一 / Mon，`full` = 星期一 / Monday */
export type WeekStyle = 'single' | 'short' | 'full';

/** 季度展示样式：`single` = 一 / Q1，`full` = 第一季度 / Q1 */
export type QuarterStyle = 'single' | 'full';

/** 日期相关的文案集合 */
export interface DateMessages {
  /** 10 秒内 */
  justNow: string;
  /** 秒前 */
  secondsAgo: (seconds: number) => string;
  /** 分钟前 */
  minutesAgo: (minutes: number) => string;
  /** 小时前 */
  hoursAgo: (hours: number) => string;
  /** 天前 */
  daysAgo: (days: number) => string;
  /** 时间段问候语 */
  greeting: {
    dawn: string;
    morning: string;
    forenoon: string;
    noon: string;
    afternoon: string;
    dusk: string;
    evening: string;
    night: string;
  };
  /** 星期文案，day 为 `Date#getDay()` 的取值（0 = 周日） */
  week: (day: number, style: WeekStyle) => string;
  /** 第几周文案：`full` = 第23周 / Week 23，`short` = 23 */
  weekNumber: (week: number, style: 'full' | 'short') => string;
  /** 季度文案，quarter 取值 1-4 */
  quarter: (quarter: number, style: QuarterStyle) => string;
}

/** 语言包结构，后续可扩展更多模块文案 */
export interface LocaleMessages {
  date: DateMessages;
}

/** 简体中文语言包 */
export const zhCN: LocaleMessages = {
  date: {
    justNow: '刚刚',
    secondsAgo: seconds => `${seconds}秒前`,
    minutesAgo: minutes => `${minutes}分钟前`,
    hoursAgo: hours => `${hours}小时前`,
    daysAgo: days => `${days}天前`,
    greeting: {
      dawn: '凌晨好',
      morning: '早上好',
      forenoon: '上午好',
      noon: '中午好',
      afternoon: '下午好',
      dusk: '傍晚好',
      evening: '晚上好',
      night: '夜里好',
    },
    week: (day, style) => {
      const name = ['日', '一', '二', '三', '四', '五', '六'][day] ?? '';
      if (style === 'full') return `星期${name}`;
      if (style === 'short') return `周${name}`;
      return name;
    },
    weekNumber: (week, style) => (style === 'full' ? `第${week}周` : `${week}`),
    quarter: (quarter, style) => {
      const name = ['一', '二', '三', '四'][quarter - 1] ?? '';
      return style === 'full' ? `第${name}季度` : name;
    },
  },
};

/** 英文语言包 */
export const enUS: LocaleMessages = {
  date: {
    justNow: 'just now',
    secondsAgo: seconds => `${seconds} second${seconds === 1 ? '' : 's'} ago`,
    minutesAgo: minutes => `${minutes} minute${minutes === 1 ? '' : 's'} ago`,
    hoursAgo: hours => `${hours} hour${hours === 1 ? '' : 's'} ago`,
    daysAgo: days => `${days} day${days === 1 ? '' : 's'} ago`,
    greeting: {
      dawn: 'Good early morning',
      morning: 'Good morning',
      forenoon: 'Good morning',
      noon: 'Good noon',
      afternoon: 'Good afternoon',
      dusk: 'Good evening',
      evening: 'Good evening',
      night: 'Good night',
    },
    week: (day, style) => {
      const full = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const short = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      if (style === 'short') return short[day] ?? '';
      if (style === 'single') return (full[day] ?? '').charAt(0);
      return full[day] ?? '';
    },
    weekNumber: (week, style) => (style === 'full' ? `Week ${week}` : `${week}`),
    quarter: quarter => `Q${quarter}`,
  },
};

/** 全部内置语言包 */
export const locales: Record<Locale, LocaleMessages> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

/**
 * 获取指定语言的文案，未知语言回退到简体中文
 * @param locale 语言标识，默认 `'zh-CN'`
 * @example
 * getMessages().date.justNow; // '刚刚'
 * getMessages('en-US').date.justNow; // 'just now'
 */
export const getMessages = (locale: Locale = 'zh-CN'): LocaleMessages => locales[locale] ?? zhCN;
