import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { BANGLA_MONTHS, getTodayISODate, toBanglaDate, toBanglaNumber } from '../utils/banglaUtils';

const ISO_DATE = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
const WEEKDAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];

function daysIn(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function split(iso: string): { year: number; month: number; day: number } {
  const match = ISO_DATE.exec(iso || '');
  const today = getTodayISODate();
  const year = match ? Number(match[1]) : Number(today.slice(0, 4));
  const month = match ? Number(match[2]) : Number(today.slice(5, 7));
  const day = match ? Number(match[3]) : Number(today.slice(8, 10));
  return { year, month, day: Math.min(day, daysIn(year, month)) };
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(Math.min(day, daysIn(year, month))).padStart(2, '0')}`;
}

/**
 * The browser's own date picker prints in whatever order its locale prefers —
 * month/day/year on almost every phone our users hold — and no attribute changes
 * that. This is a picker of ours: it opens a calendar like the native one did,
 * but the field and the grid always read দিন/মাস/বছর in Bangla numerals.
 * The value handed back stays ISO, so the automatic day count keeps working.
 */
export const DateField: React.FC<{ value: string; onChange: (iso: string) => void }> = ({
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => split(value));
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const picked = split(value);
  const { year, month } = cursor;
  const total = daysIn(year, month);
  const leading = new Date(year, month - 1, 1).getDay();
  const cells: (number | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];

  const moveMonth = (step: number) => {
    const nextMonth = month + step;
    if (nextMonth < 1) setCursor({ year: year - 1, month: 12, day: 1 });
    else if (nextMonth > 12) setCursor({ year: year + 1, month: 1, day: 1 });
    else setCursor({ year, month: nextMonth, day: 1 });
  };

  const choose = (day: number) => {
    onChange(toIso(year, month, day));
    setOpen(false);
  };

  const navButton =
    'p-1 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-600';

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setCursor(split(value));
          setOpen((prev) => !prev);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
      >
        <span className={value ? '' : 'text-slate-400'}>
          {value ? toBanglaDate(value) : 'দিন/মাস/বছর'}
        </span>
        <CalendarDays className="w-4 h-4 text-emerald-700 shrink-0" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="তারিখ বাছুন"
          className="absolute z-40 mt-1 w-64 sm:w-72 p-2.5 rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="flex items-center justify-between gap-1 mb-2">
            <button type="button" className={navButton} aria-label="পূর্ববর্তী মাস" onClick={() => moveMonth(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 flex-1 justify-center">
              <select
                aria-label="মাস"
                value={month}
                onChange={(e) => setCursor({ year, month: Number(e.target.value), day: 1 })}
                className="px-1.5 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              >
                {BANGLA_MONTHS.map((name, i) => (
                  <option key={name} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                aria-label="বছর"
                value={year}
                onChange={(e) => setCursor({ year: Number(e.target.value), month, day: 1 })}
                className="px-1.5 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              >
                {Array.from({ length: 62 }, (_, i) => new Date().getFullYear() + 1 - i).map((y) => (
                  <option key={y} value={y}>
                    {toBanglaNumber(String(y))}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className={navButton} aria-label="পরবর্তী মাস" onClick={() => moveMonth(1)}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-[10px] text-slate-500 py-0.5">
                {d}
              </div>
            ))}
            {cells.map((day, index) =>
              day === null ? (
                <div key={`blank-${index}`} />
              ) : (
                <button
                  key={day}
                  type="button"
                  onClick={() => choose(day)}
                  aria-pressed={
                    value !== '' && day === picked.day && month === picked.month && year === picked.year
                  }
                  className={`h-7 rounded-lg text-xs ${
                    value !== '' && day === picked.day && month === picked.month && year === picked.year
                      ? 'bg-emerald-700 text-white font-semibold'
                      : 'text-slate-800 hover:bg-emerald-50'
                  }`}
                >
                  {toBanglaNumber(String(day))}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              const today = getTodayISODate();
              onChange(today);
              setCursor(split(today));
              setOpen(false);
            }}
            className="mt-2 w-full py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
          >
            আজকের তারিখ
          </button>
        </div>
      )}
    </div>
  );
};
