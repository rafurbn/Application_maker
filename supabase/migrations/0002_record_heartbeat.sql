-- বিদ্যমান Supabase প্রজেক্টের জন্য ইনক্রিমেন্টাল মাইগ্রেশন:
-- আগে 0001_init.sql চালানো থাকলে, সরাসরি app_activity-তে anon upsert দ্বিতীয়বার থেকেই
-- SELECT RLS না থাকায় ব্যর্থ হয়। এই RPC ফাংশনটি সেই সমস্যা সমাধান করে।

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
