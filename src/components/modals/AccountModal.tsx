import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { supabase, formatRupiah, cleanPhoneNumber } from '../../lib/supabase';
import { Product, Category, Order } from '../../types';
import { X, Package, Tag, ShoppingBag, Image as ImageIcon, Settings, Mail, RefreshCw, LogOut, ArrowUpRight, MessageCircle } from 'lucide-react';

export const AccountModal: React.FC = () => {
  const { activeModal, closeModal, user, profile, isAdmin, showToast, refreshProducts, storeSettings, products: contextProducts, categories: contextCategories } = useStore();

  const [adminTab, setAdminTab] = useState<'products' | 'categories' | 'orders' | 'images' | 'settings' | 'newsletter'>('products');
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Admin state
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [adminCategories, setAdminCategories] = useState<Category[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminNewsletter, setAdminNewsletter] = useState<Array<{ email: string; created_at: string }>>([]);

  // Product editor state
  const [showProductEditor, setShowProductEditor] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    is_preorder: false,
    preorder_status: 'open' as 'open' | 'closed' | 'completed',
    school_institution: '',
    estimated_delivery: '',
    min_order: 1,
    description: '',
    variants: '',
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
    if (!supabase || !isAdmin) return;
    try {
      const [pRes, cRes, oRes, nRes] = await Promise.allSettled([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('display_order', { ascending: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(60),
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
    }
  };

  const loadCustomerData = async () => {
    if (!supabase || !user) return;
    setLoadingOrders(true);
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setCustomerOrders(data);
    } catch {
      setCustomerOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeModal === 'account') {
      if (isAdmin) {
        loadAdminData();
      } else {
        loadCustomerData();
      }
    }
  }, [activeModal, isAdmin, user]);

  if (activeModal !== 'account') return null;

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    showToast('Kamu sudah keluar akun.');
    closeModal();
  };

  // Product Form Handlers
  const openNewProductForm = () => {
    setEditingProduct(null);
    setProdForm({
      name: '',
      category: adminCategories[0]?.name || 'Hijab & Pakaian',
      price: 100000,
      stock: 10,
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
      showToast('Produk tersimpan di katalog.');
    }

    setShowProductEditor(false);
    loadAdminData();
    refreshProducts();
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Hapus produk "${name}"?`)) return;
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

  return (
    <div className="overlay open" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      <section className="sheet sheet-wide">
        <div className="sheet-handle" aria-hidden="true"></div>
        <div className="sheet-head">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot"></span> {isAdmin ? 'Panel Pengelola Toko' : 'Area Pelanggan'}
            </div>
            <h2 className="serif">{isAdmin ? 'Dashboard Admin INABA HIJAB' : 'Akun Saya'}</h2>
          </div>
          <button className="close-btn" onClick={closeModal} aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        {/* CUSTOMER VIEW */}
        {!isAdmin && (
          <div>
            <div className="notice success">
              Akses pelanggan terverifikasi: <strong>{user?.email}</strong>. Di sini Anda dapat memantau riwayat pesanan belanja Anda.
            </div>

            <div className="admin-item" style={{ padding: '16px 0' }}>
              <div>
                <strong style={{ fontSize: 16 }}>{profile?.full_name || user?.email}</strong>
                <span>{user?.email} &bull; Akun Pelanggan</span>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={handleSignOut}>
                <LogOut size={14} /> Keluar
              </button>
            </div>

            <h3 style={{ font: '24px var(--serif)', margin: '24px 0 12px' }}>Riwayat Pesanan</h3>
            {loadingOrders ? (
              <p className="field-hint">Memuat pesanan…</p>
            ) : customerOrders.length === 0 ? (
              <div className="admin-card" style={{ textAlign: 'center', padding: 24 }}>
                <p className="field-hint" style={{ margin: 0 }}>Belum ada pesanan yang tercatat untuk akun ini.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {customerOrders.map(o => (
                  <div key={o.id} className="admin-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>Order #{o.id.slice(0, 8).toUpperCase()}</strong>
                      <span className="product-badge-pill badge-preorder">{o.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13, color: 'var(--muted)' }}>
                      <span>{new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <strong style={{ color: 'var(--ink)', fontSize: 14 }}>{formatRupiah(o.subtotal)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADMIN VIEW */}
        {isAdmin && (
          <div>
            <div className="notice success" style={{ marginBottom: 16 }}>
              Admin Aktif: <strong>{user?.email}</strong>. Perubahan langsung tersimpan ke database server.
            </div>

            {/* Quick Stats Grid */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <span className="admin-stat-num">{adminProducts.length}</span>
                <span className="admin-stat-label">Total Produk</span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-num">{adminOrders.length}</span>
                <span className="admin-stat-label">Pesanan Masuk</span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-num">{adminCategories.length}</span>
                <span className="admin-stat-label">Kategori Toko</span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-num">{adminNewsletter.length}</span>
                <span className="admin-stat-label">Pendaftar Email</span>
              </div>
            </div>

            {/* Admin Tabs */}
            <div className="admin-tabs">
              <button
                type="button"
                className={`admin-tab ${adminTab === 'products' ? 'active' : ''}`}
                onClick={() => setAdminTab('products')}
              >
                <Package size={16} /> Produk ({adminProducts.length})
              </button>
              <button
                type="button"
                className={`admin-tab ${adminTab === 'categories' ? 'active' : ''}`}
                onClick={() => setAdminTab('categories')}
              >
                <Tag size={16} /> Kategori ({adminCategories.length})
              </button>
              <button
                type="button"
                className={`admin-tab ${adminTab === 'orders' ? 'active' : ''}`}
                onClick={() => setAdminTab('orders')}
              >
                <ShoppingBag size={16} /> Pesanan ({adminOrders.length})
              </button>
              <button
                type="button"
                className={`admin-tab ${adminTab === 'settings' ? 'active' : ''}`}
                onClick={() => setAdminTab('settings')}
              >
                <Settings size={16} /> Pengaturan Toko
              </button>
              <button
                type="button"
                className={`admin-tab ${adminTab === 'newsletter' ? 'active' : ''}`}
                onClick={() => setAdminTab('newsletter')}
              >
                <Mail size={16} /> Email ({adminNewsletter.length})
              </button>
            </div>

            {/* Tab 1: Products */}
            {adminTab === 'products' && (
              <div style={{ marginTop: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ font: '22px var(--serif)', margin: 0 }}>Katalog Produk Toko</h3>
                  <button className="btn btn-sm btn-clay" onClick={openNewProductForm}>
                    + Tambah Produk Baru
                  </button>
                </div>

                {/* Editor Box */}
                {showProductEditor && (
                  <div className="admin-card" style={{ background: 'var(--wash)', marginBottom: 20 }}>
                    <h4 style={{ font: '20px var(--serif)', margin: '0 0 14px' }}>
                      {editingProduct ? `Edit: ${editingProduct.name}` : 'Tambah Produk Baru'}
                    </h4>
                    <form onSubmit={handleSaveProduct}>
                      <div className="form-grid">
                        <div className="field">
                          <label>Nama Produk *</label>
                          <input
                            type="text"
                            value={prodForm.name}
                            onChange={(e) => setProdForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Contoh: Gamis Katun Madinah"
                            required
                          />
                        </div>
                        <div className="field">
                          <label>Kategori *</label>
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
                          <label>Harga (IDR) *</label>
                          <input
                            type="number"
                            min="0"
                            value={prodForm.price}
                            onChange={(e) => setProdForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                            required
                          />
                        </div>
                        <div className="field">
                          <label>Stok Ready (Bila Bukan Pre-Order)</label>
                          <input
                            type="number"
                            min="0"
                            value={prodForm.stock}
                            onChange={(e) => setProdForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                            disabled={prodForm.is_preorder}
                          />
                        </div>
                      </div>

                      <div className="field" style={{ background: '#fff', padding: 12, borderRadius: 8, border: '1px solid var(--line)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', margin: 0 }}>
                          <input
                            type="checkbox"
                            checked={prodForm.is_preorder}
                            onChange={(e) => setProdForm(prev => ({ ...prev, is_preorder: e.target.checked }))}
                            style={{ width: 'auto', minHeight: 'auto' }}
                          />
                          <strong>Produk ini adalah Sistem PRE-ORDER (Khusus Seragam dsb.)</strong>
                        </label>
                      </div>

                      {prodForm.is_preorder && (
                        <div style={{ padding: 12, background: '#f5f3ea', borderRadius: 8, marginBottom: 16, border: '1px dashed var(--clay)' }}>
                          <div className="form-grid">
                            <div className="field">
                              <label>Nama Lembaga / Sekolah</label>
                              <input
                                type="text"
                                value={prodForm.school_institution}
                                onChange={(e) => setProdForm(prev => ({ ...prev, school_institution: e.target.value }))}
                                placeholder="Contoh: SDIT Al-Hidayah / Santri TPQ"
                              />
                            </div>
                            <div className="field">
                              <label>Status Pre-Order</label>
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
                              <label>Estimasi Pengerjaan</label>
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
                                max="50"
                                value={prodForm.min_order}
                                onChange={(e) => setProdForm(prev => ({ ...prev, min_order: Number(e.target.value) }))}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="field">
                        <label>Pilihan Ukuran / Varian (Pisahkan dengan tanda | )</label>
                        <input
                          type="text"
                          value={prodForm.variants}
                          onChange={(e) => setProdForm(prev => ({ ...prev, variants: e.target.value }))}
                          placeholder="S | M | L | XL"
                        />
                      </div>

                      <div className="field">
                        <label>Deskripsi Produk</label>
                        <textarea
                          value={prodForm.description}
                          onChange={(e) => setProdForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Keterangan bahan, jahitan, kegunaan..."
                        />
                      </div>

                      <div className="button-row" style={{ marginTop: 14 }}>
                        <button className="btn btn-clay" type="submit">Simpan Produk</button>
                        <button className="btn btn-ghost" type="button" onClick={() => setShowProductEditor(false)}>Batal</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Products List */}
                <div style={{ display: 'grid', gap: 8 }}>
                  {adminProducts.map(p => (
                    <div key={p.id} className="admin-item">
                      <div style={{ minWidth: 0 }}>
                        <strong>{p.name}</strong>
                        <span>
                          {p.category} &bull; {formatRupiah(p.price)} &bull; {p.is_preorder ? 'PO' : `Stok: ${p.stock}`} &bull; {p.is_active ? 'Aktif' : 'Disembunyikan'}
                        </span>
                      </div>
                      <div className="button-row">
                        <button className="btn btn-sm btn-ghost" onClick={() => openEditProductForm(p)}>Edit</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => handleToggleProduct(p)}>
                          {p.is_active ? 'Sembunyikan' : 'Aktifkan'}
                        </button>
                        <button className="btn btn-sm btn-ghost" style={{ color: 'var(--clay)' }} onClick={() => handleDeleteProduct(p.id, p.name)}>
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Categories */}
            {adminTab === 'categories' && (
              <div style={{ marginTop: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ font: '22px var(--serif)', margin: 0 }}>Kelola Kategori Produk</h3>
                  <button className="btn btn-sm btn-clay" onClick={() => setShowCatEditor(true)}>
                    + Tambah Kategori
                  </button>
                </div>

                {showCatEditor && (
                  <div className="admin-card" style={{ background: 'var(--wash)', marginBottom: 20 }}>
                    <form onSubmit={handleSaveCategory}>
                      <div className="form-grid">
                        <div className="field">
                          <label>Nama Kategori *</label>
                          <input
                            type="text"
                            value={catForm.name}
                            onChange={(e) => setCatForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Contoh: Perlengkapan Ibadah"
                            required
                          />
                        </div>
                        <div className="field">
                          <label>Ikon</label>
                          <select
                            value={catForm.icon}
                            onChange={(e) => setCatForm(prev => ({ ...prev, icon: e.target.value }))}
                          >
                            <option value="sparkles">Sparkles / Busana</option>
                            <option value="graduation-cap">Topi Toga / Seragam</option>
                            <option value="sun">Matahari / Petani</option>
                            <option value="table">Meja / Perabot</option>
                            <option value="package">Paket / Umum</option>
                          </select>
                        </div>
                      </div>
                      <div className="field">
                        <label>Deskripsi Kategori</label>
                        <input
                          type="text"
                          value={catForm.description}
                          onChange={(e) => setCatForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Deskripsi singkat..."
                        />
                      </div>
                      <div className="button-row">
                        <button className="btn btn-clay" type="submit">Simpan Kategori</button>
                        <button className="btn btn-ghost" type="button" onClick={() => setShowCatEditor(false)}>Batal</button>
                      </div>
                    </form>
                  </div>
                )}

                <div style={{ display: 'grid', gap: 8 }}>
                  {adminCategories.map(c => (
                    <div key={c.slug} className="admin-item">
                      <div>
                        <strong>{c.name}</strong>
                        <span>Slug: {c.slug} &bull; Ikon: {c.icon || 'package'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Orders */}
            {adminTab === 'orders' && (
              <div style={{ marginTop: 18 }}>
                <h3 style={{ font: '22px var(--serif)', margin: '0 0 14px' }}>Daftar Pesanan Pelanggan</h3>
                {adminOrders.length === 0 ? (
                  <p className="field-hint">Belum ada pesanan yang masuk.</p>
                ) : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {adminOrders.map(o => {
                      const cleanPhone = cleanPhoneNumber(o.phone);
                      const waChat = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Halo ${o.customer_name}, kami dari INABA HIJAB menindaklanjuti pesanan #${o.id.slice(0, 8).toUpperCase()}.`)}`;
                      return (
                        <div key={o.id} className="admin-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                            <div>
                              <strong style={{ fontSize: 15 }}>#{o.id.slice(0, 8).toUpperCase()} &bull; {o.customer_name}</strong>
                              <span>WhatsApp: {o.phone} &bull; Waktu: {new Date(o.created_at).toLocaleString('id-ID')}</span>
                            </div>
                            <strong style={{ fontSize: 16, color: 'var(--clay)' }}>{formatRupiah(o.subtotal)}</strong>
                          </div>

                          <div style={{ background: 'var(--wash)', padding: '10px 12px', borderRadius: 6, margin: '12px 0', fontSize: 13, lineHeight: 1.6 }}>
                            <strong>Alamat:</strong> {o.address}<br />
                            {o.notes && <><strong>Catatan:</strong> {o.notes}</>}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                            <label style={{ fontSize: 13, fontWeight: 700 }}>
                              Status:
                              <select
                                value={o.status}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                style={{ marginLeft: 6, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--line)' }}
                              >
                                <option value="pending">Menunggu Pembayaran</option>
                                <option value="confirmed">Dikonfirmasi</option>
                                <option value="processing">Sedang Diproses/Jahit</option>
                                <option value="shipped">Sedang Dikirim</option>
                                <option value="completed">Selesai</option>
                                <option value="cancelled">Dibatalkan</option>
                              </select>
                            </label>

                            <a className="btn btn-sm btn-ghost" href={waChat} target="_blank" rel="noopener noreferrer">
                              <MessageCircle size={14} /> Chat WA Pelanggan <ArrowUpRight size={12} className="btn-arrow-icon" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Settings */}
            {adminTab === 'settings' && (
              <div style={{ marginTop: 18 }}>
                <h3 style={{ font: '22px var(--serif)', margin: '0 0 14px' }}>Pengaturan Kontak &amp; Rekening</h3>
                <form onSubmit={handleSaveSettings} className="admin-card">
                  <div className="field">
                    <label>Nomor WhatsApp Resmi Toko (Format: 62xxxxxxxxxx)</label>
                    <input
                      type="text"
                      value={waInput}
                      onChange={(e) => setWaInput(e.target.value)}
                      placeholder="6285735144904"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Rekening Bank &amp; Pembayaran (Format per baris: Nama Bank | Nomor &amp; Pemilik)</label>
                    <textarea
                      value={paymentsInput}
                      onChange={(e) => setPaymentsInput(e.target.value)}
                      style={{ minHeight: 110 }}
                      placeholder="Bank BCA | 8030-1234-56 a.n. INABA HIJAB"
                    />
                  </div>

                  <button className="btn btn-clay" type="submit">Simpan Pengaturan</button>
                </form>
              </div>
            )}

            {/* Tab 5: Newsletter */}
            {adminTab === 'newsletter' && (
              <div style={{ marginTop: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ font: '22px var(--serif)', margin: 0 }}>Pelanggan Newsletter ({adminNewsletter.length})</h3>
                  <button className="btn btn-sm btn-ghost" onClick={handleExportCsv} disabled={adminNewsletter.length === 0}>
                    Ekspor ke CSV <ArrowUpRight size={12} className="btn-arrow-icon" />
                  </button>
                </div>

                <div style={{ display: 'grid', gap: 6 }}>
                  {adminNewsletter.map((n, idx) => (
                    <div key={idx} className="admin-item">
                      <div>
                        <strong>{n.email}</strong>
                        <span>Terdaftar: {new Date(n.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="button-row" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
              <button className="btn btn-sm btn-ghost" onClick={loadAdminData}>
                <RefreshCw size={14} /> Segarkan Data
              </button>
              <button className="btn btn-sm btn-ghost" onClick={handleSignOut}>
                <LogOut size={14} /> Keluar Admin
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
