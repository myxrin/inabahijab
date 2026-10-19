import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatRupiah, cleanPhoneNumber } from '../../lib/supabase';
import { X, MessageCircle, Copy, ArrowUpRight } from 'lucide-react';

export const PoCalculatorModal: React.FC = () => {
  const { activeModal, closeModal, showToast, storeSettings } = useStore();

  const [institution, setInstitution] = useState('Seragam SDIT Putra/Putri Lengkap');
  const [unitPrice, setUnitPrice] = useState(125000);
  const [schoolName, setSchoolName] = useState('');

  const [quantities, setQuantities] = useState<Record<string, number>>({
    'Anak S': 0,
    'Anak M': 0,
    'Anak L': 0,
    'Anak XL': 0,
    'Dewasa M': 0,
    'Dewasa L': 0
  });

  if (activeModal !== 'poCalculator') return null;

  const handleInstitutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setInstitution(val);
    if (val.includes('SDIT')) setUnitPrice(125000);
    else if (val.includes('TPQ')) setUnitPrice(95000);
    else if (val.includes('Madin')) setUnitPrice(145000);
  };

  const handleQtyChange = (size: string, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setQuantities(prev => ({ ...prev, [size]: num }));
  };

  const totalPcs = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const rawSubtotal = totalPcs * unitPrice;

  // Tiered Volume discount
  let discountPercent = 0;
  if (totalPcs >= 100) discountPercent = 15;
  else if (totalPcs >= 50) discountPercent = 10;
  else if (totalPcs >= 20) discountPercent = 5;

  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const totalPrice = rawSubtotal - discountAmount;
  const dpAmount = totalPrice * 0.5;

  const generateSummaryText = () => {
    const breakdown = Object.entries(quantities)
      .filter(([_, q]) => q > 0)
      .map(([s, q]) => `  • ${s}: ${q} pcs`)
      .join('\n');

    return [
      `*DRAFT SIMULASI PESANAN ROMBONGAN SERAGAM*`,
      `INABA SCHOOLWEAR (INABA HIJAB)`,
      ``,
      `• *Lembaga/Sekolah:* ${schoolName || 'Belum diisi'}`,
      `• *Model Seragam:* ${institution}`,
      `• *Harga Satuan:* ${formatRupiah(unitPrice)}/set`,
      ``,
      `*Rincian Ukuran:*`,
      breakdown || '  (Belum ada jumlah per ukuran)',
      ``,
      `• *Total Kuantitas:* ${totalPcs} pcs`,
      discountPercent > 0 ? `• *Diskon Rombongan (${discountPercent}%):* -${formatRupiah(discountAmount)}` : '',
      `• *Estimasi Total:* ${formatRupiah(totalPrice)}`,
      `• *Estimasi DP Awal (50%):* ${formatRupiah(dpAmount)}`,
      ``,
      `Mohon info ketersediaan slot antrean batch produksi, jadwal pengerjaan, dan pengiriman sampel kain resmi ya admin. Terima kasih!`
    ].filter(Boolean).join('\n');
  };

  const handleSendWa = () => {
    const text = generateSummaryText();
    const waNumber = cleanPhoneNumber(storeSettings.contact_whatsapp);
    if (!waNumber) {
      showToast('Kontak WhatsApp toko belum diatur. Rincian dapat disalin terlebih dahulu.');
      return;
    }
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    closeModal();
  };

  const handleCopy = () => {
    const text = generateSummaryText();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Rincian simulasi rombongan berhasil disalin!');
      });
    } else {
      showToast('Rincian disalin.');
    }
  };

  return (
    <div className="overlay open" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      <section className="sheet sheet-wide">
        <div className="sheet-handle" aria-hidden="true"></div>
        <div className="sheet-head">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot"></span> Layanan Lembaga &amp; Sekolah</div>
            <h2 className="serif">Simulasi Pesanan Rombongan Seragam</h2>
          </div>
          <button className="close-btn" onClick={closeModal} aria-label="Tutup form">
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 18 }}>
          Hitung simulasi kebutuhan seragam santri &amp; siswa secara instan (SDIT, TPQ, Madin). Dapatkan diskon volume dan kirim draf resmi ke WhatsApp panitia/yayasan.
        </p>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="calcInstitutionSelect">Pilih Model Seragam / Lembaga</label>
              <select
                id="calcInstitutionSelect"
                value={institution}
                onChange={handleInstitutionChange}
              >
                <option value="Seragam SDIT Putra/Putri Lengkap">Seragam SDIT Putra/Putri (Rp 125.000/set)</option>
                <option value="Seragam Santri TPQ / TPA Binaan">Seragam Santri TPQ / TPA (Rp 95.000/set)</option>
                <option value="Seragam Madin Sirimbit Keluarga">Seragam Madin Sirimbit (Rp 145.000/set)</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="calcSchoolNameInput">Nama Sekolah / TPQ / Lembaga</label>
              <input
                id="calcSchoolNameInput"
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Contoh: TPQ Al-Hidayah / SDIT Bina Insani"
              />
            </div>
          </div>

          <label style={{ fontSize: 13, fontWeight: 700, display: 'block', margin: '12px 0 6px' }}>
            Jumlah Pesanan per Ukuran (Pcs):
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: 8, marginBottom: 16 }}>
            {Object.keys(quantities).map((size) => (
              <div key={size}>
                <label style={{ fontSize: 11.5, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>{size}</label>
                <input
                  type="number"
                  min="0"
                  value={quantities[size] || 0}
                  onChange={(e) => handleQtyChange(size, e.target.value)}
                  style={{ padding: '6px 10px', minHeight: 38 }}
                />
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--wash)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>Total Kuantitas:</span>
              <strong>{totalPcs} pcs</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>Diskon Rombongan:</span>
              <span style={{ color: 'var(--olive)', fontWeight: 700 }}>
                {discountPercent > 0 ? `${formatRupiah(discountAmount)} (${discountPercent}%)` : 'Rp 0 (0%)'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 16 }}>
              <span>Estimasi Total:</span>
              <strong style={{ color: 'var(--clay)' }}>{formatRupiah(totalPrice)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
              <span>DP Produksi Awal (50%):</span>
              <strong>{formatRupiah(dpAmount)}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <button
              type="button"
              className="btn btn-full btn-wa"
              onClick={handleSendWa}
              disabled={totalPcs === 0}
            >
              <MessageCircle size={16} /> Kirim Draft Rombongan ke WhatsApp Admin <ArrowUpRight size={13} className="btn-arrow-icon" />
            </button>
            <button
              type="button"
              className="btn btn-full btn-ghost"
              onClick={handleCopy}
              style={{ fontSize: 13 }}
            >
              <Copy size={15} /> Salin Rincian Simulasi
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
