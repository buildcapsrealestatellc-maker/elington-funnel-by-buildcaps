-- Buildcaps: one Supabase project for every funnel.
-- Every lead and event row names its funnel, so each funnel's data stays
-- separate; a view per funnel shows just that funnel's leads in the dashboard.
-- Only the server's secret key can read or write (RLS on, no public policies).

create extension if not exists pgcrypto;

-- The funnel register. Add a row before a new funnel goes live.
create table if not exists public.funnels (
  slug        text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null,
  domain      text,
  developer   text,
  created_at  timestamptz not null default now()
);

insert into public.funnels (slug, name, domain, developer) values
  ('berkeley-tower',       'Berkeley Tower by Ellington',      'berkeley-tower-by-ellington.buildcaps.com', 'Ellington Properties'),
  ('sobha-sanctuary',      'Sobha Sanctuary',                  'sobha-sanctuary.buildcaps.com',             'Sobha Realty'),
  ('shahrukhz-residences', 'Shahrukhz Residences by Danube',   'shahrukz.com',                              'Danube Properties'),
  ('tilal-binghatti',      'Tilal by Binghatti',               'tilalbinghattidubai.buildcaps.com',         'Binghatti'),
  ('greenz-danube',        'Greenz by Danube',                 'greenz-by-danube-dubai.buildcaps.com',      'Danube Properties'),
  ('serenz-danube',        'Serenz by Danube',                 'serenz-by-danube-dubai.buildcaps.com',      'Danube Properties')
on conflict (slug) do nothing;

-- Every lead from every funnel. Shared fields are columns; anything a single
-- funnel asks (size, timeline, budget, unit…) goes in `answers`.
create table if not exists public.leads (
  id                uuid primary key default gen_random_uuid(),
  funnel            text not null references public.funnels (slug) on update cascade,
  created_at        timestamptz not null default now(),
  full_name         text not null,
  email             text,
  phone             text,
  country           text,
  language          text,
  offer             text,            -- e.g. brochure, launch access, priority pass
  source            text,            -- the button or form that opened it
  score             text,            -- hot / warm / cool
  consent           boolean not null default false,
  marketing_opt_in  boolean not null default false,
  answers           jsonb not null default '{}'::jsonb,
  attribution       jsonb not null default '{}'::jsonb,
  page_url          text,
  ip_hash           text,
  user_agent        text,
  brochure_emailed  boolean,
  status            text not null default 'new',
  notes             text
);

create index if not exists leads_funnel_created_idx on public.leads (funnel, created_at desc);
create index if not exists leads_email_idx on public.leads (lower(email));
create index if not exists leads_phone_idx on public.leads (phone);

-- Anything else a funnel records (AI tool use, downloads, quiz answers…).
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  funnel      text not null references public.funnels (slug) on update cascade,
  created_at  timestamptz not null default now(),
  type        text not null,
  lead_id     uuid references public.leads (id) on delete set null,
  session_id  text,
  data        jsonb not null default '{}'::jsonb
);

create index if not exists events_funnel_created_idx on public.events (funnel, created_at desc);

-- Locked down: the public (publishable) key can do nothing; the secret key
-- used by each funnel's server bypasses RLS.
alter table public.funnels enable row level security;
alter table public.leads   enable row level security;
alter table public.events  enable row level security;
revoke all on public.funnels, public.leads, public.events from anon, authenticated;

-- One view per funnel, so each funnel's leads read as their own table.
create or replace function public.create_funnel_view(funnel_slug text)
returns void language plpgsql as $$
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

select public.create_funnel_view(slug) from public.funnels;
