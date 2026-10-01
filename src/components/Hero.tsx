import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  Zap,
  MessageCircle,
  Flame,
} from "lucide-react";
import { useCurrency } from "../contexts/CurrencyContext";
import { Product } from "../types";

interface HeroProps {
  products?: Product[];
  onShopClick: () => void;
  onDealsClick: () => void;
  onProductClick: (slug: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  products = [],
  onShopClick,
  onDealsClick,
  onProductClick,
}) => {
  const { formatPrice } = useCurrency();

  // Find products dynamically from catalog so changes always reflect immediately
  const gemini = products.find((p) => p.slug === "google-gemini-ai-pro");
  const chatgpt = products.find((p) => p.slug === "chatgpt-plus");
  const canva = products.find((p) => p.slug === "canva-pro");

  const geminiPrice = gemini?.price ?? 20000;
  const geminiPromo = gemini?.promo_price ?? 15000;

  const chatgptPrice = chatgpt?.price ?? 15000;
  const chatgptPromo = chatgpt?.promo_price;

  const canvaPrice = canva?.price ?? 8000;
  const canvaPromo = canva?.promo_price ?? 5000;

  return (
    <section className="relative pt-6 pb-16 sm:pt-12 sm:pb-24 overflow-hidden">
      {/* Ambient background glow gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-[400px] h-[300px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Eyebrow with zero-pill unboxed discipline */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI AND DIGITAL TOOLS, WITH LOCAL SUPPORT</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
              Useful tools for
              <br />
              <span className="text-gradient-emerald">the work you do.</span>
            </h1>

            {/* Alternative supporting line */}
            <p className="text-lg sm:text-xl font-medium text-slate-200 leading-snug">
              Find the subscriptions you need for work, study, and creative
              projects.
            </p>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
              Browse the catalogue, check what each plan includes, and choose
              how you would like to pay. We send setup details by email or
              WhatsApp after payment is confirmed.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onShopClick}
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 flex items-center gap-2 active:translate-y-0"
              >
                <span>Browse tools</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={onDealsClick}
                className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-700 font-semibold text-sm tracking-wide transition-all hover:-translate-y-0.5 flex items-center gap-2 active:translate-y-0"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>See current offers</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Digital delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WhatsApp support</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>OPay available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Prices shown upfront</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Showcase: Futuristic SaaS & AI Subscription Hub */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative card frame */}
              <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Header in Mock UI */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="text-[11px] font-mono text-slate-400 ml-2">
                      SAMM AI · Digital tools
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Order support available
                  </span>
                </div>

                {/* Hero Showcase Products Cards */}
                <div className="space-y-3">
                  {/* Card 1: Google Gemini Pro */}
                  <div
                    onClick={() =>
                      onProductClick(gemini?.slug || "google-gemini-ai-pro")
                    }
                    className="p-3.5 rounded-xl bg-slate-850/80 hover:bg-slate-800/90 border border-slate-750 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-display font-bold text-emerald-400">
                          G
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {gemini?.name || "GOOGLE GEMINI AI PRO"}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {gemini?.subscription_duration
                              ? `${gemini.subscription_duration} Access`
                              : "18 Months Access"}{" "}
                            · 2M Context
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {geminiPrice > geminiPromo && (
                          <div className="text-xs line-through text-slate-400">
                            {formatPrice(geminiPrice)}
                          </div>
                        )}
                        <div className="text-sm font-extrabold text-emerald-400">
                          {formatPrice(geminiPromo)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: ChatGPT Plus */}
                  <div
                    onClick={() =>
                      onProductClick(chatgpt?.slug || "chatgpt-plus")
                    }
                    className="p-3.5 rounded-xl bg-slate-850/80 hover:bg-slate-800/90 border border-slate-750 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center font-display font-bold text-teal-400">
                          C
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {chatgpt?.name || "CHATGPT PLUS (PERSONAL)"}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {chatgpt?.subscription_duration
                              ? `${chatgpt.subscription_duration}`
                              : "1 Month"}{" "}
                            · Canvas &amp; o1 Logic
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {chatgptPromo && chatgptPrice > chatgptPromo && (
                          <div className="text-xs line-through text-slate-400">
                            {formatPrice(chatgptPrice)}
                          </div>
                        )}
                        <div className="text-sm font-extrabold text-emerald-400">
                          {formatPrice(chatgptPromo ?? chatgptPrice)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Canva Pro */}
                  <div
                    onClick={() => onProductClick(canva?.slug || "canva-pro")}
                    className="p-3.5 rounded-xl bg-slate-850/80 hover:bg-slate-800/90 border border-slate-750 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-display font-bold text-cyan-400">
                          🎨
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {canva?.name || "CANVA PRO"}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {canva?.subscription_duration
                              ? `${canva.subscription_duration}`
                              : "1 Full Year"}{" "}
                            · Personal Email Invite
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {canvaPrice > canvaPromo && (
                          <div className="text-xs line-through text-slate-400">
                            {formatPrice(canvaPrice)}
                          </div>
                        )}
                        <div className="text-sm font-extrabold text-emerald-400">
                          {formatPrice(canvaPromo)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Micro-Badge */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" /> Paystack
                    Secured
                  </span>
                  <span className="text-slate-300">WhatsApp: 07036192301</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
