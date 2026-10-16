-- ====================================================================
-- INABA HIJAB — UNIFIED PRODUCTION DATABASE SETUP (SUPABASE ONLY)
-- Skrip Tunggal Lengkap untuk dijalankan di Supabase SQL Editor.
-- Mendukung:
-- 1. Autentikasi Pengguna & Profil (allowlist server-side + email terverifikasi)
-- 2. Keranjang Belanja Berbasis Database (public.cart_items) untuk pengguna terdaftar
-- 3. Katalog Multikategori Dinamis (categories, products, store_settings)
-- 4. Pre-Order Seragam Sekolah & Ready Stock Inventori
-- 5. Transaksi Atomik Checkout (create_order) & Pemulihan Stok Pembatalan (handle_order_cancellation)
-- 6. Storage Bucket untuk Foto Produk & Banner Website
-- 7. Row-Level Security (RLS) Menyeluruh & Aman
-- ====================================================================

create extension if not exists pgcrypto;

-- 1. TABEL PROFIL PENGGUNA
create table if not exists public.profiles (
  id text primary key,
  email text not null default '',
  full_name text not null default '',
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

-- 2. TABEL KATEGORI DINAMIS
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

create index if not exists categories_order_idx on public.categories (display_order asc, name asc);

-- 3. TABEL PRODUK MULTIKATEGORI & PRE-ORDER
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  slug text not null unique,
  category text not null check (char_length(category) between 1 and 80),
  description text not null default '',
  price bigint not null check (price between 0 and 100000000000),
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
  min_order integer not null default 1 check (min_order between 1 and 50),
  size_guide text default '',
  specifications jsonb default '{}'::jsonb,
  gallery_urls jsonb default '[]'::jsonb,
  variants jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Penyesuaian skema produk jika tabel lama sudah ada sebelumnya.
-- NOT VALID menjaga migrasi tidak langsung gagal bila data legacy berada di luar batas;
-- constraint tetap diterapkan ke INSERT/UPDATE baru, dan checkout memvalidasi ulang nilai lama.
alter table public.products drop constraint if exists products_price_check;
alter table public.products drop constraint if exists products_price_bounds_check;
alter table public.products add constraint products_price_bounds_check check (price between 0 and 100000000000) not valid;
alter table public.products drop constraint if exists products_min_order_check;
alter table public.products drop constraint if exists products_min_order_bounds_check;
alter table public.products add constraint products_min_order_bounds_check check (min_order between 1 and 50) not valid;
alter table public.products drop constraint if exists products_category_check;
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
alter table public.products add column if not exists variants jsonb not null default '[]'::jsonb;
alter table public.products drop constraint if exists products_variants_array_check;
alter table public.products add constraint products_variants_array_check check (jsonb_typeof(variants) = 'array');

-- Ganti nama kategori turut menyelaraskan products.category di transaksi yang sama.
create or replace function public.sync_product_category_name()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.name is distinct from old.name then
    update public.products set category = new.name where category = old.name;
  end if;
  return new;
end;
$$;
revoke all on function public.sync_product_category_name() from public, anon, authenticated;

drop trigger if exists on_category_name_changed on public.categories;
create trigger on_category_name_changed
  after update of name on public.categories
  for each row execute function public.sync_product_category_name();

-- 4. TABEL PESANAN & ITEM PESANAN
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
  variant_size text not null,
  unit_price bigint not null check (unit_price >= 0),
  is_preorder boolean not null default false,
  school_institution text default '',
  created_at timestamptz not null default now()
);

alter table public.order_items drop constraint if exists order_items_variant_size_check;
alter table public.order_items alter column variant_size drop default;
alter table public.order_items add column if not exists is_preorder boolean not null default false;
alter table public.order_items add column if not exists school_institution text default '';

-- Indeks untuk katalog, riwayat pesanan, dan join item pesanan.
create index if not exists products_active_featured_created_idx
  on public.products (is_active, featured desc, created_at desc);
create index if not exists products_category_idx on public.products (category);
create index if not exists orders_user_created_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_created_idx on public.orders (status, created_at desc);
create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists order_items_product_idx on public.order_items (product_id);

-- 5. TABEL KERANJANG BELANJA (CART ITEMS) BERBASIS DATABASE
-- Keranjang hanya dapat digunakan oleh pengguna yang telah login.
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity between 1 and 50),
  size text not null,
  is_preorder boolean not null default false,
  school_institution text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, product_id, size)
);

