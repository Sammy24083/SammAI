import React from 'react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Flame, Clock, Sparkles, Tag, ArrowRight } from 'lucide-react';

interface DealsPageProps {
  products: Product[];
  onViewProduct: (slug: string) => void;
  onNavigateHome: () => void;
}

export const DealsPage: React.FC<DealsPageProps> = ({
  products,
  onViewProduct,
  onNavigateHome,
}) => {
  // Filter for products that are on sale or have a promo price
  const dealProducts = products.filter(
    (p) => p.is_on_sale || (p.promo_price && p.promo_price < p.price)
  );

  return (
    <div className="py-8 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Banner for Deals */}
        <div className="relative rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/40 border border-amber-500/30 p-8 sm:p-12 overflow-hidden shadow-2xl mb-12">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>SPECIAL PROMOTIONS &amp; VALUE BUNDLES</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Exclusive AI Deals.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Save big on extended subscriptions for Google Gemini Pro, Canva Pro, ChatGPT Plus, and Super Grok. Authentic subscriptions backed by our full validity guarantee.
            </p>

            <div className="flex items-center gap-4 text-xs text-amber-300 font-semibold pt-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Limited Availability
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Tag className="w-4 h-4" /> Codes auto-applicable at checkout
              </span>
            </div>
          </div>
        </div>

        {/* Coupons Showcase */}
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-4">
            ACTIVE DISCOUNT COUPONS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-sm text-emerald-400">SAMM10</span>
                <p className="text-xs text-slate-400 mt-0.5">10% OFF orders above ₦5,000</p>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded">Auto-copy</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-sm text-emerald-400">STUDENT20</span>
                <p className="text-xs text-slate-400 mt-0.5">20% OFF orders above ₦10,000</p>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded">Student Plan</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-sm text-emerald-400">WELCOME5</span>
                <p className="text-xs text-slate-400 mt-0.5">₦1,500 flat discount for first order</p>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded">New User</span>
            </div>
          </div>
        </div>

        {/* Deals Product Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Discounted Subscriptions ({dealProducts.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dealProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={onViewProduct}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
