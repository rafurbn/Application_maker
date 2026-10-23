// Thin PostgREST/Edge-Function client for the usage counter.
// Deliberately fetch-based (no SDK) to keep the bundle small, and deliberately
// optional: when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are absent the app
// stays 100% local and every call resolves as a no-op.

/**
 * Supabase hands out the project ref and the full URL in different places, and a
 * bare ref used to be concatenated into a relative request that 404s against our
 * own domain — so a ref alone is corrected, and anything that is not an https
 * origin turns remote mode off instead of failing silently on every heartbeat.
 */
export function resolveSupabaseUrl(raw: string | undefined): string | undefined {
  const value = raw?.trim().replace(/\/+$/, '');
  if (!value) return undefined;
  if (/^[a-z0-9]{8,20}$/i.test(value)) return `https://${value}.supabase.co`;
  return /^https:\/\//i.test(value) ? value : undefined;
}

const RAW_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_URL = resolveSupabaseUrl(RAW_SUPABASE_URL);
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isRemoteAnalyticsEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Configured, but not usable — the admin panel says so instead of showing zeros. */
export const isRemoteAnalyticsMisconfigured = Boolean(RAW_SUPABASE_URL?.trim() && !SUPABASE_URL);

export interface Heartbeat {
  uid: string;
  /** Device-local calendar date (YYYY-MM-DD) — matches the server's Asia/Dhaka day for BD users. */
  day: string;
  dayGenerations: number;
  templateId: string;
  templateTitle: string;
  category: 'employee' | 'student';
  totalGenerations: number;
  perTemplate: Record<string, number>;
}

export interface AdminStats {
  liveUsers: number;
  usersToday: number;
  totalUsers: number;
  totalGenerations: number;
  generationsToday: number;
  popularFormats: { templateId: string; count: number }[];
  lastUpdated: string;
}

const TITLE_FALLBACK = 'অজানা ফরম্যাট';

export async function sendHeartbeat(payload: Heartbeat): Promise<boolean> {
  if (!isRemoteAnalyticsEnabled || !SUPABASE_URL || !SUPABASE_ANON_KEY) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/app_activity`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        uid: payload.uid,
        day: payload.day,
        day_generations: payload.dayGenerations,
        last_template_id: payload.templateId,
        last_template_title: payload.templateTitle || TITLE_FALLBACK,
        last_category: payload.category,
        total_generations: payload.totalGenerations,
        per_template: payload.perTemplate,
      }),
      signal: controller.signal,
    });
    return res.ok;
  } catch (err) {
    console.error('Analytics heartbeat skipped', err);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchAdminStats(token: string): Promise<AdminStats> {
  if (!isRemoteAnalyticsEnabled || !SUPABASE_URL) {
    throw new Error('রেমোট পরিসংখ্যান এখনো চালু নয়।');
  }
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-stats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': token,
      ...(SUPABASE_ANON_KEY
        ? { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
        : {}),
    },
    body: JSON.stringify({}),
  });
  if (res.status === 401 || res.status === 403) throw new Error('ভুল অ্যাডমিন টোকেন।');
  if (!res.ok) throw new Error('পরিসংখ্যান আনা যায়নি।');
  return (await res.json()) as AdminStats;
}

export function analyticsStatus(): { enabled: boolean; note: string } {
  return isRemoteAnalyticsEnabled
    ? { enabled: true, note: 'সুপাবেজ সংযুক্ত — কারেন্ট লাইভ/ইউজার গণনা সার্ভার থেকে আসছে।' }
    : {
        enabled: false,
        note: 'সুপাবেজ সংযুক্ত নয়: নিচের সংখ্যাগুলো শুধু এই ডিভাইসের এবং এই ব্রাউজারের।',
      };
}
