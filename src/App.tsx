/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { productService } from "./services/productService";
import { categoryService } from "./services/categoryService";
import { adminService } from "./services/discountService";
import { localStore, subscribeToDatabaseChanges } from "./lib/supabase";
import { Product, Category, FAQ, Review, Order } from "./types";

// UI Components
import { ConversionBanner } from "./components/ConversionBanner";
import { AddToCartToast } from "./components/AddToCartToast";
import { Navbar } from "./components/Navbar";
import { MobileNav } from "./components/MobileNav";
import { CartDrawer } from "./components/CartDrawer";
import { SearchModal } from "./components/SearchModal";
import { WhatsAppFloating } from "./components/WhatsAppFloating";
import { Footer } from "./components/Footer";

// Pages
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { DealsPage } from "./pages/DealsPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { AccountPage } from "./pages/AccountPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AboutPage } from "./pages/AboutPage";
import { FaqPage } from "./pages/FaqPage";
import { PoliciesPage } from "./pages/PoliciesPage";

export function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [pageParams, setPageParams] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load all initial data and subscribe to reactive store events
  const refreshData = async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const [prods, cats, faqList] = await Promise.all([
        productService.getAllProducts(),
        categoryService.getAllCategories(),
        adminService.getFaqs(),
      ]);
      const revs = localStore.getReviews();

      setProducts(prods);
      setCategories(cats);
      setFaqs(faqList);
      setReviews(revs);

      setSelectedProduct((prev) => {
        if (!prev) return null;
        return (
          prods.find((p) => p.id === prev.id || p.slug === prev.slug) || prev
        );
      });
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData(true);
    const unsubscribeFromDatabase = subscribeToDatabaseChanges();

    const handleStoreUpdate = () => {
      refreshData(false);
    };

    window.addEventListener("samm-store-update", handleStoreUpdate);
    return () => {
      window.removeEventListener("samm-store-update", handleStoreUpdate);
      unsubscribeFromDatabase();
    };
  }, []);

  // Navigation handler
  const handleNavigate = (
    page: string,
    params: Record<string, string> = {},
  ) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // View product details
  const handleViewProduct = (slugOrId: string) => {
    const found = products.find(
      (p) => p.slug === slugOrId || p.id === slugOrId,
    );
    if (found) {
      setSelectedProduct(found);
      handleNavigate("product-detail", { slug: found.slug });
    }
  };

  // Render current view
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <HomePage
            products={products}
            categories={categories}
            faqs={faqs}
            reviews={reviews}
            isLoading={isLoading}
            onNavigate={handleNavigate}
            onViewProduct={handleViewProduct}
          />
        );

      case "products":
        return (
          <ProductsPage
            products={products}
            categories={categories}
            initialCategory={pageParams.category}
            isLoading={isLoading}
            onViewProduct={handleViewProduct}
          />
        );

      case "product-detail":
        if (!selectedProduct) {
          return (
            <ProductsPage
              products={products}
              categories={categories}
              isLoading={isLoading}
              onViewProduct={handleViewProduct}
            />
          );
        }
        return (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => handleNavigate("products")}
            onCheckoutDirect={() => handleNavigate("checkout")}
          />
        );

      case "deals":
        return (
          <DealsPage
            products={products}
            onViewProduct={handleViewProduct}
            onNavigateHome={() => handleNavigate("home")}
          />
        );

      case "checkout":
        return (
          <CheckoutPage
            onBackToCart={() => handleNavigate("products")}
            onOrderSuccess={(order) => {
              setConfirmedOrder(order);
              handleNavigate("confirmation");
            }}
          />
        );

      case "confirmation":
        if (!confirmedOrder) {
          return (
            <HomePage
              products={products}
              categories={categories}
              faqs={faqs}
              reviews={reviews}
              onNavigate={handleNavigate}
              onViewProduct={handleViewProduct}
            />
          );
        }
        return (
          <OrderConfirmationPage
            order={confirmedOrder}
            onGoToAccount={() => handleNavigate("account")}
            onContinueShopping={() => handleNavigate("products")}
          />
        );

      case "account":
        return <AccountPage />;

      case "admin":
        return (
          <AdminDashboardPage
            categories={categories}
            onNavigateHome={() => handleNavigate("home")}
          />
        );

      case "about":
        return <AboutPage />;

      case "faq":
        return <FaqPage faqs={faqs} />;

      case "policies":
        return <PoliciesPage section={pageParams.section} />;

      default:
        return (
          <HomePage
            products={products}
            categories={categories}
            faqs={faqs}
            reviews={reviews}
            onNavigate={handleNavigate}
            onViewProduct={handleViewProduct}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      {/* 1. High-Converting Urgency Discount Banner */}
      <ConversionBanner />

      {/* 2. Main Navigation Bar */}
      <Navbar
        onNavigate={handleNavigate}
        currentPage={currentPage}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* 3. Page Content Area with Smooth Framer Motion Route Transitions */}
      <main className="flex-1 pb-16 lg:pb-0 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={
              currentPage +
              (currentPage === "product-detail" && selectedProduct
                ? `-${selectedProduct.id}`
                : "")
            }
            initial={{ opacity: 0, y: 14, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(3px)" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* 5. Mobile Bottom Navigation */}
      <MobileNav currentPage={currentPage} onNavigate={handleNavigate} />

      {/* 6. Slide-Over Cart Drawer */}
      <CartDrawer
        onCheckout={() => handleNavigate("checkout")}
        onNavigateHome={() => handleNavigate("home")}
      />

      {/* 7. Live Instant Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={handleViewProduct}
      />

      {/* 8. Floating WhatsApp Support Button */}
      <WhatsAppFloating
        productName={selectedProduct?.name}
        orderNumber={confirmedOrder?.order_number}
      />

      {/* Add-to-cart confirmation */}
      <AddToCartToast onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
