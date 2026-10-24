import { beforeEach, describe, expect, it } from 'vitest';
import { ALL_TEMPLATES, getDefaultFormData } from '../../data/templates';
import {
  DATA_SCHEMA_VERSION,
  deleteSavedApplication,
  eraseDeviceData,
  exportBackup,
  getSavedApplications,
  importBackup,
  newId,
  readIdentity,
  readPreferences,
  rememberFields,
  applyRememberedFields,
  saveApplicationLocally,
  writePreferences,
} from '../storage';

let failingWrites = 0;

function installMemoryStorage() {
  failingWrites = 0;
  const data: Record<string, string> = {};
  const api = {
    getItem: (key: string) => (key in data ? data[key] : null),
    setItem: (key: string, value: string) => {
      if (failingWrites > 0) {
        failingWrites -= 1;
        throw new Error('QuotaExceededError');
      }
      data[key] = String(value);
    },
    removeItem: (key: string) => void delete data[key],
    clear: () => {
      for (const key of Object.keys(data)) delete data[key];
    },
    key: (index: number) => Object.keys(data)[index] ?? null,
  };

  // Real localStorage exposes every stored key as an own property, and the app
  // scans it with Object.keys(localStorage) — so the stub has to behave the same.
  const stub = new Proxy(api, {
    get: (target, prop) => {
      if (prop in target) return (target as Record<string, unknown>)[prop as string];
      if (prop === 'length') return Object.keys(data).length;
      return prop in data ? data[prop as string] : undefined;
    },
    ownKeys: () => Object.keys(data),
    getOwnPropertyDescriptor: (target, prop) => {
      if (typeof prop === 'string' && prop in data) {
        return { configurable: true, enumerable: true, writable: true, value: data[prop] };
      }
      return Object.getOwnPropertyDescriptor(target, prop);
    },
  });

  Object.defineProperty(globalThis, 'localStorage', { value: stub, configurable: true, writable: true });
  return data;
}

/** Turns every later write into a storage-full error. */
function breakWrites() {
  const stub = localStorage as unknown as { setItem: (k: string, v: string) => void };
  stub.setItem = () => {
    throw new Error('QuotaExceededError');
  };
}

const casualLeave = ALL_TEMPLATES.find((t) => t.id === 'casual_leave')!;

const sample = {
  formatId: 'casual_leave' as const,
  formatTitle: 'কাজের অবসর ছুটি',
  category: 'employee' as const,
  applicantName: 'মোঃ রফিকুল ইসলাম',
  workplace: 'গোপালগঞ্জ প্রাথমিক বিদ্যালয়',
  subject: '৩ দিনের ছুটি',
  data: { ...getDefaultFormData(casualLeave), applicantName: 'মোঃ রফিকুল ইসলাম' },
};

beforeEach(() => installMemoryStorage());

describe('newId', () => {
  it('gives every call a different id', () => {
    expect(new Set(Array.from({ length: 200 }, () => newId())).size).toBe(200);
  });
});

describe('saved applications', () => {
  it('stores newest first and reads back', () => {
    saveApplicationLocally(sample);
    saveApplicationLocally({ ...sample, subject: '৫ দিনের ছুটি' });
    const all = getSavedApplications();
    expect(all).toHaveLength(2);
    expect(all[0].subject).toBe('৫ দিনের ছুটি');
  });

  it('deletes only the chosen row', () => {
    saveApplicationLocally(sample);
    const [first] = getSavedApplications();
    saveApplicationLocally({ ...sample, subject: 'আরেকটি' });
    expect(deleteSavedApplication(first.id)).toHaveLength(1);
    expect(getSavedApplications()).toHaveLength(1);
  });

  it('drops the oldest entry instead of losing the new one when storage is full', () => {
    saveApplicationLocally(sample);
    saveApplicationLocally({ ...sample, subject: 'দ্বিতীয়' });
    failingWrites = 1;
    const result = saveApplicationLocally({ ...sample, subject: 'নতুন' });
    expect(result.ok).toBe(true);
    expect(result.reason).toBe('quota');
    expect(getSavedApplications()[0].subject).toBe('নতুন');
  });

  it('reports failure honestly when nothing can be stored', () => {
    breakWrites();
    expect(saveApplicationLocally(sample)).toEqual({ ok: false, reason: 'unavailable' });
  });
});

