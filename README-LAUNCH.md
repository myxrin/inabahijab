# INABA HIJAB — paket hardening dan pra-peluncuran

## Perubahan dalam paket ini

- Dashboard admin mengambil dan menampilkan `address` serta `notes` setiap pesanan, termasuk ringkasan barang, dan menyediakan tautan WhatsApp untuk menghubungi pelanggan.
- Setelah checkout, pelanggan melihat nomor referensi serta langkah konfirmasi manual melalui WhatsApp. UI menyatakan secara eksplisit bahwa pembayaran belum dilakukan di website dan ongkir belum dihitung otomatis.
- Izin tabel `products` diperketat: role `anon` hanya mendapat `SELECT`; operasi tulis hanya diberikan ke `authenticated`, lalu dibatasi oleh RLS admin.
- SQL membersihkan semua policy lama pada tabel `public` yang dikelola skrip ini sebelum membuat ulang policy. Ini membantu menghindari policy permisif yang namanya tidak dikenal, tetapi **bersifat destruktif terhadap policy kustom pada tabel-tabel tersebut**.
- Katalog memiliki pencarian dan pengurutan harga/nama.
- Metadata Open Graph/Twitter dan favicon telah ditambahkan; ukuran teks utama di mobile dinaikkan.
- Ditambahkan halaman kebijakan privasi dan ketentuan pemesanan awal, `robots.txt`, serta contoh sitemap.

## Sebelum menjalankan SQL

1. Pastikan proyek Supabase yang dipilih adalah proyek INABA yang benar.
2. Buat backup database terlebih dahulu.
3. Baca `supabase-setup.sql`, khususnya blok `SECURITY HARDENING`: blok itu menghapus semua RLS policy pada `profiles`, `products`, `orders`, `order_items`, `tailoring_requests`, `newsletter_subscribers`, dan `site_images`, lalu membuat policy yang diperlukan oleh aplikasi ini. Jangan jalankan jika tabel tersebut memiliki policy kustom yang masih dibutuhkan.
4. Setelah SQL dijalankan, tes sebagai pengunjung anonim, pelanggan biasa, dan admin. Pelanggan tidak boleh membaca pesanan pengguna lain atau melakukan operasi admin.
5. Pastikan kedua akun allowlist admin berikut benar-benar dimiliki pemilik toko dan sudah dibuat/diamankan dari Supabase Dashboard sebelum signup publik dibuka: `numanalmuqorrin@gmail.com`, `inabahijab@gmail.com`. Konfirmasi email OFF tidak membuktikan kepemilikan email. Gunakan kata sandi unik dan MFA jika tersedia.
6. Jangan memasukkan `service_role` atau secret key ke `index.html`. Publishable key di browser harus tetap dipagari oleh RLS.

## Sebelum domain dipublikasikan

- Ganti Site URL dan redirect allowlist Supabase Auth dengan domain HTTPS final, termasuk `www` jika memang dipakai. Tes signup, login, reset password, dan callback auth di domain itu.
- Pilih satu domain kanonis. Setelah dipilih, tambahkan tag `rel=canonical`, edit `robots.txt`, salin `sitemap.xml.example` menjadi `sitemap.xml`, lalu ganti semua `https://DOMAIN-ANDA/` dengan URL final yang sebenarnya. Jangan deploy template sitemap yang masih memuat placeholder.
- Ganti gambar Open Graph editorial dengan gambar brand/properti yang memang boleh dipakai dan berukuran sesuai social preview.
- Pastikan kebijakan privasi dan ketentuan pemesanan sesuai praktik toko sebenarnya. Pemilik masih harus menetapkan aturan yang jelas soal pembatalan, retur/refund, batas waktu pembayaran, ongkir, jasa pengiriman, estimasi pengiriman, jam layanan, dan contact detail resmi.
- Masukkan produk asli lewat admin, lengkap dengan gambar milik sendiri, deskripsi, harga, ukuran/varian, dan ketersediaan. Sampai barang asli dimasukkan, katalog memang kosong.
- Saat ini detail produk masih berupa modal, bukan URL unik per produk; pencarian organik tingkat produk memerlukan halaman/rute produk tersendiri atau rendering sisi server.
- Tambahkan CAPTCHA/rate limiting di sisi server (mis. Edge Function atau penyedia CAPTCHA) untuk signup/formulir publik. Honeypot/client-side checks saja bukan proteksi anti-spam yang cukup.
- Tentukan apakah toko memakai jalur manual WhatsApp atau payment gateway. Paket ini mendukung konfirmasi manual, bukan pembayaran otomatis, ongkir otomatis, atau stok per ukuran.
- Uji upload gambar, perubahan status order, detail pesanan, akses pelanggan, responsif mobile, error network, dan backup sebelum membuka trafik publik.

## File

- `index.html`: halaman utama.
- `supabase-setup.sql`: setup database dan policy Supabase. Jalankan di SQL Editor hanya setelah backup/review.
- `kebijakan-privasi.html`: draft kebijakan privasi.
- `ketentuan-pemesanan.html`: informasi alur pesanan manual dan hal yang perlu ditetapkan pemilik.
- `favicon.svg`: favicon.
- `robots.txt`: aturan crawler awal; sitemap perlu disesuaikan setelah domain dipilih.
- `sitemap.xml.example`: template, jangan deploy sebelum mengganti placeholder.
