-- Sécurité au niveau des lignes : activée sur TOUTES les tables.
-- Un coach ne voit que ses données, une salle que les siennes, l'admin voit tout.
-- Les fonctions utilitaires sont en SECURITY DEFINER pour éviter la récursion des politiques.

create function public.current_app_role()
returns public.app_role
language sql stable security definer set search_path = ''
as $$ select role from public.profiles where id = auth.uid() $$;

create function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false) $$;

create function public.my_provider_id()
returns uuid
language sql stable security definer set search_path = ''
as $$ select id from public.providers where user_id = auth.uid() $$;

create function public.owns_venue(p_venue uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.venues where id = p_venue and owner_id = auth.uid()) $$;

create function public.owns_slot(p_slot uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.slots s join public.venues v on v.id = s.venue_id
    where s.id = p_slot and v.owner_id = auth.uid()
  )
$$;

-- Le prestataire connecté a-t-il reçu une offre pour ce créneau / dans cette structure ?
create function public.offered_slot(p_slot uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.offers o
    join public.providers p on p.id = o.provider_id
    where o.slot_id = p_slot and p.user_id = auth.uid()
  )
$$;

create function public.offered_venue(p_venue uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.offers o
    join public.slots s on s.id = o.slot_id
    join public.providers p on p.id = o.provider_id
    where s.venue_id = p_venue and p.user_id = auth.uid()
  )
$$;

-- Prestataire possédé par l'utilisateur connecté.
create function public.owns_provider(p_provider uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.providers where id = p_provider and user_id = auth.uid()) $$;

revoke execute on function
  public.current_app_role(), public.is_admin(), public.my_provider_id(),
  public.owns_venue(uuid), public.owns_slot(uuid), public.offered_slot(uuid),
  public.offered_venue(uuid), public.owns_provider(uuid)
from public, anon;
grant execute on function
  public.current_app_role(), public.is_admin(), public.my_provider_id(),
  public.owns_venue(uuid), public.owns_slot(uuid), public.offered_slot(uuid),
  public.offered_venue(uuid), public.owns_provider(uuid)
to authenticated;

alter table public.profiles enable row level security;
alter table public.venues enable row level security;
alter table public.providers enable row level security;
alter table public.provider_skills enable row level security;
alter table public.credentials enable row level security;
alter table public.availabilities enable row level security;
alter table public.favorites enable row level security;
alter table public.slots enable row level security;
alter table public.offers enable row level security;

-- Aucun accès anonyme aux données métier.
revoke all on all tables in schema public from anon;

-- profiles : chacun lit le sien, l'admin lit tout. Les rôles ne sont modifiables
-- que par la base (pas de politique d'écriture).
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

-- venues
create policy venues_select on public.venues for select to authenticated
  using (public.is_admin() or owner_id = auth.uid() or public.offered_venue(id));
create policy venues_update on public.venues for update to authenticated
  using (public.is_admin() or owner_id = auth.uid())
  with check (public.is_admin() or owner_id = auth.uid());

-- providers : le catalogue est lisible par les salles (nécessaire au matching).
create policy providers_select on public.providers for select to authenticated
  using (public.is_admin() or user_id = auth.uid() or public.current_app_role() = 'salle');
create policy providers_update on public.providers for update to authenticated
  using (public.is_admin() or user_id = auth.uid())
  with check (public.is_admin() or user_id = auth.uid());
-- Un prestataire ne peut pas modifier sa note ni son compteur de missions.
revoke update on public.providers from authenticated;
grant update (display_name, bio, commune, lat, lng, radius_km, min_hourly_rate_cents)
  on public.providers to authenticated;

-- provider_skills
create policy provider_skills_select on public.provider_skills for select to authenticated
  using (public.is_admin() or public.owns_provider(provider_id) or public.current_app_role() = 'salle');
create policy provider_skills_insert on public.provider_skills for insert to authenticated
  with check (public.is_admin() or public.owns_provider(provider_id));
create policy provider_skills_delete on public.provider_skills for delete to authenticated
  using (public.is_admin() or public.owns_provider(provider_id));

-- credentials : le prestataire déclare (toujours « en attente »), seul l'admin valide.
create policy credentials_select on public.credentials for select to authenticated
  using (public.is_admin() or public.owns_provider(provider_id) or public.current_app_role() = 'salle');
create policy credentials_insert on public.credentials for insert to authenticated
  with check (public.is_admin() or (public.owns_provider(provider_id) and status = 'pending'));
create policy credentials_update on public.credentials for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy credentials_delete on public.credentials for delete to authenticated
  using (public.is_admin() or (public.owns_provider(provider_id) and status = 'pending'));

-- availabilities
create policy availabilities_select on public.availabilities for select to authenticated
  using (public.is_admin() or public.owns_provider(provider_id) or public.current_app_role() = 'salle');
create policy availabilities_insert on public.availabilities for insert to authenticated
  with check (public.is_admin() or public.owns_provider(provider_id));
create policy availabilities_update on public.availabilities for update to authenticated
  using (public.is_admin() or public.owns_provider(provider_id))
  with check (public.is_admin() or public.owns_provider(provider_id));
create policy availabilities_delete on public.availabilities for delete to authenticated
  using (public.is_admin() or public.owns_provider(provider_id));

-- favorites
create policy favorites_select on public.favorites for select to authenticated
  using (public.is_admin() or public.owns_venue(venue_id));
create policy favorites_insert on public.favorites for insert to authenticated
  with check (public.is_admin() or public.owns_venue(venue_id));
create policy favorites_delete on public.favorites for delete to authenticated
  using (public.is_admin() or public.owns_venue(venue_id));

-- slots : la salle gère les siens ; le prestataire voit ceux qui lui ont été proposés.
create policy slots_select on public.slots for select to authenticated
  using (
    public.is_admin()
    or public.owns_venue(venue_id)
    or public.offered_slot(id)
    or public.owns_provider(assigned_provider_id)
  );
create policy slots_insert on public.slots for insert to authenticated
  with check (public.owns_venue(venue_id) and status = 'open' and assigned_provider_id is null);
create policy slots_update on public.slots for update to authenticated
  using (public.is_admin() or public.owns_venue(venue_id))
  with check (public.is_admin() or public.owns_venue(venue_id));
-- L'attribution d'un prestataire passe exclusivement par accept_offer().
revoke update on public.slots from authenticated;
grant update (search_radius_km, status, notes) on public.slots to authenticated;

-- offers : créées par la salle propriétaire du créneau (résultat du matching) ;
-- la réponse du prestataire passe par accept_offer() / decline_offer().
create policy offers_select on public.offers for select to authenticated
  using (public.is_admin() or public.owns_provider(provider_id) or public.owns_slot(slot_id));
create policy offers_insert on public.offers for insert to authenticated
  with check (public.owns_slot(slot_id) and status = 'pending');
create policy offers_update on public.offers for update to authenticated
  using (public.is_admin() or public.owns_slot(slot_id))
  with check (public.is_admin() or public.owns_slot(slot_id));
revoke update on public.offers from authenticated;
grant update (status) on public.offers to authenticated;