-- Hapus default varian statis lama dan batas lama yang terlalu longgar.
alter table public.cart_items alter column size drop default;
alter table public.cart_items drop constraint if exists cart_items_quantity_check;
alter table public.cart_items drop constraint if exists cart_items_quantity_bounds_check;
alter table public.cart_items add constraint cart_items_quantity_bounds_check check (quantity between 1 and 50) not valid;

create index if not exists cart_items_user_idx on public.cart_items (user_id);

-- Validasi sisi database agar item keranjang tidak dapat memakai varian palsu atau produk nonaktif.
create or replace function public.validate_cart_item_variant()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_product public.products%rowtype;
  v_size text;
begin
  if new.user_id is distinct from (select auth.uid())::text then
    raise exception 'Keranjang hanya dapat mengubah item milik akun yang sedang login.';
  end if;
  if new.quantity is null or new.quantity < 1 or new.quantity > 50 then
    raise exception 'Jumlah keranjang harus berada pada rentang 1–50 pcs.';
  end if;
  select * into v_product from public.products p where p.id = new.product_id and p.is_active = true;
  if not found then raise exception 'Produk tidak tersedia atau sudah dinonaktifkan.'; end if;
  if v_product.variants is null or jsonb_typeof(v_product.variants) is distinct from 'array'
     or jsonb_array_length(v_product.variants) < 1 then
    raise exception 'Pilihan ukuran/varian produk belum diatur admin.';
  end if;
  v_size := btrim(coalesce(new.size, ''));
  if v_size = '' or char_length(v_size) > 60 or not exists (
    select 1 from jsonb_array_elements_text(v_product.variants) as variant_option(value)
    where variant_option.value = v_size
  ) then
    raise exception 'Pilihan ukuran/varian tidak sesuai dengan data produk.';
  end if;
  if coalesce(v_product.is_preorder, false) then
    if coalesce(v_product.preorder_status, 'open') <> 'open' then
      raise exception 'Pre-order produk ini sedang ditutup.';
    end if;
    if v_product.min_order < 1 or v_product.min_order > 50 or new.quantity < v_product.min_order then
      raise exception 'Jumlah belum memenuhi batas pre-order yang ditetapkan admin.';
    end if;
  else
    if v_product.stock <= 0 or new.quantity > v_product.stock then
      raise exception 'Jumlah melebihi stok produk yang tersedia.';
    end if;
  end if;
  new.size := v_size;
  return new;
end;
$$;
revoke all on function public.validate_cart_item_variant() from public, anon, authenticated;
drop trigger if exists on_cart_item_validate_variant on public.cart_items;
create trigger on_cart_item_validate_variant
  before insert or update of user_id, product_id, quantity, size on public.cart_items
  for each row execute function public.validate_cart_item_variant();

-- 6. TABEL PERMINTAAN JAHIT (CUSTOM/ALTERASI)
create table if not exists public.tailoring_requests (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  phone text not null check (char_length(phone) between 5 and 40),
  address text not null check (char_length(address) between 5 and 1500),
  garment_type text not null default 'Gamis',
  fabric_source text not null default 'Bawa sendiri',
  target_date date,
  notes text not null default '',
  status text not null default 'submitted' check (status in ('submitted','reviewed','estimated','approved','in_progress','completed','cancelled')),
  created_at timestamptz not null default now()
);

-- 7. TABEL WARTA & NEWSLETTER
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  created_at timestamptz not null default now()
);

-- 8. TABEL GAMBAR WEBSITE (BANNER & HERO DINAMIS)
create table if not exists public.site_images (
  key text primary key,
  label text not null,
  image_url text not null,
  updated_at timestamptz not null default now()
);
alter table public.site_images drop constraint if exists site_images_key_check;