describe('preferences', () => {
  it('merges partial writes and survives a reload', () => {
    writePreferences({ theme: 'navy' });
    const prefs = readPreferences();
    expect(prefs.theme).toBe('navy');
    expect(prefs.globalDesignation).toBe('সহকারী শিক্ষক');
  });
});

describe('identity', () => {
  it('keeps the same anonymous id across calls', () => {
    const first = readIdentity();
    expect(readIdentity().uid).toBe(first.uid);
  });
});

describe('backup', () => {
  it('round-trips applications and ignores duplicates', () => {
    saveApplicationLocally(sample);
    saveApplicationLocally({ ...sample, subject: 'দ্বিতীয়' });
    const bundle = exportBackup();
    expect(bundle.schemaVersion).toBe(DATA_SCHEMA_VERSION);

    expect(importBackup(JSON.stringify(bundle))).toEqual({ ok: true, added: 0 });

    localStorage.removeItem('bangla_app_saved_applications_v1');
    expect(importBackup(JSON.stringify(bundle))).toEqual({ ok: true, added: 2 });
    expect(getSavedApplications()).toHaveLength(2);
  });

  it('rejects a file that is not a backup', () => {
    expect(importBackup('not json').ok).toBe(false);
    expect(importBackup(JSON.stringify({ hello: 'world' })).ok).toBe(false);
  });
});

describe('eraseDeviceData', () => {
  it('wipes application data, preferences, legacy counters and heartbeats', () => {
    saveApplicationLocally(sample);
    writePreferences({ theme: 'cyber' });
    localStorage.setItem('live_user_abc', '1');
    localStorage.setItem('visitor_day_2026-10-22', '1');
    localStorage.setItem('template_count_casual_leave', '4');
    localStorage.setItem('app_generation_stats', '[]');
    localStorage.setItem('somebody_elses_key', 'keep me');

    eraseDeviceData();

    expect(getSavedApplications()).toEqual([]);
    expect(readPreferences().theme).toBe('executive');
    expect(localStorage.getItem('live_user_abc')).toBeNull();
    expect(localStorage.getItem('visitor_day_2026-10-22')).toBeNull();
    expect(localStorage.getItem('template_count_casual_leave')).toBeNull();
    expect(localStorage.getItem('app_generation_stats')).toBeNull();
    expect(localStorage.getItem('somebody_elses_key')).toBe('keep me');
  });
});

describe('remembered fields', () => {
  it('keeps what the writer typed and prefills the next application', () => {
    rememberFields({ applicantName: 'মোঃ রফিকুল ইসলাম', workplace: 'কালাইউরা সরকারি প্রাথমিক বিদ্যালয়' });
    const next = applyRememberedFields(getDefaultFormData(casualLeave));

    expect(next.applicantName).toBe('মোঃ রফিকুল ইসলাম');
    expect(next.workplace).toBe('কালাইউরা সরকারি প্রাথমিক বিদ্যালয়');
  });

  it('never remembers the parts that belong to one application', () => {
    rememberFields({ date: '2026-01-01', subject: 'ছুটি', totalDays: '৫ দিন', applicantName: 'রফিক' });
    const stored = readPreferences().remembered;

    expect(stored).toEqual({ applicantName: 'রফিক' });
  });

  it('drops a value the user cleared', () => {
    rememberFields({ mobile: '০১৭১১-১১২২৩৩' });
    rememberFields({ mobile: '' });
    const next = applyRememberedFields({ ...getDefaultFormData(casualLeave), mobile: 'ধরা তথ্য' });

    expect(next.mobile).toBe('ধরা তথ্য');
  });
});
