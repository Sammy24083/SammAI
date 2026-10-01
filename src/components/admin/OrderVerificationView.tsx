import React, { useState, useMemo } from 'react';
import { Order } from '../../types';
import {
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  MessageCircle,
  Search,
  Filter,
  ShieldCheck,
  Send,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  X,
} from 'lucide-react';

interface OrderVerificationViewProps {
  orders: Order[];
  onToggleStatus: (order: Order, newStatus: 'pending' | 'paid' | 'cancelled') => Promise<void>;
  onFulfillOrder: (order: Order) => void;
  formatPrice: (amount: number) => string;
}

export const OrderVerificationView: React.FC<OrderVerificationViewProps> = ({
  orders,
  onToggleStatus,
  onFulfillOrder,
  formatPrice,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'cancelled'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Filter orders that have receipts OR were made through Transfer/OPay
  const receiptOrders = useMemo(() => {
    return orders.filter(
      (o) => o.receipt_url || o.payment_provider === 'OPay Transfer' || o.payment_provider === 'Transfer'
    );
  }, [orders]);

  // Status counters
  const counts = useMemo(() => {
    const pending = receiptOrders.filter((o) => o.payment_status === 'pending').length;
    const verified = receiptOrders.filter((o) => o.payment_status === 'paid').length;
    const cancelled = receiptOrders.filter(
      (o) => o.payment_status === 'failed' || o.order_status === 'cancelled'
    ).length;
    return { all: receiptOrders.length, pending, verified, cancelled };
  }, [receiptOrders]);

  // Filtered list
  const filteredList = useMemo(() => {
    return receiptOrders.filter((order) => {
      // Status filter
      if (filter === 'pending' && order.payment_status !== 'pending') return false;
      if (filter === 'verified' && order.payment_status !== 'paid') return false;
      if (
        filter === 'cancelled' &&
        order.payment_status !== 'failed' &&
        order.order_status !== 'cancelled'
      ) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = order.order_number.toLowerCase().includes(q);
        const matchesName = order.customer_name.toLowerCase().includes(q);
        const matchesEmail = order.customer_email.toLowerCase().includes(q);
        const matchesPhone = (order.customer_whatsapp || order.customer_phone || '').includes(q);
        const matchesSender = (order.sender_name || '').toLowerCase().includes(q);
        const matchesNotes = (order.order_notes || '').toLowerCase().includes(q);
        if (!matchesNumber && !matchesName && !matchesEmail && !matchesPhone && !matchesSender && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [receiptOrders, filter, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = async (order: Order, newStatus: 'pending' | 'paid' | 'cancelled') => {
    setUpdatingOrderId(order.id);
    try {
      await onToggleStatus(order, newStatus);
      const label = newStatus === 'paid' ? 'Verified & Paid' : newStatus === 'cancelled' ? 'Cancelled / Rejected' : 'Pending Review';
      setFeedbackMessage(`Order #${order.order_number} marked as ${label}`);
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
              FINANCE &amp; AUDIT CONTROL
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 border border-blue-500/20 text-blue-400">
              Live Real-Time
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Order Receipt Verification Desk</span>
            {counts.pending > 0 && (
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-black animate-pulse">
                {counts.pending} Needs Review
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Inspect uploaded customer payment receipts, verify bank alerts, and toggle order status directly between <strong className="text-amber-300">Pending</strong>, <strong className="text-emerald-400">Verified</strong>, and <strong className="text-rose-400">Cancelled</strong> with instant UI updates.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setFilter('all')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filter === 'all'
              ? 'bg-slate-850 border-emerald-500/40 shadow-lg'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">
            Total Proofs
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">{counts.all}</span>
            <FileText className="w-5 h-5 text-slate-500" />
          </div>
        </div>

        <div
          onClick={() => setFilter('pending')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filter === 'pending'
              ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/5'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] text-amber-300 uppercase tracking-wider block font-bold">
              Pending Review
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{counts.pending}</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        <div
          onClick={() => setFilter('verified')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filter === 'verified'
              ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] text-emerald-400 uppercase tracking-wider block font-bold">
            Verified / Paid
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{counts.verified}</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div
          onClick={() => setFilter('cancelled')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filter === 'cancelled'
              ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-500/5'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] text-rose-400 uppercase tracking-wider block font-bold">
            Cancelled / Rejected
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">{counts.cancelled}</span>
            <XCircle className="w-5 h-5 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order #, Customer Name, Email, WhatsApp, or Sender Remark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Segmented Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          {[
            { id: 'all', label: `All (${counts.all})` },
            { id: 'pending', label: `Pending (${counts.pending})` },
            { id: 'verified', label: `Verified (${counts.verified})` },
            { id: 'cancelled', label: `Cancelled (${counts.cancelled})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-emerald-500 text-black font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Cards Stream */}
      {filteredList.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-slate-900/50 border border-slate-800 p-8 space-y-3">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Verification Records Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery
              ? `No receipts matched your search "${searchQuery}".`
              : filter === 'pending'
              ? 'Great job! There are no pending payment proofs awaiting verification at this time.'
              : 'No orders match the selected filter.'}
          </p>
          {(searchQuery || filter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((order) => {
            const isUpdating = updatingOrderId === order.id;
            const cleanPhone = (order.customer_whatsapp || order.customer_phone || '').replace(/[^0-9]/g, '');
            const isPending = order.payment_status === 'pending';
            const isVerified = order.payment_status === 'paid';
            const isCancelled = order.payment_status === 'failed' || order.order_status === 'cancelled';

            const waText = encodeURIComponent(
              isVerified
                ? `Hello ${order.customer_name}! Your payment for SAMM AI Order #${order.order_number} (${formatPrice(order.total_amount)}) has been VERIFIED. We are deploying your access credentials now.`
                : isCancelled
                ? `Hello ${order.customer_name}, we reviewed your payment proof for SAMM AI Order #${order.order_number} but could not confirm the bank alert. Please check your transaction details or send us your session ID.`
                : `Hello ${order.customer_name}, we are processing your transfer for SAMM AI Order #${order.order_number} (${formatPrice(order.total_amount)}).`
            );

            return (
              <div
                key={order.id}
                className={`p-5 sm:p-6 rounded-2xl bg-slate-900 border transition-all duration-200 shadow-xl ${
                  isPending
                    ? 'border-amber-500/40 hover:border-amber-500/60'
                    : isVerified
                    ? 'border-emerald-500/30 hover:border-emerald-500/50'
                    : 'border-slate-800 opacity-80'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left Column: Receipt Thumbnail / Preview (lg:col-span-3) */}
                  <div className="lg:col-span-3">
                    {order.receipt_url ? (
                      <div className="space-y-2">
                        <div
                          onClick={() => setSelectedReceiptOrder(order)}
                          className="group relative aspect-[3/4] w-full rounded-xl bg-slate-950 border border-slate-800 overflow-hidden cursor-pointer shadow-md hover:border-emerald-500/60 transition-all"
                        >
                          {order.receipt_url.startsWith('data:image') || order.receipt_url.startsWith('http') ? (
                            <img
                              src={order.receipt_url}
                              alt={`Receipt proof for ${order.order_number}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                              <FileText className="w-10 h-10 text-blue-400 mb-2" />
                              <span className="text-[11px] text-slate-300 font-semibold">Document Attached</span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <span className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-black flex items-center gap-1 shadow-lg">
                              <Eye className="w-3.5 h-3.5" />
                              <span>Enlarge Slip</span>
                            </span>
                          </div>

                          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] font-bold text-white bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded border border-slate-700">
                            <span>Receipt Attached</span>
                            <Eye className="w-3 h-3 text-emerald-400" />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedReceiptOrder(order)}
                          className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>View Full High-Res Slip</span>
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-[3/4] w-full rounded-xl bg-slate-950/80 border border-dashed border-slate-800 flex flex-col items-center justify-center p-4 text-center space-y-2">
                        <Clock className="w-8 h-8 text-amber-400/60" />
                        <div>
                          <span className="text-xs font-bold text-slate-300 block">No Slip Uploaded</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            Customer placed transfer order without attaching receipt yet
                          </span>
                        </div>
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                              `Hello ${order.customer_name}, please send your transfer receipt for SAMM AI Order #${order.order_number} to fast-track activation.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>Request Slip on WA</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Middle Column: Order & Customer Details (lg:col-span-5) */}
                  <div className="lg:col-span-5 space-y-3">
                    {/* Header line: Order number & time */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-white">{order.order_number}</span>
                        <button
                          onClick={() => handleCopy(order.id, order.order_number)}
                          className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                          title="Copy order number"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {copiedId === order.id && (
                          <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(order.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Customer info */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Customer:</span>
                        <strong className="text-white font-semibold">
                          {order.customer_name} ({order.customer_email})
                        </strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">WhatsApp:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-emerald-400 font-mono">{order.customer_whatsapp}</strong>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${waText}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-emerald-400"
                              title="Chat Customer on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            </a>
                          )}
                        </div>
                      </div>

                      {order.sender_name && (
                        <div className="flex items-center justify-between bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                          <span className="text-amber-300 font-semibold">OPay Sender Remark:</span>
                          <strong className="text-amber-200 font-mono font-bold">{order.sender_name}</strong>
                        </div>
                      )}

                      {order.order_notes && (
                        <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                          <span className="text-slate-400 block font-medium">Notes / Remark:</span>
                          <span>{order.order_notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Items Breakdown */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                        Purchased Items:
                      </span>
                      {order.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-950/80"
                        >
                          <span className="font-bold text-white truncate max-w-[200px]">{it.product_name}</span>
                          <span className="font-mono text-slate-300 text-[11px]">
                            {it.subscription_duration} ({formatPrice(it.unit_price)})
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total Expected */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-xs text-slate-400">Total Transfer Expected:</span>
                      <span className="text-lg font-black text-emerald-400 font-mono">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Status Toggle Switcher & Quick Actions (lg:col-span-4) */}
                  <div className="lg:col-span-4 flex flex-col justify-between space-y-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800 h-full">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                          Verification Status
                        </span>
                        {isUpdating && (
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Updating...</span>
                          </span>
                        )}
                      </div>

                      {/* 3-WAY STATUS TOGGLE (Segmented Controller) */}
                      <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-750">
                        {/* 1. Pending Toggle */}
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(order, 'pending')}
                          className={`py-2 px-1.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                            isPending
                              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                              : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
                          }`}
                        >
                          <Clock className={`w-3.5 h-3.5 ${isPending ? 'stroke-[2.5]' : ''}`} />
                          <span className="text-[11px]">Pending</span>
                        </button>

                        {/* 2. Verified Toggle */}
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(order, 'paid')}
                          className={`py-2 px-1.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                            isVerified
                              ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/25'
                              : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                          }`}
                        >
                          <CheckCircle className={`w-3.5 h-3.5 ${isVerified ? 'stroke-[2.5]' : ''}`} />
                          <span className="text-[11px]">Verified</span>
                        </button>

                        {/* 3. Cancelled Toggle */}
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(order, 'cancelled')}
                          className={`py-2 px-1.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                            isCancelled
                              ? 'bg-rose-500 text-white font-black shadow-md shadow-rose-500/25'
                              : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                          }`}
                        >
                          <XCircle className={`w-3.5 h-3.5 ${isCancelled ? 'stroke-[2.5]' : ''}`} />
                          <span className="text-[11px]">Cancelled</span>
                        </button>
                      </div>

                      {/* Current Status description */}
                      <div className="mt-3 text-[11px] text-slate-400 leading-tight">
                        {isPending && (
                          <div className="text-amber-300/90 flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0 animate-ping" />
                            <span>Awaiting bank credit check. Access credentials withheld until toggled to Verified.</span>
                          </div>
                        )}
                        {isVerified && (
                          <div className="text-emerald-400 flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>Payment verified. Order ready for digital license fulfillment.</span>
                          </div>
                        )}
                        {isCancelled && (
                          <div className="text-rose-400 flex items-start gap-1.5">
                            <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>Payment rejected. Access revoked / blocked. Customer notified.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Secondary Actions */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      {isVerified && order.order_status !== 'fulfilled' && (
                        <button
                          type="button"
                          onClick={() => onFulfillOrder(order)}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Fulfill Access Credentials</span>
                        </button>
                      )}

                      {cleanPhone && (
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${waText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Chat on WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Full Resolution Zoomable Lightbox for Receipt Inspection */}
      {selectedReceiptOrder && selectedReceiptOrder.receipt_url && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-3xl w-full p-5 space-y-4 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Receipt Inspection · {selectedReceiptOrder.order_number}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Expected: {formatPrice(selectedReceiptOrder.total_amount)} via {selectedReceiptOrder.payment_provider}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-res Image Slot */}
            <div className="flex-1 overflow-auto rounded-xl bg-slate-950 p-2 flex items-center justify-center border border-slate-800 min-h-[300px] max-h-[60vh]">
              {selectedReceiptOrder.receipt_url.startsWith('data:image') ||
              selectedReceiptOrder.receipt_url.startsWith('http') ? (
                <img
                  src={selectedReceiptOrder.receipt_url}
                  alt={`Proof for ${selectedReceiptOrder.order_number}`}
                  className="max-h-[58vh] w-auto object-contain rounded-lg shadow-lg select-none"
                />
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <FileText className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                  <span>Document format attached. Open external preview.</span>
                </div>
              )}
            </div>

            {/* Verification Metadata Summary */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Customer:</span>
                <strong className="text-white">{selectedReceiptOrder.customer_name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">WhatsApp:</span>
                <strong className="text-emerald-400 font-mono">{selectedReceiptOrder.customer_whatsapp}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Sender Remark:</span>
                <strong className="text-amber-300 font-mono">
                  {selectedReceiptOrder.sender_name || 'OPay Transfer'}
                </strong>
              </div>
            </div>

            {/* Direct Status Actions in Modal */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs transition-colors"
              >
                Close Inspector
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await handleStatusChange(selectedReceiptOrder, 'cancelled');
                    setSelectedReceiptOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject / Cancel</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await handleStatusChange(selectedReceiptOrder, 'paid');
                    setSelectedReceiptOrder(null);
                    onFulfillOrder(selectedReceiptOrder);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify &amp; Fulfill Access</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