-- 9. TABEL PENGATURAN TOKO DINAMIS
create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Satu sumber konfigurasi email admin. Tabel tidak dapat dibaca/diubah lewat API browser.
create table if not exists public.admin_email_allowlist (
  email text primary key check (email = lower(btrim(email)) and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'),
  created_at timestamptz not null default now()
);
alter table public.admin_email_allowlist enable row level security;
revoke all on public.admin_email_allowlist from public, anon, authenticated;
insert into public.admin_email_allowlist (email) values
  ('numanalmuqorrin@gmail.com'),
  ('inabahijab@gmail.com')
on conflict (email) do nothing;

-- ====================================================================
-- FUNGSI & OTORISASI ADMIN
-- ====================================================================

-- Validasi hak admin dari sisi server database (bukan dari browser)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from auth.users u
    where u.id = (select auth.uid())
      and u.email_confirmed_at is not null
      and exists (
        select 1 from public.admin_email_allowlist a
        where a.email = lower(coalesce(u.email, ''))
      )
  );
$$;
revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- Trigger pembuatan profil otomatis; admin hanya ditetapkan bila email terverifikasi dan ada di allowlist server
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_role text := 'customer';
begin
  if new.email_confirmed_at is not null and exists (
    select 1 from public.admin_email_allowlist a where a.email = lower(coalesce(new.email, ''))
  ) then
    v_role := 'admin';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id::text,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''), '@', 1)),
    v_role
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role;

  return new;
end;
$$;

-- Role admin hanya diberikan pada email allowlist setelah Supabase menandai email terverifikasi.
-- User tidak bisa mengubah email_confirmed_at atau role profil melalui frontend/RLS.
create or replace function public.sync_profile_role_from_app_metadata()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_role text := 'customer';
begin
  if new.email_confirmed_at is not null and exists (
    select 1 from public.admin_email_allowlist a where a.email = lower(coalesce(new.email, ''))
  ) then
    v_role := 'admin';
  end if;

  update public.profiles
  set email = coalesce(new.email, ''), role = v_role
  where id = new.id::text;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.sync_profile_role_from_app_metadata() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists on_auth_user_admin_metadata_updated on auth.users;
drop trigger if exists on_auth_user_email_verified on auth.users;
drop trigger if exists on_auth_user_role_sync on auth.users;
create trigger on_auth_user_role_sync
  after update of raw_app_meta_data, email, email_confirmed_at on auth.users
  for each row execute function public.sync_profile_role_from_app_metadata();

-- Sinkronkan profil lama dan buat profil yang mungkin belum tercipta sebelumnya.
-- Tidak menghapus profil/data; role admin ditetapkan hanya untuk email allowlist yang terverifikasi.
insert into public.profiles (id, email, full_name, role)
select
  u.id::text,
  coalesce(u.email, ''),
  coalesce(nullif(u.raw_user_meta_data->>'full_name', ''), split_part(coalesce(u.email, ''), '@', 1)),
  case
    when u.email_confirmed_at is not null and exists (
      select 1 from public.admin_email_allowlist a where a.email = lower(coalesce(u.email, ''))
    ) then 'admin'
    else 'customer'
  end
from auth.users u
on conflict (id) do update set
  email = excluded.email,
  role = excluded.role;

-- Pemulihan stok barang ready-stock secara otomatis saat pesanan dibatalkan
create or replace function public.handle_order_cancellation()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.products p
    set stock = p.stock + restoration.quantity
    from (
      select oi.product_id, sum(oi.quantity)::integer as quantity
      from public.order_items oi
      where oi.order_id = new.id
        and oi.product_id is not null
        and coalesce(oi.is_preorder, false) = false
      group by oi.product_id
    ) as restoration
    where restoration.product_id = p.id;
  elsif old.status = 'cancelled' and new.status <> 'cancelled' then
    raise exception 'Pesanan yang telah dibatalkan tidak dapat diaktifkan kembali secara otomatis.';
  end if;
  return new;
end;
$$;

revoke all on function public.handle_order_cancellation() from public, anon, authenticated;

drop trigger if exists on_order_status_cancelled on public.orders;
create trigger on_order_status_cancelled
  before update of status on public.orders
  for each row execute function public.handle_order_cancellation();

