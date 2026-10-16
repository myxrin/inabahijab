# INABA STORE — Panduan Peluncuran Produksi (Production Launch Guide)

Dokumentasi resmi arsitektur sistem, keamanan, konfigurasi database, dan panduan peluncuran toko online **INABA STORE** (Toko Multikategori & Pre-Order Seragam Sekolah).

---

## 1. Ikhtisar Arsitektur Sistem

INABA STORE dibangun menggunakan arsitektur statis yang cepat, aman, dan hemat biaya, dengan backend berbasis Supabase (PostgreSQL, Auth, RLS, Storage):

- **Frontend:** Vanilla HTML5, CSS modern (CSS variables, responsive design tanpa framework berat), ES Modules JavaScript (`@supabase/supabase-js@2`).
- **Autentikasi & Otorisasi:** Supabase Auth + Database Row-Level Security (RLS) + fungsi keamanan `public.is_admin()`.
- **Database:** PostgreSQL dengan transaksi atomik `public.create_order()`, trigger pemulihan inventori `handle_order_cancellation()`, dan proteksi least-privilege.
- **Penyimpanan Berkas (Storage):** Supabase Storage bucket `product-images` dan `site-images` dengan validasi MIME (`image/jpeg`, `image/png`, `image/webp`) dan batas 5MB.
- **Integrasi Transaksi:** Checkout terstruktur dengan rincian pemesanan yang tercatat di database sebelum menghasilkan pesan konfirmasi WhatsApp dan opsi salin rincian pesanan.

---

## 2. Struktur Berkas Proyek

```
inaba-hijab-siap-luncur/
├── index.html                   # Halaman toko utama, katalog multikategori, keranjang, checkout, dan admin dashboard
├── kebijakan-privasi.html       # Kebijakan privasi & perlindungan data pribadi pelanggan
├── ketentuan-pemesanan.html     # Syarat & ketentuan pemesanan ready stock vs pre-order seragam
├── migration-multicategory.sql  # Migrasi non-destruktif untuk database yang sudah berjalan
├── supabase-setup.sql           # Setup database lengkap untuk instalasi baru dari nol
├── robots.txt                   # Konfigurasi perayap mesin pencari
├── sitemap.xml                  # Peta situs resmi (https://inabahijab.com/)
├── favicon.svg                  # Ikon favicon toko
├── QA-AUDIT-REPORT.md           # Laporan audit QA, pengujian fungsional, dan validasi keamanan
└── README-LAUNCH.md             # Panduan operasional dan peluncuran produksi ini
```

---

## 3. Prioritas Keamanan & Integritas Data (P0)

1. **Integritas Checkout & Transaksi Database:**
   - Pesanan hanya tercatat berhasil setelah PostgreSQL mengembalikan UUID pesanan yang sah.
   - Tidak ada lagi fallback timestamp lokal (`INB-...`). Keranjang belanja **tidak akan dikosongkan** apabila terjadi kegagalan jaringan atau error database.
   - Harga, subtotal, status pre-order, dan ketersediaan stok divalidasi dan dihitung langsung di sisi server oleh fungsi `public.create_order()`.
2. **Pemulihan Stok Otomatis (Idempotent Inventory Restoration):**
   - Ketika status pesanan diubah menjadi `cancelled`, trigger database `handle_order_cancellation()` secara otomatis mengembalikan jumlah stok untuk barang ready-stock.
   - Barang pre-order tidak memulihkan stok karena tidak mengurangi kuota stok fisik ready.
3. **Otorisasi Admin Berbasis Database:**
   - Frontend tidak lagi mengandalkan hardcoded list email browser.
   - Hak akses admin divalidasi secara kriptografis oleh fungsi database `public.is_admin()`.
4. **Pencegahan CSV Formula Injection:**
   - Ekspor warta newsletter mensterilkan karakter pemicu formula Excel/Sheets (`=`, `+`, `-`, `@`, `\t`, `\r`) dengan awalan kutip tunggal (`'`).
5. **Validasi Berkas Unggahan:**
   - Unggahan gambar produk dan banner diuji terhadap MIME type (`image/jpeg`, `image/png`, `image/webp`) serta batas ukuran 5MB baik di sisi browser maupun policy Storage Supabase.
6. **Tidak Ada Rekening Demonstrasi Palsu:**
   - Informasi pembayaran tidak menampilkan nomor rekening dummy (misal contoh BCA/BRI fiktif). Detail rekening resmi diatur admin melalui tab Pengaturan Toko atau dikonfirmasi via WhatsApp resmi.

---

## 4. Panduan Eksekusi Database di Supabase

### Skenario A: Database yang Sudah Berisi Data Produk / Pengguna
Gunakan berkas `migration-multicategory.sql`:
1. Buka [Supabase Dashboard](https://supabase.com/dashboard) proyek Anda.
2. Masuk ke menu **SQL Editor**.
3. Buka file `migration-multicategory.sql`, salin seluruh isinya ke editor SQL, lalu klik **Run**.
4. Skrip ini bersifat **non-destruktif**: membuka batasan kategori lama, menambahkan kolom pre-order, membuat tabel `categories` & `store_settings`, serta memperbarui fungsi `create_order` dan trigger pembatalan pesanan.

### Skenario B: Instalasi Baru dari Nol (Fresh Database)
Gunakan berkas `supabase-setup.sql`:
1. Buka Supabase Dashboard > SQL Editor.
2. Salin dan jalankan seluruh isi file `supabase-setup.sql`.

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
- [ ] **Email Akun Admin:** Buat akun untuk `numanalmuqorrin@gmail.com` dan `inabahijab@gmail.com` di menu **Authentication > Users** pada Supabase Dashboard.
- [ ] **Pengaturan Email Auth:** Jika ingin pendaftaran pelanggan tanpa konfirmasi email aktivasi, pastikan pengaturan **Confirm email** pada Supabase Auth diatur ke *Disabled*.
- [ ] **Pengaturan Rekening Toko:** Masuk ke Dashboard Admin (`#admin`), buka tab **Pengaturan Toko**, lalu masukkan nomor WhatsApp aktif toko dan daftar rekening bank resmi yang valid (Label | Nomor Rekening & Nama Pemilik).
- [ ] **Unggah Banner Resmi:** Perbarui banner hero dan promosi pada tab **Banner & Gambar** dengan foto toko asli.
- [ ] **Katalog Nyata:** Tambahkan atau perbarui produk melalui tab **Produk** dengan foto asli beresolusi tajam.
- [ ] **Deploy Hosting Statis:** Unggah seluruh file ke hosting statis pilihan (Cloudflare Pages, Vercel, Netlify, atau GitHub Pages). Pastikan file `robots.txt` dan `sitemap.xml` berada di root domain.
