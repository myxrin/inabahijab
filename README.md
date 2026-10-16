# INABA Hijab — Source Website

Website katalog dan pemesanan INABA Hijab berbasis HTML/CSS/JavaScript dengan Supabase Auth, PostgreSQL, Row Level Security (RLS), dan Supabase Storage. Tidak ada proses bundling frontend: `index.html` adalah entry point dan memakai Supabase JS melalui ESM CDN.

## File utama

- `index.html` — storefront, katalog, keranjang, checkout, akun pelanggan, dan dashboard admin.
- `supabase_setup.sql` — satu skrip setup database, fungsi, trigger, RLS, Storage, dan seed kategori/pengaturan.
- `favicon.svg` — aset vektor brand/ikon (bukan foto konten toko).
- `kebijakan-privasi.html`, `ketentuan-pemesanan.html` — halaman legal.
- `QA-AUDIT-REPORT.md` — catatan verifikasi yang benar-benar dijalankan dan batasannya.

## Setup Supabase

1. Cadangkan database sebelum menjalankan skrip pada project lama.
2. Buka Supabase Dashboard → SQL Editor, salin seluruh `supabase_setup.sql`, lalu jalankan sekali.
3. Pastikan akun yang diinginkan sebagai admin sudah terdaftar di Auth. Daftar email yang diizinkan saat ini: `numanalmuqorrin@gmail.com` dan `inabahijab@gmail.com`.
4. Untuk masing-masing akun admin, operator tepercaya harus mengatur `app_metadata` menjadi `{"inaba_admin": true}` menggunakan mekanisme Auth Admin API/server tepercaya. Jangan menggunakan `user_metadata` atau membuat endpoint admin di browser. API Admin membutuhkan secret/service-role di server saja; jangan pernah menaruhnya di frontend. Sesudah flag itu berubah, trigger akan menyinkronkan role profil. Email allowlist saja tidak cukup untuk menjadi admin.
5. Verifikasi login pelanggan biasa, login admin, RLS, katalog, upload/hapus foto, keranjang, dan checkout pada Supabase project aktual.

Skrip tidak mematikan verifikasi email dan tidak mengubah pengaturan Auth Dashboard secara otomatis. Konfigurasikan kebijakan signup/verifikasi email sesuai kebutuhan keamanan project di Supabase Dashboard.

## Gambar toko

Foto produk disimpan di bucket `product-images`; foto hero/banner dikelola melalui `site_images` dan bucket `site-images`. Maksimum file yang diterima adalah 5 MB dan format yang diizinkan JPG, PNG, atau WebP. Frontend hanya menampilkan URL public dari bucket yang tepat pada project Supabase ini. Saat belum ada foto atau gambar gagal dimuat, website memakai placeholder SVG; tidak ada foto produk dummy bawaan.

## Konfigurasi dan deployment

Project memakai Supabase URL dan publishable key yang sudah ada di `index.html`. Publishable key memang dipakai di browser; jangan pernah menggantinya dengan `service_role`/secret key. Untuk deploy, unggah file website ke static hosting yang mendukung HTTPS, pertahankan file legal dan favicon, lalu pastikan domain final sesuai dengan canonical/redirect URL pada Supabase Auth.

Tidak ada `npm install`, `npm run build`, atau proses bundling yang diperlukan untuk versi ini. Pengujian end-to-end ke Supabase tetap harus dilakukan di project pemilik karena akses database/auth/storage live tidak tersedia di lingkungan pengerjaan.