-- ====================================================================
-- FUNGSI TRANSAKSI CHECKOUT (ATOMIK)
-- ====================================================================
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
  if p_items is null or jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'Daftar barang tidak valid.';
  end if;
  if jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 30 then
    raise exception 'Daftar barang tidak valid.';
  end if;

  insert into public.orders(user_id, customer_name, phone, address, notes, subtotal)
  values (v_user, trim(p_customer_name), trim(p_phone), trim(p_address), left(coalesce(p_notes,''),2000), 0)
  returning id into v_order;

  for v_item in select * from jsonb_to_recordset(p_items) as x(product_id uuid, quantity integer, size text, is_preorder boolean, school_institution text) loop
    v_count := v_count + 1;
    if v_count > 30 then raise exception 'Terlalu banyak jenis barang.'; end if;
    if v_item.quantity is null or v_item.quantity < 1 or v_item.quantity > 50 then raise exception 'Jumlah barang tidak valid.'; end if;

    select * into v_product from public.products where id = v_item.product_id and is_active = true for update;
    if not found then raise exception 'Salah satu produk tidak tersedia lagi.'; end if;
    if v_product.price < 0 or v_product.price > 100000000000 then
      raise exception 'Harga produk % tidak valid di database. Hubungi admin.', v_product.name;
    end if;
    if v_product.min_order < 1 or v_product.min_order > 50 then
      raise exception 'Minimal pemesanan untuk % tidak valid di database. Hubungi admin.', v_product.name;
    end if;

    -- Pilihan ukuran/varian wajib ditetapkan admin di database dan diverifikasi server-side.
    if v_product.variants is null or jsonb_typeof(v_product.variants) is distinct from 'array' then
      raise exception 'Pilihan ukuran/varian untuk % belum dikonfigurasi.', v_product.name;
    end if;
    if jsonb_array_length(v_product.variants) < 1 then
      raise exception 'Pilihan ukuran/varian untuk % belum dikonfigurasi admin.', v_product.name;
    end if;
    v_size := left(trim(coalesce(v_item.size, '')), 60);
    if v_size = '' or not exists (
      select 1 from jsonb_array_elements_text(v_product.variants) as variant_option(value)
      where variant_option.value = v_size
    ) then
      raise exception 'Pilihan ukuran/varian untuk % tidak valid. Pilih ulang dari detail produk.', v_product.name;
    end if;

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
    if v_total > 100000000000 then raise exception 'Nilai pesanan melebihi batas wajar.'; end if;


    insert into public.order_items(order_id, product_id, product_name, quantity, variant_size, unit_price, is_preorder, school_institution)
    values (v_order, v_product.id, v_product.name, v_item.quantity, v_size, v_product.price, coalesce(v_product.is_preorder, false), coalesce(v_product.school_institution, ''));
  end loop;

  update public.orders set subtotal = v_total where id = v_order;

  -- KOSONGKAN KERANJANG PENGGUNA DI DATABASE SECARA OTOMATIS
  delete from public.cart_items where user_id = v_user;

  return v_order;
end;
$$;

revoke all on function public.create_order(jsonb,text,text,text,text) from public, anon, authenticated;
grant execute on function public.create_order(jsonb,text,text,text,text) to authenticated;

-- ====================================================================
-- ROW-LEVEL SECURITY (RLS) & HAK AKSES LEAST-PRIVILEGE
-- ====================================================================
-- Penting: kebijakan RLS PostgreSQL yang permisif digabungkan dengan OR.
-- Bersihkan kebijakan lama pada tabel milik situs ini sebelum membuat kebijakan final;
-- data/bucket tidak dihapus. Semua policy storage.objects di-reset karena kebijakan broad
-- yang tampak menyebut bucket_id pun bisa tetap membuka akses melalui OR antar-policy.
DO $$
DECLARE
  policy_row record;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE (schemaname = 'public' AND tablename = ANY (ARRAY[
      'profiles', 'categories', 'products', 'cart_items', 'orders', 'order_items',
      'tailoring_requests', 'newsletter_subscribers', 'site_images', 'store_settings', 'admin_email_allowlist'
    ]))
       OR (schemaname = 'storage' AND tablename = 'objects')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
      policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  END LOOP;
END $$;

-- 1. Profiles
alter table public.profiles enable row level security;
revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;

drop policy if exists "Profiles readable by owner or admin" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Read own profile or admin reads all" on public.profiles;

create policy "Read own profile or admin reads all" on public.profiles
  for select to authenticated
  using (id = (select auth.uid())::text or (select public.is_admin()));
-- Profile role/email are managed only by trusted Auth triggers, never by a client update.

-- 2. Categories
alter table public.categories enable row level security;
revoke all on public.categories from public, anon, authenticated;
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

drop policy if exists "Public can read active categories" on public.categories;
drop policy if exists "Admins insert categories" on public.categories;
drop policy if exists "Admins update categories" on public.categories;
drop policy if exists "Admins delete categories" on public.categories;

