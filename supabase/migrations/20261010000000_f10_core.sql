-- F10 server persistence and accounts, F15 server-authenticated voucher.
-- Synthetic data only: no BAA is in place, so no real patient may be entered.
--
-- Shape: one row per patient field (patient_fields), so a clinician writing the prescription and a
-- patient logging a meal never overwrite each other. The app's store keeps the same API it had
-- with localStorage; see lib/store.ts and lib/sync.ts.

create extension if not exists pgcrypto with schema extensions;

-- ---------- Who is who ----------

create table public.places (
  id text primary key,
  kind text not null check (kind in ('colmado', 'finca', 'cocina')),
  name text not null
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('patient', 'clinician', 'promotora', 'business')),
  display_name text not null default '',
  place_id text references public.places (id),
  created_at timestamptz not null default now(),
  check ((role = 'business') = (place_id is not null))
);

create table public.patients (
  id text primary key default ('p-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
  user_id uuid unique references auth.users (id) on delete set null,
  name text not null check (length(name) between 1 and 80),
  age int check (age between 0 and 120),
  town text not null default '',
  note jsonb not null default '{"es":"","en":""}',
  phone text unique,
  chw_id uuid references public.profiles (id) on delete set null,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- Helpers for policies. Security definer so they can read profiles without recursing through RLS.
create function public.my_role() returns text language sql stable security definer set search_path = public as
$$ select role from profiles where id = auth.uid() $$;
create function public.my_place() returns text language sql stable security definer set search_path = public as
$$ select place_id from profiles where id = auth.uid() $$;
create function public.my_patient() returns text language sql stable security definer set search_path = public as
$$ select id from patients where user_id = auth.uid() $$;
create function public.is_staff() returns boolean language sql stable security definer set search_path = public as
$$ select coalesce((select role in ('clinician', 'promotora') from profiles where id = auth.uid()), false) $$;

-- ---------- Patient record, one row per field ----------

create table public.patient_fields (
  patient_id text not null references public.patients (id) on delete cascade,
  key text not null check (key in ('intake', 'intakeDone', 'intakeSummary', 'rx', 'visitSummary', 'plan', 'log', 'order', 'teachBack', 'outcomes', 'chwNotes')),
  value jsonb,
  updated_at timestamptz not null default now(),   -- the writer's clock, used for last-writer-wins
  updated_by uuid default auth.uid(),
  primary key (patient_id, key)
);

-- Which fields each role may write directly. 'order' is never written directly: only place_order,
-- set_order_status, cancel_order and redeem_voucher change it, so a voucher cannot be forged.
create function public.can_write_field(p_patient text, p_key text) returns boolean language sql stable security definer set search_path = public as $$
  select case my_role()
    when 'clinician' then p_key <> 'order'
    when 'promotora' then p_key in ('intake', 'intakeDone', 'intakeSummary', 'chwNotes', 'outcomes')
    when 'patient' then p_patient = my_patient() and p_key in ('intake', 'intakeDone', 'intakeSummary', 'plan', 'log', 'teachBack')
    else false
  end
$$;

-- A business sees a patient only while that patient has an order at its place, and only what it needs to fill it.
create function public.has_order_at_my_place(p_patient text) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from patient_fields o where o.patient_id = p_patient and o.key = 'order' and o.value ->> 'placeId' = my_place())
$$;

alter table public.places enable row level security;
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.patient_fields enable row level security;

create policy "places readable" on public.places for select to authenticated using (true);

create policy "own profile" on public.profiles for select to authenticated using (id = auth.uid() or is_staff());

create policy "staff see patients" on public.patients for select to authenticated using (is_staff());
create policy "patient sees self" on public.patients for select to authenticated using (user_id = auth.uid());
create policy "business sees its customers" on public.patients for select to authenticated using (my_role() = 'business' and has_order_at_my_place(id));
create policy "staff update patients" on public.patients for update to authenticated using (is_staff()) with check (is_staff());

create policy "staff read fields" on public.patient_fields for select to authenticated using (is_staff());
create policy "patient reads own" on public.patient_fields for select to authenticated using (patient_id = my_patient());
create policy "business reads order fields" on public.patient_fields for select to authenticated
  using (my_role() = 'business' and key in ('rx', 'plan', 'order') and has_order_at_my_place(patient_id));
create policy "insert allowed fields" on public.patient_fields for insert to authenticated with check (can_write_field(patient_id, key));
create policy "update allowed fields" on public.patient_fields for update to authenticated
  using (can_write_field(patient_id, key)) with check (can_write_field(patient_id, key));

-- Writes a batch of fields. A field is only replaced when the incoming copy is newer, so an
-- offline phone syncing old edits later cannot undo a newer change made elsewhere.
-- Security invoker: the policies above decide what the caller may write.
create function public.put_fields(rows jsonb) returns int language plpgsql security invoker set search_path = public as $$
declare n int;
begin
  insert into patient_fields (patient_id, key, value, updated_at, updated_by)
  select r ->> 'patient_id', r ->> 'key', r -> 'value', least((r ->> 'at')::timestamptz, now() + interval '5 minutes'), auth.uid()
  from jsonb_array_elements(rows) r
  on conflict (patient_id, key) do update
    set value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by
    where patient_fields.updated_at < excluded.updated_at;
  get diagnostics n = row_count;
  return n;
end $$;

-- ---------- What each business has this week (F14) ----------

create table public.stock (
  place_id text primary key references public.places (id),
  items jsonb not null default '[]',
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid()
);
alter table public.stock enable row level security;
create policy "stock readable" on public.stock for select to authenticated using (true);
create policy "business writes own stock" on public.stock for insert to authenticated with check (place_id = my_place());
create policy "business updates own stock" on public.stock for update to authenticated using (place_id = my_place()) with check (place_id = my_place());

-- ---------- Vouchers (F15) ----------
-- Redemption is its own step (hotspot H2): the business enters the code the patient shows, and the
-- server checks it is for that place, not used, not void and not expired. Fulfillment
-- (order status) is recorded separately and does not redeem anything.

create table public.vouchers (
  code text primary key,
  patient_id text not null references public.patients (id) on delete cascade,
  order_id text not null unique,
  place_id text not null references public.places (id),
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  redeemed_by uuid references auth.users (id),
  voided_at timestamptz
);
alter table public.vouchers enable row level security;
create policy "staff see vouchers" on public.vouchers for select to authenticated using (is_staff());
create policy "patient sees own vouchers" on public.vouchers for select to authenticated using (patient_id = my_patient());
create policy "business sees its vouchers" on public.vouchers for select to authenticated using (place_id = my_place());

-- Unambiguous characters only (no 0/O, 1/I/L), so a code read aloud or typed from a phone is not misread.
create function public.new_voucher_code() returns text language plpgsql volatile set search_path = public as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  b bytea := extensions.gen_random_bytes(8);
  out text := 'RF-';
begin
  for i in 0..7 loop
    if i = 4 then out := out || '-'; end if;
    out := out || substr(alphabet, 1 + (get_byte(b, i) % length(alphabet)), 1);
  end loop;
  return out;
end $$;

-- ---------- Audit log ----------
-- Who wrote which field of whose record, and every voucher event. Values are not copied here.

create table public.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor uuid,
  action text not null,
  patient_id text,
  detail jsonb not null default '{}'
);
alter table public.audit_log enable row level security;
create policy "clinicians read audit" on public.audit_log for select to authenticated using (my_role() = 'clinician');

