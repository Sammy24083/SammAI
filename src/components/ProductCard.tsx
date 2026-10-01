import React from "react";
import { Product } from "../types";
import { useCart } from "../contexts/CartContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { getSafeImageUrl, FALLBACK_PRODUCT_IMAGE } from "../lib/storage";
import {
  ShoppingBag,
  Eye,
  Zap,
  CheckCircle2,
  ArrowRight,
  Flame,
  TrendingUp,
  Sparkles,
} from "lucide-react";

interface ProductCardProps {
  product: Product;
  onViewDetails: (slug: string) => void;
  onInstantBuy?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onInstantBuy,
}) => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const originalPrice = product.price;
  const currentPrice = product.promo_price ?? product.price;
  const hasDiscount =
    product.promo_price && product.promo_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    if (onInstantBuy) {
      onInstantBuy(product);
    } else {
      onViewDetails(product.slug);
    }
  };

  return (
    <div className="group rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-emerald-500/5 relative">
      {/* Top Banner Image with Aspect Ratio */}
      <div
        onClick={() => onViewDetails(product.slug)}
        className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
      >
        <img
          src={getSafeImageUrl(product.image_url, product.name)}
          alt={product.name}
          onError={(e) => {
            // Self-healing fallback if image URL fails or is blocked
            e.currentTarget.src = getSafeImageUrl(null, product.name);
          }}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/20" />

        {/* Dynamic Badges & Discount Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center z-10 max-w-[70%]">
          {product.stock_status === "out_of_stock" && (
            <div className="bg-rose-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-md tracking-wider shadow-md shadow-rose-600/30 flex items-center gap-1 uppercase">
              <span>Out of Stock</span>
            </div>
          )}

          {product.stock_status === "limited" && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-md tracking-wider shadow-md shadow-amber-500/25 flex items-center gap-1 uppercase">
              <Zap className="w-3 h-3 fill-slate-950 text-slate-950" />
              <span>Limited Stock</span>
            </div>
          )}

          {product.is_best_seller && (
            <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-md tracking-wider shadow-md shadow-amber-500/25 flex items-center gap-1 uppercase">
              <Flame className="w-3 h-3 fill-slate-950 text-slate-950" />
              <span>Best Seller</span>
            </div>
          )}

          {product.is_trending && (
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-md tracking-wider shadow-md shadow-violet-600/25 flex items-center gap-1 uppercase">
              <TrendingUp className="w-3 h-3 text-white" />
              <span>Trending</span>
            </div>
          )}

          {product.is_new && (
            <div className="bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-md tracking-wider shadow-md shadow-cyan-400/25 flex items-center gap-1 uppercase">
              <Sparkles className="w-3 h-3 text-slate-950 fill-slate-950" />
              <span>New</span>
            </div>
          )}

          {hasDiscount && (
            <div className="bg-emerald-500 text-black font-extrabold text-[10px] px-2.5 py-0.5 rounded-md tracking-wider shadow-md shadow-emerald-500/20 flex items-center gap-1 uppercase">
              <Zap className="w-3 h-3 fill-black text-black" />
              <span>SAVE {discountPercent}%</span>
            </div>
          )}
        </div>

        {/* Duration Tag */}
        <div className="absolute top-3 right-3 text-right">
          <span className="text-[11px] font-bold text-slate-100 bg-slate-950/85 backdrop-blur-md px-2.5 py-0.5 rounded border border-slate-700/60 shadow-sm">
            {product.subscription_duration}
          </span>
        </div>

        {/* Fast Delivery Badge */}
        <div className="absolute bottom-2 left-3 flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur-sm border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Access details after payment confirmation</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata & Rating */}
          <div className="text-xs text-emerald-400 font-semibold mb-2">
            {product.category_name || "Digital tools"}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onViewDetails(product.slug)}
            className="text-base sm:text-lg font-extrabold text-white group-hover:text-emerald-400 transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.short_description}
          </p>
        </div>

        {/* Bottom Section: Price & Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-baseline justify-between gap-2 mb-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                {hasDiscount ? "SPECIAL DEAL" : "REGULAR PRICE"}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-white font-mono">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xs line-through text-slate-400 font-mono">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              {product.stock_status === "out_of_stock" ? (
                <span className="text-[11px] text-rose-400 font-bold flex items-center gap-1 justify-end">
                  ❌ Out of Stock
                </span>
              ) : product.stock_status === "limited" ? (
                <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1 justify-end">
                  ⚡ Limited Stock
                </span>
              ) : (
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 justify-end">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> In
                  Stock
                </span>
              )}
              <span className="text-[10px] text-slate-400">
                Setup details on product page
              </span>
            </div>
          </div>

          {/* Action CTAs: Add to Cart + Details */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onViewDetails(product.slug)}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-700/60"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>

            {product.stock_status === "out_of_stock" ? (
              <button
                disabled
                className="py-2.5 px-3 rounded-xl bg-slate-800/80 text-slate-500 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed opacity-60 border border-slate-750"
              >
                <span>Out of Stock</span>
              </button>
            ) : (
              <button
                onClick={() => addToCart(product, 1)}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  product.stock_status === "limited"
                    ? "bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20"
                    : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>
                  {product.stock_status === "limited"
                    ? "Order Slot"
                    : "Add to Cart"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
