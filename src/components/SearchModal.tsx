import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (slug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? products.filter((p) => {
        const text = `${p.name} ${p.short_description} ${p.category_name} ${p.description} ${p.features.join(' ')}`.toLowerCase();
        return text.includes(query.toLowerCase());
      })
    : products.slice(0, 5); // default popular recommendations

  const popularSearches = ['Gemini', 'ChatGPT', 'Canva', 'Grok', 'Claude', 'Cursor', 'Perplexity'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative mx-auto max-w-2xl bg-slate-900 rounded-2xl border border-slate-750 shadow-2xl overflow-hidden z-10">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-800">
          <Search className="w-5 h-5 text-emerald-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search ChatGPT, Gemini, Canva, Claude, Grok, Developer tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-4 text-sm sm:text-base bg-transparent text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Quick Suggestion Tags */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 text-[11px] shrink-0 font-medium">Quick search:</span>
          {popularSearches.map((term) => (
            <button
              key={term}
              onClick={() => setQuery(term)}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-emerald-400 transition-colors shrink-0 text-[11px]"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No matching AI tools found for &ldquo;{query}&rdquo;.
              <p className="text-xs text-slate-400 mt-1">
                Try searching for Gemini, ChatGPT, Canva, or Claude.
              </p>
            </div>
          ) : (
            filtered.map((product) => {
              const currentPrice = product.promo_price ?? product.price;
              return (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product.slug);
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-850/60 hover:bg-slate-800 border border-slate-750 flex items-center justify-between gap-4 cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-950 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                          {product.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                          {product.subscription_duration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {product.short_description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-400 block">
                      {formatPrice(currentPrice)}
                    </span>
                    <span className="text-[10px] text-slate-400 group-hover:text-emerald-300 transition-colors flex items-center gap-1 justify-end">
                      View <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Showing real-time results from SAMM AI catalogue
          </span>
          <span className="text-slate-400">Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