create function public.audit_field() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into audit_log (actor, action, patient_id, detail)
  values (auth.uid(), 'field.' || lower(tg_op), new.patient_id, jsonb_build_object('key', new.key));
  return new;
end $$;
create trigger patient_fields_audit after insert or update on public.patient_fields for each row execute function public.audit_field();

-- A new prescription replaces the old order: its unredeemed voucher is voided and the order cleared.
create function public.rx_resets_order() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.key = 'rx' then
    update vouchers set voided_at = now() where patient_id = new.patient_id and redeemed_at is null and voided_at is null;
    delete from patient_fields where patient_id = new.patient_id and key = 'order';
  end if;
  return new;
end $$;
create trigger patient_fields_rx after insert or update on public.patient_fields for each row execute function public.rx_resets_order();

-- ---------- Order and voucher commands ----------

create function private_order_place_ok(p_place text, p_rx jsonb) returns boolean language sql stable set search_path = public as $$
  select exists (select 1 from places where id = p_place and (case when p_rx ->> 'type' = 'meals' then kind = 'cocina' else kind in ('colmado', 'finca') end))
$$;

-- The patient (or staff on their behalf) picks a place. Returns the order, including its voucher code.
create function public.place_order(p_patient text, p_place text, p_delivery boolean) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  rx jsonb;
  existing jsonb;
  ord jsonb;
  v_code text;
  v_oid text := 'RF-' || lpad((floor(random() * 10000))::int::text, 4, '0');
  expires timestamptz;
