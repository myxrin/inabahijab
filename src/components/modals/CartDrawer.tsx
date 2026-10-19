import React from 'react';
import { useStore } from '../../context/StoreContext';
import { formatRupiah } from '../../lib/supabase';
import { X, Minus, Plus, ShoppingBag, ArrowUpRight } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { cart, activeModal, closeModal, openModal, updateCartQty, removeFromCart, cartSubtotal } = useStore();

  if (activeModal !== 'cart') return null;

  const hasPreorder = cart.some(item => item.is_preorder);

  return (
    <div className="overlay open" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      <section className="sheet sheet-wide">
        <div className="sheet-handle" aria-hidden="true"></div>
        <div className="sheet-head">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot"></span> Pilihan Belanja</div>
            <h2 className="serif">Keranjang Belanja</h2>
          </div>
          <button className="close-btn" onClick={closeModal} aria-label="Tutup keranjang">
            <X size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px' }}>
            <ShoppingBag size={48} style={{ color: 'var(--muted)', margin: '0 auto 12px' }} strokeWidth={1.5} />
            <h3 className="serif" style={{ fontSize: 24, margin: '0 0 8px' }}>Keranjang Belanja Kosong</h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 20px' }}>
              Silakan pilih produk ready stock atau ajukan pre-order seragam sekolah pilihan Anda.
            </p>
            <button
              className="btn btn-clay"
              onClick={() => {
                closeModal();
                const shopEl = document.getElementById('shop');
                if (shopEl) shopEl.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Jelajahi Katalog Toko <ArrowUpRight size={14} className="btn-arrow-icon" />
            </button>
          </div>
        ) : (
          <div>
            {cart.map((item) => (
              <div key={item.cart_item_id} className="cart-line">
                <div className="cart-thumb">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="boutique-brand-mark" style={{ height: '100%', fontSize: 9 }}>
                      <span className="mark-sub">INABA</span>
                      <span className="mark-main">HIJAB</span>
                    </div>
                  )}
                </div>

                <div>
                  <span className={`cart-item-tag ${item.is_preorder ? 'tag-po' : 'tag-ready'}`}>
                    {item.is_preorder ? 'PRE-ORDER' : 'READY STOCK'}
                  </span>
                  <h3 style={{ fontSize: 15, margin: '2px 0 4px', fontWeight: 700 }}>{item.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>
                    {formatRupiah(item.price)} &bull; Pilihan: <strong>{item.size || 'Varian belum dipilih'}</strong>
                  </p>
                  {item.school_institution && (
                    <p style={{ fontSize: 11, color: 'var(--olive)', margin: '2px 0 0' }}>
                      Lembaga: {item.school_institution}
                    </p>
                  )}

                  <div className="qty-row">
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.cart_item_id, -1)}
                      aria-label="Kurang kuantitas"
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: 13, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.cart_item_id, 1)}
                      aria-label="Tambah kuantitas"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      type="button"
                      className="btn-remove-item"
                      onClick={() => removeFromCart(item.cart_item_id)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                <div style={{ fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', textAlign: 'right' }}>
                  {formatRupiah(item.price * item.quantity)}
                </div>
              </div>
            ))}

            <div className="cart-total-box">
              <div className="cart-total-line">
                <span>Subtotal Barang:</span>
                <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--clay)' }}>
                  {formatRupiah(cartSubtotal)}
                </span>
              </div>
              <div className="cart-total-note">
                {hasPreorder && (
                  <>
                    &bull; Memuat pesanan Pre-Order Seragam: Pengerjaan mengikuti jadwal produksi 10–21 hari kerja.<br />
                  </>
                )}
                &bull; Ongkos kirim dihitung berdasarkan alamat dan dikonfirmasi admin melalui WhatsApp sebelum pembayaran.
              </div>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <button
                className="btn btn-full btn-clay"
                onClick={() => openModal('checkout')}
              >
                Lanjutkan Pemesanan <ArrowUpRight size={14} className="btn-arrow-icon" />
              </button>
              <button
                className="btn btn-full btn-ghost"
                onClick={closeModal}
              >
                Tambah Produk Lain
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
