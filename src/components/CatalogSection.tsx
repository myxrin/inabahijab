import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { Package } from 'lucide-react';

export const CatalogSection: React.FC = () => {
  const {
    products, categories, activeFilter, setActiveFilter, searchText, setSearchText,
    sortOption, setSortOption, refreshProducts, showToast
  } = useStore();

  let list = [...products];
  if (activeFilter !== 'Semua') list = list.filter(product => product.category === activeFilter);

  const query = searchText.trim().toLowerCase();
  if (query) {
    list = list.filter(product =>
      [product.name, product.category, product.description, product.badge, product.school_institution]
        .some(value => String(value || '').toLowerCase().includes(query))
    );
  }

  if (sortOption === 'price-asc') list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
  else if (sortOption === 'price-desc') list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
  else if (sortOption === 'name-asc') list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id'));
  else if (sortOption === 'ready-first') list.sort((a, b) => Number(Boolean(a.is_preorder)) - Number(Boolean(b.is_preorder)));
  else if (sortOption === 'po-first') list.sort((a, b) => Number(Boolean(b.is_preorder)) - Number(Boolean(a.is_preorder)));
  else list.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

  const clearFilters = () => {
    setActiveFilter('Semua');
    setSearchText('');
  };

  return (
    <section className="section catalog-section" id="shop">
      <div className="wrap">
        <div className="section-head catalog-section-head">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot" />Katalog</div>
            <h2 className="serif">Temukan produk yang dibutuhkan</h2>
            <p className="section-intro">Busana muslim, seragam sekolah, capel petani, dan meja lipat.</p>
          </div>
          {(activeFilter !== 'Semua' || searchText) && (
            <button type="button" className="text-link" onClick={clearFilters}>Reset filter</button>
          )}
        </div>

        <div className="filters-wrap">
          <div className="filters" role="group" aria-label="Filter kategori produk">
            <button type="button" className={`filter ${activeFilter === 'Semua' ? 'active' : ''}`} onClick={() => setActiveFilter('Semua')}>
              Semua
            </button>
            {categories.map(category => (
              <button
                key={category.slug}
                type="button"
                className={`filter ${activeFilter === category.name ? 'active' : ''}`}
                onClick={() => setActiveFilter(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="catalog-tools" aria-label="Cari dan urutkan produk">
          <label className="catalog-search-wrap" htmlFor="productSearchInput">
            <span className="sr-only">Cari produk</span>
            <input
              id="productSearchInput"
              type="search"
              value={searchText}
              onChange={event => setSearchText(event.target.value)}
              placeholder="Cari produk…"
              autoComplete="off"
            />
          </label>
          <label className="catalog-sort-wrap">
            <span className="sr-only">Urutkan produk</span>
            <select value={sortOption} onChange={event => setSortOption(event.target.value)} aria-label="Urutkan produk">
              <option value="featured">Pilihan toko</option>
              <option value="price-asc">Harga terendah</option>
              <option value="price-desc">Harga tertinggi</option>
              <option value="name-asc">Nama A–Z</option>
              <option value="ready-first">Ready stock</option>
              <option value="po-first">Pre-order</option>
            </select>
          </label>
        </div>

        {list.length > 0 ? (
          <div className="products" aria-live="polite">
            {list.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="products-empty catalog-empty-state" aria-live="polite">
            <Package size={25} aria-hidden="true" />
            <h3>{products.length === 0 ? 'Produk sedang disiapkan' : 'Produk tidak ditemukan'}</h3>
            <p>{products.length === 0
              ? 'Produk yang dipublikasikan admin akan muncul di sini.'
              : 'Coba kata kunci atau kategori lain.'}</p>
            {products.length === 0 ? (
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => { void refreshProducts().catch(() => showToast('Katalog belum dapat dimuat. Periksa koneksi Supabase.')); }}>
                Muat ulang
              </button>
            ) : (
              <button type="button" className="btn btn-sm btn-ghost" onClick={clearFilters}>Reset pencarian</button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
