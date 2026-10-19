export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock?: number | null;
  image_url?: string | null;
  badge?: string | null;
  featured?: boolean;
  is_active?: boolean;
  is_preorder?: boolean;
  preorder_status?: 'open' | 'closed' | 'completed';
  school_institution?: string;
  estimated_delivery?: string;
  min_order?: number;
  description?: string;
  variants?: string[];
  size_guide?: string;
  specifications?: Record<string, string>;
  gallery_urls?: string[];
  created_at?: string;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface CartItem {
  cart_item_id: string;
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url?: string;
  quantity: number;
  size: string;
  min_order?: number;
  is_preorder?: boolean;
  school_institution?: string;
  is_active?: boolean;
  preorder_status?: string;
  variants?: string[];
  size_guide?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  variant_size: string;
  unit_price: number;
  is_preorder?: boolean;
  school_institution?: string;
}

export interface Order {
  id: string;
  user_id?: string;
  customer_name: string;
  phone: string;
  address: string;
  student_notes?: string;
  notes?: string;
  shipping_pref?: string;
  subtotal: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  created_at: string;
  items?: OrderItem[];
}

export interface StoreSettings {
  store_title: string;
  contact_whatsapp: string;
  payment_accounts: Array<{
    label: string;
    detail: string;
  }>;
}

export interface SiteImage {
  key: string;
  label: string;
  image_url: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: 'customer' | 'admin';
}
