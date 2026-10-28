-- Buildcaps shared funnels, part 2: ready for every funnel to plug in.
-- A funnel row is now all a new funnel needs (its view follows it), leads
-- record when the team edits them, and an old funnel's leads can be imported
-- more than once without duplicates.

-- Names resolve from an empty search path (Supabase security advisor).
create or replace function public.create_funnel_view(funnel_slug text)
returns void language plpgsql set search_path = '' as $$
declare
  view_name text := 'leads_' || replace(funnel_slug, '-', '_');
begin
  execute format(
    'create or replace view public.%I with (security_invoker = true) as
       select * from public.leads where funnel = %L order by created_at desc',
    view_name, funnel_slug);
  execute format('revoke all on public.%I from anon, authenticated', view_name);
end $$;
revoke all on function public.create_funnel_view(text) from public, anon, authenticated;

-- Keeps leads_<slug> in step with public.funnels. Security definer, because the
-- API roles may insert a funnel but can't create views in public.
create or replace function public.sync_funnel_view()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    execute format('drop view if exists public.%I', 'leads_' || replace(old.slug, '-', '_'));
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    perform public.create_funnel_view(new.slug);
  end if;
  return null;
end $$;
revoke all on function public.sync_funnel_view() from public, anon, authenticated;

create or replace trigger funnels_view_insert
  after insert on public.funnels
  for each row execute function public.sync_funnel_view();
create or replace trigger funnels_view_rename
  after update of slug on public.funnels
  for each row when (old.slug is distinct from new.slug)
  execute function public.sync_funnel_view();
create or replace trigger funnels_view_delete
  after delete on public.funnels
  for each row execute function public.sync_funnel_view();

-- When the team last changed a lead (status, notes) in the dashboard.
alter table public.leads add column if not exists updated_at timestamptz not null default now();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
revoke all on function public.touch_updated_at() from public, anon, authenticated;

create or replace trigger leads_touch_updated_at
  before update on public.leads
  for each row execute function public.touch_updated_at();

-- The lead's id in its funnel's old database. Imports post with
-- ?on_conflict=funnel,legacy_id and Prefer: resolution=ignore-duplicates,
-- so a re-run skips rows already copied. New leads leave it null.
alter table public.leads add column if not exists legacy_id text;
create unique index if not exists leads_funnel_legacy_id_key on public.leads (funnel, legacy_id);

-- Foreign keys get an index (Supabase performance advisor).
create index if not exists events_lead_idx on public.events (lead_id);

-- Rebuild every funnel view so it carries the new columns.
select public.create_funnel_view(slug) from public.funnels;
