import React, { useEffect } from 'react';
import { useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustStrip } from './components/TrustStrip';
import { PreorderSection } from './components/PreorderSection';
import { CatalogSection } from './components/CatalogSection';
import { SpotlightSection } from './components/SpotlightSection';
import { OrderFlowSection } from './components/OrderFlowSection';
import { AboutSection } from './components/AboutSection';
import { NewsletterSection } from './components/NewsletterSection';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

import { AdminDashboard } from './components/admin/AdminDashboard';
import { CustomerDashboard } from './components/account/CustomerDashboard';

import { ProductDetailModal } from './components/modals/ProductDetailModal';
import { CartDrawer } from './components/modals/CartDrawer';
import { CheckoutModal } from './components/modals/CheckoutModal';
import { OrderSuccessModal } from './components/modals/OrderSuccessModal';
import { PoCalculatorModal } from './components/modals/PoCalculatorModal';
import { SizeGuideModal } from './components/modals/SizeGuideModal';
import { AuthModal } from './components/modals/AuthModal';
import { PolicyModal } from './components/modals/PolicyModal';

export const App: React.FC = () => {
  const {
    products,
    openProductDetail,
    openModal,
    user,
    isAdmin,
    currentView,
    navigateToView
  } = useStore();

  // Listen for hash changes (e.g. #produk=... or #admin or #akun)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('produk=')) {
        const targetSlug = decodeURIComponent(hash.slice(7));
        const found = products.find(p => p.slug === targetSlug || p.id === targetSlug);
        if (found) {
          openProductDetail(found);
        }
      } else if (hash === 'admin' || new URLSearchParams(window.location.search).get('panel') === 'admin') {
        if (user && isAdmin) {
          navigateToView('admin');
        } else if (user) {
          navigateToView('customer');
        } else {
          openModal('auth');
        }
      } else if (hash === 'akun' || hash === 'account') {
        if (user) {
          navigateToView(isAdmin ? 'admin' : 'customer');
        } else {
          openModal('auth');
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [products, openProductDetail, openModal, user, isAdmin, navigateToView]);

  return (
    <>
      {/* FULL-PAGE CONDITIONAL VIEW */}
      {currentView === 'admin' && <AdminDashboard />}
      {currentView === 'customer' && <CustomerDashboard />}

      {currentView === 'store' && (
        <>
          <Header />
          <main id="main">
            <Hero />
            <TrustStrip />
            <PreorderSection />
            <CatalogSection />
            <SpotlightSection />
            <OrderFlowSection />
            <AboutSection />
            <NewsletterSection />
          </main>
          <Footer />
        </>
      )}

      {/* Global Modals & Drawers */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <PoCalculatorModal />
      <SizeGuideModal />
      <AuthModal />
      <PolicyModal />

      {/* Global Notifications */}
      <Toast />
    </>
  );
};

export default App;
