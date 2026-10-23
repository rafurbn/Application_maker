import { describe, expect, it } from 'vitest';
import {
  calculateBanglaDuration,
  formatDaysWithSuffix,
  toBanglaDateWords,
  toBanglaNumber,
  toBanglaNumericDate,
  toEnglishNumber,
} from '../banglaUtils';

describe('toBanglaNumber / toEnglishNumber', () => {
  it('converts ascii digits to bangla digits', () => {
    expect(toBanglaNumber(2026)).toBe('২০২৬');
    expect(toBanglaNumber('Roll 12')).toBe('Roll ১২');
    expect(toBanglaNumber(null)).toBe('');
    expect(toBanglaNumber(undefined)).toBe('');
  });

  it('converts bangla digits back to ascii', () => {
    expect(toEnglishNumber('২০২৬')).toBe('2026');
    expect(toEnglishNumber('০৫')).toBe('05');
    expect(toEnglishNumber('')).toBe('');
  });
});

describe('toBanglaNumericDate', () => {
  it('formats ISO dates as DD/MM/YYYY with bangla digits', () => {
    expect(toBanglaNumericDate('2026-10-22')).toBe('২২/১০/২০২৬');
  });

  it('accepts already slashed dates', () => {
    expect(toBanglaNumericDate('5/3/2026')).toBe('০৫/০৩/২০২৬');
  });

  it('falls back to the current day when empty', () => {
    expect(toBanglaNumericDate('')).toMatch(/^[০-৯]{2}\/[০-৯]{2}\/[০-৯]{4}$/);
  });
});

describe('toBanglaDateWords', () => {
  it('writes the month in bangla', () => {
    expect(toBanglaDateWords('2026-10-22')).toBe('২২ অক্টোবর ২০২৬');
  });
});

describe('formatDaysWithSuffix', () => {
  it('keeps a single suffix and bangla digits', () => {
    expect(formatDaysWithSuffix('5 দিন')).toBe('৫ দিন');
    expect(formatDaysWithSuffix('3', 'দিনের')).toBe('৩ দিনের');
  });

  it('shows a bracketed hint when nothing is typed', () => {
    expect(formatDaysWithSuffix('')).toContain('[দিনের সংখ্যা]');
  });
});

describe('calculateBanglaDuration', () => {
  it('counts both endpoints inclusively', () => {
    const result = calculateBanglaDuration('2026-10-01', '2026-10-03');
    expect(result.days).toBe(3);
    expect(result.text).toBe('৩ (তিন) দিন');
  });

  it('refuses reversed or missing dates instead of printing nonsense', () => {
    expect(calculateBanglaDuration('2026-10-05', '2026-10-01')).toEqual({ days: 0, text: '' });
    expect(calculateBanglaDuration('', '2026-10-01')).toEqual({ days: 0, text: '' });
  });
});
