import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ArrowUpRight, Sparkles, GraduationCap, Sun, Table as TableIcon, Package, Shirt } from 'lucide-react';

export const CatalogSection: React.FC = () => {
  const {
    products,
    categories,
    activeFilter,
    setActiveFilter,
    searchText,
    setSearchText,
    sortOption,
    setSortOption
  } = useStore();

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'sparkles':
        return <Sparkles size={16} />;
      case 'graduation-cap':
        return <GraduationCap size={16} />;
      case 'sun':
        return <Sun size={16} />;
      case 'table':
        return <TableIcon size={16} />;
      case 'shirt':
        return <Shirt size={16} />;
      default:
        return <Package size={16} />;
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

        {/* Search & Sort Bar */}
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
        </div>

        {/* Products Grid */}
        <div className="products" aria-live="polite">
          {list.length > 0 ? (
            list.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="products-empty" style={{ gridColumn: '1 / -1' }}>
              <p>Tidak ditemukan produk yang sesuai dengan filter atau kata kunci ini.</p>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                style={{ marginTop: 10 }}
                onClick={() => {
                  setActiveFilter('Semua');
                  setSearchText('');
                }}
              >
                Reset Pencarian &amp; Filter
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
