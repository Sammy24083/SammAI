import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { orderService } from '../services/orderService';
import { deliveryService } from '../services/deliveryService';
import { Order, DeliveryRecord } from '../types';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  User,
  ShoppingBag,
  KeyRound,
  CreditCard,
  MessageCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Copy,
  LogOut,
  Sparkles,
  Lock,
  Mail,
  Phone,
  FileText,
  Eye,
  UploadCloud,
  X,
  ArrowRight,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, login, signup, logout, updateProfile, switchRole } = useAuth();
  const { formatPrice } = useCurrency();

  // Auth form states (when logged out)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authWhatsapp, setAuthWhatsapp] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Authenticated states
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'orders' | 'profile'>('subscriptions');
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryRecords, setDeliveryRecords] = useState<DeliveryRecord[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  // Edit profile form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp_number || '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // User cancel order modal states
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Changed my mind');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);

  const handleConfirmCancelOrder = async () => {
    if (!cancellingOrder) return;
    setIsCancelling(true);
    try {
      await orderService.cancelOrder(cancellingOrder.id, cancelReason, 'customer');
      setOrders((prev) =>
        prev.map((o) =>
          o.id === cancellingOrder.id || o.order_number === cancellingOrder.order_number
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
      setCancelSuccessMsg(`Order #${cancellingOrder.order_number} has been cancelled successfully.`);
      setTimeout(() => setCancelSuccessMsg(null), 5000);
      setCancellingOrder(null);
      await loadCustomerData();
    } catch (err) {
      console.error('Failed to cancel order:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setPhone(user.phone || '');
      setWhatsapp(user.whatsapp_number || '');
      loadCustomerData();

      const handleUpdate = () => {
        loadCustomerData();
      };

      window.addEventListener('samm-store-update', handleUpdate);
      const interval = setInterval(loadCustomerData, 6000);

      return () => {
        window.removeEventListener('samm-store-update', handleUpdate);
        clearInterval(interval);
      };
    }
  }, [user]);

  const loadCustomerData = async () => {
    if (!user) return;
    const allOrders = await orderService.getOrders();
    const customerOrders = allOrders.filter(
      (o) =>
        (user.email && o.customer_email?.toLowerCase() === user.email.toLowerCase()) ||
        (user.id && o.customer_id === user.id) ||
        (user.whatsapp_number && o.customer_whatsapp === user.whatsapp_number)
    );

    const allRecords = await deliveryService.getDeliveryRecords();
    const records = allRecords.filter(
      (r) =>
        (user.email && r.customer_email?.toLowerCase() === user.email.toLowerCase()) ||
        (user.id && r.customer_id === user.id) ||
        customerOrders.some((co) => co.id === r.order_id || co.order_number === r.order_number)
    );

    setOrders(customerOrders);
    setDeliveryRecords(records);
  };

  const handleCopyAccess = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: fullName,
      phone,
      whatsapp_number: whatsapp,
    });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2500);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      if (authMode === 'login') {
        if (!authEmail.trim()) {
          setAuthError('Please enter your email address');
          setIsAuthLoading(false);
          return;
        }
        const res = await login(authEmail, authPassword);
        if (!res.success) {
          setAuthError(res.error || 'Login failed. Please check your credentials.');
        }
      } else {
        if (!authName.trim() || !authEmail.trim() || !authWhatsapp.trim()) {
          setAuthError('Please enter your Full Name, Email, and WhatsApp number.');
          setIsAuthLoading(false);
          return;
        }
        const res = await signup(authName, authEmail, authPhone || authWhatsapp, authWhatsapp, authPassword);
        if (!res.success) {
          setAuthError(res.error || 'Failed to create account.');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // If not logged in, render authentication gateway
  if (!user) {
    return (
      <div className="py-12 sm:py-20">
        <div className="max-w-md mx-auto px-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {authMode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
              </h2>
              <p className="text-xs text-slate-400">
                Access your subscriptions, download credentials, and track instant activations.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(null); }}
                className={`py-2 rounded-lg font-bold transition-all ${
                  authMode === 'login'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                className={`py-2 rounded-lg font-bold transition-all ${
                  authMode === 'signup'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Samuel Okafor"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">WhatsApp Number (For Instant Delivery)</label>
                  <input
                    type="tel"
                    required
                    value={authWhatsapp}
                    onChange={(e) => setAuthWhatsapp(e.target.value)}
                    placeholder="07036192301"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {isAuthLoading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 mb-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-xl font-display shadow-inner">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{user.full_name}</h1>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
                  Verified Member
                </span>
                {user.role === 'admin' && (
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user.email} · {user.whatsapp_number || 'WhatsApp on file'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <a
              href="https://wa.me/2347036192301?text=Hello%20SAMM%20AI%20Support"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Support</span>
            </a>

            <button
              onClick={logout}
              className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold flex items-center gap-1.5 border border-red-500/20 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mb-8 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all relative ${
              activeTab === 'subscriptions'
                ? 'text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              <span>Active Subscriptions ({deliveryRecords.length})</span>
            </span>
            {activeTab === 'subscriptions' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all relative ${
              activeTab === 'orders'
                ? 'text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>My Orders ({orders.length})</span>
            </span>
            {activeTab === 'orders' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all relative ${
              activeTab === 'profile'
                ? 'text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Profile Settings</span>
            </span>
            {activeTab === 'profile' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab 1: Active Subscriptions & Delivery Records */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            {deliveryRecords.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 p-8">
                <KeyRound className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No active subscriptions</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  When you purchase Google Gemini Pro, ChatGPT Plus, or CapCut Pro, your verified access credentials and invitations appear here.
                </p>
              </div>
            ) : (
              deliveryRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{record.product_name}</h3>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">
                          {record.delivery_status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Order #{record.order_number}</p>
                    </div>

                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Updated: {new Date(record.updated_at).toLocaleDateString()}</span>
                    </span>
                  </div>

                  {/* Access credentials box */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        Access Information &amp; Credentials
                      </span>
                      <button
                        onClick={() => handleCopyAccess(record.id, record.access_information)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedKey === record.id ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm font-mono text-slate-200 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 select-all whitespace-pre-wrap">
                      {record.access_information}
                    </p>
                  </div>

                  {/* Instructions */}
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-white block mb-0.5">Delivery Instructions:</span>
                    <p>{record.delivery_instructions}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {cancelSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{cancelSuccessMsg}</span>
                </div>
                <button onClick={() => setCancelSuccessMsg(null)} className="p-1 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {orders.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 p-8">
                <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No orders yet</h3>
                <p className="text-xs text-slate-400 mt-1">Browse our store and make your first purchase.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className={`p-5 sm:p-6 rounded-2xl bg-slate-900 border space-y-4 shadow-lg transition-colors ${
                    order.order_status === 'cancelled'
                      ? 'border-rose-950/60 opacity-85'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">{order.order_number}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          order.payment_status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : order.payment_status === 'failed' || order.order_status === 'cancelled'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {order.order_status === 'cancelled' ? 'cancelled' : order.payment_status}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          order.order_status === 'fulfilled'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : order.order_status === 'cancelled'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {order.order_status}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-medium">
                          {order.payment_provider}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block mt-1">
                        Placed on {new Date(order.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {order.receipt_url && (
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(order.receipt_url!)}
                          className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-1 border border-blue-500/30 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Proof</span>
                        </button>
                      )}

                      {/* Cancel Order Action for Users */}
                      {order.order_status !== 'fulfilled' && order.order_status !== 'cancelled' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setCancellingOrder(order);
                            setCancelReason('Changed my mind');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-1 border border-rose-500/30 transition-colors"
                          title="Cancel this order"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Cancel Order</span>
                        </button>
                      ) : order.order_status === 'cancelled' ? (
                        <a
                          href={`https://wa.me/2347036192301?text=${encodeURIComponent(
                            `Hello SAMM AI, I have a question regarding my cancelled order #${order.order_number}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium flex items-center gap-1 border border-slate-700 transition-colors"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-400" />
                          <span>Refund Help</span>
                        </a>
                      ) : null}

                      <span className="text-base font-extrabold text-emerald-400 font-mono">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-950/60"
                      >
                        <span className="font-semibold text-white">{item.product_name}</span>
                        <span className="text-slate-400 font-mono">
                          Qty {item.quantity} · {formatPrice(item.unit_price)} ({item.subscription_duration})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="max-w-xl p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Update Profile Information
            </h3>

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">WhatsApp Number (For Instant Delivery)</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20"
              >
                Save Changes
              </button>
            </form>

            {/* Display Theme Preference */}
            <div className="pt-6 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Display Theme Preference
              </h4>
              <p className="text-xs text-slate-400">
                Switch between the default high-tech Dark Theme and clean, high-contrast Light Mode.
              </p>
              <ThemeToggle showLabel className="py-2.5 px-4 font-bold" />
            </div>
          </div>
        )}

        {/* Modal: Receipt Lightbox Preview */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Payment Proof / Transfer Slip
                </span>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[65vh] overflow-auto rounded-xl bg-slate-950 p-2 flex items-center justify-center">
                {selectedReceipt.startsWith('data:image') || selectedReceipt.startsWith('http') ? (
                  <img src={selectedReceipt} alt="Receipt preview" className="max-h-[60vh] object-contain rounded-lg" />
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    <FileText className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                    <span>Receipt Document attached</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-750 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}

        {/* Modal: Customer Cancel Order Confirmation */}
        {cancellingOrder && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold text-sm text-white">Cancel Order #{cancellingOrder.order_number}</h3>
                </div>
                <button
                  onClick={() => setCancellingOrder(null)}
                  disabled={isCancelling}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  Are you sure you want to cancel this order? Once cancelled, active activation queues will be stopped.
                </p>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-slate-400">
                  <div className="flex justify-between font-mono text-slate-200">
                    <span>Order Total:</span>
                    <strong className="text-emerald-400">{formatPrice(cancellingOrder.total_amount)}</strong>
                  </div>
                  <div className="text-[11px]">
                    Items: {cancellingOrder.items.map((it) => it.product_name).join(', ')}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Reason for cancellation (optional):</label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                  >
                    <option value="Changed my mind">Changed my mind</option>
                    <option value="Ordered wrong plan or duration">Ordered wrong plan or duration</option>
                    <option value="Selected wrong payment method">Selected wrong payment method</option>
                    <option value="Found alternative">Found alternative</option>
                    <option value="Other">Other reason</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
                  💡 <strong>Made an OPay / Bank Transfer?</strong> Our 24/7 WhatsApp support (07036192301) will assist you with verifying your transfer slip and issuing a swift refund or credit.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  disabled={isCancelling}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs transition-colors"
                >
                  Keep Order
                </button>

                <button
                  type="button"
                  onClick={handleConfirmCancelOrder}
                  disabled={isCancelling}
                  className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5"
                >
                  {isCancelling ? (
                    <span>Cancelling...</span>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Confirm Cancel</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
