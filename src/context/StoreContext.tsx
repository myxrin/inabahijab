import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Category, CartItem, StoreSettings, UserProfile, Order, SiteImage } from '../types';
import { supabase, cleanPhoneNumber, isProductStorageUrl, isSiteStorageUrl } from '../lib/supabase';

export type ModalType =
  | 'productDetail'
  | 'cart'
  | 'checkout'
  | 'orderSuccess'
  | 'poCalculator'
  | 'sizeGuide'
  | 'auth'
  | 'account'
  | 'privacyPolicy'
  | 'termsConditions'
  | null;

export interface LastOrderSummary {
  orderId: string;
  reference: string;
  customerName: string;
  customerPhone: string;
  shippingPref: string;
  subtotal: number;
  waUrl: string;
  rawText: string;
}

export type ViewType = 'store' | 'admin' | 'customer';

interface StoreContextType {
  currentView: ViewType;
  navigateToView: (view: ViewType, serverVerifiedAdmin?: boolean) => void;
  products: Product[];
  categories: Category[];
  siteImages: SiteImage[];
  storeSettings: StoreSettings;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  poFilter: string;
  setPoFilter: (filter: string) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  selectedDivision: 'all' | 'modest' | 'schoolwear' | 'living';
  setSelectedDivision: (division: 'all' | 'modest' | 'schoolwear' | 'living') => void;
  cart: CartItem[];
  addToCart: (product: Product, size: string, quantity: number) => void;
  updateCartQty: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  user: any | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  activeModal: ModalType;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  detailProduct: Product | null;
  openProductDetail: (product: Product) => void;
  lastOrder: LastOrderSummary | null;
  setLastOrder: (order: LastOrderSummary | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  refreshProducts: () => Promise<void>;
  saveProduct: (productData: Partial<Product>, isEditingId?: string) => Promise<{ success: boolean; backendSuccess: boolean; backendError?: string | null; product: Product }>;
  deleteProductItem: (id: string) => Promise<{ success: boolean; backendError?: string | null }>;
  createOrder: (orderData: {
    customerName: string;
    phone: string;
    address: string;
    studentNotes?: string;
    notes?: string;
    shippingPref: string;
  }) => Promise<LastOrderSummary>;
  orders: Order[];
  updateOrderStatus: (orderId: string, newStatus: Order['status']) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'inaba_cart_items_v2';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Catalog, orders and settings are server-owned data; never populate them from demo/local storage.
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteImages, setSiteImages] = useState<SiteImage[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    store_title: 'INABA HIJAB', contact_whatsapp: '', payment_accounts: []
  });
  const [orders, setOrders] = useState<Order[]>([]);

  const [activeFilter, setActiveFilter] = useState<string>('Semua');
  const [poFilter, setPoFilter] = useState<string>('Semua');
  const [searchText, setSearchText] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('featured');
  const [selectedDivision, setSelectedDivision] = useState<'all' | 'modest' | 'schoolwear' | 'living'>('all');

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [lastOrder, setLastOrder] = useState<LastOrderSummary | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // View state: 'store' | 'admin' | 'customer'
  const [currentView, setCurrentView] = useState<ViewType>('store');
  const [isAdmin, setIsAdmin] = useState(false);

  const navigateToView = useCallback((view: ViewType, serverVerifiedAdmin = false) => {
    const safeView: ViewType = view === 'admin' && !isAdmin && !serverVerifiedAdmin ? 'store' : view;
    setCurrentView(safeView);
    if (typeof window !== 'undefined') {
      if (safeView === 'admin') {
        window.location.hash = '#admin';
      } else if (safeView === 'customer') {
        window.location.hash = '#akun';
      } else {
        if (window.location.hash === '#admin' || window.location.hash === '#akun' || window.location.hash === '#account') {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isAdmin]);

  // A cart preference is not authoritative order data. Final pricing/inventory always comes from Supabase.
  // Load initial cart from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart]);

  // Toast dispatcher
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  // Load public catalog and storefront settings exclusively from Supabase.
  const refreshProducts = useCallback(async () => {
    if (!supabase) {
      setProducts([]);
      setCategories([]);
      setSiteImages([]);
      setStoreSettings({ store_title: 'INABA HIJAB', contact_whatsapp: '', payment_accounts: [] });
      return;
    }

    const [categoriesResult, productsResult, settingsResult, siteImagesResult] = await Promise.all([
      supabase.from('categories').select('*').eq('is_active', true).order('display_order', { ascending: true }),
      supabase.from('products').select('*').eq('is_active', true).order('featured', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('store_settings').select('key, value').in('key', ['contact_whatsapp', 'payment_accounts', 'store_title']),
      supabase.from('site_images').select('key, label, image_url')
    ]);

    if (categoriesResult.error) throw categoriesResult.error;
    if (productsResult.error) throw productsResult.error;
    if (settingsResult.error) throw settingsResult.error;
    if (siteImagesResult.error) throw siteImagesResult.error;

    setCategories((categoriesResult.data || []) as Category[]);
    setSiteImages((siteImagesResult.data || []).map((item: any) => ({ ...item, image_url: isSiteStorageUrl(item.image_url) ? item.image_url : '' })) as SiteImage[]);
    setProducts((productsResult.data || []).map((p: any) => {
      const imageUrl = isProductStorageUrl(p.image_url) ? p.image_url : null;
      const gallery = Array.isArray(p.gallery_urls) ? p.gallery_urls.filter(isProductStorageUrl).slice(0, 5) : [];
      return {
        ...p,
        image_url: imageUrl,
        gallery_urls: gallery.length ? gallery : (imageUrl ? [imageUrl] : []),
        variants: Array.isArray(p.variants) ? p.variants : []
      };
    }) as Product[]);

    const nextSettings: StoreSettings = { store_title: 'INABA HIJAB', contact_whatsapp: '', payment_accounts: [] };
    for (const row of settingsResult.data || []) {
      if (row.key === 'contact_whatsapp' && typeof row.value === 'string') nextSettings.contact_whatsapp = row.value.replace(/\D/g, '');
      if (row.key === 'payment_accounts' && Array.isArray(row.value)) nextSettings.payment_accounts = row.value;
      if (row.key === 'store_title' && typeof row.value === 'string' && row.value.trim()) nextSettings.store_title = row.value.trim();
    }
    setStoreSettings(nextSettings);
  }, []);

  // Admin rights are asked from the database for each authenticated session. Browser values,
  // email strings, URL fragments and localStorage are never accepted as proof of admin access.
  useEffect(() => {
    let disposed = false;

    const applySession = async (session: any) => {
      const sessionUser = session?.user || null;
      if (!sessionUser || !supabase) {
        if (!disposed) {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setOrders([]);
          if (currentView === 'admin' || currentView === 'customer') setCurrentView('store');
        }
        return;
      }

      if (!disposed) setUser(sessionUser);
      let serverAdmin = false;
      let profileData: any = null;
      try {
        const [adminResult, profileResult] = await Promise.all([
          supabase.rpc('is_admin'),
          supabase.from('profiles').select('id,email,full_name,role').eq('id', sessionUser.id).maybeSingle()
        ]);
        if (!adminResult.error) serverAdmin = adminResult.data === true;
        if (!profileResult.error) profileData = profileResult.data;
      } catch (error) {
        console.warn('Tidak dapat memverifikasi hak akses sesi.', error);
      }

      if (!disposed) {
        setIsAdmin(serverAdmin);
        setProfile({
          id: sessionUser.id,
          email: String(sessionUser.email || '').toLowerCase(),
          full_name: profileData?.full_name || sessionUser.user_metadata?.full_name || String(sessionUser.email || '').split('@')[0],
          role: serverAdmin ? 'admin' : 'customer'
        });
        if (!serverAdmin && currentView === 'admin') setCurrentView('store');
      }
    };

    void refreshProducts().catch((error) => {
      console.error('Gagal memuat katalog Supabase.', error);
      if (!disposed) {
        setProducts([]);
        setCategories([]);
        setSiteImages([]);
        setStoreSettings({ store_title: 'INABA HIJAB', contact_whatsapp: '', payment_accounts: [] });
      }
    });

    if (!supabase) {
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      return () => { disposed = true; };
    }

    void supabase.auth.getSession().then(({ data }) => applySession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Run after Supabase finishes its auth callback to avoid blocking its internal lock.
      Promise.resolve().then(() => applySession(session));
    });

    return () => {
      disposed = true;
      listener.subscription.unsubscribe();
    };
  }, [refreshProducts]);

  // Modal helpers
  const openModal = useCallback((modal: ModalType) => {
    if (modal === 'account') {
      if (user) {
        navigateToView(isAdmin ? 'admin' : 'customer');
      } else {
        setActiveModal('auth');
        document.body.classList.add('lock');
      }
      return;
    }
    setActiveModal(modal);
    document.body.classList.add('lock');
  }, [user, isAdmin, navigateToView]);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    document.body.classList.remove('lock');
  }, []);

  const openProductDetail = useCallback((product: Product) => {
    setDetailProduct(product);
    openModal('productDetail');
  }, [openModal]);

  // Cart operations
  const addToCart = useCallback((product: Product, size: string, quantity: number) => {
    const isPo = Boolean(product.is_preorder);
    if (!isPo && product.stock !== null && product.stock !== undefined && Number(product.stock) <= 0) {
      showToast('Maaf, produk ini sedang habis.');
      return;
    }

    const chosenSize = (size || '').trim();
    if (!chosenSize || !Array.isArray(product.variants) || !product.variants.includes(chosenSize)) {
      showToast('Pilih varian yang tersedia untuk produk ini.');
      return;
    }

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id && item.size === chosenSize);
      if (existingIndex !== -1) {
        const next = [...prev];
        const maxLimit = isPo ? 50 : Math.min(20, Number(product.stock) || 20);
        next[existingIndex].quantity = Math.min(next[existingIndex].quantity + quantity, maxLimit);
        return next;
      } else {
        const newItem: CartItem = {
          cart_item_id: 'item_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          stock: product.stock ?? 0,
          image_url: product.image_url || '',
          quantity,
          size: chosenSize,
          min_order: Number(product.min_order || 1),
          is_preorder: isPo,
          school_institution: product.school_institution || '',
          is_active: product.is_active !== false,
          preorder_status: product.preorder_status || 'open',
          variants: product.variants || [],
          size_guide: product.size_guide || ''
        };
        return [...prev, newItem];
      }
    });

    showToast(`"${product.name}" (${chosenSize}) ditambahkan ke keranjang.`);
  }, [showToast]);

  const updateCartQty = useCallback((cartItemId: string, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => i.cart_item_id === cartItemId);
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prev.filter(i => i.cart_item_id !== cartItemId);
      }
      const maxLimit = item.is_preorder ? 50 : Math.min(20, Number(item.stock) || 20);
      const minLimit = item.is_preorder ? Number(item.min_order || 1) : 1;
      if (delta < 0 && newQty < minLimit) {
        showToast(`Minimal pre-order adalah ${minLimit} pcs. Hapus item bila tidak ingin memesan.`);
        return prev;
      }
      return prev.map(i => i.cart_item_id === cartItemId ? { ...i, quantity: Math.min(newQty, maxLimit) } : i);
    });
  }, [showToast]);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart(prev => prev.filter(i => i.cart_item_id !== cartItemId));
    showToast('Item dihapus dari keranjang.');
  }, [showToast]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

  // Order creation is a single server-side transaction. Never insert an order directly
  // from the browser or calculate the final price using cart/localStorage values.
  const createOrder = useCallback(async (orderData: {
    customerName: string;
    phone: string;
    address: string;
    studentNotes?: string;
    notes?: string;
    shippingPref: string;
  }): Promise<LastOrderSummary> => {
    if (!supabase || !user) throw new Error('Silakan masuk atau buat akun sebelum mengirim pesanan.');
    if (!cart.length) throw new Error('Keranjang masih kosong.');

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (cart.some(item => !uuidRegex.test(item.id))) {
      throw new Error('Keranjang berisi produk lama yang tidak tersinkron. Hapus item tersebut, lalu tambahkan ulang dari katalog.');
    }

    const itemsPayload = cart.map(item => ({
      product_id: item.id,
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      size: item.size,
      is_preorder: Boolean(item.is_preorder),
      school_institution: item.school_institution || ''
    }));
    const notes = [
      orderData.notes?.trim(),
      orderData.studentNotes?.trim() ? `Keterangan sekolah/siswa: ${orderData.studentNotes.trim()}` : '',
      orderData.shippingPref ? `Pilihan pengiriman: ${orderData.shippingPref}` : ''
    ].filter(Boolean).join('\n').slice(0, 2000);

    const { data: orderId, error: createError } = await supabase.rpc('create_order', {
      p_items: itemsPayload,
      p_customer_name: orderData.customerName.trim(),
      p_phone: orderData.phone.trim(),
      p_address: orderData.address.trim(),
      p_notes: notes
    });
    if (createError) throw createError;
    if (!orderId || typeof orderId !== 'string') throw new Error('Server tidak mengembalikan ID pesanan yang valid.');

    // The RPC already committed the order and stock update. Clear the stale cart immediately,
    // then read the authoritative receipt generated by PostgreSQL.
    clearCart();
    const { data: orderRow, error: readError } = await supabase
      .from('orders')
      .select('id, customer_name, phone, subtotal, created_at, status, order_items(product_name, quantity, variant_size, unit_price, is_preorder, school_institution)')
      .eq('id', orderId)
      .single();
    if (readError || !orderRow) {
      throw new Error(`Pesanan sudah tercatat dengan ID ${orderId.slice(0, 8).toUpperCase()}, tetapi struk belum dapat dimuat. Jangan kirim pesanan ulang; buka menu Akun untuk memeriksanya.`);
    }

    const reference = String(orderRow.id).slice(0, 8).toUpperCase();
    const subtotal = Number(orderRow.subtotal) || 0;
    const rupiah = (amount: number) => new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', maximumFractionDigits: 0
    }).format(amount);
    const serverItems = Array.isArray((orderRow as any).order_items) ? (orderRow as any).order_items : [];
    const itemLines = serverItems.map((item: any) => {
      const label = item.is_preorder ? 'PRE-ORDER' : 'READY STOCK';
      const institution = item.school_institution ? ` — ${item.school_institution}` : '';
      const total = Number(item.unit_price) * Number(item.quantity);
      return `${label}: ${item.product_name}${institution} (${item.variant_size})\n${item.quantity} × ${rupiah(Number(item.unit_price))} = ${rupiah(total)}`;
    }).join('\n\n');

    const message = [
      `KONFIRMASI PESANAN INABA HIJAB #${reference}`,
      'Halo Admin INABA, saya ingin mengonfirmasi pesanan yang sudah tercatat di website.',
      '',
      `ID Pesanan: ${orderRow.id}`,
      `Nama Pemesan: ${orderRow.customer_name}`,
      `No. WhatsApp: ${orderRow.phone}`,
      `Alamat Kirim: ${orderData.address.trim()}`,
      '',
      'Daftar Pesanan:',
      itemLines,
      '',
      `Subtotal Produk: ${rupiah(subtotal)}`,
      'Mohon konfirmasi ongkos kirim dan instruksi pembayaran resmi. Terima kasih.'
    ].join('\n');
    const contactWa = cleanPhoneNumber(storeSettings.contact_whatsapp || '');
    const waUrl = contactWa ? `https://wa.me/${contactWa}?text=${encodeURIComponent(message)}` : '';

    const summary: LastOrderSummary = {
      orderId: String(orderRow.id),
      reference,
      customerName: String(orderRow.customer_name),
      customerPhone: String(orderRow.phone),
      shippingPref: orderData.shippingPref,
      subtotal,
      waUrl,
      rawText: message
    };
    setLastOrder(summary);
    setOrders(prev => [
      { id: String(orderRow.id), order_number: `#${reference}`, user_id: user.id,
        customer_name: String(orderRow.customer_name), phone: String(orderRow.phone), address: orderData.address.trim(),
        notes, subtotal, status: String(orderRow.status || 'pending') as Order['status'],
        created_at: String(orderRow.created_at), items: serverItems },
      ...prev.filter(order => order.id !== String(orderRow.id))
    ]);
    return summary;
  }, [cart, user, storeSettings.contact_whatsapp, clearCart]);

  const dbStatus = (status: Order['status']): string => {
    const normalized = String(status).toLowerCase();
    const map: Record<string, string> = {
      'menunggu pembayaran': 'pending', 'menunggu diproses': 'pending', 'menunggu': 'pending', 'pending': 'pending',
      'dikonfirmasi': 'confirmed', 'confirmed': 'confirmed', 'dikemas': 'processing', 'processing': 'processing',
      'dikirim': 'shipped', 'shipped': 'shipped', 'diterima': 'completed', 'completed': 'completed',
      'dibatalkan': 'cancelled', 'batal': 'cancelled', 'cancelled': 'cancelled'
    };
    return map[normalized] || 'pending';
  };

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: Order['status']) => {
    if (!supabase || !isAdmin) throw new Error('Akses admin diperlukan.');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) throw new Error('ID pesanan tidak valid.');
    const normalized = dbStatus(newStatus);
    const { data, error } = await supabase.from('orders').update({ status: normalized }).eq('id', orderId).select('id,status').single();
    if (error) throw error;
    if (!data) throw new Error('Pesanan tidak ditemukan atau akses ditolak.');
    setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: normalized as Order['status'] } : order));
    showToast(`Status pesanan diperbarui menjadi "${normalized}".`);
  }, [isAdmin, showToast]);

  // Products are server-owned data. A failed request is a failure, never a local-only success.
  const saveProduct = useCallback(async (productData: Partial<Product>, isEditingId?: string) => {
    if (!supabase || !isAdmin) throw new Error('Akses admin terverifikasi diperlukan.');
    const payload: Record<string, any> = { ...productData };
    const gallery = Array.isArray(payload.gallery_urls) ? payload.gallery_urls.slice(0, 5) : [];
    payload.gallery_urls = gallery;
    payload.image_url = gallery[0] || payload.image_url || null;
    if (!Array.isArray(payload.variants) || payload.variants.length === 0) {
      throw new Error('Tambahkan minimal satu pilihan ukuran atau varian produk.');
    }
    if (gallery.some((url: unknown) => !isProductStorageUrl(url)) || (payload.image_url && !isProductStorageUrl(payload.image_url))) {
      throw new Error('Foto produk harus diunggah ke bucket product-images di Supabase Storage.');
    }

    let query;
    if (isEditingId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(isEditingId)) {
      query = supabase.from('products').update(payload).eq('id', isEditingId).select().single();
    } else {
      delete payload.id;
      query = supabase.from('products').insert(payload).select().single();
    }
    const { data, error } = await query;
    if (error) throw error;
    if (!data) throw new Error('Server tidak mengembalikan produk yang tersimpan.');
    const saved = { ...data, gallery_urls: Array.isArray(data.gallery_urls) ? data.gallery_urls.slice(0, 5) : [], variants: Array.isArray(data.variants) ? data.variants : [] } as Product;
    setProducts(prev => saved.is_active === false
      ? prev.filter(item => item.id !== saved.id)
      : [saved, ...prev.filter(item => item.id !== saved.id)]);
    return { success: true, backendSuccess: true, backendError: null, product: saved };
  }, [isAdmin]);

  // Delete only after Supabase confirms the operation.
  const deleteProductItem = useCallback(async (id: string) => {
    if (!supabase || !isAdmin) throw new Error('Akses admin terverifikasi diperlukan.');
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    setProducts(prev => prev.filter(product => product.id !== id));
    return { success: true, backendError: null };
  }, [isAdmin]);

  return (
    <StoreContext.Provider
      value={{
        currentView,
        navigateToView,
        products,
        categories,
        siteImages,
        storeSettings,
        activeFilter,
        setActiveFilter,
        poFilter,
        setPoFilter,
        searchText,
        setSearchText,
        sortOption,
        setSortOption,
        selectedDivision,
        setSelectedDivision,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        user,
        profile,
        isAdmin,
        activeModal,
        openModal,
        closeModal,
        detailProduct,
        openProductDetail,
        lastOrder,
        setLastOrder,
        toastMessage,
        showToast,
        refreshProducts,
        saveProduct,
        deleteProductItem,
        createOrder,
        orders,
        updateOrderStatus,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
