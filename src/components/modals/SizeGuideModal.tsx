import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X } from 'lucide-react';

export const SizeGuideModal: React.FC = () => {
  const { activeModal, closeModal, products } = useStore();

  if (activeModal !== 'sizeGuide') return null;

  const productsWithSizeGuides = products.filter(p => p.size_guide && p.size_guide.trim().length > 0);

  return (
    <div className="overlay open" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      <section className="sheet sheet-wide">
        <div className="sheet-handle" aria-hidden="true"></div>
        <div className="sheet-head">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot"></span> Panduan Produk</div>
            <h2 className="serif">Panduan Ukuran Terstandar</h2>
          </div>
          <button className="close-btn" onClick={closeModal} aria-label="Tutup panduan">
            <X size={20} />
          </button>
        </div>

        <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 6 }}>
          <section style={{ marginBottom: 24 }}>
            <h3 style={{ font: '20px var(--serif)', margin: '0 0 10px', color: 'var(--ink)' }}>
              1. Tabel Ukuran Seragam Sekolah SDIT Putra &amp; Putri
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6, margin: '0 0 10px' }}>
              Dihitung berdasarkan postur rata-rata santri &amp; siswa Indonesia usia sekolah dasar:
            </p>
            <table className="spec-table" style={{ background: 'var(--wash)', borderRadius: 8 }}>
              <thead>
                <tr style={{ background: 'var(--paper-card)', fontWeight: 700 }}>
                  <td style={{ width: '22%' }}>Ukuran</td>
                  <td>Jenjang / Usia</td>
                  <td>Lebar Dada</td>
                  <td>Pjg Baju / Gamis</td>
                  <td>Pjg Celana</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Anak S</strong></td>
                  <td>Kelas 1 – 2 (6–7 thn)</td>
                  <td>38 cm</td>
                  <td>52 cm / 92 cm</td>
                  <td>68 cm</td>
                </tr>
                <tr>
                  <td><strong>Anak M</strong></td>
                  <td>Kelas 2 – 3 (8–9 thn)</td>
                  <td>40 cm</td>
                  <td>55 cm / 102 cm</td>
                  <td>73 cm</td>
                </tr>
                <tr>
                  <td><strong>Anak L</strong></td>
                  <td>Kelas 4 – 5 (10–11 thn)</td>
                  <td>43 cm</td>
                  <td>58 cm / 112 cm</td>
                  <td>78 cm</td>
                </tr>
                <tr>
                  <td><strong>Anak XL</strong></td>
                  <td>Kelas 6 (12–13 thn)</td>
                  <td>46 cm</td>
                  <td>62 cm / 122 cm</td>
                  <td>84 cm</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ font: '20px var(--serif)', margin: '0 0 10px', color: 'var(--ink)' }}>
              2. Tabel Ukuran Santri Mengaji TPQ / TPA
            </h3>
            <table className="spec-table" style={{ background: 'var(--wash)', borderRadius: 8 }}>
              <thead>
                <tr style={{ background: 'var(--paper-card)', fontWeight: 700 }}>
                  <td style={{ width: '22%' }}>Ukuran</td>
                  <td>Rentang Usia</td>
                  <td>Lebar Dada</td>
                  <td>Panjang Baju</td>
                  <td>Panjang Bawahan</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Anak S</strong></td>
                  <td>Usia 4 – 6 tahun</td>
                  <td>36 cm</td>
                  <td>48 cm</td>
                  <td>60 cm</td>
                </tr>
                <tr>
                  <td><strong>Anak M</strong></td>
                  <td>Usia 7 – 8 tahun</td>
                  <td>39 cm</td>
                  <td>52 cm</td>
                  <td>66 cm</td>
                </tr>
                <tr>
                  <td><strong>Anak L</strong></td>
                  <td>Usia 9 – 10 tahun</td>
                  <td>42 cm</td>
                  <td>56 cm</td>
                  <td>72 cm</td>
                </tr>
                <tr>
                  <td><strong>Anak XL</strong></td>
                  <td>Usia 11 – 12 tahun</td>
                  <td>45 cm</td>
                  <td>60 cm</td>
                  <td>78 cm</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ font: '20px var(--serif)', margin: '0 0 10px', color: 'var(--ink)' }}>
              3. Tabel Ukuran Madin Sirimbit Dewasa (Guru &amp; Wali Santri)
            </h3>
            <table className="spec-table" style={{ background: 'var(--wash)', borderRadius: 8 }}>
              <thead>
                <tr style={{ background: 'var(--paper-card)', fontWeight: 700 }}>
                  <td style={{ width: '22%' }}>Ukuran</td>
                  <td>Lingkar Dada (LD)</td>
                  <td>Panjang Koko / Gamis</td>
                  <td>Estimasi Berat Badan</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Dewasa S</strong></td>
                  <td>98 cm</td>
                  <td>72 cm / 135 cm</td>
                  <td>45 – 55 kg</td>
                </tr>
                <tr>
                  <td><strong>Dewasa M</strong></td>
                  <td>104 cm</td>
                  <td>75 cm / 138 cm</td>
                  <td>55 – 65 kg</td>
                </tr>
                <tr>
                  <td><strong>Dewasa L</strong></td>
                  <td>110 cm</td>
                  <td>78 cm / 140 cm</td>
                  <td>65 – 75 kg</td>
                </tr>
                <tr>
                  <td><strong>Dewasa XL</strong></td>
                  <td>118 cm</td>
                  <td>81 cm / 142 cm</td>
                  <td>75 – 88 kg</td>
                </tr>
              </tbody>
            </table>
          </section>

          {productsWithSizeGuides.length > 0 && (
            <section style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
              <h3 style={{ font: '20px var(--serif)', margin: '0 0 12px', color: 'var(--ink)' }}>
                Catatan Ukuran Khusus Produk Katalog
              </h3>
              {productsWithSizeGuides.map((p) => (
                <div key={p.id} style={{ marginBottom: 16, background: 'var(--wash)', padding: 12, borderRadius: 8 }}>
                  <strong style={{ fontSize: 14 }}>{p.name}</strong>
                  <pre style={{ margin: '6px 0 0', fontFamily: 'inherit', fontSize: 13, whiteSpace: 'pre-wrap', color: 'var(--ink-soft)' }}>
                    {p.size_guide}
                  </pre>
                </div>
              ))}
            </section>
          )}

          <div className="notice" style={{ marginTop: 20 }}>
            <strong>Tips Menentukan Ukuran:</strong> Apabila putra/putri berada di batas antara dua ukuran, kami sarankan memilih satu ukuran di atasnya (upsize) demi kenyamanan masa pertumbuhan anak selama tahun ajaran sekolah.
          </div>
        </div>
      </section>
    </div>
  );
};
