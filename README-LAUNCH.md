# INABA HIJAB — Paket Peluncuran

Web toko menggunakan React + Vite dan Supabase Auth, Postgres, RLS, RPC transaksi, serta Supabase Storage. Katalog dan pengaturan toko dibaca dari database; tidak ada produk demo yang ditampilkan ketika database kosong. Foto produk harus diunggah ke bucket `product-images` dan setiap produk dibatasi maksimal lima foto.

## Urutan sebelum publikasi

1. **Backup lebih dulu.** Ekspor database serta catat kebijakan Storage yang ada sebelum menjalankan SQL. `supabase_setup.sql` adalah skrip setup lengkap dan mengganti policy pada tabel/bucket yang dikelola situs. Skrip juga mereset semua policy `storage.objects`; jangan jalankan di project Supabase bersama aplikasi lain tanpa menyesuaikan policy dan backup.
2. Buka Supabase SQL Editor, jalankan `supabase_setup.sql`, lalu pastikan eksekusi selesai tanpa error. Jangan publikasikan sebelum semua error SQL diselesaikan.
3. Atur URL produksi di **Supabase Auth → URL Configuration** (Site URL dan Redirect URLs). Aktifkan provider Email. Bila pelanggan harus bisa daftar/masuk langsung tanpa konfirmasi email, atur **Confirm email** sesuai kebijakan toko. Pengaturan ini tidak otomatis memberi hak admin.
4. **Penting: daftar email admin bukan bukti kepemilikan akun.** Semua akun baru dibuat sebagai pelanggan, termasuk bila alamat emailnya tercantum di `admin_email_allowlist`. Setelah admin masuk menggunakan akun yang benar dan identitasnya diverifikasi secara terpisah, pemilik proyek menandai akun melalui SQL Editor seperti contoh berikut, mengganti alamat dengan satu email yang sudah berada di allowlist:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
     || '{"inaba_admin": true}'::jsonb
   where lower(email) = lower('inabahijab@gmail.com')
     and email_confirmed_at is not null;
   ```

   Flag berada di `raw_app_meta_data` (metadata yang dikelola server), bukan `raw_user_meta_data` yang dapat diedit pengguna. `is_admin()` memeriksa flag ini di server beserta status konfirmasi email dan allowlist. Jangan beri flag ini kepada akun sebelum identitas pemiliknya dipastikan. Untuk mencabut akses, hapus flag melalui SQL Editor:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) - 'inaba_admin'
   where lower(email) = lower('inabahijab@gmail.com');
   ```

5. Login sebagai admin yang sudah diprovisikan. Pada **Pengaturan**, tetapkan nomor WhatsApp, data rekening, dan unggah foto utama/banner yang relevan ke bucket `site-images`. Pada **Produk**, tambahkan produk nyata, pilih kategori dari database, isi harga/stok/varian, dan unggah 1–5 foto ke `product-images`. Kategori awal disediakan oleh SQL, tetapi produk dan foto tidak diisi dengan data demo. Pastikan ada setidaknya satu produk aktif yang lengkap, kontak toko benar, dan banner tidak lagi berupa placeholder sebelum menyebarkan tautan.
6. Uji signup pelanggan, login/logout, akses langsung `#admin`, upload foto, tambah/edit/hapus produk, setiap status pesanan, stok ready-stock, keranjang lama, checkout, dan riwayat pesanan di desktop serta ponsel. Checkout memakai RPC `create_order`, yang membaca harga dan stok di database lalu membuat pesanan secara atomik.
7. Periksa teks kebijakan, informasi pengiriman/retur, kontak toko, konfigurasi HTTPS, domain, URL redirect Auth dan header keamanan hosting. File `_headers` hanya berlaku di Cloudflare Pages; hosting lainnya butuh pengaturan header setara di panel/server hosting.

## Keamanan dan batasan

- Publishable key Supabase yang tertanam di frontend memang dapat dilihat publik; **jangan pernah** memasukkan service-role key atau secret key ke kode browser. Perlindungan akses bergantung pada RLS, fungsi server `is_admin()`, metadata admin yang ditetapkan operator, dan validasi RPC—bukan tombol yang disembunyikan.
- Data produk/pesanan dummy dan jalur akses admin melalui localStorage telah dihapus. Ketika Supabase tidak dapat dibaca, katalog kosong menampilkan pesan serta tidak mengganti data server dengan katalog palsu.
- Foto produk diambil dari bucket `product-images`, banner dari `site-images`; URL gambar luar tidak ditampilkan dan ditolak oleh trigger database untuk perubahan baru. UI dan SQL membatasi galeri maksimum lima foto per produk.
- SQL ini **belum dijalankan** pada project Supabase live dan uji end-to-end belum dapat dilakukan dari lingkungan pembuatan paket. Maka paket sudah diperbaiki dan dipersiapkan, tetapi status publikasi nyata tetap perlu diverifikasi pada project/hosting milik pemilik toko.
