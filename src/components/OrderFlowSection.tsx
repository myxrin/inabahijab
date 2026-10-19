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
            <p className="section-intro">
              Kami membedakan alur pemesanan produk Ready Stock dan Pre-Order agar pelanggan merasa nyaman dan tidak ada kekeliruan jadwal.
            </p>
          </div>
        </div>

        <div className="order-flow-tabs">
          <button
            type="button"
            className={`order-flow-tab ${activeTab === 'ready' ? 'active' : ''}`}
            onClick={() => setActiveTab('ready')}
          >
            Alur Barang Ready Stock
          </button>
          <button
            type="button"
            className={`order-flow-tab ${activeTab === 'po' ? 'active' : ''}`}
            onClick={() => setActiveTab('po')}
          >
            Alur Barang Pre-Order (PO)
          </button>
        </div>

        {/* Ready Stock Flow */}
        {activeTab === 'ready' && (
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <div>
                <h3>Pilih Produk &amp; Ukuran</h3>
                <p>Pilih busana, capel petani, atau meja lipat yang ready stock. Tentukan jumlah dan masukkan ke keranjang belanja.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div>
                <h3>Checkout &amp; Kirim WhatsApp</h3>
                <p>Isi alamat pengiriman lengkap. Sistem membuat ringkasan pesanan dan mengarahkan konfirmasi ke WhatsApp admin.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div>
                <h3>Ongkir Pasti, Transfer &amp; Kirim</h3>
                <p>Admin memastikan stok barang dan menghitung ongkir termurah. Pelanggan transfer, lalu barang segera dikirim.</p>
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
                <p>Buka bagian Pre-Order, pilih lembaga (SDIT, TPQ, Madin). Sesuaikan ukuran berdasarkan tabel panduan ukuran yang disediakan.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-number po">2</div>
              <div>
                <h3>Form Pemesanan &amp; Catatan Khusus</h3>
                <p>Tuliskan nama siswa/santri, kelas, atau permintaan bordir nama (bila ada). Kirim pesanan ke WhatsApp admin.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-number po">3</div>
              <div>
                <h3>Konfirmasi Batch PO &amp; Produksi</h3>
                <p>Admin mengonfirmasi jadwal penutupan batch PO, DP/pembayaran, dan waktu pengerjaan (10-21 hari kerja) hingga siap dikirim.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
