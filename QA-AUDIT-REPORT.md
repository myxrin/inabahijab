# INABA Hijab — QA & Audit Teknis

## Perubahan source yang diterapkan

- Menghapus announcement bar paling atas dan copy lama “Toko Multikategori” dari metadata, title, identitas header/footer, serta konfigurasi yang dipakai UI.
- Mengganti ikon navigasi admin berbasis emoji dengan SVG; hasil scan source untuk emoji UI tidak menemukan kecocokan.
- Menghapus kategori/produk fallback lokal dari katalog dan menampilkan error state jika katalog gagal dibaca.
- Mengelola empat gambar konten (hero, banner pre-order, capel petani, meja lipat) melalui `site_images` dan bucket `site-images`. Foto produk melalui bucket `product-images`. Tidak ada foto produk dummy hardcoded.
- Menambahkan placeholder SVG saat gambar belum ada/gagal, validasi MIME dan batas 5 MB, preview yang ditangani setelah form dirender, serta alur upload/ganti/hapus yang memperbarui referensi database dan membersihkan file Storage lama bila berhasil.
- Menghapus input URL foto produk bebas dan menolak tampilan URL foto yang bukan dari bucket project Supabase terkait.
- Memuat pengaturan WhatsApp/payment dari `store_settings`, menerapkan nomor WhatsApp ke semua CTA yang tersedia, dan memvalidasi nomor sebelum menyimpan.
- Menghindari data katalog lama sebagai fallback dashboard ketika query gagal dan menunjukkan peringatan di dashboard.
- Memperketat role admin: email harus masuk allowlist dan `auth.users.raw_app_meta_data.inaba_admin` harus bernilai `true`. Trigger menyinkronkan role profile dari metadata tepercaya; `user_metadata` tidak digunakan.
- Memperbaiki pengembalian stok supaya kuantitas order untuk product ID yang sama dijumlahkan ketika pesanan dibatalkan.
- Membatasi `user_id` yang dapat diisi pada formulir permintaan jahit publik.
- Menggabungkan setup database/fungsi/trigger/RLS/Storage menjadi satu skrip `supabase_setup.sql`.

## Validasi yang benar-benar dijalankan

| Pemeriksaan | Hasil |
|---|---|
| Parsing struktur HTML via parser lokal | Lulus |
| JavaScript module inline melalui `node --check` | Lulus |
| ID HTML ganda | Tidak ditemukan |
| Target tautan internal yang hilang | Tidak ditemukan |
| Scan copy lama (`Toko Multikategori`, `INABA STORE`, `announcement_text`) | Tidak ditemukan di `index.html`/skrip final |
| Scan emoji UI | Tidak ditemukan |
| Scan URL gambar demo (Unsplash, placehold.co, Picsum) | Tidak ditemukan di `index.html` |
| File SQL di project | Tepat satu: `supabase_setup.sql` |
| Operasi `DROP TABLE` | Tidak ditemukan |
| `git diff --check` | Lulus |
| Bundling frontend | Tidak berlaku: project statis ini tidak memiliki `package.json` atau bundler |

## Belum terverifikasi

- SQL belum dijalankan pada database Supabase live dan tidak divalidasi oleh server PostgreSQL dari lingkungan ini.
- Belum ada tes end-to-end terautentikasi untuk RLS antarpengguna, login admin, checkout, rollback stok, dan siklus upload/hapus Storage pada project pemilik.
- Tampilan interaktif belum diuji lewat browser nyata dalam sesi ini.

## Tindakan manual wajib sebelum produksi

1. Cadangkan database Supabase dan jalankan `supabase_setup.sql` dari SQL Editor.
2. Untuk setiap akun admin yang diizinkan (`numanalmuqorrin@gmail.com` dan `inabahijab@gmail.com`), operator tepercaya perlu menyetel `app_metadata.inaba_admin = true` lewat Supabase Auth Admin API atau backend tepercaya. Jangan masukkan service-role/secret key ke browser atau source frontend.
3. Uji login pelanggan/admin, kebijakan RLS, produk, create order, pembatalan/stok, upload/ganti/hapus foto, dan setting WhatsApp pada project live.
4. Verifikasi kebijakan signup/verifikasi email, URL redirect Auth, domain/HTTPS, produk/harga/stok, nomor WhatsApp, detail pembayaran, dan halaman kebijakan sebelum menerima order sungguhan.
