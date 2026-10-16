-- INABA HIJAB — Supabase-only setup
-- Email/password Auth + database + editable website/product image Storage.
-- No sample products are inserted; the public product catalogue stays empty until an admin adds real items.
-- To allow signup/login without email confirmation, turn OFF Authentication > Sign In / Providers > Email > Confirm email.
-- Security note: before public signup is enabled, reserve the two allowlisted admin emails as Auth users
-- in Supabase Dashboard > Authentication > Users. With confirmation disabled, email ownership is not proven.

create extension if not exists pgcrypto;

-- Core tables. TEXT user IDs let this migration safely handle the earlier Firebase prototype;
-- current Supabase Auth UUIDs are stored as their canonical text representation.
create table if not exists public.profiles (
  id text primary key,
  email text not null default '',
  full_name text not null default '',
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  slug text not null unique,
  category text not null check (char_length(category) between 1 and 80),
  description text not null default '',
  price bigint not null check (price >= 0),
  image_url text,
  badge text,
  featured boolean not null default false,
  is_active boolean not null default true,
  stock integer not null default 0 check (stock >= 0),
  is_preorder boolean not null default false,
  preorder_status text not null default 'open' check (preorder_status in ('open','closed','completed')),
  preorder_start timestamptz,
  preorder_end timestamptz,
  estimated_delivery text default '',
  school_institution text default '',
  min_order integer not null default 1 check (min_order >= 1),
  size_guide text default '',
  specifications jsonb default '{}'::jsonb,
  gallery_urls jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  phone text not null check (char_length(phone) between 5 and 40),
  address text not null check (char_length(address) between 5 and 1500),
  notes text not null default '',
  subtotal bigint not null default 0 check (subtotal >= 0),
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity between 1 and 50),
  variant_size text not null default 'M',
  unit_price bigint not null check (unit_price >= 0),
  is_preorder boolean not null default false,
  school_institution text default ''
);

-- Kategori produk dinamis
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 80),
  slug text not null unique,
  description text not null default '',
  icon text not null default 'package',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Pengaturan toko dinamis (kontak WA, pengumuman, rekening)
create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);


create table if not exists public.tailoring_requests (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  full_name text not null check (char_length(full_name) between 1 and 120),
  phone text not null check (char_length(phone) between 5 and 40),
  email text,
  service_type text not null check (char_length(service_type) between 1 and 100),
  brief text not null check (char_length(brief) between 5 and 4000),
  preferred_date date,
  reference_url text,
  status text not null default 'pending' check (status in ('pending','contacted','quoted','in_progress','completed','declined')),
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) between 5 and 254 and email = lower(email)),
  created_at timestamptz not null default now()
);

-- Homepage / editorial / multi-category imagery can be replaced from the admin dashboard.
create table if not exists public.site_images (
  key text primary key,
  label text not null,
  image_url text not null,
  updated_at timestamptz not null default now()
);

-- Initial site images & banners
insert into public.site_images (key,label,image_url) values
  ('hero','Foto utama beranda multikategori','https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85'),
  ('preorder_banner','Banner Pre-Order Seragam Sekolah','https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=85'),
  ('farmer_banner','Banner Perlengkapan Petani & Capel','https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=1200&q=85'),
  ('table_banner','Banner Meja Lipat & Perabot','https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=85'),
  ('journal_style','Foto panduan gaya','https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80'),
  ('journal_fabric','Foto panduan bahan tekstil','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80'),
  ('journal_tailor','Foto panduan ukuran & jahitan','https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=600&q=80')
on conflict (key) do nothing;

-- Initial categories seed
insert into public.categories (name, slug, description, icon, display_order, is_active) values
  ('Hijab & Pakaian', 'hijab-pakaian', 'Koleksi busana muslim gamis wanita, gamis pria, koko, kurta, hijab dan khimar', 'sparkles', 1, true),
  ('Seragam Sekolah — Pre-Order', 'seragam-sekolah', 'Pre-order seragam sekolah SDIT, TPQ, dan Madrasah Diniyah Sirimbit Keluarga', 'graduation-cap', 2, true),
  ('Perlengkapan Petani', 'perlengkapan-petani', 'Topi capel petani tradisional, pelindung terik matahari dan alat berkebun', 'sun', 3, true),
  ('Meja & Perabot', 'meja-perabot', 'Meja lipat portable belajar, laptop, ngaji dan perabot serbaguna', 'table', 4, true),
  ('Produk Lainnya', 'produk-lainnya', 'Produk kebutuhan harian pilihan toko lainnya', 'package', 5, true)
