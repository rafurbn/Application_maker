/**
 * Bangla number and date formatting utilities
 */

const BANGLA_NUMBERS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const BANGLA_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const BANGLA_WORDS_MAP: Record<number, string> = {
  1: 'এক',
  2: 'দুই',
  3: 'তিন',
  4: 'চার',
  5: 'পাঁচ',
  6: 'ছয়',
  7: 'সাত',
  8: 'আট',
  9: 'নয়',
  10: 'দশ',
  11: 'এগারো',
  12: 'বারো',
  13: 'তেরো',
  14: 'চৌদ্দ',
  15: 'পনেরো',
  16: 'ষোলো',
  17: 'সতেরো',
  18: 'আঠারো',
  19: 'উনিশ',
  20: 'বিশ',
  21: 'একুশ',
  22: 'বাইশ',
  23: 'তেইশ',
  24: 'চব্বিশ',
  25: 'পঁচিশ',
  26: 'ছাব্বিশ',
  27: 'সাতাশ',
  28: 'আটাশ',
  29: 'উনত্রিশ',
  30: 'ত্রিশ',
  45: 'পঁয়তাল্লিশ',
  60: 'ষাট',
  90: 'নব্বই',
  120: 'একশত বিশ',
  180: 'একশত আশি',
  365: 'তিনশত পঁয়ষট্টি',
};

export function toBanglaNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '';
  return String(num).replace(/[0-9]/g, (digit) => BANGLA_NUMBERS[parseInt(digit, 10)] || digit);
}

export function toEnglishNumber(str: string): string {
  if (!str) return '';
  return str.replace(/[০-৯]/g, (char) => {
    const idx = BANGLA_NUMBERS.indexOf(char);
    return idx !== -1 ? String(idx) : char;
  });
}

export function getTodayISODate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date in DD/MM/YYYY in Bangla digits (e.g., ২২/১০/২০২৬)
 */
export function toBanglaNumericDate(isoDateString?: string): string {
  if (!isoDateString || !isoDateString.trim()) {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return toBanglaNumber(`${d}/${m}/${y}`);
  }

  const trimmed = isoDateString.trim();

  // If already formatted like DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(trimmed)) {
    const parts = trimmed.split(/[\/\-]/);
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[2];
    return toBanglaNumber(`${d}/${m}/${y}`);
  }

  // YYYY-MM-DD format (standard ISO date picker input)
  const parts = trimmed.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const [y, m, d] = parts;
    return toBanglaNumber(`${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`);
  }

  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return toBanglaNumber(`${day}/${month}/${year}`);
  }

  return toBanglaNumber(trimmed);
}

/**
 * Default toBanglaDate returns DD/MM/YYYY numeric format (e.g. ২২/১০/২০২৬) as requested
 */
export function toBanglaDate(isoDateString?: string): string {
  return toBanglaNumericDate(isoDateString);
}

export function toBanglaDateWords(isoDateString?: string): string {
  const d = isoDateString ? new Date(isoDateString) : new Date();
  if (isNaN(d.getTime())) return isoDateString || '';

  const day = toBanglaNumber(d.getDate());
  const month = BANGLA_MONTHS[d.getMonth()];
  const year = toBanglaNumber(d.getFullYear());

  return `${day} ${month} ${year}`;
}

export function formatDaysWithSuffix(rawDays: string | undefined, suffix: 'দিন' | 'দিনের' = 'দিন'): string {
  if (!rawDays || !rawDays.trim()) {
    return suffix === 'দিনের' ? '[দিনের সংখ্যা] দিনের' : '[দিনের সংখ্যা] দিন';
  }
  // Remove any trailing or duplicate 'দিন' / 'দিনের'
  const cleaned = rawDays.replace(/দিনের|দিন/g, '').trim();
  const banglaDigits = toBanglaNumber(cleaned);
  return `${banglaDigits} ${suffix}`;
}

/**
 * Intl throws RangeError on an invalid Date, which would blank an entire screen.
 * Timestamps read back from storage or from the server can be missing or malformed.
 */
export function toBanglaStamp(iso: string | undefined | null, withTime = false): string {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return '—';
  return withTime ? date.toLocaleTimeString('bn-BD') : date.toLocaleDateString('bn-BD');
}

export function calculateBanglaDuration(startDateStr: string, endDateStr: string): { days: number; text: string } {
  if (!startDateStr || !endDateStr) {
    return { days: 0, text: '' };
  }

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return { days: 0, text: '' };
  }

  // Inclusive duration
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const banglaDigits = toBanglaNumber(diffDays);
  const inWords = BANGLA_WORDS_MAP[diffDays] || `${banglaDigits}`;

  return {
    days: diffDays,
    text: `${banglaDigits} (${inWords}) দিন`,
  };
}
