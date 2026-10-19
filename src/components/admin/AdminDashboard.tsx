import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { supabase, formatRupiah, cleanPhoneNumber } from '../../lib/supabase';
import { Product, Category, Order } from '../../types';
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Settings,
  Mail,
  RefreshCw,
  LogOut,
  ArrowLeft,
  ArrowUpRight,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  MessageCircle,
  Menu,
  X,
  ExternalLink,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Download
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    navigateToView,
    user,
    profile,
    showToast,
    refreshProducts,
    storeSettings,
    products: contextProducts,
    categories: contextCategories
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'settings' | 'newsletter'>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Admin dataset states
  const [adminProducts, setAdminProducts] = useState<Product[]>(contextProducts);
  const [adminCategories, setAdminCategories] = useState<Category[]>(contextCategories);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminNewsletter, setAdminNewsletter] = useState<Array<{ email: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(false);

  // Search & Filters in Tabs
  const [productSearch, setProductSearch] = useState('');
  const [productFilterType, setProductFilterType] = useState<'all' | 'ready' | 'po'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Product editor state
  const [showProductEditor, setShowProductEditor] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    category: '',
    price: 100000,
    stock: 10,
    is_preorder: false,
    preorder_status: 'open' as 'open' | 'closed' | 'completed',
    school_institution: '',
    estimated_delivery: '14 hari kerja',
    min_order: 1,
    description: '',
    variants: 'S | M | L | XL',
    size_guide: '',
    badge: ''
  });

  // Category editor state
  const [showCatEditor, setShowCatEditor] = useState(false);
  const [catForm, setCatForm] = useState({
    name: '',
    icon: 'package',
    description: '',
    display_order: 1
  });

  // Settings editor
  const [waInput, setWaInput] = useState(storeSettings.contact_whatsapp);
  const [paymentsInput, setPaymentsInput] = useState(
    (storeSettings.payment_accounts || []).map(p => `${p.label} | ${p.detail}`).join('\n')
  );

  const loadAdminData = async () => {
    setLoading(true);
    if (!supabase) {
      setAdminProducts(contextProducts);
      setAdminCategories(contextCategories);
      setLoading(false);
      return;
    }
    try {
      const [pRes, cRes, oRes, nRes] = await Promise.allSettled([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('display_order', { ascending: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('newsletter_subscribers').select('email, created_at').order('created_at', { ascending: false })
      ]);

      if (pRes.status === 'fulfilled' && pRes.value.data) setAdminProducts(pRes.value.data);
      else setAdminProducts(contextProducts);

      if (cRes.status === 'fulfilled' && cRes.value.data) setAdminCategories(cRes.value.data);
      else setAdminCategories(contextCategories);

      if (oRes.status === 'fulfilled' && oRes.value.data) setAdminOrders(oRes.value.data);
      if (nRes.status === 'fulfilled' && nRes.value.data) setAdminNewsletter(nRes.value.data);
    } catch (e) {
      console.warn('Error loading admin data', e);
      setAdminProducts(contextProducts);
      setAdminCategories(contextCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    showToast('Kamu sudah keluar akun admin.');
    navigateToView('store');
  };

  // Product CRUD
  const openNewProductForm = () => {
    setEditingProduct(null);
    setProdForm({
      name: '',
      category: adminCategories[0]?.name || 'Hijab & Pakaian',
      price: 125000,
      stock: 15,
      is_preorder: false,
      preorder_status: 'open',
      school_institution: '',
      estimated_delivery: '14 hari kerja',
      min_order: 1,
      description: '',
      variants: 'S | M | L | XL',
      size_guide: '',
      badge: ''
    });
    setShowProductEditor(true);
  };

  const openEditProductForm = (p: Product) => {
    setEditingProduct(p);
    setProdForm({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock || 0,
      is_preorder: Boolean(p.is_preorder),
      preorder_status: p.preorder_status || 'open',
      school_institution: p.school_institution || '',
      estimated_delivery: p.estimated_delivery || '',
      min_order: p.min_order || 1,
      description: p.description || '',
      variants: Array.isArray(p.variants) ? p.variants.join(' | ') : '',
      size_guide: p.size_guide || '',
      badge: p.badge || ''
    });
    setShowProductEditor(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name.trim()) {
      showToast('Nama produk wajib diisi.');
      return;
    }
    const variantsArray = prodForm.variants.split(/[|\r\n]+/).map(v => v.trim()).filter(Boolean);
    const slug = prodForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + (editingProduct ? '' : '-' + Date.now().toString(36));

    const payload: Partial<Product> = {
      name: prodForm.name.trim(),
      slug: editingProduct?.slug || slug,
      category: prodForm.category,
      price: Number(prodForm.price) || 0,
      stock: prodForm.is_preorder ? 0 : Number(prodForm.stock) || 0,
      is_preorder: prodForm.is_preorder,
      preorder_status: prodForm.is_preorder ? prodForm.preorder_status : 'open',
      school_institution: prodForm.is_preorder ? prodForm.school_institution : '',
      estimated_delivery: prodForm.is_preorder ? prodForm.estimated_delivery : '',
      min_order: prodForm.is_preorder ? Number(prodForm.min_order) || 1 : 1,
      description: prodForm.description.trim(),
      variants: variantsArray.length ? variantsArray : ['Standar'],
      size_guide: prodForm.size_guide.trim(),
      badge: prodForm.badge.trim() || null,
      is_active: editingProduct ? editingProduct.is_active : true
    };

    if (supabase) {
      try {
        if (editingProduct) {
          await supabase.from('products').update(payload).eq('id', editingProduct.id);
        } else {
          await supabase.from('products').insert(payload);
        }
        showToast('Produk berhasil disimpan ke database!');
      } catch (err: any) {
        showToast('Gagal simpan produk: ' + (err?.message || 'Error'));
      }
    } else {
      showToast('Produk tersimpan di katalog lokal.');
    }

    setShowProductEditor(false);
    loadAdminData();
    refreshProducts();
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Hapus produk "${name}" secara permanen?`)) return;
    if (supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
    showToast('Produk berhasil dihapus.');
    loadAdminData();
    refreshProducts();
  };

  const handleToggleProduct = async (p: Product) => {
    if (supabase) {
      await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id);
    }
    showToast(`Status "${p.name}" diperbarui.`);
    loadAdminData();
    refreshProducts();
  };

  // Category Handlers
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;
    const slug = catForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const payload = {
      name: catForm.name.trim(),
      slug,
      icon: catForm.icon,
      description: catForm.description.trim(),
      display_order: Number(catForm.display_order) || 1,
      is_active: true
    };

    if (supabase) {
      try {
        await supabase.from('categories').insert(payload);
        showToast('Kategori baru berhasil ditambahkan!');
      } catch (err: any) {
        showToast('Gagal simpan kategori: ' + err.message);
      }
    }
    setShowCatEditor(false);
    loadAdminData();
    refreshProducts();
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    if (supabase) {
      await supabase.from('orders').update({ status }).eq('id', orderId);
      showToast('Status pesanan berhasil diperbarui.');
      loadAdminData();
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWa = cleanPhoneNumber(waInput);
    const paymentLines = paymentsInput.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const payments = paymentLines.map(l => {
      const parts = l.split('|');
      return {
        label: (parts.shift() || '').trim(),
        detail: parts.join('|').trim()
      };
    }).filter(p => p.label && p.detail);

    if (supabase) {
      try {
        await supabase.from('store_settings').upsert([
          { key: 'contact_whatsapp', value: cleanWa },
          { key: 'payment_accounts', value: payments }
        ]);
        showToast('Pengaturan toko berhasil disimpan ke database!');
      } catch (err: any) {
        showToast('Gagal simpan pengaturan: ' + err.message);
      }
    } else {
      showToast('Pengaturan toko diperbarui.');
    }
    refreshProducts();
  };

  // Export Newsletter CSV
  const handleExportCsv = () => {
    const sanitizeCsv = (val: any) => {
      let str = String(val ?? '');
      if (/^[=+\-@\t\r]/.test(str)) str = "'" + str;
      return `"${str.replace(/"/g, '""')}"`;
    };
    const rows = [['Email Pelanggan', 'Tanggal Terdaftar'], ...adminNewsletter.map(n => [n.email, n.created_at])];
    const csvContent = rows.map(r => r.map(sanitizeCsv).join(',')).join('\r\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inaba-newsletter-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File CSV berhasil diekspor.');
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return adminProducts.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(productSearch.toLowerCase());
      if (!matchSearch) return false;
      if (productFilterType === 'ready') return !p.is_preorder;
      if (productFilterType === 'po') return Boolean(p.is_preorder);
      return true;
    });
  }, [adminProducts, productSearch, productFilterType]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return adminOrders.filter(o => {
      const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      if (!matchStatus) return false;
      if (!orderSearch.trim()) return true;
      const term = orderSearch.toLowerCase();
      return o.id.toLowerCase().includes(term) ||
             (o.customer_name || '').toLowerCase().includes(term) ||
             (o.phone || '').includes(term);
    });
  }, [adminOrders, orderStatusFilter, orderSearch]);

  const navItems = [
    { id: 'overview', label: 'Ringkasan & Metrik', icon: LayoutDashboard, count: null },
    { id: 'products', label: 'Katalog Produk', icon: Package, count: adminProducts.length },
    { id: 'categories', label: 'Kategori Toko', icon: Tag, count: adminCategories.length },
    { id: 'orders', label: 'Pesanan Masuk', icon: ShoppingBag, count: adminOrders.length },
    { id: 'settings', label: 'Pengaturan Toko', icon: Settings, count: null },
    { id: 'newsletter', label: 'Email Newsletter', icon: Mail, count: adminNewsletter.length },
  ] as const;

  return (
    <div className="fullpage-dashboard">
      {/* Mobile Header Bar */}
      <div className="dashboard-mobile-header">
        <button
          className="dashboard-icon-btn"
          onClick={() => setMobileSidebarOpen(prev => !prev)}
          aria-label="Menu Admin"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="dashboard-mobile-title">
          <strong>INABA HIJAB</strong>
          <span>Admin Workspace</span>
        </div>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => navigateToView('store')}
          title="Ke Toko"
        >
          <ExternalLink size={15} />
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileSidebarOpen && (
        <div
          className="dashboard-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`dashboard-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="dashboard-sidebar-header">
          <div className="dashboard-brand-block">
            <span className="brand-title" style={{ fontSize: 18 }}>
              INABA<span>HIJAB</span>
            </span>
            <div className="dashboard-role-badge">
              <span className="dashboard-role-dot"></span> Admin Toko
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="dashboard-nav">
          <div className="dashboard-nav-group-label">MENU UTAMA</div>
          {navItems.map(item => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`dashboard-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
              >
                <IconComponent size={18} className="dashboard-nav-icon" />
                <span className="dashboard-nav-label">{item.label}</span>
                {item.count !== null && (
                  <span className="dashboard-nav-counter">{item.count}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="dashboard-sidebar-footer">
          <button
            className="dashboard-nav-item return-btn"
            onClick={() => navigateToView('store')}
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Beranda Toko</span>
          </button>

          <div className="dashboard-user-card">
            <div className="dashboard-user-avatar">
              {(profile?.full_name || user?.email || 'A')[0].toUpperCase()}
            </div>
            <div className="dashboard-user-info">
              <strong>{profile?.full_name || 'Admin'}</strong>
              <span>{user?.email || 'admin@inabahijab.com'}</span>
            </div>
            <button
              className="dashboard-logout-btn"
              onClick={handleSignOut}
              title="Keluar Akun"
              aria-label="Keluar Akun"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Canvas */}
      <main className="dashboard-main">
        {/* Top Breadcrumb Bar */}
        <header className="dashboard-topbar">
          <div className="dashboard-breadcrumbs">
            <span>INABA Admin</span>
            <span className="breadcrumb-separator">/</span>
            <strong>
              {navItems.find(n => n.id === activeTab)?.label}
            </strong>
          </div>

          <div className="dashboard-topbar-actions">
            <button
              className="btn btn-sm btn-ghost"
              onClick={loadAdminData}
              disabled={loading}
              title="Segarkan data terbaru"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden-sm">Segarkan</span>
            </button>

            {activeTab === 'products' && (
              <button className="btn btn-sm btn-clay" onClick={openNewProductForm}>
                <Plus size={15} /> Tambah Produk
              </button>
            )}

            {activeTab === 'categories' && (
              <button className="btn btn-sm btn-clay" onClick={() => setShowCatEditor(true)}>
                <Plus size={15} /> Tambah Kategori
              </button>
            )}

            {activeTab === 'newsletter' && (
              <button
                className="btn btn-sm btn-ghost"
                onClick={handleExportCsv}
                disabled={adminNewsletter.length === 0}
              >
                <Download size={14} /> Ekspor CSV
              </button>
            )}

            <button
              className="btn btn-sm btn-ghost"
              onClick={() => navigateToView('store')}
            >
              <ExternalLink size={14} /> <span className="hidden-sm">Buka Toko</span>
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="dashboard-content-area">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="dashboard-section-stack">
              <div className="dashboard-welcome-banner">
                <div>
                  <h2 className="serif" style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>
                    Selamat Datang di Panel Pengelola, {profile?.full_name || 'Admin'}
                  </h2>
                  <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: 14 }}>
                    Kelola ketersediaan busana muslim, seragam pesanan khusus (PO), antrean pesanan, dan integrasi WhatsApp toko Anda.
                  </p>
                </div>
                <div className="banner-quick-actions">
                  <button className="btn btn-sm btn-clay" onClick={openNewProductForm}>
                    <Plus size={14} /> Tambah Produk Baru
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => setActiveTab('orders')}>
                    Lihat Semua Pesanan
                  </button>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="dashboard-kpi-grid">
                <div className="dashboard-kpi-card">
                  <div className="kpi-icon-wrap" style={{ background: '#f5eee6', color: 'var(--clay)' }}>
                    <Package size={22} />
                  </div>
                  <div>
                    <span className="kpi-value tabular-nums">{adminProducts.length}</span>
                    <span className="kpi-label">Total Produk di Katalog</span>
                  </div>
                </div>

                <div className="dashboard-kpi-card">
                  <div className="kpi-icon-wrap" style={{ background: '#eaf2e8', color: 'var(--olive)' }}>
                    <ShoppingBag size={22} />
                  </div>
                  <div>
                    <span className="kpi-value tabular-nums">{adminOrders.length}</span>
                    <span className="kpi-label">Pesanan Masuk</span>
                  </div>
                </div>

                <div className="dashboard-kpi-card">
                  <div className="kpi-icon-wrap" style={{ background: '#fdf4db', color: '#b5851b' }}>
                    <Tag size={22} />
                  </div>
                  <div>
                    <span className="kpi-value tabular-nums">{adminCategories.length}</span>
                    <span className="kpi-label">Kategori Toko</span>
                  </div>
                </div>

                <div className="dashboard-kpi-card">
                  <div className="kpi-icon-wrap" style={{ background: '#f1edf7', color: 'var(--berry)' }}>
                    <Mail size={22} />
                  </div>
                  <div>
                    <span className="kpi-value tabular-nums">{adminNewsletter.length}</span>
                    <span className="kpi-label">Pelanggan Newsletter</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h3 className="serif" style={{ margin: 0, fontSize: 20 }}>Pesanan Terbaru</h3>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                      Daftar transaksi belanja terbaru yang membutuhkan penanganan.
                    </p>
                  </div>
                  <button className="btn btn-sm btn-ghost" onClick={() => setActiveTab('orders')}>
                    Lihat Semua ({adminOrders.length})
                  </button>
                </div>

                {adminOrders.length === 0 ? (
                  <div className="dashboard-empty-state">
                    <ShoppingBag size={36} style={{ color: 'var(--muted)', opacity: 0.6 }} />
                    <p>Belum ada pesanan yang masuk ke toko.</p>
                  </div>
                ) : (
                  <div className="dashboard-table-container">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>KODE PESANAN</th>
                          <th>PELANGGAN</th>
                          <th>TANGGAL</th>
                          <th>TOTAL BELANJA</th>
                          <th>STATUS</th>
                          <th style={{ textAlign: 'right' }}>AKSI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminOrders.slice(0, 6).map(order => {
                          const cleanPhone = cleanPhoneNumber(order.phone);
                          const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                            `Halo ${order.customer_name}, kami dari INABA HIJAB menindaklanjuti pesanan #${order.id.slice(0, 8).toUpperCase()}.`
                          )}`;
                          return (
                            <tr key={order.id}>
                              <td>
                                <strong className="tabular-nums">#{order.id.slice(0, 8).toUpperCase()}</strong>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{order.phone}</div>
                              </td>
                              <td style={{ fontSize: 13, color: 'var(--muted)' }}>
                                {new Date(order.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </td>
                              <td>
                                <strong className="tabular-nums" style={{ color: 'var(--clay)' }}>
                                  {formatRupiah(order.subtotal)}
                                </strong>
                              </td>
                              <td>
                                <span className={`status-badge status-${order.status || 'pending'}`}>
                                  {order.status || 'pending'}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-ghost"
                                  title="Chat WhatsApp Pelanggan"
                                >
                                  <MessageCircle size={14} /> Chat WA
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="dashboard-section-stack">
              {/* Product Editor Modal / Box */}
              {showProductEditor && (
                <div className="dashboard-panel dashboard-form-panel">
                  <div className="dashboard-panel-header">
                    <div>
                      <h3 className="serif" style={{ margin: 0, fontSize: 22 }}>
                        {editingProduct ? `Edit: ${editingProduct.name}` : 'Tambah Produk Baru'}
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                        Lengkapi detail produk busana muslim atau seragam pre-order.
                      </p>
                    </div>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => setShowProductEditor(false)}
                      type="button"
                    >
                      <X size={16} /> Batal
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} style={{ marginTop: 16 }}>
                    <div className="form-grid">
                      <div className="field">
                        <label>Nama Produk *</label>
                        <input
                          type="text"
                          value={prodForm.name}
                          onChange={(e) => setProdForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Contoh: Gamis Katun Madinah Premium"
                          required
                        />
                      </div>
                      <div className="field">
                        <label>Kategori Produk *</label>
                        <select
                          value={prodForm.category}
                          onChange={(e) => setProdForm(prev => ({ ...prev, category: e.target.value }))}
                        >
                          {adminCategories.map(c => (
                            <option key={c.slug} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="field">
                        <label>Harga Satuan (IDR) *</label>
                        <input
                          type="number"
                          min="0"
                          value={prodForm.price}
                          onChange={(e) => setProdForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                          required
                        />
                      </div>
                      <div className="field">
                        <label>Stok Ready (Diabaikan jika Pre-Order)</label>
                        <input
                          type="number"
                          min="0"
                          value={prodForm.stock}
                          onChange={(e) => setProdForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                          disabled={prodForm.is_preorder}
                        />
                      </div>
                    </div>

                    {/* Pre-Order Toggle Card */}
                    <div className="field" style={{ background: '#fff', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--line)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer', margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={prodForm.is_preorder}
                          onChange={(e) => setProdForm(prev => ({ ...prev, is_preorder: e.target.checked }))}
                          style={{ width: 18, height: 18 }}
                        />
                        <div>
                          <strong>Produk Sistem PRE-ORDER (Khusus Seragam Sekolah / Rombongan)</strong>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                            Aktifkan fitur ini untuk membuka form pemesanan custom lembaga/sekolah dan panduan ukuran.
                          </div>
                        </div>
                      </label>
                    </div>

                    {prodForm.is_preorder && (
                      <div style={{ padding: 18, background: '#fcfaf4', borderRadius: 10, marginBottom: 16, border: '1px dashed var(--clay)' }}>
                        <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: 'var(--clay)' }}>
                          Pengaturan Khusus Pre-Order Seragam
                        </h4>
                        <div className="form-grid">
                          <div className="field">
                            <label>Nama Lembaga / Sekolah</label>
                            <input
                              type="text"
                              value={prodForm.school_institution}
                              onChange={(e) => setProdForm(prev => ({ ...prev, school_institution: e.target.value }))}
                              placeholder="Contoh: SDIT Al-Hidayah / Santri Madin"
                            />
                          </div>
                          <div className="field">
                            <label>Status Batch Pre-Order</label>
                            <select
                              value={prodForm.preorder_status}
                              onChange={(e) => setProdForm(prev => ({ ...prev, preorder_status: e.target.value as any }))}
                            >
                              <option value="open">Dibuka (Menerima Pesanan)</option>
                              <option value="closed">Ditutup Sementara</option>
                              <option value="completed">Selesai Produksi</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-grid">
                          <div className="field">
                            <label>Estimasi Masa Pengerjaan</label>
                            <input
                              type="text"
                              value={prodForm.estimated_delivery}
                              onChange={(e) => setProdForm(prev => ({ ...prev, estimated_delivery: e.target.value }))}
                              placeholder="Contoh: 14–21 hari kerja"
                            />
                          </div>
                          <div className="field">
                            <label>Minimal Pemesanan (Pcs)</label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={prodForm.min_order}
                              onChange={(e) => setProdForm(prev => ({ ...prev, min_order: Number(e.target.value) }))}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="form-grid">
                      <div className="field">
                        <label>Pilihan Ukuran / Varian (Pisahkan dengan tanda pipa | )</label>
                        <input
                          type="text"
                          value={prodForm.variants}
                          onChange={(e) => setProdForm(prev => ({ ...prev, variants: e.target.value }))}
                          placeholder="S | M | L | XL | XXL"
                        />
                      </div>
                      <div className="field">
                        <label>Badge Sorotan (Opsional)</label>
                        <input
                          type="text"
                          value={prodForm.badge}
                          onChange={(e) => setProdForm(prev => ({ ...prev, badge: e.target.value }))}
                          placeholder="Contoh: Best Seller / Pilihan Santri"
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label>Deskripsi &amp; Spesifikasi Produk</label>
                      <textarea
                        value={prodForm.description}
                        onChange={(e) => setProdForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        placeholder="Keterangan bahan kain, jahitan rapi, kenyamanan harian..."
                      />
                    </div>

                    <div className="field">
                      <label>Catatan Panduan Ukuran (Opsional)</label>
                      <input
                        type="text"
                        value={prodForm.size_guide}
                        onChange={(e) => setProdForm(prev => ({ ...prev, size_guide: e.target.value }))}
                        placeholder="Contoh: Ukuran M: LD 100cm, PB 135cm | L: LD 106cm, PB 138cm"
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                      <button className="btn btn-clay" type="submit">
                        Simpan Produk ke Katalog
                      </button>
                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={() => setShowProductEditor(false)}
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Product Toolbar */}
              <div className="dashboard-toolbar">
                <div className="dashboard-search-wrap">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Cari nama produk atau kategori..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  {productSearch && (
                    <button className="clear-btn" onClick={() => setProductSearch('')}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="dashboard-filter-tabs">
                  <button
                    className={`filter-tab ${productFilterType === 'all' ? 'active' : ''}`}
                    onClick={() => setProductFilterType('all')}
                  >
                    Semua ({adminProducts.length})
                  </button>
                  <button
                    className={`filter-tab ${productFilterType === 'ready' ? 'active' : ''}`}
                    onClick={() => setProductFilterType('ready')}
                  >
                    Ready Stock ({adminProducts.filter(p => !p.is_preorder).length})
                  </button>
                  <button
                    className={`filter-tab ${productFilterType === 'po' ? 'active' : ''}`}
                    onClick={() => setProductFilterType('po')}
                  >
                    Pre-Order ({adminProducts.filter(p => p.is_preorder).length})
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="dashboard-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="dashboard-table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>NAMA PRODUK</th>
                        <th>KATEGORI</th>
                        <th>HARGA</th>
                        <th>STATUS STOK / PO</th>
                        <th>STATUS TAMPIL</th>
                        <th style={{ textAlign: 'right' }}>PILIHAN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--muted)' }}>
                            Tidak ada produk yang cocok dengan pencarian.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map(p => (
                          <tr key={p.id}>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{p.name}</div>
                              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                                {p.badge && <span style={{ color: 'var(--clay)', fontWeight: 600 }}>[{p.badge}] </span>}
                                {Array.isArray(p.variants) ? p.variants.join(', ') : 'Standar'}
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{p.category}</span>
                            </td>
                            <td>
                              <strong className="tabular-nums" style={{ color: 'var(--clay)' }}>
                                {formatRupiah(p.price)}
                              </strong>
                            </td>
                            <td>
                              {p.is_preorder ? (
                                <span className="status-badge status-po">
                                  PO · {p.school_institution || 'Seragam'}
                                </span>
                              ) : (
                                <span className="status-badge status-ready">
                                  Ready: {p.stock ?? 0} pcs
                                </span>
                              )}
                            </td>
                            <td>
                              <button
                                className={`status-toggle-btn ${p.is_active ? 'active' : 'inactive'}`}
                                onClick={() => handleToggleProduct(p)}
                                title={p.is_active ? 'Klik untuk sembunyikan' : 'Klik untuk tampilkan'}
                              >
                                {p.is_active ? (
                                  <>
                                    <Eye size={13} /> Aktif
                                  </>
                                ) : (
                                  <>
                                    <EyeOff size={13} /> Disembunyikan
                                  </>
                                )}
                              </button>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: 6 }}>
                                <button
                                  className="btn btn-sm btn-ghost"
                                  onClick={() => openEditProductForm(p)}
                                  title="Edit Produk"
                                >
                                  <Edit size={14} /> Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-ghost"
                                  style={{ color: 'var(--clay)' }}
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  title="Hapus Produk"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="dashboard-section-stack">
              {showCatEditor && (
                <div className="dashboard-panel dashboard-form-panel">
                  <div className="dashboard-panel-header">
                    <div>
                      <h3 className="serif" style={{ margin: 0, fontSize: 22 }}>Tambah Kategori Produk</h3>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                        Kategori memudahkan pelanggan menelusuri busana muslim, seragam, atau perabot.
                      </p>
                    </div>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => setShowCatEditor(false)}
                      type="button"
                    >
                      <X size={16} /> Batal
                    </button>
                  </div>

                  <form onSubmit={handleSaveCategory} style={{ marginTop: 16 }}>
                    <div className="form-grid">
                      <div className="field">
                        <label>Nama Kategori *</label>
                        <input
                          type="text"
                          value={catForm.name}
                          onChange={(e) => setCatForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Contoh: Mukena &amp; Sajadah"
                          required
                        />
                      </div>
                      <div className="field">
                        <label>Pilihan Ikon Navigasi</label>
                        <select
                          value={catForm.icon}
                          onChange={(e) => setCatForm(prev => ({ ...prev, icon: e.target.value }))}
                        >
                          <option value="sparkles">Sparkles (Busana &amp; Hijab)</option>
                          <option value="graduation-cap">Topi Toga (Seragam Sekolah PO)</option>
                          <option value="sun">Matahari (Capel Petani)</option>
                          <option value="table">Meja (Meja Lipat Belajar)</option>
                          <option value="package">Paket (Umum)</option>
                        </select>
                      </div>
                    </div>
                    <div className="field">
                      <label>Deskripsi Singkat</label>
                      <input
                        type="text"
                        value={catForm.description}
                        onChange={(e) => setCatForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Penjelasan ringkas koleksi..."
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button className="btn btn-clay" type="submit">
                        Simpan Kategori Baru
                      </button>
                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={() => setShowCatEditor(false)}
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="dashboard-grid-cards">
                {adminCategories.map(cat => (
                  <div key={cat.slug} className="dashboard-category-card">
                    <div className="category-card-head">
                      <div className="category-icon-box">
                        <Tag size={20} />
                      </div>
                      <div>
                        <strong style={{ fontSize: 16 }}>{cat.name}</strong>
                        <span style={{ fontSize: 12, color: 'var(--muted)', display: 'block' }}>
                          slug: {cat.slug}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '12px 0 0' }}>
                      {cat.description || 'Tidak ada deskripsi.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'orders' && (
            <div className="dashboard-section-stack">
              {/* Order Toolbar */}
              <div className="dashboard-toolbar">
                <div className="dashboard-search-wrap">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Cari ID pesanan, nama pemesan, no WhatsApp..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                  {orderSearch && (
                    <button className="clear-btn" onClick={() => setOrderSearch('')}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="dashboard-filter-tabs">
                  <button
                    className={`filter-tab ${orderStatusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setOrderStatusFilter('all')}
                  >
                    Semua ({adminOrders.length})
                  </button>
                  <button
                    className={`filter-tab ${orderStatusFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setOrderStatusFilter('pending')}
                  >
                    Menunggu ({adminOrders.filter(o => o.status === 'pending').length})
                  </button>
                  <button
                    className={`filter-tab ${orderStatusFilter === 'processing' ? 'active' : ''}`}
                    onClick={() => setOrderStatusFilter('processing')}
                  >
                    Diproses / Jahit ({adminOrders.filter(o => o.status === 'processing').length})
                  </button>
                  <button
                    className={`filter-tab ${orderStatusFilter === 'completed' ? 'active' : ''}`}
                    onClick={() => setOrderStatusFilter('completed')}
                  >
                    Selesai ({adminOrders.filter(o => o.status === 'completed').length})
                  </button>
                </div>
              </div>

              {/* Orders List Cards */}
              {filteredOrders.length === 0 ? (
                <div className="dashboard-panel">
                  <div className="dashboard-empty-state">
                    <ShoppingBag size={40} style={{ color: 'var(--muted)', opacity: 0.5 }} />
                    <p>Tidak ada pesanan yang sesuai dengan filter.</p>
                  </div>
                </div>
              ) : (
                <div className="dashboard-orders-stack">
                  {filteredOrders.map(order => {
                    const cleanPhone = cleanPhoneNumber(order.phone);
                    const waChat = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      `Halo ${order.customer_name}, kami dari INABA HIJAB menindaklanjuti pesanan #${order.id.slice(0, 8).toUpperCase()}. Apakah ada yang ingin dikonsultasikan?`
                    )}`;

                    return (
                      <div key={order.id} className="dashboard-order-card">
                        <div className="order-card-top">
                          <div>
                            <div className="order-id-badge">
                              PESANAN #{order.id.slice(0, 8).toUpperCase()}
                            </div>
                            <h4 style={{ margin: '4px 0 2px', fontSize: 17, fontWeight: 700 }}>
                              {order.customer_name}
                            </h4>
                            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                              WhatsApp: <strong>{order.phone}</strong> &bull; Waktu: {new Date(order.created_at).toLocaleString('id-ID')}
                            </div>
                          </div>

                          <div className="order-price-block">
                            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Subtotal Belanja</span>
                            <strong className="order-total-price tabular-nums">
                              {formatRupiah(order.subtotal)}
                            </strong>
                          </div>
                        </div>

                        {/* Customer Address & Notes */}
                        <div className="order-address-box">
                          <div>
                            <strong>Alamat Pengiriman:</strong> {order.address}
                          </div>
                          {order.student_notes && (
                            <div style={{ marginTop: 4, color: 'var(--olive-dark)' }}>
                              <strong>Data Siswa/Lembaga PO:</strong> {order.student_notes}
                            </div>
                          )}
                          {order.notes && (
                            <div style={{ marginTop: 4, color: 'var(--muted)' }}>
                              <strong>Catatan Pembeli:</strong> {order.notes}
                            </div>
                          )}
                        </div>

                        {/* Order Items List */}
                        {Array.isArray(order.items) && order.items.length > 0 && (
                          <div className="order-items-preview">
                            <strong>Daftar Item ({order.items.length}):</strong>
                            <div className="order-items-tags">
                              {order.items.map((it: any, idx: number) => (
                                <span key={idx} className="order-item-tag">
                                  {it.name} ({it.size || 'Std'}) &times; {it.quantity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action controls */}
                        <div className="order-card-bottom">
                          <div className="order-status-controller">
                            <label style={{ fontSize: 13, fontWeight: 700 }}>
                              Ubah Status Pesanan:
                            </label>
                            <select
                              value={order.status || 'pending'}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="order-status-select"
                            >
                              <option value="pending">Menunggu Pembayaran</option>
                              <option value="confirmed">Dikonfirmasi (Lunas)</option>
                              <option value="processing">Sedang Diproses / Dijahit</option>
                              <option value="shipped">Sedang Dikirim Kurir</option>
                              <option value="completed">Selesai</option>
                              <option value="cancelled">Dibatalkan</option>
                            </select>
                          </div>

                          <div className="order-action-links">
                            <a
                              className="btn btn-sm btn-ghost wa-btn"
                              href={waChat}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle size={15} /> Chat WhatsApp Pelanggan <ArrowUpRight size={13} />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="dashboard-section-stack">
              <div className="dashboard-panel" style={{ maxWidth: 720 }}>
                <div className="dashboard-panel-header">
                  <div>
                    <h3 className="serif" style={{ margin: 0, fontSize: 22 }}>
                      Pengaturan Toko &amp; Pembayaran
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                      Konfigurasi nomor WhatsApp dan nomor rekening tujuan transfer saat checkout.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveSettings} style={{ marginTop: 20 }}>
                  <div className="field">
                    <label>Nomor WhatsApp Resmi Toko (Format Internasional: 62xxxxxxxxxx) *</label>
                    <input
                      type="text"
                      value={waInput}
                      onChange={(e) => setWaInput(e.target.value)}
                      placeholder="6285735144904"
                      required
                    />
                    <span className="field-hint">
                      Nomor ini menerima notifikasi rincian pesanan dan digunakan untuk tombol hubungi penjual.
                    </span>
                  </div>

                  <div className="field" style={{ marginTop: 18 }}>
                    <label>Daftar Rekening Bank Toko (Format: Nama Bank | Nomor &amp; Atas Nama)</label>
                    <textarea
                      value={paymentsInput}
                      onChange={(e) => setPaymentsInput(e.target.value)}
                      rows={5}
                      placeholder="Bank BCA | 8030-1234-56 a.n. INABA HIJAB&#10;Bank BRI | 0123-01-000123 a.n. INABA HIJAB"
                    />
                    <span className="field-hint">
                      Tuliskan satu rekening per baris, dipisahkan karakter pipa (|).
                    </span>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <button className="btn btn-clay" type="submit">
                      Simpan Pengaturan Toko
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 6: NEWSLETTER */}
          {activeTab === 'newsletter' && (
            <div className="dashboard-section-stack">
              <div className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h3 className="serif" style={{ margin: 0, fontSize: 22 }}>
                      Pelanggan Terdaftar Newsletter ({adminNewsletter.length})
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                      Daftar email calon pelanggan yang mendaftar update katalog dan promo.
                    </p>
                  </div>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={handleExportCsv}
                    disabled={adminNewsletter.length === 0}
                  >
                    <Download size={14} /> Unduh CSV
                  </button>
                </div>

                {adminNewsletter.length === 0 ? (
                  <div className="dashboard-empty-state">
                    <Mail size={36} style={{ color: 'var(--muted)', opacity: 0.5 }} />
                    <p>Belum ada pelanggan yang mendaftar newsletter.</p>
                  </div>
                ) : (
                  <div className="dashboard-table-container">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>NO</th>
                          <th>EMAIL PELANGGAN</th>
                          <th>TANGGAL TERDAFTAR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminNewsletter.map((subscriber, index) => (
                          <tr key={index}>
                            <td className="tabular-nums" style={{ width: 60, color: 'var(--muted)' }}>
                              {index + 1}
                            </td>
                            <td>
                              <strong>{subscriber.email}</strong>
                            </td>
                            <td style={{ color: 'var(--muted)', fontSize: 13 }}>
                              {new Date(subscriber.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
