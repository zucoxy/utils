import { describe, expect, it } from 'vitest';
import { type Locale, enUS, getMessages, locales, zhCN } from '../src/locale';

describe('locale 语言包', () => {
  it('内置 zh-CN / en-US', () => {
    expect(Object.keys(locales)).toEqual(['zh-CN', 'en-US']);
    expect(zhCN.date.justNow).toBe('刚刚');
    expect(enUS.date.justNow).toBe('just now');
  });

  it('getMessages 默认中文，未知语言回退中文', () => {
    const unknownLocale = 'fr-FR' as unknown as Locale;
    expect(getMessages().date.justNow).toBe('刚刚');
    expect(getMessages('en-US').date.justNow).toBe('just now');
    expect(getMessages(unknownLocale).date.justNow).toBe('刚刚');
  });

  it('week / weekNumber / quarter 文案', () => {
    expect(zhCN.date.week(1, 'full')).toBe('星期一');
    expect(zhCN.date.week(1, 'short')).toBe('周一');
    expect(enUS.date.week(1, 'short')).toBe('Mon');
    expect(enUS.date.week(1, 'full')).toBe('Monday');
    expect(zhCN.date.weekNumber(23, 'full')).toBe('第23周');
    expect(enUS.date.weekNumber(23, 'full')).toBe('Week 23');
    expect(zhCN.date.quarter(2, 'full')).toBe('第二季度');
    expect(enUS.date.quarter(2, 'full')).toBe('Q2');
  });
});
