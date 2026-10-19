import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../lib/supabase';
import { ArrowUpRight } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const { showToast } = useStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setLoading(true);
    try {
      if (supabase) {
        const { error } = await supabase.from('newsletter_subscribers').insert({ email: cleanEmail });
        if (error && error.code === '23505') {
          showToast('Email tersebut sudah terdaftar di warta INABA.');
        } else if (error) {
          throw error;
        } else {
          showToast('Alhamdulillah, email Anda berhasil terdaftar untuk kabar INABA!');
          setEmail('');
        }
      } else {
        showToast('Alhamdulillah, email Anda berhasil dicatat untuk warta toko!');
        setEmail('');
      }
    } catch (err: any) {
      showToast('Pendaftaran email gagal: ' + (err?.message || 'Silakan coba lagi.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="wrap">
      <div className="newsletter-card">
        <div className="eyebrow"><span className="eyebrow-dot"></span> Warta &amp; Jadwal Batch PO</div>
        <h2 className="serif">Dapatkan Kabar Batch Pre-Order &amp; Stok Baru</h2>
        <p>
          Daftarkan emailmu untuk info pembukaan pre-order seragam sekolah, promo cuci gudang ready stock, dan kedatangan produk baru.
        </p>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Alamat email kamu"
            aria-label="Alamat email kamu"
            required
            disabled={loading}
          />
          <button type="submit" className="btn btn-clay" disabled={loading}>
            {loading ? 'Mendaftarkan…' : 'Daftarkan Email'} <ArrowUpRight size={14} className="btn-arrow-icon" />
          </button>
        </form>
      </div>
    </section>
  );
};
