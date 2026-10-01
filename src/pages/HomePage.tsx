import React from "react";
import { Hero } from "../components/Hero";
import { CategorySection } from "../components/CategorySection";
import { FeaturedProducts } from "../components/FeaturedProducts";
import { WhySammAi } from "../components/WhySammAi";
import { HowItWorks } from "../components/HowItWorks";
import { CustomerReviews } from "../components/CustomerReviews";
import { FaqSection } from "../components/FaqSection";
import { Product, Category, FAQ, Review } from "../types";
import { Flame, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useCurrency } from "../contexts/CurrencyContext";
import { HomePageSkeleton } from "../components/skeletons/MarketplaceSkeletons";

interface HomePageProps {
  products: Product[];
  categories: Category[];
  faqs: FAQ[];
  reviews: Review[];
  isLoading?: boolean;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onViewProduct: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  faqs,
  reviews,
  isLoading = false,
  onNavigate,
  onViewProduct,
}) => {
  const { formatPrice } = useCurrency();

  // If loading and data not yet ready, show skeleton
  if (isLoading && products.length === 0 && categories.length === 0) {
    return <HomePageSkeleton />;
  }

  const geminiProd = products.find((p) => p.slug === "google-gemini-ai-pro");
  const geminiPriceLabel = geminiProd
    ? formatPrice(geminiProd.promo_price ?? geminiProd.price)
    : "₦15,000";

  return (
    <div className="space-y-4">
      {/* 1. Hero Section with Live Dynamic Products and Prices */}
      <Hero
        products={products}
        onShopClick={() => onNavigate("products")}
        onDealsClick={() => onNavigate("deals")}
        onProductClick={onViewProduct}
      />

      {/* 2. Shop By Category */}
      <CategorySection
        categories={categories}
        onSelectCategory={(slug) => onNavigate("products", { category: slug })}
      />

      {/* 3. Popular Products ("Popular right now.") */}
      <FeaturedProducts
        products={products}
        onViewDetails={onViewProduct}
        onViewAll={() => onNavigate("products")}
      />

      {/* 4. Limited Time Deals Banner */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/30 p-8 sm:p-12 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
                <Flame className="w-4 h-4 fill-amber-400" />
                <span>OFFERS ON SELECTED PLANS</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Find a plan that fits your work and budget.
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                Check current prices in the catalogue. We will confirm your
                order before sending access details.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate("deals")}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <span>View current offers</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onViewProduct("google-gemini-ai-pro")}
                  className="px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-750 text-xs font-semibold transition-all"
                >
                  Gemini plan · {geminiPriceLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Why SAMM AI */}
      <WhySammAi />

      {/* 6. How It Works */}
      <HowItWorks />

      {/* 7. Customer Reviews */}
      <CustomerReviews reviews={reviews} />

      {/* 8. FAQ Section */}
      <FaqSection faqs={faqs} />
    </div>
  );
};
