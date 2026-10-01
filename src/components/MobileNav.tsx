import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Sparkles, Flame, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface Props {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const MobileNav: React.FC<Props> = ({ currentPage, onNavigate }) => {
  const { totalItemCount, setIsCartOpen } = useCart();

  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'products', label: 'AI Tools', icon: Sparkles },
    { id: 'deals', label: 'Deals', icon: Flame, badgeIcon: true },
    { id: 'cart', label: 'Cart', icon: ShoppingBag, badge: totalItemCount },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800 px-2 py-1.5 pb-safe shadow-lg">
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto relative">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => {
                if (item.id === 'cart') {
                  setIsCartOpen(true);
                } else {
                  onNavigate(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors relative z-10 ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavPill"
                  className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4] text-emerald-400' : 'stroke-[1.8]'}`} />
                
                {/* Cart Count Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <AnimatePresence>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-2 bg-emerald-400 text-black font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-md shadow-emerald-500/40"
                    >
                      {item.badge}
                    </motion.span>
                  </AnimatePresence>
                )}

                {/* Hot Badge on Deals */}
                {item.badgeIcon && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                )}
              </div>

              <span className="text-[10px] mt-0.5 tracking-tight truncate">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
