-- Réponse d'un prestataire à une offre : transaction atomique, identité imposée par auth.uid().
-- Retourne 'accepted', 'taken' (créneau déjà pourvu) ou 'unavailable' (offre close).
create function public.accept_offer(p_offer uuid)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_offer public.offers;
  v_slot public.slots;
begin
  select o.* into v_offer
  from public.offers o
  join public.providers p on p.id = o.provider_id
  where o.id = p_offer and p.user_id = auth.uid()
  for update of o;

  if not found then
    raise exception 'Offre introuvable' using errcode = '42501';
  end if;
  if v_offer.status <> 'pending' then
    return 'unavailable';
  end if;

  select * into v_slot from public.slots where id = v_offer.slot_id for update;
  if v_slot.status <> 'open' or v_slot.starts_at < now() then
    update public.offers set status = 'expired', responded_at = now() where id = p_offer;
    return 'taken';
  end if;

  update public.offers set status = 'accepted', responded_at = now() where id = p_offer;
  update public.offers set status = 'expired'
    where slot_id = v_slot.id and id <> p_offer and status = 'pending';
  update public.slots
    set status = 'filled', assigned_provider_id = v_offer.provider_id, filled_at = now()
    where id = v_slot.id;
  update public.providers set missions_count = missions_count + 1 where id = v_offer.provider_id;
  return 'accepted';
end;
$$;

create function public.decline_offer(p_offer uuid)
returns text
language plpgsql security definer set search_path = ''
as $$
begin
  update public.offers o set status = 'declined', responded_at = now()
  from public.providers p
  where o.id = p_offer and p.id = o.provider_id and p.user_id = auth.uid() and o.status = 'pending';
  if not found then
    return 'unavailable';
  end if;
  return 'declined';
end;
$$;

-- Plages déjà réservées des prestataires (sans révéler la structure), pour le matching.
create function public.provider_busy_ranges(p_providers uuid[], p_from timestamptz, p_to timestamptz)
returns table (provider_id uuid, starts_at timestamptz, ends_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select s.assigned_provider_id, s.starts_at, s.ends_at
  from public.slots s
  where s.assigned_provider_id = any (p_providers)
    and s.status = 'filled'
    and s.starts_at < p_to and s.ends_at > p_from
    and (public.current_app_role() in ('salle', 'admin'))
$$;

revoke execute on function
  public.accept_offer(uuid), public.decline_offer(uuid),
  public.provider_busy_ranges(uuid[], timestamptz, timestamptz)
from public, anon;
grant execute on function
  public.accept_offer(uuid), public.decline_offer(uuid),
  public.provider_busy_ranges(uuid[], timestamptz, timestamptz)
to authenticated;

-- Mises à jour en direct (Supabase Realtime respecte la RLS ci-dessus).
alter publication supabase_realtime add table public.slots, public.offers;
