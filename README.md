# INABA HIJAB — Toko Online

Aplikasi toko online mobile-first menggunakan React 19, TypeScript, Vite, dan Supabase (Auth, PostgreSQL, Storage, Row Level Security). Data katalog, harga, stok, varian, pengaturan, pesanan, dan foto produk berasal dari Supabase; aplikasi tidak menampilkan produk demo jika database kosong.

## Fitur

- Katalog multikategori dengan pencarian, filter, urutan harga, grid/list, dan detail produk.
- Ready stock dan pre-order seragam, keranjang serta checkout yang menghitung harga dan memeriksa stok kembali di PostgreSQL.
- Dashboard admin untuk mengelola produk, melihat pesanan, mengubah status, melihat pelanggan/newsletter, laporan, dan pengaturan kontak/rekening.
- Upload foto produk ke Supabase Storage dengan maksimal lima foto per produk; upload hero/banner dari admin ke bucket `site-images`.
- Tombol WhatsApp hanya aktif jika nomor toko yang sah sudah disetel.
- Antarmuka responsif dengan ikon SVG dari Lucide; tidak ada produk/foto contoh yang dijadikan fallback.

## Menjalankan di lokal

```bash
npm install
npm run dev
```

Build produksi:

```bash
npm run build
```

## Supabase dan keamanan

1. Jalankan `supabase_setup.sql` pada project Supabase yang tepat setelah melakukan backup dan membaca peringatan di `README-LAUNCH.md`.
2. Setel URL website produksi di Supabase Auth. Sign-up pelanggan tidak otomatis memberi hak admin walau email berada di allowlist.
3. Hak admin membutuhkan flag `inaba_admin=true` pada `auth.users.raw_app_meta_data`, yang hanya boleh disetel operator proyek melalui Supabase SQL Editor setelah identitas admin dipastikan. Lihat `README-LAUNCH.md`.
4. Jangan menempatkan Supabase service-role key atau secret key di browser. Publishable key boleh berada di client; RLS/RPC tetap menjadi kontrol akses server.

Status akhir: kode sudah disiapkan, tetapi SQL belum dieksekusi pada project live dan perlu uji end-to-end sebelum menerima pesanan sungguhan.
