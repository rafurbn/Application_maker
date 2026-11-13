import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveSupabaseUrl } from './analytics';

const SAMPLE_HEARTBEAT = {
  uid: 'anon_12345678',
  day: '2026-11-13',
  dayGenerations: 2,
  templateId: 'casual_leave',
  templateTitle: 'নৈমিত্তিক ছুটি',
  category: 'employee' as const,
  totalGenerations: 5,
  perTemplate: { casual_leave: 5 },
};

describe('resolveSupabaseUrl', () => {
  it('keeps a correct https project url', () => {
    expect(resolveSupabaseUrl('https://abc123def456.supabase.co')).toBe('https://abc123def456.supabase.co');
    expect(resolveSupabaseUrl('https://abc123def456.supabase.co/')).toBe('https://abc123def456.supabase.co');
  });

  it('repairs a bare project ref pasted from the dashboard', () => {
    expect(resolveSupabaseUrl('mkvlnjvugagellaawxjz')).toBe('https://mkvlnjvugagellaawxjz.supabase.co');
  });

  it('refuses anything that would become a relative request against our own domain', () => {
    expect(resolveSupabaseUrl('http://insecure.example.com')).toBeUndefined();
    expect(resolveSupabaseUrl('supabase.co')).toBeUndefined();
    expect(resolveSupabaseUrl('   ')).toBeUndefined();
    expect(resolveSupabaseUrl(undefined)).toBeUndefined();
  });
});

describe('remote analytics client', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('sends heartbeats via record_heartbeat RPC with keepalive', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://demo12345678.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    vi.resetModules();

    const { sendHeartbeat } = await import('./analytics');
    const ok = await sendHeartbeat(SAMPLE_HEARTBEAT, { keepalive: true });

    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://demo12345678.supabase.co/rest/v1/rpc/record_heartbeat');
    expect(init.keepalive).toBe(true);
    expect(JSON.parse(init.body)).toMatchObject({
      p_uid: 'anon_12345678',
      p_day: '2026-11-13',
      p_day_generations: 2,
      p_total_generations: 5,
    });
  });

  it('surfaces real 500/502 server errors instead of masking them as network failures', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://demo12345678.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'ADMIN_TOKEN সিক্রেট সেট করা নেই।' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    vi.resetModules();

    const { fetchAdminStats, isNetworkFailure } = await import('./analytics');
    let caught: unknown;
    try {
      await fetchAdminStats('secret-token');
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toBe('ADMIN_TOKEN সিক্রেট সেট করা নেই।');
    expect(isNetworkFailure(caught)).toBe(false);
  });

  it('flags unreachable endpoints as network failures', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://demo12345678.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    vi.resetModules();

    const { fetchAdminStats, isNetworkFailure } = await import('./analytics');
    let caught: unknown;
    try {
      await fetchAdminStats('secret-token');
    } catch (e) {
      caught = e;
    }

    expect(isNetworkFailure(caught)).toBe(true);
  });
});
