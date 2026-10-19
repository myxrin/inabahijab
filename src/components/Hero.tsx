import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight } from 'lucide-react';

export const Hero: React.FC = () => {
  const { siteImages } = useStore();
  const heroImage = siteImages.find(image => image.key === 'hero')?.image_url;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="hero" id="home">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" />Kebutuhan keluarga, satu toko</div>
          <h1 className="serif">Pilihan busana dan kebutuhan harian <em>untuk semua.</em></h1>
          <p className="hero-desc">
            Busana muslim, seragam sekolah pre-order, capel petani, dan meja lipat. Pilih produk, lihat detail, lalu pesan dengan mudah.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn-clay" onClick={() => scrollTo('shop')}>
              Lihat Katalog <ArrowRight size={16} aria-hidden="true" />
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => scrollTo('preorder-section')}>
              Pesan Seragam
            </button>
          </div>
        </div>

        <div className="hero-visual" id="heroVisualWrap">
          {heroImage ? (
            <img className="site-banner-image" src={heroImage} alt="Koleksi pilihan INABA HIJAB" fetchPriority="high" />
          ) : (
            <div className="placeholder-banner editorial-hero-banner" id="heroPlaceholder">
              <div className="brand-monogram">INABA<span>HIJAB</span></div>
              <span className="placeholder-title serif">Koleksi pilihan untuk keluarga</span>
              <span className="placeholder-sub">Foto utama toko dapat ditambahkan melalui dashboard admin.</span>
            </div>
          )}
          <div className="hero-overlay">
            <span className="hero-pill-tag">INABA HIJAB</span>
            <div className="hero-overlay-bottom">
              <h3>Belanja lebih mudah</h3>
              <p>Informasi produk jelas, pilihan tertata, dan pemesanan praktis.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