on conflict (slug) do nothing;

-- Initial store settings
insert into public.store_settings (key, value) values
  ('store_title', '"INABA STORE — Toko Multikategori"'::jsonb),
  ('contact_whatsapp', '"6285735144904"'::jsonb),
  ('announcement_text', '"Toko Multikategori INABA: Ready Stock Busana Muslim, Pre-Order Seragam Sekolah (SDIT, TPQ, Madin), Capel Petani & Meja Lipat."'::jsonb),
  ('payment_accounts', '[{"label":"Konfirmasi Pembayaran","detail":"Nomor rekening transfer resmi (BCA/BRI/Mandiri/QRIS) akan diinformasikan langsung oleh admin via WhatsApp setelah total pesanan dan ongkir dihitung."}]'::jsonb)
on conflict (key) do nothing;

-- Drop prototype policies BEFORE changing ID column types. PostgreSQL blocks column type changes
-- while row-level policies still depend on those columns. Duplicate DROP statements below are harmless.
drop policy if exists "Read own profile or admin reads all" on public.profiles;
drop policy if exists "Users update own profile name only" on public.profiles;
drop policy if exists "Profiles readable by owner or admin" on public.profiles;
drop policy if exists "Firebase users create own profile" on public.profiles;
drop policy if exists "Firebase users update own profile" on public.profiles;
drop policy if exists "Public can read active products" on public.products;
drop policy if exists "Admins insert products" on public.products;
drop policy if exists "Admins update products" on public.products;
drop policy if exists "Admins delete products" on public.products;
drop policy if exists "Only admins insert products" on public.products;
drop policy if exists "Only admins update products" on public.products;
drop policy if exists "Only admins delete products" on public.products;
drop policy if exists "Customers read own orders, admins read all" on public.orders;
drop policy if exists "Admins update order status" on public.orders;
drop policy if exists "Users read their order items" on public.order_items;
drop policy if exists "Users read own order items" on public.order_items;
drop policy if exists "Anyone may submit a tailoring request" on public.tailoring_requests;
drop policy if exists "Admins read tailoring requests" on public.tailoring_requests;
drop policy if exists "Admins update tailoring request status" on public.tailoring_requests;
drop policy if exists "Anyone can request tailoring" on public.tailoring_requests;
drop policy if exists "Owners or admins read tailoring requests" on public.tailoring_requests;
drop policy if exists "Admins update tailoring status" on public.tailoring_requests;
drop policy if exists "Anyone can subscribe to INABA updates" on public.newsletter_subscribers;
drop policy if exists "Admins can read INABA newsletter subscribers" on public.newsletter_subscribers;
drop policy if exists "Only admins read newsletter subscribers" on public.newsletter_subscribers;
drop policy if exists "Public can read site images" on public.site_images;
drop policy if exists "Admins insert site images" on public.site_images;
drop policy if exists "Admins update site images" on public.site_images;

-- SECURITY HARDENING: this setup script owns RLS policies for the tables listed below.
-- Drop any unknown legacy/custom policy on these tables before changing column types or rebuilding rules.
-- This is intentionally broad; review/backup the project before running on an existing production database.
do $$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any (array['profiles','products','orders','order_items','tailoring_requests','newsletter_subscribers','site_images'])
  loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

-- Normalize user-id columns for both older prototypes and this Supabase-Auth version.
-- Drop legacy FK names first; Supabase Auth identity is also checked in RLS policies below.
alter table public.profiles add column if not exists email text not null default '';
alter table public.profiles add column if not exists full_name text not null default '';
alter table public.profiles add column if not exists role text not null default 'customer';
alter table public.profiles add column if not exists created_at timestamptz not null default now();
update public.profiles set email = '' where email is null;
update public.profiles set full_name = '' where full_name is null;
update public.profiles set role = 'customer' where role is null or role not in ('customer','admin');
alter table public.profiles alter column email set default '';
alter table public.profiles alter column email set not null;
alter table public.profiles alter column full_name set default '';
alter table public.profiles alter column full_name set not null;
alter table public.profiles alter column role set default 'customer';
alter table public.profiles alter column role set not null;
alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles alter column id type text using id::text;
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('customer','admin'));

