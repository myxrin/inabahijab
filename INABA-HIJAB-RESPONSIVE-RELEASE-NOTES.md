# INABA HIJAB — Catatan Revisi Responsif

## Perubahan

- Menu admin pada layar sempit memakai drawer yang dapat digulir; Kategori, Pelanggan, Newsletter, Laporan, dan Pengaturan tetap tersedia dari tombol Menu.
- Dashboard admin memakai grid fleksibel, tabel memiliki area scroll horizontal sendiri, dan header/kartu dirapikan agar tidak memotong konten.
- Harga dan stok produk tetap bisa diedit saat field kosong sementara; angka divalidasi saat simpan. Input menerima angka tanpa titik, sedangkan harga ditampilkan dalam format Rupiah di bantuan field.
- Data contoh yang terlihat seperti alamat, email, atau nomor telepon pelanggan pada detail pesanan dihapus; data yang tidak tersedia ditampilkan dengan pesan yang jelas.
- Tab Beranda, Katalog, dan Keranjang menggunakan query `?tab=beranda`, `?tab=katalog`, dan `?tab=keranjang`. Perubahan tab menjadi entri history sehingga Back kembali ke tab sebelumnya.
- Keranjang dirender sebagai halaman penuh di dalam layout storefront; header/footer serta navigasi bawah mobile tetap aktif.
- Status tab di navigasi utama ditunjukkan secara visual dan dengan `aria-current`.
- SQL migrasi mempertahankan data lama dan menormalkan status permintaan jahit sebelum menerapkan constraint status yang baru.
- Konfigurasi Vite, workflow GitHub Actions, `package.json`, dan lockfile dipertahankan agar tidak mengubah jalur hosting yang sudah ada.

## Pemeriksaan yang dilakukan

- 29 file TypeScript/TSX lulus pemeriksaan sintaks melalui TypeScript `transpileModule`.
- Semua import lokal dalam source ditemukan.
- `src/index.css` dan `src/adminRef.css` lulus parsing CSS tanpa error.
- `supabase_setup.sql` lulus pemeriksaan keseimbangan string, dollar-quote, dan tanda kurung.

## Batas verifikasi

Build produksi penuh tidak dapat dijalankan di lingkungan kerja ini karena instalasi dependensi npm terhenti saat registry npm tidak dapat diakses (`EAI_AGAIN`), dan folder `node_modules` yang tersedia tidak lengkap. SQL juga belum dieksekusi ke project Supabase live. Karena itu, lakukan `npm ci && npm run build` di lingkungan yang punya akses registry, dan backup database sebelum menjalankan SQL.