begin
  if not (p_patient = my_patient() or is_staff()) then raise exception 'not allowed' using errcode = '42501'; end if;
  select value into rx from patient_fields where patient_id = p_patient and key = 'rx';
  if rx is null or rx = 'null'::jsonb then raise exception 'no prescription' using errcode = 'P0001'; end if;
  select value into existing from patient_fields where patient_id = p_patient and key = 'order';
  if existing is not null and existing <> 'null'::jsonb then return existing; end if;
  if not private_order_place_ok(p_place, rx) then raise exception 'place does not fill this prescription' using errcode = 'P0001'; end if;
  expires := coalesce((rx ->> 'createdAt')::timestamptz, now()) + make_interval(days => 7 * greatest(1, least(12, coalesce((rx ->> 'weeks')::int, 4))));
  if expires < now() then raise exception 'prescription expired' using errcode = 'P0001'; end if;
  loop
    v_code := new_voucher_code();
    exit when not exists (select 1 from vouchers where vouchers.code = v_code);
  end loop;
  insert into vouchers (code, patient_id, order_id, place_id, expires_at) values (v_code, p_patient, v_oid || '-' || substr(v_code, 4), p_place, expires);
  ord := jsonb_build_object('id', v_oid, 'placeId', p_place, 'needsDelivery', coalesce(p_delivery, false), 'status', 'received',
                            'createdAt', to_jsonb(now()), 'voucher', v_code, 'expiresAt', to_jsonb(expires));
  insert into patient_fields (patient_id, key, value, updated_at) values (p_patient, 'order', ord, now())
    on conflict (patient_id, key) do update set value = excluded.value, updated_at = excluded.updated_at, updated_by = auth.uid();
  insert into audit_log (actor, action, patient_id, detail) values (auth.uid(), 'voucher.issued', p_patient, jsonb_build_object('code', v_code, 'place', p_place));
  return ord;
end $$;

-- The patient changes place before the business has started on it. A redeemed voucher cannot be cancelled.
create function public.cancel_order(p_patient text) returns void language plpgsql security definer set search_path = public as $$
declare ord jsonb;
begin
  if not (p_patient = my_patient() or is_staff()) then raise exception 'not allowed' using errcode = '42501'; end if;
  select value into ord from patient_fields where patient_id = p_patient and key = 'order';
  if ord is null then return; end if;
  if ord ? 'redeemedAt' or ord ->> 'status' <> 'received' then raise exception 'order already started' using errcode = 'P0001'; end if;
  update vouchers set voided_at = now() where code = ord ->> 'voucher' and redeemed_at is null;
  delete from patient_fields where patient_id = p_patient and key = 'order';
  insert into audit_log (actor, action, patient_id, detail) values (auth.uid(), 'voucher.voided', p_patient, jsonb_build_object('code', ord ->> 'voucher'));
