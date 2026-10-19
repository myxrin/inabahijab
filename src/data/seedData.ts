import { Category, Product, StoreSettings } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    name: 'Hijab & Pakaian',
    slug: 'hijab-pakaian',
    description: 'Koleksi busana muslim, gamis pria/wanita, koko, kurta dan hijab pilihan',
    icon: 'sparkles',
    display_order: 1,
    is_active: true
  },
  {
    name: 'Seragam Sekolah — Pre-Order',
    slug: 'seragam-sekolah',
    description: 'Pre-order seragam resmi SDIT, TPQ, dan Madrasah Diniyah Sirimbit Keluarga',
    icon: 'graduation-cap',
    display_order: 2,
    is_active: true
  },
  {
    name: 'Perlengkapan Petani',
    slug: 'perlengkapan-petani',
    description: 'Topi capel petani tradisional anyaman bambu & alat perlindungan kebun',
    icon: 'sun',
    display_order: 3,
    is_active: true
  },
  {
    name: 'Meja & Perabot',
    slug: 'meja-perabot',
    description: 'Meja lipat portable multifungsi untuk belajar, laptop, ngaji, dan dagang',
    icon: 'table',
    display_order: 4,
    is_active: true
  },
  {
    name: 'Produk Lainnya',
    slug: 'produk-lainnya',
    description: 'Kebutuhan harian dan perlengkapan pilihan lainnya',
    icon: 'package',
    display_order: 5,
    is_active: true
  }
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-po-sdit-01',
    name: 'Setelan Seragam SDIT Putra Lengkap',
    slug: 'setelan-seragam-sdit-putra-lengkap',
    category: 'Seragam Sekolah — Pre-Order',
    price: 135000,
    stock: 0,
    is_preorder: true,
    preorder_status: 'open',
    school_institution: 'SDIT',
    estimated_delivery: '14–21 hari kerja',
    min_order: 1,
    badge: 'PRE-ORDER',
    featured: true,
    is_active: true,
    description: 'Setelan seragam sekolah SDIT putra berbahan Oxford Super dan celana Drill halus. Jahitan rapi, kokoh, adem dipakai seharian di sekolah. Tersedia opsi bordir nama dan logo lembaga.',
    variants: ['Anak S (Kelas 1-2)', 'Anak M (Kelas 2-3)', 'Anak L (Kelas 4-5)', 'Anak XL (Kelas 6)'],
    specifications: {
      'Bahan Atasan': 'Oxford Super Halus & Tebal',
      'Bahan Celana': 'Nagata Drill Kuat Anti Kusut',
      'Kelengkapan': 'Baju Koko Berkerah + Celana Panjang + Dasi/Peci',
      'Lembaga': 'SDIT / Sekolah Dasar Islam Terpadu'
    },
    size_guide: 'Tabel Ukuran Seragam SDIT:\n- Anak S (Kelas 1-2): Lebar Dada 38cm, Pjg Baju 52cm, Pjg Celana 68cm\n- Anak M (Kelas 2-3): Lebar Dada 40cm, Pjg Baju 55cm, Pjg Celana 73cm\n- Anak L (Kelas 4-5): Lebar Dada 43cm, Pjg Baju 58cm, Pjg Celana 78cm\n- Anak XL (Kelas 6): Lebar Dada 46cm, Pjg Baju 62cm, Pjg Celana 84cm'
  },
  {
    id: 'prod-po-sdit-02',
    name: 'Setelan Seragam SDIT Putri Gamis & Kerudung Syar\'i',
    slug: 'setelan-seragam-sdit-putri-gamis-kerudung',
    category: 'Seragam Sekolah — Pre-Order',
    price: 145000,
    stock: 0,
    is_preorder: true,
    preorder_status: 'open',
    school_institution: 'SDIT',
    estimated_delivery: '14–21 hari kerja',
    min_order: 1,
    badge: 'PRE-ORDER',
    featured: true,
    is_active: true,
    description: 'Gamis seragam SDIT putri setelan lengkap dengan kerudung bergo syari serasi. Menggunakan bahan Katun Toyobo Fodu tidak terawang dan nyaman menyerap keringat.',
    variants: ['Anak S (Kelas 1-2)', 'Anak M (Kelas 2-3)', 'Anak L (Kelas 4-5)', 'Anak XL (Kelas 6)'],
    specifications: {
      'Bahan Gamis': 'Katun Toyobo Fodu Premium',
      'Bahan Jilbab': 'Kaos PE Double Tebal & Ringan',
      'Model': 'Gamis Syar\'i Potongan A-Line + Kerudung Bergo Instan',
      'Lembaga': 'SDIT Putri'
    },
    size_guide: 'Ukuran Gamis SDIT Putri:\n- Anak S: LD 76cm, Pjg Gamis 92cm\n- Anak M: LD 80cm, Pjg Gamis 102cm\n- Anak L: LD 86cm, Pjg Gamis 112cm\n- Anak XL: LD 92cm, Pjg Gamis 122cm'
  },
  {
    id: 'prod-po-tpq-01',
    name: 'Setelan Seragam Santri TPQ / TPA Hijau Lumut',
    slug: 'setelan-seragam-santri-tpq-tpa-hijau-lumut',
    category: 'Seragam Sekolah — Pre-Order',
    price: 95000,
    stock: 0,
    is_preorder: true,
    preorder_status: 'open',
    school_institution: 'TPQ / TPA',
    estimated_delivery: '10–14 hari kerja',
    min_order: 1,
    badge: 'FAVORIT PO',
    featured: true,
    is_active: true,
    description: 'Seragam santri mengaji TPQ/TPA warna kombinasi hijau lumut & putih bersih. Potongan longgar santun, nyaman dipakai mengaji sore hari.',
    variants: ['Anak S (Usia 4-6 thn)', 'Anak M (Usia 7-8 thn)', 'Anak L (Usia 9-10 thn)', 'Anak XL (Usia 11-12 thn)'],
    specifications: {
      'Bahan': 'Katun Besway Halus Adem',
      'Kelengkapan': 'Baju Atasan Koko + Celana / Rok + Sablon Logo Lembaga',
      'Warna': 'Hijau Lumut Kombinasi Putih'
    },
    size_guide: 'Ukuran Seragam TPQ:\n- Anak S: LD 36cm, Pjg 48cm\n- Anak M: LD 39cm, Pjg 52cm\n- Anak L: LD 42cm, Pjg 56cm\n- Anak XL: LD 45cm, Pjg 60cm'
  },
  {
    id: 'prod-po-madin-01',
    name: 'Seragam Madrasah Diniyah Sirimbit Keluarga & Guru',
    slug: 'seragam-madrasah-diniyah-sirimbit-keluarga',
    category: 'Seragam Sekolah — Pre-Order',
    price: 155000,
    stock: 0,
    is_preorder: true,
    preorder_status: 'open',
    school_institution: 'Madrasah Diniyah',
    estimated_delivery: '14–21 hari kerja',
    min_order: 1,
    badge: 'PRE-ORDER',
    featured: true,
    is_active: true,
    description: 'Seragam resmi sirimbit untuk keluarga santri, asatidz, dan pengurus Madrasah Diniyah. Desain anggun bersahaja dengan bahan Katun Madinah berserat lembut.',
    variants: ['Anak S', 'Anak M', 'Anak L', 'Dewasa S', 'Dewasa M', 'Dewasa L', 'Dewasa XL'],
    specifications: {
      'Bahan': 'Katun Madinah Original Adem Serat Halus',
      'Kombinasi': 'Sirimbit Ayah, Ibu, Santri Putra & Putri',
      'Lembaga': 'Madrasah Diniyah Sirimbit'
    },
    size_guide: 'Ukuran Sirimbit Madin:\nDewasa S: LD 98cm, Dewasa M: LD 104cm, Dewasa L: LD 110cm, Dewasa XL: LD 118cm'
  },
  {
    id: 'prod-modest-01',
    name: 'Gamis Katun Madinah Premium Polos Anggun',
    slug: 'gamis-katun-madinah-premium-polos',
    category: 'Hijab & Pakaian',
    price: 165000,
    stock: 12,
    is_preorder: false,
    badge: 'READY STOCK',
    featured: true,
    is_active: true,
    description: 'Gamis syari wanita bahan Katun Madinah original grade A. Adem, jatuh lembut, wudhu friendly dengan kancing manset tangan, dan busui friendly dengan resleting depan.',
    variants: ['All Size Standar (LD 105cm)', 'Size L (LD 110cm)', 'Size XL (LD 115cm)'],
    specifications: {
      'Bahan': 'Katun Madinah Import Grade A',
      'Detail': 'Saku samping kanan, tali pinggang serut, resleting depan',
      'Panjang Baju': '138 cm'
    },
    size_guide: 'All Size Standar: LD 105cm, PB 138cm\nSize L: LD 110cm, PB 140cm\nSize XL: LD 115cm, PB 140cm'
  },
  {
    id: 'prod-modest-02',
    name: 'Baju Koko Kurta Modern Katun Toyobo Pria',
    slug: 'baju-koko-kurta-modern-katun-toyobo',
    category: 'Hijab & Pakaian',
    price: 125000,
    stock: 8,
    is_preorder: false,
    badge: 'READY STOCK',
    featured: true,
    is_active: true,
    description: 'Baju koko kurta lengan 3/4 gaya modern minimalis. Nyaman untuk sholat berjamaah, pengajian, silaturahmi Idul Fitri, dan acara formal muslim.',
    variants: ['M (LD 104cm)', 'L (LD 108cm)', 'XL (LD 114cm)'],
    specifications: {
      'Bahan': 'Katun Toyobo Fodu Jepang',
      'Model': 'Kerah Mandarin Kancing Aktif, Saku Dada & Samping',
      'Lengan': 'Tiga Perempat (3/4)'
    },
    size_guide: 'Size M: LD 104cm, Pjg 75cm\nSize L: LD 108cm, Pjg 78cm\nSize XL: LD 114cm, Pjg 81cm'
  },
  {
    id: 'prod-modest-03',
    name: 'Hijab Bergo Maryam Syar\'i Jumbo Crinkle Airflow',
    slug: 'hijab-bergo-maryam-syari-jumbo-crinkle',
    category: 'Hijab & Pakaian',
    price: 45000,
    stock: 25,
    is_preorder: false,
    badge: 'BESTSELLER',
    featured: false,
    is_active: true,
    description: 'Jilbab instan bergo tali belakang bahan Crinkle Airflow stretch lembut tanpa setrika. Menutup dada dengan sempurna, adem untuk harian.',
    variants: ['Standar (PD 80cm, PB 100cm)', 'Jumbo Syari (PD 95cm, PB 120cm)'],
    specifications: {
      'Bahan': 'Crinkle Airflow Premium Anti Kusut',
      'Model': 'Bergo Non-Pet dengan Tali Pengikat Belakang'
    }
  },
  {
    id: 'prod-petani-01',
    name: 'Topi Capel Petani Anyaman Bambu Standar (D: 45 cm)',
    slug: 'topi-capel-petani-anyaman-bambu-standar',
    category: 'Perlengkapan Petani',
    price: 35000,
    stock: 30,
    is_preorder: false,
    badge: 'PRODUK KHAS',
    featured: true,
    is_active: true,
    description: 'Topi capel petani tradisional kerajinan anyaman bambu alami. Melindungi kepala dan leher dari terik sinar matahari serta gerimis hujan saat di sawah dan kebun.',
    variants: ['Diameter 45 cm (Standar)'],
    specifications: {
      'Bahan': 'Bambu Alami Kulit Pilihan',
      'Lapisan': 'Furing Kain Pelindung Bagian Dalam + Tali Dagu',
      'Ukuran': 'Diameter 45 cm'
    }
  },
  {
    id: 'prod-petani-02',
    name: 'Topi Capel Petani Jumbo Lapisan Furing Waterproof (D: 50 cm)',
    slug: 'topi-capel-petani-jumbo-waterproof-50cm',
    category: 'Perlengkapan Petani',
    price: 48000,
    stock: 15,
    is_preorder: false,
    badge: 'READY STOCK',
    featured: false,
    is_active: true,
    description: 'Capel ukuran lebar ekstra diameter 50 cm dengan lapisan pelindung anti-air. Lebih sejuk dan jangkauan naungan lebih luas untuk kerja lapangan seharian.',
    variants: ['Diameter 50 cm (Jumbo)'],
    specifications: {
      'Bahan': 'Anyaman Bambu Dobel Halus',
      'Fitur': 'Anti Tembus Gerimis, Rangka Kuat & Seimbang',
      'Ukuran': 'Diameter 50 cm'
    }
  },
  {
    id: 'prod-meja-01',
    name: 'Meja Lipat Portable Serbaguna Slot Gadget & Cangkir (60x40 cm)',
    slug: 'meja-lipat-portable-serbaguna-slot-gadget',
    category: 'Meja & Perabot',
    price: 68000,
    stock: 20,
    is_preorder: false,
    badge: 'BESTSELLER',
    featured: true,
    is_active: true,
    description: 'Meja lipat lesehan multifungsi untuk belajar anak, mengaji Al-Qur\'an, laptop kerja, maupun meja santai. Dilengkapi slot penahan tablet/HP dan holder cangkir minuman.',
    variants: ['Ukuran 60x40 cm (Warna Kayu Natural)', 'Ukuran 60x40 cm (Warna Walnut Hitam)'],
    specifications: {
      'Bahan Daun Meja': 'MDF Premium Halus Tahan Cipratan Air',
      'Kaki Meja': 'Besi Pipa Kokoh dengan Karet Busa Anti-Slip',
      'Dimensi Terbuka': '60 cm × 40 cm × 28 cm',
      'Fitur Tambahan': 'Slot Penyangga Tablet & Lubang Botol/Gelas'
    }
  },
  {
    id: 'prod-meja-02',
    name: 'Meja Lipat Lesehan Kayu Kokoh Mengaji & Belajar',
    slug: 'meja-lipat-lesehan-kayu-kokoh-mengaji',
    category: 'Meja & Perabot',
    price: 85000,
    stock: 10,
    is_preorder: false,
    badge: 'READY STOCK',
    featured: false,
    is_active: true,
    description: 'Meja lipat kayu solid finishing halus natural. Sangat stabil untuk alas membaca Al-Qur\'an, kitab santri, atau aktivitas menulis anak sekolah di lantai.',
    variants: ['Standar Lesehan (55x35 cm)'],
    specifications: {
      'Bahan': 'Kayu Mahoni Pilihan Finishing Halus',
      'Ketinggian': '26 cm (Nyaman untuk Duduk Sila)',
      'Beban Maksimal': 'Hingga 35 kg'
    }
  }
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  store_title: 'INABA HIJAB',
  contact_whatsapp: '6285735144904',
  payment_accounts: [
    { label: 'Bank BCA', detail: '8030-1234-56 a.n. INABA HIJAB' },
    { label: 'Bank BRI', detail: '0123-01-098765-50-1 a.n. INABA HIJAB' },
    { label: 'Bank Mandiri', detail: '137-00-1928374-6 a.n. INABA HIJAB' },
    { label: 'QRIS Semua Pembayaran', detail: 'Scan QRIS resmi toko via WhatsApp' }
  ]
};
