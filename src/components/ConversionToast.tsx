import React, { useState, useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { localStore } from '../lib/supabase';
import { Order } from '../types';

export const ConversionToast: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const loadRealOrders = () => {
      const realOrders = localStore.getOrders().filter((o) => o.items && o.items.length > 0);
      setOrders(realOrders);
    };

    loadRealOrders();
    window.addEventListener('samm-store-update', loadRealOrders);
    return () => window.removeEventListener('samm-store-update', loadRealOrders);
  }, []);

  useEffect(() => {
    if (dismissed || orders.length === 0) return;

    // Show initial toast after 5 seconds if there are real orders
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    // Cycle every 18 seconds
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % orders.length);
        setIsVisible(true);
      }, 1000);
    }, 18000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [dismissed, orders]);

  if (dismissed || !isVisible || orders.length === 0) return null;

  const currentOrder = orders[currentIndex % orders.length];
  if (!currentOrder) return null;

  // Mask customer name for privacy e.g. "Samuel A."
  const nameParts = currentOrder.customer_name.trim().split(' ');
  const maskedName =
    nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[1].charAt(0)}.`
      : currentOrder.customer_name;

  const item = currentOrder.items[0];

  return (
    <aside
      aria-label="Recent buyer notification"
      className="fixed bottom-20 left-4 z-40 max-w-xs sm:max-w-sm bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 p-3.5 rounded-2xl shadow-2xl shadow-black/80 flex items-center gap-3 transition-all duration-500 animate-slide-up"
    >
      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
        <CheckCircle2 className="w-5 h-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs font-bold text-white truncate">
            {maskedName} <span className="text-[10px] text-slate-400 font-normal">in {currentOrder.customer_country || 'Nigeria'}</span>
          </p>
          <span className="text-[10px] text-emerald-400 font-medium shrink-0">Recent Order</span>
        </div>
        <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
          Purchased <span className="text-emerald-400 font-semibold">{item?.product_name || 'AI Subscription'}</span>
        </p>
        <span className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Verified Order #{currentOrder.order_number}</span>
        </span>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-slate-500 hover:text-slate-300 transition-colors shrink-0"
        title="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
