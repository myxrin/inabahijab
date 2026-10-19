import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, ShieldCheck, Clock, MessageSquare, ArrowUpRight } from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const { cart, activeModal, closeModal, openModal, createOrder, showToast, profile } = useStore();

  const [customerName, setCustomerName] = useState(profile?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [studentNotes, setStudentNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [shippingPref, setShippingPref] = useState('Kirim Bersamaan (Hemat Ongkir)');
  const [loading, setLoading] = useState(false);

  if (activeModal !== 'checkout') return null;

  const hasPreorder = cart.some(item => item.is_preorder);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      showToast('Nama pemesan wajib diisi.');
      return;
    }
    if (!customerPhone.trim()) {
      showToast('Nomor WhatsApp wajib diisi.');
      return;
    }
    if (!customerAddress.trim()) {
      showToast('Alamat pengiriman wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      await createOrder({
        customerName: customerName.trim(),
        phone: customerPhone.trim(),
        address: customerAddress.trim(),
        studentNotes: studentNotes.trim(),
        notes: notes.trim(),
        shippingPref
      });
      openModal('orderSuccess');
    } catch (err: any) {
      showToast('Gagal memproses pesanan: ' + (err?.message || 'Coba lagi'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay open" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      <section className="sheet sheet-wide">
        <div className="sheet-handle" aria-hidden="true"></div>
        <div className="sheet-head">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot"></span> Konfirmasi Pemesanan</div>
            <h2 className="serif">Detail Pemesan</h2>
          </div>
          <button className="close-btn" onClick={closeModal} aria-label="Tutup form">
            <X size={20} />
          </button>
        </div>

        {/* Checkout Trust Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, background: 'var(--wash)', padding: 14, borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <ShieldCheck size={20} style={{ color: 'var(--olive)', flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 12.5, lineHeight: 1.4 }}>
              <strong>Terdata Resmi</strong><br />Tersimpan aman di database toko.
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Clock size={20} style={{ color: 'var(--clay)', flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 12.5, lineHeight: 1.4 }}>
              <strong>Ongkir Akurat</strong><br />Dihitungkan tarif terbaik oleh admin.
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <MessageSquare size={20} style={{ color: 'var(--blue-ink)', flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 12.5, lineHeight: 1.4 }}>
              <strong>Konfirmasi WA</strong><br />Rincian &amp; rek. resmi via chat santun.
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field">
            <label htmlFor="checkoutNameInput">Nama Lengkap Penerima *</label>
            <input
              id="checkoutNameInput"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Contoh: Siti Fatimah"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="checkoutPhoneInput">Nomor WhatsApp Aktif *</label>
            <input
              id="checkoutPhoneInput"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Contoh: 08123456789"
              required
            />
          </div>

          <div className="field full">
            <label htmlFor="checkoutAddressInput">Alamat Lengkap Pengiriman *</label>
            <textarea
              id="checkoutAddressInput"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Kode Pos"
              required
            />
          </div>

          {hasPreorder && (
            <div className="field full">
              <label htmlFor="checkoutStudentNotesInput">
                Keterangan Khusus / Nama Santri / Sekolah (Opsional Pre-Order)
              </label>
              <input
                id="checkoutStudentNotesInput"
                type="text"
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="Contoh: SDIT Al-Hidayah Kelas 3 (Bordir nama: Ahmad)"
              />
              <span className="field-hint">
                Isi jika pesananmu memuat seragam sekolah pre-order yang membutuhkan identitas khusus.
              </span>
            </div>
          )}

          <div className="field full">
            <label htmlFor="checkoutNotesInput">Catatan Tambahan untuk Penjual (Opsional)</label>
            <textarea
              id="checkoutNotesInput"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ minHeight: 70 }}
              placeholder="Catatan warna cadangan, patokan alamat kurir, dll."
            />
          </div>

          {hasPreorder && (
            <div className="field full" style={{ background: 'var(--wash)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
              <strong style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--ink)' }}>
                Pilihan Pengiriman (Bila Ada Barang Pre-Order &amp; Ready Stock):
              </strong>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0', fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="shippingPreference"
                  checked={shippingPref.includes('Bersamaan')}
                  onChange={() => setShippingPref('Kirim Bersamaan (Hemat Ongkir)')}
                  style={{ width: 'auto', minHeight: 'auto' }}
                />
                <span>Kirim Sekaligus bersamaan saat pesanan Pre-Order selesai (1x Ongkir)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0', fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="shippingPreference"
                  checked={shippingPref.includes('Terpisah')}
                  onChange={() => setShippingPref('Kirim Terpisah (Ready Stock Lebih Cepat)')}
                  style={{ width: 'auto', minHeight: 'auto' }}
                />
                <span>Kirim barang Ready Stock terlebih dahulu, barang PO menyusul (2x Ongkir)</span>
              </label>
            </div>
          )}

          <div className="field full" style={{ marginTop: 12 }}>
            <button className="btn btn-full btn-clay" type="submit" disabled={loading}>
              {loading ? 'Memproses Pesanan…' : 'Kirim & Catat Pesanan'} <ArrowUpRight size={14} className="btn-arrow-icon" />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
