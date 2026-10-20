# Catatan sebelum menjalankan `supabase_setup.sql`

1. Buat backup database atau setidaknya ekspor tabel terkait sebelum menjalankan migrasi.
2. Jalankan keseluruhan `supabase_setup.sql` di Supabase SQL Editor setelah meninjau proyek dan pesan SQL yang mungkin muncul.
3. Skrip menambah kolom kompatibilitas pada tabel lama, termasuk `tailoring_requests.customer_name` dan `address`, lalu mempertahankan baris lama dengan penanda apabila informasi lama kosong.
4. Skrip mengganti policy RLS untuk tabel aplikasi INABA HIJAB dan mereset policy pada `storage.objects` sebelum membuat policy Storage yang lebih ketat. Jika proyek Supabase yang sama dipakai oleh aplikasi atau bucket lain, tinjau bagian tersebut sebelum menjalankan.
5. Skrip tidak memberi hak admin hanya berdasarkan email. Hak admin tetap harus diberikan melalui `raw_app_meta_data` oleh operator tepercaya dan email tetap harus ada di allowlist.
6. SQL belum dapat dieksekusi pada project Supabase pengguna dari lingkungan ini; setelah menjalankan, periksa hasil Success dan lakukan pengujian login, admin, upload gambar, checkout, pembatalan, dan RLS.
