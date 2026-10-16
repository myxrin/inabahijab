# INABA Hijab — Source Website

Website katalog dan pemesanan INABA Hijab berbasis HTML/CSS/JavaScript dengan Supabase Auth, PostgreSQL, Row Level Security (RLS), dan Supabase Storage. Tidak ada proses bundling frontend: `index.html` adalah entry point dan memakai Supabase JS melalui ESM CDN.

## File utama

- `index.html` — storefront, katalog dari database, keranjang, checkout, area pelanggan, dan dashboard admin.
- `supabase_setup.sql` — satu skrip setup database, fungsi, trigger, RLS, Storage, kategori, pengaturan awal, dan tabel allowlist email admin yang terkunci dari API klien.
- `favicon.svg` — aset vektor brand/ikon (bukan foto konten toko).
- `kebijakan-privasi.html`, `ketentuan-pemesanan.html` — halaman legal.
- `QA-AUDIT-REPORT.md` — pemeriksaan lokal dan batas validasinya.

## Setup Supabase

1. Cadangkan database dan Storage sebelum menjalankan skrip di project yang sudah digunakan.
2. Skrip `supabase_setup.sql` akan menyusun ulang kebijakan RLS pada tabel situs yang dikelola dan menghapus seluruh policy `storage.objects` lama sebelum membuat policy terbatas untuk bucket INABA. Ini tidak menghapus bucket maupun file, tetapi bisa memutus akses aplikasi lain yang memakai Storage di project sama. Jalankan hanya setelah backup dan pastikan project Storage memang khusus INABA; jangan menjalankannya pada project bersama tanpa penyesuaian policy.
3. Buka Supabase Dashboard → SQL Editor, salin seluruh `supabase_setup.sql`, lalu jalankan sekali. Pastikan semua perintah selesai tanpa error.
4. Aktifkan provider Email, pastikan pengiriman email/SMTP berfungsi, dan masukkan domain final ke Site URL serta allowed redirect URLs. Login website memakai magic link satu kali, bukan password.
5. Allowlist admin ada pada satu tabel server-side `public.admin_email_allowlist` (seed awal `numanalmuqorrin@gmail.com` dan `inabahijab@gmail.com`). Tambah/hapus admin hanya melalui SQL tepercaya setelah memverifikasi kepemilikan alamat. Role admin memerlukan sesi Supabase sah dan `email_confirmed_at` terisi; klien tidak punya izin baca/tulis tabel allowlist.
6. Setelah tautan email diverifikasi, aplikasi memanggil `public.is_admin()`; panel pengelolaan dibuka hanya jika database mengesahkan role admin. Mengetik alamat email saja tidak memberi akses karena harus menyelesaikan magic link yang dikirim ke kotak masuk.
7. Uji login pelanggan/admin, RLS, katalog, upload/hapus foto, keranjang, checkout, dan role penolakan pada Supabase project aktual.

Skrip tidak mengubah pengaturan Auth Dashboard secara otomatis. Pembuatan/penyetujuan admin harus dilakukan di sisi tepercaya; jangan menambahkan endpoint pengaturan role yang dapat dipanggil publik.

## Gambar dan isi toko

Foto produk disimpan di bucket `product-images`; foto hero/banner dikelola melalui `site_images` dan bucket `site-images`. Maksimum file yang diterima adalah 5 MB dan format yang diizinkan JPG, PNG, atau WebP. Frontend hanya menampilkan URL dari bucket pada project Supabase ini. Foto yang kosong/gagal dimuat memakai placeholder SVG. Produk dan kategori katalog dibaca dari database; foto dan seluruh opsi ukuran/varian/panduan ukuran produk juga berasal dari record Supabase. Produk lama yang memiliki `variants = []` sengaja tidak dapat dipesan sampai admin mengisi opsi di editor produk. Simpan/aktif-nonaktif kategori menunggu konfirmasi server dan perubahan nama kategori menyelaraskan referensi produk melalui trigger SQL. Pengaturan WhatsApp/pembayaran tidak memakai `localStorage` atau fallback konten dari browser.

## Konfigurasi dan deployment

Project memakai Supabase URL dan publishable key yang ada di `index.html`. Publishable key memang digunakan di browser; jangan pernah menggantinya dengan `service_role`/secret key. Unggah file website ke static hosting yang mendukung HTTPS, pertahankan file legal dan favicon, lalu pastikan domain final sesuai dengan canonical/redirect URL pada Supabase Auth.

Tidak ada `npm install`, `npm run build`, atau proses bundling yang diperlukan. Pengujian end-to-end ke Supabase tetap harus dilakukan pada project pemilik karena akses database/auth/storage live tidak tersedia di lingkungan pengerjaan.

## Header keamanan hosting

File `_headers` menetapkan header keamanan dasar jika project di-deploy di Cloudflare Pages. Provider lain mungkin mengabaikan file tersebut; atur header ekuivalen di konfigurasi hosting/server. Header ini pelengkap, bukan pengganti RLS Supabase.
