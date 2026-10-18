## Revisi 5 (perbaikan tampilan)

- Header desktop tidak lagi bertumpuk: menu satu baris, deskripsi merek disembunyikan di bawah 1500 px, ikon keranjang selalu terlihat.
- Tablet (640–1099 px) memakai menu hamburger, bukan menu penuh yang berdesakan.
- Hero di HP: teks placeholder tidak lagi menimpa teks overlay.
- Baris lini produk dan kartu kategori di desktop membungkus rapi, tidak terpotong.
- Teks "konveksi" dihapus karena produk adalah barang stok siap, bukan jahit custom.
- Meta sosial: `twitter:card` menjadi `summary` dan `og:image` memakai URL absolut.
- Tidak ditemukan error sintaks JavaScript, ID ganda, atau overflow horizontal (diuji di lebar 390, 820, 1100, 1280, 1366, 1920 px).

Koreksi untuk laporan Revisi 4 di bawah: bilah navigasi bawah HP ada di kode saat ini, dan nomor WhatsApp 6285735144904 dipakai sebagai cadangan bila `store_settings.contact_whatsapp` kosong.

# INABA Hijab — QA & Audit Teknis (Revisi 4)

## Perubahan pada revisi ini

- Menghapus copy `Masuk atau daftar dengan email & password`, input kata sandi, tombol pendaftaran berbasis password, dan reset password dari modal akun. Akses akun sekarang menggunakan tautan verifikasi email satu kali dari Supabase Auth.
- Panel admin hanya dibuka setelah tautan verifikasi Supabase berhasil dan `public.is_admin()` mengesahkan role. Email di tabel `public.admin_email_allowlist` mendapat role admin hanya setelah `auth.users.email_confirmed_at` terisi; email pelanggan lain tetap role pelanggan. Profile role tidak bisa ditulis dari klien.
- Menghapus seluruh navbar bawah mobile, termasuk tombol keranjang di navbar tersebut. Tombol keranjang di header tetap tersedia.
- Menambahkan file `_headers` untuk header keamanan dasar pada Cloudflare Pages (`nosniff`, proteksi framing, referrer policy, pembatasan fitur perangkat). Hosting lain perlu konfigurasi setara di server/hosting.
- Memperbaiki keterbacaan list (`ul`/`li`): jarak antarbutir, indentasi, line-height, marker, dan pemenggalan teks panjang.
- Menghapus fallback nomor WhatsApp/rekening dari state frontend, URL WhatsApp hardcoded, dan persistensi pengaturan ke `localStorage`. Link WhatsApp menjadi tidak aktif jika nomor valid tidak tersedia dari `store_settings`; checkout berhenti sebelum membuat order jika konfigurasi WhatsApp tidak valid.
- Merender ringkasan subtotal dan barang konfirmasi dari record `orders`/`order_items` yang sudah tersimpan server, bukan harga dari state browser.
- Edit produk mempertahankan status aktif/nonaktif yang sudah ada, bukan mengaktifkan ulang produk tersembunyi tanpa disengaja.
- Memperbaiki kategori agar simpan/aktif-nonaktif hanya dilaporkan sukses setelah Supabase mengonfirmasi; tidak ada kategori sementara `cat-*` yang menjadi seolah-olah tersimpan. Trigger SQL menyelaraskan `products.category` saat nama kategori berubah.
- Form newsletter tidak lagi melaporkan sukses bila koneksi Supabase tidak ada; email duplikat diberi status sudah terdaftar.
- Membatasi grant INSERT keranjang, newsletter, dan permintaan jahit ke kolom input yang dibutuhkan; field status/ID/timestamp tidak dapat ditetapkan lewat insert publik.
- Memperbaiki serialisasi pengaturan JSONB: nomor WhatsApp disimpan sebagai string JSON dan daftar pembayaran sebagai array JSON yang sebenarnya, bukan string berisi JSON. Seed SQL baru sengaja mengosongkan nomor WA dan daftar pembayaran sampai admin mengisi data resmi.
- Memperketat SQL: policy lama pada tabel situs dikelola dibersihkan sebelum policy baru dibuat, policy newsletter menegaskan format/panjang email, akses profil anonim dihapus, dan fungsi trigger dicabut hak panggil langsungnya dari role API. Seluruh policy lama `storage.objects` di-reset agar policy broad tidak bisa memberi akses lewat OR lintas policy; bucket/file tidak dihapus, tetapi izin aplikasi lain pada project yang sama bisa terputus.
- Menghapus varian ukuran dan tabel panduan statis, termasuk fallback varian `Standar`. Opsi varian, panduan ukuran, stok, harga, deskripsi dan status pre-order dibaca dari Supabase; PostgreSQL memvalidasi pilihan varian dan harga/stok checkout dari data produk server-side. Produk lama yang tidak memiliki varian aman ditolak dari proses pemesanan. Baris keranjang lama yang memakai varian yang sudah tidak terdaftar diberi peringatan, dan checkout dinonaktifkan sampai baris itu dihapus.
- Menghapus nomor WhatsApp dan data pembayaran awal dari seed SQL baru; pengaturan harus diisi dari dashboard dan dibaca dari Supabase.
- Menghapus fungsi buka tabel ukuran statis: tombol panduan global kini membaca panduan produk dari database. Batas minimum preorder di UI disamakan dengan batas checkout 50 pcs dan konfigurasi yang invalid dinonaktifkan. Trigger PostgreSQL juga memeriksa kepemilikan user, produk aktif, ketersediaan stok/status pre-order, dan varian yang sah pada INSERT/UPDATE keranjang.

