# INABA HIJAB — Website (Supabase only)

Website mobile-first untuk brand **INABA HIJAB**: gamis muslim pria/wanita, koko/kurta, hijab/khimar, dan jasa jahit custom.

**Versi ini memakai Supabase saja** untuk login email/password, database, dan penyimpanan foto. Tidak memakai Firebase SDK, Google OAuth, Google credential, atau server tambahan.

## Isi paket

- `index.html` — storefront, katalog, cart, login/daftar, checkout, form jasa jahit, akun pelanggan, dan dashboard admin.
- `supabase-setup.sql` — tabel, RPC checkout, Storage bucket, RLS, dan role admin.
- `README.md` — petunjuk pemasangan dan pemeriksaan.

## Konfigurasi Supabase yang tertanam

- Project URL: `https://yrmnajmkibuuzyfhjoyw.supabase.co`
- Publishable key: sudah ditaruh di `index.html`. Publishable key boleh berada di frontend **dengan RLS yang benar**. Jangan pernah menaruh `service_role` atau secret key di HTML atau GitHub.

## 1. Upload ke GitHub Pages

1. Unduh ZIP dan ekstrak.
2. Buat repository di GitHub, misalnya `inaba-hijab`.
3. Unggah **isi folder** project ke root repository. Pastikan `index.html` langsung terlihat di root.
4. Buka repository → **Settings → Pages**.
5. Pada Build and deployment, pilih **Deploy from a branch**, branch `main`, folder `/(root)`, lalu **Save**.
6. Tunggu URL GitHub Pages muncul, misalnya `https://USERNAME.github.io/inaba-hijab/`.

## 2. Aktifkan Supabase Auth

1. Buka [Supabase Dashboard](https://supabase.com/dashboard), pilih project INABA HIJAB.
2. Masuk **Authentication → Sign In / Providers** dan pastikan **Email** aktif. Login Google/Firebase tidak dibutuhkan.
3. Pastikan **email confirmation / Confirm email tetap AKTIF**. Ini penting: dua email admin yang diizinkan baru mendapat akses admin setelah Supabase menandai emailnya terverifikasi.
4. Buka **Authentication → URL Configuration**.
5. Isi **Site URL** dengan URL GitHub Pages yang benar, contoh `https://USERNAME.github.io/inaba-hijab/`.
6. Tambahkan URL itu ke **Redirect URLs**. Tambahkan pula pola `https://USERNAME.github.io/inaba-hijab/**` agar link verifikasi dan reset password bisa kembali ke website.
7. Untuk produksi, atur SMTP sendiri di pengaturan email Supabase agar email verifikasi/reset dapat dikirim dengan layak. Cek folder spam saat pengujian.

## 3. Setup database dan admin

1. Buka **SQL Editor → New query** di Supabase Dashboard.
2. Buka `supabase-setup.sql`, salin seluruh isinya, tempel ke SQL Editor, lalu jalankan.
3. SQL ini menyiapkan tabel profil, produk, pesanan, item pesanan, permintaan jahit, newsletter, fungsi checkout, bucket foto dan kebijakan RLS. Script tidak memasukkan produk dummy, jadi katalog tetap kosong sampai produk asli ditambahkan.
4. Script ini juga menyesuaikan ID pengguna menjadi teks agar bisa memperbarui struktur prototype INABA sebelumnya yang mungkin menggunakan Firebase UID string atau Supabase UUID. Data akun Firebase lama **tidak** menjadi akun Supabase; pelanggan perlu daftar ulang dengan Supabase.
5. Daftar dari website memakai salah satu email admin di bawah, lalu buka email verifikasi:
   - `numanalmuqorrin@gmail.com`
   - `inabahijab@gmail.com`
6. Setelah alamat email terverifikasi, trigger database akan memberi role `admin` hanya kepada salah satu dari dua email persis di atas. Akun terverifikasi lainnya mendapat role `customer`. Role tidak bisa dipilih sendiri dari browser.
7. Kalau dua akun tersebut sudah dibuat sebelum SQL dijalankan, skrip akan menyinkronkan profil dan role dari `auth.users` yang ada.

**Jangan mematikan konfirmasi email.** Untuk mengamankan admin berbasis allowlist email, Supabase harus memverifikasi kepemilikan alamat sebelum login bisa digunakan. Jangan promosikan akun yang emailnya tidak benar-benar lu kuasai.

## 4. Fitur website

- Katalog kosong saat awal, dengan filter Gamis Wanita, Gamis Pria, Koko & Kurta, serta Hijab & Khimar.
- Detail produk, pilihan ukuran S–XXL/custom, keranjang, subtotal, dan checkout.
- Daftar/login email + password, verifikasi email, kirim ulang verifikasi, lupa password, serta ubah password lewat email reset.
- Akun pelanggan dan riwayat pesanan.
- Dashboard admin: tambah/edit/sembunyikan produk, upload gambar JPG/PNG/WebP maksimal 5 MB, ubah status pesanan dan permintaan jahit, dan ekspor newsletter CSV.
- Form konsultasi jahit/alterasi.
- WhatsApp toko: `085735144904`.

Pembayaran online dan penghitungan ongkir otomatis belum diintegrasikan. Pesanan dicatat sebagai menunggu konfirmasi.

## 5. Tes setelah setup

1. Buka website dari URL HTTPS GitHub Pages, bukan dari file `file://`.
2. Buat akun customer menggunakan email milik sendiri, verifikasi, lalu login. Pastikan akun hanya dapat melihat riwayat pesanan sendiri.
3. Login dengan email admin yang sudah diverifikasi. Dashboard harus menampilkan Produk, Pesanan, Jahit, dan Email.
4. Tambahkan satu produk asli dan foto. Periksa produk tampil di katalog; tidak ada produk contoh dibuat otomatis.
5. Keluar dan login sebagai customer lagi. Customer tidak boleh mengubah produk, melihat order orang lain, membaca daftar newsletter, atau upload gambar.
6. Uji formulir konsultasi jahit, reset password, dan keranjang. Jangan menerima pembayaran nyata sebelum alur order diuji.

## Troubleshooting

- **Katalog belum bisa dimuat:** pastikan URL/key masih benar dan jalankan seluruh `supabase-setup.sql`. Periksa pesan di browser Console dan SQL Editor.
- **Daftar/login gagal:** pastikan Authentication → Providers → Email aktif dan project tidak sedang membatasi pendaftaran.
- **Email belum diverifikasi:** buka link di email, cek folder spam, atau gunakan tombol kirim ulang verifikasi.
- **Email verifikasi/reset tak sampai:** uji SMTP khusus dalam pengaturan email Supabase.
- **Admin masuk sebagai pelanggan:** pastikan emailnya salah satu dari dua email allowlist, email sudah terverifikasi, dan SQL berhasil berjalan. Logout lalu login kembali.
- **Upload foto gagal:** pastikan akun admin terverifikasi, bucket `product-images` ada, serta foto JPG/PNG/WebP di bawah 5 MB.
- **Katalog kosong:** itu memang kondisi awal. Tambahkan produk asli dari dashboard admin.

## Keamanan sebelum go-live

- Jangan pernah memasukkan `service_role`/secret key ke HTML atau repository.
- Pendaftaran biasa selalu menjadi `customer`; akses admin divalidasi lewat tabel profile, email allowlist, status verifikasi Supabase Auth, serta RLS di database/Storage.
- Uji dengan akun customer sebelum menerima pesanan asli.
- Pembayaran, ongkir otomatis, dan integrasi WhatsApp API belum termasuk.
