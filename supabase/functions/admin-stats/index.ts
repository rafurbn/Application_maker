// Supabase Edge Function: admin-stats
// শুধুমাত্র অ্যাডমিন প্যানেলের জন্য — x-admin-token হেডারটি ADMIN_TOKEN সিক্রেটের সাথে মিলতে হবে।
//
//   supabase secrets set ADMIN_TOKEN="<বড় এলোমেলো স্ট্রিং>"
//   supabase functions deploy admin-stats --no-verify-jwt
//
// পড়া হয় service role key দিয়ে, তাই anon key-এর select অনুমতি লাগে না।

const ADMIN_TOKEN = Deno.env.get('ADMIN_TOKEN') ?? '';
const SUPABASE_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, x-admin-token, authorization, apikey',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/** ধারাবাহিক সময়-তুলনা যাতে টোকেন অনুমান করা সহজ না হয়। */
async function tokenMatches(supplied: string): Promise<boolean> {
  if (!ADMIN_TOKEN) return false;
  const encoder = new TextEncoder();
  const digest = async (value: string) =>
    new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
  const [a, b] = await Promise.all([digest(supplied), digest(ADMIN_TOKEN)]);
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return json({ error: 'সার্ভার কনফিগ অসম্পূর্ণ (SUPABASE_URL / SERVICE_ROLE_KEY)।' }, 500);
  }
  if (!ADMIN_TOKEN) {
    return json({ error: 'ADMIN_TOKEN সিক্রেট সেট করা নেই।' }, 500);
  }

  const supplied = req.headers.get('x-admin-token') ?? '';
  if (!(await tokenMatches(supplied))) {
    return json({ error: 'ভুল অ্যাডমিন টোকেন।' }, 401);
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_summary`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });

  if (!res.ok) {
    return json({ error: `ডেটাবেস থেকে আনা যায়নি (${res.status})। 0001_init.sql চালানো আছে কি দেখুন।` }, 502);
  }

  const summary = await res.json();
  return json({
    liveUsers: Number(summary.liveUsers ?? 0),
    usersToday: Number(summary.usersToday ?? 0),
    totalUsers: Number(summary.totalUsers ?? 0),
    totalGenerations: Number(summary.totalGenerations ?? 0),
    generationsToday: Number(summary.generationsToday ?? 0),
    popularFormats: Array.isArray(summary.popularFormats) ? summary.popularFormats : [],
    lastUpdated: summary.lastUpdated ?? new Date().toISOString(),
  });
});
