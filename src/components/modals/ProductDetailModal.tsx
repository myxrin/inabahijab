import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatRupiah, cleanPhoneNumber } from '../../lib/supabase';
import { X, Minus, Plus, MessageCircle, Share2, Package, ChevronLeft } from 'lucide-react';

const COLOR_SWATCHES: Record<string, string> = {
  Cream: '#F5EBE0', Mocca: '#C2A385', Sage: '#A3B19B', 'Dusty Pink': '#D8A47F',
  Lavender: '#C5A3CF', Hitam: '#222222', Navy: '#1B263B', Maroon: '#6B1D2F',
  Army: '#4B5320', Nude: '#E8D0C1', 'Dusty Grey': '#9E9E9E', Olive: '#708238',
  Milo: '#A18262', Taupe: '#8B7D7B', Denim: '#4A6984', 'Broken White': '#FAF9F6',
  Monochrome: '#333333', Terracotta: '#C85A32', Emerald: '#097969', Abu: '#B0B0B0'
};

export const ProductDetailModal: React.FC = () => {
  const { detailProduct, activeModal, closeModal, addToCart, showToast, storeSettings } = useStore();
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  const variants = useMemo(
    () => Array.isArray(detailProduct?.variants) ? detailProduct.variants.filter(Boolean) : [],
    [detailProduct?.variants]
  );
  const gallery = useMemo(() => {
    if (!detailProduct) return [];
    const urls = [detailProduct.image_url, ...(Array.isArray(detailProduct.gallery_urls) ? detailProduct.gallery_urls : [])]
      .filter((url): url is string => typeof url === 'string' && url.trim().length > 0);
    return [...new Set(urls)].slice(0, 5);
  }, [detailProduct?.id, detailProduct?.image_url, detailProduct?.gallery_urls]);

  const isPo = Boolean(detailProduct?.is_preorder);
  const rawMinQty = isPo ? Number(detailProduct?.min_order || 1) : 1;
  const minQty = Number.isSafeInteger(rawMinQty) && rawMinQty >= 1 && rawMinQty <= 50 ? rawMinQty : 1;
  const maxQty = isPo ? 50 : Math.min(50, Math.max(1, Number(detailProduct?.stock) || 1));
  const isSold = Boolean(!isPo && detailProduct?.stock !== null && detailProduct?.stock !== undefined && Number(detailProduct.stock) <= 0);
  const isPoClosed = isPo && detailProduct?.preorder_status === 'closed';

  useEffect(() => {
    if (!detailProduct) return;
    setSelectedSize(variants[0] || '');
    setActiveImage(gallery[0] || '');
    setQuantity(minQty);
  }, [detailProduct?.id, minQty]);

  if (activeModal !== 'productDetail' || !detailProduct) return null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      showToast('Pilih varian produk terlebih dahulu.');
      return;
    }
    addToCart(detailProduct, selectedSize, quantity);
    showToast(`${detailProduct.name} ditambahkan ke keranjang.`);
    closeModal();
  };

  const handleQuickWaBuy = () => {
    const waContact = cleanPhoneNumber(storeSettings.contact_whatsapp || '');
    if (!waContact) {
      showToast('Kontak WhatsApp toko belum diatur.');
      return;
    }
    const lines = [
      'PESANAN INABA HIJAB',
      'Halo Admin INABA, saya ingin bertanya tentang produk ini.',
      `Produk: ${detailProduct.name}`,
      `Jenis: ${isPo ? 'Pre-order' : 'Ready stock'}`,
      `Varian: ${selectedSize || 'Belum dipilih'}`,
      `Jumlah: ${quantity} pcs`,
      `Estimasi total: ${formatRupiah((Number(detailProduct.price) || 0) * quantity)}`
    ].join('\n');
    window.open(`https://wa.me/${waContact}?text=${encodeURIComponent(lines)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#produk=${encodeURIComponent(detailProduct.slug || detailProduct.id)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Tautan produk disalin.');
    } catch {
      showToast(shareUrl);
    }
  };

  return (
    <div
      className="overlay open ref-product-detail-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
      onClick={event => { if (event.target === event.currentTarget) closeModal(); }}
    >
      <section className="sheet ref-customer-product-sheet">
        <div className="ref-modal-top-bar">
          <button type="button" className="ref-modal-back-btn" onClick={closeModal}>
            <ChevronLeft size={18} aria-hidden="true" /> <span>Kembali</span>
          </button>
          <button type="button" className="ref-modal-share-btn" onClick={() => void handleShare()} aria-label="Salin tautan produk">
            <Share2 size={16} aria-hidden="true" /> <span>Bagikan</span>
          </button>
          <button type="button" className="ref-modal-close-btn" onClick={closeModal} aria-label="Tutup detail produk">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="ref-customer-product-layout">
          <div className="ref-customer-media-col">
            <div className="ref-customer-main-image-wrap">
              {activeImage ? (
                <img src={activeImage} alt={detailProduct.name} className="ref-customer-main-img" />
              ) : (
                <div className="ref-customer-image-empty" role="img" aria-label="Foto produk belum tersedia">
                  <Package size={34} strokeWidth={1.5} aria-hidden="true" />
                  <span>Foto belum tersedia</span>
                </div>
              )}
              {isPo && <span className="ref-image-type-badge">Pre-order</span>}
            </div>

            {gallery.length > 1 && (
              <div className="ref-customer-thumbs-row" aria-label="Foto produk lainnya">
                {gallery.map((url, index) => (
                  <button
                    key={`${url}-${index}`}
                    type="button"
                    className={`ref-customer-thumb-slot ${activeImage === url ? 'active' : ''}`}
                    onClick={() => setActiveImage(url)}
                    aria-label={`Tampilkan foto ${index + 1}`}
                    aria-pressed={activeImage === url}
                  >
                    <img src={url} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ref-customer-info-col">
            <div className="ref-customer-cat-line">{detailProduct.category || 'Produk INABA'}</div>
            <h2 className="ref-customer-prod-title" id="product-detail-title">{detailProduct.name}</h2>
            <div className="ref-customer-price-val">{formatRupiah(detailProduct.price)}</div>

            <div className="ref-customer-stock-line">
              <span className={`ref-status-badge ${isPoClosed || isSold ? 'status-habis' : 'status-aktif'}`}>
                {isPo ? (isPoClosed ? 'Pre-order ditutup' : 'Pre-order dibuka') : (isSold ? 'Stok habis' : 'Ready stock')}
              </span>
              {!isPo && !isSold && detailProduct.stock !== null && detailProduct.stock !== undefined && (
                <span className="ref-stock-caption">Stok {detailProduct.stock}</span>
              )}
            </div>

            <div className="ref-customer-variants-section">
              <div className="ref-variants-header">
                <span className="ref-variants-label">Varian</span>
                {selectedSize && <span className="ref-selected-variant-name">Pilihan: <strong>{selectedSize}</strong></span>}
              </div>
              {variants.length > 0 ? (
                <div className="ref-swatches-row">
                  {variants.map(variant => {
                    const color = COLOR_SWATCHES[variant];
                    const selected = selectedSize === variant;
                    return color ? (
                      <button
                        key={variant}
                        type="button"
                        className={`ref-color-swatch-btn ${selected ? 'active' : ''}`}
                        style={{ '--swatch-color': color } as React.CSSProperties}
                        onClick={() => setSelectedSize(variant)}
                        aria-label={variant}
                        aria-pressed={selected}
                        title={variant}
                      />
                    ) : (
                      <button
                        key={variant}
                        type="button"
                        className={`ref-size-chip-btn ${selected ? 'active' : ''}`}
                        onClick={() => setSelectedSize(variant)}
                        aria-pressed={selected}
                      >
                        {variant}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="ref-variant-empty">Varian belum ditambahkan. Hubungi toko untuk konfirmasi.</p>
              )}
            </div>

            {detailProduct.description && <p className="ref-customer-desc-box">{detailProduct.description}</p>}

            <div className="ref-customer-qty-row">
              <span className="ref-qty-label">Jumlah</span>
              <div className="ref-qty-stepper" aria-label="Jumlah produk">
                <button type="button" onClick={() => setQuantity(value => Math.max(minQty, value - 1))} disabled={quantity <= minQty || isSold} aria-label="Kurangi jumlah">
                  <Minus size={14} aria-hidden="true" />
                </button>
                <span className="ref-qty-number" aria-live="polite">{quantity}</span>
                <button type="button" onClick={() => setQuantity(value => Math.min(maxQty, value + 1))} disabled={quantity >= maxQty || isSold} aria-label="Tambah jumlah">
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>
              {isPo && minQty > 1 && <span className="ref-min-qty-note">Minimal {minQty}</span>}
            </div>

            <div className="ref-customer-action-buttons">
              <button
                type="button"
                className="ref-btn-primary full-width"
                onClick={handleAddToCart}
                disabled={isSold || variants.length === 0 || isPoClosed}
              >
                {isSold ? 'Stok habis' : isPoClosed ? 'Pre-order ditutup' : variants.length === 0 ? 'Varian belum tersedia' : 'Tambah ke keranjang'}
              </button>
              <button type="button" className="ref-btn-secondary full-width" onClick={handleQuickWaBuy}>
                <MessageCircle size={16} aria-hidden="true" /> Pesan via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
