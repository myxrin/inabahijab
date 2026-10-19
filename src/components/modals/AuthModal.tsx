import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { supabase } from '../../lib/supabase';
import { X, Eye, EyeOff } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { activeModal, closeModal, user, isAdmin, showToast, navigateToView } = useStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: 'normal' | 'error' | 'success'; text: string }>({
    type: 'normal',
    text: 'Masuk untuk menyimpan keranjang dan melihat riwayat pesanan.'
  });

  if (activeModal !== 'auth') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setNotice({ type: 'error', text: 'Periksa kembali alamat email.' });
      return;
    }
    if (password.length < 6) {
      setNotice({ type: 'error', text: 'Password minimal 6 karakter.' });
      return;
    }

    setLoading(true);
    try {
      if (!supabase) throw new Error('Koneksi Supabase belum dikonfigurasi. Akun tidak dapat diproses.');

      if (mode === 'signup') {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: fullName.trim() }
          }
        });
        if (signUpErr) throw signUpErr;
        if (data.session) {
          const { data: serverAdmin } = await supabase.rpc('is_admin');
          setNotice({ type: 'success', text: 'Akun berhasil dibuat.' });
          showToast('Akun berhasil dibuat.');
          closeModal({ restoreHistory: false });
          navigateToView(serverAdmin === true ? 'admin' : 'customer', serverAdmin === true);
        } else {
          setNotice({ type: 'success', text: 'Akun dibuat. Ikuti instruksi email Supabase jika konfirmasi diminta sebelum masuk.' });
          setMode('signin');
        }
      } else {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (signInErr) throw signInErr;
        const { data: serverAdmin, error: roleError } = await supabase.rpc('is_admin');
        if (roleError) throw roleError;
        setNotice({ type: 'success', text: 'Berhasil masuk.' });
        showToast('Berhasil masuk.');
        closeModal({ restoreHistory: false });
        navigateToView(serverAdmin === true ? 'admin' : 'customer', serverAdmin === true);
      }
    } catch (err: any) {
      setNotice({
        type: 'error',
        text: err?.message || 'Email atau password tidak sesuai. Coba lagi.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    showToast('Kamu sudah keluar akun.');
    closeModal({ restoreHistory: false });
    navigateToView('store');
  };

  return (
    <div className="overlay overlay-centered open" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      <section className="sheet sheet-centered auth-sheet">
        <div className="sheet-handle" aria-hidden="true"></div>
        <div className="sheet-head">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot"></span> INABA HIJAB</div>
            <h2 className="serif">{user ? 'Akun Saya' : 'Masuk atau daftar'}</h2>
          </div>
          <button className="close-btn" onClick={closeModal} aria-label="Tutup modal">
            <X size={20} />
          </button>
        </div>

        {user ? (
          <div>
            <div className="notice success">
              Kamu sudah masuk sebagai <strong>{user.email}</strong> ({isAdmin ? 'Admin Toko' : 'Pelanggan'}).
            </div>
            <div className="button-row auth-account-actions">
              <button
                className="btn btn-clay"
                onClick={() => {
                  closeModal({ restoreHistory: false });
                  navigateToView(isAdmin ? 'admin' : 'customer');
                }}
              >
                {isAdmin ? 'Buka Dashboard Admin' : 'Buka Akun Saya'}
              </button>
              <button className="btn btn-ghost" onClick={handleSignOut}>
                Keluar Akun
              </button>
            </div>
          </div>
        ) : (
          <div>
            {notice.type !== 'normal' && (
              <div className={`notice ${notice.type === 'error' ? 'error' : 'success'}`} role="status">
                {notice.text}
              </div>
            )}

            <div className="auth-mode-switch" role="group" aria-label="Pilih akses akun">
              <button
                type="button"
                className="auth-mode-btn"
                aria-pressed={mode === 'signin'}
                onClick={() => {
                  setMode('signin');
                  setNotice({ type: 'normal', text: 'Masuk untuk menyimpan keranjang dan melihat riwayat pesanan.' });
                }}
              >
                Masuk
              </button>
              <button
                type="button"
                className="auth-mode-btn"
                aria-pressed={mode === 'signup'}
                onClick={() => {
                  setMode('signup');
                  setNotice({ type: 'normal', text: 'Buat akun baru untuk kemudahan berbelanja dan melacak pesanan.' });
                }}
              >
                Daftar
              </button>
            </div>

            <form onSubmit={handleSubmit} autoComplete="on">
              {mode === 'signup' && (
                <div className="field auth-field">
                  <label htmlFor="authFullNameInput">Nama Lengkap</label>
                  <input
                    id="authFullNameInput"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama kamu"
                    required
                  />
                </div>
              )}

              <div className="field auth-field">
                <label htmlFor="authEmailInput">Alamat Email</label>
                <input
                  id="authEmailInput"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="field auth-field">
                <label htmlFor="authPasswordInput">Password</label>
                <div className="password-input-wrap">
                  <input
                    id="authPasswordInput"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(prev => !prev)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <span className="field-hint">Minimal 6 karakter.</span>
                )}
              </div>

              <div className="auth-submit-wrap">
                <button
                  type="submit"
                  className="btn btn-full btn-clay auth-submit"
                  disabled={loading}
                >
                  {loading ? 'Memproses…' : 'Lanjutkan'}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
};
