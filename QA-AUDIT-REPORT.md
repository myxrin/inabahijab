# INABA HIJAB — Laporan Audit & Revisi UX

## Ringkasan perubahan

### Navigasi dan alur akun
- Navigasi publik disederhanakan menjadi empat tujuan: Beranda, Katalog, Keranjang, dan Akun.
- Header desktop dan bottom navigation mobile menggunakan struktur yang konsisten; menu tambahan yang berulang di header sebelumnya dihilangkan dari navigasi utama.
- Tombol Akun mengarahkan sesi admin yang sudah diverifikasi ke dashboard admin, dan sesi pelanggan ke dashboard pelanggan. Pengunjung tanpa sesi melihat form autentikasi.
- Tombol Keluar Akun diberi label yang terlihat pada dashboard admin dan pelanggan.
- Form autentikasi memakai satu tombol submit dan dua tab/pemilih mode Masuk/Daftar, sehingga tidak muncul dua tombol submit yang membingungkan.
- Modal menutup lewat tombol, Escape, atau browser Back; state modal dikelola dengan history state agar Back dapat menutup dialog terlebih dahulu.

### Katalog dan modal produk
- Katalog diringkas: filter kategori, pencarian, pengurutan, kartu produk; pilihan grid/list yang berulang dihapus.
- Kartu produk dibuat sebagai satu area interaktif dengan informasi nama, kategori, harga, dan status yang diprioritaskan.
- Detail produk diberi CSS untuk seluruh keluarga kelas `ref-*` yang digunakan komponennya, termasuk layout desktop dua kolom dan bottom sheet mobile.
- Detail mendukung maksimal lima gambar, thumbnail yang dapat dipilih, varian, status ready/pre-order, kuantitas, tambah ke keranjang, salin tautan, dan WhatsApp.
- Pilihan wishlist palsu dihapus karena sebelumnya tidak tersimpan ke layanan mana pun.
- Tata letak pencarian lebih pendek dan konsisten pada layar kecil.

### Home dan konsistensi visual
- Hero/beranda disederhanakan dan CTA berulang dikurangi.
- Ringkasan keuntungan, preorder, spotlight, alur pemesanan, tentang toko, dan newsletter menggunakan salinan yang lebih singkat.
- CSS tambahan mencakup kontrol input, dialog, tombol, keadaan kosong, navigasi, serta layout mobile.
- Ikon dipakai sebagai bantuan navigasi/aksi, bukan dekorasi berulang. Teks action tetap disertakan pada tombol penting.
- Header disejajarkan ke kiri pada area merek dan jarak navigasi diatur untuk tampilan desktop.

### Database dan keamanan yang tetap dipertahankan
- Katalog dan aset tetap berasal dari Supabase; tidak ditambahkan produk demo atau URL foto luar sebagai fallback.
- Hak admin tetap membutuhkan verifikasi server (`is_admin()`); menyembunyikan tombol bukan mekanisme keamanan.
- Setup SQL menambahkan migrasi kompatibel untuk kolom yang mungkin belum ada pada tabel `tailoring_requests` versi lama, mengisi field wajib kosong dengan penanda yang eksplisit, dan menjaga baris lama tetap ada.
- Tidak ada service-role key yang ditambahkan ke frontend.

## Pemeriksaan statis

| Pemeriksaan | Hasil |
|---|---|
| Parser TypeScript/TSX | 29 file diparse tanpa error sintaks |
| Impor lokal relatif | Tidak ditemukan impor lokal yang hilang pada pemeriksaan statis |
| Diff Git | Paket unggahan tidak menyertakan metadata `.git`, jadi audit dilakukan pada source hasil ekstraksi, bukan riwayat diff repository |
| Build Vite/TypeScript penuh | **Belum terverifikasi** — dependency npm tidak tersedia dan npm registry tidak merespons dari lingkungan kerja ini |
| Workflow GitHub Pages | Diperbarui ke Actions berbasis runtime Node 24 dan Node.js 22 untuk build proyek; tetap perlu diuji oleh GitHub Actions |
| Tes browser/mobile | Belum dapat dijalankan dalam lingkungan ini |
| SQL pada Supabase live | Belum dieksekusi/dikonfirmasi pada project pengguna |
| Deployment Cloudflare/GitHub Pages | Tidak diklaim telah diuji oleh paket ini |

Pemeriksaan parser tidak menggantikan `npm run build`, tes browser, atau tes RLS/checkout di project live.

## Hal yang harus dilakukan sebelum menerima pesanan

1. Buat backup database Supabase dan jalankan `supabase_setup.sql` melalui SQL Editor pada project yang benar. Review error serta hasil setiap statement.
2. Karena migrasi menambahkan field yang belum ada, baris tailoring lama yang tidak punya nama/telepon/alamat asli dapat berisi placeholder seperti `Permintaan lama`, `Tidak tersedia`, atau `Alamat belum tersedia`. Periksa dan koreksi data tersebut dari sumber yang sah bila dibutuhkan.
3. Pastikan kebijakan Storage sesuai project. Skrip setup menata policy `storage.objects`; jangan jalankan pada project bersama sebelum memahami pengaruhnya.
4. Uji daftar/login, logout, routing akun admin/pelanggan, upload maksimal 5 foto, stok, varian, checkout, status pesanan, dan RLS menggunakan akun uji.
5. Jalankan `npm ci` atau `npm install`, lalu `npm run build` pada mesin dengan akses registry dan verifikasi deployment terbaru dari dashboard.

## Batasan yang masih diketahui

- Implementasi UI telah dirapikan, tetapi tanpa browser runtime tidak dapat dipastikan semua kombinasi ukuran layar bebas masalah visual.
- Build typecheck penuh dan koneksi langsung Supabase tidak dapat dijalankan dalam lingkungan pembuatan paket ini.
- Ini adalah paket source yang direvisi, bukan bukti bahwa website live sudah 100% siap menerima transaksi.
