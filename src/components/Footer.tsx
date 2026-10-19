import React from 'react';
import { useStore } from '../context/StoreContext';
import { cleanPhoneNumber } from '../lib/supabase';
import { ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { openModal, setActiveFilter, storeSettings, user, isAdmin, navigateToView } = useStore();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFilter = (catName: string) => {
    setActiveFilter(catName);
    scrollTo('shop');
  };

  const waNumber = cleanPhoneNumber(storeSettings.contact_whatsapp || '6285735144904');
  const waContactUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    'Halo INABA HIJAB, saya ingin bertanya tentang produk dan pemesanan.'
  )}`;

  return (
    <footer className="footer" id="bantuan">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <a href="#home" className="brand" onClick={(e) => { e.preventDefault(); scrollTo('home'); }}>
              <span className="brand-title">INABA<span>HIJAB</span></span>
              <span className="brand-desc">Busana Muslim · Seragam Sekolah · Perlengkapan Harian</span>
            </a>
            <p className="footer-note">
              Pusat busana muslim ready stock, pre-order seragam sekolah SDIT, TPQ, dan Madrasah Diniyah Sirimbit, perlengkapan capel petani, serta meja lipat serbaguna.
            </p>
          </div>

          <div className="footer-col">
            <h4>Katalog</h4>
            <button className="footer-link-btn" onClick={() => scrollTo('preorder-section')}>
              Pre-Order Seragam Sekolah
            </button>
            <button className="footer-link-btn" onClick={() => handleFilter('Hijab & Pakaian')}>
              Busana Muslim &amp; Gamis
            </button>
            <button className="footer-link-btn" onClick={() => handleFilter('Perlengkapan Petani')}>
              Topi Capel Petani
            </button>
            <button className="footer-link-btn" onClick={() => handleFilter('Meja & Perabot')}>
              Meja Lipat Serbaguna
            </button>
          </div>

          <div className="footer-col">
            <h4>Informasi</h4>
            <button className="footer-link-btn" onClick={() => scrollTo('cara-pesan')}>
              Panduan Pemesanan
            </button>
            <button className="footer-link-btn" onClick={() => openModal('sizeGuide')}>
              Tabel Ukuran Seragam
            </button>
            <button className="footer-link-btn" onClick={() => openModal('termsConditions')}>
              Ketentuan &amp; Pengiriman
            </button>
            <button className="footer-link-btn" onClick={() => openModal('privacyPolicy')}>
              Kebijakan Privasi
            </button>
            <button
              className="footer-link-btn"
              onClick={() => {
                if (user) {
                  navigateToView(isAdmin ? 'admin' : 'customer');
                } else {
                  openModal('auth');
                }
              }}
            >
              {user ? (isAdmin ? 'Dashboard Admin Toko' : 'Akun Saya') : 'Masuk Akun'}
            </button>
          </div>

          <div className="footer-col">
            <h4>Hubungi Kami</h4>
            <a
              href={waContactUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              WhatsApp Toko (+{waNumber}) <ArrowUpRight size={13} className="btn-arrow-icon" />
            </a>
            <p style={{ fontSize: 12, color: '#9da195', marginTop: 6, lineHeight: 1.6 }}>
              Layanan chat aktif setiap hari untuk konfirmasi pesanan, jadwal batch PO, dan cek ongkir.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} INABA HIJAB. Seluruh hak cipta dilindungi.</span>
          <span>Amanah · Transparan · Berkualitas</span>
        </div>
      </div>
    </footer>
  );
};
