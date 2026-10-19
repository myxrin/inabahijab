import React from 'react';
import { useStore } from '../context/StoreContext';
import { Home, LayoutGrid, ShoppingBag, UserRound } from 'lucide-react';

export const Header: React.FC = () => {
  const { cartCount, openModal, user, isAdmin, navigateToView } = useStore();

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAccountClick = () => {
    if (user) navigateToView(isAdmin ? 'admin' : 'customer');
    else openModal('auth');
  };

  const handleHomeClick = () => {
    if (window.location.hash) window.history.replaceState(null, '', window.location.pathname + window.location.search);
    scrollToSection('home');
  };

  const handleCatalogClick = () => scrollToSection('shop');
  const handleCartClick = () => openModal('cart');

  return (
    <>
      <header className="header">
        <div className="wrap header-inner">
          <button type="button" className="brand" onClick={handleHomeClick} aria-label="INABA HIJAB — Beranda">
            <span className="brand-title">INABA<span>HIJAB</span></span>
            <span className="brand-desc">Busana muslim, seragam, dan kebutuhan harian</span>
          </button>

          <nav className="header-primary-nav" aria-label="Navigasi utama">
            <button type="button" className="header-primary-link" onClick={handleHomeClick}>
              <Home size={17} aria-hidden="true" /> <span>Beranda</span>
            </button>
            <button type="button" className="header-primary-link" onClick={handleCatalogClick}>
              <LayoutGrid size={17} aria-hidden="true" /> <span>Katalog</span>
            </button>
            <button type="button" className="header-primary-link header-cart-link" onClick={handleCartClick}>
              <ShoppingBag size={17} aria-hidden="true" /> <span>Keranjang</span>
              {cartCount > 0 && <span className="header-cart-count">{cartCount > 99 ? '99+' : cartCount}</span>}
            </button>
            <button type="button" className="header-primary-link" onClick={handleAccountClick}>
              <UserRound size={17} aria-hidden="true" /> <span>{user && isAdmin ? 'Dashboard Admin' : 'Akun'}</span>
            </button>
          </nav>
        </div>
      </header>

      <nav className="mobile-bottom-bar" aria-label="Navigasi utama">
        <button type="button" className="mobile-bottom-item" onClick={handleHomeClick} aria-label="Beranda">
          <Home size={19} aria-hidden="true" />
          <span>Beranda</span>
        </button>
        <button type="button" className="mobile-bottom-item" onClick={handleCatalogClick} aria-label="Katalog">
          <LayoutGrid size={19} aria-hidden="true" />
          <span>Katalog</span>
        </button>
        <button type="button" className="mobile-bottom-item mobile-cart-item" onClick={handleCartClick} aria-label={`Keranjang${cartCount ? `, ${cartCount} barang` : ''}`}>
          <span className="mobile-bottom-icon-wrap">
            <ShoppingBag size={19} aria-hidden="true" />
            {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
          </span>
          <span>Keranjang</span>
        </button>
        <button type="button" className="mobile-bottom-item" onClick={handleAccountClick} aria-label={user && isAdmin ? 'Dashboard Admin' : 'Akun'}>
          <UserRound size={19} aria-hidden="true" />
          <span>{user && isAdmin ? 'Admin' : 'Akun'}</span>
        </button>
      </nav>
    </>
  );
};

export default Header;
