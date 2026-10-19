import React from 'react';
import { useStore } from '../context/StoreContext';

export const SpotlightSection: React.FC = () => {
  const { setActiveFilter, siteImages } = useStore();
  const farmerBanner = siteImages.find(image => image.key === 'farmer_banner')?.image_url;
  const tableBanner = siteImages.find(image => image.key === 'table_banner')?.image_url;

  const handleFilterClick = (categoryName: string) => {
    setActiveFilter(categoryName);
    const shopEl = document.getElementById('shop');
    if (shopEl) shopEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="section" id="spotlight">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot"></span> Perlengkapan Pilihan</div>
            <h2 className="serif">Capel Petani &amp; Meja Lipat</h2>
            <p className="section-intro">Perlengkapan praktis untuk aktivitas sehari-hari.</p>
          </div>
        </div>

        <div className="spotlight-grid">
          <article className="spotlight-card">
            <div className="spotlight-photo" id="farmerPhotoWrap">
              {farmerBanner ? (
                <img className="site-banner-image" src={farmerBanner} alt="Perlengkapan petani INABA" />
              ) : (
                <div className="placeholder-banner banner-sm editorial-craft-banner">
                  <div className="brand-monogram">INABA<span>CRAFT</span></div>
                  <span className="placeholder-title serif">Topi Capel Petani Anyaman Bambu</span>
                  <span className="placeholder-sub">Unggah foto banner melalui panel admin untuk menampilkan foto toko.</span>
                </div>
              )}
            </div>
            <div className="spotlight-copy">
              <div className="eyebrow">Perlengkapan Petani &amp; Kebun</div>
              <h3 className="serif">Topi Capel Petani Anyaman Bambu</h3>
              <p>Topi capel anyaman untuk membantu memberi keteduhan saat bekerja di kebun atau sawah.</p>
              <div className="button-row">
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleFilterClick('Perlengkapan Petani')}
                >
                  Lihat produk capel
                </button>
              </div>
            </div>
          </article>

          <article className="spotlight-card">
            <div className="spotlight-photo" id="tablePhotoWrap">
              {tableBanner ? (
                <img className="site-banner-image" src={tableBanner} alt="Meja lipat serbaguna INABA" />
              ) : (
                <div className="placeholder-banner banner-sm editorial-living-banner">
                  <div className="brand-monogram">INABA<span>LIVING</span></div>
                  <span className="placeholder-title serif">Meja Lipat Portable Serbaguna</span>
                  <span className="placeholder-sub">Unggah foto banner melalui panel admin untuk menampilkan foto toko.</span>
                </div>
              )}
            </div>
            <div className="spotlight-copy">
              <div className="eyebrow">Perabot &amp; Kebutuhan Belajar</div>
              <h3 className="serif">Meja Lipat Portable Serbaguna</h3>
              <p>Meja lipat hemat tempat untuk belajar, mengaji, bekerja, dan aktivitas rumah.</p>
              <div className="button-row">
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleFilterClick('Meja & Perabot')}
                >
                  Lihat meja lipat
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};
