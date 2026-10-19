import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Category, CartItem, StoreSettings, UserProfile, Order } from '../types';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES, DEFAULT_STORE_SETTINGS } from '../data/seedData';
import { supabase, ADMIN_ALLOWLIST, cleanPhoneNumber } from '../lib/supabase';

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
  navigateToView: (view: ViewType) => void;
  products: Product[];
  categories: Category[];
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
  createOrder: (orderData: {
    customerName: string;
    phone: string;
    address: string;
    studentNotes?: string;
    notes?: string;
    shippingPref: string;
  }) => Promise<LastOrderSummary>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'inaba_cart_items_v2';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

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
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.toLowerCase() : '';
    if (hash === '#admin') return 'admin';
    if (hash === '#akun' || hash === '#account') return 'customer';
    return 'store';
  });

  const navigateToView = useCallback((view: ViewType) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      if (view === 'admin') {
        window.location.hash = '#admin';
      } else if (view === 'customer') {
        window.location.hash = '#akun';
      } else {
        if (window.location.hash === '#admin' || window.location.hash === '#akun' || window.location.hash === '#account') {
          history.pushState(null, '', window.location.pathname + window.location.search);
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

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

  // Fetch products from Supabase
  const refreshProducts = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (!catError && catData && catData.length > 0) {
        setCategories(catData);
      }

      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (!prodError && prodData && prodData.length > 0) {
        setProducts(prodData);
      }

      // Fetch store settings
      const { data: settsData } = await supabase
        .from('store_settings')
        .select('key, value')
        .in('key', ['contact_whatsapp', 'payment_accounts', 'store_title']);

      if (settsData && settsData.length > 0) {
        const newSettings: StoreSettings = { ...DEFAULT_STORE_SETTINGS };
        for (const row of settsData) {
          if (row.key === 'contact_whatsapp' && typeof row.value === 'string') {
            newSettings.contact_whatsapp = row.value.replace(/\D/g, '') || DEFAULT_STORE_SETTINGS.contact_whatsapp;
          }
          if (row.key === 'payment_accounts' && Array.isArray(row.value)) {
            newSettings.payment_accounts = row.value;
          }
          if (row.key === 'store_title' && typeof row.value === 'string') {
            newSettings.store_title = row.value;
          }
        }
        setStoreSettings(newSettings);
      }
    } catch (err) {
      console.warn('Network issue fetching from Supabase, using default seed inventory.', err);
    }
  }, []);

  // Auth session listener
  useEffect(() => {
    refreshProducts();

    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          setUser(data.session.user);
          const email = (data.session.user.email || '').toLowerCase();
          const isAdminUser = ADMIN_ALLOWLIST.includes(email);
          setProfile({
            id: data.session.user.id,
            email,
            full_name: data.session.user.user_metadata?.full_name || email.split('@')[0],
            role: isAdminUser ? 'admin' : 'customer'
          });
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          const email = (session.user.email || '').toLowerCase();
          const isAdminUser = ADMIN_ALLOWLIST.includes(email);
          setProfile({
            id: session.user.id,
            email,
            full_name: session.user.user_metadata?.full_name || email.split('@')[0],
            role: isAdminUser ? 'admin' : 'customer'
          });
        } else {
          setUser(null);
          setProfile(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [refreshProducts]);

  const isAdmin = Boolean(profile?.role === 'admin');

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

    const chosenSize = (size || '').trim() || 'Standar';

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
          variants: product.variants || [chosenSize],
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

  // Create order
  const createOrder = useCallback(async (orderData: {
    customerName: string;
    phone: string;
    address: string;
    studentNotes?: string;
    notes?: string;
    shippingPref: string;
  }): Promise<LastOrderSummary> => {
    const calculatedSubtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    const readyItems = cart.filter(x => !x.is_preorder);
    const poItems = cart.filter(x => Boolean(x.is_preorder));

    const rupiahStr = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

    let itemLines = '';
    if (readyItems.length) {
      itemLines += `*READY STOCK:*\n` + readyItems.map(item => {
        const qty = item.quantity;
        const price = item.price;
        return `• ${item.name} (${item.size})\n  ${qty} pcs × ${rupiahStr(price)} = ${rupiahStr(qty * price)}`;
      }).join('\n') + '\n\n';
    }
    if (poItems.length) {
      itemLines += `*PRE-ORDER SERAGAM:*\n` + poItems.map(item => {
        const qty = item.quantity;
        const price = item.price;
        const inst = item.school_institution ? ` [${item.school_institution}]` : '';
        return `• ${item.name}${inst} (${item.size})\n  ${qty} pcs × ${rupiahStr(price)} = ${rupiahStr(qty * price)}`;
      }).join('\n') + '\n';
    }

    const reference = 'INB-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const contactWa = cleanPhoneNumber(storeSettings.contact_whatsapp || '6285735144904');

    const waMsgLines = [
      `*KONFIRMASI PESANAN INABA HIJAB #${reference}*`,
      `Halo Admin INABA, saya ingin mengonfirmasi pesanan yang sudah tercatat di website:`,
      ``,
      `*ID Pesanan:* #${reference}`,
      `*Nama Pemesan:* ${orderData.customerName}`,
      `*No. WhatsApp:* ${orderData.phone}`,
      `*Alamat Kirim:* ${orderData.address}`,
      poItems.length ? `*Pilihan Pengiriman:* ${orderData.shippingPref}` : '',
      orderData.studentNotes ? `*Keterangan Siswa/Seragam:* ${orderData.studentNotes}` : '',
      orderData.notes ? `*Catatan Tambahan:* ${orderData.notes}` : '',
      ``,
      `*Daftar Pesanan:*`,
      itemLines.trim(),
      ``,
      `*Subtotal Produk:* ${rupiahStr(calculatedSubtotal)}`,
      `*Status:* Menunggu konfirmasi ongkir & nomor rekening resmi.`,
      ``,
      `Mohon informasi biaya ongkos kirim ke alamat saya serta nomor rekening transfer resmi ya admin. Terima kasih banyak!`
    ].filter(Boolean).join('\n');

    const waUrl = `https://wa.me/${contactWa}?text=${encodeURIComponent(waMsgLines)}`;

    // Try storing into Supabase if user is logged in
    if (supabase && user) {
      try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const itemsPayload = cart.map(x => ({
          product_id: uuidRegex.test(x.id) ? x.id : null,
          product_name: x.name,
          quantity: x.quantity,
          variant_size: x.size,
          unit_price: x.price,
          is_preorder: !!x.is_preorder,
          school_institution: x.school_institution || ''
        }));

        await supabase.from('orders').insert({
          user_id: user.id,
          customer_name: orderData.customerName,
          phone: orderData.phone,
          address: orderData.address,
          notes: [orderData.notes, orderData.studentNotes ? `Ket: ${orderData.studentNotes}` : '', `[Kirim: ${orderData.shippingPref}]`].filter(Boolean).join('\n'),
          subtotal: calculatedSubtotal,
          status: 'pending'
        });
      } catch (err) {
        console.warn('Could not record to database directly:', err);
      }
    }

    const summary: LastOrderSummary = {
      orderId: reference,
      reference,
      customerName: orderData.customerName,
      customerPhone: orderData.phone,
      shippingPref: orderData.shippingPref,
      subtotal: calculatedSubtotal,
      waUrl,
      rawText: waMsgLines
    };

    setLastOrder(summary);
    clearCart();
    return summary;
  }, [cart, user, storeSettings, clearCart]);

  return (
    <StoreContext.Provider
      value={{
        currentView,
        navigateToView,
        products,
        categories,
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
        createOrder
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
