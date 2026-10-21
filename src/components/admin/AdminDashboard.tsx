import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { supabase, SUPABASE_URL, formatRupiah, cleanPhoneNumber, isProductStorageUrl, isSiteStorageUrl } from '../../lib/supabase';
import { Product, Category, Order } from '../../types';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Mail,
  TrendingUp,
  Settings,
  Search,
  Bell,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  Plus,
  MoreVertical,
  X,
  Menu,
  Check,
  ChevronDown,
  User as UserIcon,
  Phone,
  MapPin,
  ExternalLink,
  LogOut,
  Trash2,
  Edit,
  MessageCircle,
  Download
} from 'lucide-react';

type ProductEditorForm = {
  name: string;
  category: string;
  price: string;
  stock: string;
  is_active: boolean;
  description: string;
  image_url: string;
  gallery_urls: string[];
  colors: string;
  sizes: string;
  is_preorder: boolean;
  school_institution: string;
  estimated_delivery: string;
};

export const AdminDashboard: React.FC = () => {
  const {
    navigateToView,
    user,
    profile,
    showToast,
    saveProduct,
    deleteProductItem,
    storeSettings,
    siteImages,
    refreshProducts,
    isAdmin,
    updateOrderStatus
  } = useStore();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'orders' | 'customers' | 'newsletter' | 'reports' | 'settings'
  >('overview');

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Datasets
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [adminCategories, setAdminCategories] = useState<Category[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminCustomers, setAdminCustomers] = useState<Array<{ id: string; email: string; full_name: string; created_at?: string }>>([]);
  const [adminNewsletter, setAdminNewsletter] = useState<Array<{ email: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(false);

  // Admin information is always loaded from protected Supabase rows, never mock/demo arrays.
  useEffect(() => {
    const client = supabase;
    if (!client || !isAdmin) { setLoading(false); return; }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [productsResult, categoriesResult, ordersResult, newsletterResult, customersResult] = await Promise.all([
          client.from('products').select('*').order('created_at', { ascending: false }),
          client.from('categories').select('*').order('display_order', { ascending: true }),
          client.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
          client.from('newsletter_subscribers').select('email, created_at').order('created_at', { ascending: false }),
          client.from('profiles').select('id,email,full_name,created_at,role').order('created_at', { ascending: false })
        ]);
        const failed = [productsResult, categoriesResult, ordersResult, newsletterResult, customersResult].find(result => result.error);
        if (failed?.error) throw failed.error;
        if (cancelled) return;
        const allProducts = (productsResult.data || []).map((product: any) => {
          const imageUrl = isProductStorageUrl(product.image_url) ? product.image_url : null;
          const gallery = Array.isArray(product.gallery_urls) ? product.gallery_urls.filter(isProductStorageUrl).slice(0, 5) : [];
          return {
            ...product, image_url: imageUrl,
            gallery_urls: gallery.length ? gallery : (imageUrl ? [imageUrl] : []),
            variants: Array.isArray(product.variants) ? product.variants : []
          };
        }) as Product[];
        setAdminProducts(allProducts);
        setAdminCategories((categoriesResult.data || []) as Category[]);
        const profileMap = new Map((customersResult.data || []).map((profile: any) => [profile.id, profile]));
        setAdminOrders((ordersResult.data || []).map((order: any) => ({
          ...order, order_number: `#${String(order.id).slice(0, 8).toUpperCase()}`, total: Number(order.subtotal || 0),
          customer_email: profileMap.get(order.user_id)?.email || '', items: order.order_items || []
        })) as Order[]);
        setAdminNewsletter((newsletterResult.data || []) as Array<{ email: string; created_at: string }>);
        setAdminCustomers((customersResult.data || []).filter((profile: any) => profile.role !== 'admin') as any);
      } catch (error: any) {
        console.error('Gagal memuat data admin dari Supabase.', error);
        if (!cancelled) showToast(`Data admin gagal dimuat: ${error?.message || 'periksa izin Supabase'}`);
      } finally { if (!cancelled) setLoading(false); }
    };
    void load();
    return () => { cancelled = true; };
  }, [isAdmin, showToast]);

  // Global search in TopBar
  const [globalSearch, setGlobalSearch] = useState('');

  // Products Tab Filters
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('all');
  const [selectedProductStatus, setSelectedProductStatus] = useState<string>('all');

  // Orders Tab Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderTabFilter, setOrderTabFilter] = useState<string>('all');
  const [orderStatusDropdown, setOrderStatusDropdown] = useState<string>('all');

  // Product Editor Screen State (View 5: Desktop - Detail Produk Edit/Tambah)
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState<ProductEditorForm>({
    name: '',
    category: '',
    price: '',
    stock: '',
    is_active: true,
    description: '',
    image_url: '',
    gallery_urls: [],
    colors: '',
    sizes: '',
    is_preorder: false,
    school_institution: '',
    estimated_delivery: ''
  });
  const [savingProduct, setSavingProduct] = useState(false);

  // Order Detail Screen State (View 6: Desktop - Detail Pesanan)
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  // Settings
  const [waInput, setWaInput] = useState(storeSettings.contact_whatsapp || '');
  const [paymentsInput, setPaymentsInput] = useState(
    (storeSettings.payment_accounts || []).map(p => `${p.label} | ${p.detail}`).join('\n')
  );
  const [pendingImageFiles, setPendingImageFiles] = useState<File[]>([]);
  const [pendingImagePreviews, setPendingImagePreviews] = useState<string[]>([]);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(null);
  const [coverIsPending, setCoverIsPending] = useState(false);
  const [siteImageUploading, setSiteImageUploading] = useState<string | null>(null);


  useEffect(() => {
    const urls = pendingImageFiles.map(file => URL.createObjectURL(file));
    setPendingImagePreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [pendingImageFiles]);

  useEffect(() => {
    setWaInput(storeSettings.contact_whatsapp || '');
    setPaymentsInput((storeSettings.payment_accounts || []).map(p => `${p.label} | ${p.detail}`).join('\n'));
  }, [storeSettings.contact_whatsapp, storeSettings.payment_accounts]);

  // Active action menu row in product table
  const [actionMenuProductId, setActionMenuProductId] = useState<string | null>(null);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return adminProducts.filter(p => {
      const term = (productSearch || globalSearch).toLowerCase().trim();
      const matchSearch = !term || p.name.toLowerCase().includes(term) || (p.category || '').toLowerCase().includes(term);
      const matchCat = selectedProductCategory === 'all' || p.category === selectedProductCategory;
      const matchStatus =
        selectedProductStatus === 'all'
          ? true
          : selectedProductStatus === 'active'
          ? (p.is_active !== false && (p.stock === null || p.stock === undefined || p.stock > 0))
          : (p.is_active === false || p.stock === 0);
      return matchSearch && matchCat && matchStatus;
    });
  }, [adminProducts, productSearch, globalSearch, selectedProductCategory, selectedProductStatus]);

  // Order Counts for Tabs
  const orderCounts = useMemo(() => {
    const counts = {
      all: adminOrders.length,
      menunggu: 0,
      dikonfirmasi: 0,
      dikemas: 0,
      dikirim: 0,
      diterima: 0,
      dibatalkan: 0
    };
    adminOrders.forEach(o => {
      const s = (o.status || '').toLowerCase();
      if (s.includes('menunggu') || s.includes('pending') || s.includes('diproses')) counts.menunggu++;
      else if (s.includes('dikonfirmasi') || s.includes('confirmed')) counts.dikonfirmasi++;
      else if (s.includes('dikemas') || s.includes('processing')) counts.dikemas++;
      else if (s.includes('dikirim') || s.includes('shipped')) counts.dikirim++;
      else if (s.includes('diterima') || s.includes('completed')) counts.diterima++;
      else if (s.includes('batal') || s.includes('cancelled')) counts.dibatalkan++;
    });
    return counts;
  }, [adminOrders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return adminOrders.filter(o => {
      const term = (orderSearch || globalSearch).toLowerCase().trim();
      const matchSearch =
        !term ||
        (o.order_number || o.id).toLowerCase().includes(term) ||
        (o.customer_name || '').toLowerCase().includes(term) ||
        (o.phone || '').includes(term);

      // Status tab filter
      let matchTab = true;
      const s = (o.status || '').toLowerCase();
      if (orderTabFilter === 'menunggu') matchTab = s.includes('menunggu') || s.includes('pending') || s.includes('diproses');
      else if (orderTabFilter === 'dikonfirmasi') matchTab = s.includes('dikonfirmasi') || s.includes('confirmed');
      else if (orderTabFilter === 'dikemas') matchTab = s.includes('dikemas') || s.includes('processing');
      else if (orderTabFilter === 'dikirim') matchTab = s.includes('dikirim') || s.includes('shipped');
      else if (orderTabFilter === 'diterima') matchTab = s.includes('diterima') || s.includes('completed');
      else if (orderTabFilter === 'dibatalkan') matchTab = s.includes('batal') || s.includes('cancelled');

      // Dropdown filter
      let matchDropdown = true;
      if (orderStatusDropdown !== 'all') {
        const normalizeStatus = (value: string) => ({
          'menunggu': 'pending', 'menunggu diproses': 'pending', 'menunggu pembayaran': 'pending',
          'dikonfirmasi': 'confirmed', 'dikemas': 'processing', 'dikirim': 'shipped',
          'diterima': 'completed', 'dibatalkan': 'cancelled', 'batal': 'cancelled'
        } as Record<string, string>)[value.toLowerCase()] || value.toLowerCase();
        const actualStatus = normalizeStatus(o.status || '');
        const wantedStatus = normalizeStatus(orderStatusDropdown);
        matchDropdown = actualStatus === wantedStatus;
      }

      return matchSearch && matchTab && matchDropdown;
    });
  }, [adminOrders, orderSearch, globalSearch, orderTabFilter, orderStatusDropdown]);

  // Handlers for Products
  const handleOpenNewProduct = () => {
    setActiveTab('products');
    setEditingProduct(null);
    setPendingImageFiles([]);
    setSelectedPreviewUrl(null);
    setCoverIsPending(false);
    setProdForm({
      name: '',
      category: adminCategories.find(category => category.is_active !== false)?.name || '',
      price: '',
      stock: '',
      is_active: true,
      description: '',
      image_url: '',
      gallery_urls: [],
      colors: '',
      sizes: '',
      is_preorder: false,
      school_institution: '',
      estimated_delivery: ''
    });
    setIsEditingProduct(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setActiveTab('products');
    setEditingProduct(p);
    setPendingImageFiles([]);
    setSelectedPreviewUrl(p.image_url || null);
    setCoverIsPending(false);

    let initialColors = '';
    let initialSizes = '';

    if (p.specifications?.colors || p.specifications?.sizes) {
      initialColors = p.specifications?.colors || '';
      initialSizes = p.specifications?.sizes || '';
    } else if (Array.isArray(p.variants) && p.variants.length > 0) {
      const hasHyphen = p.variants.some(v => v.includes(' - '));
      if (hasHyphen) {
        const cSet = new Set<string>();
        const sSet = new Set<string>();
        p.variants.forEach(v => {
          const parts = v.split(' - ');
          if (parts[0]) cSet.add(parts[0].trim());
          if (parts[1]) sSet.add(parts[1].trim());
        });
        initialColors = Array.from(cSet).join(', ');
        initialSizes = Array.from(sSet).join(', ');
      } else {
        const standardSizes = new Set(['s', 'm', 'l', 'xl', 'xxl', 'xxxl', 'all size', 'allsize', 'standar', 'jumbo']);
        const isSizeOnly = p.variants.every(v => standardSizes.has(v.trim().toLowerCase()) || /^\d+$/.test(v.trim()));
        if (isSizeOnly) {
          initialSizes = p.variants.join(', ');
        } else {
          initialColors = p.variants.join(', ');
        }
      }
    }

    setProdForm({
      name: p.name,
      category: p.category || adminCategories.find(category => category.is_active !== false)?.name || '',
      price: String(p.price ?? 0),
      stock: String(p.stock ?? 0),
      is_active: p.is_active !== false,
      description: p.description || '',
      image_url: isProductStorageUrl(p.image_url) ? p.image_url : '',
      gallery_urls: Array.isArray(p.gallery_urls) ? p.gallery_urls.filter(isProductStorageUrl).slice(0, 5) : (isProductStorageUrl(p.image_url) ? [p.image_url] : []),
      colors: initialColors,
      sizes: initialSizes,
      is_preorder: Boolean(p.is_preorder),
      school_institution: p.school_institution || '',
      estimated_delivery: p.estimated_delivery || ''
    });
    setIsEditingProduct(true);
  };

  const allAvailablePhotos = useMemo(() => {
    return [...prodForm.gallery_urls, ...pendingImagePreviews];
  }, [prodForm.gallery_urls, pendingImagePreviews]);

  const mainDisplayUrl = useMemo(() => {
    if (selectedPreviewUrl && allAvailablePhotos.includes(selectedPreviewUrl)) {
      return selectedPreviewUrl;
    }
    if (coverIsPending && pendingImagePreviews[0]) {
      return pendingImagePreviews[0];
    }
    return prodForm.image_url || prodForm.gallery_urls[0] || pendingImagePreviews[0] || null;
  }, [selectedPreviewUrl, allAvailablePhotos, coverIsPending, prodForm.image_url, prodForm.gallery_urls, pendingImagePreviews]);

  const currentCoverUrl = useMemo(() => {
    if (coverIsPending && pendingImagePreviews[0]) {
      return pendingImagePreviews[0];
    }
    return prodForm.gallery_urls[0] || pendingImagePreviews[0] || null;
  }, [coverIsPending, pendingImagePreviews, prodForm.gallery_urls]);

  const handleSetCover = (targetUrl: string) => {
    if (!targetUrl) return;
    if (prodForm.gallery_urls.includes(targetUrl)) {
      setProdForm(prev => ({
        ...prev,
        image_url: targetUrl,
        gallery_urls: [targetUrl, ...prev.gallery_urls.filter(item => item !== targetUrl)]
      }));
      setCoverIsPending(false);
      setSelectedPreviewUrl(targetUrl);
      showToast('Foto sampul berhasil diatur.');
      return;
    }
    const pIdx = pendingImagePreviews.indexOf(targetUrl);
    if (pIdx !== -1) {
      setPendingImageFiles(prev => {
        const file = prev[pIdx];
        if (!file) return prev;
        return [file, ...prev.filter((_, i) => i !== pIdx)];
      });
      setCoverIsPending(true);
      setSelectedPreviewUrl(targetUrl);
      showToast('Foto baru ini diatur sebagai sampul utama.');
    }
  };

  const previewVariants = useMemo(() => {
    const parseList = (str: string) =>
      str.split(/[,|\r\n]+/).map(s => s.trim()).filter(Boolean);
    const colors = parseList(prodForm.colors);
    const sizes = parseList(prodForm.sizes);

    if (colors.length > 0 && sizes.length > 0) {
      const list: string[] = [];
      for (const c of colors) {
        for (const s of sizes) {
          list.push(`${c} - ${s}`);
        }
      }
      return list.slice(0, 100);
    }
    if (colors.length > 0) return colors.slice(0, 100);
    if (sizes.length > 0) return sizes.slice(0, 100);
    return [];
  }, [prodForm.colors, prodForm.sizes]);

  const handleSaveProductSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!supabase || !isAdmin || !user) {
      showToast('Sesi admin Supabase belum terverifikasi. Masuk kembali untuk melanjutkan.');
      return;
    }
    if (!prodForm.name.trim()) { showToast('Nama produk wajib diisi.'); return; }
    const priceValue = Number(prodForm.price);
    const stockValue = Number(prodForm.stock);
    if (!prodForm.price.trim() || !/^\d+$/.test(prodForm.price) || !Number.isSafeInteger(priceValue) || priceValue < 0 || priceValue > 100000000000) {
      showToast('Harga harus berupa angka bulat dari Rp0 sampai Rp100.000.000.000.');
      return;
    }
    if (!prodForm.is_preorder && (!prodForm.stock.trim() || !/^\d+$/.test(prodForm.stock) || !Number.isSafeInteger(stockValue) || stockValue < 0 || stockValue > 2147483647)) {
      showToast('Stok harus berupa angka bulat antara 0 dan 2.147.483.647.');
      return;
    }
    const variantsArray = previewVariants;
    if (!variantsArray.length) {
      showToast('Tambahkan minimal satu pilihan warna atau ukuran/size produk.');
      return;
    }
    if (prodForm.gallery_urls.length + pendingImageFiles.length < 1) { showToast('Tambahkan minimal satu foto produk.'); return; }
    if (prodForm.gallery_urls.length + pendingImageFiles.length > 5) { showToast('Maksimal lima foto untuk setiap produk.'); return; }

    const slugBase = prodForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'produk';
    const slug = editingProduct?.slug || `${slugBase}-${Date.now().toString(36)}`;
    setSavingProduct(true);
    const uploadedPaths: string[] = [];
    try {
      const uploadedUrls: string[] = [];
      for (const file of pendingImageFiles) {
        const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(-80) || 'foto.webp';
        const path = `${user.id}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file, {
          cacheControl: '3600', upsert: false, contentType: file.type
        });
        if (uploadError) throw uploadError;
        uploadedPaths.push(path);
        uploadedUrls.push(supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl);
      }
      const gallery = coverIsPending
        ? [...uploadedUrls, ...prodForm.gallery_urls].slice(0, 5)
        : [...prodForm.gallery_urls, ...uploadedUrls].slice(0, 5);
      const payload: Partial<Product> = {
        name: prodForm.name.trim(), slug, category: prodForm.category,
        price: priceValue,
        stock: prodForm.is_preorder ? 0 : stockValue,
        is_active: prodForm.is_active, description: prodForm.description.trim(),
        variants: variantsArray,
        specifications: {
          ...(editingProduct?.specifications || {}),
          colors: prodForm.colors.trim(),
          sizes: prodForm.sizes.trim()
        },
        image_url: gallery[0] || null, gallery_urls: gallery,
        is_preorder: prodForm.is_preorder, school_institution: prodForm.school_institution.trim(),
        estimated_delivery: prodForm.estimated_delivery.trim()
      };
      const res = await saveProduct(payload, editingProduct?.id);
      setAdminProducts(prev => res.product.is_active === false
        ? (editingProduct ? prev.map(p => p.id === res.product.id ? res.product : p) : prev)
        : [res.product, ...prev.filter(p => p.id !== res.product.id)]);
      setPendingImageFiles([]);
      setSelectedPreviewUrl(null);
      setCoverIsPending(false);
      showToast(editingProduct ? 'Perubahan produk tersimpan di Supabase.' : 'Produk baru tersimpan di Supabase.');
      setIsEditingProduct(false);
      setActiveTab('products');
    } catch (err: any) {
      if (uploadedPaths.length) {
        try { await supabase.storage.from('product-images').remove(uploadedPaths); } catch { /* orphan cleanup is best-effort */ }
      }
      showToast('Gagal menyimpan produk: ' + (err?.message || 'Periksa koneksi dan izin Supabase.'));
    } finally { setSavingProduct(false); }
  };

  const handleDeleteProduct = async (p: Product) => {
    if (!window.confirm(`Hapus produk "${p.name}" secara permanen? Produk yang dihapus tidak dapat dipulihkan.`)) return;
    try {
      await deleteProductItem(p.id);
      setAdminProducts(prev => prev.filter(item => item.id !== p.id));
      showToast(`Produk "${p.name}" berhasil dihapus.`);
      const allUrls = [p.image_url, ...(p.gallery_urls || [])].filter(Boolean) as string[];
      const storagePaths: string[] = [];
      for (const u of allUrls) {
        if (isProductStorageUrl(u)) {
          const match = u.split('/product-images/')[1];
          if (match) storagePaths.push(decodeURIComponent(match.split('?')[0]));
        }
      }
      if (storagePaths.length > 0 && supabase) {
        try { await supabase.storage.from('product-images').remove(storagePaths); } catch { /* best effort */ }
      }
      await refreshProducts();
    } catch (error: any) {
      showToast(`Produk gagal dihapus: ${error?.message || 'akses ditolak'}`);
    }
    setActionMenuProductId(null);
  };

  const handleDeleteCurrentEditing = async () => {
    if (!editingProduct) return;
    const prod = editingProduct;
    if (!window.confirm(`Hapus produk "${prod.name}" secara permanen? Produk yang dihapus tidak dapat dipulihkan.`)) return;
    try {
      setSavingProduct(true);
      await deleteProductItem(prod.id);
      setAdminProducts(prev => prev.filter(item => item.id !== prod.id));
      showToast(`Produk "${prod.name}" berhasil dihapus.`);
      const allUrls = [prod.image_url, ...(prod.gallery_urls || [])].filter(Boolean) as string[];
      const storagePaths: string[] = [];
      for (const u of allUrls) {
        if (isProductStorageUrl(u)) {
          const match = u.split('/product-images/')[1];
          if (match) storagePaths.push(decodeURIComponent(match.split('?')[0]));
        }
      }
      if (storagePaths.length > 0 && supabase) {
        try { await supabase.storage.from('product-images').remove(storagePaths); } catch { /* best effort */ }
      }
      await refreshProducts();
      setIsEditingProduct(false);
      setActiveTab('products');
    } catch (error: any) {
      showToast(`Produk gagal dihapus: ${error?.message || 'akses ditolak'}`);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleToggleProductStatus = async (p: Product) => {
    try {
      const result = await saveProduct({ ...p, is_active: !p.is_active }, p.id);
      setAdminProducts(prev => prev.map(item => item.id === p.id ? result.product : item));
      showToast(`Status produk diperbarui menjadi ${!p.is_active ? 'Aktif' : 'Nonaktif'}.`);
    } catch (error: any) {
      showToast(`Status produk gagal diperbarui: ${error?.message || 'akses ditolak'}`);
    }
    setActionMenuProductId(null);
  };

  // Status Badge Component matching reference pastel styling
  const renderStatusBadge = (statusStr: string, isProduct = false) => {
    const s = (statusStr || '').toLowerCase();
    if (isProduct) {
      if (s === 'aktif' || s === 'active' || statusStr === 'true') {
        return <span className="ref-status-badge status-aktif">Aktif</span>;
      }
      return <span className="ref-status-badge status-habis">Stok Habis</span>;
    }

    if (s.includes('menunggu diproses') || s.includes('diproses') || s.includes('pending')) {
      return <span className="ref-status-badge status-menunggu">Menunggu Diproses</span>;
    }
    if (s.includes('dikonfirmasi') || s.includes('confirmed')) {
      return <span className="ref-status-badge status-menunggu">Dikonfirmasi</span>;
    }
    if (s.includes('dikirim') || s.includes('shipped')) {
      return <span className="ref-status-badge status-dikirim">Dikirim</span>;
    }
    if (s.includes('dikemas') || s.includes('processing')) {
      return <span className="ref-status-badge status-dikemas">Dikemas</span>;
    }
    if (s.includes('diterima') || s.includes('completed')) {
      return <span className="ref-status-badge status-diterima">Diterima</span>;
    }
    if (s.includes('pembayaran')) {
      return <span className="ref-status-badge status-pembayaran">Menunggu Pembayaran</span>;
    }
    if (s.includes('batal') || s.includes('cancelled')) {
      return <span className="ref-status-badge status-batal">Dibatalkan</span>;
    }
    return <span className="ref-status-badge status-menunggu">{statusStr || 'Diproses'}</span>;
  };

  const handleStatusChange = async (newStatus: Order['status']) => {
    if (!selectedOrderForDetail) return;
    try {
      await updateOrderStatus(selectedOrderForDetail.id, newStatus);
      setSelectedOrderForDetail(prev => prev ? { ...prev, status: newStatus } : null);
      setAdminOrders(prev => prev.map(order => order.id === selectedOrderForDetail.id ? { ...order, status: newStatus } : order));
      setStatusMenuOpen(false);
    } catch (error: any) {
      showToast(`Status pesanan gagal diperbarui: ${error?.message || 'akses ditolak'}`);
    }
  };

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    showToast('Berhasil keluar dari sesi admin.');
    navigateToView('store');
  };

  // Export Newsletter CSV
  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Email,Tanggal Berlangganan', ...adminNewsletter.map(s => `"${s.email}","${new Date(s.created_at).toLocaleString('id-ID')}"`)].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inaba-subscribers-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV berhasil diunduh.');
  };

  // Save settings to the protected settings table and only report success after server confirmation.
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !isAdmin) { showToast('Akses admin terverifikasi diperlukan.'); return; }
    const cleanWa = cleanPhoneNumber(waInput);
    if (waInput.trim() && (cleanWa.length < 9 || cleanWa.length > 15)) {
      showToast('Nomor WhatsApp tidak valid. Gunakan kode negara, contoh 62812...'); return;
    }
    const parsedAccounts = paymentsInput.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
      const [label, ...rest] = line.split('|');
      return { label: label.trim(), detail: rest.join('|').trim() };
    }).filter(item => item.label && item.detail);
    try {
      const [waResult, paymentResult] = await Promise.all([
        supabase.from('store_settings').upsert({ key: 'contact_whatsapp', value: cleanWa }, { onConflict: 'key' }),
        supabase.from('store_settings').upsert({ key: 'payment_accounts', value: parsedAccounts }, { onConflict: 'key' })
      ]);
      if (waResult.error) throw waResult.error;
      if (paymentResult.error) throw paymentResult.error;
      showToast('Pengaturan toko berhasil disimpan ke Supabase.');
    } catch (error: any) {
      showToast(`Pengaturan gagal disimpan: ${error?.message || 'periksa izin Supabase'}`);
    }
  };

  const handleSaveSiteImage = async (key: string, label: string, file: File) => {
    if (!supabase || !isAdmin || !user) { showToast('Akses admin terverifikasi diperlukan.'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      showToast('Pilih foto JPG, PNG, atau WebP berukuran maksimal 5 MB.'); return;
    }
    setSiteImageUploading(key);
    const previousUrl = siteImages.find(image => image.key === key)?.image_url || '';
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(-80) || 'banner.webp';
    const path = `${user.id}/site/${key}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}-${safeName}`;
    try {
      const { error: uploadError } = await supabase.storage.from('site-images').upload(path, file, {
        cacheControl: '3600', upsert: false, contentType: file.type
      });
      if (uploadError) throw uploadError;
      const publicUrl = supabase.storage.from('site-images').getPublicUrl(path).data.publicUrl;
      const { error: saveError } = await supabase.from('site_images').upsert({
        key, label, image_url: publicUrl, updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
      if (saveError) {
        await supabase.storage.from('site-images').remove([path]);
        throw saveError;
      }
      const bucketPrefix = `${SUPABASE_URL}/storage/v1/object/public/site-images/`;
      if (isSiteStorageUrl(previousUrl)) {
        const previousPath = decodeURIComponent(previousUrl.slice(bucketPrefix.length));
        if (previousPath && previousPath !== path) {
          try { await supabase.storage.from('site-images').remove([previousPath]); } catch { /* A stale file can be cleaned later without blocking the saved banner. */ }
        }
      }
      try { await refreshProducts(); } catch (refreshError) { console.warn('Banner tersimpan, tetapi penyegaran tampilan gagal.', refreshError); }
      showToast(`${label} berhasil disimpan ke Supabase Storage.`);
    } catch (error: any) {
      showToast(`Gagal menyimpan ${label.toLowerCase()}: ${error?.message || 'periksa izin Supabase'}`);
    } finally {
      setSiteImageUploading(null);
    }
  };

  // 8 Navigation destinations from reference
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, count: null },
    { id: 'products', label: 'Produk', icon: Package, count: null },
    { id: 'categories', label: 'Kategori', icon: Layers, count: null },
    { id: 'orders', label: 'Pesanan', icon: ShoppingBag, count: orderCounts.menunggu },
    { id: 'customers', label: 'Pelanggan', icon: Users, count: null },
    { id: 'newsletter', label: 'Newsletter', icon: Mail, count: null },
    { id: 'reports', label: 'Laporan', icon: TrendingUp, count: null },
    { id: 'settings', label: 'Pengaturan', icon: Settings, count: null }
  ] as const;

  if (!isAdmin) {
    return (
      <main className="ref-admin-access-denied" role="alert">
        <div className="ref-card" style={{ maxWidth: 520, margin: '12vh auto', padding: 28, textAlign: 'center' }}>
          <h1>Akses admin tidak tersedia</h1>
          <p>Sesi ini belum diverifikasi sebagai admin oleh Supabase. Masuk dengan akun yang berwenang untuk membuka pengelolaan toko.</p>
          <button type="button" className="ref-btn-primary" onClick={() => navigateToView('store')}>Kembali ke toko</button>
        </div>
      </main>
    );
  }

  return (
    <div className="ref-admin-wrapper">
      {/* =========================================================================
          DESKTOP & MOBILE SIDEBAR
          ========================================================================= */}
      {mobileSidebarOpen && (
        <button type="button" className="ref-sidebar-backdrop" onClick={() => setMobileSidebarOpen(false)} aria-label="Tutup menu admin" />
      )}

      <aside className={`ref-sidebar ${mobileSidebarOpen ? 'open' : ''}`} aria-label="Menu admin">
        {/* Brand Wordmark & Leaf Icon */}
        <div className="ref-sidebar-brand">
          <div className="ref-brand-logo-wrap">
            <svg viewBox="0 0 24 24" className="ref-leaf-icon" fill="currentColor">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8Z" />
            </svg>
            <span className="ref-brand-text">INABA HIJAB</span>
          </div>
          <button className="ref-sidebar-close-mobile" onClick={() => setMobileSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="ref-sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !isEditingProduct && !selectedOrderForDetail;
            return (
              <button
                key={item.id}
                type="button"
                className={`ref-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsEditingProduct(false);
                  setSelectedOrderForDetail(null);
                  setMobileSidebarOpen(false);
                  window.scrollTo({ top: 0, behavior: 'auto' });
                }}
              >
                <div className="ref-nav-item-left">
                  <Icon size={18} className="ref-nav-icon" />
                  <span>{item.label}</span>
                </div>
                {item.count !== null && item.count > 0 && (
                  <span className="ref-nav-counter">{item.count}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Administrator Identity & Logout at Bottom */}
        <div className="ref-sidebar-footer">
          <div className="ref-admin-user-profile">
            <div className="ref-avatar-circle">{(profile?.full_name || user?.email || 'A').slice(0, 1).toUpperCase()}</div>
            <div className="ref-admin-user-details">
              <strong>Admin</strong>
              <span>{user?.email || 'Admin toko'}</span>
            </div>
          </div>
          <button
            type="button"
            className="ref-logout-text-btn"
            onClick={handleSignOut}
          >
            <LogOut size={16} aria-hidden="true" /> Keluar akun
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MAIN APPLICATION AREA
          ========================================================================= */}
      <div className="ref-main-container">
        {/* Top Header Bar */}
        <header className="ref-topbar">
          <div className="ref-topbar-left">
            <button
              type="button"
              className="ref-mobile-toggle-btn"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Buka Menu Sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Global Search Field from Reference */}
            <div className="ref-global-search">
              <Search size={16} className="ref-search-icon" />
              <input
                type="text"
                placeholder="Cari produk, pesanan, atau pelanggan..."
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
              />
              {globalSearch && (
                <button className="ref-search-clear" onClick={() => setGlobalSearch('')}>
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="ref-topbar-right">
            {/* View store shortcut */}
            <button
              type="button"
              className="ref-topbar-store-link"
              onClick={() => navigateToView('store')}
              title="Buka Toko INABA Hijab"
            >
              <ExternalLink size={15} />
              <span className="hidden-mobile">Lihat Toko</span>
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              className="ref-topbar-icon-btn"
              onClick={() => showToast('Semua pesanan baru dalam pemantauan real-time.')}
              aria-label="Notifikasi"
            >
              <Bell size={18} />
              <span className="ref-bell-dot" />
            </button>

            {/* Admin Avatar Circle */}
            <div className="ref-avatar-circle-top" title="Admin INABA">
              AD
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="ref-content-area">
          {/* =====================================================================
              VIEW 5: DESKTOP - DETAIL PRODUK (EDIT / TAMBAH)
              ===================================================================== */}
          {isEditingProduct ? (
            <div className="ref-detail-edit-product">
              {/* Top Header Row with Back, Title, Batal, Simpan */}
              <div className="ref-editor-header-row">
                <div className="ref-editor-title-wrap">
                  <button
                    type="button"
                    className="ref-back-icon-btn"
                    onClick={() => setIsEditingProduct(false)}
                    aria-label="Kembali ke Daftar Produk"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <h1 className="ref-page-title">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h1>
                </div>

                <div className="ref-editor-actions">
                  {editingProduct && (
                    <button
                      type="button"
                      className="ref-btn-danger-outline"
                      onClick={handleDeleteCurrentEditing}
                      disabled={savingProduct}
                      title="Hapus produk ini"
                    >
                      <Trash2 size={14} />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Two Column Layout matching reference */}
              <div className="ref-product-edit-grid">
                {/* Foto produk: file asli diunggah ke bucket Supabase, maksimal lima foto */}
                <div className="ref-product-edit-left">
                  <div className="ref-card ref-image-preview-card">
                    <div className="ref-main-image-wrap">
                      {mainDisplayUrl ? (
                        <>
                          <img src={mainDisplayUrl} alt="Preview produk" className="ref-main-preview-img" />
                          {mainDisplayUrl === currentCoverUrl ? (
                            <span className="ref-main-cover-badge">Foto Sampul</span>
                          ) : (
                            <button
                              type="button"
                              className="ref-set-cover-btn"
                              onClick={() => handleSetCover(mainDisplayUrl)}
                            >
                              Jadikan Foto Sampul
                            </button>
                          )}
                        </>
                      ) : (
                        <label
                          htmlFor="productImagesInput"
                          className="ref-main-preview-empty"
                          style={{ cursor: 'pointer' }}
                        >
                          <Package size={42} strokeWidth={1.3} />
                          <span>Foto produk belum ditambahkan</span>
                          <span className="ref-preview-upload-hint">+ Klik di sini untuk memilih foto</span>
                        </label>
                      )}
                    </div>

                    <div className="ref-thumbnails-row" aria-label="Galeri foto produk">
                      {prodForm.gallery_urls.map((url, idx) => (
                        <div key={url} className={`ref-thumbnail-slot ${mainDisplayUrl === url ? 'active' : ''}`}>
                          <button
                            type="button"
                            className="ref-thumb-select-btn"
                            onClick={() => setSelectedPreviewUrl(url)}
                            aria-label={`Pilih foto ${idx + 1}`}
                          >
                            <img src={url} alt={`Foto produk ${idx + 1}`} />
                            {url === currentCoverUrl && <span className="ref-cover-badge">Sampul</span>}
                          </button>
                          <button
                            type="button"
                            aria-label={`Hapus foto ${idx + 1}`}
                            className="ref-thumb-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedPreviewUrl === url) setSelectedPreviewUrl(null);
                              setProdForm(prev => {
                                const next = prev.gallery_urls.filter(item => item !== url);
                                return { ...prev, gallery_urls: next, image_url: next[0] || '' };
                              });
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}

                      {pendingImagePreviews.map((url, idx) => (
                        <div key={`${pendingImageFiles[idx]?.name}-${idx}`} className={`ref-thumbnail-slot ${mainDisplayUrl === url ? 'active' : ''}`}>
                          <button
                            type="button"
                            className="ref-thumb-select-btn"
                            onClick={() => setSelectedPreviewUrl(url)}
                            aria-label={`Lihat foto baru ${idx + 1}`}
                          >
                            <img src={url} alt={`Foto baru ${idx + 1}`} />
                            {url === currentCoverUrl && <span className="ref-cover-badge">Sampul</span>}
                          </button>
                          <button
                            type="button"
                            aria-label={`Batalkan foto baru ${idx + 1}`}
                            className="ref-thumb-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedPreviewUrl === url) setSelectedPreviewUrl(null);
                              setPendingImageFiles(prev => prev.filter((_, index) => index !== idx));
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="ref-change-image-control">
                      <label htmlFor="productImagesInput" className="ref-btn-outline full-width" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                        <Plus size={15} /> Tambah Foto ({prodForm.gallery_urls.length + pendingImageFiles.length}/5)
                      </label>
                      <input
                        id="productImagesInput"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        style={{ display: 'none' }}
                        onChange={event => {
                          const files = Array.from(event.currentTarget.files || []);
                          event.currentTarget.value = '';
                          const available = Math.max(0, 5 - prodForm.gallery_urls.length - pendingImageFiles.length);
                          const valid = files.filter(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 5 * 1024 * 1024);
                          if (valid.length !== files.length) showToast('Foto harus berformat JPG, PNG atau WebP dengan ukuran maksimal 5 MB per file.');
                          if (files.length > available) showToast('Maksimal lima foto per produk. Foto tambahan dilewati.');
                          setPendingImageFiles(prev => [...prev, ...valid.slice(0, available)]);
                        }}
                      />
                      <p className="field-hint" style={{ marginTop: 8 }}>Unggah 1–5 foto JPG, PNG, atau WebP. Maksimal 5 MB per foto. File akan disimpan ke Supabase Storage; tautan gambar luar tidak digunakan.</p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Clean Form Fields */}
                <div className="ref-product-edit-right">
                  <div className="ref-card ref-form-card">
                    <form onSubmit={handleSaveProductSubmit} className="ref-product-form">
                      {/* Nama Produk */}
                      <div className="ref-form-group">
                        <label className="ref-form-label">Nama Produk</label>
                        <input
                          type="text"
                          className="ref-form-input"
                          value={prodForm.name}
                          onChange={e => setProdForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Pashmina Ceruty Premium"
                          required
                        />
                      </div>

                      {/* Kategori & Stok */}
                      <div className="ref-form-row-2">
                        <div className="ref-form-group">
                          <label className="ref-form-label">Kategori</label>
                          <select
                            className="ref-form-select"
                            value={prodForm.category}
                            onChange={e => setProdForm(prev => ({ ...prev, category: e.target.value }))}
                            required
                          >
                            <option value="">Pilih kategori</option>
                            {adminCategories.map(category => (
                              <option key={category.id} value={category.name}>{category.name}{category.is_active === false ? ' (Nonaktif)' : ''}</option>
                            ))}
                          </select>
                        </div>

                        <div className="ref-form-group">
                          <label className="ref-form-label">Stok</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete="off"
                            className="ref-form-input tabular-nums"
                            value={prodForm.stock}
                            aria-describedby="product-stock-help"
                            placeholder="Contoh: 25"
                            onChange={e => setProdForm(prev => ({ ...prev, stock: e.target.value.replace(/\D/g, '') }))}
                          />
                          <p id="product-stock-help" className="ref-field-help">Jumlah unit tersedia, pakai angka saja.</p>
                        </div>
                      </div>

                      {/* Harga & Status */}
                      <div className="ref-form-row-2">
                        <div className="ref-form-group">
                          <label className="ref-form-label">Harga (IDR)</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete="off"
                            className="ref-form-input tabular-nums"
                            value={prodForm.price}
                            aria-describedby="product-price-help"
                            placeholder="Contoh: 75000"
                            onChange={e => setProdForm(prev => ({ ...prev, price: e.target.value.replace(/\D/g, '') }))}
                            required
                          />
                          <p id="product-price-help" className="ref-field-help">Angka tanpa titik. Tampilan harga: {prodForm.price.trim() ? formatRupiah(Number(prodForm.price)) : 'belum diisi'}.</p>
                        </div>

                        <div className="ref-form-group">
                          <label className="ref-form-label">Status Ketersediaan</label>
                          <select
                            className="ref-form-select"
                            value={prodForm.is_active ? 'active' : 'inactive'}
                            onChange={e => setProdForm(prev => ({ ...prev, is_active: e.target.value === 'active' }))}
                          >
                            <option value="active">Aktif (Tersedia)</option>
                            <option value="inactive">Stok Habis / Nonaktif</option>
                          </select>
                        </div>
                      </div>

                      {/* Varian: Warna dan Ukuran dibedakan dalam 2 kolom terpisah */}
                      <div className="ref-form-row-2">
                        <div className="ref-form-group">
                          <label className="ref-form-label">Pilihan Warna</label>
                          <input
                            type="text"
                            className="ref-form-input"
                            value={prodForm.colors}
                            onChange={e => setProdForm(prev => ({ ...prev, colors: e.target.value }))}
                            placeholder="Contoh: Cream, Mocca, Sage, Hitam, Milo"
                          />
                          <p className="ref-field-help">Pisahkan dengan koma (,) atau garis (|). Kosongkan jika tanpa variasi warna.</p>
                        </div>

                        <div className="ref-form-group">
                          <label className="ref-form-label">Pilihan Ukuran / Size</label>
                          <input
                            type="text"
                            className="ref-form-input"
                            value={prodForm.sizes}
                            onChange={e => setProdForm(prev => ({ ...prev, sizes: e.target.value }))}
                            placeholder="Contoh: S, M, L, XL atau All Size"
                          />
                          <p className="ref-field-help">Pisahkan dengan koma (,) atau garis (|). Kosongkan jika All Size tanpa pilihan ukuran.</p>
                        </div>
                      </div>

                      {previewVariants.length > 0 && (
                        <div className="ref-variants-preview-box">
                          <span className="ref-variants-preview-label">
                            Pratinjau Varian yang Terbentuk ({previewVariants.length} varian):
                          </span>
                          <div className="ref-variants-chips-preview">
                            {previewVariants.map((v, i) => (
                              <span key={i} className="ref-variant-chip">{v}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Deskripsi */}
                      <div className="ref-form-group">
                        <label className="ref-form-label">Deskripsi</label>
                        <textarea
                          className="ref-form-textarea"
                          rows={5}
                          value={prodForm.description}
                          onChange={e => setProdForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Pashmina ceruty premium dengan bahan yang ringan, adem, dan mudah dibentuk. Cocok untuk segala aktivitas, baik formal maupun kasual."
                        />
                      </div>

                      {/* Bottom Form Actions */}
                      <div className="ref-form-actions-bottom" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #E8E5DE', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="submit"
                          className="ref-btn-primary"
                          disabled={savingProduct}
                          style={{ minWidth: 160, justifyContent: 'center' }}
                        >
                          <Check size={16} />
                          <span>{savingProduct ? 'Menyimpan...' : (editingProduct ? 'Simpan Perubahan' : 'Simpan Produk')}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedOrderForDetail ? (
            /* ===================================================================
               VIEW 6: DESKTOP - DETAIL PESANAN
               =================================================================== */
            <div className="ref-detail-order-view">
              {/* Header with Back Arrow, Title, Status changer */}
              <div className="ref-order-header-row">
                <div className="ref-order-title-wrap">
                  <button
                    type="button"
                    className="ref-back-icon-btn"
                    onClick={() => setSelectedOrderForDetail(null)}
                    aria-label="Kembali ke Daftar Pesanan"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <h1 className="ref-page-title">
                        Detail Pesanan {selectedOrderForDetail.order_number || selectedOrderForDetail.id}
                      </h1>
                      {renderStatusBadge(selectedOrderForDetail.status)}
                    </div>
                    <span className="ref-order-subtext">
                      Diproses pada {new Date(selectedOrderForDetail.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="ref-order-header-actions" style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="ref-btn-primary ref-status-change-btn"
                    onClick={() => setStatusMenuOpen(prev => !prev)}
                  >
                    <span>Ubah Status</span>
                    <ChevronDown size={15} />
                  </button>

                  {statusMenuOpen && (
                    <div className="ref-dropdown-menu">
                      <button type="button" onClick={() => handleStatusChange('pending')}>
                        Menunggu Diproses
                      </button>
                      <button type="button" onClick={() => handleStatusChange('confirmed')}>
                        Dikonfirmasi
                      </button>
                      <button type="button" onClick={() => handleStatusChange('processing')}>
                        Dikemas
                      </button>
                      <button type="button" onClick={() => handleStatusChange('shipped')}>
                        Dikirim
                      </button>
                      <button type="button" onClick={() => handleStatusChange('completed')}>
                        Diterima
                      </button>
                      <button type="button" onClick={() => handleStatusChange('cancelled')}>
                        Dibatalkan
                      </button>
                    </div>
                  )}

                  {/* WhatsApp Follow-up button */}
                  {selectedOrderForDetail.phone && (
                    <a
                      href={`https://wa.me/${cleanPhoneNumber(selectedOrderForDetail.phone)}?text=${encodeURIComponent(
                        `Halo ${selectedOrderForDetail.customer_name}, kami dari INABA HIJAB menindaklanjuti pesanan Anda #${selectedOrderForDetail.order_number || selectedOrderForDetail.id}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ref-btn-secondary"
                      title="Hubungi Pelanggan via WhatsApp"
                    >
                      <MessageCircle size={15} />
                      <span className="hidden-mobile">Chat WA</span>
                    </a>
                  )}
                </div>
              </div>

              {/* 2-Column composition matching reference */}
              <div className="ref-order-detail-grid">
                {/* Left Column: Customer Info & Shipping Address */}
                <div className="ref-order-left-column">
                  {/* Card 1: Informasi Pelanggan */}
                  <div className="ref-card ref-info-card">
                    <h3 className="ref-card-heading">Informasi Pelanggan</h3>
                    <div className="ref-info-item">
                      <UserIcon size={16} className="ref-info-icon" />
                      <div>
                        <strong>{selectedOrderForDetail.customer_name}</strong>
                      </div>
                    </div>
                    <div className="ref-info-item">
                      <Mail size={16} className="ref-info-icon" />
                      <div>
                        <span>{selectedOrderForDetail.customer_email || 'Email belum tersedia'}</span>
                      </div>
                    </div>
                    <div className="ref-info-item">
                      <Phone size={16} className="ref-info-icon" />
                      <div>
                        <span className="tabular-nums">{selectedOrderForDetail.phone || 'Nomor telepon belum tersedia'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Alamat Pengiriman */}
                  <div className="ref-card ref-info-card" style={{ marginTop: 18 }}>
                    <h3 className="ref-card-heading">Alamat Pengiriman</h3>
                    <div className="ref-info-item">
                      <MapPin size={16} className="ref-info-icon" style={{ marginTop: 2 }} />
                      <div style={{ whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                        {selectedOrderForDetail.address || 'Alamat pengiriman belum tersedia'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Ordered Products, Subtotal, Ongkir, Total */}
                <div className="ref-order-right-column">
                  <div className="ref-card ref-products-breakdown-card">
                    <h3 className="ref-card-heading">Produk</h3>

                    <div className="ref-order-items-list">
                      {(selectedOrderForDetail.items || []).map((item, i) => (
                        <div key={i} className="ref-order-item-row">
                          {item.image_url ? <img src={item.image_url} alt={item.product_name} className="ref-item-thumb" /> : <div className="ref-item-thumb ref-admin-order-placeholder" aria-hidden="true"><Package size={16} /></div>}
                          <div className="ref-item-desc">
                            <strong>{item.product_name}</strong>
                            <span>
                              {item.quantity} x {formatRupiah(item.unit_price)}
                            </span>
                          </div>
                          <div className="ref-item-total tabular-nums">
                            {formatRupiah(item.quantity * item.unit_price)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="ref-breakdown-divider" />

                    <div className="ref-calc-row">
                      <span>Subtotal</span>
                      <span className="tabular-nums">
                        {formatRupiah(Number(selectedOrderForDetail.subtotal || 0))}
                      </span>
                    </div>

                    <div className="ref-calc-row">
                      <span>Ongkir</span>
                      <span className="tabular-nums">
                        Belum ditentukan
                      </span>
                    </div>

                    <div className="ref-breakdown-divider" />

                    <div className="ref-calc-total-row">
                      <strong>Total</strong>
                      <strong className="tabular-nums">
                        {formatRupiah(Number(selectedOrderForDetail.total ?? selectedOrderForDetail.subtotal ?? 0))}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'overview' ? (
            /* ===================================================================
               VIEW 1 & 2: DASHBOARD (ADMIN) - DESKTOP & MOBILE
               =================================================================== */
            <div className="ref-dashboard-view">
              {/* Welcome Section */}
              <div className="ref-welcome-row">
                <div>
                  <h1 className="ref-welcome-heading">Selamat datang, Admin</h1>
                  <p className="ref-welcome-sub">Berikut ringkasan aktivitas toko hari ini.</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div className="ref-date-badge">
                    <Calendar size={15} className="ref-date-icon" />
                    <span>
                      {new Date().toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="ref-btn-primary"
                    onClick={handleOpenNewProduct}
                    style={{ padding: '7px 13px', fontSize: '12.5px', borderRadius: '7px' }}
                  >
                    <Plus size={15} />
                    <span>Tambah Produk</span>
                  </button>
                </div>
              </div>

              {/* 4 Metric Summary Cards */}
              <div className="ref-metric-cards-grid">
                {/* 1. Total Pesanan */}
                <div className="ref-card ref-metric-card">
                  <div className="ref-metric-top">
                    <span className="ref-metric-label">Total Pesanan</span>
                    <div className="ref-metric-icon-wrap">
                      <ShoppingBag size={17} />
                    </div>
                  </div>
                  <div className="ref-metric-number tabular-nums">{adminOrders.length}</div>
                  <div className="ref-metric-trend positive">
                    <span>Data terbaru</span> dari database
                  </div>
                </div>

                {/* 2. Menunggu Diproses */}
                <div className="ref-card ref-metric-card">
                  <div className="ref-metric-top">
                    <span className="ref-metric-label">Menunggu Diproses</span>
                    <div className="ref-metric-icon-wrap">
                      <Clock size={17} />
                    </div>
                  </div>
                  <div className="ref-metric-number tabular-nums">{orderCounts.menunggu}</div>
                  <button
                    type="button"
                    className="ref-metric-link"
                    onClick={() => {
                      setActiveTab('orders');
                      setOrderTabFilter('menunggu');
                    }}
                  >
                    Lihat pesanan →
                  </button>
                </div>

                {/* 3. Total Produk */}
                <div className="ref-card ref-metric-card">
                  <div className="ref-metric-top">
                    <span className="ref-metric-label">Total Produk</span>
                    <div className="ref-metric-icon-wrap">
                      <Package size={17} />
                    </div>
                  </div>
                  <div className="ref-metric-number tabular-nums">{adminProducts.length}</div>
                  <div className="ref-metric-trend neutral">Produk terdaftar</div>
                </div>

                {/* 4. Pelanggan Baru */}
                <div className="ref-card ref-metric-card">
                  <div className="ref-metric-top">
                    <span className="ref-metric-label">Pelanggan Baru</span>
                    <div className="ref-metric-icon-wrap">
                      <Users size={17} />
                    </div>
                  </div>
                  <div className="ref-metric-number tabular-nums">{adminCustomers.length}</div>
                  <div className="ref-metric-trend positive">
                    <span>Data akun</span> dari database
                  </div>
                </div>
              </div>

              {/* Two Column Section: Pesanan Terbaru & Stok Produk */}
              <div className="ref-dashboard-split-grid">
                {/* Left Column: Pesanan Terbaru */}
                <div className="ref-card ref-recent-orders-card ref-card-has-mobile-view">
                  <div className="ref-card-header-bar">
                    <h2 className="ref-card-title">Pesanan Terbaru</h2>
                    <button
                      type="button"
                      className="ref-text-link"
                      onClick={() => setActiveTab('orders')}
                    >
                      Lihat semua →
                    </button>
                  </div>

                  <div className="ref-table-responsive">
                    <table className="ref-data-table">
                      <thead>
                        <tr>
                          <th>No. Pesanan</th>
                          <th>Pelanggan</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Waktu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminOrders.slice(0, 5).map(o => (
                          <tr
                            key={o.id}
                            className="ref-clickable-row"
                            onClick={() => setSelectedOrderForDetail(o)}
                          >
                            <td className="ref-cell-order-num">
                              <strong>{o.order_number || o.id}</strong>
                            </td>
                            <td>{o.customer_name}</td>
                            <td className="tabular-nums">{formatRupiah(o.total || o.subtotal)}</td>
                            <td>{renderStatusBadge(o.status)}</td>
                            <td className="ref-cell-time">
                              {o.created_at
                                ? new Date(o.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                                : 'Waktu belum tersedia'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card List for Screen Width < 640px */}
                  <div className="ref-mobile-order-cards">
                    {adminOrders.slice(0, 4).map(o => (
                      <div
                        key={o.id}
                        className="ref-mobile-order-item"
                        onClick={() => setSelectedOrderForDetail(o)}
                      >
                        <div className="ref-mobile-order-thumb ref-admin-order-placeholder" aria-hidden="true"><Package size={18} /></div>
                        <div className="ref-mobile-order-center">
                          <strong>{o.order_number || o.id}</strong>
                          <span>{o.customer_name}</span>
                        </div>
                        <div className="ref-mobile-order-right">
                          {renderStatusBadge(o.status)}
                          <small className="ref-mobile-time">{o.created_at ? new Date(o.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Waktu belum tersedia'}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Stok Produk */}
                <div className="ref-card ref-bestseller-card">
                  <div className="ref-card-header-bar">
                    <h2 className="ref-card-title">Stok Produk</h2>
                    <button
                      type="button"
                      className="ref-text-link"
                      onClick={() => setActiveTab('products')}
                    >
                      Lihat semua →
                    </button>
                  </div>

                  <div className="ref-bestseller-list">
                    {adminProducts.slice(0, 5).map((p, idx) => {
                      const stockCount = Number(p.stock || 0);
                      return (
                        <div
                          key={p.id}
                          className="ref-bestseller-item"
                          onClick={() => handleOpenEditProduct(p)}
                        >
                          <img
                            src={p.image_url || ''}
                            alt={p.name}
                            className="ref-bestseller-thumb"
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                          <div className="ref-bestseller-info">
                            <strong>{p.name}</strong>
                            <span>{stockCount} stok tersedia</span>
                          </div>
                          <div className="ref-bestseller-trend-icon">
                            <TrendingUp size={15} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'products' ? (
            /* ===================================================================
               VIEW 3: DESKTOP - KELOLA PRODUK
               =================================================================== */
            <div className="ref-manage-products-view">
              {/* Header with Title and Green "+ Tambah Produk" Button */}
              <div className="ref-manage-header-row">
                <div>
                  <h1 className="ref-page-title">Kelola Produk</h1>
                  <p className="ref-page-subtitle">Tambah, edit, dan atur produk toko Anda.</p>
                </div>

                <button
                  type="button"
                  className="ref-btn-primary"
                  onClick={handleOpenNewProduct}
                >
                  <Plus size={16} />
                  <span>Tambah Produk</span>
                </button>
              </div>

              {/* Toolbar with Search, Category Filter, Status Filter */}
              <div className="ref-filter-toolbar">
                <div className="ref-toolbar-search">
                  <Search size={16} className="ref-toolbar-search-icon" />
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                  />
                  {productSearch && (
                    <button className="ref-search-clear" onClick={() => setProductSearch('')}>
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="ref-toolbar-dropdowns">
                  <select
                    className="ref-toolbar-select"
                    value={selectedProductCategory}
                    onChange={e => setSelectedProductCategory(e.target.value)}
                  >
                    <option value="all">Semua Kategori</option>
                    {adminCategories.filter(category => category.is_active !== false).map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>

                  <select
                    className="ref-toolbar-select"
                    value={selectedProductStatus}
                    onChange={e => setSelectedProductStatus(e.target.value)}
                  >
                    <option value="all">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="outofstock">Stok Habis</option>
                  </select>
                </div>
              </div>

              {/* Product Table matching reference */}
              <div className="ref-card ref-table-card ref-card-has-mobile-view">
                <div className="ref-table-responsive">
                  <table className="ref-data-table ref-product-table">
                    <thead>
                      <tr>
                        <th style={{ width: 68 }}>Gambar</th>
                        <th>Nama Produk</th>
                        <th>Kategori</th>
                        <th>Harga</th>
                        <th>Stok</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center', width: 60 }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(p => {
                        const isOutOfStock = p.is_active === false || (!p.is_preorder && p.stock === 0);
                        return (
                          <tr key={p.id}>
                            <td>
                              {p.image_url ? <img src={p.image_url} alt={p.name} className="ref-table-product-thumb" /> : <div className="ref-table-product-thumb ref-admin-order-placeholder" aria-hidden="true"><Package size={16} /></div>}
                            </td>
                            <td>
                              <strong
                                className="ref-product-name-link"
                                onClick={() => handleOpenEditProduct(p)}
                              >
                                {p.name}
                              </strong>
                            </td>
                            <td>{p.category || '—'}</td>
                            <td className="tabular-nums">{formatRupiah(p.price)}</td>
                            <td className="tabular-nums">{p.is_preorder ? 'PO' : p.stock ?? 0}</td>
                            <td>
                              <button
                                type="button"
                                className={`ref-corner-toggle-btn ${p.is_active ? 'active' : 'inactive'}`}
                                onClick={() => handleToggleProductStatus(p)}
                                title={p.is_active ? 'Klik untuk menonaktifkan produk ini' : 'Klik untuk mengaktifkan produk ini'}
                              >
                                <span className="ref-toggle-indicator" />
                                <span>{p.is_active ? 'Aktif' : 'Nonaktif'}</span>
                              </button>
                            </td>
                            <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                                <button
                                  type="button"
                                  className="ref-row-action-btn"
                                  onClick={() => handleOpenEditProduct(p)}
                                  title="Edit Produk"
                                  aria-label={`Edit ${p.name}`}
                                >
                                  <Edit size={13} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  className="ref-row-action-btn ref-row-action-delete"
                                  onClick={() => handleDeleteProduct(p)}
                                  title="Hapus Produk"
                                  aria-label={`Hapus ${p.name}`}
                                >
                                  <Trash2 size={13} />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Products List for screen width <= 640px */}
                <div className="ref-mobile-products-list">
                  {filteredProducts.length === 0 ? (
                    <div className="ref-empty-state-card" style={{ padding: '32px 16px', textAlign: 'center' }}>
                      <Package size={36} style={{ color: 'var(--ref-text-muted, #777C76)', margin: '0 auto 8px' }} />
                      <p style={{ margin: 0, fontWeight: 500, color: 'var(--ref-text, #252B27)' }}>Tidak ada produk ditemukan</p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--ref-text-muted, #777C76)' }}>Coba ubah kata kunci pencarian atau filter.</p>
                    </div>
                  ) : (
                    filteredProducts.map(p => {
                      const isOutOfStock = p.is_active === false || (!p.is_preorder && p.stock === 0);
                      return (
                        <div key={p.id} className="ref-mobile-product-card-item" style={{ position: 'relative' }}>
                          {/* Tombol status Aktif/Nonaktif di pojok kanan atas kartu produk */}
                          <div className="ref-mobile-corner-toggle" style={{ position: 'absolute', top: 12, right: 14, zIndex: 10 }}>
                            <button
                              type="button"
                              className={`ref-corner-toggle-btn ${p.is_active ? 'active' : 'inactive'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleProductStatus(p);
                              }}
                              title={p.is_active ? 'Klik untuk nonaktifkan produk' : 'Klik untuk aktifkan produk'}
                              aria-label={p.is_active ? `Nonaktifkan ${p.name}` : `Aktifkan ${p.name}`}
                            >
                              <span className="ref-toggle-indicator" />
                              <span>{p.is_active ? 'Aktif' : 'Nonaktif'}</span>
                            </button>
                          </div>

                          <div
                            className="ref-mobile-product-main-clickable"
                            onClick={() => handleOpenEditProduct(p)}
                          >
                            <div className="ref-mobile-product-thumb-wrap">
                              {p.image_url ? (
                                <img src={p.image_url} alt={p.name} className="ref-mobile-product-thumb" />
                              ) : (
                                <div className="ref-mobile-product-thumb ref-admin-order-placeholder" aria-hidden="true">
                                  <Package size={20} />
                                </div>
                              )}
                            </div>
                            <div className="ref-mobile-product-info">
                              <strong className="ref-mobile-product-title" style={{ paddingRight: 80 }}>{p.name}</strong>
                              <div className="ref-mobile-product-meta">
                                <span className="ref-mobile-product-cat">{p.category || 'Tanpa Kategori'}</span>
                                <span className="ref-mobile-meta-dot">•</span>
                                <span className="ref-mobile-product-stock">
                                  {p.is_preorder ? 'Pre-Order' : `Stok: ${p.stock ?? 0}`}
                                </span>
                              </div>
                              <div className="ref-mobile-product-price tabular-nums">
                                {formatRupiah(p.price)}
                              </div>
                            </div>
                          </div>

                          <div className="ref-mobile-product-bottom-bar">
                            <div className="ref-mobile-product-status">
                              <span style={{ fontSize: '11.5px', color: 'var(--ref-text-muted, #777C76)' }}>
                                {p.is_preorder ? 'Pre-Order' : (p.stock && p.stock > 0 ? `Tersedia (${p.stock})` : 'Stok Habis')}
                              </span>
                            </div>
                            <div className="ref-mobile-product-actions">
                              <button
                                type="button"
                                className="ref-mobile-btn-edit"
                                onClick={() => handleOpenEditProduct(p)}
                                aria-label={`Edit ${p.name}`}
                              >
                                <Edit size={13} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className="ref-mobile-btn-delete"
                                onClick={() => handleDeleteProduct(p)}
                                aria-label={`Hapus ${p.name}`}
                              >
                                <Trash2 size={13} />
                                <span>Hapus</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'orders' ? (
            /* ===================================================================
               VIEW 4 & 7: KELOLA PESANAN (DESKTOP & MOBILE)
               =================================================================== */
            <div className="ref-manage-orders-view">
              {/* Header */}
              <div className="ref-manage-header-row">
                <div>
                  <h1 className="ref-page-title">Kelola Pesanan</h1>
                  <p className="ref-page-subtitle">Pantau dan atur semua pesanan pelanggan.</p>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="ref-filter-toolbar">
                <div className="ref-toolbar-search">
                  <Search size={16} className="ref-toolbar-search-icon" />
                  <input
                    type="text"
                    placeholder="Cari nomor pesanan atau nama pelanggan..."
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                  />
                  {orderSearch && (
                    <button className="ref-search-clear" onClick={() => setOrderSearch('')}>
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="ref-toolbar-dropdowns">
                  <select
                    className="ref-toolbar-select"
                    value={orderStatusDropdown}
                    onChange={e => setOrderStatusDropdown(e.target.value)}
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Menunggu Diproses</option>
                    <option value="confirmed">Dikonfirmasi</option>
                    <option value="processing">Dikemas</option>
                    <option value="shipped">Dikirim</option>
                    <option value="completed">Diterima</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>

                  <div className="ref-date-picker-btn" title="Pilih Tanggal">
                    <Calendar size={16} />
                  </div>
                </div>
              </div>

              {/* Horizontal Tabs with Counters matching reference */}
              <div className="ref-status-tabs-row">
                <button
                  type="button"
                  className={`ref-tab-btn ${orderTabFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setOrderTabFilter('all')}
                >
                  Semua ({orderCounts.all})
                </button>
                <button
                  type="button"
                  className={`ref-tab-btn ${orderTabFilter === 'menunggu' ? 'active' : ''}`}
                  onClick={() => setOrderTabFilter('menunggu')}
                >
                  Menunggu Diproses ({orderCounts.menunggu})
                </button>
                <button
                  type="button"
                  className={`ref-tab-btn ${orderTabFilter === 'dikonfirmasi' ? 'active' : ''}`}
                  onClick={() => setOrderTabFilter('dikonfirmasi')}
                >
                  Dikonfirmasi ({orderCounts.dikonfirmasi})
                </button>
                <button
                  type="button"
                  className={`ref-tab-btn ${orderTabFilter === 'dikemas' ? 'active' : ''}`}
                  onClick={() => setOrderTabFilter('dikemas')}
                >
                  Dikemas ({orderCounts.dikemas})
                </button>
                <button
                  type="button"
                  className={`ref-tab-btn ${orderTabFilter === 'dikirim' ? 'active' : ''}`}
                  onClick={() => setOrderTabFilter('dikirim')}
                >
                  Dikirim ({orderCounts.dikirim})
                </button>
                <button
                  type="button"
                  className={`ref-tab-btn ${orderTabFilter === 'diterima' ? 'active' : ''}`}
                  onClick={() => setOrderTabFilter('diterima')}
                >
                  Diterima ({orderCounts.diterima})
                </button>
                <button
                  type="button"
                  className={`ref-tab-btn ${orderTabFilter === 'dibatalkan' ? 'active' : ''}`}
                  onClick={() => setOrderTabFilter('dibatalkan')}
                >
                  Dibatalkan ({orderCounts.dibatalkan})
                </button>
              </div>

              {/* Desktop Order Table */}
              <div className="ref-card ref-table-card ref-card-has-mobile-view">
                <div className="ref-table-responsive">
                  <table className="ref-data-table">
                    <thead>
                      <tr>
                        <th>No. Pesanan</th>
                        <th>Pelanggan</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(o => (
                        <tr
                          key={o.id}
                          className="ref-clickable-row"
                          onClick={() => setSelectedOrderForDetail(o)}
                        >
                          <td className="ref-cell-order-num">
                            <strong>{o.order_number || o.id}</strong>
                          </td>
                          <td>{o.customer_name}</td>
                          <td className="tabular-nums">{formatRupiah(o.total || o.subtotal)}</td>
                          <td>{renderStatusBadge(o.status)}</td>
                          <td className="ref-cell-time">
                            {new Date(o.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Orders List View matching View 7 */}
                <div className="ref-mobile-orders-full-list">
                  {filteredOrders.map(o => (
                    <div
                      key={o.id}
                      className="ref-mobile-order-card-row"
                      onClick={() => setSelectedOrderForDetail(o)}
                    >
                      <div className="ref-mobile-order-thumb ref-admin-order-placeholder" aria-hidden="true"><Package size={18} /></div>
                      <div className="ref-mobile-order-center">
                        <div className="ref-mobile-card-title-row">
                          <strong>{o.order_number || o.id}</strong>
                          <span className="ref-mobile-time">{o.created_at ? new Date(o.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Waktu belum tersedia'}</span>
                        </div>
                        <span className="ref-mobile-customer">{o.customer_name}</span>
                        <span className="ref-mobile-amount tabular-nums">
                          {formatRupiah(o.total || o.subtotal)}
                        </span>
                      </div>
                      <div className="ref-mobile-order-right">
                        {renderStatusBadge(o.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'categories' ? (
            /* ===================================================================
               CATEGORIES TAB
               =================================================================== */
            <div className="ref-manage-categories-view">
              <div className="ref-manage-header-row">
                <div>
                  <h1 className="ref-page-title">Kategori Produk Toko</h1>
                  <p className="ref-page-subtitle">Daftar kategori aktif untuk katalog produk INABA Hijab.</p>
                </div>
              </div>

              <div className="ref-card ref-table-card ref-card-has-mobile-view">
                <div className="ref-table-responsive">
                  <table className="ref-data-table">
                    <thead>
                      <tr>
                        <th>Nama Kategori</th>
                        <th>Slug</th>
                        <th>Keterangan</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminCategories.map(c => (
                        <tr key={c.slug}>
                          <td><strong>{c.name}</strong></td>
                          <td><code>{c.slug}</code></td>
                          <td>{c.description || '-'}</td>
                          <td>{c.is_active === false ? <span className="ref-status-badge status-habis">Nonaktif</span> : <span className="ref-status-badge status-aktif">Aktif</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Categories List */}
                <div className="ref-mobile-categories-list">
                  {adminCategories.length === 0 ? (
                    <div className="ref-empty-state-card" style={{ padding: '32px 16px', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontWeight: 500, color: 'var(--ref-text, #252B27)' }}>Belum ada kategori</p>
                    </div>
                  ) : (
                    adminCategories.map(c => (
                      <div key={c.slug} className="ref-mobile-category-card">
                        <div className="ref-mobile-cat-header">
                          <strong className="ref-mobile-cat-name">{c.name}</strong>
                          {c.is_active === false ? (
                            <span className="ref-status-badge status-habis">Nonaktif</span>
                          ) : (
                            <span className="ref-status-badge status-aktif">Aktif</span>
                          )}
                        </div>
                        <div className="ref-mobile-cat-slug">
                          <code>{c.slug}</code>
                        </div>
                        {c.description && (
                          <p className="ref-mobile-cat-desc">{c.description}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'customers' ? (
            /* ===================================================================
               CUSTOMERS TAB
               =================================================================== */
            <div className="ref-manage-customers-view">
              <div className="ref-manage-header-row">
                <div>
                  <h1 className="ref-page-title">Daftar Pelanggan</h1>
                  <p className="ref-page-subtitle">Pelanggan yang terdaftar di akun toko INABA Hijab.</p>
                </div>
              </div>

              <div className="ref-card ref-table-card ref-card-has-mobile-view">
                <div className="ref-table-responsive">
                  <table className="ref-data-table">
                    <thead>
                      <tr>
                        <th>Nama Pelanggan</th>
                        <th>Email</th>
                        <th>ID Akun</th>
                        <th>Tanggal Bergabung</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminCustomers.map(customer => (
                        <tr key={customer.id}>
                          <td><strong>{customer.full_name || customer.email.split('@')[0]}</strong></td>
                          <td>{customer.email}</td>
                          <td><code>{customer.id.slice(0, 8)}</code></td>
                          <td>{customer.created_at ? new Date(customer.created_at).toLocaleDateString('id-ID') : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Customers List */}
                <div className="ref-mobile-customers-list">
                  {adminCustomers.length === 0 ? (
                    <div className="ref-empty-state-card" style={{ padding: '32px 16px', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontWeight: 500, color: 'var(--ref-text, #252B27)' }}>Belum ada pelanggan terdaftar</p>
                    </div>
                  ) : (
                    adminCustomers.map(customer => (
                      <div key={customer.id} className="ref-mobile-customer-card">
                        <div className="ref-mobile-customer-top">
                          <strong>{customer.full_name || customer.email.split('@')[0]}</strong>
                          <small className="ref-mobile-time">
                            {customer.created_at ? new Date(customer.created_at).toLocaleDateString('id-ID') : '—'}
                          </small>
                        </div>
                        <div className="ref-mobile-customer-email">{customer.email}</div>
                        <div className="ref-mobile-customer-id">ID: <code>{customer.id.slice(0, 8)}</code></div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'newsletter' ? (
            /* ===================================================================
               NEWSLETTER TAB
               =================================================================== */
            <div className="ref-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 className="ref-page-title">Langganan Newsletter</h2>
                  <p className="ref-page-subtitle">Daftar pelanggan yang terdaftar untuk promo INABA Hijab.</p>
                </div>
                <button type="button" className="ref-btn-secondary" onClick={handleExportCsv}>
                  <Download size={15} /> Ekspor CSV
                </button>
              </div>

              <div className="ref-table-responsive">
                <table className="ref-data-table">
                  <thead>
                    <tr>
                      <th>Email Pelanggan</th>
                      <th>Waktu Berlangganan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminNewsletter.map((n, idx) => (
                      <tr key={idx}>
                        <td><strong>{n.email}</strong></td>
                        <td>{new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'reports' ? (
            /* ===================================================================
               REPORTS TAB
               =================================================================== */
            <div className="ref-card" style={{ padding: 24 }}>
              <h2 className="ref-page-title">Laporan Penjualan</h2>
              <p className="ref-page-subtitle">Ringkasan performa finansial dan pesanan terverifikasi.</p>

              <div className="ref-metric-cards-grid" style={{ marginTop: 20 }}>
                <div className="ref-card ref-metric-card">
                  <span className="ref-metric-label">Nilai Pesanan (Nonbatal)</span>
                  <div className="ref-metric-number tabular-nums">
                    {formatRupiah(adminOrders.filter(o => String(o.status).toLowerCase() !== 'cancelled' && String(o.status).toLowerCase() !== 'dibatalkan').reduce((sum, o) => sum + Number(o.subtotal || o.total || 0), 0))}
                  </div>
                </div>
                <div className="ref-card ref-metric-card">
                  <span className="ref-metric-label">Pesanan Berhasil</span>
                  <div className="ref-metric-number tabular-nums">{orderCounts.diterima}</div>
                </div>
                <div className="ref-card ref-metric-card">
                  <span className="ref-metric-label">Rata-rata Keranjang</span>
                  <div className="ref-metric-number tabular-nums">{formatRupiah((() => { const validOrders = adminOrders.filter(o => !['cancelled', 'dibatalkan'].includes(String(o.status).toLowerCase())); return validOrders.length ? Math.round(validOrders.reduce((sum, o) => sum + Number(o.subtotal || 0), 0) / validOrders.length) : 0; })())}</div>
                </div>
              </div>
            </div>
          ) : (
            /* ===================================================================
               SETTINGS TAB
               =================================================================== */
            <div className="ref-card" style={{ padding: 24, maxWidth: 640 }}>
              <h2 className="ref-page-title">Pengaturan Toko</h2>
              <p className="ref-page-subtitle">Konfigurasi nomor WhatsApp dan rekening pembayaran resmi.</p>

              <form onSubmit={handleSaveSettings} style={{ marginTop: 20, display: 'grid', gap: 16 }}>
                <div className="ref-form-group">
                  <label className="ref-form-label">No. WhatsApp Admin Konfirmasi</label>
                  <input
                    type="text"
                    className="ref-form-input"
                    value={waInput}
                    onChange={e => setWaInput(e.target.value)}
                    placeholder="Contoh: 6281234567890"
                  />
                </div>

                <div className="ref-form-group">
                  <label className="ref-form-label">Daftar Rekening Transfer (Nama Bank | Nomor Rekening &amp; Atas Nama)</label>
                  <textarea
                    className="ref-form-textarea"
                    rows={4}
                    value={paymentsInput}
                    onChange={e => setPaymentsInput(e.target.value)}
                  />
                </div>

                <button type="submit" className="ref-btn-primary" style={{ justifySelf: 'start' }}>
                  Simpan Pengaturan
                </button>
              </form>

              <div className="ref-site-assets-manager">
                <div>
                  <h3 className="ref-card-heading" style={{ marginTop: 28 }}>Foto dan Banner Situs</h3>
                  <p className="ref-page-subtitle">Pilih foto yang relevan dari perangkat. File diunggah ke Supabase Storage; foto di luar Supabase tidak digunakan.</p>
                </div>
                <div className="ref-site-assets-grid">
                  {([
                    { key: 'hero', label: 'Foto Utama Beranda', hint: 'Disarankan 4:5 atau potret' },
                    { key: 'preorder_banner', label: 'Banner Pre-Order', hint: 'Disarankan 16:5' },
                    { key: 'farmer_banner', label: 'Foto Capel Petani', hint: 'Disarankan 4:3' },
                    { key: 'table_banner', label: 'Foto Meja Lipat', hint: 'Disarankan 4:3' }
                  ] as const).map(asset => {
                    const imageUrl = siteImages.find(image => image.key === asset.key)?.image_url || '';
                    const uploading = siteImageUploading === asset.key;
                    return (
                      <div className="ref-site-asset-card" key={asset.key}>
                        <div className="ref-site-asset-preview">
                          {imageUrl ? <img src={imageUrl} alt={asset.label} /> : <div className="ref-site-asset-empty"><Package size={25} /><span>Foto belum diunggah</span></div>}
                        </div>
                        <strong>{asset.label}</strong>
                        <span className="field-hint">{asset.hint}</span>
                        <label className={`ref-btn-outline ref-site-upload-btn ${uploading ? 'is-loading' : ''}`}>
                          {uploading ? 'Mengunggah…' : imageUrl ? 'Ganti Foto' : 'Unggah Foto'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={Boolean(siteImageUploading)}
                            onChange={event => {
                              const file = event.currentTarget.files?.[0];
                              event.currentTarget.value = '';
                              if (file) void handleSaveSiteImage(asset.key, asset.label, file);
                            }}
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          MOBILE BOTTOM NAVIGATION (ADMIN)
          4 Tabs matching reference: Dashboard, Produk, Pesanan, Menu
          ========================================================================= */}
      <nav className="ref-mobile-bottom-nav" aria-label="Navigasi Bawah Admin">
        <button
          type="button"
          className={`ref-mobile-bottom-tab ${activeTab === 'overview' && !isEditingProduct && !selectedOrderForDetail ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('overview');
            setIsEditingProduct(false);
            setSelectedOrderForDetail(null);
          }}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          className={`ref-mobile-bottom-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('products');
            setIsEditingProduct(false);
            setSelectedOrderForDetail(null);
          }}
        >
          <Package size={18} />
          <span>Produk</span>
        </button>

        <button
          type="button"
          className={`ref-mobile-bottom-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('orders');
            setIsEditingProduct(false);
            setSelectedOrderForDetail(null);
          }}
        >
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <ShoppingBag size={18} />
            {orderCounts.menunggu > 0 && (
              <span className="ref-bottom-badge">{orderCounts.menunggu}</span>
            )}
          </div>
          <span>Pesanan</span>
        </button>

        <button
          type="button"
          className="ref-mobile-bottom-tab"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Menu size={18} />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
};
