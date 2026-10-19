import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../lib/supabase';

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
          showToast('Email berhasil didaftarkan.');
          setEmail('');
        }
      } else {
        throw new Error('Koneksi Supabase belum tersedia.');
      }
    } catch (err: any) {
      showToast(err?.message || 'Pendaftaran email gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="wrap">
      <div className="newsletter-card">
        <div className="eyebrow"><span className="eyebrow-dot" />Info produk</div>
        <h2 className="serif">Kabar stok dan pre-order terbaru</h2>
        <p>Masukkan email jika ingin menerima kabar dari INABA.</p>
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
            {loading ? 'Mendaftarkan…' : 'Daftar'}
          </button>
        </form>
      </div>
    </section>
  );
};
