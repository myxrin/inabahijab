import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { Check, ArrowUpRight, Calculator, MessageSquare } from 'lucide-react';
import { cleanPhoneNumber } from '../lib/supabase';

export const PreorderSection: React.FC = () => {
  const { products, poFilter, setPoFilter, openModal, storeSettings } = useStore();

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

  const waNumber = cleanPhoneNumber(storeSettings.contact_whatsapp || '6285735144904');
  const waConsultUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    'Halo Admin INABA HIJAB, saya ingin konsultasi pemesanan Pre-Order Seragam Sekolah.'
  )}`;

  return (
    <section className="preorder-section" id="preorder-section">
      <div className="wrap">
        {/* Banner */}
        <div className="preorder-site-banner" id="preorderBannerWrap">
          <div className="placeholder-banner banner-sm editorial-po-banner" id="preorderBannerPlaceholder">
            <div className="brand-monogram">INABA<span>SCHOOLWEAR</span></div>
            <span className="placeholder-title serif">Pre-Order Seragam SDIT, TPQ &amp; Madin Sirimbit</span>
            <span className="placeholder-sub">Bahan adem, jahitan kuat, dan panduan ukuran terstandar</span>
          </div>
        </div>

        {/* Highlight Box */}
        <div className="preorder-highlight-box">
          <span className="po-badge">Layanan Pre-Order Resmi</span>
          <h3>Seragam Sekolah SDIT, TPQ &amp; Madrasah Diniyah Sirimbit</h3>
          <p>
            Menerima pesanan pre-order seragam satuan maupun rombongan untuk lembaga sekolah Islam, santri mengaji, serta setelan sirimbit keluarga santri dan wali. Dikerjakan dengan bahan adem, jahitan kuat berstandar mutu terjaga, dan ukuran akurat.
          </p>

          <div className="po-perks">
            <div className="po-perk-item">
              <span className="po-perk-icon">
                <Check size={13} strokeWidth={3} />
              </span>
              <span>
                <strong>Bahan Nyaman:</strong> Oxford Super, Katun Toyobo Fodu, Katun Madinah yang adem dan tidak mudah kusut.
              </span>
            </div>
            <div className="po-perk-item">
              <span className="po-perk-icon">
                <Check size={13} strokeWidth={3} />
              </span>
              <span>
                <strong>Pilihan Lembaga:</strong> Desain khusus untuk SDIT, TPQ/TPA, dan Madrasah Diniyah Sirimbit Keluarga.
              </span>
            </div>
            <div className="po-perk-item">
              <span className="po-perk-icon">
                <Check size={13} strokeWidth={3} />
              </span>
              <span>
                <strong>Panduan Ukuran Terstandar:</strong> Mulai ukuran anak usia dini hingga dewasa sirimbit orang tua.
              </span>
            </div>
          </div>

          <div className="button-row">
            <button className="btn btn-clay" onClick={() => openModal('sizeGuide')}>
              Lihat Panduan Tabel Ukuran <ArrowUpRight size={14} className="btn-arrow-icon" />
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}
              onClick={() => openModal('poCalculator')}
            >
              <Calculator size={15} className="btn-icon" /> Kalkulator Rombongan Sekolah <ArrowUpRight size={14} className="btn-arrow-icon" />
            </button>
            <a
              className="btn btn-ghost"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
              href={waConsultUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageSquare size={15} /> Konsultasi Admin (WA)
            </a>
          </div>
        </div>

        {/* Section Head */}
        <div className="section-head">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot"></span> Katalog Khusus Pre-Order</div>
            <h2 className="serif">Pilihan Seragam Sekolah Pre-Order</h2>
            <p className="section-intro">
              Pilih jenis seragam sesuai lembaga, tentukan ukuran santri/anak, dan kirimkan pesanan dengan jadwal pengerjaan yang transparan.
            </p>
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
              {filterName === 'Semua' ? 'Semua Seragam PO' : (filterName === 'TPQ' ? 'Santri TPQ / TPA' : filterName)}
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
              Belum ada seragam sekolah pre-order pada filter ini. Hubungi admin untuk pendaftaran rombongan sekolah.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
