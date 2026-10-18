# INABA Hijab — Checklist Peluncuran

## Sebelum publikasi

- [ ] Cadangkan database dan Storage Supabase sebelum perubahan akses.
- [ ] Pastikan Storage Supabase khusus INABA. `supabase_setup.sql` menghapus semua policy lama pada `storage.objects` lalu membuat policy yang dibatasi ke bucket foto INABA; bucket dan file tidak dihapus, tetapi izin aplikasi lain yang memakai project sama bisa terputus. Jangan jalankan di project bersama tanpa penyesuaian policy dan backup.
- [ ] Jalankan **satu-satunya skrip SQL**: `supabase_setup.sql`. Periksa hasil eksekusi dan policy melalui Supabase Dashboard.
- [ ] Aktifkan provider Email di Supabase Auth, pastikan SMTP/email delivery berfungsi, dan tambahkan URL website produksi sebagai Site URL serta allowed redirect URL.
- [ ] Pastikan akun admin menggunakan email di tabel `public.admin_email_allowlist` (seed awal `numanalmuqorrin@gmail.com`, `inabahijab@gmail.com`) dan emailnya sudah terverifikasi oleh Supabase. Setelah magic link terverifikasi, trigger database menyinkronkan role admin; email yang tidak cocok tetap menjadi pelanggan.
- [ ] Uji magic link: email terkirim, tautan kembali ke domain benar, akun pelanggan tidak bisa mengakses admin, dan akun admin sah otomatis membuka dashboard setelah verifikasi.
- [ ] Uji CRUD produk/kategori, upload/ganti/hapus foto, pengaturan WhatsApp, pengelolaan pesanan, serta penolakan akses tanpa sesi admin.
- [ ] Isi produk, harga, stok, kategori, foto, pilihan ukuran/varian, panduan ukuran, banner, nomor WhatsApp, dan pengaturan pembayaran lewat dashboard/database. Produk lama yang `variants`-nya masih `[]` belum bisa dibeli sampai admin mengisinya; jangan mempublikasikan katalog kosong.
- [ ] Uji keranjang/checkout dan pemulihan stok dengan data uji; pastikan subtotal/daftar barang konfirmasi diambil dari record pesanan server.
- [ ] Verifikasi kebijakan, nomor kontak, jadwal pre-order, ongkir, domain, HTTPS, canonical URL, redirect Auth, dan tampilan desktop/ponsel.
- [ ] Jika memakai Cloudflare Pages, pastikan file `_headers` diterapkan. Pada hosting lain, set header keamanan ekuivalen di konfigurasi server/hosting karena `_headers` tidak didukung semua platform.

## Batasan yang wajib diketahui

Skrip SQL belum dieksekusi di project Supabase live. Akses dashboard Auth/Storage dan tes end-to-end belum dilakukan dari lingkungan pengerjaan ini. Jangan menyatakan toko siap menerima pesanan nyata sebelum semua pemeriksaan di atas lulus.
