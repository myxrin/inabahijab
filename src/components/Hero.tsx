import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Sparkles, GraduationCap, Sun, Table as TableIcon } from 'lucide-react';

export const Hero: React.FC = () => {
  const { setActiveFilter, selectedDivision, setSelectedDivision } = useStore();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDivisionClick = (div: 'all' | 'modest' | 'schoolwear' | 'living') => {
    setSelectedDivision(div);
    if (div === 'all') {
      setActiveFilter('Semua');
    } else if (div === 'modest') {
      setActiveFilter('Hijab & Pakaian');
    } else if (div === 'schoolwear') {
      scrollTo('preorder-section');
      return;
    } else if (div === 'living') {
      setActiveFilter('Perlengkapan Petani');
    }
    scrollTo('shop');
  };

  const handleCategoryShortcut = (catName: string) => {
    setActiveFilter(catName);
    if (catName.includes('Pre-Order') || catName.includes('Seragam')) {
      scrollTo('preorder-section');
    } else {
      scrollTo('shop');
    }
  };

  return (
    <section className="hero" id="home">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot"></span> Busana Muslim &amp; Kebutuhan Pilihan
          </div>
          <h1 className="serif">
            Kebutuhan Berbusana,<br />Seragam &amp; <em>Perlengkapan Harian.</em>
          </h1>
          <p className="hero-desc">
            Dari gamis dan busana muslim ready stock, pre-order seragam sekolah (SDIT, TPQ, Madrasah Diniyah Sirimbit), hingga topi capel petani tradisional dan meja lipat serbaguna. Semua terkurasi dengan mutu terbaik.
          </p>

          <div className="button-row">
            <button className="btn btn-clay" onClick={() => scrollTo('preorder-section')}>
              Pesan Pre-Order Seragam <ArrowRight size={16} />
            </button>
            <button className="btn btn-ghost" onClick={() => scrollTo('shop')}>
              Lihat Semua Produk
            </button>
          </div>

          {/* 3 Lini Spesialis Toko */}
          <div className="brand-divisions-box">
            <span className="eyebrow" style={{ fontSize: 11 }}>
              <span className="eyebrow-dot"></span> 3 Lini Spesialis Toko:
            </span>
            <div className="brand-switcher-wrap" role="tablist" aria-label="Lini Produk INABA">
              <button
                type="button"
                className={`brand-pill-btn ${selectedDivision === 'all' ? 'active' : ''}`}
                onClick={() => handleDivisionClick('all')}
              >
                <Sparkles size={14} className="pill-icon" /> Semua Lini
              </button>
              <button
                type="button"
                className={`brand-pill-btn ${selectedDivision === 'modest' ? 'active' : ''}`}
                onClick={() => handleDivisionClick('modest')}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pill-icon"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>
                INABA Modest
              </button>
              <button
                type="button"
                className={`brand-pill-btn ${selectedDivision === 'schoolwear' ? 'active' : ''}`}
                onClick={() => handleDivisionClick('schoolwear')}
              >
                <GraduationCap size={14} className="pill-icon" /> INABA Schoolwear
              </button>
              <button
                type="button"
                className={`brand-pill-btn ${selectedDivision === 'living' ? 'active' : ''}`}
                onClick={() => handleDivisionClick('living')}
              >
                <Sun size={14} className="pill-icon" /> INABA Living &amp; Craft
              </button>
            </div>
          </div>

          {/* Category Shortcut Cards */}
          <div className="category-pills-row">
            <button
              type="button"
              className="cat-card-shortcut"
              onClick={() => handleCategoryShortcut('Hijab & Pakaian')}
            >
              <div className="cat-icon-bubble">
                <Sparkles size={14.5} />
              </div>
              <div>
                <strong>Busana Muslim</strong>
                <span>Gamis, koko, hijab</span>
              </div>
            </button>

            <button
              type="button"
              className="cat-card-shortcut"
              onClick={() => handleCategoryShortcut('Seragam Sekolah — Pre-Order')}
            >
              <div className="cat-icon-bubble">
                <GraduationCap size={14.5} />
              </div>
              <div>
                <strong>Pre-Order Seragam</strong>
                <span>SDIT, TPQ, Madin</span>
              </div>
            </button>

            <button
              type="button"
              className="cat-card-shortcut"
              onClick={() => handleCategoryShortcut('Perlengkapan Petani')}
            >
              <div className="cat-icon-bubble">
                <Sun size={14.5} />
              </div>
              <div>
                <strong>Capel Petani</strong>
                <span>Anti-panas &amp; gerimis</span>
              </div>
            </button>

            <button
              type="button"
              className="cat-card-shortcut"
              onClick={() => handleCategoryShortcut('Meja & Perabot')}
            >
              <div className="cat-icon-bubble">
                <TableIcon size={14.5} />
              </div>
              <div>
                <strong>Meja Lipat</strong>
                <span>Portable &amp; serbaguna</span>
              </div>
            </button>
          </div>
        </div>

        {/* Hero Visual Banner */}
        <div className="hero-visual" id="heroVisualWrap">
          <div className="placeholder-banner editorial-hero-banner" id="heroPlaceholder">
            <div className="brand-monogram">INABA<span>HIJAB</span></div>
            <span className="placeholder-title serif">Koleksi Busana Pilihan &amp; Seragam Sekolah</span>
            <span className="placeholder-sub">Mutu terjamin · Jahitan presisi · Amanah melayani</span>
          </div>
          <div className="hero-overlay">
            <span className="hero-pill-tag">INABA HIJAB</span>
            <div className="hero-overlay-bottom">
              <h3>Mutu Terjamin</h3>
              <p>Busana pilihan, seragam presisi jahitan rapi, dan perlengkapan harian bermutu tinggi.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