create policy "Public can read active categories" on public.categories
  for select to anon, authenticated
  using (is_active = true or (select public.is_admin()));

create policy "Admins insert categories" on public.categories
  for insert to authenticated
  with check ((select public.is_admin()));

create policy "Admins update categories" on public.categories
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admins delete categories" on public.categories
  for delete to authenticated
  using ((select public.is_admin()));

-- 3. Products
alter table public.products enable row level security;
revoke all on public.products from public, anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

drop policy if exists "Public can read active products" on public.products;
drop policy if exists "Only admins insert products" on public.products;
drop policy if exists "Only admins update products" on public.products;
drop policy if exists "Only admins delete products" on public.products;

create policy "Public can read active products" on public.products
  for select to anon, authenticated
  using (is_active = true or (select public.is_admin()));

create policy "Only admins insert products" on public.products
  for insert to authenticated
  with check ((select public.is_admin()));

create policy "Only admins update products" on public.products
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Only admins delete products" on public.products
  for delete to authenticated
  using ((select public.is_admin()));

-- 4. Cart Items (Khusus Pengguna Login)
alter table public.cart_items enable row level security;
revoke all on public.cart_items from public, anon, authenticated;
grant select, delete on public.cart_items to authenticated;
grant update (quantity, size) on public.cart_items to authenticated;
grant insert (user_id, product_id, quantity, size) on public.cart_items to authenticated;

-- Timestamp keranjang ditetapkan server, bukan dikirim atau dimanipulasi klien.
create or replace function public.touch_cart_item_updated_at()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.touch_cart_item_updated_at() from public, anon, authenticated;
drop trigger if exists on_cart_item_updated_at on public.cart_items;
create trigger on_cart_item_updated_at
  before update on public.cart_items
  for each row execute function public.touch_cart_item_updated_at();

drop policy if exists "Users can manage own cart" on public.cart_items;
create policy "Users can manage own cart" on public.cart_items
  for all to authenticated
  using (user_id = (select auth.uid())::text)
  with check (user_id = (select auth.uid())::text);

-- 5. Orders & Order Items
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
revoke all on public.orders from public, anon, authenticated;
revoke all on public.order_items from public, anon, authenticated;
grant select on public.orders to authenticated;
grant update (status) on public.orders to authenticated;
grant select on public.order_items to authenticated;

drop policy if exists "Customers read own orders, admins read all" on public.orders;
drop policy if exists "Admins update order status" on public.orders;
drop policy if exists "Users read their order items" on public.order_items;

create policy "Customers read own orders, admins read all" on public.orders
  for select to authenticated
  using (user_id = (select auth.uid())::text or (select public.is_admin()));

create policy "Admins update order status" on public.orders
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Users read their order items" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = (select auth.uid())::text or (select public.is_admin()))
    )
  );

-- 6. Tailoring Requests
alter table public.tailoring_requests enable row level security;
revoke all on public.tailoring_requests from public, anon, authenticated;
grant insert (user_id, customer_name, phone, address, garment_type, fabric_source, target_date, notes) on public.tailoring_requests to anon, authenticated;
grant select on public.tailoring_requests to authenticated;
grant update (status) on public.tailoring_requests to authenticated;

drop policy if exists "Anyone can request tailoring" on public.tailoring_requests;
drop policy if exists "Owners or admins read tailoring requests" on public.tailoring_requests;
drop policy if exists "Admins update tailoring status" on public.tailoring_requests;

create policy "Anyone can request tailoring" on public.tailoring_requests
  for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid())::text);

create policy "Owners or admins read tailoring requests" on public.tailoring_requests
  for select to authenticated
  using (user_id = (select auth.uid())::text or (select public.is_admin()));

create policy "Admins update tailoring status" on public.tailoring_requests
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- 7. Newsletter Subscribers
alter table public.newsletter_subscribers enable row level security;
revoke all on public.newsletter_subscribers from public, anon, authenticated;
grant insert (email) on public.newsletter_subscribers to anon, authenticated;
grant select on public.newsletter_subscribers to authenticated;

drop policy if exists "Anyone can subscribe to INABA updates" on public.newsletter_subscribers;
drop policy if exists "Only admins read newsletter subscribers" on public.newsletter_subscribers;

