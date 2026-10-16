# INABA Hijab — Checklist Peluncuran

## Sebelum publikasi

- [ ] Cadangkan database Supabase yang sudah ada.
- [ ] Jalankan **satu-satunya skrip SQL**: `supabase_setup.sql`.
- [ ] Pastikan kedua akun admin yang dimaksud sudah ada di Supabase Auth dan operator tepercaya menyetel `app_metadata.inaba_admin = true` melalui Auth Admin API/server tepercaya.
- [ ] Uji pengguna pelanggan: akses profil sendiri, keranjang, pemesanan, dan penolakan akses admin.
- [ ] Uji pengguna admin: CRUD produk/kategori, upload/ganti/hapus foto produk dan banner, pengaturan WhatsApp, dan pengelolaan pesanan.
- [ ] Isi produk, harga, stok, kategori, banner, dan informasi resmi toko melalui dashboard admin; jangan mempublikasikan katalog kosong atau data contoh.
- [ ] Verifikasi nomor WhatsApp toko, informasi pembayaran, jadwal pre-order, ongkir, kebijakan pengembalian, dan kontak dukungan.
- [ ] Pastikan canonical URL, redirect URL Supabase Auth, HTTPS, domain kustom, dan pengaturan signup/verifikasi email sesuai domain produksi.
- [ ] Jalankan tes live pada desktop dan ponsel sebelum menerima order sungguhan.

## Batasan yang wajib diketahui

Skrip SQL tidak mengubah pengaturan Auth Dashboard dan belum dijalankan ke project Supabase live dari lingkungan ini. Jangan anggap toko live/production-ready sebelum semua checklist di atas terverifikasi.
