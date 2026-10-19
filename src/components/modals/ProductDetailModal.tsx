import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatRupiah, cleanPhoneNumber } from '../../lib/supabase';
import { X, Minus, Plus, MessageCircle, ArrowUpRight, Share2, Heart, Package } from 'lucide-react';

const COLOR_SWATCHES: Record<string, string> = {
  'Cream': '#F5EBE0',
  'Mocca': '#C2A385',
  'Sage': '#A3B19B',
  'Dusty Pink': '#D8A47F',
  'Lavender': '#C5A3CF',
  'Hitam': '#222222',
  'Navy': '#1B263B',
  'Maroon': '#6B1D2F',
  'Army': '#4B5320',
  'Nude': '#E8D0C1',
  'Dusty Grey': '#9E9E9E',
  'Olive': '#708238',
  'Milo': '#A18262',
  'Taupe': '#8B7D7B',
  'Denim': '#4A6984',
  'Broken White': '#FAF9F6',
  'Monochrome': '#333333',
  'Terracotta': '#C85A32',
  'Emerald': '#097969',
  'Abu': '#B0B0B0'
};

export const ProductDetailModal: React.FC = () => {
  const { detailProduct, activeModal, closeModal, openModal, addToCart, showToast, storeSettings } = useStore();

  const isPo = Boolean(detailProduct?.is_preorder);
  const rawMinQty = isPo ? Number(detailProduct?.min_order || 1) : 1;
  const minQty = (!Number.isSafeInteger(rawMinQty) || rawMinQty < 1 || rawMinQty > 50) ? 1 : rawMinQty;
  const maxQty = isPo ? 50 : Math.min(50, Math.max(1, Number(detailProduct?.stock) || 1));
  const isSold = !isPo && detailProduct?.stock !== null && detailProduct?.stock !== undefined && Number(detailProduct?.stock) <= 0;

  // Determine variants
  const sizeOptions = React.useMemo(() => {
    if (Array.isArray(detailProduct?.variants) && detailProduct.variants.length > 0) {
      return detailProduct.variants;
    }
    return [];
  }, [detailProduct?.variants]);

  const [selectedSize, setSelectedSize] = useState<string>(sizeOptions[0] || '');
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(minQty);
  const [isWishlist, setIsWishlist] = useState(false);

  useEffect(() => {
    if (detailProduct) {
      const defaultSize = (Array.isArray(detailProduct.variants) && detailProduct.variants[0]) || '';
      setSelectedSize(defaultSize);
      const gallery = Array.isArray(detailProduct.gallery_urls) ? detailProduct.gallery_urls : [];
      setActiveImage(detailProduct.image_url || gallery[0] || '');
      setQuantity(minQty);
    }
  }, [detailProduct?.id, minQty]);

  if (activeModal !== 'productDetail' || !detailProduct) return null;

  const galleryList = (Array.isArray(detailProduct.gallery_urls) ? detailProduct.gallery_urls : []).slice(0, 5);
  if (galleryList.length === 0 && detailProduct.image_url) galleryList.push(detailProduct.image_url);

  const handleMinus = () => {
    if (quantity > minQty) setQuantity(prev => prev - 1);
  };

  const handlePlus = () => {
    if (quantity < maxQty) setQuantity(prev => prev + 1);
  };

  const handleAddToCart = () => {
    addToCart(detailProduct, selectedSize, quantity);
    showToast(`"${detailProduct.name}" (${selectedSize}) ditambahkan ke keranjang.`);
    closeModal();
  };

  const handleQuickWaBuy = () => {
    const totalPrice = (Number(detailProduct.price) || 0) * quantity;
    const waContact = cleanPhoneNumber(storeSettings.contact_whatsapp || '');
    if (!waContact) { showToast('Kontak WhatsApp toko belum diatur. Tambahkan produk ke keranjang atau hubungi toko nanti.'); return; }
    const lines = [
      `*PESANAN INABA HIJAB*`,
      `Halo Admin INABA, saya ingin memesan langsung:`,
      ``,
      `• *Produk:* ${detailProduct.name} [${isPo ? 'PRE-ORDER' : 'READY STOCK'}]`,
      `• *Pilihan Varian:* ${selectedSize}`,
      `• *Jumlah:* ${quantity} pcs`,
      `• *Estimasi Total:* ${formatRupiah(totalPrice)}`,
      ``,
      `Mohon info ketersediaan barang dan nomor rekening transfer ya admin. Terima kasih!`
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/${waContact}?text=${encodeURIComponent(lines)}`, '_blank');
    closeModal();
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#produk=${encodeURIComponent(detailProduct.slug || detailProduct.id)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Tautan produk disalin ke clipboard.');
      });
    } else {
      showToast('Tautan: ' + shareUrl);
    }
  };

  return (
    <div
      className="overlay open ref-product-detail-modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={e => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <section className="sheet ref-customer-product-sheet">
        {/* Top Header Controls with Close, Share, Heart matching reference */}
        <div className="ref-modal-top-bar">
          <button className="ref-modal-circle-btn" onClick={closeModal} aria-label="Tutup">
            <X size={17} />
          </button>
          <div className="ref-modal-top-actions">
            <button className="ref-modal-circle-btn" onClick={handleShare} aria-label="Bagikan">
              <Share2 size={16} />
            </button>
            <button
              className={`ref-modal-circle-btn ${isWishlist ? 'active-heart' : ''}`}
              onClick={() => {
                setIsWishlist(prev => !prev);
                showToast(isWishlist ? 'Dihapus dari wishlist' : 'Ditambahkan ke wishlist!');
              }}
              aria-label="Wishlist"
            >
              <Heart size={16} fill={isWishlist ? '#C62828' : 'none'} color={isWishlist ? '#C62828' : 'currentColor'} />
            </button>
          </div>
        </div>

        <div className="ref-customer-product-layout">
          {/* Main Product Image & Thumbnails */}
          <div className="ref-customer-media-col">
            <div className="ref-customer-main-image-wrap">
              {activeImage || detailProduct.image_url ? (
                <img
                  src={activeImage || detailProduct.image_url || ''}
                  alt={detailProduct.name}
                  className="ref-customer-main-img"
                />
              ) : (
                <div className="ref-customer-image-empty" role="img" aria-label="Foto produk belum tersedia">
                  <Package size={40} strokeWidth={1.4} />
                  <span>Foto belum tersedia</span>
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            <div className="ref-customer-thumbs-row">
              {galleryList.map((url, i) => (
                <div
                  key={i}
                  className={`ref-customer-thumb-slot ${activeImage === url ? 'active' : ''}`}
                  onClick={() => setActiveImage(url)}
                >
                  <img src={url} alt={`Thumbnail ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info & Purchase Options */}
          <div className="ref-customer-info-col">
            <div className="ref-customer-title-price-row">
              <div>
                <h2 className="ref-customer-prod-title">{detailProduct.name}</h2>
                <div className="ref-customer-price-val tabular-nums">
                  {formatRupiah(detailProduct.price)}
                </div>
              </div>
              <div>
                {isPo ? (
                  <span className={`ref-status-badge ${detailProduct.preorder_status === 'closed' ? 'status-habis' : 'status-aktif'}`}>
                    {detailProduct.preorder_status === 'closed' ? 'Pre-Order Ditutup' : 'Pre-Order Dibuka'}
                  </span>
                ) : isSold ? (
                  <span className="ref-status-badge status-habis">Stok Habis</span>
                ) : (
                  <span className="ref-status-badge status-aktif">Stok Tersedia</span>
                )}
              </div>
            </div>

            <div className="ref-customer-cat-line">
              <span>Kategori:</span> <strong>{detailProduct.category}</strong>
            </div>

            {/* Pilih Varian (Color Swatches or Pills) matching reference image */}
            <div className="ref-customer-variants-section">
              {sizeOptions.length === 0 && <p className="field-hint">Pilihan ukuran atau varian produk belum diatur. Hubungi admin sebelum memesan.</p>}
              <label className="ref-variants-label">Pilih Varian</label>
              <div className="ref-swatches-row">
                {sizeOptions.map(opt => {
                  const colorHex = COLOR_SWATCHES[opt];
                  const isSelected = selectedSize === opt;
                  if (colorHex) {
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={`ref-color-swatch-btn ${isSelected ? 'active' : ''}`}
                        style={{ backgroundColor: colorHex }}
                        onClick={() => setSelectedSize(opt)}
                        title={opt}
                        aria-label={opt}
                      />
                    );
                  }
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`ref-size-chip-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedSize(opt)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <span className="ref-selected-variant-name">
                Varian terpilih: <strong>{selectedSize}</strong>
              </span>
            </div>

            {/* Description */}
            <div className="ref-customer-desc-box">
              <p>{detailProduct.description || 'Deskripsi produk belum ditambahkan oleh toko.'}</p>
            </div>

            {/* Quantity Stepper */}
            <div className="ref-customer-qty-row">
              <span style={{ fontSize: 13, fontWeight: 600 }}>Jumlah:</span>
              <div className="ref-qty-stepper">
                <button
                  type="button"
                  onClick={handleMinus}
                  disabled={quantity <= minQty || isSold}
                  aria-label="Kurang"
                >
                  <Minus size={13} />
                </button>
                <span className="ref-qty-number tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={handlePlus}
                  disabled={quantity >= maxQty || isSold}
                  aria-label="Tambah"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="ref-customer-action-buttons">
              <button
                type="button"
                className="ref-btn-primary full-width ref-btn-add-cart"
                onClick={handleAddToCart}
                disabled={isSold || sizeOptions.length === 0 || (isPo && detailProduct.preorder_status === 'closed')}
              >
                {isSold ? 'Stok Tidak Tersedia' : sizeOptions.length === 0 ? 'Varian Belum Diatur' : (isPo && detailProduct.preorder_status === 'closed') ? 'Pre-Order Ditutup' : 'Tambah ke Keranjang'}
              </button>

              <button
                type="button"
                className="ref-btn-secondary full-width"
                onClick={handleQuickWaBuy}
                style={{ marginTop: 8 }}
              >
                <MessageCircle size={15} /> Pesan Cepat via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