alter table public.orders drop constraint if exists orders_user_id_fkey;
alter table public.orders alter column user_id type text using user_id::text;
alter table public.tailoring_requests drop constraint if exists tailoring_requests_user_id_fkey;
alter table public.tailoring_requests alter column user_id type text using user_id::text;

-- Buka batasan kategori kaku agar toko menjadi multikategori
alter table public.products drop constraint if exists products_category_check;
update public.products set category = case
  when category = 'Atasan' then 'Koko & Kurta'
  when category = 'Bawahan' then 'Gamis Pria'
  when category = 'Outerwear' then 'Gamis Wanita'
  when category = 'Made to order' then 'Gamis Wanita'
  else category end
where category in ('Atasan','Bawahan','Outerwear','Made to order');

-- Kolom stok dan pre-order pada produk
alter table public.products add column if not exists stock integer not null default 0 check (stock >= 0);
alter table public.products add column if not exists is_preorder boolean not null default false;
alter table public.products add column if not exists preorder_status text not null default 'open';
alter table public.products drop constraint if exists products_preorder_status_check;
alter table public.products add constraint products_preorder_status_check check (preorder_status in ('open','closed','completed'));
alter table public.products add column if not exists preorder_start timestamptz;
alter table public.products add column if not exists preorder_end timestamptz;
alter table public.products add column if not exists estimated_delivery text default '';
alter table public.products add column if not exists school_institution text default '';
alter table public.products add column if not exists min_order integer not null default 1 check (min_order >= 1);
alter table public.products add column if not exists size_guide text default '';
alter table public.products add column if not exists specifications jsonb default '{}'::jsonb;
alter table public.products add column if not exists gallery_urls jsonb default '[]'::jsonb;

-- Ukuran item pesanan fleksibel (bisa pakaian, seragam anak/dewasa, capel, maupun meja lipat)
alter table public.order_items add column if not exists variant_size text not null default 'M';
alter table public.order_items drop constraint if exists order_items_variant_size_check;
alter table public.order_items add column if not exists is_preorder boolean not null default false;
alter table public.order_items add column if not exists school_institution text default '';

create index if not exists products_active_featured_idx on public.products (is_active, featured desc, created_at desc);
create index if not exists orders_user_created_idx on public.orders (user_id, created_at desc);
create index if not exists tailoring_created_idx on public.tailoring_requests (created_at desc);

-- Create/update a profile only from the trusted auth.users trigger. Browser metadata cannot set role.
-- Admin role is based on the exact allowlist emails so login can work without confirmation emails.
-- Reserve those Auth accounts in the Dashboard BEFORE allowing public signup, as email ownership
-- cannot be proven when Confirm email is disabled.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_email text := lower(coalesce(new.email,''));
  v_name text := coalesce(new.raw_user_meta_data ->> 'full_name','');
  v_role text := case
    when v_email in ('numanalmuqorrin@gmail.com','inabahijab@gmail.com')
    then 'admin' else 'customer' end;
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id::text, v_email, v_name, v_role)
  on conflict (id) do update set
    email = excluded.email,
    full_name = case when excluded.full_name <> '' then excluded.full_name else public.profiles.full_name end,
    role = excluded.role;
  return new;
end;
$$;

-- Remove the previous trigger/function name, then sync both signup and email-confirmation events.
drop trigger if exists on_auth_user_created_inaba on auth.users;
create trigger on_auth_user_created_inaba
  after insert or update of email, email_confirmed_at, raw_user_meta_data on auth.users
  for each row execute function public.handle_new_user();

-- Reset existing profile roles and synchronize actual Supabase Auth users.
-- This also upgrades users who signed up before this SQL was run.
update public.profiles set role = 'customer';
insert into public.profiles (id, email, full_name, role)
select
  u.id::text,
  lower(coalesce(u.email,'')),
  coalesce(u.raw_user_meta_data ->> 'full_name',''),
  case when lower(coalesce(u.email,'')) in ('numanalmuqorrin@gmail.com','inabahijab@gmail.com')
    then 'admin' else 'customer' end
