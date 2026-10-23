-- অফিসিয়াল দরখাস্ত প্রস্তুতকারক — ব্যবহারের পরিসংখ্যান (Supabase / Postgres)
-- চালানোর নিয়ম: supabase db push   (অথবা Supabase console → SQL editor → Run)
--
-- নকশা: প্রতিটি ডিভাইস/ব্রাউজার একটি গোপন র‍্যান্ডম uid নিয়ে একটি-ই সারি রাখে।
-- এই টেবিলে নাম, মোবাইল, প্রতিষ্ঠান বা আবেদনের লেখা কিছুই থাকে না — শুধু সংখ্যা।

create table if not exists public.app_activity (
  uid                text primary key,
  day                text not null,
  day_generations    integer not null default 0 check (day_generations >= 0),
  total_generations  integer not null default 0 check (total_generations >= 0),
  per_template       jsonb not null default '{}'::jsonb,
  last_template_id    text,
  last_template_title text,
  last_category       text check (last_category is null or last_category in ('employee', 'student')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists app_activity_day_idx on public.app_activity (day);
create index if not exists app_activity_updated_idx on public.app_activity (updated_at desc);

alter table public.app_activity enable row level security;

-- Anonymous clients may create and refresh their own counter row (upsert).
create policy "app_activity_anon_upsert" on public.app_activity
  for insert to anon with check (true);

create policy "app_activity_anon_refresh" on public.app_activity
  for update to anon using (true) with check (true);

-- ইচ্ছাকৃতভাবে কোনো select / delete policy নেই:
-- anon key দিয়ে কেউ পরিসংখ্যান পড়তে বা মুছে ফেলতে পারবে না।
-- পড়া যায় শুধু admin-stats Edge Function থেকে (service role)।

create or replace function public.touch_app_activity_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists app_activity_touch on public.app_activity;
create trigger app_activity_touch
  before update on public.app_activity
  for each row execute function public.touch_app_activity_updated_at();

-- এক কল-এ পুরো ড্যাশবোর্ড। SECURITY DEFINER, তাই anon/authenticated কে অনুমতি নেই।
create or replace function public.admin_summary()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  bd_today text := to_char((now() at time zone 'Asia/Dhaka')::date, 'YYYY-MM-DD');
  result jsonb;
begin
  select jsonb_build_object(
    'liveUsers', (
      select count(*) from app_activity where updated_at > now() - interval '3 minutes'
    ),
    'usersToday', (
      select count(*) from app_activity where day = bd_today
    ),
    'totalUsers', (
      select count(*) from app_activity
    ),
    'totalGenerations', (
      select coalesce(sum(total_generations), 0)::int from app_activity
    ),
    'generationsToday', (
      select coalesce(sum(day_generations), 0)::int from app_activity where day = bd_today
    ),
    'popularFormats', (
      select coalesce(
        jsonb_agg(jsonb_build_object('templateId', key, 'count', cnt) order by cnt desc),
        '[]'::jsonb
      )
      from (
        select key, sum((value)::int)::int as cnt
        from app_activity, jsonb_each_text(per_template)
        group by key
      ) per_format
    ),
    'lastUpdated', (
      select coalesce(max(updated_at), now()) from app_activity
    )
  ) into result;
  return result;
end $$;

revoke all on function public.admin_summary() from public, anon, authenticated;