## Validasi lokal yang dijalankan

| Pemeriksaan | Hasil |
|---|---|
| Parsing HTML dengan parser lokal | Lulus |
| `node --check` pada JavaScript module inline | Lulus |
| Copy login/password lama dan field password UI | Tidak ditemukan |
| Markup/navbar bawah mobile | Tidak ditemukan |
| URL WhatsApp dengan nomor hardcoded di frontend | Tidak ditemukan |
| Pemakaian `localStorage` di frontend | Tidak ditemukan |
| Foto katalog demo/hardcoded eksternal | Tidak ditemukan; gambar konten diambil dari bucket Storage pada project Supabase |
| Tabel SQL final di project/ZIP | Satu file: `supabase_setup.sql` |
| Pemanggilan UI emoji-range | Tidak ditemukan |
| Tipe payload pengaturan `store_settings` | String WhatsApp dan array pembayaran native JSON |
| Daftar varian hardcoded di storefront | Tidak ditemukan; opsi datang dari `products.variants` |
| Tombol panduan ukuran global | Membuka konten dinamis dari data produk Supabase |
| Batas minimum pre-order UI | Dibatasi 1–50 pcs; checkout DB tetap menjadi otoritas |
| Grant insert form publik | Column-level grant untuk field yang diperlukan saja |
| Input NULL/non-array dan array kosong/terlalu besar pada `create_order(p_items)` | Ditolak sebelum iterasi |
| Varian produk dan item keranjang | Divalidasi di frontend dan trigger/RPC server-side |
| Fallback varian statis `Standar` | Tidak ditemukan pada frontend/SQL baru |
| Email admin | Allowlist terpusat dan tidak dapat dibaca/diubah melalui API klien; wajib terverifikasi |
| Operasi `DROP TABLE` | Tidak ditemukan |

## Belum terverifikasi

- SQL belum dijalankan oleh server PostgreSQL/Supabase live. Validasi parser lokal bukan pengganti eksekusi SQL.
- Belum ada tes live email delivery/magic link, RLS antar-peran, operasi Storage, checkout, pembatalan stok, atau order end-to-end.
- Browser nyata belum dapat menyelesaikan pemeriksaan visual interaktif pada sesi ini.
- Project Supabase live belum dapat diakses dari sesi pengerjaan ini. Pastikan tabel allowlist hanya berisi email admin yang tepat dan terverifikasi; aktifkan MFA untuk admin bila memungkinkan, lalu uji email delivery dan redirect.

## Langkah wajib sebelum produksi

1. Cadangkan database dan Storage. Pastikan tidak ada aplikasi lain yang bergantung pada policy bucket Storage di project yang sama sebelum menjalankan skrip.
2. Jalankan `supabase_setup.sql` dan periksa seluruh hasil SQL.
3. Aktifkan Email provider/SMTP dan allowed redirect URL untuk domain produksi.
4. Pastikan isi `public.admin_email_allowlist` hanya alamat admin yang kepemilikannya telah dibuktikan, lalu verifikasi pemilik email melalui magic link. Jangan tambahkan alamat ke allowlist jika kepemilikannya belum dibuktikan.
5. Isi `products.variants` dan `size_guide` untuk setiap produk yang akan dijual; produk tanpa varian sengaja tidak bisa dipesan.
6. Uji akses pelanggan vs admin, tautan verifikasi, CRUD katalog, upload/ganti/hapus gambar, pengaturan kontak, checkout, total server, dan rollback stok di Supabase live.