from auth.users u
on conflict (id) do update set
  email = excluded.email,
  full_name = case when excluded.full_name <> '' then excluded.full_name else public.profiles.full_name end,
  role = excluded.role;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.profiles p
    join auth.users u on u.id::text = p.id
    where p.id = (select auth.uid())::text
      and p.role = 'admin'
      and lower(coalesce(u.email,'')) in ('numanalmuqorrin@gmail.com','inabahijab@gmail.com')
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Create orders through a server-side function: price/name are taken from current DB rows, not browser values.
create or replace function public.create_order(
  p_items jsonb,
  p_customer_name text,
  p_phone text,
  p_address text,
  p_notes text default ''
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_user text := (select auth.uid())::text;
  v_order uuid;
  v_item record;
  v_product public.products%rowtype;
  v_total bigint := 0;
  v_count integer := 0;
  v_size text;
begin
  if v_user is null then raise exception 'Login diperlukan untuk membuat pesanan.'; end if;
  if char_length(trim(coalesce(p_customer_name,''))) not between 1 and 120 then raise exception 'Nama penerima tidak valid.'; end if;
  if char_length(trim(coalesce(p_phone,''))) not between 5 and 40 then raise exception 'Nomor telepon tidak valid.'; end if;
  if char_length(trim(coalesce(p_address,''))) not between 5 and 1500 then raise exception 'Alamat tidak valid.'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 30 then raise exception 'Daftar barang tidak valid.'; end if;
  insert into public.orders(user_id, customer_name, phone, address, notes, subtotal)
  values (v_user, trim(p_customer_name), trim(p_phone), trim(p_address), left(coalesce(p_notes,''),2000), 0)
  returning id into v_order;
  for v_item in select * from jsonb_to_recordset(p_items) as x(product_id uuid, quantity integer, size text, is_preorder boolean, school_institution text) loop
    v_count := v_count + 1;
    if v_count > 30 then raise exception 'Terlalu banyak jenis barang.'; end if;
    if v_item.quantity is null or v_item.quantity < 1 or v_item.quantity > 50 then raise exception 'Jumlah barang tidak valid.'; end if;
    select * into v_product from public.products where id = v_item.product_id and is_active = true for update;
    if not found then raise exception 'Salah satu produk tidak tersedia lagi.'; end if;

    -- Validasi tipe pesanan: pre-order vs ready stock
    if coalesce(v_product.is_preorder, false) = true then
      if coalesce(v_product.preorder_status, 'open') <> 'open' then
        raise exception 'Pre-order untuk % saat ini sedang ditutup.', v_product.name;
      end if;
      if v_product.min_order > 1 and v_item.quantity < v_product.min_order then
        raise exception 'Minimal pemesanan pre-order % adalah % pcs.', v_product.name, v_product.min_order;
      end if;
    else
      if v_product.stock <= 0 then raise exception '% sudah habis.', v_product.name; end if;
      if v_product.stock < v_item.quantity then raise exception 'Stok % tinggal % pcs.', v_product.name, v_product.stock; end if;
      update public.products set stock = stock - v_item.quantity where id = v_product.id;
    end if;

    v_total := v_total + (v_product.price * v_item.quantity);
    if v_total > 100000000000 then raise exception 'Nilai pesanan melebihi batas.'; end if;
    v_size := left(trim(coalesce(v_item.size, 'Standar')), 60);
    insert into public.order_items(order_id, product_id, product_name, quantity, variant_size, unit_price, is_preorder, school_institution)
    values (v_order, v_product.id, v_product.name, v_item.quantity, v_size, v_product.price, coalesce(v_product.is_preorder, false), coalesce(v_product.school_institution, ''));
  end loop;
  update public.orders set subtotal = v_total where id = v_order;
  return v_order;
end;
$$;
revoke all on function public.create_order(jsonb,text,text,text,text) from public, anon, authenticated;
grant execute on function public.create_order(jsonb,text,text,text,text) to authenticated;

-- Restore ready-stock inventory when an order is cancelled
create or replace function public.handle_order_cancellation()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.products p
    set stock = p.stock + oi.quantity
    from public.order_items oi
    where oi.order_id = new.id
      and oi.product_id = p.id
      and coalesce(oi.is_preorder, false) = false;
  elsif old.status = 'cancelled' and new.status <> 'cancelled' then
    raise exception 'Pesanan yang telah dibatalkan tidak dapat diaktifkan kembali secara otomatis.';
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_status_cancelled on public.orders;
create trigger on_order_status_cancelled
  before update of status on public.orders
  for each row execute function public.handle_order_cancellation();

-- Remove policy names used by both the old Firebase prototype and the earlier Supabase prototype.
-- RLS policies are OR-combined; dropping old policies is important for not leaving an old permissive rule active.
drop policy if exists "Read own profile or admin reads all" on public.profiles;
drop policy if exists "Users update own profile name only" on public.profiles;
drop policy if exists "Profiles readable by owner or admin" on public.profiles;
drop policy if exists "Firebase users create own profile" on public.profiles;
drop policy if exists "Firebase users update own profile" on public.profiles;
drop policy if exists "Public can read active products" on public.products;
drop policy if exists "Admins insert products" on public.products;
drop policy if exists "Admins update products" on public.products;
drop policy if exists "Admins delete products" on public.products;
drop policy if exists "Only admins insert products" on public.products;
drop policy if exists "Only admins update products" on public.products;
drop policy if exists "Only admins delete products" on public.products;
drop policy if exists "Customers read own orders, admins read all" on public.orders;
drop policy if exists "Admins update order status" on public.orders;
drop policy if exists "Users read their order items" on public.order_items;
drop policy if exists "Users read own order items" on public.order_items;
drop policy if exists "Anyone may submit a tailoring request" on public.tailoring_requests;
drop policy if exists "Admins read tailoring requests" on public.tailoring_requests;
drop policy if exists "Admins update tailoring request status" on public.tailoring_requests;
drop policy if exists "Anyone can request tailoring" on public.tailoring_requests;
drop policy if exists "Owners or admins read tailoring requests" on public.tailoring_requests;
drop policy if exists "Admins update tailoring status" on public.tailoring_requests;
drop policy if exists "Anyone can subscribe to INABA updates" on public.newsletter_subscribers;
drop policy if exists "Admins can read INABA newsletter subscribers" on public.newsletter_subscribers;
drop policy if exists "Only admins read newsletter subscribers" on public.newsletter_subscribers;

-- RLS and least-privilege grants.
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.tailoring_requests enable row level security;
alter table public.newsletter_subscribers enable row level security;

revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
create policy "Read own profile or admin reads all" on public.profiles for select to authenticated
  using (id = (select auth.uid())::text or (select public.is_admin()));
create policy "Users update own profile name only" on public.profiles for update to authenticated
  using (id = (select auth.uid())::text) with check (id = (select auth.uid())::text);

revoke all on public.products from public, anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, delete on public.products to authenticated;
grant update (
  name, slug, category, description, price, image_url, badge, featured,
  is_active, stock, is_preorder, preorder_status, preorder_start, preorder_end,
  estimated_delivery, school_institution, min_order, size_guide, specifications, gallery_urls
) on public.products to authenticated;
create policy "Public can read active products" on public.products for select to anon, authenticated
  using (is_active = true or (select public.is_admin()));
create policy "Admins insert products" on public.products for insert to authenticated
  with check ((select public.is_admin()));
create policy "Admins update products" on public.products for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete products" on public.products for delete to authenticated
  using ((select public.is_admin()));

-- RLS & Grants untuk categories
alter table public.categories enable row level security;
revoke all on public.categories from public, anon, authenticated;
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
create policy "Public can read active categories" on public.categories for select to anon, authenticated
  using (is_active = true or (select public.is_admin()));
create policy "Admins insert categories" on public.categories for insert to authenticated
  with check ((select public.is_admin()));
create policy "Admins update categories" on public.categories for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete categories" on public.categories for delete to authenticated
  using ((select public.is_admin()));

-- RLS & Grants untuk store_settings
alter table public.store_settings enable row level security;
revoke all on public.store_settings from public, anon, authenticated;
grant select on public.store_settings to anon, authenticated;
grant insert, update on public.store_settings to authenticated;
create policy "Public can read store settings" on public.store_settings for select to anon, authenticated
  using (true);
create policy "Admins modify store settings" on public.store_settings for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

revoke all on public.orders from public, anon, authenticated;
revoke all on public.order_items from public, anon, authenticated;
grant select, update (status) on public.orders to authenticated;
grant select on public.order_items to authenticated;
create policy "Customers read own orders, admins read all" on public.orders for select to authenticated
  using (user_id = (select auth.uid())::text or (select public.is_admin()));
create policy "Admins update order status" on public.orders for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Users read their order items" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid())::text or (select public.is_admin()))));

revoke all on public.tailoring_requests from public, anon, authenticated;
grant insert, select on public.tailoring_requests to anon, authenticated;
grant update (status) on public.tailoring_requests to authenticated;
create policy "Anyone may submit a tailoring request" on public.tailoring_requests for insert to anon, authenticated
  with check ((user_id is null) or (user_id = (select auth.uid())::text));
create policy "Admins read tailoring requests" on public.tailoring_requests for select to authenticated
  using ((select public.is_admin()) or user_id = (select auth.uid())::text);
create policy "Admins update tailoring request status" on public.tailoring_requests for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

revoke all on public.newsletter_subscribers from public, anon, authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;
create policy "Anyone can subscribe to INABA updates" on public.newsletter_subscribers
  for insert to anon, authenticated
  with check (char_length(email) between 5 and 254 and email = lower(email));
grant select on public.newsletter_subscribers to authenticated;
create policy "Admins can read INABA newsletter subscribers" on public.newsletter_subscribers
  for select to authenticated using ((select public.is_admin()));

alter table public.site_images enable row level security;
revoke all on public.site_images from public, anon, authenticated;
grant select on public.site_images to anon, authenticated;
grant insert, update on public.site_images to authenticated;
create policy "Public can read site images" on public.site_images for select to anon, authenticated
  using (true);
create policy "Admins insert site images" on public.site_images for insert to authenticated
  with check ((select public.is_admin()));
create policy "Admins update site images" on public.site_images for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Public product and site images; only admin allowlist accounts can upload, replace, or delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];
drop policy if exists "Product images are publicly readable" on storage.objects;
drop policy if exists "Admins upload product images" on storage.objects;
drop policy if exists "Admins update product images" on storage.objects;
drop policy if exists "Admins delete product images" on storage.objects;
create policy "Product images are publicly readable" on storage.objects for select to public
  using (bucket_id = 'product-images');
