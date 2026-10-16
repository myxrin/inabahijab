# INABA HIJAB — paket siap luncur (ready stock)

## Yang berubah
- Toko murni ready stock: semua jahit custom dihapus (menu, tombol di produk, formulir, tab admin, ukuran "Custom", teks kebijakan).
- Stok per produk (kolom `stock`): kartu menampilkan Ready / Sisa N / Habis, tombol beli nonaktif saat habis, jumlah dibatasi stok. `create_order` mengunci baris produk, menolak jika stok kurang, dan mengurangi stok otomatis. Admin mengisi stok di form produk.
- Alur: pilih ukuran, pesanan tercatat (menunggu pembayaran), konfirmasi total + ongkir lewat WhatsApp, transfer, barang dikirim. Status pesanan berbahasa Indonesia.
- Tipografi: Newsreader (judul) + Figtree (isi); teks isi 14–17px, tidak ada teks di bawah 12px; label tanpa huruf kapital; target sentuh 44px; input 16px (tanpa zoom di iOS); tautan "Lewati ke konten".
- Bahasa antarmuka diseragamkan ke Indonesia.

## Urutan deploy (penting)
1. Backup database Supabase.
2. Jalankan `supabase-setup.sql` di SQL Editor. Skrip ini menambah kolom `stock` dan masih menghapus semua RLS policy lama pada tabel yang dikelolanya (baca blok SECURITY HARDENING dulu; jangan jalankan jika ada policy kustom yang masih dibutuhkan).
3. Unggah semua file ke hosting.
4. Login admin, tambah produk asli: foto, harga, deskripsi, kategori, dan jumlah stok.
5. Tes sebagai pengunjung, pelanggan, dan admin: pesan satu barang, cek stok berkurang, ubah status pesanan.

## Wajib diisi pemilik sebelum membuka trafik
- `PAYMENT_METHODS` di `index.html`: isi rekening atau QRIS toko. Jika kosong, admin mengirim nomor rekening lewat WhatsApp.
- Pastikan dua email admin allowlist benar-benar milik pemilik dan akunnya sudah dibuat dengan kata sandi unik sebelum signup publik dibuka.
- Domain: ganti Site URL dan redirect Supabase Auth ke domain HTTPS final; tambahkan `rel=canonical`; salin `sitemap.xml.example` menjadi `sitemap.xml` dengan domain asli; tambahkan baris Sitemap di `robots.txt`.
- `ketentuan-pemesanan.html`: tetapkan aturan retur/refund, batas waktu bayar, ongkir, jasa kirim, dan jam layanan sesuai praktik toko.
- Ganti foto contoh (Unsplash) lewat Admin > Gambar, dan gambar Open Graph dengan foto brand sendiri.
- Tambahkan CAPTCHA/rate limiting (mis. Edge Function) untuk signup dan formulir publik.

## Batasan yang masih ada
- Pembayaran dan ongkir masih manual lewat WhatsApp; belum ada payment gateway atau ongkir otomatis.
- Stok dihitung per produk, belum per ukuran.
- Detail produk berupa modal, belum punya URL sendiri.
- Tabel `tailoring_requests` tidak dipakai lagi. Tidak dihapus otomatis; boleh di-drop manual setelah data lamanya tidak dibutuhkan.

## File
`index.html`, `supabase-setup.sql`, `kebijakan-privasi.html`, `ketentuan-pemesanan.html`, `favicon.svg`, `robots.txt`, `sitemap.xml.example`.
