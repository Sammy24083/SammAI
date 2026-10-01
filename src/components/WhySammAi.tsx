import React from "react";
import {
  ShieldCheck,
  Zap,
  MessageSquare,
  Award,
  ArrowUpRight,
} from "lucide-react";

export const WhySammAi: React.FC = () => {
  const pillars = [
    {
      icon: ShieldCheck,
      title: "PAY YOUR WAY",
      tagline: "OPay transfer is the default",
      description:
        "OPay transfer is selected by default at checkout. Other payment options may also be available; transfer orders are confirmed by our team before access is sent.",
    },
    {
      icon: Zap,
      title: "DIGITAL DELIVERY",
      tagline: "Sent after payment confirmation",
      description:
        "We send the invitation, code, or setup instructions using the contact details on your order. Timing depends on the product and payment confirmation.",
    },
    {
      icon: MessageSquare,
      title: "REAL PERSON, REAL HELP",
      tagline: "Contact us on WhatsApp",
      description:
        "Need help with an order or setup? Message our team on WhatsApp at 07036192301 and include your order number.",
    },
    {
      icon: Award,
      title: "PLAIN PRODUCT DETAILS",
      tagline: "Know what you are buying",
      description:
        "Each listing explains the advertised plan length, price, and delivery method. Contact us if anything is unclear before ordering.",
    },
  ];

  return (
    <section className="py-14 sm:py-20 border-t border-slate-850 relative bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold block mb-2">
            A simpler way to get started
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tools for work, study, and making things.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3">
            See the price before you pay, choose an available local payment
            option, and get help from our team if you need it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {pillar.title}
                  </h3>
                  <span className="text-xs text-emerald-400 font-medium block mt-0.5 mb-2.5">
                    {pillar.tagline}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
