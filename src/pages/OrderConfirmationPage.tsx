import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { orderService } from '../services/orderService';
import {
  CheckCircle,
  MessageCircle,
  Copy,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
  UploadCloud,
  FileText,
  Eye,
  CheckCircle2,
  X,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

interface OrderConfirmationPageProps {
  order: Order;
  onGoToAccount: () => void;
  onContinueShopping: () => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  onGoToAccount,
  onContinueShopping,
}) => {
  const { formatPrice } = useCurrency();
  const [liveOrder, setLiveOrder] = useState<Order>(order);
  const [copied, setCopied] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<string | null>(order.receipt_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isViewingReceipt, setIsViewingReceipt] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelThisOrder = async () => {
    if (!window.confirm(`Are you sure you want to cancel Order #${liveOrder.order_number}?`)) {
      return;
    }
    setIsCancelling(true);
    try {
      const updated = await orderService.cancelOrder(liveOrder.id, 'Customer cancelled from confirmation screen', 'customer');
      setLiveOrder(updated);
    } catch (err) {
      console.error('Error cancelling order:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  const isTransfer = liveOrder.payment_provider === 'OPay Transfer';
  const isPending = liveOrder.payment_status === 'pending';
  const isPaid = liveOrder.payment_status === 'paid';
  const isFailed = liveOrder.payment_status === 'failed';

  // Live order status synchronization: auto-updates if Admin approves/rejects payment
  useEffect(() => {
    const fetchLatest = async () => {
      const updated = await orderService.getOrderById(order.id);
      if (updated) {
        setLiveOrder(updated);
        if (updated.receipt_url && !currentReceipt) {
          setCurrentReceipt(updated.receipt_url);
        }
      }
    };

    const handleUpdate = () => {
      fetchLatest();
    };

    window.addEventListener('samm-store-update', handleUpdate);
    const interval = setInterval(fetchLatest, 4000);

    return () => {
      window.removeEventListener('samm-store-update', handleUpdate);
      clearInterval(interval);
    };
  }, [order.id, currentReceipt]);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(liveOrder.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePostOrderReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { fileToBase64 } = await import('../lib/storage');
      const b64 = await fileToBase64(file);
      setCurrentReceipt(b64);
      const updated = await orderService.attachReceipt(liveOrder.id, b64);
      setLiveOrder(updated);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Error uploading receipt:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const whatsAppUrl = `https://wa.me/2347036192301?text=${encodeURIComponent(
    `Hello SAMM AI, I placed Order #${liveOrder.order_number} (${liveOrder.items.map((i) => i.product_name).join(', ')}). ${currentReceipt ? 'I have attached my payment proof.' : 'I made an OPay transfer.'} Please confirm and expedite my activation.`
  )}`;

  return (
    <div className="py-12 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Card */}
        <div className="rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center sm:text-left">
          {/* Top Glow Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Heading */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              isFailed
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-rose-500/10'
                : isTransfer && isPending
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-amber-500/10'
                : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-emerald-500/10'
            }`}>
              {isFailed ? (
                <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
              ) : isTransfer && isPending ? (
                <Clock className="w-8 h-8 stroke-[2.5] animate-pulse" />
              ) : (
                <CheckCircle className="w-8 h-8 stroke-[2.5]" />
              )}
            </div>
            <div>
              <span className={`text-xs uppercase tracking-widest font-extrabold block ${
                liveOrder.order_status === 'cancelled' || isFailed
                  ? 'text-rose-400'
                  : isTransfer && isPending
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}>
                {liveOrder.order_status === 'cancelled'
                  ? 'ORDER CANCELLED'
                  : isFailed
                  ? 'PAYMENT RECEIPT NOT VERIFIED · ACTION REQUIRED'
                  : isTransfer && isPending
                  ? 'OPAY / BANK TRANSFER SUBMITTED · AWAITING FINANCE VERIFICATION'
                  : 'PAYMENT VERIFIED · DISPATCH IN QUEUE'}
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
                {liveOrder.order_status === 'cancelled'
                  ? 'This Order Has Been Cancelled'
                  : isFailed
                  ? 'Receipt Verification Failed'
                  : isTransfer && isPending
                  ? 'Order Registered · Pending Approval'
                  : 'Order Confirmed & Verified!'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {liveOrder.order_status === 'cancelled'
                  ? 'This order is marked as cancelled. If you already made a transfer, contact our 24/7 WhatsApp operations desk for swift refund processing.'
                  : isFailed
                  ? 'We could not cross-reference this transfer against bank credits. Please check your debit alert or contact our finance team on WhatsApp.'
                  : isTransfer && isPending
                  ? 'Your transfer order has been logged. Our operations team is cross-checking the payment alert on our bank terminal before releasing credentials.'
                  : 'Your transaction has been verified. Our automated fulfillment engine has queued your subscription deployment.'}
              </p>
            </div>
          </div>

          {/* Anti-Fraud Protection Notice for Manual Transfers */}
          {isTransfer && isPending && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-200 text-xs space-y-1.5 mb-6">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Security Verification Active</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                To protect our marketplace against unconfirmed or fake alerts, orders paid via bank transfer remain strictly in <strong className="text-amber-300">Pending Verification</strong> until our finance manager audits the bank credit. Credentials unlock on WhatsApp and in your account automatically upon approval.
              </p>
            </div>
          )}

          {/* Order Snapshot Box */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Order Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-extrabold text-emerald-400">
                    {liveOrder.order_number}
                  </span>
                  <button
                    onClick={handleCopyOrderNumber}
                    className="p-1 rounded text-slate-400 hover:text-white"
                    title="Copy Order Number"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copied && <span className="text-[10px] text-emerald-400">Copied!</span>}
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-[11px] text-slate-400 block font-medium">Amount:</span>
                <span className="font-mono text-base font-extrabold text-white">
                  {formatPrice(liveOrder.total_amount)}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  via {liveOrder.payment_provider}
                </span>
              </div>
            </div>

            {/* Purchased Items */}
            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 block font-medium uppercase tracking-wider">
                Subscriptions Purchased:
              </span>
              {liveOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-900/60"
                >
                  <span className="font-bold text-white">{item.product_name}</span>
                  <span className="text-slate-400 font-mono">
                    {item.subscription_duration} ({formatPrice(item.unit_price)})
                  </span>
                </div>
              ))}
            </div>

            {/* Receipt Proof Section */}
            <div className="pt-3 border-t border-slate-850">
              <span className="text-[11px] text-slate-400 block font-medium uppercase tracking-wider mb-2">
                Payment Proof / Transfer Receipt:
              </span>

              {currentReceipt ? (
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {currentReceipt.startsWith('data:image') || currentReceipt.startsWith('http') ? (
                        <img src={currentReceipt} alt="Receipt preview" className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-6 h-6 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-bold text-white">Receipt Attached</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Verified by operations for fast-track activation
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsViewingReceipt(true)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 border border-emerald-500/30 transition-colors">
                      <span>Change</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handlePostOrderReceiptUpload}
                      />
                    </label>
                  </div>
                </div>
              ) : isTransfer ? (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">No Receipt Uploaded Yet</span>
                    <span className="text-[10px] text-slate-400">Recommended for instant access</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    If you have completed the bank transfer, upload your transfer screenshot below:
                  </p>
                  <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-950/60 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors group">
                    <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    <span className="text-xs font-semibold text-slate-300">
                      {isUploading ? 'Uploading receipt...' : 'Click to Upload Transfer Receipt / Screenshot'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      disabled={isUploading}
                      className="hidden"
                      onChange={handlePostOrderReceiptUpload}
                    />
                  </label>
                  {uploadSuccess && (
                    <span className="text-xs text-emerald-400 font-bold block text-center">
                      Receipt uploaded successfully!
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Automated Paystack transaction reference recorded: {liveOrder.payment_reference || 'Ref verified'}</span>
                </div>
              )}
            </div>

            {/* Delivery Instructions */}
            <div className="pt-3 border-t border-slate-850">
              <span className="text-[11px] text-slate-400 block font-medium uppercase tracking-wider mb-1">
                Delivery Instructions:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your digital invitation or access key will arrive in your email (<strong className="text-white">{liveOrder.customer_email}</strong>) and WhatsApp (<strong className="text-white">{liveOrder.customer_whatsapp}</strong>) within 5 to 15 minutes. For immediate fast-track assistance, click the WhatsApp button below.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Confirm on WhatsApp (07036192301)</span>
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={onGoToAccount}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700"
              >
                <span>View in My Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onContinueShopping}
                className="py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white font-semibold text-xs transition-colors border border-slate-800"
              >
                Continue Shopping
              </button>
            </div>

            {/* Customer Cancel Order Option */}
            {liveOrder.order_status !== 'fulfilled' && liveOrder.order_status !== 'cancelled' && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleCancelThisOrder}
                  disabled={isCancelling}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 py-1.5 px-3 rounded-lg hover:bg-rose-500/10 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{isCancelling ? 'Cancelling order...' : 'Need to cancel this order? Click here'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Receipt Lightbox Preview */}
        {isViewingReceipt && currentReceipt && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Payment Proof · {order.order_number}
                </span>
                <button
                  onClick={() => setIsViewingReceipt(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-auto rounded-xl bg-slate-950 p-2 flex items-center justify-center">
                {currentReceipt.startsWith('data:image') || currentReceipt.startsWith('http') ? (
                  <img src={currentReceipt} alt="Full Receipt" className="max-h-[60vh] object-contain rounded-lg" />
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    <FileText className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                    <span>Receipt Document attached</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsViewingReceipt(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
