import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatRupiah, cleanPhoneNumber } from '../../lib/supabase';
import { X, Minus, Plus, MessageCircle, ArrowUpRight } from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { detailProduct, activeModal, closeModal, openModal, addToCart, showToast, storeSettings } = useStore();

  const isPo = Boolean(detailProduct?.is_preorder);
  const rawMinQty = isPo ? Number(detailProduct?.min_order || 1) : 1;
  const minQty = (!Number.isSafeInteger(rawMinQty) || rawMinQty < 1 || rawMinQty > 50) ? 1 : rawMinQty;
  const maxQty = isPo ? 50 : Math.min(20, Math.max(1, Number(detailProduct?.stock) || 1));
  const isSold = !isPo && detailProduct?.stock !== null && detailProduct?.stock !== undefined && Number(detailProduct?.stock) <= 0;

  // Determine variants
  let sizeOptions: string[] = [];
  if (Array.isArray(detailProduct?.variants) && detailProduct.variants.length > 0) {
    sizeOptions = detailProduct.variants;
  } else {
    const catLower = (detailProduct?.category || '').toLowerCase();
    const nameLower = (detailProduct?.name || '').toLowerCase();
    if (isPo || catLower.includes('seragam') || nameLower.includes('seragam')) {
      sizeOptions = ['Anak S (Kelas 1-2)', 'Anak M (Kelas 2-3)', 'Anak L (Kelas 4-5)', 'Anak XL (Kelas 6)'];
    } else if (catLower.includes('petani') || nameLower.includes('capel')) {
      sizeOptions = ['Diameter 45 cm (Standar)', 'Diameter 50 cm (Besar)'];
    } else if (catLower.includes('meja') || nameLower.includes('meja')) {
      sizeOptions = ['Ukuran 60x40 cm (Standar)'];
    } else {
      sizeOptions = ['All Size (Standar)', 'S', 'M', 'L', 'XL'];
    }
  }

  const [selectedSize, setSelectedSize] = useState<string>(sizeOptions[0] || 'Standar');
  const [quantity, setQuantity] = useState<number>(minQty);

  useEffect(() => {
    if (detailProduct) {
      setSelectedSize(sizeOptions[0] || 'Standar');
      setQuantity(minQty);
    }
  }, [detailProduct, minQty]);

  if (activeModal !== 'productDetail' || !detailProduct) return null;

  const handleMinus = () => {
    if (quantity > minQty) {
      setQuantity(prev => prev - 1);
    }
  };

  const handlePlus = () => {
    if (quantity < maxQty) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(detailProduct, selectedSize, quantity);
    closeModal();
  };

  const handleQuickWaBuy = () => {
    const totalPrice = (Number(detailProduct.price) || 0) * quantity;
    const waContact = cleanPhoneNumber(storeSettings.contact_whatsapp || '6285735144904');
    const lines = [
      `*PESANAN LANGSUNG INABA HIJAB*`,
      `Halo Admin INABA, saya ingin memesan langsung:`,
      ``,
      `• *Produk:* ${detailProduct.name} [${isPo ? 'PRE-ORDER' : 'READY STOCK'}]`,
      `• *Varian / Ukuran:* ${selectedSize}`,
      `• *Jumlah:* ${quantity} pcs`,
      `• *Estimasi Total:* ${formatRupiah(totalPrice)}`,
      isPo && detailProduct.school_institution ? `• *Lembaga:* ${detailProduct.school_institution}` : '',
      ``,
      `Mohon info ketersediaan barang, total ongkos kirim ke alamat saya, serta nomor rekening transfer resmi ya admin. Terima kasih!`
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/${waContact}?text=${encodeURIComponent(lines)}`, '_blank');
    closeModal();
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#produk=${encodeURIComponent(detailProduct.slug || detailProduct.id)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Tautan produk berhasil disalin!');
      });
    } else {
      showToast('Tautan: ' + shareUrl);
    }
  };

  return (
    <div className="overlay open" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      <section className="sheet sheet-wide">
        <div className="sheet-handle" aria-hidden="true"></div>
        <div className="sheet-head">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot"></span> Detail Produk</div>
            <h2 className="serif">{detailProduct.name}</h2>
          </div>
          <button className="close-btn" onClick={closeModal} aria-label="Tutup modal">
            <X size={20} />
          </button>
        </div>

        <div className="product-detail-layout">
          <div className="product-detail-media">
            {detailProduct.image_url ? (
              <img src={detailProduct.image_url} alt={detailProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div className="boutique-brand-mark" style={{ height: '100%' }}>
                <span className="mark-sub">INABA</span>
                <span className="mark-main">HIJAB</span>
              </div>
            )}
          </div>

          <div className="product-detail-copy">
            <div className="eyebrow">{detailProduct.category}</div>
            <h3 className="product-sheet-heading">{detailProduct.name}</h3>
            <div className="product-detail-price">{formatRupiah(detailProduct.price)}</div>

            {isPo ? (
              <div className="po-timeline-box">
                <div className="po-header-badge">
                  Layanan Pre-Order Resmi
                </div>
                <div style={{ display: 'grid', gap: 4, marginTop: 4 }}>
                  <div>&bull; Lembaga: <strong>{detailProduct.school_institution || 'Umum'}</strong></div>
                  <div>&bull; Status PO: <strong>{detailProduct.preorder_status === 'closed' ? 'Tutup Sementara' : 'Dibuka (Menerima Pesanan)'}</strong></div>
                  <div>&bull; Estimasi Pengerjaan: <strong>{detailProduct.estimated_delivery || '10–21 hari kerja'}</strong></div>
                  <div>&bull; Minimal Pesan: <strong>{minQty} pcs</strong></div>
                </div>
              </div>
            ) : (
              <div className={`notice ${isSold ? 'error' : 'success'}`}>
                {isSold
                  ? 'Maaf, stok produk ini saat ini sedang habis.'
                  : `Produk Ready Stock. ${detailProduct.stock ? `Tersedia: ${detailProduct.stock} pcs` : 'Tersedia siap kirim.'}`
                }
              </div>
            )}

            {detailProduct.description && (
              <div className="product-detail-desc" style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 16 }}>
                {detailProduct.description}
              </div>
            )}

            {detailProduct.specifications && Object.keys(detailProduct.specifications).length > 0 && (
              <div style={{ margin: '14px 0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Spesifikasi Produk:</div>
                <table className="spec-table">
                  <tbody>
                    {Object.entries(detailProduct.specifications).map(([key, val]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Size / Variant Options */}
            <div className="field" style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontWeight: 700, margin: 0 }}>Pilihan Ukuran / Varian:</label>
                <button
                  type="button"
                  className="text-link"
                  style={{ fontSize: 12, padding: 0 }}
                  onClick={() => openModal('sizeGuide')}
                >
                  Tabel Ukuran <ArrowUpRight size={12} className="btn-arrow-icon" />
                </button>
              </div>

              <div className="size-pill-group" role="radiogroup">
                {sizeOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`size-pill ${selectedSize === opt ? 'active' : ''}`}
                    onClick={() => setSelectedSize(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="field" style={{ marginTop: 14 }}>
              <label style={{ fontWeight: 700 }}>Jumlah Pesanan:</label>
              <div className="qty-stepper-container">
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={handleMinus}
                  disabled={quantity <= minQty || isSold}
                  aria-label="Kurang kuantitas"
                >
                  <Minus size={14} />
                </button>
                <span className="stepper-val">{quantity}</span>
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={handlePlus}
                  disabled={quantity >= maxQty || isSold}
                  aria-label="Tambah kuantitas"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="product-sheet-actions">
              <button
                type="button"
                className="btn btn-wa"
                onClick={handleQuickWaBuy}
                disabled={isSold || (isPo && detailProduct.preorder_status === 'closed')}
              >
                <MessageCircle size={16} /> Pesan via WA
              </button>
              <button
                type="button"
                className="btn btn-clay"
                onClick={handleAddToCart}
                disabled={isSold || (isPo && detailProduct.preorder_status === 'closed')}
              >
                {isSold ? 'Stok Habis' : (isPo ? '+ Keranjang PO' : '+ Keranjang')}
              </button>
            </div>

            <button
              type="button"
              className="btn btn-full btn-ghost"
              onClick={handleCopyLink}
              style={{ fontSize: 12.5, minHeight: 38, marginTop: 10 }}
            >
              Salin Tautan Produk <ArrowUpRight size={13} className="btn-arrow-icon" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
