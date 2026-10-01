export type UserRole = 'customer' | 'staff' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  whatsapp_number?: string;
  avatar_url?: string;
  role: UserRole;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export type StockStatus = 'in_stock' | 'limited' | 'out_of_stock';

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  category_id: string;
  category_name?: string;
  price: number; // in NGN
  promo_price?: number; // in NGN
  currency: 'NGN' | 'USD' | 'GHS' | 'KES';
  subscription_duration: string; // e.g. "18 Months", "1 Month", "1 Year"
  stock_status: StockStatus;
  stock_quantity: number;
  is_featured: boolean;
  is_on_sale: boolean;
  is_trending?: boolean;
  is_best_seller?: boolean;
  is_new?: boolean;
  is_active: boolean;
  image_url: string;
  images?: string[];
  features: string[];
  delivery_method?: string; // e.g. "Email & WhatsApp Instant Delivery"
  rating?: number;
  reviews_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedDuration?: string;
}

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'processing' | 'fulfilled' | 'cancelled' | 'refunded';
export type DeliveryStatus = 'pending' | 'processing' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  subscription_duration: string;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string; // e.g. "SAMM-2026-000124"
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_whatsapp: string;
  customer_country: string;
  order_notes?: string;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  currency: 'NGN' | 'USD' | 'GHS' | 'KES';
  discount_code?: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  payment_reference?: string;
  receipt_url?: string;
  sender_name?: string;
  payment_provider: 'Paystack' | 'Card' | 'Transfer' | 'OPay Transfer';
  delivery_status: DeliveryStatus;
  created_at: string;
  updated_at: string;
}

export interface DeliveryRecord {
  id: string;
  order_id: string;
  order_number: string;
  customer_id: string;
  customer_email: string;
  customer_whatsapp: string;
  product_id: string;
  product_name: string;
  delivery_method: string;
  delivery_status: DeliveryStatus;
  delivery_instructions: string;
  access_information: string; // activation key, login credential, or invitation link
  subscription_start?: string;
  subscription_end?: string;
  fulfilled_by?: string;
  fulfilled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  order_number: string;
  customer_id: string;
  customer_email: string;
  provider: 'Paystack';
  reference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'successful' | 'failed' | 'refunded';
  gateway_response?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // e.g. 10 for 10%, or 2000 for NGN 2000
  minimum_order_amount: number;
  maximum_discount?: number;
  usage_limit: number;
  used_count: number;
  starts_at?: string;
  expires_at?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Review {
  id: string;
  product_id: string;
  product_name?: string;
  customer_id: string;
  customer_name: string;
  customer_role?: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  is_published: boolean;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SiteSettings {
  brand_name: string;
  tagline: string;
  whatsapp_number: string;
  support_email: string;
  currency: string;
  announcement_text: string;
  hero_title: string;
  hero_description: string;
  social_links: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };
  paystack_public_key?: string;
  opay_account_number?: string;
  opay_account_name?: string;
  opay_bank_name?: string;
}

export interface AuditLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'delivery' | 'status_change';
  entity: 'product' | 'order' | 'discount' | 'settings' | 'storage';
  entity_id?: string;
  details: string;
  metadata?: Record<string, any>;
  performed_by: string;
  status: 'success' | 'failed' | 'warning';
  synced_to_supabase: boolean;
  created_at: string;
}

export interface PaystackSuccessResponse {
  reference: string;
  trans?: string;
  status?: string;
  message?: string;
  transaction?: string;
}

export interface PaystackPaymentOptions {
  orderId: string;
  orderNumber: string;
  email: string;
  amount: number; // in standard currency (e.g. NGN 15000), converted to Kobo internally
  currency?: string;
  customerName: string;
  customerWhatsapp: string;
  publicKey?: string;
  onSuccess: (response: PaystackSuccessResponse) => void | Promise<void>;
  onCancel?: () => void;
  onError?: (error: Error) => void;
}

export interface EmailNotification {
  id: string;
  order_id: string;
  order_number: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  body_text: string;
  body_html: string;
  sent_at: string;
  status: 'sent' | 'delivered' | 'failed';
}
