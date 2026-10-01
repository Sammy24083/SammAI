import React, { useState, useMemo } from "react";
import { Product, Category } from "../types";
import { ProductCard } from "../components/ProductCard";
import { Search, Filter, SlidersHorizontal, Sparkles } from "lucide-react";
import {
  ProductsPageSkeleton,
  ProductCardSkeleton,
  CategoryPillSkeleton,
} from "../components/skeletons/MarketplaceSkeletons";

interface ProductsPageProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  isLoading?: boolean;
  onViewProduct: (slug: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  categories,
  initialCategory,
  isLoading = false,
  onViewProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">(
    "featured",
  );

  // Full page skeleton if data is loading and empty
  if (isLoading && products.length === 0) {
    return <ProductsPageSkeleton />;
  }

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category match
        if (selectedCategory !== "all") {
          const cat = categories.find((c) => c.slug === selectedCategory);
          if (cat && p.category_id !== cat.id) return false;
        }

        // Duration filter
        if (selectedDuration !== "all") {
          if (
            !p.subscription_duration
              .toLowerCase()
              .includes(selectedDuration.toLowerCase())
          ) {
            return false;
          }
        }

        // Search query
        if (searchQuery.trim()) {
          const text =
            `${p.name} ${p.short_description} ${p.category_name} ${p.features.join(" ")}`.toLowerCase();
          if (!text.includes(searchQuery.toLowerCase())) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.promo_price ?? a.price;
        const priceB = b.promo_price ?? b.price;
        if (sortBy === "price-asc") return priceA - priceB;
        if (sortBy === "price-desc") return priceB - priceA;
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [
    products,
    categories,
    selectedCategory,
    selectedDuration,
    searchQuery,
    sortBy,
  ]);

  const durations = [
    { label: "All Durations", value: "all" },
    { label: "1 Month", value: "1 Month" },
    { label: "3 Months", value: "3 Months" },
    { label: "1 Year / 12M", value: "Year" },
    { label: "18 Months", value: "18 Months" },
  ];

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Browse the catalogue</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Tools and subscriptions.
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
            Compare plan lengths, prices, and delivery methods. Access details
            are sent after payment has been confirmed.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tools by name, feature, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Duration Selector */}
            <div className="sm:col-span-3">
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                {durations.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting */}
            <div className="sm:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full py-2.5 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Tabs (Segmented Button Controls) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-emerald-500 text-black shadow-md"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.slug
                    ? "bg-emerald-500 text-black shadow-md"
                    : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-slate-900/40 border border-slate-800 p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">
              No matching products found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              We couldn&apos;t find any tool matching your filters. Try clearing
              your search or selecting another category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedDuration("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={onViewProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
