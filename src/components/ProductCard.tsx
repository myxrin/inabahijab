import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { formatRupiah } from '../lib/supabase';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  isPoContext?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openProductDetail } = useStore();
  const [imageFailed, setImageFailed] = useState(false);
  const isPo = Boolean(product.is_preorder);
  const isSold = !isPo && product.stock !== null && product.stock !== undefined && Number(product.stock) <= 0;

  useEffect(() => setImageFailed(false), [product.id, product.image_url]);

  const badgeClass = isSold ? 'badge-sold' : (isPo ? 'badge-preorder' : 'badge-ready');
  const badgeText = isSold ? 'Stok habis' : (product.badge || (isPo ? 'Pre-order' : 'Ready stock'));
  const specSnippet = isPo && product.school_institution
    ? product.school_institution
    : (product.specifications?.['Bahan'] || product.specifications?.['Bahan Atasan'] || product.description || '');

  const openDetail = () => openProductDetail(product);

  return (
    <article
      className={`product-card ${isSold ? 'sold' : ''}`}
      onClick={openDetail}
      role="button"
      tabIndex={0}
      aria-label={`Lihat detail ${product.name}`}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDetail();
        }
      }}
    >
      <div className="product-image">
        {product.image_url && !imageFailed ? (
          <img src={product.image_url} alt={product.name} loading="lazy" onError={() => setImageFailed(true)} />
        ) : (
          <div className="boutique-brand-mark" aria-label="Foto produk belum tersedia">
            <span className="mark-sub">INABA</span>
            <span className="mark-main">HIJAB</span>
          </div>
        )}
        <div className="product-badges-container">
          <span className={`product-badge-pill ${badgeClass}`}>{badgeText}</span>
          {isPo && product.school_institution && <span className="product-badge-pill badge-custom">{product.school_institution}</span>}
        </div>
      </div>

      <div className="product-card-body">
        <div>
          <div className="product-category-text">{product.category}</div>
          <h3 className="product-name-title">{product.name}</h3>
          {specSnippet && <div className="product-specs-snippet">{String(specSnippet).slice(0, 64)}</div>}
        </div>
        <div className="product-price-row">
          <span className="product-price">{formatRupiah(product.price)}</span>
          <span className={`product-stock-tag ${isPo ? 'po' : (isSold ? '' : 'ready')}`}>
            {isPo ? (product.preorder_status === 'closed' ? 'PO ditutup' : 'Pre-order') : (isSold ? 'Habis' : (Number(product.stock) > 0 && Number(product.stock) <= 5 ? `Sisa ${product.stock}` : 'Ready'))}
          </span>
        </div>
      </div>
    </article>
  );
};