create policy "Anyone can subscribe to INABA updates" on public.newsletter_subscribers
  for insert to anon, authenticated
  with check (
    char_length(email) between 6 and 254
    and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );

create policy "Only admins read newsletter subscribers" on public.newsletter_subscribers
  for select to authenticated
  using ((select public.is_admin()));

-- 8. Site Images (Banner & Promosi)
alter table public.site_images enable row level security;
revoke all on public.site_images from public, anon, authenticated;
grant select on public.site_images to anon, authenticated;
grant insert, update, delete on public.site_images to authenticated;

drop policy if exists "Public can read site images" on public.site_images;
drop policy if exists "Admins manage site images" on public.site_images;

create policy "Public can read site images" on public.site_images
  for select to anon, authenticated using (true);

create policy "Admins manage site images" on public.site_images
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- 9. Store Settings
alter table public.store_settings enable row level security;
revoke all on public.store_settings from public, anon, authenticated;
grant select on public.store_settings to anon, authenticated;
grant insert, update on public.store_settings to authenticated;

drop policy if exists "Public can read store settings" on public.store_settings;
drop policy if exists "Admins modify store settings" on public.store_settings;

create policy "Public can read store settings" on public.store_settings
  for select to anon, authenticated
  using (key in ('store_title', 'contact_whatsapp', 'payment_accounts'));

create policy "Admins modify store settings" on public.store_settings
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ====================================================================
-- STORAGE BUCKETS SETUP (FOTO PRODUK & BANNER SITUS)
-- ====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('site-images', 'site-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Public can read product images" on storage.objects;
drop policy if exists "Admins can upload product images" on storage.objects;
drop policy if exists "Admins can update product images" on storage.objects;
drop policy if exists "Admins can delete product images" on storage.objects;
drop policy if exists "Public can read site images" on storage.objects;
drop policy if exists "Admins can upload site images" on storage.objects;
drop policy if exists "Admins can update site images" on storage.objects;
drop policy if exists "Admins can delete site images" on storage.objects;

create policy "Public can read product images" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

create policy "Admins can upload product images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "Admins can update product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "Admins can delete product images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

create policy "Public can read site images" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'site-images');

create policy "Admins can upload site images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-images' and (select public.is_admin()));

create policy "Admins can update site images" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-images' and (select public.is_admin()))
  with check (bucket_id = 'site-images' and (select public.is_admin()));

create policy "Admins can delete site images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-images' and (select public.is_admin()));

-- ====================================================================
-- SEED DATA AWAL (KATEGORI & PENGATURAN TOKO RESMI)
-- ====================================================================
insert into public.categories (name, slug, description, icon, display_order, is_active) values
  ('Hijab & Pakaian', 'hijab-pakaian', 'Koleksi busana muslim, gamis pria/wanita, koko, kurta dan hijab pilihan', 'sparkles', 1, true),
  ('Seragam Sekolah — Pre-Order', 'seragam-sekolah', 'Pre-order seragam resmi SDIT, TPQ, dan Madrasah Diniyah Sirimbit Keluarga', 'graduation-cap', 2, true),
  ('Perlengkapan Petani', 'perlengkapan-petani', 'Topi capel petani tradisional anyaman bambu & alat perlindungan kebun', 'sun', 3, true),
  ('Meja & Perabot', 'meja-perabot', 'Meja lipat portable multifungsi untuk belajar, laptop, ngaji, dan dagang', 'table', 4, true),
  ('Produk Lainnya', 'produk-lainnya', 'Kebutuhan harian dan perlengkapan pilihan lainnya', 'package', 5, true)
-- Jangan menimpa kategori toko yang sudah ada dan hindari konflik nama/slug lama.
on conflict do nothing;

insert into public.site_images (key, label, image_url) values
  ('hero', 'Foto Utama Beranda', ''),
  ('preorder_banner', 'Banner Pre-Order Seragam Sekolah', ''),
  ('farmer_banner', 'Banner Perlengkapan Petani & Capel', ''),
  ('table_banner', 'Banner Meja Lipat & Perabot', '')
on conflict (key) do nothing;

insert into public.store_settings (key, value) values
  ('store_title', '"INABA HIJAB"'::jsonb),
  ('contact_whatsapp', '""'::jsonb),
  ('payment_accounts', '[]'::jsonb)
on conflict (key) do nothing;
