import { describe, expect, it } from 'vitest';
import { resolveSupabaseUrl } from './analytics';

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
