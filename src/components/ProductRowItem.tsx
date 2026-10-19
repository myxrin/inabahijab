import React from 'react';
import { Product } from '../types';
import { formatRupiah } from '../lib/supabase';
import { useStore } from '../context/StoreContext';
import { ArrowUpRight, ShoppingBag } from 'lucide-react';

interface ProductRowItemProps {
  product: Product;
}

export const ProductRowItem: React.FC<ProductRowItemProps> = ({ product }) => {
  const { openProductDetail } = useStore();

  const isPo = Boolean(product.is_preorder);
  const isSold = !isPo && product.stock !== null && product.stock !== undefined && Number(product.stock) <= 0;

  let stockTag = null;
  if (isPo) {
    stockTag = (
      <span className="status-badge status-po">
        PO {product.school_institution ? `· ${product.school_institution}` : ''}
      </span>
    );
  } else if (isSold) {
    stockTag = <span className="status-badge status-cancelled">Habis</span>;
  } else if (product.stock && Number(product.stock) <= 5) {
    stockTag = <span className="status-badge status-pending">Sisa {product.stock} pcs</span>;
  } else {
    stockTag = <span className="status-badge status-ready">Ready Stock</span>;
  }

  return (
    <article
      className="product-row-item"
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
      {/* Thumbnail */}
      <div className="product-row-thumb">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-row-thumb-fallback">
            <span>INABA</span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="product-row-info">
        <div className="product-row-category">{product.category}</div>
        <h3 className="product-row-name">{product.name}</h3>
        <div className="product-row-meta">
          {stockTag}
          {Array.isArray(product.variants) && product.variants.length > 0 && (
            <span className="product-row-variants">
              Varian: {product.variants.join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Price & Action */}
      <div className="product-row-action">
        <div className="product-row-price tabular-nums">
          {formatRupiah(product.price)}
        </div>
        <button
          type="button"
          className="btn btn-sm btn-clay product-row-btn"
          onClick={(e) => {
            e.stopPropagation();
            openProductDetail(product);
          }}
        >
          <ShoppingBag size={14} />
          <span>{isPo ? 'Pesan PO' : 'Pilih & Beli'}</span>
        </button>
      </div>
    </article>
  );
};
