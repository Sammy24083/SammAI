import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { deliveryService } from '../services/deliveryService';
import { discountService, adminService } from '../services/discountService';
import { auditService } from '../services/auditService';
import {
  Product,
  Category,
  Order,
  Discount,
  FAQ,
  SiteSettings,
  DeliveryRecord,
  AuditLog,
} from '../types';
import { AuditLogsPanel } from '../components/admin/AuditLogsPanel';
import { OrderVerificationView } from '../components/admin/OrderVerificationView';
import { ThemeToggle } from '../components/ThemeToggle';
import { uploadImageToSupabase, BUCKETS, FALLBACK_PRODUCT_IMAGE, getSafeImageUrl } from '../lib/storage';
import {
  BarChart3,
  Package,
  ShoppingBag,
  Tag,
  HelpCircle,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Search,
  ExternalLink,
  ShieldCheck,
  Send,
  X,
  Sparkles,
  FileText,
  Eye,
  CheckCircle2,
  MessageCircle,
  XCircle,
  FileCheck2,
  Upload,
  Image as ImageIcon,
  Flame,
  Award,
  Star,
  DollarSign,
  Check,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

interface AdminDashboardPageProps {
  categories: Category[];
  onNavigateHome: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  categories,
  onNavigateHome,
}) => {
  const { user, isAdmin, switchRole } = useAuth();
  const { formatPrice } = useCurrency();

  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'verification' | 'discounts' | 'faqs' | 'settings' | 'audit'>('analytics');

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Pending verification count for notification badge
  const pendingVerificationCount = orders.filter(
    (o) => o.payment_status === 'pending' && (o.receipt_url || o.payment_provider === 'OPay Transfer' || o.payment_provider === 'Transfer')
  ).length;
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Fulfillment Modal
  const [fulfillingOrder, setFulfillingOrder] = useState<Order | null>(null);
  const [accessInfoInput, setAccessInfoInput] = useState('');
  const [deliveryInstructionsInput, setDeliveryInstructionsInput] = useState('');

  // Discount Modal
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  // Product Form State
  const [pName, setPName] = useState('');
  const [pSlug, setPSlug] = useState('');
  const [pShortDesc, setPShortDesc] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pCategory, setPCategory] = useState(categories[0]?.id || '');
  const [pPrice, setPPrice] = useState(20000);
  const [pPromoPrice, setPPromoPrice] = useState<number | undefined>(15000);
  const [pDuration, setPDuration] = useState('18 Months');
  const [pStockStatus, setPStockStatus] = useState<'in_stock' | 'limited' | 'out_of_stock'>('in_stock');
  const [pIsFeatured, setPIsFeatured] = useState(false);
  const [pIsOnSale, setPIsOnSale] = useState(false);
  const [pIsTrending, setPIsTrending] = useState(false);
  const [pIsBestSeller, setPIsBestSeller] = useState(false);
  const [pIsNew, setPIsNew] = useState(false);
  const [pImage, setPImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');
  const [pFeatures, setPFeatures] = useState('Advanced AI features\nMultimodal Reasoning\nEmail Delivery');

  // Discount Form State
  const [dCode, setDCode] = useState('');
  const [dType, setDType] = useState<'percentage' | 'fixed'>('percentage');
  const [dValue, setDValue] = useState(15);
  const [dMinOrder, setDMinOrder] = useState(5000);

  // Search in Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick Price Edit State
  const [priceEditProduct, setPriceEditProduct] = useState<Product | null>(null);
  const [quickPrice, setQuickPrice] = useState<number>(0);
  const [quickPromoPrice, setQuickPromoPrice] = useState<number | undefined>(undefined);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);

  // Quick Image Edit & Upload State
  const [imageEditProduct, setImageEditProduct] = useState<Product | null>(null);
  const [quickImageUrl, setQuickImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Product Search & Filter
  const [productSearch, setProductSearch] = useState('');
  const [productBadgeFilter, setProductBadgeFilter] = useState<'all' | 'trending' | 'best_seller' | 'featured' | 'in_stock' | 'out_of_stock'>('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadAllData();

    const handleStoreUpdate = () => {
      loadAllData();
    };

    window.addEventListener('samm-store-update', handleStoreUpdate);
    window.addEventListener('storage', handleStoreUpdate);
    const interval = setInterval(loadAllData, 5000);

    return () => {
      window.removeEventListener('samm-store-update', handleStoreUpdate);
      window.removeEventListener('storage', handleStoreUpdate);
      clearInterval(interval);
    };
  }, []);

  const loadAllData = async () => {
    const prods = await productService.getAllProductsAdmin();
    const ords = await orderService.getOrders();
    const discs = await discountService.getAllDiscounts();
    const fqs = await adminService.getFaqs();
    const sets = await adminService.getSiteSettings();
    const anlyt = await adminService.getAnalytics();
    const logs = await auditService.getLogs();

    setProducts(prods);
    setOrders(ords);
    setDiscounts(discs);
    setFaqs(fqs);
    setSiteSettings(sets);
    setAnalytics(anlyt);
    setAuditLogs(logs);
  };

  const openCreateProductModal = () => {
    setEditingProduct(null);
    setPName('');
    setPSlug('');
    setPShortDesc('');
    setPDesc('');
    setPCategory(categories[0]?.id || '');
    setPPrice(20000);
    setPPromoPrice(15000);
    setPDuration('1 Month');
    setPStockStatus('in_stock');
    setPIsFeatured(false);
    setPIsOnSale(false);
    setPIsTrending(false);
    setPIsBestSeller(false);
    setPIsNew(false);
    setPImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');
    setPFeatures('Instant WhatsApp delivery\nPrivate activation\n24/7 Support');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setPName(product.name);
    setPSlug(product.slug);
    setPShortDesc(product.short_description);
    setPDesc(product.description);
    setPCategory(product.category_id);
    setPPrice(product.price);
    setPPromoPrice(product.promo_price);
    setPDuration(product.subscription_duration);
    setPStockStatus(product.stock_status);
    setPIsFeatured(product.is_featured);
    setPIsOnSale(product.is_on_sale);
    setPIsTrending(Boolean(product.is_trending));
    setPIsBestSeller(Boolean(product.is_best_seller));
    setPIsNew(Boolean(product.is_new));
    setPImage(product.image_url);
    setPFeatures(product.features.join('\n'));
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const featuresArray = pFeatures.split('\n').filter((f) => f.trim().length > 0);
    const cat = categories.find((c) => c.id === pCategory);

    const productPayload = {
      name: pName,
      slug: pSlug || pName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      short_description: pShortDesc,
      description: pDesc,
      category_id: pCategory,
      category_name: cat?.name || 'AI Tools',
      price: Number(pPrice),
      promo_price: pPromoPrice ? Number(pPromoPrice) : undefined,
      currency: 'NGN' as const,
      subscription_duration: pDuration,
      stock_status: pStockStatus,
      stock_quantity: 100,
      is_featured: pIsFeatured,
      is_on_sale: pIsOnSale,
      is_trending: pIsTrending,
      is_best_seller: pIsBestSeller,
      is_new: pIsNew,
      is_active: true,
      image_url: pImage,
      features: featuresArray,
    };

    if (editingProduct) {
      await productService.updateProduct(editingProduct.id, productPayload);
    } else {
      await productService.createProduct(productPayload);
    }

    setIsProductModalOpen(false);
    await loadAllData();
  };

  const handleDeleteProduct = (prod: Product) => {
    setProductToDelete(prod);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await productService.deleteProduct(productToDelete.id);
      setProductToDelete(null);
      await loadAllData();
    } catch (err: any) {
      console.error('Failed to delete product:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick Price Edit Handler
  const openQuickPriceModal = (product: Product) => {
    setPriceEditProduct(product);
    setQuickPrice(product.price);
    setQuickPromoPrice(product.promo_price);
  };

  const handleSaveQuickPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceEditProduct) return;
    setIsUpdatingPrice(true);
    try {
      const updatedPrice = Number(quickPrice);
      const updatedPromo = quickPromoPrice ? Number(quickPromoPrice) : undefined;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === priceEditProduct.id
            ? { ...p, price: updatedPrice, promo_price: updatedPromo }
            : p
        )
      );

      await productService.updateProduct(priceEditProduct.id, {
        price: updatedPrice,
        promo_price: updatedPromo,
      });

      await auditService.logAction({
        action: 'update',
        entity: 'product',
        entity_id: priceEditProduct.id,
        details: `Updated price for ${priceEditProduct.name}: ₦${updatedPrice.toLocaleString()}${
          updatedPromo ? ` (Promo: ₦${updatedPromo.toLocaleString()})` : ''
        }`,
        status: 'success',
      });

      setPriceEditProduct(null);
      await loadAllData();
    } catch (err: any) {
      console.error('Failed to update price:', err);
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  // Quick Image Manager Handlers
  const openQuickImageModal = (product: Product) => {
    setImageEditProduct(product);
    setQuickImageUrl(product.image_url || '');
  };

  const handleUploadImageFile = async (file: File) => {
    if (!imageEditProduct) return;
    setIsUploadingImage(true);
    try {
      const url = await uploadImageToSupabase(file, BUCKETS.PRODUCTS);
      setQuickImageUrl(url);

      setProducts((prev) =>
        prev.map((p) => (p.id === imageEditProduct.id ? { ...p, image_url: url } : p))
      );

      await productService.updateProduct(imageEditProduct.id, { image_url: url });
      await auditService.logAction({
        action: 'update',
        entity: 'product',
        entity_id: imageEditProduct.id,
        details: `Uploaded new product image for "${imageEditProduct.name}"`,
        status: 'success',
      });
      await loadAllData();
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      alert('Image upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!imageEditProduct) return;
    setIsUploadingImage(true);
    try {
      const fallbackUrl = FALLBACK_PRODUCT_IMAGE;
      setQuickImageUrl(fallbackUrl);

      setProducts((prev) =>
        prev.map((p) => (p.id === imageEditProduct.id ? { ...p, image_url: fallbackUrl } : p))
      );

      await productService.updateProduct(imageEditProduct.id, { image_url: fallbackUrl });
      await auditService.logAction({
        action: 'update',
        entity: 'product',
        entity_id: imageEditProduct.id,
        details: `Deleted custom image for "${imageEditProduct.name}", reset to standard visual`,
        status: 'warning',
      });
      await loadAllData();
    } catch (err: any) {
      console.error('Failed to delete image:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveImageUrlDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageEditProduct) return;
    setIsUploadingImage(true);
    try {
      const finalUrl = quickImageUrl.trim() || FALLBACK_PRODUCT_IMAGE;
      setProducts((prev) =>
        prev.map((p) => (p.id === imageEditProduct.id ? { ...p, image_url: finalUrl } : p))
      );

      await productService.updateProduct(imageEditProduct.id, { image_url: finalUrl });
      await auditService.logAction({
        action: 'update',
        entity: 'product',
        entity_id: imageEditProduct.id,
        details: `Updated image URL for "${imageEditProduct.name}"`,
        status: 'success',
      });
      setImageEditProduct(null);
      await loadAllData();
    } catch (err: any) {
      console.error('Failed to save image URL:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // 1-Click Toggle Trending
  const handleToggleTrending = async (product: Product) => {
    const nextVal = !product.is_trending;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_trending: nextVal } : p))
    );
    await productService.updateProduct(product.id, { is_trending: nextVal });
    await auditService.logAction({
      action: 'update',
      entity: 'product',
      entity_id: product.id,
      details: `${nextVal ? 'Added' : 'Removed'} Trending badge for "${product.name}"`,
      status: 'success',
    });
    await loadAllData();
  };

  // 1-Click Toggle Best Seller
  const handleToggleBestSeller = async (product: Product) => {
    const nextVal = !product.is_best_seller;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_best_seller: nextVal } : p))
    );
    await productService.updateProduct(product.id, { is_best_seller: nextVal });
    await auditService.logAction({
      action: 'update',
      entity: 'product',
      entity_id: product.id,
      details: `${nextVal ? 'Added' : 'Removed'} Best Seller badge for "${product.name}"`,
      status: 'success',
    });
    await loadAllData();
  };

  // 1-Click Toggle Most Valued / Featured
  const handleToggleFeatured = async (product: Product) => {
    const nextVal = !product.is_featured;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_featured: nextVal } : p))
    );
    await productService.updateProduct(product.id, { is_featured: nextVal });
    await auditService.logAction({
      action: 'update',
      entity: 'product',
      entity_id: product.id,
      details: `${nextVal ? 'Added' : 'Removed'} Most Valued / Featured tag for "${product.name}"`,
      status: 'success',
    });
    await loadAllData();
  };

  // 1-Click Update Stock Status
  const handleUpdateStockStatus = async (
    product: Product,
    newStatus: 'in_stock' | 'limited' | 'out_of_stock'
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, stock_status: newStatus } : p))
    );
    await productService.updateProduct(product.id, { stock_status: newStatus });
    await auditService.logAction({
      action: 'update',
      entity: 'product',
      entity_id: product.id,
      details: `Changed stock status of "${product.name}" to ${newStatus.toUpperCase()}`,
      status: newStatus === 'out_of_stock' ? 'warning' : 'success',
    });
    await loadAllData();
  };

  // Filtered Products computation
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (productCategoryFilter !== 'all' && prod.category_id !== productCategoryFilter) {
        return false;
      }
      if (productBadgeFilter === 'trending' && !prod.is_trending) return false;
      if (productBadgeFilter === 'best_seller' && !prod.is_best_seller) return false;
      if (productBadgeFilter === 'featured' && !prod.is_featured) return false;
      if (productBadgeFilter === 'in_stock' && prod.stock_status !== 'in_stock') return false;
      if (productBadgeFilter === 'out_of_stock' && prod.stock_status !== 'out_of_stock') return false;

      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesSlug = prod.slug.toLowerCase().includes(q);
        const matchesCategory = (prod.category_name || '').toLowerCase().includes(q);
        const matchesDuration = (prod.subscription_duration || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSlug && !matchesCategory && !matchesDuration) {
          return false;
        }
      }
      return true;
    });
  }, [products, productBadgeFilter, productCategoryFilter, productSearch]);

  // Order fulfillment handler
  const handleOpenFulfill = (order: Order) => {
    setFulfillingOrder(order);
    setAccessInfoInput(`Account Credentials:\nEmail: ${order.customer_email}\nLicense Key / Invite: SAMM-AI-PRO-${Math.random().toString(36).substring(2, 9).toUpperCase()}\nAccess Duration: Full Plan`);
    setDeliveryInstructionsInput(`Hi ${order.customer_name}, your subscription has been officially activated. Check your inbox and follow the invitation link.`);
  };

  const handleConfirmFulfill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fulfillingOrder) return;

    // Fulfill delivery record
    await deliveryService.createRecord({
      order_id: fulfillingOrder.id,
      order_number: fulfillingOrder.order_number,
      customer_id: fulfillingOrder.customer_id,
      customer_email: fulfillingOrder.customer_email,
      customer_whatsapp: fulfillingOrder.customer_whatsapp,
      product_id: fulfillingOrder.items[0]?.product_id || 'prod',
      product_name: fulfillingOrder.items.map((i) => i.product_name).join(', '),
      delivery_method: 'Email & WhatsApp Instant Delivery',
      delivery_status: 'delivered',
      delivery_instructions: deliveryInstructionsInput,
      access_information: accessInfoInput,
      fulfilled_by: user?.full_name || 'Admin Operations',
      fulfilled_at: new Date().toISOString(),
    });

    await orderService.updateOrderStatus(fulfillingOrder.id, {
      order_status: 'fulfilled',
      delivery_status: 'delivered',
      payment_status: 'paid',
    });

    setFulfillingOrder(null);
    await loadAllData();
  };

  // Discount handler
  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    await discountService.createDiscount({
      code: dCode.toUpperCase().trim(),
      type: dType,
      value: Number(dValue),
      minimum_order_amount: Number(dMinOrder),
      usage_limit: 1000,
      is_active: true,
    });
    setIsDiscountModalOpen(false);
    setDCode('');
    await loadAllData();
  };

  const handleDeleteDiscount = async (id: string) => {
    await discountService.deleteDiscount(id);
    await loadAllData();
  };

  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

  // Settings update
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteSettings) return;
    await adminService.updateSiteSettings(siteSettings);
    await auditService.logAction({
      action: 'update',
      entity: 'settings',
      details: 'Updated store contact, Paystack key, and OPay account details',
      status: 'success',
      metadata: {
        paystack_configured: Boolean(siteSettings.paystack_public_key),
        opay_account: siteSettings.opay_account_number,
      }
    });
    setSettingsFeedback('Site & Payment settings saved successfully!');
    setTimeout(() => setSettingsFeedback(null), 4000);
  };

  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'paid' | 'fulfilled' | 'cancelled'>('all');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  const handleCancelOrder = async (order: Order, reason = 'Cancelled by Admin') => {
    if (!window.confirm(`Are you sure you want to CANCEL Order #${order.order_number}?`)) {
      return;
    }
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id || o.order_number === order.order_number
          ? {
              ...o,
              order_status: 'cancelled',
              payment_status: 'failed',
              delivery_status: 'cancelled',
              updated_at: new Date().toISOString(),
            }
          : o
      )
    );

    await orderService.cancelOrder(order.id, reason, 'admin');
    await auditService.logAction({
      action: 'update',
      entity: 'order',
      entity_id: order.id,
      details: `Admin cancelled order ${order.order_number} (${reason})`,
      status: 'warning',
    });
    await loadAllData();
  };

  const handleApproveOrderPayment = async (order: Order) => {
    await orderService.updateOrderStatus(order.id, {
      payment_status: 'paid',
      order_status: 'processing',
    });
    await auditService.logAction({
      action: 'update',
      entity: 'order',
      entity_id: order.id,
      details: `Approved payment for order ${order.order_number}`,
      status: 'success',
    });
    await loadAllData();
  };

  const handleRejectOrderPayment = async (order: Order, reason = 'Unverified transfer or duplicate receipt') => {
    if (!window.confirm(`Are you sure you want to REJECT the payment proof for Order #${order.order_number}? This will mark payment as failed.`)) {
      return;
    }
    await orderService.updateOrderStatus(order.id, {
      payment_status: 'failed',
      order_status: 'cancelled',
      delivery_status: 'cancelled',
    });
    await auditService.logAction({
      action: 'update',
      entity: 'order',
      entity_id: order.id,
      details: `Rejected transfer receipt for order ${order.order_number}: ${reason}`,
      status: 'warning',
    });
    await loadAllData();
  };

  const handleToggleOrderStatus = async (
    order: Order,
    newStatus: 'pending' | 'paid' | 'cancelled'
  ) => {
    let payment_status: 'pending' | 'paid' | 'failed' = 'pending';
    let order_status: 'pending' | 'processing' | 'cancelled' = 'pending';
    let delivery_status: 'pending' | 'processing' | 'delivered' | 'cancelled' = order.delivery_status;

    if (newStatus === 'paid') {
      payment_status = 'paid';
      order_status = 'processing';
      if (delivery_status === 'cancelled') delivery_status = 'pending';
    } else if (newStatus === 'cancelled') {
      payment_status = 'failed';
      order_status = 'cancelled';
      delivery_status = 'cancelled';
    } else {
      payment_status = 'pending';
      order_status = 'pending';
      delivery_status = 'pending';
    }

    // Instant optimistic UI update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              payment_status,
              order_status,
              delivery_status,
              updated_at: new Date().toISOString(),
            }
          : o
      )
    );

    // Database / Store update
    await orderService.updateOrderStatus(order.id, {
      payment_status,
      order_status,
      delivery_status,
    });

    await auditService.logAction({
      action: 'update',
      entity: 'order',
      entity_id: order.id,
      details: `Toggled order ${order.order_number} status to ${newStatus.toUpperCase()}`,
      status: newStatus === 'cancelled' ? 'warning' : 'success',
    });

    await loadAllData();
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'pending' && o.payment_status !== 'pending') return false;
    if (orderFilter === 'paid' && (o.payment_status !== 'paid' || o.order_status === 'fulfilled')) return false;
    if (orderFilter === 'fulfilled' && o.order_status !== 'fulfilled') return false;
    if (orderFilter === 'cancelled' && o.order_status !== 'cancelled') return false;

    if (!orderSearch.trim()) return true;
    const q = orderSearch.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q) ||
      o.customer_whatsapp.toLowerCase().includes(q)
    );
  });

  return (
    <div className="py-8 sm:py-12 bg-slate-950 min-h-screen text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                SAMM AI ADMIN ENGINE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Store Management &amp; Analytics
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage products, live pricing, customer orders, Paystack verification, and digital delivery.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={onNavigateHome}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Live Store</span>
            </button>

            <button
              onClick={() => switchRole('customer')}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all"
            >
              Switch to Customer
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mb-8 gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'analytics', label: 'Analytics & Sales', icon: BarChart3 },
            { id: 'products', label: `Products (${products.length})`, icon: Package },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
            {
              id: 'verification',
              label: `Order Verification`,
              icon: FileCheck2,
              badge: pendingVerificationCount > 0 ? pendingVerificationCount : undefined,
            },
            { id: 'discounts', label: `Discounts (${discounts.length})`, icon: Tag },
            { id: 'faqs', label: 'FAQs & Help', icon: HelpCircle },
            { id: 'settings', label: 'Site Settings', icon: Settings },
            { id: 'audit', label: `Audit Logs (${auditLogs.length})`, icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all relative flex items-center gap-2 whitespace-nowrap ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black animate-pulse">
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* 1. ANALYTICS TAB */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">
                  Total Verified Revenue
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1 block">
                  {formatPrice(analytics.totalRevenue)}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  From {analytics.paidOrdersCount} paid transactions
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">
                  Total Orders
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 block">
                  {analytics.totalOrdersCount}
                </span>
                <span className="text-[11px] text-emerald-400 mt-1 block">
                  {analytics.fulfilledOrdersCount} fulfilled &amp; delivered
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">
                  Registered Customers
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 block">
                  {analytics.totalCustomersCount}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">Across Nigeria, Ghana, Kenya</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">
                  Avg. Order Value (AOV)
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 block">
                  {formatPrice(analytics.averageOrderValue)}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">Per paid subscription</span>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Orders Stream
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-2.5">Order Number</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">Items</th>
                      <th className="py-2.5">Amount</th>
                      <th className="py-2.5">Payment</th>
                      <th className="py-2.5">Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-850/50">
                        <td className="py-3 font-mono font-bold text-emerald-400">{ord.order_number}</td>
                        <td className="py-3">
                          <div className="font-semibold text-white">{ord.customer_name}</div>
                          <div className="text-[11px] text-slate-400">{ord.customer_whatsapp}</div>
                        </td>
                        <td className="py-3 text-slate-300">
                          {ord.items.map((i) => i.product_name).join(', ')}
                        </td>
                        <td className="py-3 font-mono font-bold text-white">{formatPrice(ord.total_amount)}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 uppercase">
                            {ord.payment_status}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ord.delivery_status === 'delivered'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-500/10 text-amber-300'
                            }`}
                          >
                            {ord.delivery_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                    CATALOGUE &amp; INVENTORY CONTROL
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    Live Pricing
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                  Product Catalogue Management
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Update prices, upload/delete images, toggle Trending, Best Seller, or Most Valued badges, and switch stock availability.
                </p>
              </div>

              <button
                onClick={openCreateProductModal}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Top KPI Stat Cards with 1-Click Filter */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div
                onClick={() => setProductBadgeFilter('all')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  productBadgeFilter === 'all'
                    ? 'bg-slate-850 border-emerald-500/40 shadow-lg'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">
                  Total Items
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">{products.length}</span>
                  <Package className="w-5 h-5 text-slate-500" />
                </div>
              </div>

              <div
                onClick={() => setProductBadgeFilter('trending')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  productBadgeFilter === 'trending'
                    ? 'bg-violet-950/20 border-violet-500/40 shadow-lg shadow-violet-500/5'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-[11px] text-violet-300 uppercase tracking-wider block font-bold">
                  🔥 Trending
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-violet-400 font-mono">
                    {products.filter((p) => p.is_trending).length}
                  </span>
                  <Flame className="w-5 h-5 text-violet-400" />
                </div>
              </div>

              <div
                onClick={() => setProductBadgeFilter('best_seller')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  productBadgeFilter === 'best_seller'
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-[11px] text-amber-300 uppercase tracking-wider block font-bold">
                  🏆 Best Sellers
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                    {products.filter((p) => p.is_best_seller).length}
                  </span>
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
              </div>

              <div
                onClick={() => setProductBadgeFilter('featured')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  productBadgeFilter === 'featured'
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-[11px] text-emerald-300 uppercase tracking-wider block font-bold">
                  ⭐ Most Valued
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                    {products.filter((p) => p.is_featured).length}
                  </span>
                  <Star className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              <div
                onClick={() => setProductBadgeFilter('out_of_stock')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all col-span-2 sm:col-span-1 ${
                  productBadgeFilter === 'out_of_stock'
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-500/5'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-[11px] text-rose-300 uppercase tracking-wider block font-bold">
                  ⚠️ Out of Stock
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                    {products.filter((p) => p.stock_status === 'out_of_stock').length}
                  </span>
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by title, slug, or duration..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                {productSearch && (
                  <button
                    onClick={() => setProductSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500 shrink-0"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto scrollbar-none shrink-0">
                {[
                  { id: 'all', label: `All (${products.length})` },
                  { id: 'trending', label: `🔥 Trending (${products.filter((p) => p.is_trending).length})` },
                  { id: 'best_seller', label: `🏆 Best Seller (${products.filter((p) => p.is_best_seller).length})` },
                  { id: 'featured', label: `⭐ Most Valued (${products.filter((p) => p.is_featured).length})` },
                  { id: 'in_stock', label: `In Stock (${products.filter((p) => p.stock_status === 'in_stock').length})` },
                  { id: 'out_of_stock', label: `Out of Stock (${products.filter((p) => p.stock_status === 'out_of_stock').length})` },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setProductBadgeFilter(pill.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      productBadgeFilter === pill.id
                        ? 'bg-emerald-500 text-black font-extrabold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Table */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Product &amp; Visual</th>
                      <th className="py-3.5 px-4 font-semibold">Category / Plan</th>
                      <th className="py-3.5 px-4 font-semibold">Price &amp; Promo</th>
                      <th className="py-3.5 px-4 font-semibold">Badges (1-Click Toggle)</th>
                      <th className="py-3.5 px-4 font-semibold">Stock Availability</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <p className="font-semibold text-white">No products found</p>
                          <p className="text-xs text-slate-500 mt-1">Try resetting search or filter criteria.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-850/50 transition-colors">
                          {/* 1. Image Thumbnail & Title */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                onClick={() => openQuickImageModal(prod)}
                                className="group relative w-12 h-12 rounded-xl bg-slate-950 border border-slate-750 overflow-hidden shrink-0 cursor-pointer shadow-sm hover:border-emerald-500 transition-all"
                                title="Click to upload, update or delete image"
                              >
                                <img
                                  src={getSafeImageUrl(prod.image_url, prod.slug)}
                                  alt={prod.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                                </div>
                              </div>
                              <div>
                                <div className="font-bold text-white text-sm">{prod.name}</div>
                                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                                  <span>{prod.slug}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Category & Duration */}
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium block w-max">
                              {prod.category_name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                              {prod.subscription_duration}
                            </span>
                          </td>

                          {/* 3. Price / Promo with Quick Edit Pencil */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div>
                                {prod.promo_price ? (
                                  <div>
                                    <span className="text-emerald-400 font-mono font-black text-sm">
                                      {formatPrice(prod.promo_price)}
                                    </span>
                                    <span className="text-[11px] text-slate-400 line-through ml-1.5 font-mono">
                                      {formatPrice(prod.price)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-white font-mono font-black text-sm">
                                    {formatPrice(prod.price)}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => openQuickPriceModal(prod)}
                                className="p-1 rounded bg-slate-800/80 hover:bg-emerald-500 hover:text-black text-slate-400 transition-colors"
                                title="Quick update price & promo"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* 4. Badges 1-Click Interactive Toggles */}
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Trending Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleTrending(prod)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border ${
                                  prod.is_trending
                                    ? 'bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-sm'
                                    : 'bg-slate-950/60 text-slate-500 border-slate-800 hover:text-violet-300 hover:border-violet-500/30'
                                }`}
                                title={prod.is_trending ? 'Remove Trending badge' : 'Mark as Trending'}
                              >
                                <Flame className="w-3 h-3" />
                                <span>Trending</span>
                              </button>

                              {/* Best Seller Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleBestSeller(prod)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border ${
                                  prod.is_best_seller
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                                    : 'bg-slate-950/60 text-slate-500 border-slate-800 hover:text-amber-300 hover:border-amber-500/30'
                                }`}
                                title={prod.is_best_seller ? 'Remove Best Seller badge' : 'Mark as Best Seller'}
                              >
                                <Award className="w-3 h-3" />
                                <span>Best Seller</span>
                              </button>

                              {/* Most Valued / Featured Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleFeatured(prod)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border ${
                                  prod.is_featured
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                                    : 'bg-slate-950/60 text-slate-500 border-slate-800 hover:text-emerald-300 hover:border-emerald-500/30'
                                }`}
                                title={prod.is_featured ? 'Remove Most Valued badge' : 'Mark as Most Valued / Featured'}
                              >
                                <Star className="w-3 h-3" />
                                <span>Most Valued</span>
                              </button>
                            </div>
                          </td>

                          {/* 5. Stock Status Dropdown */}
                          <td className="py-3 px-4">
                            <select
                              value={prod.stock_status}
                              onChange={(e) => handleUpdateStockStatus(prod, e.target.value as any)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer focus:outline-none ${
                                prod.stock_status === 'in_stock'
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : prod.stock_status === 'limited'
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                              }`}
                            >
                              <option value="in_stock" className="bg-slate-900 text-emerald-400 font-bold">
                                In Stock
                              </option>
                              <option value="limited" className="bg-slate-900 text-amber-300 font-bold">
                                Limited Stock
                              </option>
                              <option value="out_of_stock" className="bg-slate-900 text-rose-400 font-bold">
                                Out of Stock
                              </option>
                            </select>
                          </td>

                          {/* 6. Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Manage Image */}
                              <button
                                onClick={() => openQuickImageModal(prod)}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                                title="Upload, update or delete product image"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                              </button>

                              {/* Quick Price */}
                              <button
                                onClick={() => openQuickPriceModal(prod)}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                                title="Update product price"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit All Details */}
                              <button
                                onClick={() => openEditProductModal(prod)}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="Edit full product details"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteProduct(prod)}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                                title="Delete product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

        {/* 3. ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">Customer Orders &amp; Fulfillment</h2>
                <p className="text-xs text-slate-400">
                  Verify Paystack transactions &amp; OPay transfer receipts, and issue instant access credentials.
                </p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search order #, email, WhatsApp..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setOrderFilter('all')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  orderFilter === 'all'
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                onClick={() => setOrderFilter('pending')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  orderFilter === 'pending'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>Awaiting Verification</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400/30 text-amber-200">
                  {orders.filter((o) => o.payment_status === 'pending').length}
                </span>
              </button>
              <button
                onClick={() => setOrderFilter('paid')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  orderFilter === 'paid'
                    ? 'bg-blue-500 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>Ready to Fulfill</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-400/30 text-blue-200">
                  {orders.filter((o) => o.payment_status === 'paid' && o.order_status !== 'fulfilled').length}
                </span>
              </button>
              <button
                onClick={() => setOrderFilter('fulfilled')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  orderFilter === 'fulfilled'
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Fulfilled ({orders.filter((o) => o.order_status === 'fulfilled').length})
              </button>
              <button
                onClick={() => setOrderFilter('cancelled')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  orderFilter === 'cancelled'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>Cancelled</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-400/30 text-rose-200">
                  {orders.filter((o) => o.order_status === 'cancelled').length}
                </span>
              </button>
            </div>

            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                  No orders found matching the filter or search query.
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const cleanPhone = order.customer_whatsapp.replace(/\D/g, '').replace(/^0/, '234');
                  const waText = encodeURIComponent(
                    `Hello ${order.customer_name}! This is SAMM AI Operations regarding your Order #${order.order_number} for ${order.items.map(i => i.product_name).join(', ')}.\n\nYour payment has been received and verified. Are you available for account activation?`
                  );

                  return (
                    <div
                      key={order.id}
                      className={`p-5 sm:p-6 rounded-2xl bg-slate-900 border space-y-4 transition-colors ${
                        order.order_status === 'cancelled'
                          ? 'border-rose-950/70 opacity-85'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-black text-white">{order.order_number}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              order.payment_status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : order.payment_status === 'failed' || order.order_status === 'cancelled'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            }`}>
                              Payment: {order.order_status === 'cancelled' ? 'cancelled' : order.payment_status}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              order.order_status === 'fulfilled'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : order.order_status === 'cancelled'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              Status: {order.order_status}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                              {order.payment_provider}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 block mt-1">
                            Placed {new Date(order.created_at).toLocaleString()} · Ref: {order.payment_reference || 'OPay-Transfer'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-extrabold text-emerald-400 font-mono mr-2">
                            {formatPrice(order.total_amount)}
                          </span>

                          {/* View Receipt Proof button if available */}
                          {order.receipt_url && (
                            <button
                              onClick={() => setSelectedReceiptOrder(order)}
                              className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Receipt</span>
                            </button>
                          )}

                          {/* Quick Approve / Reject Payment buttons if pending */}
                          {order.payment_status === 'pending' && order.order_status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => handleApproveOrderPayment(order)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Approve Payment</span>
                              </button>
                              <button
                                onClick={() => handleRejectOrderPayment(order)}
                                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                                title="Reject Invalid / Fake Receipt"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {/* Cancel Order Action */}
                          {order.order_status !== 'cancelled' ? (
                            <button
                              onClick={() => handleCancelOrder(order)}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                              title="Cancel this order"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Cancel Order</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleOrderStatus(order, 'pending')}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              title="Reopen order"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                              <span>Reopen</span>
                            </button>
                          )}

                          {/* Direct WhatsApp Customer */}
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${waText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>WhatsApp</span>
                          </a>

                          {order.order_status !== 'fulfilled' && order.order_status !== 'cancelled' && (
                            <button
                              onClick={() => handleOpenFulfill(order)}
                              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Fulfill Access</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Customer details & items */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-300">Customer Details:</span>
                          <p className="text-slate-400">{order.customer_name} ({order.customer_email})</p>
                          <p className="text-slate-400">WhatsApp: <strong className="text-slate-200">{order.customer_whatsapp}</strong> · Country: {order.customer_country}</p>
                          {order.order_notes && (
                            <p className="text-amber-300 mt-1 italic">&ldquo;{order.order_notes}&rdquo;</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <span className="font-semibold text-slate-300">Purchased Items:</span>
                          {order.items.map((it, idx) => (
                            <div key={idx} className="text-slate-400 flex justify-between bg-slate-950/40 px-2 py-1 rounded">
                              <span>{it.quantity}× {it.product_name} ({it.subscription_duration})</span>
                              <span className="font-mono text-slate-300">{formatPrice(it.total_price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ORDER VERIFICATION TAB */}
        {activeTab === 'verification' && (
          <OrderVerificationView
            orders={orders}
            onToggleStatus={handleToggleOrderStatus}
            onFulfillOrder={handleOpenFulfill}
            formatPrice={formatPrice}
          />
        )}

        {/* 4. DISCOUNTS TAB */}
        {activeTab === 'discounts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Promotional Discount Codes</h2>
                <p className="text-xs text-slate-400">
                  Manage active coupons, percentage discounts, and minimum order requirements.
                </p>
              </div>

              <button
                onClick={() => setIsDiscountModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {discounts.map((disc) => (
                <div key={disc.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-base text-emerald-400">
                      {disc.code}
                    </span>
                    <button
                      onClick={() => handleDeleteDiscount(disc.id)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-300">
                    <p className="font-bold">
                      {disc.type === 'percentage' ? `${disc.value}% OFF` : `Flat ₦${disc.value.toLocaleString()} OFF`}
                    </p>
                    <p className="text-slate-400 mt-1">Min order: ₦{disc.minimum_order_amount.toLocaleString()}</p>
                    <p className="text-slate-400">Used: {disc.used_count} times</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. FAQS TAB */}
        {activeTab === 'faqs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Manage Frequently Asked Questions</h2>
                <p className="text-xs text-slate-400">Directly update FAQ text without altering codebase.</p>
              </div>
            </div>

            <div className="space-y-3">
              {faqs.map((f) => (
                <div key={f.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <h4 className="font-bold text-white">{f.question}</h4>
                  <p className="text-slate-300 leading-relaxed">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. SETTINGS TAB */}
        {activeTab === 'settings' && siteSettings && (
          <form onSubmit={handleSaveSettings} className="max-w-xl p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Website Information &amp; Contact Settings
            </h2>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Brand Name</label>
              <input
                type="text"
                value={siteSettings.brand_name}
                onChange={(e) => setSiteSettings({ ...siteSettings, brand_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Tagline</label>
              <input
                type="text"
                value={siteSettings.tagline}
                onChange={(e) => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">WhatsApp Hotline</label>
              <input
                type="text"
                value={siteSettings.whatsapp_number}
                onChange={(e) => setSiteSettings({ ...siteSettings, whatsapp_number: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Support Email</label>
              <input
                type="email"
                value={siteSettings.support_email}
                onChange={(e) => setSiteSettings({ ...siteSettings, support_email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Top Announcement Banner</label>
              <input
                type="text"
                value={siteSettings.announcement_text}
                onChange={(e) => setSiteSettings({ ...siteSettings, announcement_text: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                  Payment Gateway (Paystack &amp; OPay Direct Transfer)
                </h3>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Paystack Public Key (from Paystack Dashboard &gt; Settings &gt; API Keys)
                </label>
                <input
                  type="text"
                  placeholder="pk_live_... or pk_test_..."
                  value={siteSettings.paystack_public_key || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, paystack_public_key: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Used for automated debit card, bank transfer, and USSD payments.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    OPay / Bank Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 07036192301"
                    value={siteSettings.opay_account_number || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, opay_account_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Samuel Amaechi / SAMM AI"
                    value={siteSettings.opay_account_name || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, opay_account_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. OPay (Paycom) or Moniepoint"
                    value={siteSettings.opay_bank_name || 'OPay (Paycom)'}
                    onChange={(e) => setSiteSettings({ ...siteSettings, opay_bank_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>

            {settingsFeedback && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{settingsFeedback}</span>
              </div>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase"
            >
              Save Site Settings
            </button>
          </form>
        )}

        {/* 7. AUDIT LOGS & DATABASE TELEMETRY TAB */}
        {activeTab === 'audit' && (
          <AuditLogsPanel logs={auditLogs} onRefresh={loadAllData} />
        )}
      </div>

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="e.g. GOOGLE GEMINI AI PRO"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Subscription Duration *</label>
                  <input
                    type="text"
                    required
                    value={pDuration}
                    onChange={(e) => setPDuration(e.target.value)}
                    placeholder="e.g. 18 Months, 1 Month, 1 Year"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Original Price (NGN) *</label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Promo Price (NGN, Optional)</label>
                  <input
                    type="number"
                    value={pPromoPrice || ''}
                    onChange={(e) => setPPromoPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Leave empty if regular"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Short Description *</label>
                <input
                  type="text"
                  required
                  value={pShortDesc}
                  onChange={(e) => setPShortDesc(e.target.value)}
                  placeholder="One line highlight for product card"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Description *</label>
                <textarea
                  rows={3}
                  required
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  placeholder="Comprehensive breakdown of capabilities..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Product Image (Upload to &quot;Product_images&quot; or Paste URL)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={pImage}
                    onChange={(e) => setPImage(e.target.value)}
                    placeholder="https://... or upload file below"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                  />
                  <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0 border border-slate-700">
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const { uploadImageToSupabase, BUCKETS } = await import('../lib/storage');
                            const url = await uploadImageToSupabase(file, BUCKETS.PRODUCTS);
                            setPImage(url);
                          } catch (err: any) {
                            alert('Upload error: ' + err.message);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                {pImage && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={pImage} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-750" />
                    <span className="text-[11px] text-emerald-400">Image attached</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Key Features (One per line)</label>
                <textarea
                  rows={3}
                  value={pFeatures}
                  onChange={(e) => setPFeatures(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={pIsFeatured}
                    onChange={(e) => setPIsFeatured(e.target.checked)}
                    className="rounded text-emerald-500"
                  />
                  <span className="text-xs text-slate-200">Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={pIsOnSale}
                    onChange={(e) => setPIsOnSale(e.target.checked)}
                    className="rounded text-emerald-500"
                  />
                  <span className="text-xs text-slate-200">Display in Deals</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 p-2.5 rounded-xl border border-amber-500/20">
                  <input
                    type="checkbox"
                    checked={pIsBestSeller}
                    onChange={(e) => setPIsBestSeller(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span className="text-xs text-amber-300 font-bold">🏆 Best Seller Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 p-2.5 rounded-xl border border-violet-500/20">
                  <input
                    type="checkbox"
                    checked={pIsTrending}
                    onChange={(e) => setPIsTrending(e.target.checked)}
                    className="rounded text-violet-500"
                  />
                  <span className="text-xs text-violet-300 font-bold">🔥 Trending Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 p-2.5 rounded-xl border border-cyan-500/20">
                  <input
                    type="checkbox"
                    checked={pIsNew}
                    onChange={(e) => setPIsNew(e.target.checked)}
                    className="rounded text-cyan-400"
                  />
                  <span className="text-xs text-cyan-300 font-bold">✨ New Badge</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fulfillment Modal */}
      {fulfillingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                Fulfill Order #{fulfillingOrder.order_number}
              </h3>
              <button onClick={() => setFulfillingOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmFulfill} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                <p><strong>Customer:</strong> {fulfillingOrder.customer_name} ({fulfillingOrder.customer_email})</p>
                <p><strong>WhatsApp:</strong> {fulfillingOrder.customer_whatsapp}</p>
                <p><strong>Product:</strong> {fulfillingOrder.items.map((i) => i.product_name).join(', ')}</p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Access Credentials / Invitation License Key *
                </label>
                <textarea
                  rows={3}
                  required
                  value={accessInfoInput}
                  onChange={(e) => setAccessInfoInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Delivery Instructions for Customer
                </label>
                <textarea
                  rows={2}
                  value={deliveryInstructionsInput}
                  onChange={(e) => setDeliveryInstructionsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFulfillingOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider"
                >
                  Confirm &amp; Complete Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create New Coupon</h3>
              <button onClick={() => setIsDiscountModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDiscount} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH25"
                  value={dCode}
                  onChange={(e) => setDCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Discount Type</label>
                  <select
                    value={dType}
                    onChange={(e) => setDType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₦)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={dValue}
                    onChange={(e) => setDValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Minimum Order Amount (NGN)</label>
                <input
                  type="number"
                  value={dMinOrder}
                  onChange={(e) => setDMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDiscountModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 9. PRODUCT DELETE CONFIRMATION MODAL (Non-blocking In-App Dialog) */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Delete Product</h3>
              <p className="text-sm text-slate-300 mt-1">
                Are you sure you want to remove <strong className="text-white">&quot;{productToDelete.name}&quot;</strong>?
              </p>
              <p className="text-xs text-slate-500 mt-1">
                This will delete the subscription from your live store and Supabase database.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteProduct}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Admin Receipt Review & 1-Click Verification */}
      {selectedReceiptOrder && selectedReceiptOrder.receipt_url && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Payment Proof · {selectedReceiptOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Image Display */}
            <div className="max-h-[55vh] overflow-auto rounded-xl bg-slate-950 p-2 flex items-center justify-center border border-slate-800">
              {selectedReceiptOrder.receipt_url.startsWith('data:image') || selectedReceiptOrder.receipt_url.startsWith('http') ? (
                <img
                  src={selectedReceiptOrder.receipt_url}
                  alt={`Proof for ${selectedReceiptOrder.order_number}`}
                  className="max-h-[50vh] object-contain rounded-lg"
                />
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <FileText className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                  <span>PDF Document Receipt attached</span>
                </div>
              )}
            </div>

            {/* Summary Details */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <strong className="text-white">{selectedReceiptOrder.customer_name} ({selectedReceiptOrder.customer_email})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">WhatsApp:</span>
                <strong className="text-emerald-400 font-mono">{selectedReceiptOrder.customer_whatsapp}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Expected:</span>
                <strong className="text-white font-mono text-sm">{formatPrice(selectedReceiptOrder.total_amount)}</strong>
              </div>
              {selectedReceiptOrder.sender_name && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Sender Remark:</span>
                  <strong className="text-amber-300 font-mono">{selectedReceiptOrder.sender_name}</strong>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs"
              >
                Close
              </button>

              {selectedReceiptOrder.payment_status === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleRejectOrderPayment(selectedReceiptOrder);
                      setSelectedReceiptOrder(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Receipt</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await handleApproveOrderPayment(selectedReceiptOrder);
                      setSelectedReceiptOrder(null);
                      handleOpenFulfill(selectedReceiptOrder);
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve &amp; Fulfill Access</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUICK PRICE EDIT MODAL */}
      {priceEditProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Update Product Price</h3>
              </div>
              <button
                onClick={() => setPriceEditProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[11px]">Product:</span>
              <strong className="text-white font-bold text-sm">{priceEditProduct.name}</strong>
              <span className="text-slate-400 block text-[11px] mt-0.5">Plan: {priceEditProduct.subscription_duration}</span>
            </div>

            <form onSubmit={handleSaveQuickPrice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Regular Price (NGN) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={quickPrice}
                  onChange={(e) => setQuickPrice(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">Promo / Discounted Price (NGN, Optional)</label>
                  {quickPromoPrice !== undefined && quickPrice > 0 && quickPromoPrice < quickPrice && (
                    <span className="text-emerald-400 font-bold text-[10px]">
                      {Math.round(((quickPrice - quickPromoPrice) / quickPrice) * 100)}% OFF
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min={0}
                  placeholder="Leave empty if regular"
                  value={quickPromoPrice ?? ''}
                  onChange={(e) =>
                    setQuickPromoPrice(e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  When set, customer sees regular price crossed out with promo price highlighted.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPriceEditProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-750 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPrice}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {isUpdatingPrice ? 'Saving...' : 'Save Price'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK IMAGE MANAGER MODAL (Upload, Update, Delete) */}
      {imageEditProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Manage Product Image</h3>
                  <span className="text-[11px] text-slate-400">{imageEditProduct.name}</span>
                </div>
              </div>
              <button
                onClick={() => setImageEditProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Image Preview & Quick Actions */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 rounded-xl bg-slate-900 border border-slate-750 overflow-hidden shrink-0 flex items-center justify-center relative group">
                <img
                  src={quickImageUrl || FALLBACK_PRODUCT_IMAGE}
                  alt={imageEditProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <span className="text-xs font-bold text-white block">Current Display Visual</span>
                <p className="text-[11px] text-slate-400">
                  Upload a custom image file (PNG, JPG, SVG, WebP) or paste an image URL.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New File</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingImage}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadImageFile(file);
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={handleDeleteImage}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Delete custom image and reset to default"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Image</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Paste Direct URL Form */}
            <form onSubmit={handleSaveImageUrlDirect} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Or Paste Direct Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={quickImageUrl}
                    onChange={(e) => setQuickImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or https://domain.com/photo.png"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={isUploadingImage}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs transition-colors shrink-0"
                  >
                    Save URL
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setImageEditProduct(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
