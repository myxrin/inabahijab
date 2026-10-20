import React from 'react';
import { useStore } from '../../context/StoreContext';
import { formatRupiah } from '../../lib/supabase';
import { Minus, Plus, ShoppingBag, ArrowUpRight, ArrowLeft, Trash2 } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { cart, activeStoreTab, navigateToStoreTab, openModal, updateCartQty, removeFromCart, cartSubtotal } = useStore();

  if (activeStoreTab !== 'keranjang') return null;

  const hasPreorder = cart.some(item => item.is_preorder);

  return (
    <main id="main" className="cart-page section" aria-labelledby="cart-page-title">
      <div className="wrap cart-page-wrap">
        <div className="cart-page-heading">
          <button type="button" className="cart-back-link" onClick={() => navigateToStoreTab('katalog')}>
            <ArrowLeft size={17} aria-hidden="true" /> Lanjut belanja
          </button>
          <div>
            <div className="eyebrow"><span className="eyebrow-dot" /> Keranjang</div>
            <h1 id="cart-page-title" className="serif">Keranjang Belanja</h1>
            <p>{cart.length} jenis produk dalam keranjang</p>
          </div>
        </div>

        {cart.length === 0 ? (
          <section className="cart-page-empty" aria-live="polite">
            <ShoppingBag size={42} aria-hidden="true" />
            <h2 className="serif">Keranjang masih kosong</h2>
            <p>Pilih produk yang diperlukan, lalu tambahkan ke keranjang.</p>
            <button type="button" className="btn btn-clay" onClick={() => navigateToStoreTab('katalog')}>
              Jelajahi katalog <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          </section>
        ) : (
          <div className="cart-page-layout">
            <section className="cart-page-items" aria-label="Produk yang dipilih">
              {cart.map(item => (
                <article key={item.cart_item_id} className="cart-page-line">
                  <div className="cart-thumb">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} loading="lazy" />
                    ) : (
                      <div className="boutique-brand-mark" aria-hidden="true">
                        <span className="mark-sub">INABA</span><span className="mark-main">HIJAB</span>
                      </div>
                    )}
                  </div>
                  <div className="cart-page-item-info">
                    <span className={`cart-item-tag ${item.is_preorder ? 'tag-po' : 'tag-ready'}`}>
                      {item.is_preorder ? 'PRE-ORDER' : 'READY STOCK'}
                    </span>
                    <h2>{item.name}</h2>
                    <p className="cart-page-item-meta">{formatRupiah(item.price)} · Varian: <strong>{item.size || 'Belum dipilih'}</strong></p>
                    {item.school_institution && <p className="cart-page-item-meta">Lembaga: {item.school_institution}</p>}
                    <div className="qty-row cart-page-qty-row">
                      <button type="button" onClick={() => updateCartQty(item.cart_item_id, -1)} aria-label={`Kurangi jumlah ${item.name}`}><Minus size={14} /></button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button type="button" onClick={() => updateCartQty(item.cart_item_id, 1)} aria-label={`Tambah jumlah ${item.name}`}><Plus size={14} /></button>
                      <button type="button" className="btn-remove-item" onClick={() => removeFromCart(item.cart_item_id)}><Trash2 size={14} aria-hidden="true" /> Hapus</button>
                    </div>
                  </div>
                  <strong className="cart-page-line-total tabular-nums">{formatRupiah(item.price * item.quantity)}</strong>
                </article>
              ))}
            </section>

            <aside className="cart-page-summary" aria-label="Ringkasan keranjang">
              <h2>Ringkasan Belanja</h2>
              <div className="cart-page-summary-line"><span>Jenis produk</span><span>{cart.length}</span></div>
              <div className="cart-page-summary-line"><span>Total barang</span><span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span></div>
              <div className="cart-page-summary-total"><span>Subtotal</span><strong className="tabular-nums">{formatRupiah(cartSubtotal)}</strong></div>
              <p className="cart-total-note">
                {hasPreorder ? 'Produk pre-order mengikuti estimasi produksi yang tercantum pada produk. ' : ''}
                Ongkir akan dikonfirmasi berdasarkan alamat sebelum pembayaran.
              </p>
              <button type="button" className="btn btn-full btn-clay" onClick={() => openModal('checkout')}>
                Lanjutkan pemesanan <ArrowUpRight size={15} aria-hidden="true" />
              </button>
              <button type="button" className="btn btn-full btn-ghost" onClick={() => navigateToStoreTab('katalog')}>
                Tambah produk lain
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};