create policy "Admins upload product images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "Admins update product images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "Admins delete product images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images','site-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];
drop policy if exists "Site images are publicly readable" on storage.objects;
drop policy if exists "Admins upload site images" on storage.objects;
drop policy if exists "Admins update site images" on storage.objects;
drop policy if exists "Admins delete site images" on storage.objects;
create policy "Site images are publicly readable" on storage.objects for select to public
  using (bucket_id = 'site-images');
create policy "Admins upload site images" on storage.objects for insert to authenticated
  with check (bucket_id = 'site-images' and (select public.is_admin()));
create policy "Admins update site images" on storage.objects for update to authenticated
  using (bucket_id = 'site-images' and (select public.is_admin()))
  with check (bucket_id = 'site-images' and (select public.is_admin()));
create policy "Admins delete site images" on storage.objects for delete to authenticated
  using (bucket_id = 'site-images' and (select public.is_admin()));

-- Obsolete Firebase-only helper is not used by this site. Revoke old grants only if it exists.
do $$ begin
  if to_regprocedure('public.current_firebase_uid()') is not null then
    execute 'revoke all on function public.current_firebase_uid() from public, anon, authenticated';
  end if;
end $$;

-- IMPORTANT: This setup supports Confirm email = OFF. Before enabling public signup, reserve these two
-- exact accounts in Authentication > Users with passwords known only to the store owner:
-- numanalmuqorrin@gmail.com, inabahijab@gmail.com
-- Once reserved, both emails receive the admin role; every other email receives customer role.
-- Public signup must not be used to create the initial admin accounts if their email addresses are not reserved yet.

