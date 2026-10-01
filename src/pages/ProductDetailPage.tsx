import React, { useState } from "react";
import { Product } from "../types";
import { useCart } from "../contexts/CartContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { getSafeImageUrl } from "../lib/storage";
import {
  ShoppingBag,
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MessageCircle,
  ArrowLeft,
  Share2,
  HelpCircle,
  Cpu,
  FileText,
  Code,
  Image,
  Sparkles,
  Flame,
  TrendingUp,
  XCircle,
} from "lucide-react";

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onCheckoutDirect: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onCheckoutDirect,
}) => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  const originalPrice = product.price;
  const currentPrice = product.promo_price ?? product.price;
  const hasDiscount =
    product.promo_price && product.promo_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onCheckoutDirect();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // WhatsApp link with prefilled product message
  const whatsAppUrl = `https://wa.me/2347036192301?text=${encodeURIComponent(
    `Hello SAMM AI, I want to inquire about purchasing ${product.name} (${product.subscription_duration} plan).`,
  )}`;

  // Product specific capability detection
  const capabilities = [
    { title: "Advanced AI Assistance", icon: Cpu, match: true },
    { title: "Writing & Brainstorming", icon: FileText, match: true },
    {
      title: "Document & PDF Analysis",
      icon: FileText,
      match:
        product.name.includes("Gemini") ||
        product.name.includes("ChatGPT") ||
        product.name.includes("Claude") ||
        product.name.includes("Perplexity"),
    },
    {
      title: "High-Res Image Generation",
      icon: Image,
      match:
        product.name.includes("Gemini") ||
        product.name.includes("ChatGPT") ||
        product.name.includes("Grok") ||
        product.name.includes("Midjourney") ||
        product.name.includes("Canva"),
    },
    {
      title: "AI Coding & Refactoring",
      icon: Code,
      match:
        product.name.includes("Gemini") ||
        product.name.includes("ChatGPT") ||
        product.name.includes("Claude") ||
        product.name.includes("Cursor"),
    },
  ].filter((c) => c.match);

  return (
    <div className="py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 p-2 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? "Link Copied!" : "Share"}</span>
          </button>
        </div>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Product Image Showcase */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video relative group shadow-2xl">
              <img
                src={getSafeImageUrl(product.image_url, product.name)}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.src = getSafeImageUrl(null, product.name);
                }}
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

              {/* Dynamic Badges Stack */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 items-center z-10">
                {product.stock_status === "out_of_stock" && (
                  <div className="bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-lg tracking-wider shadow-lg shadow-rose-600/40 flex items-center gap-1.5 uppercase">
                    <XCircle className="w-3.5 h-3.5 text-white" />
                    <span>OUT OF STOCK</span>
                  </div>
                )}
                {product.stock_status === "limited" && (
                  <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-slate-950 font-black text-xs px-3 py-1 rounded-lg tracking-wider shadow-lg shadow-amber-500/30 flex items-center gap-1.5 uppercase">
                    <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                    <span>LIMITED STOCK - FEW SLOTS LEFT</span>
                  </div>
                )}
                {product.is_best_seller && (
                  <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-black text-xs px-3 py-1 rounded-lg tracking-wider shadow-lg shadow-amber-500/30 flex items-center gap-1.5 uppercase">
                    <Flame className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                    <span>Best Seller</span>
                  </div>
                )}
                {product.is_trending && (
                  <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-black text-xs px-3 py-1 rounded-lg tracking-wider shadow-lg shadow-violet-600/30 flex items-center gap-1.5 uppercase">
                    <TrendingUp className="w-3.5 h-3.5 text-white" />
                    <span>Trending</span>
                  </div>
                )}
                {product.is_new && (
                  <div className="bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-slate-950 font-black text-xs px-3 py-1 rounded-lg tracking-wider shadow-lg shadow-cyan-400/30 flex items-center gap-1.5 uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                    <span>New</span>
                  </div>
                )}
                {hasDiscount && (
                  <div className="bg-emerald-500 text-black font-extrabold text-xs px-3 py-1 rounded-lg tracking-wider shadow-lg flex items-center gap-1.5 uppercase">
                    <Zap className="w-3.5 h-3.5 fill-black text-black" />
                    <span>SAVE {discountPercent}% PROMO</span>
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
                <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 font-semibold">
                  {product.category_name}
                </span>
                <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 font-mono text-emerald-400">
                  {product.subscription_duration} Duration
                </span>
              </div>
            </div>

            {/* Quick Guarantees beneath image */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <Zap className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-white block">
                  Digital delivery
                </span>
                <span className="text-[10px] text-slate-400">
                  After payment confirmation
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-white block">
                  Product support
                </span>
                <span className="text-[10px] text-slate-400">
                  Contact us for help
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <MessageCircle className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-white block">
                  WhatsApp help
                </span>
                <span className="text-[10px] text-slate-400">07036192301</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Pricing, Actions & Capabilities */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {/* Metadata line */}
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
                <span className="text-emerald-400 uppercase tracking-wider font-bold">
                  {product.category_name}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300 font-semibold">
                  {product.subscription_duration} ACCESS
                </span>
                <span aria-hidden="true">·</span>
                <span
                  className={`flex items-center gap-1 ${product.stock_status === "out_of_stock" ? "text-rose-400" : "text-emerald-400"}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {product.stock_status === "out_of_stock"
                    ? "Out of stock"
                    : product.stock_status === "limited"
                      ? "Limited availability"
                      : "Available"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {product.name}
              </h1>

              {/* Short Description */}
              <p className="text-sm text-slate-300 mt-2.5 leading-relaxed">
                {product.short_description}
              </p>
            </div>

            {/* Pricing Box */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {hasDiscount ? "PROMO PRICE" : "SUBSCRIPTION PRICE"}
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-white">
                      {formatPrice(currentPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm sm:text-base line-through text-slate-400">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {hasDiscount && (
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                      SAVE {discountPercent}%
                    </span>
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Delivery Method:{" "}
                  {product.delivery_method ||
                    "Email & WhatsApp Instant Delivery"}
                </span>
              </div>
            </div>

            {/* Stock Notice Banner */}
            {product.stock_status === "limited" && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Limited availability:</strong> Contact us before
                  ordering if you want to confirm the current setup options.
                </span>
              </div>
            )}

            {product.stock_status === "out_of_stock" && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2.5">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Currently Sold Out:</strong> We are setting up fresh
                  verified subscription slots for {product.name}. Contact
                  WhatsApp support below to reserve your slot.
                </span>
              </div>
            )}

            {/* Add to Cart & Buy Now Section */}
            <div className="space-y-3">
              <div className="flex gap-3">
                {/* Quantity selector */}
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2">
                  <button
                    disabled={product.stock_status === "out_of_stock"}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-slate-400 hover:text-white disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-2 font-mono font-bold text-sm text-white">
                    {quantity}
                  </span>
                  <button
                    disabled={product.stock_status === "out_of_stock"}
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-slate-400 hover:text-white disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {product.stock_status === "out_of_stock" ? (
                  <button
                    disabled
                    className="flex-1 py-3.5 px-4 rounded-xl bg-slate-800/80 text-slate-500 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-750 cursor-not-allowed opacity-60"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Out of Stock</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => addToCart(product, quantity)}
                      className="flex-1 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-slate-700"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      onClick={handleBuyNow}
                      className="flex-1 py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <span>Buy Now</span>
                    </button>
                  </>
                )}
              </div>

              {/* Need help WhatsApp CTA */}
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-emerald-400 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Need help? Chat with us on WhatsApp (07036192301)</span>
              </a>
            </div>

            {/* AI Capabilities Breakdown */}
            {capabilities.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                  CORE AI CAPABILITIES INCLUDED
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {capabilities.map((cap, i) => {
                    const Icon = cap.icon;
                    return (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-2 text-xs text-slate-300"
                      >
                        <Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{cap.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Tabs: Overview, Features, How Delivery Works, FAQs */}
        <div className="mt-14 pt-12 border-t border-slate-850 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-10">
            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Product Overview
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Features List */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  What is included
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-slate-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How Delivery Works */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white tracking-tight">
                How digital delivery works
              </h3>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Payment confirmation
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Your order number appears after checkout. OPay transfers
                      remain pending until we confirm the funds.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Delivery details
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      After payment is confirmed, we send the invitation, code,
                      or setup instructions using the contact details on your
                      order.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Plan length and support
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Your plan length is {product.subscription_duration}. If
                      you have an access issue, contact us at 07036192301 and
                      include your order number.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Security & WhatsApp Help */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h4 className="text-base font-bold text-white">
                Why buy on SAMM AI?
              </h4>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Local payment option available</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>OPay transfer selected by default</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Support for access issues</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct WhatsApp technician support</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">
                Questions before buying?
              </h4>
              <p className="text-xs text-slate-400">
                We are online to guide you through this tool&apos;s features and
                setup requirements.
              </p>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md"
              >
                <span>Message on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
