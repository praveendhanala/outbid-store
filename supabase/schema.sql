-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text not null unique,
  description text not null,
  -- Confirmed bid this store was created/listed with. Only ever written
  -- by lib/bids/confirm.ts once payment is confirmed — never directly by
  -- a client-facing action.
  bid integer not null check (bid > 0),
  -- A store only appears on the public leaderboard once its first bid's
  -- payment has been confirmed by the Dodo webhook.
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'active')),
  clicks integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reference table for categories, mirroring lib/data.ts CATEGORY_INFO.
-- id is the slug used throughout the app (e.g. 'sneakers').
create table if not exists categories (
  id text primary key,
  label text not null,
  description text not null
);

insert into categories (id, label, description) values
  ('sneakers', 'Sneakers', 'Sneaker retailers, restocks, and resellers.'),
  ('fashion', 'Fashion', 'Apparel, streetwear, and accessories.'),
  ('beauty', 'Beauty', 'Skincare, cosmetics, and personal care.'),
  ('home', 'Home', 'Furniture, decor, and household goods.'),
  ('electronics', 'Electronics', 'Gadgets, accessories, and refurbished tech.'),
  ('food', 'Food', 'Coffee, snacks, and specialty food brands.')
on conflict (id) do update set
  label = excluded.label,
  description = excluded.description;

-- One row per (store, category). A store can have between 1 and
-- MAX_CATEGORIES_PER_STORE rows here — that limit (currently 3) is
-- enforced in app code (lib/data.ts) rather than in the schema, so it's a
-- one-line change if you raise or lower it later.
create table if not exists store_categories (
  store_id uuid not null references stores(id) on delete cascade,
  category_id text not null references categories(id) on delete restrict,
  primary key (store_id, category_id)
);

create index if not exists store_categories_category_id_idx
  on store_categories(category_id);

create index if not exists stores_bid_idx
  on stores(bid desc);

-- Keep updated_at current on every row change (stores, bids).
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists stores_set_updated_at on stores;
create trigger stores_set_updated_at
  before update on stores
  for each row
  execute function set_updated_at();

-- One row per bid *attempt* — every checkout a bidder starts, whether it
-- ends up paid or not. This is the audit trail; stores.bid is a cached
-- value derived from the latest 'succeeded' row here.
--
-- Every bid creates a brand-new listing — there is no "raise my existing
-- store's bid" action. "Outbid" in the UI is just a shortcut that
-- pre-fills the amount field; it never targets or modifies another
-- store's row. That's why store_id starts null on every bid: the store
-- doesn't exist until payment is confirmed.
do $$ begin
  create type bid_status as enum ('pending', 'succeeded', 'failed');
exception
  when duplicate_object then null;
end $$;

create table if not exists bids (
  id uuid primary key default gen_random_uuid(),
  -- Set once the matching store is created — either automatically right
  -- after payment confirms (if pending_name etc. were filled in before
  -- checkout) or later via finalizeStoreSubmission (if the person chose
  -- to add details after paying).
  store_id uuid references stores(id) on delete set null,
  amount integer not null check (amount > 0),
  status bid_status not null default 'pending',
  customer_email text not null,
  -- Optional: filled in if the person added store details BEFORE
  -- checkout. If null, they're added after payment via the /bid/return
  -- form instead. Either way, the stores row itself is only ever
  -- created once payment is confirmed.
  pending_name text,
  pending_domain text,
  pending_categories text[],
  pending_description text,
  -- Nullable: the bid row is inserted first (so its id can go into the
  -- checkout session's metadata for webhook correlation), then this is
  -- filled in immediately after the session is created.
  dodo_checkout_session_id text,
  -- Set once Dodo reports a payment_id for this session (webhook or the
  -- checkout-session response, whichever arrives first).
  dodo_payment_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bids_store_id_idx on bids(store_id);
create index if not exists bids_status_idx on bids(status);

drop trigger if exists bids_set_updated_at on bids;
create trigger bids_set_updated_at
  before update on bids
  for each row
  execute function set_updated_at();

-- Atomic increment so concurrent clicks can't race each other the way a
-- read-then-write from application code could. Returns the new count.
create or replace function increment_store_clicks(target_id uuid)
returns integer as $$
declare
  new_count integer;
begin
  update stores set clicks = clicks + 1
  where id = target_id
  returning clicks into new_count;
  return new_count;
end;
$$ language plpgsql;

-- Row level security. Reads are public for stores/categories; writes go
-- through server actions using the service role key, which bypasses RLS,
-- so no INSERT/UPDATE policies are needed for the app to work as built.
alter table stores enable row level security;
alter table categories enable row level security;
alter table store_categories enable row level security;

-- bids holds customer_email — no public policy at all, so it's only
-- reachable via the service role key on the server. RLS is still enabled
-- so a future anon-key policy has to be added deliberately, not by
-- accident.
alter table bids enable row level security;

drop policy if exists "Public read access" on stores;
create policy "Public read access" on stores
  for select using (true);

drop policy if exists "Public read access" on categories;
create policy "Public read access" on categories
  for select using (true);

drop policy if exists "Public read access" on store_categories;
create policy "Public read access" on store_categories
  for select using (true);
