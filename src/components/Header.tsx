import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  ArrowUpRight,
  Home,
  GraduationCap,
  Layers,
  Sparkles,
  ClipboardCheck,
  HelpCircle,
  Info,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { cartCount, openModal, user, isAdmin, navigateToView } = useStore();
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
      navigateToView(isAdmin ? 'admin' : 'customer');
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
            {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
          </button>

          <a
            href="#home"
            className="brand"
            aria-label="INABA HIJAB beranda"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home');
            }}
          >
            <span className="brand-title">INABA<span>HIJAB</span></span>
            <span className="brand-desc">Busana Muslim · Seragam Sekolah · Perlengkapan Harian</span>
          </a>

          {/* Navigasi Utama di Samping Tulisan Brand (Desktop) — Bergaya Navigasi Admin List */}
          <nav className="header-admin-style-nav desktop-only" aria-label="Navigasi utama">
            <button
              type="button"
              className="header-admin-nav-item"
              onClick={() => scrollToSection('home')}
            >
              <Home size={13.5} className="nav-item-icon" />
              <span>Beranda</span>
            </button>
            <button
              type="button"
              className="header-admin-nav-item"
              onClick={() => scrollToSection('preorder-section')}
            >
              <GraduationCap size={13.5} className="nav-item-icon" />
              <span>Pre-Order Seragam</span>
              <span className="nav-item-badge">PO</span>
            </button>
            <button
              type="button"
              className="header-admin-nav-item"
              onClick={() => scrollToSection('shop')}
            >
              <Layers size={13.5} className="nav-item-icon" />
              <span>Katalog Lengkap</span>
            </button>
            <button
              type="button"
              className="header-admin-nav-item"
              onClick={() => scrollToSection('spotlight')}
            >
              <Sparkles size={13.5} className="nav-item-icon" />
              <span>Capel &amp; Meja</span>
            </button>
            <button
              type="button"
              className="header-admin-nav-item"
              onClick={() => scrollToSection('cara-pesan')}
            >
              <ClipboardCheck size={13.5} className="nav-item-icon" />
              <span>Cara Pesan</span>
            </button>
            <button
              type="button"
              className="header-admin-nav-item"
              onClick={() => scrollToSection('bantuan')}
            >
              <HelpCircle size={13.5} className="nav-item-icon" />
              <span>Bantuan</span>
            </button>
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
              title="Cari Produk"
            >
              <Search size={15} />
            </button>

            <button
              className="icon-btn"
              onClick={handleAccountClick}
              aria-label={user ? (isAdmin ? 'Admin Dashboard' : 'Akun Saya') : 'Masuk Akun'}
              title={user ? (isAdmin ? 'Admin Dashboard' : 'Akun Saya') : 'Masuk Akun'}
            >
              <User size={15} />
              {isAdmin && (
                <span className="admin-status-dot-header" />
              )}
            </button>

            <button
              className="icon-btn"
              onClick={() => openModal('cart')}
              aria-label="Keranjang belanja"
              title="Keranjang Belanja"
            >
              <ShoppingBag size={15} />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* Mobile Admin-Style Navigation Strip (Visible directly under/beside header on phone) */}
        <div className="header-mobile-admin-strip">
          <nav className="header-admin-style-nav mobile-strip-nav" aria-label="Navigasi cepat utama">
            <button
              type="button"
              className="header-admin-nav-item"
              onClick={() => scrollToSection('home')}
            >
              <Home size={12} className="nav-item-icon" />
              <span>Beranda</span>
            </button>
            <button
              type="button"
              className="header-admin-nav-item"
              onClick={() => scrollToSection('preorder-section')}
            >
              <GraduationCap size={12} className="nav-item-icon" />
              <span>Pre-Order PO</span>
              <span className="nav-item-badge">PO</span>
            </button>
            <button
              type="button"
              className="header-admin-nav-item"
              onClick={() => scrollToSection('shop')}
            >
              <Layers size={12} className="nav-item-icon" />
              <span>Katalog</span>
            </button>
            <button
              type="button"
              className="header-admin-nav-item"
              onClick={() => scrollToSection('spotlight')}
            >
              <Sparkles size={12} className="nav-item-icon" />
              <span>Capel &amp; Meja</span>
            </button>
            <button
              type="button"
              className="header-admin-nav-item"
              onClick={() => scrollToSection('cara-pesan')}
            >
              <ClipboardCheck size={12} className="nav-item-icon" />
              <span>Cara Pesan</span>
            </button>
            <button
              type="button"
              className="header-admin-nav-item"
              onClick={() => scrollToSection('bantuan')}
            >
              <HelpCircle size={12} className="nav-item-icon" />
              <span>Bantuan</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Drawer dengan Gaya Admin List Berstruktur */}
      <nav className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <span className="eyebrow"><span className="eyebrow-dot"></span> Pilihan Menu INABA</span>
          <button className="mobile-menu-close-btn" onClick={closeMobileMenu} aria-label="Tutup menu">
            <X size={16} />
          </button>
        </div>

        <div className="mobile-admin-menu-list">
          <button className="mobile-admin-nav-item" onClick={() => scrollToSection('home')}>
            <div className="mobile-nav-icon-wrap">
              <Home size={15} />
            </div>
            <div className="mobile-nav-content">
              <strong>Beranda Utama</strong>
              <span>Toko busana muslim &amp; kebutuhan harian</span>
            </div>
            <ArrowUpRight size={13} className="menu-arrow-icon" />
          </button>

          <button className="mobile-admin-nav-item" onClick={() => scrollToSection('preorder-section')}>
            <div className="mobile-nav-icon-wrap" style={{ background: '#fcf3eb', color: 'var(--clay)' }}>
              <GraduationCap size={15} />
            </div>
            <div className="mobile-nav-content">
              <strong>Pre-Order Seragam Sekolah</strong>
              <span>SDIT · TPQ · Madrasah Diniyah Sirimbit</span>
            </div>
            <span className="po-pill">PO</span>
          </button>

          <button className="mobile-admin-nav-item" onClick={() => scrollToSection('shop')}>
            <div className="mobile-nav-icon-wrap">
              <Layers size={15} />
            </div>
            <div className="mobile-nav-content">
              <strong>Katalog Lengkap</strong>
              <span>Gamis, koko, hijab &amp; busana pilihan</span>
            </div>
            <ArrowUpRight size={13} className="menu-arrow-icon" />
          </button>

          <button className="mobile-admin-nav-item" onClick={() => scrollToSection('spotlight')}>
            <div className="mobile-nav-icon-wrap">
              <Sparkles size={15} />
            </div>
            <div className="mobile-nav-content">
              <strong>Capel Petani &amp; Meja Lipat</strong>
              <span>Anyaman bambu &amp; meja belajar santri</span>
            </div>
            <ArrowUpRight size={13} className="menu-arrow-icon" />
          </button>

          <button className="mobile-admin-nav-item" onClick={() => scrollToSection('cara-pesan')}>
            <div className="mobile-nav-icon-wrap">
              <ClipboardCheck size={15} />
            </div>
            <div className="mobile-nav-content">
              <strong>Panduan Cara Pesan</strong>
              <span>Alur pembelian mudah &amp; konfirmasi WA</span>
            </div>
            <ArrowUpRight size={13} className="menu-arrow-icon" />
          </button>

          <button className="mobile-admin-nav-item" onClick={() => scrollToSection('cerita')}>
            <div className="mobile-nav-icon-wrap">
              <Info size={15} />
            </div>
            <div className="mobile-nav-content">
              <strong>Tentang INABA Hijab</strong>
              <span>Komitmen kualitas &amp; layanan kami</span>
            </div>
            <ArrowUpRight size={13} className="menu-arrow-icon" />
          </button>
        </div>

        <div className="mobile-menu-footer-actions">
          <button className="btn btn-ghost" onClick={handleAccountClick}>
            <User size={15} />
            {user ? (isAdmin ? 'Dashboard Admin Layar Penuh' : 'Akun Saya & Riwayat Pesanan') : 'Masuk / Daftar Akun'}
          </button>
          <button className="btn btn-clay" onClick={() => scrollToSection('bantuan')}>
            <HelpCircle size={15} /> Hubungi WhatsApp Toko
          </button>
        </div>
      </nav>

      {/* Floating Mobile Bottom Navigation Bar (Phone Screens < 640px) */}
      <nav className="mobile-bottom-bar" aria-label="Navigasi Cepat Bawah">
        <button
          className="mobile-bottom-item"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Beranda"
        >
          <Home size={14} />
          <span>Beranda</span>
        </button>

        <button
          className="mobile-bottom-item"
          onClick={() => scrollToSection('shop')}
          aria-label="Katalog"
        >
          <Layers size={14} />
          <span>Katalog</span>
        </button>

        <button
          className="mobile-bottom-item"
          onClick={() => scrollToSection('preorder-section')}
          aria-label="Seragam PO"
        >
          <GraduationCap size={14} />
          <span>Seragam PO</span>
        </button>

        <button
          className="mobile-bottom-item"
          onClick={() => openModal('cart')}
          aria-label="Keranjang"
        >
          <div className="mobile-bottom-icon-wrap">
            <ShoppingBag size={14} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
          <span>Keranjang</span>
        </button>

        <button
          className="mobile-bottom-item"
          onClick={handleAccountClick}
          aria-label="Akun saya"
        >
          <div className="mobile-bottom-icon-wrap">
            <User size={14} />
          </div>
          <span>Akun</span>
        </button>
      </nav>
    </>
  );
};