-- Produk katalog awal untuk toko multikategori (Pre-Order Seragam SDIT/TPQ/Madin, Capel Petani & Meja Lipat)
insert into public.products (
  name, slug, category, description, price, stock, badge, featured, is_active,
  is_preorder, preorder_status, school_institution, estimated_delivery, min_order, size_guide, specifications, image_url
) values
(
  'Baju Seragam SDIT Al-Hidayah (Pre-Order)',
  'seragam-sdit-al-hidayah-po',
  'Seragam Sekolah — Pre-Order',
  'Seragam resmi SDIT Al-Hidayah putra dan putri. Menggunakan bahan Oxford Super tebal dan adem, tidak mudah kusut, jahitan dobel rapi, lengkap dengan emblem bordir sekolah.',
  125000,
  0,
  'PRE-ORDER SDIT',
  true,
  true,
  true,
  'open',
  'SDIT Al-Hidayah',
  '14 hari kerja setelah tutup PO',
  1,
  'Panduan Ukuran: Anak-1 (LD 72 PB 48), Anak-2 (LD 76 PB 52), Anak-3 (LD 80 PB 56), Anak-4 (LD 84 PB 60), Anak-5 (LD 88 PB 64), S (LD 92 PB 68), M (LD 96 PB 70), L (LD 102 PB 72), XL (LD 108 PB 74)',
  '{"bahan": "Oxford Super & Katun Twill", "model": "Setelan Putra & Putri", "kelengkapan": "Kemeja + Celana/Rok + Dasi/Jilbab", "warna": "Putih Hijau / Khaki"}'::jsonb,
  'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80'
),
(
  'Seragam Santri TPQ / TPA Binaan (Pre-Order)',
  'seragam-santri-tpq-po',
  'Seragam Sekolah — Pre-Order',
  'Seragam santri mengaji TPQ model gamis / setelan koko kurta anak. Bahan Toyobo Fodu adem dan menyerap keringat, nyaman digunakan untuk aktivitas mengaji harian.',
  95000,
  0,
  'PRE-ORDER TPQ',
  true,
  true,
  true,
  'open',
  'TPQ & Madrasah Binaan',
  '10-14 hari kerja',
  1,
  'Panduan Ukuran: S (Usia 4-6 th, LD 70 PB 75), M (Usia 7-9 th, LD 78 PB 90), L (Usia 10-12 th, LD 86 PB 105), XL (Usia 13-15 th, LD 92 PB 118)',
  '{"bahan": "Katun Toyobo Fodu Import", "model": "Gamis Santri Putri & Koko Kurta Putra", "warna": "Hijau Sage, Putih Bersih, Biru Wardah"}'::jsonb,
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80'
),
(
  'Seragam Madrasah Diniyah Sirimbit Keluarga (Pre-Order)',
  'seragam-madin-sirimbit-keluarga-po',
  'Seragam Sekolah — Pre-Order',
  'Setelan seragam Madrasah Diniyah kombinasi sirimbit keluarga (serasi santri dan orang tua). Desain syari rapi, aksen lis elegan, bahan lembut dan adem saat dipakai.',
  145000,
  0,
  'PRE-ORDER MADIN',
  true,
  true,
  true,
  'open',
  'Madrasah Diniyah Sirimbit Keluarga',
  '14-21 hari kerja',
  1,
  'Panduan Ukuran: Tersedia ukuran santri (S-XL) dan ukuran dewasa sirimbit orang tua (S, M, L, XL, XXL).',
  '{"bahan": "Katun Madinah Premium kombinasi Linen", "model": "Sirimbit Santri & Keluarga", "warna": "Navy Abu, Mocca Khaki, Emerald Gold"}'::jsonb,
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80'
),
(
  'Capel Petani Anyaman Bambu Tradisional',
  'capel-petani-anyaman-bambu-tradisional',
  'Perlengkapan Petani',
  'Topi capel petani tradisional terbuat dari anyaman bambu pilihan dengan lapisan kain anti-air di bagian dalam. Menahan terik panas matahari secara maksimal dan tahan gerimis ringan saat bekerja di sawah atau kebun.',
  35000,
  45,
  'READY STOCK',
  true,
  true,
  false,
  'open',
  '',
  '',
  1,
  'Diameter luar 48 cm, lingkar kepala dalam fleksibel dengan tali dagu kain.',
  '{"bahan": "Anyaman bambu alami + furing kain anti-air", "diameter": "48 cm", "fitur": "Tali dagu pengikat, ventilasi sejuk, ringan hanya 180 gram"}'::jsonb,
  'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80'
),
(
  'Meja Lipat Serbaguna Portable 60x40 cm',
  'meja-lipat-serbaguna-portable-60x40',
  'Meja & Perabot',
  'Meja lipat portable multifungsi ukuran 60x40 cm dengan kaki aluminium kokoh berbalut busa anti-slip. Dilengkapi slot penyimpanan tablet/buku dan tempat cangkir minum. Sangat cocok untuk meja belajar anak, meja laptop, meja ngaji TPQ, atau meja dagang lesehan.',
  68000,
  30,
  'READY STOCK',
  true,
  true,
  false,
  'open',
  '',
  '',
  1,
  'Dimensi permukaan: 60 cm x 40 cm, Tinggi kaki: 28 cm. Dilipat: 60 x 40 x 5 cm.',
  '{"bahan": "Papan MDF High Density tebal 12mm + Rangka pipa paduan aluminium", "kapasitas": "Maksimal beban 25 kg", "fitur": "Slot tablet 27 cm, cup holder, busa kaki anti-slip"}'::jsonb,
  'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80'
)
on conflict (slug) do nothing;

