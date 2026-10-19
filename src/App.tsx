import React, { useEffect, useRef } from 'react';
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
    products, openProductDetail, openModal, user, isAdmin,
    currentView, navigateToView
  } = useStore();

  const productsRef = useRef(products);
  const isAdminRef = useRef(isAdmin);
  const userRef = useRef(user);
  const openProductDetailRef = useRef(openProductDetail);
  const openModalRef = useRef(openModal);
  const navigateToViewRef = useRef(navigateToView);
  productsRef.current = products;
  isAdminRef.current = isAdmin;
  userRef.current = user;
  openProductDetailRef.current = openProductDetail;
  openModalRef.current = openModal;
  navigateToViewRef.current = navigateToView;

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('produk=')) {
        const targetSlug = decodeURIComponent(hash.slice(7));
        const found = productsRef.current.find(product => product.slug === targetSlug || product.id === targetSlug);
        if (found) openProductDetailRef.current(found);
      } else if (hash === 'admin' || new URLSearchParams(window.location.search).get('panel') === 'admin') {
        if (isAdminRef.current) navigateToViewRef.current('admin'); // Admin UI remains gated by the verified server role.
      } else if (hash === 'akun' || hash === 'account') {
        if (userRef.current) navigateToViewRef.current(isAdminRef.current ? 'admin' : 'customer');
        else openModalRef.current('auth');
      } else if (!hash) {
        // The storefront is the safe default when Back clears an in-app route.
        navigateToViewRef.current('store');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [isAdmin, user?.id, products]);

  return (
    <>
      {currentView === 'admin' && isAdmin && <AdminDashboard />}
      {currentView === 'customer' && user && <CustomerDashboard />}
      {(currentView === 'store' || (currentView === 'admin' && !isAdmin) || (currentView === 'customer' && !user)) && (
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
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <PoCalculatorModal />
      <SizeGuideModal />
      <AuthModal />
      <PolicyModal />
      <Toast />
    </>
  );
};

export default App;
