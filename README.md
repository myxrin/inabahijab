# INABA HIJAB — Toko Busana Muslim, Seragam Pre-Order & Perlengkapan Harian

Aplikasi e-commerce modern dibangun menggunakan **React 19**, **TypeScript**, dan **Vite**, terhubung dengan backend **Supabase** (Auth, PostgreSQL, Storage, RLS) serta konfirmasi pemesanan terintegrasi langsung ke **WhatsApp**.

## Fitur Utama

- **Katalog Multikategori & Filter Lini:**
  - 3 Lini Spesialis: INABA Modest (Busana Muslim & Hijab), INABA Schoolwear (Pre-Order Seragam SDIT, TPQ, Madin), INABA Living & Craft (Topi Capel Petani Tradisional & Meja Lipat).
  - Pencarian instan dan pengurutan (Unggulan, Harga, Nama A-Z, Ready Stock, Pre-Order).
- **Layanan Pre-Order Resmi Seragam Sekolah:**
  - Filter institusi (SDIT, Santri TPQ/TPA, Madrasah Diniyah Sirimbit).
  - Kalkulator Rombongan Sekolah/Lembaga dengan diskon bertingkat (5% - 15%) dan perhitungan DP 50%.
  - Tabel panduan ukuran terstandar.
- **Keranjang Belanja & Checkout Atomik:**
  - Pilihan varian ukuran, stepper kuantitas dengan batas minimal/maksimal.
  - Alur checkout dengan catatan identitas santri & pilihan pengiriman terpadu (kirim sekaligus atau terpisah).
  - Penghasil pesan WhatsApp terformat otomatis dengan nomor resi unik pesanan `#INB-XXXXXX`.
- **Dashboard Pengelola Toko (Admin):**
  - Hanya dapat diakses oleh admin terdaftar di allowlist (`numanalmuqorrin@gmail.com`, `inabahijab@gmail.com`).
  - Pengelolaan katalog produk, kategori, status pesanan, pengaturan nomor WhatsApp & rekening pembayaran, serta ekspor pelanggan warta newsletter ke CSV.
- **Antarmuka Responsif & Cepat:**
  - Header dengan menu drawer mobile dan bilah navigasi cepat bawah (mobile bottom bar) untuk kenyamanan pengguna smartphone.

## Pengembangan Lokal

```bash
# Menjalankan dev server di port 3000
npm run dev

# Membangun produksi
npm run build
```