end $$;

-- Fulfillment: the business moves the order forward one step at a time. Does not redeem the voucher.
create function public.set_order_status(p_patient text, p_status text) returns jsonb language plpgsql security definer set search_path = public as $$
declare ord jsonb; nxt text;
begin
  select value into ord from patient_fields where patient_id = p_patient and key = 'order';
  if ord is null or my_role() <> 'business' or ord ->> 'placeId' <> my_place() then raise exception 'not allowed' using errcode = '42501'; end if;
  nxt := case ord ->> 'status' when 'received' then 'preparing' when 'preparing' then 'ready' when 'ready' then 'delivered' end;
  if nxt is null or nxt <> p_status then raise exception 'status must move one step forward' using errcode = 'P0001'; end if;
  ord := jsonb_set(ord, '{status}', to_jsonb(p_status));
  update patient_fields set value = ord, updated_at = now(), updated_by = auth.uid() where patient_id = p_patient and key = 'order';
  insert into audit_log (actor, action, patient_id, detail) values (auth.uid(), 'order.' || p_status, p_patient, jsonb_build_object('order', ord ->> 'id'));
  return ord;
end $$;

-- Redemption: the business enters the code the patient shows. Succeeds once.
-- Returns {ok, reason, patient_id, order}. Reasons: unknown, otherPlace, used, void, expired.
create function public.redeem_voucher(p_code text) returns jsonb language plpgsql security definer set search_path = public as $$
declare v vouchers%rowtype; ord jsonb; c text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  if my_role() <> 'business' then raise exception 'not allowed' using errcode = '42501'; end if;
  if c like 'RF%' then c := substr(c, 3); end if;
  c := 'RF-' || substr(c, 1, 4) || '-' || substr(c, 5, 4);
  select * into v from vouchers where code = c for update;
  if not found then
    insert into audit_log (actor, action, detail) values (auth.uid(), 'voucher.rejected', jsonb_build_object('reason', 'unknown'));
    return jsonb_build_object('ok', false, 'reason', 'unknown');
  end if;
  if v.place_id <> my_place() then
    insert into audit_log (actor, action, patient_id, detail) values (auth.uid(), 'voucher.rejected', v.patient_id, jsonb_build_object('code', c, 'reason', 'otherPlace'));
    return jsonb_build_object('ok', false, 'reason', 'otherPlace');
  end if;
  if v.redeemed_at is not null then return jsonb_build_object('ok', false, 'reason', 'used', 'at', v.redeemed_at); end if;
  if v.voided_at is not null then return jsonb_build_object('ok', false, 'reason', 'void'); end if;
  if v.expires_at < now() then return jsonb_build_object('ok', false, 'reason', 'expired'); end if;
  update vouchers set redeemed_at = now(), redeemed_by = auth.uid() where code = c;
  select value into ord from patient_fields where patient_id = v.patient_id and key = 'order';
  if ord is not null and ord ->> 'voucher' = c then
    ord := ord || jsonb_build_object('redeemedAt', to_jsonb(now()));
    update patient_fields set value = ord, updated_at = now(), updated_by = auth.uid() where patient_id = v.patient_id and key = 'order';
  end if;
  insert into audit_log (actor, action, patient_id, detail) values (auth.uid(), 'voucher.redeemed', v.patient_id, jsonb_build_object('code', c));
  return jsonb_build_object('ok', true, 'patient_id', v.patient_id, 'order', ord);
end $$;

revoke execute on function public.place_order, public.cancel_order, public.set_order_status, public.redeem_voucher, public.put_fields from anon, public;
grant execute on function public.place_order, public.cancel_order, public.set_order_status, public.redeem_voucher, public.put_fields to authenticated;
revoke execute on function public.private_order_place_ok, public.new_voucher_code from anon, authenticated, public;

-- Live updates between devices. Realtime applies the select policies above.
alter publication supabase_realtime add table public.patient_fields, public.stock, public.patients;
