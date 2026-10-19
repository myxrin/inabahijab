# Halaman Layar Penuh (Full-Page) untuk Dashboard Admin & Akun Pelanggan

Transformasi antarmuka akun dari modal pop-up yang sempit menjadi halaman penuh (*full-page view*) dengan sidebar navigasi kiri untuk admin dan portal terpadu untuk pelanggan, memberikan ruang kerja yang leluasa, terstruktur, dan profesional.

### User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan desain berikut telah dikonfirmasi melalui sesi tanya jawab sebelumnya:
> - **Tata Letak Admin**: Menggunakan layout dashboard layar penuh dengan **sidebar navigasi di sebelah kiri (240px–260px)** dan area kerja utama yang luas.
> - **Tampilan Akun Pelanggan**: Menggunakan **tampilan layar penuh** untuk semua jenis akun (baik admin toko maupun pelanggan umum non-admin), menggantikan dialog modal bertumpuk.
> - **Mekanisme Navigasi**: Menggunakan *hash-based routing* (`#admin`, `#akun`) dan integrasi *view state* di React sehingga pengguna dapat beralih secara mulus ke tampilan toko ("Kembali ke Toko") dan memanfaatkan tombol navigasi browser (*back/forward*).

---

### 1. Overview & Core Concept

- **Apa yang Dibangun**:
  1. **Admin Full-Page Dashboard**: Halaman khusus satu layar penuh dengan sidebar vertikal di kiri untuk mengelola katalog produk, kategori pakaian/seragam, antrean pesanan masuk (dengan pengubah status dan tombol direct WhatsApp), pengaturan nomor toko & rekening transfer, serta daftar email *newsletter*.
  2. **Customer Full-Page Portal**: Halaman akun khusus pelanggan dengan sidebar ringkas (profil, riwayat transaksi pesanan, status pembuatan seragam pre-order, dan tautan kembali belanja).
  3. **Navigasi Mulus**: Tombol "Kembali ke Toko" / "Lihat Toko" yang persisten untuk kembali ke beranda e-commerce tanpa kehilangan sesi atau status belanja.
- **Target Pengguna**:
  - **Admin / Pemilik Toko**: Membutuhkan ruang visual yang lapang untuk input produk baru, spesifikasi ukuran pre-order, pemantauan pesanan pelanggan, dan pengelolaan operasional harian tanpa terhalang dialog modal sempit.
  - **Pelanggan Umum**: Memerlukan kejelasan daftar pesanan, nomor resi/status produksi jahit, serta kemudahan akses profil akun.
- **Nilai Utama**: Menghilangkan batasan modal pop-up vertikal yang sesak (*cramped modal sheet*), meningkatkan efisiensi kerja admin secara drastis, dan memberikan pengalaman e-commerce modern setara SaaS e-commerce ternama.

---

### 2. User Experience & Visual Design

#### A. Alur Pengguna (User Flows)
1. **Akses Dashboard Admin**:
   - Admin login melalui tombol akun di header atau langsung via URL `#admin`.
   - Layar bertransisi ke tampilan *Full Page Admin Workspace*.
   - Sidebar kiri menampilkan tab navigasi aktif (Ringkasan, Katalog Produk, Kategori, Pesanan Masuk, Pengaturan Toko, Email Newsletter).
   - Saat memilih "Katalog Produk", admin dapat memfilter atau membuka form tambah/edit produk dengan tata letak formulir lapang berdampingan (*side-by-side / wide form grid*).
   - Tombol "Kembali ke Beranda Toko" selalu tersedia di bagian bawah sidebar maupun breadcrumb atas.
2. **Akses Portal Pelanggan**:
   - Pelanggan login atau mengklik profil akun.
   - Layar menampilkan *Full Page Customer Dashboard* dengan rangkuman profil, kartu riwayat pesanan yang jelas beserta rincian produk, estimasi masa PO, dan tombol WhatsApp CS.

#### B. Identitas Visual & Tema
- **Aesthetic**: *Clean Editorial Utility* yang selaras dengan palet hangat INABA Hijab:
  - Warna Kanvas: `#f8f4ec` (Paper) dan `#ffffff` (White Card Surfaces).
  - Aksen Utama: `#b84f36` (Terracotta Clay) untuk tombol aksi utama dan `#426247` (Forest Olive) untuk status aktif.
  - Garis Pembatas: Hairline border 1px halus `#ded8ca` tanpa bayangan tebal yang mengganggu.
- **Tipografi**:
  - Judul & Brand: `Newsreader` (serif anggun) dan `Figtree` (sans modern berbobot mantap).
  - Data Numerik & Keuangan: Angka harga rupiah dan kode pesanan menggunakan *tabular numerals* (`tabular-nums`) agar sejajar rapi.
