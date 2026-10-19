# INABA HIJAB — Audit Teknis Paket Peluncuran

## Perubahan inti dalam revisi ini

- Menghapus tombol publik untuk membuka panel admin, toolbar pergantian mode developer, autentikasi admin palsu berbasis browser, dan persistensi katalog/pesanan demo. Tampilan admin dirender hanya setelah `public.is_admin()` menyatakan pengguna berhak. RLS database tetap menjadi kontrol keamanan utama.
- Mengamankan promosi admin: allowlist email tidak lagi cukup untuk memperoleh hak admin secara otomatis. Akun baru selalu dimulai sebagai pelanggan; hak admin membutuhkan `inaba_admin=true` pada `auth.users.raw_app_meta_data`, ditetapkan manual oleh operator proyek.
- Katalog, kategori, setelan toko, pesanan, dan data dashboard dipanggil dari Supabase; bila katalog kosong atau gagal dimuat, aplikasi memberi status kosong dan tidak mengganti hasil dengan barang contoh.
- Checkout memakai RPC `create_order` yang membaca harga, varian, status pre-order, dan stok dari PostgreSQL; harga dari browser tidak dijadikan otoritas. Riwayat/struk diambil kembali dari pesanan yang benar-benar tercatat.
- Akses produk dan pesanan dipagari RLS; upload, perubahan, dan penghapusan foto dilakukan oleh admin yang server-verified. Foto produk harus berada di bucket publik `product-images`, dan galeri dibatasi maksimal lima foto pada UI dan SQL.
- Menghapus fallback foto luar serta nomor WhatsApp contoh. Nomor kontak dan rekening perlu diisi admin sebelum komunikasi toko digunakan.
- Merapikan pesan katalog kosong, placeholder foto, informasi status ready-stock/pre-order, tanggal pesanan nyata, dan alur keluar akun.

## Pemeriksaan statis

| Pemeriksaan | Status saat paket disiapkan |
|---|---|
| Referensi produk/foto Unsplash/demo dari source frontend | Tidak ditemukan setelah seed demo dihapus |
| Nomor WhatsApp fallback di frontend | Dihapus; nomor disimpan melalui pengaturan Supabase |
| Jalan pintas `loginAsAdmin`/localStorage admin | Tidak ditemukan |
| Tombol publik “Kelola Toko” | Dihapus |
| Kumpulan foto produk | Maksimal 5, diunggah ke Storage Supabase |
| Validasi varian/harga/stok saat checkout | RPC database |
| RLS dan Storage policy | Disediakan di satu SQL setup; skrip menghapus policy pada `storage.objects` sebelum membuat policy bucket toko |

## Yang belum dapat dikonfirmasi dari lingkungan ini

- Skrip SQL belum dijalankan pada database Supabase live; validitas final SQL harus dibuktikan melalui SQL Editor sebelum situs dipublikasikan.
- Tidak tersedia sesi login administrator live untuk tes CRUD Storage/RLS dan checkout sungguhan.
- Perlu tes visual langsung pada browser target serta tes di ponsel.
- Build produksi penuh belum bisa dijalankan: dependensi npm belum tersedia di lingkungan dan registry tidak merespons pada percobaan pemasangan. Pemeriksaan parser TypeScript/TSX berhasil pada semua 29 file sumber (0 diagnostic syntax), tetapi itu bukan pengganti build penuh.

## Peringatan operasional

`supabase_setup.sql` mereset seluruh policy pada `storage.objects` sebelum menetapkan policy dua bucket milik toko. Pastikan project Supabase bukan project bersama untuk aplikasi lain atau sesuaikan skrip setelah backup. Jangan masukkan service-role key ke frontend.
| Parser TypeScript/TSX | 29 file lolos; 0 syntax diagnostic |
| Impor lokal relatif | 29 file dicek; 0 impor lokal hilang |

Catatan: pemeriksaan di atas adalah pemeriksaan statis. Tidak ada klaim bahwa aplikasi telah menjalani build produksi, tes browser, pengujian transaksi di Supabase live, atau deployment.
