import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, ArrowUpRight } from 'lucide-react';
import { cleanPhoneNumber } from '../../lib/supabase';

export const PolicyModal: React.FC = () => {
  const { activeModal, closeModal, storeSettings } = useStore();

  if (activeModal !== 'privacyPolicy' && activeModal !== 'termsConditions') return null;

  const isPrivacy = activeModal === 'privacyPolicy';
  const waNumber = cleanPhoneNumber(storeSettings.contact_whatsapp || '6285735144904');
  const waContactUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    isPrivacy
      ? 'Halo INABA HIJAB, saya ingin bertanya tentang kebijakan privasi.'
      : 'Halo INABA HIJAB, saya ingin bertanya tentang ketentuan pemesanan, ongkir, dan pembayaran.'
  )}`;

  return (
    <div className="overlay open" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      <section className="sheet sheet-wide" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="sheet-handle" aria-hidden="true"></div>
        <div className="sheet-head">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot"></span> {isPrivacy ? 'Perlindungan Data Pelanggan' : 'Panduan & Ketentuan Berbelanja'}
            </div>
            <h2 className="serif">{isPrivacy ? 'Kebijakan Privasi' : 'Ketentuan Pemesanan'}</h2>
          </div>
          <button className="close-btn" onClick={closeModal} aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        {isPrivacy ? (
          <div style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
            <p>
              Di <strong>INABA HIJAB</strong>, kami menghargai privasi dan kepercayaan para pelanggan. Dokumen ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda saat menggunakan layanan toko online kami.
            </p>

            <div className="notice">
              <strong>Komitmen Privasi:</strong> Data pelanggan hanya digunakan semata-mata untuk memproses pemesanan barang, mengoordinasikan pengiriman dengan ekspedisi, serta mengirimkan kabar berkala bagi pelanggan yang secara sukarela mendaftar newsletter. Kami tidak pernah memperjualbelikan data Anda kepada pihak ketiga.
            </div>

            <h3 style={{ font: '20px var(--serif)', color: 'var(--ink)', margin: '20px 0 8px' }}>1. Data yang Kami Kumpulkan</h3>
            <ul style={{ paddingLeft: 20 }}>
              <li><strong>Data Akun:</strong> Alamat email dan nama yang didaftarkan pelanggan saat membuat akun di website.</li>
              <li><strong>Data Transaksi &amp; Pengiriman:</strong> Nama penerima, nomor WhatsApp/telepon, alamat tujuan pengiriman, catatan ukuran seragam, dan riwayat belanja.</li>
              <li><strong>Data Komunikasi:</strong> Pesan konfirmasi dan bukti transfer pembayaran yang dikirimkan melalui saluran resmi WhatsApp toko.</li>
            </ul>

            <h3 style={{ font: '20px var(--serif)', color: 'var(--ink)', margin: '20px 0 8px' }}>2. Penggunaan Data Pribadi</h3>
            <ul style={{ paddingLeft: 20 }}>
              <li>Mencatat pesanan pelanggan dan mengunci stok ready stock atau mengalokasikan slot pre-order seragam sekolah.</li>
              <li>Menghubungi pelanggan untuk konfirmasi ketersediaan, perhitungan tarif ongkir ekspedisi, dan pengiriman nomor resi.</li>
              <li>Mengelola rekam jejak pesanan dan layanan purna jual atau penukaran barang bila terjadi cacat produksi.</li>
            </ul>

            <h3 style={{ font: '20px var(--serif)', color: 'var(--ink)', margin: '20px 0 8px' }}>3. Keamanan Penyimpanan</h3>
            <p>
              Situs ini menggunakan standar keamanan terenkripsi. Hanya akun berhak admin resmi yang diizinkan mengelola katalog dan administrasi pesanan toko.
            </p>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
              <strong>Kontak Layanan Privasi:</strong>
              <p style={{ margin: '6px 0' }}>
                WhatsApp: <a href={waContactUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--clay)', fontWeight: 700 }}>+{waNumber} <ArrowUpRight size={13} className="btn-arrow-icon" /></a>
              </p>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
            <p>
              Selamat datang di <strong>INABA HIJAB</strong>. Kami menyediakan busana muslim ready stock, layanan pre-order seragam sekolah (SDIT, TPQ, dan Madrasah Diniyah Sirimbit Keluarga), topi capel petani tradisional, serta meja lipat serbaguna.
            </p>

            <div className="notice">
              <strong>Catatan Alur Pemesanan:</strong> Saat ini pengajuan pesanan melalui situs web dicatat dengan status <em>Menunggu Pembayaran</em>. Rincian ongkos kirim dan instruksi rekening transfer bank / QRIS akan dikonfirmasi oleh admin melalui WhatsApp sebelum Anda melakukan transfer.
            </div>

            <h3 style={{ font: '20px var(--serif)', color: 'var(--ink)', margin: '20px 0 8px' }}>1. Perbedaan Ready Stock dan Pre-Order</h3>
            <ul style={{ paddingLeft: 20 }}>
              <li><strong>Barang Ready Stock:</strong> Produk busana muslim, gamis, topi capel petani, dan meja lipat yang tercatat tersedia dapat langsung dikemas dan dikirim dalam 1–2 hari kerja setelah transfer diverifikasi.</li>
              <li><strong>Barang Pre-Order (PO):</strong> Dikhususkan untuk Pre-Order Seragam Sekolah (SDIT, santri TPQ, dan Madrasah Diniyah Sirimbit). Barang diproduksi secara terencana berdasarkan batch pemesanan, dengan estimasi waktu pengerjaan berkisar <strong>10 hingga 21 hari kerja</strong> setelah penutupan batch PO.</li>
            </ul>

            <h3 style={{ font: '20px var(--serif)', color: 'var(--ink)', margin: '20px 0 8px' }}>2. Pengajuan Pesanan &amp; Verifikasi Ukuran</h3>
            <ul style={{ paddingLeft: 20 }}>
              <li>Untuk pakaian dewasa dan seragam, periksa tabel panduan ukuran yang tersedia di situs web.</li>
              <li>Untuk pemesanan pre-order seragam rombongan atau bordir nama santri, sertakan catatan pada kolom yang disediakan atau komunikasikan langsung dengan admin melalui WhatsApp.</li>
              <li>Jika stok barang ready habis saat verifikasi berlangsung, admin akan menawarkan opsi ganti warna, menunggu restock, atau pembatalan tanpa biaya.</li>
            </ul>

            <h3 style={{ font: '20px var(--serif)', color: 'var(--ink)', margin: '20px 0 8px' }}>3. Pembayaran &amp; Konfirmasi</h3>
            <ul style={{ paddingLeft: 20 }}>
              <li>Metode pembayaran resmi dilakukan melalui transfer antar-bank (BCA, BRI, Mandiri) atau QRIS yang diberikan admin toko resmi.</li>
              <li>Simpan bukti transfer dan kirimkan tangkapan layar (screenshot) ke nomor WhatsApp admin.</li>
              <li>Untuk pesanan pre-order seragam dalam jumlah besar, dapat diberlakukan uang muka (DP) sebesar 50% di awal dan pelunasan sebelum barang dikirimkan.</li>
            </ul>

            <h3 style={{ font: '20px var(--serif)', color: 'var(--ink)', margin: '20px 0 8px' }}>4. Pengiriman &amp; Ekspedisi</h3>
            <p>
              Pengiriman dilakukan dari gudang/workshop toko menggunakan ekspedisi terpercaya (JNE, J&amp;T, SiCepat, Wahana, atau kargo logistik untuk pesanan berat seperti meja lipat &amp; seragam rombongan). Nomor resi pengiriman akan dibagikan kepada pelanggan segera setelah paket diserahkan ke kurir.
            </p>

            <h3 style={{ font: '20px var(--serif)', color: 'var(--ink)', margin: '20px 0 8px' }}>5. Garansi Cacat Produksi &amp; Retur</h3>
            <p>
              Jika terdapat cacat produksi (jahitan robek, resleting rusak, salah kirim ukuran/warna dari pesanan yang disepakati), pembeli berhak mengajukan penukaran barang maksimal <strong>2 &times; 24 jam</strong> sejak paket diterima, disertai video unboxing.
            </p>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
              <strong>Layanan Bantuan &amp; Konsultasi WhatsApp:</strong>
              <p style={{ margin: '6px 0' }}>
                WhatsApp: <a href={waContactUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--clay)', fontWeight: 700 }}>+{waNumber} <ArrowUpRight size={13} className="btn-arrow-icon" /></a>
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
