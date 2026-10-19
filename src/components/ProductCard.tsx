import React from 'react';
import { Product } from '../types';
import { formatRupiah } from '../lib/supabase';
import { useStore } from '../context/StoreContext';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isPoContext?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isPoContext = false }) => {
  const { openProductDetail } = useStore();

  const isPo = Boolean(product.is_preorder);
  const isSold = !isPo && product.stock !== null && product.stock !== undefined && Number(product.stock) <= 0;

  let stockDisplay = null;
  if (isPo) {
    stockDisplay = product.preorder_status === 'closed' ? (
      <span className="product-stock-tag po">PO Ditutup</span>
    ) : (
      <span className="product-stock-tag po">Pre-Order Buka</span>
    );
  } else {
    if (isSold) {
      stockDisplay = <span className="product-stock-tag">Stok Habis</span>;
    } else if (product.stock && Number(product.stock) <= 5) {
      stockDisplay = <span className="product-stock-tag ready">Sisa {product.stock} pcs</span>;
    } else {
      stockDisplay = <span className="product-stock-tag ready">Ready Stock</span>;
    }
  }

  const badgeClass = isSold ? 'badge-sold' : (isPo ? 'badge-preorder' : 'badge-ready');
  const badgeText = isSold ? 'Habis' : (product.badge || (isPo ? 'Pre-Order' : 'Ready Stock'));

  let specSnippet = '';
  if (isPo && product.school_institution) {
    specSnippet = `Lembaga: ${product.school_institution}`;
  } else if (product.specifications?.['Bahan'] || product.specifications?.['Bahan Atasan']) {
    specSnippet = `Bahan: ${product.specifications['Bahan'] || product.specifications['Bahan Atasan']}`;
  } else if (product.description) {
    specSnippet = product.description.slice(0, 48);
  }

  return (
    <article
      className={`product-card ${isSold ? 'sold' : ''}`}
      onClick={() => openProductDetail(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openProductDetail(product);
        }
      }}
    >
      <div className="product-image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" />
        ) : (
          <div className="boutique-brand-mark">
            <span className="mark-sub">INABA</span>
            <span className="mark-main">HIJAB</span>
          </div>
        )}

        <div className="product-badges-container">
          <span className={`product-badge-pill ${badgeClass}`}>{badgeText}</span>
          {isPo && product.school_institution && (
            <span className="product-badge-pill badge-custom">{product.school_institution}</span>
          )}
        </div>

        <button
          type="button"
          className="quick-detail-btn"
          onClick={(e) => {
            e.stopPropagation();
            openProductDetail(product);
          }}
          aria-label={`Lihat detail ${product.name}`}
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div className="product-card-body">
        <div>
          <div className="product-category-text">{product.category}</div>
          <h3 className="product-name-title">{product.name}</h3>
          {specSnippet && <div className="product-specs-snippet">{specSnippet}</div>}
        </div>

        <div className="product-price-row">
          <span className="product-price">{formatRupiah(product.price)}</span>
          {stockDisplay}
        </div>
      </div>
    </article>
  );
};
