import React, { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { Flame, Clock, Sparkles, Check, ArrowRight } from "lucide-react";

export const ConversionBanner: React.FC = () => {
  const { applyDiscountCode, appliedDiscount } = useCart();
  const [copied, setCopied] = useState(false);

  const handleApplyPromo = async () => {
    await applyDiscountCode("SAMM10");
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-950 border-b border-emerald-500/20 py-2 px-3 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-slate-300">
            <strong className="text-white">Current offer:</strong> Use{" "}
            <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              SAMM10
            </span>{" "}
            for 10% off eligible orders over ₦5,000.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleApplyPromo}
            disabled={appliedDiscount?.code === "SAMM10"}
            className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-black transition-all shadow-sm flex items-center gap-1 disabled:opacity-60"
          >
            {appliedDiscount?.code === "SAMM10" ? (
              <>
                <Check className="w-3 h-3" />
                <span>Coupon Applied</span>
              </>
            ) : copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>Applied!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                <span>Apply offer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
