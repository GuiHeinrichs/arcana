import { describe, expect, test } from 'vitest';
import { formatCount, metricLabel } from '@/lib/top-cards';

describe('formatCount', () => {
  test('leaves values under 1000 as-is', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(842)).toBe('842');
  });
  test('compacts thousands with one decimal, trimming .0', () => {
    expect(formatCount(1000)).toBe('1k');
    expect(formatCount(128420)).toBe('128.4k');
  });
  test('compacts millions', () => {
    expect(formatCount(1000000)).toBe('1M');
    expect(formatCount(1500000)).toBe('1.5M');
  });
});

describe('metricLabel', () => {
  test('maps each lens to a short label', () => {
    expect(metricLabel('week')).toBe('views/sem');
    expect(metricLabel('views')).toBe('views');
    expect(metricLabel('likes')).toBe('likes');
    expect(metricLabel('staples')).toBe('views');
  });
});
