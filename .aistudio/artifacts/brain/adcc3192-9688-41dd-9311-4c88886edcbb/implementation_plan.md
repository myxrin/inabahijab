# Penyempurnaan Tampilan Mobile, Ikon Presisi & Penyelarasan Menu Navigasi Header

Penyempurnaan menyeluruh antarmuka mobile (HP) agar proporsional dan elegan: memperkecil seluruh ikon yang menumpuk (header, bottom nav, dan filter kategori), menyelaraskan gaya daftar menu di samping header INABA HIJAB dengan visual modern list admin, serta memastikan fitur penambahan produk baru berfungsi 100% tanpa hambatan.

### User Review & Critical Decisions

> [!IMPORTANT]
> Ringkasan keputusan penting yang dikonfirmasi oleh pengguna pada tahap klarifikasi:
> - **Ukuran & Kerapian Ikon**: Semua kelompok ikon (header aksi, bottom navigation bar mobile, dan filter kategori) diperkecil secara proporsional (14px–17px) dengan stroke tipis elegan (1.5–1.7) agar tidak lagi menumpuk atau terasa sesak di layar smartphone.
> - **Daftar Menu Navigasi Utama**: Menu navigasi di samping tulisan header "INABA HIJAB" (Beranda, Pre-Order, Katalog, Capel & Meja, Cara Pesan, Bantuan) diubah dari teks polos menjadi format item berpita/tab modern menyerupai *admin navigation list* dengan indikator aktif, padding halus, sudut rounded, dan mikro-ikon pendamping.
> - **Kelancaran Tambah Produk Admin**: Memperbaiki alur penambahan produk di admin dashboard dengan validasi input yang luwes, penyelarasan schema payload ke Supabase (beserta fallback sinkronisasi instan ke storage lokal), serta penambahan tombol akses cepat "+ Tambah Produk" yang mudah dijangkau di semua tab dan tampilan HP.

---

### 1. Overview & Core Concept

- **What It Does**: Memberikan penyegaran visual tingkat tinggi pada antarmuka smartphone dan desktop:
  1. Header brand dan navigasi samping kini berpadu harmonis dengan item list bergaya dashboard admin (pill rounded, background hover lembut, mikro-ikon berpresisi tinggi).
  2. Seluruh ikon di smartphone (bar bawah, top bar, chip kategori) dibuat ringkas, proporsional, dan nyaman di mata (anti-numpuk).
  3. Alur pengelolaan katalog produk admin (tambah, edit, simpan status PO/Ready) menjadi tangguh dan instan terlihat di katalog toko.
- **Target Audience / Persona**: Pelanggan muslim, wali murid santri pre-order seragam, pembeli perlengkapan harian via smartphone, serta pengelola toko INABA Hijab yang mengelola inventaris langsung dari HP maupun laptop.
- **Key Value**: Pengalaman visual premium bernuansa butik islami modern yang lapang, tidak sesak di layar kecil, serta fungsi penambahan produk toko yang teruji andal.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Navigasi Header (Desktop & Mobile)**:
   - Pengunjung melihat logo brand **INABA HIJAB** dengan daftar menu di sampingnya yang berpenampilan sleek layaknya admin navigation (tiap item memiliki mikro-ikon halus, label teks jelas, background hover hangat, dan indikator aktif).
   - Di mobile, menekan hamburger menu membuka drawer dengan list rapi berformat baris berikon dan badge status seragam.
2. **Eksplorasi Katalog di Smartphone**:
   - Filter kategori dan division switcher tampil dengan ikon mini (13px–14px), teks proporsional, dan scroll horizontal mulus tanpa patahan atau penumpukan.
   - Bottom navigation bar melayang di bawah layar dengan tinggi pas (52px), ikon 16px, label 9.5px, serta safe-area iPhone/Android yang nyaman disentuh tanpa menghalangi konten.
3. **Pengelolaan Produk oleh Admin**:
   - Admin dapat menekan tombol "+ Tambah Produk" langsung dari tab Produk, tab Ringkasan, maupun tombol aksi cepat mobile.
   - Form editor terbuka dengan input harga, stok, foto, dan opsi Pre-Order Seragam.
   - Saat disimpan, produk langsung masuk ke daftar admin dan etalase toko secara sinkron.

#### Visual Identity & Theme
- **Aesthetic Direction**: *Warm Islamic Editorial & Clean Artisanal* — tenang, teratur, bersahaja namun berkelas tinggi tanpa elemen dekoratif berlebihan.
- **Color Palette**:
  - Primary Accent: Terracotta Clay (`#b84f36`) & Warm Sand (`#c99738`).
  - Surface Background: Soft Alabaster Paper (`#f8f5ee` / `#ffffff`).
  - Active Nav Item: `rgba(184, 79, 54, 0.08)` dengan border tipis `rgba(184, 79, 54, 0.18)` dan teks kontras.
  - Line Borders: Subtle warm hairline (`#e7ded0`).
- **Typography & Scale**:
  - Brand Header: Serif klasik Playfair Display / Cormorant Garamond.
  - Nav Items: Sans-serif Plus Jakarta Sans / Inter (13px di desktop, weight 600).
  - Mobile Bottom Labels: 9.5px–10px tabular font, letter-spacing tight.
