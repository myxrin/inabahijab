# INABA HIJAB — Laporan Audit Revisi Responsif

## Perubahan utama

- Navigasi storefront menggunakan `?tab=beranda`, `?tab=katalog`, dan `?tab=keranjang`; setiap perpindahan tab menjadi entri history supaya browser Back kembali ke tab sebelumnya.
- Dashboard admin bisa membuka drawer sidebar pada layar sempit. Drawer dibatasi tinggi viewport, menu internal dapat digulir, dan pilihan menu menutup drawer setelah dipilih.
- Dashboard admin memakai grid fleksibel, kartu berukuran adaptif, tabel dengan area scroll horizontal sendiri, serta pembungkus teks agar konten tidak memotong lebar viewport.
- Editor produk menyimpan input harga/stok sebagai teks selama pengetikan; angka divalidasi ketika disimpan. Ini menghindari field berubah ke `0` ketika pengguna sedang mengosongkan input.
- Detail pesanan tidak mengarang email, nomor telepon, atau alamat pelanggan; data yang tidak tersedia ditandai dengan jelas.
- Keranjang menjadi halaman penuh dengan ringkasan subtotal, pengubah kuantitas, hapus item, tombol checkout, serta header/footer dan navbar mobile tetap ada.
- Area pelanggan memiliki navbar bawah mobile dengan Beranda, Katalog, Keranjang, dan Akun.
- SQL menambahkan kolom kompatibilitas untuk instalasi lama pada `tailoring_requests`, menormalkan status lama sebelum constraint saat ini dipasang, dan mempertahankan data tabel.
- Workflow GitHub Pages tetap ada dengan base path khusus Pages; concurrency group dibuat khusus untuk proyek INABA HIJAB agar tidak memakai nama umum `pages` yang berpotensi bertabrakan dengan workflow Pages lain. Konfigurasi Cloudflare Pages (`npm run build`, output `dist`) tidak diganti.

## Pemeriksaan statis terakhir

- 29 file TypeScript/TSX diparse dengan TypeScript `transpileModule`: 0 error sintaks.
- Pemeriksaan import relatif: 0 import lokal hilang.
- `src/index.css` dan `src/adminRef.css` diparse oleh TinyCSS2: 0 error parser top-level.
- `.github/workflows/deploy.yml` berhasil diparse sebagai YAML dan memiliki job `build` dan `deploy`.
- `supabase_setup.sql` berisi 1.043 baris dan lulus pemeriksaan keseimbangan kutip, dollar-quote, dan tanda kurung.
- Arsip ZIP final diuji ulang dengan `unzip -t`.

## Batas verifikasi

Build produksi penuh (`npm run build`) belum dapat diverifikasi. Instalasi dependensi npm di lingkungan ini gagal karena registry tidak dapat diakses (`EAI_AGAIN`) dan `node_modules` yang tersedia tidak lengkap. SQL belum dijalankan terhadap project Supabase live. Oleh karena itu, laporan ini tidak menyatakan bahwa build/deploy atau migrasi live sudah berhasil.

## Checklist sebelum rilis

1. Pada salinan proyek dan lingkungan dengan koneksi registry npm, jalankan `npm ci` kemudian `npm run build`.
2. Buat backup database sebelum menjalankan SQL.
3. Baca catatan SQL: skrip ini mengganti policy terkait tabel aplikasi INABA HIJAB dan mereset policy `storage.objects`; bila project Supabase turut digunakan oleh aplikasi/bucket lain, tinjau bagian Storage dan sesuaikan sebelum eksekusi.
4. Verifikasi login admin dan pelanggan, navigasi browser Back, drawer admin mobile, edit/penyimpanan harga-stok, upload maksimal lima foto, checkout, RLS, dan deployment live.
