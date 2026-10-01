import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { getSafeImageUrl, FALLBACK_PRODUCT_IMAGE } from '../lib/storage';
import {
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  X,
  Sparkles,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface AddToCartToastProps {
  onNavigate?: (page: string) => void;
}

const TOAST_DURATION_MS = 4500;

export const AddToCartToast: React.FC<AddToCartToastProps> = ({ onNavigate }) => {
  const { cartToast, dismissCartToast, setIsCartOpen } = useCart();
  const { formatPrice } = useCurrency();
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!cartToast) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!isHovered) {
      timerRef.current = setTimeout(() => {
        dismissCartToast();
      }, TOAST_DURATION_MS);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [cartToast, isHovered, dismissCartToast]);

  if (!cartToast) return null;

  const { product, quantity, duration } = cartToast;
  const unitPrice = product.promo_price ?? product.price;
  const totalPrice = unitPrice * quantity;

  const handleViewCart = () => {
    dismissCartToast();
    setIsCartOpen(true);
  };

  const handleCheckout = () => {
    dismissCartToast();
    if (onNavigate) {
      onNavigate('checkout');
    } else {
      setIsCartOpen(true);
    }
  };

  return (
    <aside aria-label="Cart notification" className="fixed top-20 right-4 sm:right-6 z-50 max-w-[380px] w-[calc(100vw-32px)] sm:w-[380px] pointer-events-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={cartToast.id}
          initial={{ opacity: 0, y: -25, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          drag="x"
          dragConstraints={{ left: 0, right: 150 }}
          onDragEnd={(_, info) => {
            if (info.offset.x > 80) {
              dismissCartToast();
            }
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative bg-slate-900/95 backdrop-blur-2xl border border-emerald-500/40 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(16,185,129,0.15)] overflow-hidden group select-none"
        >
          {/* Subtle animated top highlight border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

          {/* Toast Header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                Added to Cart!
              </span>
            </div>

            <button
              onClick={dismissCartToast}
              aria-label="Close notification"
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Product Info Row */}
          <div className="flex items-center gap-3.5 pb-3.5 border-b border-slate-800/80">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-750 shrink-0 shadow-inner">
              <img
                src={getSafeImageUrl(product.image_url, product.name)}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.src = getSafeImageUrl(null, product.name);
                }}
                className="w-full h-full object-cover object-center"
              />
              {quantity > 1 && (
                <span className="absolute bottom-1 right-1 bg-emerald-500 text-black font-black text-[9px] px-1 py-0.2 rounded-md shadow">
                  ×{quantity}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                {product.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md truncate max-w-[150px]">
                  {duration || product.subscription_duration}
                </span>
                <span className="text-xs font-black text-white font-mono">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-2 gap-2 pt-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewCart}
              className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Cart</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/25"
            >
              <span>Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          {/* Countdown Progress Bar */}
          {!isHovered && (
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: TOAST_DURATION_MS / 1000, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-[2.5px] bg-gradient-to-r from-emerald-500 to-teal-400"
            />
          )}
        </motion.div>
      </AnimatePresence>
    </aside>
  );
};