- **Iconography Standards**:
  - Ukuran ikon header aksi: 17px (dari sebelumnya 20px) di dalam wadah sentuh 38px.
  - Ukuran ikon bottom navigation: 16px (dari sebelumnya 20px) dengan stroke 1.6px.
  - Ukuran ikon kategori filter: 13px–14px seimbang dengan teks 13px.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Transformasi Daftar Menu Header Mengikuti Style List Admin**
  - *Chosen Approach*: Mengubah tag navigasi samping header dari tautan teks telanjang menjadi sistem list horizontal bersegmen (segmented pill list) dengan mikro-ikon (Home, GraduationCap, Grid, Table, ShieldCheck, MessageCircle). Pada tampilan mobile drawer, tautan diubah menjadi list kartu bertingkat identik dengan sidebar admin.
  - *Why*: Menghadirkan kesatuan desain (*design continuity*) antara halaman depan dan dashboard manajemen, tampak modern dan profesional.
  - *Alternatives Considered*: Membiarkan navigasi teks standar garis bawah (terkesan generik dan kurang terstruktur).

- **Decision 2: Optimalisasi Ergonomi Ikon & Bottom Bar HP**
  - *Chosen Approach*: Menurunkan dimensi ikon sebesar ~20-25% dan memperluas jarak antar item (*hitbox* tetap 44px untuk kemudahan tap).
  - *Why*: Layar smartphone Indonesia rata-rata memiliki lebar 360px–393px; ikon besar membuat teks turun baris dan saling menumpuk.
  - *Alternatives Considered*: Menghilangkan label teks bawah dan hanya menyisakan ikon (dapat membingungkan pengguna awam).

- **Decision 3: Ketahanan & Fleksibilitas Simpan Produk (Supabase + Local Dual-Sync)**
  - *Chosen Approach*: Menyempurnakan `saveProduct` di `StoreContext` agar melakukan pembersihan payload (sanitasi tipe data array/string), menangkap respon Supabase secara aman, serta memastikan sinkronisasi langsung ke `adminProducts` dan `localStorage` sehingga produk langsung muncul di tabel admin dan etalase toko meskipun ada pembatasan RLS Supabase.
  - *Why*: Mencegah kegagalan simpan produk dan memastikan admin selalu melihat hasil inputnya seketika.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        INABA HIJAB STOREFRONT                          │
├────────────────────────────────────────────────────────────────────────┤
│  [Top Header]                                                          │
│  ┌──────────────┐   ┌──────────────────────────────────────────────┐   │
│  │ INABA HIJAB  │   │  [Beranda]  [PO Seragam]  [Katalog]  [Capel] │   │  <-- Styled like Admin List
│  └──────────────┘   └──────────────────────────────────────────────┘   │
│                     ┌───────────┐ ┌──────────┐ ┌───────────────────┐   │
│                     │ 🔍 Search │ │ 👤 Akun  │ │ 🛍️ Tas Belanja   │   │  <-- Mini Compact Icons (17px)
│                     └───────────┘ └──────────┘ └───────────────────┘   │
├────────────────────────────────────────────────────────────────────────┤
│  [Mobile Viewport: Filters & Catalog Feed]                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [✨ Semua]  [👗 Busana]  [🎓 Seragam PO]  [☀️ Capel]  [🪑 Meja]    │  │  <-- 13px Micro-Icons
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Produk List / Grid Tampilan HP Rapi & Bebas Overlap             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│  [Floating Mobile Bottom Navigation Bar (52px)]                        │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┬───────┐ │
│  │ 🏠 Beranda   │ 🛍️ Katalog   │ 🎓 Seragam   │ 💬 Bantuan   │ 👤 Akun│ │  <-- Compact 16px Icons
│  └──────────────┴──────────────┴──────────────┴──────────────┴───────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      ADMIN DASHBOARD & PERSISTENCE                     │
├────────────────────────────────────────────────────────────────────────┤
│  • Tombol Cepat: "+ Tambah Produk" di Header & Tab Toolbar             │
│  • Form Editor: Validasi lengkap, foto preset, varian S-XXL           │
│  • Dual-Storage Engine: Supabase DB + Instant Local Catalog Sync      │
│  • Reactive State: Update seketika di admin table & storefront feed    │
└────────────────────────────────────────────────────────────────────────┘
```

#### Komponen Utama yang Diperbarui:
1. `src/components/Header.tsx`:
   - Penambahan mikro-ikon pada nav desktop dan restrukturisasi kelas menjadi nav items bernuansa admin list.
   - Pengecilan tombol icon aksi header menjadi 38px dengan ikon 17px.
   - Penambahan tab Akun/Dashboard pada bottom bar mobile agar admin dan pelanggan langsung bisa mengakses akun dari mana saja.
   - Restrukturisasi drawer mobile dengan list berikon rapi.
2. `src/components/CatalogSection.tsx` & `src/components/Hero.tsx`:
   - Pengecilan ikon filter kategori menjadi 13px–14px, penyesuaian gap dan padding pill.
3. `src/components/admin/AdminDashboard.tsx`:
   - Penambahan tombol "+ Tambah Produk" yang mudah diakses di tab Ringkasan, Toolbar Tab Produk, dan versi mobile.
   - Penyempurnaan `handleSaveProduct` agar menangani error dengan deskripsi jelas dan menyisipkan produk ke daftar secara reaktif.
4. `src/context/StoreContext.tsx`:
   - Sanitasi payload penambahan produk (format UUID, sanitasi variants array/json, pencegahan RLS blocking).
   - Penggabungan data produk Supabase dengan data lokal secara konsisten sehingga produk yang baru ditambahkan tidak hilang saat refresh.
5. `src/index.css`:
   - Styling baru untuk `.nav` dan `.nav-item` bergaya admin pill.
   - Penyesuaian ukuran SVG dan hitbox pada `.mobile-bottom-bar`, `.mobile-bottom-item`, `.icon-btn`, dan `.filter`.
   - Penyempurnaan responsivitas pada layar smartphone < 400px (padding, line-height, text truncation, zero-overflow).
