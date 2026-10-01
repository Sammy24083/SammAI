import React from 'react';

/**
 * Reusable shimmer pulse bar
 */
export const ShimmerBar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-800/70 rounded-md animate-pulse ${className}`} />
);

/**
 * Skeleton for an individual Product Card
 * Matches exact aspect ratio, padding, and layout of ProductCard.tsx to avoid CLS (Cumulative Layout Shift)
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between overflow-hidden shadow-lg animate-pulse">
      {/* Top Banner Image Skeleton */}
      <div className="relative aspect-video w-full bg-slate-800/60 overflow-hidden">
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="w-16 h-4 rounded bg-slate-700/80" />
        </div>
        <div className="absolute top-3 right-3">
          <div className="w-14 h-4 rounded bg-slate-700/80" />
        </div>
        <div className="absolute bottom-2 left-3">
          <div className="w-24 h-3.5 rounded bg-slate-700/70" />
        </div>
      </div>

      {/* Card Content Skeleton */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between mb-3">
            <div className="w-20 h-3 rounded bg-emerald-500/20" />
            <div className="w-12 h-3 rounded bg-amber-500/20" />
          </div>

          {/* Title */}
          <div className="w-3/4 h-5 rounded bg-slate-750 mb-2" />

          {/* Description lines */}
          <div className="space-y-1.5 mt-2">
            <div className="w-full h-3 rounded bg-slate-800/70" />
            <div className="w-5/6 h-3 rounded bg-slate-800/70" />
          </div>
        </div>

        {/* Feature bullets skeleton */}
        <div className="space-y-1.5 py-1 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 shrink-0" />
            <div className="w-4/5 h-2.5 rounded bg-slate-800/60" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 shrink-0" />
            <div className="w-2/3 h-2.5 rounded bg-slate-800/60" />
          </div>
        </div>

        {/* Price & CTA Button Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div>
            <div className="w-12 h-2.5 rounded bg-slate-800 mb-1" />
            <div className="w-20 h-5 rounded bg-slate-700" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-800" />
            <div className="w-20 h-9 rounded-xl bg-emerald-500/30" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Category Pill Skeleton for Filter Bar
 */
export const CategoryPillSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-8 rounded-xl bg-slate-900 border border-slate-800/80 px-4 py-2 shrink-0"
          style={{ width: `${60 + (i % 3) * 24}px` }}
        />
      ))}
    </div>
  );
};

/**
 * Category Card Skeleton for Homepage
 */
export const CategoryCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-slate-800/80" />
      <div className="w-24 h-4 rounded bg-slate-750" />
      <div className="w-36 h-3 rounded bg-slate-800/70" />
    </div>
  );
};

/**
 * Right-side hero showcase card skeleton
 */
export const HeroMockCardSkeleton: React.FC = () => {
  return (
    <div className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-750/80 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 shrink-0" />
          <div className="space-y-1.5">
            <div className="w-28 h-3.5 rounded bg-slate-700" />
            <div className="w-36 h-2.5 rounded bg-slate-800" />
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="w-10 h-2.5 rounded bg-slate-800 ml-auto" />
          <div className="w-14 h-4 rounded bg-emerald-500/30 ml-auto" />
        </div>
      </div>
    </div>
  );
};

/**
 * Full Skeleton Screen for ProductsPage
 */
export const ProductsPageSkeleton: React.FC = () => {
  return (
    <div className="py-8 sm:py-12 animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="w-36 h-4 rounded bg-emerald-500/20 animate-pulse" />
          <div className="w-64 sm:w-96 h-10 rounded bg-slate-800 animate-pulse" />
          <div className="w-full max-w-xl h-4 rounded bg-slate-800/60 animate-pulse" />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-6 h-11 rounded-xl bg-slate-900 border border-slate-800 animate-pulse" />
            <div className="sm:col-span-3 h-11 rounded-xl bg-slate-900 border border-slate-800 animate-pulse" />
            <div className="sm:col-span-3 h-11 rounded-xl bg-slate-900 border border-slate-800 animate-pulse" />
          </div>

          {/* Category Tabs Skeleton */}
          <CategoryPillSkeleton count={7} />
        </div>

        {/* Product Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <ProductCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Full Skeleton Screen for HomePage
 */
export const HomePageSkeleton: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* 1. Hero Skeleton */}
      <section className="relative pt-6 pb-16 sm:pt-12 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left text column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="w-48 h-4 rounded bg-emerald-500/20 animate-pulse" />
              <div className="space-y-2">
                <div className="w-5/6 h-12 rounded bg-slate-800 animate-pulse" />
                <div className="w-2/3 h-12 rounded bg-slate-800 animate-pulse" />
              </div>
              <div className="space-y-2 max-w-xl">
                <div className="w-full h-4 rounded bg-slate-800/70 animate-pulse" />
                <div className="w-4/5 h-4 rounded bg-slate-800/70 animate-pulse" />
              </div>
              <div className="flex gap-4 pt-4">
                <div className="w-36 h-12 rounded-xl bg-emerald-500/40 animate-pulse" />
                <div className="w-36 h-12 rounded-xl bg-slate-800 animate-pulse" />
              </div>
            </div>

            {/* Right card column */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="w-24 h-3 rounded bg-slate-800 animate-pulse" />
                  <div className="w-20 h-3 rounded bg-emerald-500/20 animate-pulse" />
                </div>
                <HeroMockCardSkeleton />
                <HeroMockCardSkeleton />
                <HeroMockCardSkeleton />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Skeleton */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="w-32 h-3.5 rounded bg-emerald-500/20 animate-pulse" />
            <div className="w-56 h-8 rounded bg-slate-800 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* 3. Featured Products Grid Skeleton */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="w-28 h-3.5 rounded bg-emerald-500/20 animate-pulse" />
            <div className="w-64 h-8 rounded bg-slate-800 animate-pulse" />
          </div>
          <div className="w-24 h-6 rounded bg-slate-800 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
};
