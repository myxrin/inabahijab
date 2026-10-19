import React from 'react';
import { useStore } from '../../context/StoreContext';
import { formatRupiah } from '../../lib/supabase';
import { X, MessageCircle, Copy, ArrowUpRight } from 'lucide-react';

export const OrderSuccessModal: React.FC = () => {
  const { lastOrder, activeModal, closeModal, showToast, storeSettings } = useStore();

  if (activeModal !== 'orderSuccess' || !lastOrder) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(lastOrder.rawText).then(() => {
        showToast('Rincian pesanan berhasil disalin!');
      });
    } else {
      showToast('Rincian disalin ke clipboard.');
    }
  };

  return (
    <div className="overlay open" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      <section className="sheet sheet-wide">
        <div className="sheet-handle" aria-hidden="true"></div>
        <div className="sheet-head">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot"></span> Pesanan Tercatat</div>
            <h2 className="serif">Alhamdulillah, Terima Kasih!</h2>
          </div>
          <button className="close-btn" onClick={closeModal} aria-label="Tutup modal">
            <X size={20} />
          </button>
        </div>

        <div className="receipt-voucher">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span className="eyebrow"><span className="eyebrow-dot"></span> Bukti Pesanan Resmi</span>
            <span className="voucher-badge">#{lastOrder.reference}</span>
          </div>

          <div className="voucher-row">
            <span style={{ color: 'var(--muted)' }}>Nama Pemesan:</span>
            <strong>{lastOrder.customerName}</strong>
          </div>
          <div className="voucher-row">
            <span style={{ color: 'var(--muted)' }}>Kontak WhatsApp:</span>
            <span>{lastOrder.customerPhone}</span>
          </div>
          <div className="voucher-row">
            <span style={{ color: 'var(--muted)' }}>Pilihan Pengiriman:</span>
            <span>{lastOrder.shippingPref}</span>
          </div>
          <div className="voucher-row">
            <span>Subtotal Produk:</span>
            <strong style={{ color: 'var(--clay)', fontSize: 16 }}>
              {formatRupiah(lastOrder.subtotal)}
            </strong>
          </div>
        </div>

        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-soft)', margin: '14px 0' }}>
          Alhamdulillah! Rincian pesanan Anda telah tersusun rapi. Silakan lanjutkan konfirmasi dengan satu sentuhan ke WhatsApp admin agar admin menghitungkan ongkos kirim termurah &amp; memproses pesanan Anda.
        </p>

        {/* Bank payment accounts */}
        <div style={{ background: 'var(--wash)', padding: '14px 16px', borderRadius: 'var(--radius-md)', margin: '16px 0', fontSize: 13, lineHeight: 1.6, border: '1px solid var(--line-light)' }}>
          <strong style={{ display: 'block', marginBottom: 6, color: 'var(--ink)' }}>Informasi Rekening Pembayaran Resmi:</strong>
          {storeSettings.payment_accounts && storeSettings.payment_accounts.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {storeSettings.payment_accounts.map((acc, idx) => (
                <li key={idx}>
                  <strong>{acc.label}:</strong> {acc.detail}
                </li>
              ))}
            </ul>
          ) : (
            <span>Nomor rekening resmi toko (BCA / BRI / Mandiri / QRIS) akan diinformasikan admin langsung via WhatsApp.</span>
          )}
        </div>

        <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
          {lastOrder.waUrl ? (
            <a className="btn btn-full btn-wa" href={lastOrder.waUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} /> Lanjut Konfirmasi ke WhatsApp <ArrowUpRight size={13} className="btn-arrow-icon" />
            </a>
          ) : (
            <p className="notice">Kontak WhatsApp toko belum diatur. Pesanan tetap tersimpan dengan ID di atas. Admin perlu mengisi kontak di pengaturan toko sebelum konfirmasi WhatsApp digunakan.</p>
          )}
          <button
            type="button"
            className="btn btn-full btn-ghost"
            onClick={handleCopy}
            style={{ fontSize: 13 }}
          >
            <Copy size={15} /> Salin Rincian Pesanan
          </button>
        </div>
      </section>
    </div>
  );
};
