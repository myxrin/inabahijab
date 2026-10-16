-- ====================================================================
-- INABA STORE — MULTI-CATEGORY & PRE-ORDER MIGRATION
-- Tambahan skrip migrasi kompatibel untuk toko online multikategori:
-- 1. Hijab & Pakaian
-- 2. Seragam Sekolah Pre-Order (SDIT, TPQ, Madrasah Diniyah Sirimbit)
-- 3. Capel Petani
-- 4. Meja Lipat & Perabot
-- 5. Kategori dinamis lainnya yang bisa ditambah admin
--
-- Aman dijalankan di Supabase SQL Editor:
-- - Tidak menghapus tabel atau data lama (non-destructive)
-- - Membuka batasan kategori kaku agar dinamis
-- - Menambah tabel categories & store_settings
-- - Mendukung pre-order pada tabel products & create_order
-- ====================================================================

-- 1. BUKA KENDALA KATEGORI PADA PRODUK
alter table public.products drop constraint if exists products_category_check;

-- 2. TAMBAH KOLOM PRE-ORDER & MULTIKATEGORI KE TABEL PRODUCTS
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

-- Berikan izin update untuk kolom baru ke authenticated (admin policy akan memeriksa is_admin)
grant update (
  name, slug, category, description, price, image_url, badge, featured,
  is_active, stock, is_preorder, preorder_status, preorder_start, preorder_end,
  estimated_delivery, school_institution, min_order, size_guide, specifications, gallery_urls
) on public.products to authenticated;

-- 3. BUAT TABEL KATEGORI DINAMIS
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

-- RLS untuk kategori
alter table public.categories enable row level security;
revoke all on public.categories from public, anon, authenticated;
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

drop policy if exists "Public can read active categories" on public.categories;
drop policy if exists "Admins insert categories" on public.categories;
drop policy if exists "Admins update categories" on public.categories;
drop policy if exists "Admins delete categories" on public.categories;

create policy "Public can read active categories" on public.categories for select to anon, authenticated
  using (is_active = true or (select public.is_admin()));

create policy "Admins insert categories" on public.categories for insert to authenticated
  with check ((select public.is_admin()));

create policy "Admins update categories" on public.categories for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admins delete categories" on public.categories for delete to authenticated
  using ((select public.is_admin()));

-- Isi kategori awal toko multikategori
insert into public.categories (name, slug, description, icon, display_order, is_active) values
  ('Hijab & Pakaian', 'hijab-pakaian', 'Koleksi gamis wanita, gamis pria, koko, kurta, hijab dan busana muslim', 'sparkles', 1, true),
  ('Seragam Sekolah — Pre-Order', 'seragam-sekolah', 'Pre-order seragam sekolah SDIT, TPQ, dan Madrasah Diniyah Sirimbit Keluarga', 'graduation-cap', 2, true),
  ('Perlengkapan Petani', 'perlengkapan-petani', 'Topi capel petani tradisional, pelindung terik matahari dan alat berkebun', 'sun', 3, true),
  ('Meja & Perabot', 'meja-perabot', 'Meja lipat serbaguna untuk belajar, laptop, ngaji, dan perabot fungsional', 'table', 4, true),
  ('Produk Lainnya', 'produk-lainnya', 'Produk kebutuhan harian pilihan toko lainnya', 'package', 5, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  display_order = excluded.display_order;

-- 4. BUKA BATASAN GAMBAR WEBSITE (site_images)
alter table public.site_images drop constraint if exists site_images_key_check;

insert into public.site_images (key, label, image_url) values
  ('hero', 'Foto utama beranda multikategori', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85'),
  ('preorder_banner', 'Banner Pre-Order Seragam Sekolah', 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=85'),
  ('farmer_banner', 'Banner Perlengkapan Petani & Capel', 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=1200&q=85'),
  ('table_banner', 'Banner Meja Lipat & Perabot', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=85')
on conflict (key) do nothing;

-- 5. TABEL PENGATURAN TOKO DINAMIS (store_settings)
create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.store_settings enable row level security;
revoke all on public.store_settings from public, anon, authenticated;
grant select on public.store_settings to anon, authenticated;
grant insert, update on public.store_settings to authenticated;

drop policy if exists "Public can read store settings" on public.store_settings;
drop policy if exists "Admins modify store settings" on public.store_settings;

create policy "Public can read store settings" on public.store_settings for select to anon, authenticated
  using (true);

create policy "Admins modify store settings" on public.store_settings for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

insert into public.store_settings (key, value) values
  ('store_title', '"INABA STORE — Toko Multikategori"'::jsonb),
  ('contact_whatsapp', '"6285735144904"'::jsonb),
  ('announcement_text', '"Toko Multikategori INABA: Ready Stock Busana Muslim, Pre-Order Seragam Sekolah (SDIT, TPQ, Madin), Capel Petani & Meja Lipat."'::jsonb),
  ('payment_accounts', '[{"label":"Konfirmasi Pembayaran","detail":"Nomor rekening transfer resmi (BCA/BRI/Mandiri/QRIS) akan diinformasikan langsung oleh admin via WhatsApp setelah total pesanan dan ongkir dihitung."}]'::jsonb)
on conflict (key) do nothing;

-- 6. PERBARUI TABEL ORDER_ITEMS AGAR MENERIMA BERAGAM UKURAN & PRE-ORDER
alter table public.order_items drop constraint if exists order_items_variant_size_check;
alter table public.order_items add column if not exists is_preorder boolean not null default false;
alter table public.order_items add column if not exists school_institution text default '';

-- 7. PERBARUI FUNGSI create_order() AGAR MENDUKUNG PRE-ORDER & PRODUK NON-PAKAIAN
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

-- 8. CONTOH / DATA KATALOG AWAL UNTUK PRE-ORDER SERAGAM, CAPEL & MEJA LIPAT
-- Hanya dimasukkan jika belum ada (on conflict do nothing)
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
