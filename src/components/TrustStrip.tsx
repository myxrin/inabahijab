import React from 'react';
import { ShieldCheck, CheckCircle2, Award, MessageCircle } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  return (
    <div className="wrap">
      <section className="trust-strip" aria-label="Keunggulan INABA HIJAB">
        <div className="trust-item">
          <div className="trust-icon">
            <ShieldCheck size={18} />
          </div>
          <div>
            <strong>Ready &amp; Pre-Order Jelas</strong>
            <span>Status stok dan jadwal PO transparan, tanpa rekayasa.</span>
          </div>
        </div>

        <div className="trust-item">
          <div className="trust-icon">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <strong>Seragam Sekolah Presisi</strong>
            <span>Spesialis seragam SDIT, santri TPQ, dan Madrasah Diniyah.</span>
          </div>
        </div>

        <div className="trust-item">
          <div className="trust-icon">
            <Award size={18} />
          </div>
          <div>
            <strong>Perlengkapan Fungsional</strong>
            <span>Topi capel petani anyaman bambu &amp; meja lipat kokoh.</span>
          </div>
        </div>

        <div className="trust-item">
          <div className="trust-icon">
            <MessageCircle size={18} />
          </div>
          <div>
            <strong>Konfirmasi WhatsApp Mudah</strong>
            <span>Pesanan terdata rapi, ongkir dan rincian pasti sebelum bayar.</span>
          </div>
        </div>
      </section>
    </div>
  );
};
