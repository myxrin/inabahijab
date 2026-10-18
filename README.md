# INABA HIJAB — Toko Busana Muslim & Seragam Pre-Order

Toko online satu halaman (`index.html`, HTML + CSS + JavaScript module) dengan backend **Supabase** (Auth tautan email, PostgreSQL, Storage). Pesanan disimpan di server, lalu pembeli melanjutkan konfirmasi lewat **WhatsApp**.

## Yang ada di toko
- Katalog produk per kategori dengan status Ready Stock atau Pre-Order, pencarian, dan filter lini (Modest, Schoolwear, Living & Craft).
- Keranjang untuk akun yang masuk lewat tautan email (tersimpan di Supabase), checkout, dan pengiriman rincian ke WhatsApp.
- Kalkulator rombongan sekolah/lembaga, panduan ukuran per produk, dan alur pemesanan.
- Dashboard admin (produk, kategori, foto, pesanan, pengaturan) yang hanya terbuka untuk email di `admin_email_allowlist`.
- Tata letak responsif: menu hamburger untuk HP/tablet (di bawah 1100 px), menu penuh di desktop, bilah navigasi bawah di HP.

## Struktur berkas
- `index.html` — aplikasi utama
- `kebijakan-privasi.html`, `ketentuan-pemesanan.html` — halaman legal
- `supabase_setup.sql` — satu-satunya skrip database
- `_headers` — header keamanan (Cloudflare Pages)
- `robots.txt`, `sitemap.xml`, `favicon.svg`

## Peluncuran
Ikuti `README-LAUNCH.md` sampai semua kotak tercentang. Varian, harga, stok, dan nomor WhatsApp diisi lewat dashboard/Supabase; produk tanpa varian tidak bisa dipesan.
