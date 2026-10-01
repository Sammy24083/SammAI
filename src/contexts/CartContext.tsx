import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Discount } from '../types';
import { discountService } from '../services/discountService';

export interface CartToastData {
  id: string;
  product: Product;
  quantity: number;
  duration?: string;
  timestamp: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedDuration?: string, openDrawer?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  discountAmount: number;
  total: number;
  appliedDiscount: Discount | null;
  applyDiscountCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeDiscountCode: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItemCount: number;
  cartToast: CartToastData | null;
  dismissCartToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('samm_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(() => {
    try {
      const saved = localStorage.getItem('samm_applied_discount');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartToast, setCartToast] = useState<CartToastData | null>(null);

  useEffect(() => {
    localStorage.setItem('samm_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedDiscount) {
      localStorage.setItem('samm_applied_discount', JSON.stringify(appliedDiscount));
    } else {
      localStorage.removeItem('samm_applied_discount');
    }
  }, [appliedDiscount]);

  const addToCart = (product: Product, quantity = 1, selectedDuration?: string, openDrawer = false) => {
    const duration = selectedDuration || product.subscription_duration;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedDuration: duration }];
    });

    // Trigger the custom add to cart toast notification
    setCartToast({
      id: `${product.id}-${Date.now()}`,
      product,
      quantity,
      duration,
      timestamp: Date.now(),
    });

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const dismissCartToast = () => {
    setCartToast(null);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedDiscount(null);
  };

  const subtotal = cart.reduce((sum, item) => {
    const unit = item.product.promo_price ?? item.product.price;
    return sum + unit * item.quantity;
  }, 0);

  let discountAmount = 0;
  if (appliedDiscount && subtotal > 0) {
    if (appliedDiscount.type === 'percentage') {
      discountAmount = Math.round((subtotal * appliedDiscount.value) / 100);
      if (appliedDiscount.maximum_discount && discountAmount > appliedDiscount.maximum_discount) {
        discountAmount = appliedDiscount.maximum_discount;
      }
    } else {
      discountAmount = appliedDiscount.value;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const total = Math.max(0, subtotal - discountAmount);

  const totalItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const applyDiscountCode = async (code: string) => {
    const res = await discountService.validateCode(code, subtotal);
    if (res.valid && res.discount) {
      setAppliedDiscount(res.discount);
      return { success: true, message: `Coupon ${code.toUpperCase()} applied successfully!` };
    }
    return { success: false, message: res.message || 'Invalid coupon code' };
  };

  const removeDiscountCode = () => {
    setAppliedDiscount(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
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
        totalItemCount,
        cartToast,
        dismissCartToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
