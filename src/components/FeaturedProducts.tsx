import React, { useState } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FeaturedProductsProps {
  products: Product[];
  onViewDetails: (slug: string) => void;
  onViewAll: () => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  onViewDetails,
  onViewAll,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'featured' | 'deals'>('all');

  const filteredProducts = products.filter((p) => {
    if (selectedFilter === 'featured') return p.is_featured;
    if (selectedFilter === 'deals') return p.is_on_sale || (p.promo_price && p.promo_price < p.price);
    return true;
  });

  return (
    <section className="py-12 sm:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HANDPICKED FOR BUILDERS &amp; CREATORS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Popular right now.
            </h2>
          </div>

          {/* Interactive Filter Tabs (functional segmented control) */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedFilter === 'all'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Tools
            </button>
            <button
              onClick={() => setSelectedFilter('featured')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedFilter === 'featured'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Top Featured
            </button>
            <button
              onClick={() => setSelectedFilter('deals')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedFilter === 'deals'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Special Promos
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>

        {/* Bottom CTA to view all */}
        <div className="mt-12 text-center">
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white text-sm font-semibold transition-all shadow-md group"
          >
            <span>Browse Complete Tool Catalogue ({products.length} subscriptions)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
