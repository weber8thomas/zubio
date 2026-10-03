-- Zubio — schéma générique : des structures (venues) publient des créneaux (slots),
-- des prestataires (providers) reçoivent des offres (offers). Le métier (sport,
-- immobilier…) est porté par la colonne `vertical` et par la configuration applicative.

create type public.app_role as enum ('admin', 'salle', 'coach');
create type public.slot_status as enum ('open', 'filled', 'cancelled', 'done');
create type public.offer_status as enum ('pending', 'accepted', 'declined', 'expired');
create type public.credential_status as enum ('verified', 'pending');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null,
  full_name text not null,
  created_at timestamptz not null default now()
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete set null,
  vertical text not null default 'sport',
  name text not null,
  commune text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  phone text,
  created_at timestamptz not null default now()
);
create index venues_owner_idx on public.venues (owner_id);

create table public.providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles (id) on delete set null,
  vertical text not null default 'sport',
  display_name text not null,
  bio text not null default '',
  commune text not null,
  lat double precision not null,
  lng double precision not null,
  radius_km integer not null default 10 check (radius_km between 1 and 100),
  min_hourly_rate_cents integer not null default 3000 check (min_hourly_rate_cents >= 0),
  rating numeric(2, 1) not null default 4.5 check (rating between 0 and 5),
  missions_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.provider_skills (
  provider_id uuid not null references public.providers (id) on delete cascade,
  skill text not null,
  primary key (provider_id, skill)
);
create index provider_skills_skill_idx on public.provider_skills (skill);

create table public.credentials (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers (id) on delete cascade,
  kind text not null,
  status public.credential_status not null default 'pending',
  expires_on date,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
create index credentials_provider_idx on public.credentials (provider_id);

create table public.availabilities (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers (id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  start_time time not null,
  end_time time not null,
  check (end_time > start_time)
);
create index availabilities_provider_idx on public.availabilities (provider_id);

create table public.favorites (
  venue_id uuid not null references public.venues (id) on delete cascade,
  provider_id uuid not null references public.providers (id) on delete cascade,
  primary key (venue_id, provider_id)
);

create table public.slots (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues (id) on delete cascade,
  skill text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  rate_cents integer not null check (rate_cents > 0),
  notes text not null default '',
  status public.slot_status not null default 'open',
  search_radius_km integer not null default 10 check (search_radius_km between 1 and 100),
  assigned_provider_id uuid references public.providers (id) on delete set null,
  published_at timestamptz not null default now(),
  filled_at timestamptz,
  check (ends_at > starts_at)
);
create index slots_venue_idx on public.slots (venue_id, starts_at);
create index slots_assigned_idx on public.slots (assigned_provider_id, starts_at);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.slots (id) on delete cascade,
  provider_id uuid not null references public.providers (id) on delete cascade,
  score integer not null default 0,
  distance_km numeric(5, 1) not null default 0,
  reason text not null default '',
  status public.offer_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (slot_id, provider_id)
);
create index offers_provider_idx on public.offers (provider_id, status);
