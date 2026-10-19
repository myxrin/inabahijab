import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, User, Search, Menu, X, ArrowUpRight } from 'lucide-react';

export const Header: React.FC = () => {
  const { cartCount, openModal, user, isAdmin } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const scrollToSection = (id: string) => {
    closeMobileMenu();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAccountClick = () => {
    closeMobileMenu();
    if (user) {
      openModal('account');
    } else {
      openModal('auth');
    }
  };

  return (
    <>
      <header className="header">
        <div className="wrap header-inner">
          <button
            className="icon-btn menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Buka menu navigasi"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <a href="#home" className="brand" aria-label="INABA HIJAB beranda" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>
            <span className="brand-title">INABA<span>HIJAB</span></span>
            <span className="brand-desc">Busana Muslim · Seragam Sekolah · Perlengkapan Harian</span>
          </a>

          <nav className="nav" aria-label="Navigasi utama">
            <a onClick={() => scrollToSection('home')}>Beranda</a>
            <a onClick={() => scrollToSection('preorder-section')} className="badge-nav">Pre-Order Seragam</a>
            <a onClick={() => scrollToSection('shop')}>Katalog Lengkap</a>
            <a onClick={() => scrollToSection('spotlight')}>Capel &amp; Meja</a>
            <a onClick={() => scrollToSection('cara-pesan')}>Cara Pesan</a>
            <a onClick={() => scrollToSection('bantuan')}>Bantuan</a>
          </nav>

          <div className="header-actions">
            <button
              className="icon-btn"
              onClick={() => {
                scrollToSection('shop');
                setTimeout(() => {
                  const input = document.getElementById('productSearchInput');
                  input?.focus();
                }, 400);
              }}
              aria-label="Cari produk"
            >
              <Search size={20} />
            </button>

            <button
              className="icon-btn"
              onClick={handleAccountClick}
              aria-label={user ? (isAdmin ? 'Admin Dashboard' : 'Akun Saya') : 'Masuk Akun'}
              title={user ? (isAdmin ? 'Admin Dashboard' : 'Akun Saya') : 'Masuk Akun'}
            >
              <User size={20} />
              {isAdmin && (
                <span style={{ position: 'absolute', top: 3, right: 3, width: 8, height: 8, borderRadius: '50%', background: '#b84f36' }} />
              )}
            </button>

            <button
              className="icon-btn"
              onClick={() => openModal('cart')}
              aria-label="Keranjang belanja"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <nav className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <span className="eyebrow"><span className="eyebrow-dot"></span> Temukan Pilihan INABA Hijab</span>
        <button className="link-btn" onClick={() => scrollToSection('home')}>
          Beranda Toko <ArrowUpRight size={14} className="menu-arrow-icon" />
        </button>
        <button className="link-btn" onClick={() => scrollToSection('preorder-section')}>
          Pre-Order Seragam Sekolah <span className="po-pill">SDIT · TPQ · Madin</span>
        </button>
        <button className="link-btn" onClick={() => scrollToSection('shop')}>
          Katalog Semua Produk <ArrowUpRight size={14} className="menu-arrow-icon" />
        </button>
        <button className="link-btn" onClick={() => scrollToSection('spotlight')}>
          Capel Petani &amp; Meja Lipat <ArrowUpRight size={14} className="menu-arrow-icon" />
        </button>
        <button className="link-btn" onClick={() => scrollToSection('cara-pesan')}>
          Cara Pemesanan <ArrowUpRight size={14} className="menu-arrow-icon" />
        </button>
        <button className="link-btn" onClick={() => scrollToSection('cerita')}>
          Tentang Toko <ArrowUpRight size={14} className="menu-arrow-icon" />
        </button>
        <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
          <button className="btn btn-ghost" onClick={handleAccountClick}>
            {user ? (isAdmin ? 'Dashboard Admin' : 'Akun Saya') : 'Masuk / Daftar Akun'}
          </button>
          <button className="btn btn-clay" onClick={() => scrollToSection('bantuan')}>
            Hubungi WhatsApp
          </button>
        </div>
      </nav>

      {/* Floating Mobile Bottom Navigation Bar (Phone Screens < 640px) */}
      <nav className="mobile-bottom-bar" aria-label="Navigasi Cepat Bawah">
        <button className="mobile-bottom-item active" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <svg viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Beranda</span>
        </button>
        <button className="mobile-bottom-item" onClick={() => scrollToSection('shop')}>
          <svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <span>Katalog</span>
        </button>
        <button className="mobile-bottom-item" onClick={() => scrollToSection('preorder-section')}>
          <svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          <span>Seragam PO</span>
        </button>
        <button className="mobile-bottom-item" onClick={() => scrollToSection('bantuan')}>
          <svg viewBox="0 0 24 24" style={{ stroke: 'none', fill: 'currentColor' }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          <span>WhatsApp</span>
        </button>
        <button className="mobile-bottom-item" onClick={() => openModal('cart')}>
          <svg viewBox="0 0 24 24"><path d="M4 8h16l-1.2 12H5.2L4 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          <span>Keranjang</span>
        </button>
      </nav>
    </>
  );
};
