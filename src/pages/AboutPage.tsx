import React from "react";
import {
  Sparkles,
  Globe,
  ShieldCheck,
  Heart,
  Users,
  MessageCircle,
} from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Eyebrow & Headline */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-emerald-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>ABOUT SAMM AI</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Digital subscriptions, made easier to find.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We help people find subscriptions for work, study, and creative
            projects, with local payment options and support when questions come
            up.
          </p>
        </div>

        {/* Narrative Section */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 text-sm text-slate-300 leading-relaxed shadow-xl">
          <h2 className="text-xl font-bold text-white tracking-tight">
            The African AI Access Barrier
          </h2>
          <p>
            Finding the right subscription can take time, and paying for
            international services is not always straightforward. SAMM AI brings
            a range of digital tools together so you can compare plan lengths,
            prices, and delivery methods in one place.
          </p>
          <p>
            We list the access method for each product and offer OPay transfer
            at checkout, with other options shown when available. Transfer
            orders are reviewed before access is sent.
          </p>
          <p>
            Once payment is confirmed, we send the setup details using the
            contact information on your order. If you need help, message us on
            WhatsApp and include your order number.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <Globe className="w-6 h-6 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Clear prices</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prices and plan lengths are shown on each product page before
              checkout.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Help when you need it
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Contact us if an invitation, code, or setup step does not work as
              expected.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <Users className="w-6 h-6 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Message our team</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Message our team on WhatsApp at 07036192301 and include your order
              number.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Need help choosing?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Ask us about a product or its delivery method before you place an
            order.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <a
              href="https://wa.me/2347036192301?text=Hello%20SAMM%20AI%20Team"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Message our team</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
