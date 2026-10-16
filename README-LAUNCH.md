# INABA STORE — Panduan Produksi & Arsitektur Sistem

Dokumentasi resmi arsitektur sistem, keamanan, konfigurasi database, dan panduan peluncuran toko online **INABA STORE** (Toko Multikategori & Pre-Order Seragam Sekolah).

---

## 1. Ikhtisar Arsitektur Sistem

INABA STORE dibangun menggunakan arsitektur statis yang cepat, aman, dan hemat biaya, dengan backend berbasis Supabase (PostgreSQL, Auth, RLS, Storage):

- **Frontend:** Vanilla HTML5, CSS modern (CSS variables, responsive design, bottom nav mobile interaktif), ES Modules JavaScript (`@supabase/supabase-js@2`).
- **Autentikasi & Otorisasi:** Supabase Auth + Database Row-Level Security (RLS) + fungsi keamanan `public.is_admin()`.
- **Database:** PostgreSQL dengan transaksi atomik `public.create_order()`, trigger pemulihan inventori `handle_order_cancellation()`, dan proteksi least-privilege.
- **Keranjang Belanja:** Tersimpan aman di database server (`public.cart_items`) khusus untuk pengguna yang telah login / terdaftar.
- **Penyimpanan Berkas (Storage):** Supabase Storage bucket `product-images` dan `site-images` dengan validasi MIME (`image/jpeg`, `image/png`, `image/webp`) dan batas 5MB.
- **Integrasi Transaksi:** Checkout terstruktur dengan rincian pemesanan yang tercatat di database sebelum menghasilkan pesan konfirmasi WhatsApp dan opsi salin rincian pesanan.

---

## 2. Struktur Berkas Proyek

```
inabahijab/
├── index.html               # Halaman storefront multikategori, bottom nav interaktif, cart DB, checkout, & admin dashboard
├── kebijakan-privasi.html   # Kebijakan privasi & perlindungan data pribadi pelanggan
├── ketentuan-pemesanan.html # Syarat & ketentuan pemesanan ready stock vs pre-order seragam
├── supabase-setup.sql       # SKRIP TUNGGAL SQL lengkap (cukup jalankan satu kali di Supabase SQL Editor)
├── robots.txt               # Konfigurasi perayap mesin pencari
├── sitemap.xml              # Peta situs resmi (https://inabahijab.com/)
├── favicon.svg              # Ikon favicon toko
├── QA-AUDIT-REPORT.md       # Laporan audit QA, pengujian fungsional, dan validasi keamanan
├── README.md                # Dokumentasi utama repositori GitHub ini
└── README-LAUNCH.md         # Panduan operasional dan peluncuran produksi
```

---

## 3. Fitur Utama & Keamanan Data (P0)

1. **Keranjang Belanja Berbasis Database (Wajib Login):**
   - Keranjang belanja disimpan langsung di tabel database PostgreSQL `public.cart_items` dan dilindungi oleh RLS untuk masing-masing pengguna.
   - Tamu / pengunjung yang belum login akan diarahkan untuk masuk atau mendaftar terlebih dahulu.
2. **Integritas Checkout & Transaksi Database:**
   - Pesanan hanya tercatat berhasil setelah PostgreSQL mengembalikan UUID pesanan yang sah.
   - Keranjang belanja **tidak akan dikosongkan** apabila terjadi kegagalan jaringan atau error database.
   - Setelah pesanan berhasil dicatat, keranjang belanja di database otomatis dikosongkan secara atomik oleh fungsi `public.create_order()`.
3. **Pemulihan Stok Otomatis (Idempotent Inventory Restoration):**
   - Ketika status pesanan diubah menjadi `cancelled`, trigger database `handle_order_cancellation()` secara otomatis mengembalikan jumlah stok untuk barang ready-stock.
4. **Otorisasi Admin Berbasis Database:**
   - Hak akses admin divalidasi secara kriptografis oleh fungsi database `public.is_admin()`.
5. **Navigasi Mobile & UI Modern:**
   - Bar pengumuman atas disembunyikan di mobile agar layar bersih dan fokus pada katalog.
   - Navbar bawah mobile interaktif: menu yang aktif tampil lebih berwarna cerah (Terracotta Clay glow), sedangkan menu tidak aktif tampil sedikit transparan.
   - Foto dan banner murni dikelola admin melalui Dashboard Admin & Supabase Storage, tanpa foto mock hardcoded.

---

## 4. Panduan Eksekusi Database di Supabase (Hanya 1 File SQL)

Seluruh struktur tabel, fungsi RPC, trigger, bucket storage, dan kebijakan keamanan telah disatukan ke dalam **satu berkas SQL tunggal**: `supabase-setup.sql`.

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) proyek Anda.
2. Masuk ke menu **SQL Editor** > **New Query**.
3. Buka file `supabase-setup.sql`, salin seluruh isinya, tempel ke SQL Editor, lalu klik tombol **Run**.
4. Skrip ini aman dijalankan baik pada database kosong maupun database yang sudah berjalan (idempotent):
   - Menyiapkan tabel `profiles`, `categories`, `products`, `orders`, `order_items`, `cart_items`, `site_images`, `store_settings`, dan `newsletter_subscribers`.
   - Mengaktifkan fungsi `public.is_admin()`, `public.create_order()`, dan trigger `handle_order_cancellation()`.
   - Menyiapkan bucket storage `product-images` dan `site-images`.
   - Menetapkan Row-Level Security (RLS) lengkap.

---

## 5. Konfigurasi Kredensial & Domain

Berkas `index.html` telah dikonfigurasi untuk proyek Supabase aktif:
- **Supabase URL:** `https://yrmnajmkibuuzyfhjoyw.supabase.co`
- **Publishable Key:** `sb_publishable_IY1FW4DrapR4iVavOv6-Mw_hDGhwfg5`
- **Domain Resmi:** `https://inabahijab.com/`

> **PENTING:** Jangan pernah memasukkan Supabase `service_role` key ke dalam file frontend mana pun. Kredensial publishable key aman digunakan untuk publik karena seluruh tabel dilindungi oleh Row-Level Security (RLS).

---

## 6. Daftar Periksa Manual Sebelum Publikasi (Pre-Flight Checklist)

Sebelum mempublikasikan domain ke publik:
- [ ] **Jalankan SQL:** Jalankan `supabase-setup.sql` di Supabase SQL Editor.
- [ ] **Email Akun Admin:** Buat akun untuk `numanalmuqorrin@gmail.com` dan `inabahijab@gmail.com` di menu **Authentication > Users** pada Supabase Dashboard.
- [ ] **Pengaturan Email Auth:** Jika ingin pendaftaran pelanggan tanpa konfirmasi email aktivasi, pastikan pengaturan **Confirm email** pada Supabase Auth diatur ke *Disabled*.
- [ ] **Pengaturan Rekening Toko:** Masuk ke Dashboard Admin (`#admin`), buka tab **Pengaturan Toko**, lalu masukkan nomor WhatsApp aktif toko dan daftar rekening bank resmi yang valid (Label | Nomor Rekening & Nama Pemilik).
- [ ] **Unggah Banner Resmi:** Perbarui banner hero dan promosi pada tab **Banner & Gambar** dengan foto toko asli.
- [ ] **Katalog Nyata:** Tambahkan atau perbarui produk melalui tab **Produk** dengan foto asli beresolusi tajam.
- [ ] **Deploy Hosting Statis:** Unggah seluruh file ke hosting statis pilihan (GitHub Pages, Cloudflare Pages, Vercel, Netlify).
