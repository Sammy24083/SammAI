import React from "react";
import { Star, CheckCircle, Quote } from "lucide-react";
import { Review } from "../types";

interface CustomerReviewsProps {
  reviews: Review[];
}

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({
  reviews,
}) => {
  const publishedReviews = reviews.filter((review) => review.is_published);
  if (publishedReviews.length === 0) return null;
  const averageRating =
    publishedReviews.reduce((total, review) => total + review.rating, 0) /
    publishedReviews.length;

  return (
    <section className="py-14 sm:py-20 border-t border-slate-850 bg-slate-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold block mb-1">
              CUSTOMER FEEDBACK
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              What customers are saying.
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="font-bold">{averageRating.toFixed(1)} / 5</span>
            <span className="text-slate-400">
              from {publishedReviews.length} review
              {publishedReviews.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {publishedReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                {/* Rating stars & verified badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  {rev.is_verified_purchase && (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Verified Order
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic mb-6">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Author footer */}
              <div className="pt-4 border-t border-slate-800/80">
                <h4 className="text-sm font-bold text-white">
                  {rev.customer_name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {rev.customer_role}
                </p>
                {rev.product_name && (
                  <p className="text-[11px] text-emerald-400/90 font-mono mt-1">
                    Purchased: {rev.product_name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
