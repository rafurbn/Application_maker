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

-- ইচ্ছাকৃতভাবে কোনো anon select / delete policy নেই:
-- anon key দিয়ে কেউ পরিসংখ্যান পড়তে বা মুছে ফেলতে পারবে না।
-- লেখা হয় শুধু record_heartbeat() SECURITY DEFINER RPC দিয়ে,
-- আর পড়া যায় শুধু admin-stats Edge Function থেকে (service role)।

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

-- বেনামী ডিভাইস হার্টবিট ও কাউন্টার আপসার্ট (SELECT RLS ছাড়াই নিরাপদ আপডেট নিশ্চিত করে)।
create or replace function public.record_heartbeat(
  p_uid text,
  p_day text,
  p_day_generations integer,
  p_total_generations integer,
  p_per_template jsonb,
  p_last_template_id text default null,
  p_last_template_title text default null,
  p_last_category text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid text := left(trim(coalesce(p_uid, '')), 128);
  v_day text := left(trim(coalesce(p_day, '')), 16);
  v_day_gen integer := greatest(0, coalesce(p_day_generations, 0));
  v_total_gen integer := greatest(0, coalesce(p_total_generations, 0));
  v_per_template jsonb := case when jsonb_typeof(p_per_template) = 'object' then p_per_template else '{}'::jsonb end;
  v_category text := case when p_last_category in ('employee', 'student') then p_last_category else null end;
begin
  if length(v_uid) < 8 or v_day !~ '^\d{4}-\d{2}-\d{2}$' then
    return;
  end if;

  insert into public.app_activity (
    uid,
    day,
    day_generations,
    total_generations,
    per_template,
    last_template_id,
    last_template_title,
    last_category
  )
  values (
    v_uid,
    v_day,
    v_day_gen,
    v_total_gen,
    v_per_template,
    nullif(left(trim(coalesce(p_last_template_id, '')), 120), ''),
    nullif(left(trim(coalesce(p_last_template_title, '')), 200), ''),
    v_category
  )
  on conflict (uid) do update set
    day = excluded.day,
    day_generations = case
      when app_activity.day = excluded.day then greatest(app_activity.day_generations, excluded.day_generations)
      else excluded.day_generations
    end,
    total_generations = greatest(app_activity.total_generations, excluded.total_generations),
    per_template = case
      when excluded.total_generations >= app_activity.total_generations and excluded.per_template <> '{}'::jsonb
        then excluded.per_template
      else app_activity.per_template
    end,
    last_template_id = coalesce(excluded.last_template_id, app_activity.last_template_id),
    last_template_title = coalesce(excluded.last_template_title, app_activity.last_template_title),
    last_category = coalesce(excluded.last_category, app_activity.last_category),
    updated_at = now();
end
$$;

revoke all on function public.record_heartbeat(text, text, integer, integer, jsonb, text, text, text) from public;
grant execute on function public.record_heartbeat(text, text, integer, integer, jsonb, text, text, text) to anon, authenticated;

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
