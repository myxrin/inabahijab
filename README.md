# INABA HIJAB — Toko Online

Website toko online mobile-first dengan React 19, TypeScript, Vite, dan Supabase (Auth, PostgreSQL, Storage, Row Level Security). Produk, kategori, harga, stok, varian, pengaturan toko, pesanan, dan gambar diambil dari Supabase; katalog tidak mengganti database kosong dengan barang contoh.

## Pengalaman pengguna

- Navigasi utama ringkas: **Beranda, Katalog, Keranjang, Akun**.
- Akun terverifikasi admin diarahkan ke dashboard admin; akun pelanggan diarahkan ke halaman akun pelanggan.
- Header dan navigasi bawah dirancang untuk mobile, dengan label teks yang jelas dan ikon seperlunya.
- Katalog mempunyai filter kategori, pencarian singkat, pengurutan, dan kartu produk konsisten.
- Detail produk memiliki galeri hingga 5 gambar, pilihan varian, harga, stok/status pre-order, jumlah, dan aksi keranjang/WhatsApp.
- Dialog mendukung tombol kembali, tombol Escape, dan riwayat browser agar pengguna bisa kembali dari popup tanpa langsung keluar dari situs.
- Form login/daftar menggunakan satu aksi kirim, dengan tombol Masuk/Daftar sebagai pemilih mode; terdapat tombol Keluar Akun yang jelas.

## Teknologi dan perintah

- React + TypeScript + Vite
- Supabase Auth, PostgreSQL, RPC, dan Storage

```bash
npm install
npm run dev
```

Build produksi:

```bash
npm run build
```

Output build berada di `dist/`.

## Deploy

### Cloudflare Pages

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: kosong (karena `package.json` ada di root)
- Jangan set `GITHUB_PAGES=true` pada build Cloudflare.

### GitHub Pages

Workflow `.github/workflows/deploy.yml` menetapkan `GITHUB_PAGES=true` agar path aset menggunakan `/inabahijab/`. Source lain memakai root `/` untuk hosting di domain custom/Cloudflare.

## Setup Supabase dan keamanan

1. Cadangkan database dan baca seluruh peringatan di `README-LAUNCH.md` sebelum menjalankan `supabase_setup.sql`.
2. SQL setup mencakup migrasi kompatibel untuk kolom yang belum ada pada `tailoring_requests`, tetapi tetap jalankan pada project yang benar dan tinjau output SQL Editor.
3. Hak admin harus diberikan melalui mekanisme server yang dijelaskan dalam `README-LAUNCH.md`. Email/URL/localStorage saja tidak pernah menjadi bukti admin.
4. Jangan pernah memasukkan service-role key atau secret key ke frontend. Publishable key memang dipakai di client; RLS dan RPC harus tetap melindungi data.
5. Isi produk, foto, kontak WhatsApp, rekening, banner, dan detail operasional melalui Supabase/admin sebelum menerima pesanan.

## Status verifikasi

Source sudah ditinjau dan diperbaiki untuk UX, navigasi, popup produk, akun, dan style bersama. Pemeriksaan parser TypeScript/TSX dan impor lokal dilakukan secara statis. Build produksi penuh serta tes browser dan transaksi Supabase live tetap harus dijalankan pada lingkungan yang memiliki dependensi dan akses project Supabase/Cloudflare.