- **Layout Responsif**:
  - Layar Desktop ($\ge 1024\text{px}$): Sidebar kiri terfiksasi setinggi layar (100vh) dengan scroll mandiri pada konten utama.
  - Layar Tablet & Ponsel: Header bar admin dengan tombol hamburger drawer untuk membuka navigasi samping, menjamin operasional dari ponsel tetap nyaman.

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Full-Page View Mode di React vs Modals Overlay**
  - *Pendekatan*: Mengganti pembungkus sheet pop-up `<div className="overlay">` pada `AccountModal` dengan komponen tampilan penuh mandiri (`AdminDashboardView` dan `CustomerDashboardView`) yang dirender bersyarat di level `App.tsx`.
  - *Alasan*: Modal sheet memiliki batas lebar dan tinggi yang memaksa admin scroll ganda (*scroll inside scroll*). Halaman penuh memanfaatkan 100% resolusi layar secara ergonomis.
  - *Alternatif yang Ditinggalkan*: Memperlebar modal sheet menjadi `width: 95vw`—ditolak karena tetap terasa seperti pop-up melayang dan tidak menyelesaikan masalah navigasi berlapis.

- **Keputusan 2: Hash Routing (`#admin`, `#akun`) & Sinkronisasi History**
  - *Pendekatan*: Menggunakan hash browser dan state sinkron di `StoreContext`.
  - *Alasan*: Menjaga kompatibilitas SPA Vite tanpa membutuhkan konfigurasi server rewrite khusus, serta memungkinkan bookmarking dan penggunaan tombol Back browser secara intuitif.

- **Keputusan 3: Manajemen Status Pesanan & Chat WhatsApp Langsung**
  - *Pendekatan*: Setiap kartu atau baris pesanan menampilkan detail pemesan, item belanja, total rupiah, *dropdown* status pesanan instan, serta tombol pintas "Chat WA Pelanggan" dengan pesan salam otomatis.
  - *Alasan*: Alur operasional bisnis busana muslim & seragam di Indonesia sangat bergantung pada komunikasi WhatsApp untuk konfirmasi ukuran atau bukti pembayaran.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                                App.tsx                                 │
│                                                                        │
│  currentView === 'store'               currentView === 'account'       │
│  ┌───────────────────────────────┐     ┌─────────────────────────────┐ │
│  │ Header (Top Bar Nav)          │     │ isUserAdmin ?               │ │
│  │ Main Sections (Hero, Catalog) │     │ ├─ AdminDashboard (Full)    │ │
│  │ Footer                        │     │ └─ CustomerDashboard (Full) │ │
│  └───────────────────────────────┘     └─────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│ Admin Sidebar (240px)         │   │ Admin Content Canvas          │
│ • Profil & Role Admin         │   │ • Top Bar: Breadcrumb + Action│
│ • Tab 1: Ringkasan & Statistik│   │ • Tab 1: 4 Metrik + Pesanan   │
│ • Tab 2: Katalog Produk       │   │ • Tab 2: Tabel + Form Editor  │
│ • Tab 3: Kategori             │   │ • Tab 3: Tambah & Urutkan     │
│ • Tab 4: Pesanan Masuk        │   │ • Tab 4: Manajemen Status     │
│ • Tab 5: Pengaturan Toko      │   │ • Tab 5: WA Toko & Rekening   │
│ • Tab 6: Email Newsletter     │   │ • Tab 6: Ekspor CSV           │
│ • [Kembali ke Beranda Toko]   │   │                               │
│ • [Keluar Akun]               │   │                               │
└───────────────────────────────┘   └───────────────────────────────┘
```

#### Komponen Utama yang Dibuat / Diperbarui:
1. `src/components/admin/AdminDashboard.tsx`: Halaman penuh dashboard admin terpadu dengan sidebar navigasi kiri, top breadcrumb bar, metrik statistik, dan sub-view masing-masing modul.
2. `src/components/account/CustomerDashboard.tsx`: Halaman penuh pelanggan dengan daftar riwayat transaksi pesanan, status pesanan, dan profil pengguna.
3. `src/context/StoreContext.tsx`: Penambahan helper view navigation (`currentView: 'store' | 'account'`, fungsi `navigateToView(view)`), integrasi hash change `#admin` & `#akun`.
4. `src/App.tsx`: Pemisahan rendering antara tampilan beranda toko (`store`) dan tampilan akun/admin penuh (`account`), memastikan pengalaman layar bersih tanpa elemen toko yang saling menumpuk.
5. `src/index.css`: Dukungan styling layout dashboard modern (sidebar layout, topbar breadcrumb, data table responsive, form grid dua kolom).
