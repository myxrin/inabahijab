import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { cleanPhoneNumber } from '../lib/supabase';

export const PreorderSection: React.FC = () => {
  const { products, poFilter, setPoFilter, openModal, storeSettings, showToast, siteImages } = useStore();
  const preorderBanner = siteImages.find(image => image.key === 'preorder_banner')?.image_url;

  const poProducts = products.filter(
    p => p.is_preorder || p.category?.toLowerCase().includes('pre-order')
  );

  const filteredPo = poProducts.filter(p => {
    if (poFilter === 'Semua') return true;
    const q = poFilter.toLowerCase();
    return (
      (p.school_institution || '').toLowerCase().includes(q) ||
      (p.name || '').toLowerCase().includes(q)
    );
  });

  const waNumber = cleanPhoneNumber(storeSettings.contact_whatsapp);
  const waConsultUrl = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
    'Halo Admin INABA HIJAB, saya ingin konsultasi pemesanan Pre-Order Seragam Sekolah.'
  )}` : '';

  return (
    <section className="preorder-section" id="preorder-section">
      <div className="wrap">
        {/* Banner */}
        <div className="preorder-site-banner" id="preorderBannerWrap">
          {preorderBanner ? (
            <img className="site-banner-image" src={preorderBanner} alt="Banner layanan pre-order seragam sekolah INABA" />
          ) : (
            <div className="placeholder-banner banner-sm editorial-po-banner" id="preorderBannerPlaceholder">
              <div className="brand-monogram">INABA<span>SCHOOLWEAR</span></div>
              <span className="placeholder-title serif">Pre-Order Seragam SDIT, TPQ &amp; Madin Sirimbit</span>
              <span className="placeholder-sub">Unggah banner melalui panel admin agar foto tampil di sini.</span>
            </div>
          )}
        </div>

        {/* Highlight Box */}
        <div className="preorder-highlight-box">
          <span className="po-badge">Layanan Pre-Order Resmi</span>
          <h3>Seragam Sekolah SDIT, TPQ &amp; Madrasah Diniyah Sirimbit</h3>
          <p className="po-summary">Pesan seragam untuk SDIT, TPQ, dan Madrasah Diniyah. Pilih produk, cek ukuran, lalu konfirmasi jadwal kepada admin.</p>

          <div className="button-row">
            <button className="btn btn-clay" onClick={() => openModal('sizeGuide')}>
              Panduan ukuran
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}
              onClick={() => openModal('poCalculator')}
            >
              Hitung pesanan
            </button>
            {waConsultUrl ? (
              <a
                className="btn btn-ghost"
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
                href={waConsultUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Tanya via WhatsApp
              </a>
            ) : (
              <button type="button" className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }} onClick={() => showToast('Kontak WhatsApp toko belum tersedia. Silakan cek kembali nanti.')}>
                WhatsApp belum tersedia
              </button>
            )}
          </div>
        </div>

        {/* Section Head */}
        <div className="section-head">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot"></span> Katalog Khusus Pre-Order</div>
            <h2 className="serif">Pilihan Seragam Sekolah Pre-Order</h2>
            <p className="section-intro">Pilih produk pre-order sesuai kebutuhan sekolah atau keluarga.</p>
          </div>
        </div>

        {/* Institution Filters */}
        <div className="filters" id="preorderFilters" style={{ marginBottom: 24 }}>
          {['Semua', 'SDIT', 'TPQ', 'Madrasah Diniyah'].map((filterName) => (
            <button
              key={filterName}
              type="button"
              className={`filter ${poFilter === filterName ? 'active' : ''}`}
              onClick={() => setPoFilter(filterName)}
            >
              {filterName === 'Semua' ? 'Semua' : filterName}
            </button>
          ))}
        </div>

        {/* Pre-Order Products Grid */}
        <div className="products" aria-live="polite">
          {filteredPo.length > 0 ? (
            filteredPo.map((product) => (
              <ProductCard key={product.id} product={product} isPoContext />
            ))
          ) : (
            <div className="products-empty" style={{ gridColumn: '1 / -1' }}>
              Belum ada produk seragam untuk kategori ini.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
