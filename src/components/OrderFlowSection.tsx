import React, { useState } from 'react';

export const OrderFlowSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ready' | 'po'>('ready');

  return (
    <section className="section" id="cara-pesan">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot"></span> Panduan Praktis</div>
            <h2 className="serif">Alur Pemesanan Transparan</h2>
            <p className="section-intro">Tiga langkah sederhana dari memilih produk sampai konfirmasi.</p>
          </div>
        </div>

        <div className="order-flow-tabs">
          <button
            type="button"
            className={`order-flow-tab ${activeTab === 'ready' ? 'active' : ''}`}
            onClick={() => setActiveTab('ready')}
          >
            Ready stock
          </button>
          <button
            type="button"
            className={`order-flow-tab ${activeTab === 'po' ? 'active' : ''}`}
            onClick={() => setActiveTab('po')}
          >
            Pre-order
          </button>
        </div>

        {/* Ready Stock Flow */}
        {activeTab === 'ready' && (
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <div>
                <h3>Pilih Produk &amp; Ukuran</h3>
                <p>Pilih produk, tentukan varian dan jumlah, lalu masukkan ke keranjang.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div>
                <h3>Checkout &amp; Kirim WhatsApp</h3>
                <p>Isi data pengiriman dan periksa ringkasan pesanan.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div>
                <h3>Ongkir Pasti, Transfer &amp; Kirim</h3>
                <p>Konfirmasi stok dan ongkir dengan admin sebelum pembayaran.</p>
              </div>
            </div>
          </div>
        )}

        {/* Pre-Order Flow */}
        {activeTab === 'po' && (
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number po">1</div>
              <div>
                <h3>Pilih Seragam &amp; Ukuran Santri</h3>
                <p>Pilih seragam serta ukuran lewat panduan yang tersedia.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-number po">2</div>
              <div>
                <h3>Form Pemesanan &amp; Catatan Khusus</h3>
                <p>Sampaikan kebutuhan, jumlah, dan catatan khusus ke admin.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-number po">3</div>
              <div>
                <h3>Konfirmasi Batch PO &amp; Produksi</h3>
                <p>Tunggu konfirmasi jadwal, biaya, dan estimasi pengerjaan dari admin.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
