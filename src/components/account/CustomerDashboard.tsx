import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { supabase, formatRupiah, cleanPhoneNumber } from '../../lib/supabase';
import { Order } from '../../types';
import {
  ShoppingBag,
  ArrowLeft,
  LogOut,
  MessageCircle,
  Clock,
  CheckCircle2,
  Package,
  ArrowUpRight,
  User as UserIcon,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user, profile, navigateToView, showToast, storeSettings } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCustomerOrders = async () => {
    if (!supabase || !user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
    } catch (e) {
      console.warn('Error loading orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerOrders();
  }, [user?.id]);

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    showToast('Kamu sudah keluar akun.');
    navigateToView('store');
  };

  const cleanStoreWa = cleanPhoneNumber(storeSettings.contact_whatsapp);

  return (
    <div className="fullpage-dashboard">
      {/* Sidebar for Customer */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <div className="dashboard-brand-block">
            <span className="brand-title" style={{ fontSize: 18 }}>
              INABA<span>HIJAB</span>
            </span>
            <div className="dashboard-role-badge" style={{ background: '#eaf2e8', color: 'var(--olive)' }}>
              <span className="dashboard-role-dot" style={{ background: 'var(--olive)' }}></span> Akun Pelanggan
            </div>
          </div>
        </div>

        <nav className="dashboard-nav">
          <div className="dashboard-nav-group-label">AKUN SAYA</div>
          <button className="dashboard-nav-item active">
            <ShoppingBag size={18} className="dashboard-nav-icon" />
            <span className="dashboard-nav-label">Riwayat Pesanan</span>
            <span className="dashboard-nav-counter">{orders.length}</span>
          </button>

          {cleanStoreWa ? (
            <a
              href={`https://wa.me/${cleanStoreWa}?text=${encodeURIComponent('Halo Admin INABA HIJAB, saya ingin bertanya tentang pesanan/katalog.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="dashboard-nav-item"
            >
              <HelpCircle size={18} className="dashboard-nav-icon" />
              <span className="dashboard-nav-label">Bantuan &amp; Konsultasi</span>
              <ArrowUpRight size={13} style={{ marginLeft: 'auto', opacity: 0.6 }} />
            </a>
          ) : (
            <div className="dashboard-nav-item" aria-disabled="true">
              <HelpCircle size={18} className="dashboard-nav-icon" />
              <span className="dashboard-nav-label">Kontak bantuan belum tersedia</span>
            </div>
          )}
        </nav>

        <div className="dashboard-sidebar-footer">
          <button
            className="dashboard-nav-item return-btn"
            onClick={() => navigateToView('store')}
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Belanja Toko</span>
          </button>

          <div className="dashboard-user-card">
            <div className="dashboard-user-avatar">
              {(profile?.full_name || user?.email || 'P')[0].toUpperCase()}
            </div>
            <div className="dashboard-user-info">
              <strong>{profile?.full_name || user?.email?.split('@')[0]}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <button type="button" className="dashboard-logout-text-btn" onClick={handleSignOut}>
            <LogOut size={16} aria-hidden="true" /> Keluar akun
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-breadcrumbs">
            <span>Area Pelanggan</span>
            <span className="breadcrumb-separator">/</span>
            <strong>Riwayat Pesanan Saya</strong>
          </div>

          <div className="dashboard-topbar-actions">
            <button
              className="btn btn-sm btn-clay"
              onClick={() => navigateToView('store')}
            >
              <ShoppingBag size={14} /> Belanja Produk Lainnya
            </button>
          </div>
        </header>

        <div className="dashboard-content-area">
          <div className="dashboard-section-stack">
            {/* Greeting Card */}
            <div className="dashboard-welcome-banner">
              <div>
                <h2 className="serif" style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>
                  Selamat Datang, {profile?.full_name || user?.email?.split('@')[0]}
                </h2>
                <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: 14 }}>
                  Di sini Anda dapat melacak status pesanan busana muslim, seragam pre-order sekolah, dan menghubungi CS jika ada perubahan.
                </p>
              </div>
            </div>

            {/* Orders Stack */}
            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h3 className="serif" style={{ margin: 0, fontSize: 20 }}>Daftar Transaksi Pesanan</h3>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                    Total {orders.length} pesanan tercatat pada akun ini.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="dashboard-empty-state">
                  <Clock size={36} className="animate-spin" style={{ color: 'var(--muted)' }} />
                  <p>Memuat riwayat pesanan Anda...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="dashboard-empty-state">
                  <Package size={44} style={{ color: 'var(--muted)', opacity: 0.5 }} />
                  <h4 style={{ margin: '8px 0 4px', fontSize: 16 }}>Belum Ada Pesanan</h4>
                  <p style={{ margin: '0 0 16px', maxWidth: 360, fontSize: 13 }}>
                    Anda belum pernah melakukan pemesanan. Jelajahi katalog busana muslim dan seragam kami.
                  </p>
                  <button className="btn btn-clay" onClick={() => navigateToView('store')}>
                    Lihat Katalog Produk
                  </button>
                </div>
              ) : (
                <div className="dashboard-orders-stack">
                  {orders.map(order => {
                    const waOrderChat = cleanStoreWa ? `https://wa.me/${cleanStoreWa}?text=${encodeURIComponent(
                      `Halo CS INABA HIJAB, saya ingin menanyakan status pesanan saya #${order.id.slice(0, 8).toUpperCase()}.`
                    )}` : '';

                    return (
                      <div key={order.id} className="dashboard-order-card">
                        <div className="order-card-top">
                          <div>
                            <div className="order-id-badge">
                              PESANAN #{order.id.slice(0, 8).toUpperCase()}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                              Waktu Pesan: {new Date(order.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </div>
                          </div>

                          <div className="order-price-block">
                            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Total Pembayaran</span>
                            <strong className="order-total-price tabular-nums">
                              {formatRupiah(order.subtotal)}
                            </strong>
                          </div>
                        </div>

                        {/* Status Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 10px' }}>
                          <span className={`status-badge status-${order.status || 'pending'}`}>
                            Status: {order.status || 'Menunggu Pembayaran'}
                          </span>
                          <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                            Pengiriman: {order.shipping_pref === 'pickup' ? 'Ambil di Tempat' : 'Kirim Ekspedisi/Kurir'}
                          </span>
                        </div>

                        {/* Address and Student Info */}
                        <div className="order-address-box">
                          <div><strong>Alamat Tujuan:</strong> {order.address}</div>
                          {order.student_notes && (
                            <div style={{ marginTop: 4, color: 'var(--olive-dark)' }}>
                              <strong>Catatan Seragam Sekolah:</strong> {order.student_notes}
                            </div>
                          )}
                        </div>

                        {/* Action WhatsApp */}
                        <div className="order-card-bottom" style={{ justifyContent: 'flex-end' }}>
                          <a
                            href={waOrderChat}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-ghost wa-btn"
                          >
                            <MessageCircle size={15} /> Hubungi CS perihal Pesanan Ini <ArrowUpRight size={13} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
