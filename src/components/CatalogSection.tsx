import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ProductRowItem } from './ProductRowItem';
import { ArrowUpRight, Sparkles, GraduationCap, Sun, Table as TableIcon, Package, Shirt, LayoutGrid, List } from 'lucide-react';

export const CatalogSection: React.FC = () => {
  const {
    products,
    categories,
    activeFilter,
    setActiveFilter,
    searchText,
    setSearchText,
    sortOption,
    setSortOption,
    refreshProducts,
    showToast
  } = useStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      const saved = localStorage.getItem('inaba_catalog_view_mode');
      return (saved === 'list' || saved === 'grid') ? saved : 'grid';
    } catch {
      return 'grid';
    }
  });

  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('inaba_catalog_view_mode', mode);
    } catch (e) {
      console.warn('Could not save view mode preference', e);
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'sparkles':
        return <Sparkles size={12} className="cat-filter-icon" />;
      case 'graduation-cap':
        return <GraduationCap size={12} className="cat-filter-icon" />;
      case 'sun':
        return <Sun size={12} className="cat-filter-icon" />;
      case 'table':
        return <TableIcon size={12} className="cat-filter-icon" />;
      case 'shirt':
        return <Shirt size={12} className="cat-filter-icon" />;
      default:
        return <Package size={12} className="cat-filter-icon" />;
    }
  };

  // Filter products
  let list = [...products];

  if (activeFilter !== 'Semua') {
    list = list.filter(p => p.category === activeFilter);
  }

  const query = searchText.trim().toLowerCase();
  if (query) {
    list = list.filter(p =>
      [p.name, p.category, p.description, p.badge, p.school_institution].some(
        val => String(val || '').toLowerCase().includes(query)
      )
    );
  }

  // Sort products
  if (sortOption === 'price-asc') {
    list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
  } else if (sortOption === 'price-desc') {
    list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
  } else if (sortOption === 'name-asc') {
    list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id'));
  } else if (sortOption === 'ready-first') {
    list.sort((a, b) => Number(b.is_preorder ? 0 : 1) - Number(a.is_preorder ? 0 : 1));
  } else if (sortOption === 'po-first') {
    list.sort((a, b) => Number(b.is_preorder ? 1 : 0) - Number(a.is_preorder ? 1 : 0));
  } else {
    // featured
    list.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }

  const currentCategoryDesc = categories.find(c => c.name === activeFilter)?.description;

  return (
    <section className="section" id="shop">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot"></span> Katalog Produk</div>
            <h2 className="serif">Jelajahi Semua Produk Pilihan</h2>
            <p className="section-intro">
              Pilih kategori yang kamu butuhkan: pakaian ready stock, perlengkapan petani di kebun &amp; sawah, meja lipat serbaguna, hingga seragam sekolah.
            </p>
          </div>
          <button
            className="text-link"
            onClick={() => {
              setActiveFilter('Semua');
              setSearchText('');
            }}
          >
            Tampilkan Semua Produk <ArrowUpRight size={14} className="btn-arrow-icon" />
          </button>
        </div>

        {/* Dynamic Category Tabs */}
        <div className="filters-wrap">
          <div className="filters" role="tablist">
            <button
              type="button"
              className={`filter ${activeFilter === 'Semua' ? 'active' : ''}`}
              onClick={() => setActiveFilter('Semua')}
            >
              Semua Produk
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                className={`filter ${activeFilter === c.name ? 'active' : ''}`}
                onClick={() => setActiveFilter(c.name)}
              >
                {getCategoryIcon(c.icon)} {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Category Description Banner */}
        <div className="category-intro-banner">
          <span>
            {activeFilter === 'Semua'
              ? 'Menampilkan seluruh produk: pakaian ready stock, seragam sekolah pre-order, capel petani, dan meja lipat.'
              : `${activeFilter}: ${currentCategoryDesc || 'Produk terkurasi di katalog INABA Hijab.'}`}
          </span>
        </div>

        {/* Search, Sort & View Switcher Bar */}
        <div className="catalog-tools" aria-label="Cari dan urutkan produk">
          <input
            id="productSearchInput"
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Cari gamis, seragam sekolah, capel petani, meja lipat…"
            aria-label="Cari produk"
            autoComplete="off"
          />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            aria-label="Urutkan produk"
          >
            <option value="featured">Unggulan</option>
            <option value="price-asc">Harga Terendah</option>
            <option value="price-desc">Harga Tertinggi</option>
            <option value="name-asc">Nama A–Z</option>
            <option value="ready-first">Ready Stock Dulu</option>
            <option value="po-first">Pre-Order Dulu</option>
          </select>

          {/* Grid vs List View Mode Toggle */}
          <div className="catalog-view-switcher" role="radiogroup" aria-label="Pilihan tampilan grid atau list">
            <button
              type="button"
              className={`view-switch-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => handleViewChange('grid')}
              aria-label="Tampilan Grid"
              title="Tampilan Grid"
            >
              <LayoutGrid size={16} />
              <span className="view-switch-label">Grid</span>
            </button>
            <button
              type="button"
              className={`view-switch-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => handleViewChange('list')}
              aria-label="Tampilan List"
              title="Tampilan List"
            >
              <List size={16} />
              <span className="view-switch-label">List</span>
            </button>
          </div>
        </div>

        {/* Products Display (Grid or List) */}
        {viewMode === 'grid' ? (
          <div className="products" aria-live="polite">
            {list.length > 0 ? (
              list.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="products-empty catalog-empty-state" style={{ gridColumn: '1 / -1' }}>
                <Package size={26} aria-hidden="true" />
                <h3>{products.length === 0 ? 'Katalog sedang disiapkan' : 'Produk tidak ditemukan'}</h3>
                <p>{products.length === 0
                  ? 'Produk yang sudah dipublikasikan admin akan tampil di sini. Data katalog dimuat langsung dari Supabase.'
                  : 'Coba kata kunci atau kategori lain untuk menemukan produk yang sesuai.'}</p>
                {products.length === 0 ? (
                  <button type="button" className="btn btn-sm btn-ghost" style={{ marginTop: 10 }} onClick={() => { void refreshProducts().catch(() => showToast('Katalog belum dapat dimuat. Periksa koneksi Supabase.')); }}>
                    Muat Ulang Katalog
                  </button>
                ) : (
                  <button type="button" className="btn btn-sm btn-ghost" style={{ marginTop: 10 }} onClick={() => { setActiveFilter('Semua'); setSearchText(''); }}>
                    Reset Pencarian &amp; Filter
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="product-row-list" aria-live="polite">
            {list.length > 0 ? (
              list.map((product) => (
                <ProductRowItem key={product.id} product={product} />
              ))
            ) : (
              <div className="products-empty catalog-empty-state">
                <Package size={26} aria-hidden="true" />
                <h3>{products.length === 0 ? 'Katalog sedang disiapkan' : 'Produk tidak ditemukan'}</h3>
                <p>{products.length === 0
                  ? 'Produk yang sudah dipublikasikan admin akan tampil di sini. Data katalog dimuat langsung dari Supabase.'
                  : 'Coba kata kunci atau kategori lain untuk menemukan produk yang sesuai.'}</p>
                {products.length === 0 ? (
                  <button type="button" className="btn btn-sm btn-ghost" style={{ marginTop: 10 }} onClick={() => { void refreshProducts().catch(() => showToast('Katalog belum dapat dimuat. Periksa koneksi Supabase.')); }}>
                    Muat Ulang Katalog
                  </button>
                ) : (
                  <button type="button" className="btn btn-sm btn-ghost" style={{ marginTop: 10 }} onClick={() => { setActiveFilter('Semua'); setSearchText(''); }}>
                    Reset Pencarian &amp; Filter
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
