import { describe, expect, it } from 'vitest';
import { createTimeUnitListByTimeRange, formatAxis, formatDate, formatPast, getWeek } from '../src/date';

describe('formatDate', () => {
  it('格式化 YYYY-mm-dd HH:MM:SS 并补零', () => {
    expect(formatDate(new Date(2020, 0, 1, 9, 5, 7), 'YYYY-mm-dd HH:MM:SS')).toBe('2020-01-01 09:05:07');
  });

  it('支持季度占位符 QQQQ', () => {
    expect(formatDate(new Date(2020, 4, 1), 'YYYY QQQQ')).toBe('2020 第二季度');
  });
});

describe('getWeek', () => {
  it('按 ISO-8601 返回周数', () => {
    expect(getWeek(new Date(2024, 5, 15))).toBe(24);
  });
});

describe('formatPast', () => {
  it('刚刚', () => {
    expect(formatPast(new Date())).toBe('刚刚');
  });

  it('秒/分钟/小时/天前', () => {
    expect(formatPast(new Date(Date.now() - 30000))).toBe('30秒前');
    expect(formatPast(new Date(Date.now() - 5 * 60000))).toBe('5分钟前');
    expect(formatPast(new Date(Date.now() - 2 * 3600000))).toBe('2小时前');
    expect(formatPast(new Date(Date.now() - 2 * 86400000))).toBe('2天前');
  });

  it('超过 3 天按 format 输出日期', () => {
    expect(formatPast(new Date(2020, 0, 1), 'YYYY')).toBe('2020');
  });
});

describe('formatAxis', () => {
  it('按小时返回问候语', () => {
    expect(formatAxis(new Date(2020, 0, 1, 5))).toBe('凌晨好');
    expect(formatAxis(new Date(2020, 0, 1, 8))).toBe('早上好');
    expect(formatAxis(new Date(2020, 0, 1, 10))).toBe('上午好');
    expect(formatAxis(new Date(2020, 0, 1, 13))).toBe('中午好');
    expect(formatAxis(new Date(2020, 0, 1, 15))).toBe('下午好');
    expect(formatAxis(new Date(2020, 0, 1, 18))).toBe('傍晚好');
    expect(formatAxis(new Date(2020, 0, 1, 20))).toBe('晚上好');
    expect(formatAxis(new Date(2020, 0, 1, 23))).toBe('夜里好');
  });
});

describe('createTimeUnitListByTimeRange', () => {
  it('按间隔生成时间刻度', () => {
    const list = createTimeUnitListByTimeRange(1000, '2020-01-01 00:00:00', '2020-01-01 00:00:02');
    expect(list).toHaveLength(3);
    expect(list[1] - list[0]).toBe(1000);
  });
});

describe('date 多语言', () => {
  it('formatPast 支持 en-US，默认中文', () => {
    expect(formatPast(new Date(Date.now() - 30000), 'YYYY-mm-dd', 'en-US')).toBe('30 seconds ago');
    expect(formatPast(new Date())).toBe('刚刚');
  });

  it('formatAxis 支持 en-US', () => {
    expect(formatAxis(new Date(2020, 0, 1, 10), 'en-US')).toBe('Good morning');
    expect(formatAxis(new Date(2020, 0, 1, 10))).toBe('上午好');
  });

  it('formatDate 星期/季度/周支持 en-US', () => {
    // 2020-05-01 是周五，第二季度
    expect(formatDate(new Date(2020, 4, 1), 'WWW', 'en-US')).toBe('Friday');
    expect(formatDate(new Date(2020, 4, 1), 'WWW')).toBe('星期五');
    expect(formatDate(new Date(2020, 4, 1), 'YYYY QQQQ', 'en-US')).toBe('2020 Q2');
    expect(formatDate(new Date(2020, 4, 1), 'YYYY QQQQ')).toBe('2020 第二季度');
  });
});
