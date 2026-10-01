import React, { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { useAuth } from "../contexts/AuthContext";
import { orderService } from "../services/orderService";
import { paymentService, paystackService } from "../services/paymentService";
import { adminService } from "../services/discountService";
import { Order, PaymentStatus, OrderStatus, DeliveryStatus } from "../types";
import { PaystackModal } from "../components/checkout/PaystackModal";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  Building,
  RefreshCw,
  UploadCloud,
  FileText,
  Trash2,
  Eye,
} from "lucide-react";

interface CheckoutPageProps {
  onBackToCart: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBackToCart,
  onOrderSuccess,
}) => {
  const { cart, subtotal, discountAmount, total, appliedDiscount, clearCart } =
    useCart();
  const { formatPrice, currency } = useCurrency();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "07036192301");
  const [whatsapp, setWhatsapp] = useState(
    user?.whatsapp_number || "07036192301",
  );
  const [country, setCountry] = useState(user?.country || "Nigeria");
  const [orderNotes, setOrderNotes] = useState("");

  const [paymentMode, setPaymentMode] = useState<"paystack" | "transfer">(
    "transfer",
  );
  const [senderName, setSenderName] = useState("");
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState("");
  const [receiptFileSize, setReceiptFileSize] = useState("");
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Paystack Payment Session & Multi-Phase Loading State
  const [paystackModalOpen, setPaystackModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<{
    order: Order;
    reference: string;
  } | null>(null);
  const [paymentPhase, setPaymentPhase] = useState<
    "idle" | "initializing" | "awaiting_payment" | "verifying" | "success"
  >("idle");

  useEffect(() => {
    adminService.getSiteSettings().then(setSiteSettings);
  }, []);

  const opayAccountNumber = siteSettings?.opay_account_number || "07036192301";
  const opayAccountName =
    siteSettings?.opay_account_name || "Samuel Amaechi / SAMM AI";
  const opayBankName = siteSettings?.opay_bank_name || "OPay (Paycom)";

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(opayAccountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const handleReceiptChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFileName(file.name);
    setReceiptFileSize((file.size / 1024).toFixed(1) + " KB");
    try {
      const { fileToBase64 } = await import("../lib/storage");
      const b64 = await fileToBase64(file);
      setReceiptPreview(b64);
    } catch (err) {
      console.error("Error reading receipt file:", err);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptPreview(null);
    setReceiptFileName("");
    setReceiptFileSize("");
  };

  const handlePaystackModalSuccess = async (ref: string) => {
    if (!activeSession) return;
    setPaystackModalOpen(false);
    setPaymentPhase("verifying");
    setIsProcessing(true);
    try {
      const verified = await paystackService.verifyPayment(
        ref,
        activeSession.order.id,
        total,
      );
      setPaymentPhase("success");
      setTimeout(() => {
        clearCart();
        setIsProcessing(false);
        setPaymentPhase("idle");
        onOrderSuccess(verified.order);
      }, 1200);
    } catch (err: any) {
      setPaymentPhase("idle");
      setIsProcessing(false);
      setErrorMessage(err.message || "Payment verification failed");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <h2 className="text-xl font-bold text-white">Your cart is empty</h2>
        <p className="text-xs text-slate-400 mt-2 mb-6">
          Add some subscriptions to your cart before proceeding to checkout.
        </p>
        <button
          onClick={onBackToCart}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !whatsapp.trim()) {
      setErrorMessage(
        "Please fill in your Full Name, Email, and WhatsApp number.",
      );
      return;
    }

    try {
      setIsProcessing(true);

      if (paymentMode === "transfer") {
        // Direct OPay / Bank Transfer flow
        const transferOrder = await orderService.createOrder({
          customer_id: user?.id || "cust-guest",
          customer_name: fullName,
          customer_email: email,
          customer_phone: phone,
          customer_whatsapp: whatsapp,
          customer_country: country,
          sender_name: senderName || undefined,
          receipt_url: receiptPreview || undefined,
          order_notes:
            (orderNotes ? orderNotes + " | " : "") +
            (senderName
              ? `OPay Sender: ${senderName}`
              : "Paid via OPay transfer") +
            (receiptPreview ? " [Payment Proof Attached]" : ""),
          items: cart.map((c) => ({
            id: "item-" + Date.now() + Math.random().toString(36).substring(7),
            order_id: "",
            product_id: c.product.id,
            product_name: c.product.name,
            quantity: c.quantity,
            unit_price: c.product.promo_price ?? c.product.price,
            total_price:
              (c.product.promo_price ?? c.product.price) * c.quantity,
            subscription_duration:
              c.selectedDuration || c.product.subscription_duration,
            image_url: c.product.image_url,
          })),
          subtotal,
          discount_amount: discountAmount,
          total_amount: total,
          currency: "NGN",
          discount_code: appliedDiscount?.code,
          payment_status: "pending",
          order_status: "pending",
          payment_provider: "OPay Transfer",
          delivery_status: "pending",
        });

        // Open WhatsApp with prefilled message
        const waText = encodeURIComponent(
          `Hello SAMM AI! I have completed payment of ₦${total.toLocaleString()} via OPay Bank Transfer for Order #${transferOrder.order_number}.\n\nItems: ${cart.map((c) => c.product.name).join(", ")}\nName: ${fullName}\nEmail: ${email}\nSender Remark: ${senderName || "OPay Transfer"}\n\nPlease confirm and activate my subscription!`,
        );
        window.open(`https://wa.me/2347036192301?text=${waText}`, "_blank");

        clearCart();
        setIsProcessing(false);
        onOrderSuccess(transferOrder);
        return;
      }

      // Automated Paystack flow
      const pendingOrder = await orderService.createOrder({
        customer_id: user?.id || "cust-guest",
        customer_name: fullName,
        customer_email: email,
        customer_phone: phone,
        customer_whatsapp: whatsapp,
        customer_country: country,
        order_notes: orderNotes,
        items: cart.map((c) => ({
          id: "item-" + Date.now() + Math.random().toString(36).substring(7),
          order_id: "",
          product_id: c.product.id,
          product_name: c.product.name,
          quantity: c.quantity,
          unit_price: c.product.promo_price ?? c.product.price,
          total_price: (c.product.promo_price ?? c.product.price) * c.quantity,
          subscription_duration:
            c.selectedDuration || c.product.subscription_duration,
          image_url: c.product.image_url,
        })),
        subtotal,
        discount_amount: discountAmount,
        total_amount: total,
        currency: "NGN",
        discount_code: appliedDiscount?.code,
        payment_status: "pending",
        order_status: "pending",
        payment_provider: "Paystack",
        delivery_status: "pending",
      });

      // Initiate Paystack payment session with customer data and total amount
      setPaymentPhase("initializing");

      const sessionResult = await paystackService.initializePayment({
        orderId: pendingOrder.id,
        orderNumber: pendingOrder.order_number,
        email,
        amount: total,
        currency: "NGN",
        customerName: fullName,
        customerWhatsapp: whatsapp,
        publicKey: siteSettings?.paystack_public_key,
        onSuccess: async (response) => {
          setPaymentPhase("verifying");
          try {
            const verified = await paystackService.verifyPayment(
              response.reference || sessionResult.reference,
              pendingOrder.id,
              total,
            );
            setPaymentPhase("success");
            setTimeout(() => {
              clearCart();
              setIsProcessing(false);
              setPaymentPhase("idle");
              onOrderSuccess(verified.order);
            }, 1200);
          } catch (err: any) {
            setPaymentPhase("idle");
            setIsProcessing(false);
            setErrorMessage(err.message || "Payment verification failed");
          }
        },
        onCancel: () => {
          setPaymentPhase("idle");
          setIsProcessing(false);
          setErrorMessage(
            "Payment was not completed. Your card has not been charged.",
          );
        },
        onError: (err) => {
          setPaymentPhase("idle");
          setIsProcessing(false);
          setErrorMessage(err.message || "Payment processing error");
        },
      });

      if (sessionResult.mode === "inline") {
        setPaymentPhase("awaiting_payment");
      } else {
        setPaymentPhase("idle");
        setActiveSession({
          order: pendingOrder,
          reference: sessionResult.reference,
        });
        setPaystackModalOpen(true);
        setIsProcessing(false);
      }
    } catch (err) {
      setPaymentPhase("idle");
      setIsProcessing(false);
      setErrorMessage(
        (err as Error).message ||
          "Payment initiation failed. Please try again.",
      );
    }
  };

  return (
    <div className="py-8 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={onBackToCart}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shopping</span>
          </button>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Checkout
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Add your contact details, choose a payment method, and review your
            order. Access details are sent after payment has been confirmed.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form
          onSubmit={handleCheckoutSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Left Form: Customer Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Delivery &amp; Contact Details
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Samuel Okafor"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Email Address (for Invite / Login) *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      WhatsApp Number (for Instant Key) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="e.g. 07036192301"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 07036192301"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Country
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Nigeria">Nigeria 🇳🇬</option>
                      <option value="Ghana">Ghana 🇬🇭</option>
                      <option value="Kenya">Kenya 🇰🇪</option>
                      <option value="South Africa">South Africa 🇿🇦</option>
                      <option value="Other">Other African Country</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    Order Notes / Specific Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g. Please invite my existing Gemini Gmail account..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Gateway Selector */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Secure Payment Method
              </h3>

              <div className="space-y-3">
                {/* 1. Paystack Option */}
                <div
                  onClick={() => setPaymentMode("paystack")}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMode === "paystack"
                      ? "bg-emerald-500/10 border-emerald-500/40 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">
                          Paystack
                        </h4>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500 text-black">
                          OTHER OPTION
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Use Paystack if you prefer not to pay by direct
                        transfer.
                      </p>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-emerald-400 flex items-center justify-center p-0.5 shrink-0">
                    {paymentMode === "paystack" && (
                      <div className="w-full h-full bg-emerald-400 rounded-full" />
                    )}
                  </div>
                </div>

                {/* 2. Direct OPay / Bank Transfer Option */}
                <div
                  onClick={() => setPaymentMode("transfer")}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMode === "transfer"
                      ? "bg-emerald-500/10 border-emerald-500/40 text-white shadow-lg shadow-emerald-500/5"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-bold text-white">
                          OPay Bank Transfer
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-sm">
                          DEFAULT
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          MANUAL CONFIRMATION
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Transfer to the OPay account below. We will review the
                        payment and update your order after the funds arrive.
                      </p>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-emerald-400 flex items-center justify-center p-0.5 shrink-0">
                    {paymentMode === "transfer" && (
                      <div className="w-full h-full bg-emerald-400 rounded-full" />
                    )}
                  </div>
                </div>

                {/* OPay Account Details Box when selected */}
                {paymentMode === "transfer" && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3 animate-fade-in text-xs">
                    {/* OPay Best To Run Transfer Announcement Banner */}
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2 text-emerald-300 font-bold text-[11px]">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Your order stays pending while we confirm the transfer.
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold text-emerald-400">
                        OPay Transfer Details
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Official Merchant Account
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Bank Name:</span>
                        <strong className="text-white font-semibold">
                          {opayBankName}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Account Number:</span>
                        <div className="flex items-center gap-2">
                          <strong className="text-emerald-400 font-mono text-sm font-black tracking-wider">
                            {opayAccountNumber}
                          </strong>
                          <button
                            type="button"
                            onClick={handleCopyAccount}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Copy Account Number"
                          >
                            {copiedAccount ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Account Name:</span>
                        <strong className="text-white font-semibold">
                          {opayAccountName}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                        <span className="text-slate-400">
                          Amount to Transfer:
                        </span>
                        <strong className="text-emerald-400 font-mono text-sm font-black">
                          {formatPrice(total)}
                        </strong>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Your Transfer Remark or OPay Sender Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="e.g. Samuel Okafor (OPay)"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5 flex items-center justify-between">
                        <span>Upload Payment Proof / Receipt</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Optional · helps us identify your payment
                        </span>
                      </label>

                      {!receiptPreview ? (
                        <label className="border-2 border-dashed border-slate-750 hover:border-emerald-500/50 bg-slate-900/60 hover:bg-slate-900 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all group">
                          <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 group-hover:scale-110 transition-all mb-1.5" />
                          <span className="text-xs font-semibold text-slate-200">
                            Click to upload transfer screenshot or receipt
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            PNG, JPG, WebP, or PDF screenshots
                          </span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={handleReceiptChange}
                          />
                        </label>
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg shadow-emerald-500/5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                              {receiptPreview.startsWith("data:image") ? (
                                <img
                                  src={receiptPreview}
                                  alt="Receipt preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FileText className="w-6 h-6 text-emerald-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span className="text-xs font-bold text-white truncate max-w-[180px]">
                                  {receiptFileName || "Receipt Attached"}
                                </span>
                              </div>
                              <span className="text-[10px] text-emerald-400/90 block font-mono mt-0.5">
                                {receiptFileSize} · Attached for verification
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveReceipt}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                            title="Remove receipt"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Never share your card PIN, password, or one-time code with
                  anyone.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Pay Button */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 sticky top-28">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Order Summary
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => {
                  const unit = item.product.promo_price ?? item.product.price;
                  return (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between gap-3 text-xs py-2 border-b border-slate-850"
                    >
                      <div className="min-w-0">
                        <h4 className="font-bold text-white truncate">
                          {item.product.name}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {item.quantity} × {formatPrice(unit)} (
                          {item.selectedDuration ||
                            item.product.subscription_duration}
                          )
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-200">
                        {formatPrice(unit * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Calculations */}
              <div className="space-y-2 text-xs text-slate-400 pt-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-200">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({appliedDiscount?.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                  <span>Total Due</span>
                  <span className="text-emerald-400 text-lg font-black">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Pay Button */}
              {paymentMode === "transfer" ? (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Order...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4" />
                      <span>
                        I Have Transferred {formatPrice(total)} — Notify
                        WhatsApp
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Verifying with Paystack...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay {formatPrice(total)} with Paystack</span>
                    </>
                  )}
                </button>
              )}

              {/* Guarantee info */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    Delivery details are sent after payment is confirmed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Order support: 07036192301</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Paystack Interactive Payment Session Modal */}
      {activeSession && (
        <PaystackModal
          isOpen={paystackModalOpen}
          orderNumber={activeSession.order.order_number}
          customerEmail={email}
          customerName={fullName}
          totalAmount={total}
          reference={activeSession.reference}
          onSuccess={handlePaystackModalSuccess}
          onClose={() => {
            setPaystackModalOpen(false);
            setErrorMessage("Payment session was closed by the user.");
          }}
        />
      )}

      {/* Multi-Phase Payment Gateway Loading Overlay */}
      {paymentPhase !== "idle" && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-slate-750 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center relative">
              {paymentPhase === "initializing" && (
                <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              )}
              {paymentPhase === "awaiting_payment" && (
                <div className="relative">
                  <Lock className="w-7 h-7 text-emerald-400 animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                </div>
              )}
              {paymentPhase === "verifying" && (
                <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
              )}
              {paymentPhase === "success" && (
                <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-white">
                {paymentPhase === "initializing" &&
                  "Connecting to Paystack Gateway..."}
                {paymentPhase === "awaiting_payment" &&
                  "Awaiting Payment Authorization..."}
                {paymentPhase === "verifying" &&
                  "Verifying Payment & Generating Receipt..."}
                {paymentPhase === "success" && "Payment Verified Successfully!"}
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                {paymentPhase === "initializing" &&
                  `Preparing 256-bit encrypted checkout session for ${formatPrice(total)}.`}
                {paymentPhase === "awaiting_payment" &&
                  "Please complete your transaction in the Paystack modal. Do not refresh this page."}
                {paymentPhase === "verifying" &&
                  `Confirming transaction with Paystack and sending receipt to ${email}...`}
                {paymentPhase === "success" &&
                  "Your payment is approved! Confirmation email has been sent. Opening receipt..."}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full bg-emerald-400 transition-all duration-500 ${
                  paymentPhase === "initializing"
                    ? "w-1/3"
                    : paymentPhase === "awaiting_payment"
                      ? "w-2/3"
                      : paymentPhase === "verifying"
                        ? "w-5/6"
                        : "w-full"
                }`}
              />
            </div>

            {paymentPhase === "awaiting_payment" && (
              <button
                type="button"
                onClick={() => {
                  setPaymentPhase("idle");
                  setIsProcessing(false);
                  setErrorMessage("Payment was cancelled.");
                }}
                className="text-xs text-slate-400 hover:text-rose-400 underline font-medium transition-colors"
              >
                Cancel Transaction
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
