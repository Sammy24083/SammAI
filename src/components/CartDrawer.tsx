import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { getSafeImageUrl } from '../lib/storage';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface CartDrawerProps {
  onCheckout: () => void;
  onNavigateHome: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onNavigateHome }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    discountAmount,
    total,
    appliedDiscount,
    applyDiscountCode,
    removeDiscountCode,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const { formatPrice } = useCurrency();
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplying(true);
    setCouponMessage(null);
    const res = await applyDiscountCode(couponInput.trim());
    setIsApplying(false);

    if (res.success) {
      setCouponMessage({ text: res.message, isError: false });
      setCouponInput('');
    } else {
      setCouponMessage({ text: res.message, isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Your Cart</h2>
              <span className="text-xs text-slate-400">({cart.length} items)</span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white">Your cart is empty</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Browse our catalog of premium AI subscriptions, creative tools, and developer tools.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigateHome();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const unitPrice = item.product.promo_price ?? item.product.price;
                return (
                  <div
                    key={item.product.id}
                    className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-750 flex gap-3.5 items-center"
                  >
                    <img
                      src={getSafeImageUrl(item.product.image_url, item.product.name)}
                      alt={item.product.name}
                      onError={(e) => {
                        e.currentTarget.src = getSafeImageUrl(null, item.product.name);
                      }}
                      className="w-14 h-14 rounded-lg object-cover bg-slate-950 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {item.selectedDuration || item.product.subscription_duration}
                      </p>
                      <div className="text-xs font-extrabold text-emerald-400 mt-1">
                        {formatPrice(unitPrice * item.quantity)}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg p-1 border border-slate-700">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 hover:text-white text-slate-400 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold text-white w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 hover:text-white text-slate-400 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-800 bg-slate-950/60 space-y-4">
              {/* Promo Code Box */}
              <div>
                {appliedDiscount ? (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <Tag className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-bold text-emerald-400 font-mono">
                        {appliedDiscount.code}
                      </span>
                      <span className="text-slate-400">
                        ({appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}% OFF` : `-${formatPrice(appliedDiscount.value)}`})
                      </span>
                    </div>
                    <button
                      onClick={removeDiscountCode}
                      className="text-slate-400 hover:text-red-400 text-xs font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Discount code (e.g. SAMM10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isApplying || !couponInput.trim()}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      {isApplying ? 'Applying...' : 'Apply'}
                    </button>
                  </form>
                )}

                {couponMessage && (
                  <div
                    className={`flex items-center gap-1.5 text-[11px] mt-1.5 ${
                      couponMessage.isError ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {couponMessage.isError ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    <span>{couponMessage.text}</span>
                  </div>
                )}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-200 font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
                  <span>Total</span>
                  <span className="text-base text-emerald-400">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onCheckout();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <span>PROCEED TO SECURE CHECKOUT</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-200 font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
