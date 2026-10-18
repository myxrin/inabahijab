# INABA HIJAB — Platform Toko & Pre-Order Multikategori

Platform e-commerce visual modern berbasis **HTML5, CSS3 murni, dan ES Modules modern** dengan backend **Supabase** (PostgreSQL, Storage, Auth) serta integrasi transaksi instan **WhatsApp Checkout**.

---

## 🌟 Fitur & Penyempurnaan Terbaru (Revisi Penuh)

### 1. ⚡ Pesan Cepat 1-Sentuhan via WhatsApp (Instant Buy)
- Di modal setiap produk tersedia tombol hijau mencolok: **`⚡ Pesan Langsung via WhatsApp`**.
- Sekali sentuh, chat WhatsApp admin langsung terbuka dengan format pesanan rapi (nama produk, varian/ukuran, jumlah, estimasi harga subtotal, lembaga/sekolah) tanpa mewajibkan pembeli mendaftar atau login.

### 2. 🛒 Keranjang Belanja Hybrid (Guest Cart & Akun Terdaftar)
- Pengunjung umum/tamu dapat langsung menaruh barang ke keranjang belanja menggunakan `localStorage`.
- Pembeli tidak lagi dihadang tembok wajib login hanya untuk menyimpan barang belanjaan.
- Pengguna yang masuk dengan akun resmi tetap tersinkronisasi dengan database `public.cart_items` Supabase.

### 3. 🛡️ Solusi Varian Cerdas (Zero-Lockdown Guarantee)
- Sistem tidak lagi mematikan tombol beli jika data varian di database kosong atau belum diisi.
- Dilengkapi **Smart Variant Fallback** otomatis sesuai kategori:
  - **Seragam Sekolah:** Ukuran standar anak TK/SD hingga dewasa sirimbit.
  - **Busana Muslim / Gamis:** Ukuran All Size, S, M, L, XL.
  - **Topi Capel Petani:** Diameter 45 cm (Standar) & 50 cm (Besar).
  - **Meja Lipat:** Ukuran standar 60x40 cm.

### 4. 🖼️ Tampilan Visual Kaya & Fallback Anggun
- Menghapus pembatasan kaku storage internal sehingga URL gambar berkualitas tinggi (seperti Unsplash) dapat tampil secara penuh pada:
  - Foto Banner Utama Beranda (*Hero*)
  - Banner Pre-Order Seragam Sekolah
  - Banner Capel Petani & Meja Lipat
  - Seluruh kartu produk di katalog
- Apabila koneksi terputus atau gambar gagal dimuat, sistem menampilkan ilustrasi SVG fallback elegan alih-alih kotak abu-abu rusak.

### 5. 🏫 Kalkulator Rombongan Lembaga & Sekolah (SDIT, TPQ, Madin)
- Dilengkapi kalkulator interaktif untuk menghitung kebutuhan seragam santri/siswa secara kolektif.
- Menghitung diskon volume otomatis (5% untuk ≥20 pcs, 10% untuk ≥50 pcs) serta estimasi DP produksi 50%.
- Tombol 1-klik untuk mengirim draf resmi ke WhatsApp admin toko atau menyalin rincian untuk dibagikan ke panitia.

### 6. 📱 Ergonomi Layar Sentuh Mobile (Mobile-First Experience)
- **Floating Mobile Bottom Bar:** Bilah navigasi bawah tetap di HP dengan akses cepat ke Beranda, Katalog, Pre-Order, WhatsApp, dan Keranjang Belanja.
- **Perbaikan Drawer Menu:** Menghilangkan celah melayang 36px di bawah header pada menu mobile.
- **Grid Responsif:** Kartu kategori di layar sentuh tampil dalam format 2 kolom proporsional yang rapi.
- **Pemisahan Pengiriman (Split Shipping):** Opsi kirim sekaligus (hemat ongkir) vs kirim ready stock dulu (cepat sampai).

---

## 📁 Struktur Berkas

```text
├── index.html               # Aplikasi utama (storefront, katalog, checkout, admin)
├── kebijakan-privasi.html    # Halaman legal kebijakan privasi
├── ketentuan-pemesanan.html  # Halaman ketentuan pemesanan & pengiriman
├── supabase_setup.sql       # Skrip DDL lengkap untuk Supabase PostgreSQL
├── favicon.svg              # Ikon website vektor
├── _headers                 # Header keamanan Cloudflare Pages
├── robots.txt               # Aturan perayapan mesin pencari
├── sitemap.xml              # Peta situs untuk SEO
└── README.md                # Dokumentasi proyek
```

---

## ⚙️ Petunjuk Setup Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**.
2. Salin isi berkas `supabase_setup.sql` lalu jalankan (*Run*).
3. Skrip akan secara otomatis membuat dan menyempurnakan tabel:
   - `profiles`
   - `categories`
   - `products` (termasuk kolom `variants jsonb`)
   - `cart_items`
   - `orders` & `order_items`
   - `store_settings` & `site_images`
   - `newsletter_subscribers`
4. Pastikan nomor kontak WhatsApp toko di tabel `store_settings` diatur dengan format internasional (contoh: `6285735144904`).
