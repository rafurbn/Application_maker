import { SavedApplication, ApplicationFormData, SubCategoryType, DashboardTheme } from '../types';

const STORAGE_KEY = 'bangla_app_saved_applications_v1';
const PREFS_KEY = 'bangla_app_prefs_v1';
const IDENTITY_KEY = 'bangla_app_identity_v1';
export const STATS_KEY = 'bangla_app_stats_v1';

export interface LocalStatsSnapshot {
  totalGenerations: number;
  perTemplate: Record<string, { title: string; category: 'employee' | 'student'; count: number }>;
  perDay: Record<string, number>;
  daysVisited: string[];
  firstSeenAt: string;
}

export const DATA_SCHEMA_VERSION = 1;

export interface SaveResult {
  ok: boolean;
  reason?: 'saved' | 'quota' | 'unavailable';
}

export interface Preferences {
  theme: DashboardTheme;
  globalDesignation: string;
  /** Values the writer types again and again — see REMEMBERED_FIELDS. */
  remembered: Record<string, string>;
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'executive',
  globalDesignation: 'সহকারী শিক্ষক',
  remembered: {},
};

function safeRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* storage unavailable */
  }
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getSavedApplications(): SavedApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedApplication[]) : [];
  } catch (e) {
    console.error('Failed to read saved applications', e);
    return [];
  }
}

export function saveApplicationLocally(item: {
  formatId: SubCategoryType;
  formatTitle: string;
  category: 'employee' | 'student';
  applicantName: string;
  workplace: string;
  subject: string;
  data: ApplicationFormData;
}): SaveResult {
  const newEntry: SavedApplication = {
    id: newId(),
    formatId: item.formatId,
    formatTitle: item.formatTitle,
    category: item.category,
    applicantName: item.applicantName,
    workplace: item.workplace,
    subject: item.subject,
    data: item.data,
    savedAt: new Date().toISOString(),
  };

  const existing = getSavedApplications();
  let updated = [newEntry, ...existing];

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { ok: true, reason: attempt === 0 ? 'saved' : 'quota' };
    } catch (e) {
      console.error('Failed to save application', e);
      if (updated.length <= 1) return { ok: false, reason: 'unavailable' };
      // Storage is full: drop the oldest entry and retry, so the new one is never lost silently.
      updated = updated.slice(0, updated.length - 1);
    }
  }
  return { ok: false, reason: 'unavailable' };
}

export function deleteSavedApplication(id: string): SavedApplication[] {
  const filtered = getSavedApplications().filter((app) => app.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete application', e);
  }
  return filtered;
}

export function readPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function writePreferences(patch: Partial<Preferences>): Preferences {
  const next = { ...readPreferences(), ...patch };
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  } catch (e) {
    console.error('Failed to store preferences', e);
  }
  return next;
}

/**
 * A teacher writes nearly the same application every week, so the fields that
 * identify the writer are kept on the device and pre-filled next time. Dates,
 * subject, leave reasons and day counts are deliberately left out — those belong
 * to the one application being written, and pre-filling them would print a stale
 * value that looks as if the user typed it.
 */
export const REMEMBERED_FIELDS: (keyof ApplicationFormData)[] = [
  'applicantName',
  'customDesignation',
  'workplace',
  'organization',
  'upazilaOrArea',
  'district',
  'mobile',
  'fatherOrGuardianName',
  'studentClass',
  'rollNumber',
];

export function rememberFields(fields: Partial<ApplicationFormData>) {
  const patch: Record<string, string> = {};
  for (const key of REMEMBERED_FIELDS) {
    const value = fields[key];
    if (typeof value === 'string') patch[key] = value.trim();
  }
  if (Object.keys(patch).length === 0) return;
  const prefs = readPreferences();
  writePreferences({ remembered: { ...prefs.remembered, ...patch } });
}

export function applyRememberedFields(data: ApplicationFormData): ApplicationFormData {
  const remembered = readPreferences().remembered;
  const next = { ...data } as Record<string, unknown>;
  for (const key of REMEMBERED_FIELDS) {
    const value = remembered[key];
    if (typeof value === 'string' && value !== '') next[key] = value;
  }
  return next as unknown as ApplicationFormData;
}

export interface Identity {
  uid: string;
  firstSeenAt: string;
}

export function readIdentity(): Identity {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Identity;
      if (parsed && typeof parsed.uid === 'string' && parsed.uid.length >= 8) {
        return { uid: parsed.uid, firstSeenAt: parsed.firstSeenAt || new Date().toISOString() };
      }
    }
  } catch {
    /* fall through and regenerate */
  }
  const created: Identity = { uid: newId(), firstSeenAt: new Date().toISOString() };
  try {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(created));
  } catch {
    /* private mode: keep the in-memory uid for this session */
  }
  return created;
}

export interface BackupBundle {
  schemaVersion: number;
  exportedAt: string;
  applications: SavedApplication[];
  preferences: Preferences;
}

export function exportBackup(): BackupBundle {
  return {
    schemaVersion: DATA_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    applications: getSavedApplications(),
    preferences: readPreferences(),
  };
}

export function importBackup(rawJson: string): { ok: boolean; added: number; reason?: string } {
  let parsed: BackupBundle;
  try {
    parsed = JSON.parse(rawJson) as BackupBundle;
  } catch {
    return { ok: false, added: 0, reason: 'এই ফাইলটি সঠিক JSON ব্যাকআপ নয়।' };
  }
  if (!parsed || !Array.isArray(parsed.applications)) {
    return { ok: false, added: 0, reason: 'ব্যাকআপ ফাইলে সংরক্ষিত দরখাস্ত পাওয়া যায়নি।' };
  }

  const current = getSavedApplications();
  const seen = new Set(current.map((app) => app.id));
  const incoming = parsed.applications.filter(
    (app) => app && typeof app.id === 'string' && !seen.has(app.id),
  );

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...incoming, ...current]));
  } catch (e) {
    console.error('Failed to import backup', e);
    return { ok: false, added: 0, reason: 'ব্রাউজার স্টোরেজ পূর্ণ — আগে কিছু দরখাস্ত মুছে ফেলুন।' };
  }
  writePreferences(parsed.preferences || DEFAULT_PREFERENCES);
  return { ok: true, added: incoming.length };
}

/** Removes everything this app stored on this device. The anonymous id is wiped too. */
export function eraseDeviceData() {
  safeRemove(STORAGE_KEY);
  safeRemove(PREFS_KEY);
  safeRemove(IDENTITY_KEY);
  analyticsResetLocal();
  Object.keys(localStorage)
    .filter(
      (key) =>
        key.startsWith('bangla_app_') ||
        key.startsWith('live_user_') ||
        key.startsWith('visitor_day_') ||
        key.startsWith('template_count_') ||
        key.startsWith('anon_user_') ||
        LEGACY_KEYS.includes(key),
    )
    .forEach(safeRemove);
}

const LEGACY_KEYS = [
  'app_generation_stats',
  'total_generated_count',
  'total_unique_visitors',
  'admin_authenticated',
  'admin_custom_password',
];

export function analyticsResetLocal() {
  safeRemove(STATS_KEY);
  LEGACY_KEYS.filter((key) => key !== 'admin_authenticated').forEach(safeRemove);
  Object.keys(localStorage)
    .filter((key) => key.startsWith('template_count_') || key.startsWith('visitor_day_'))
    .forEach(safeRemove);
}
