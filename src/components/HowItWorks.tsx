import React from "react";
import { ShoppingCart, CreditCard, KeyRound } from "lucide-react";

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: "01",
      title: "Choose a product",
      description:
        "Compare the plan details and subscription length on the product page before adding it to your cart.",
      icon: ShoppingCart,
    },
    {
      step: "02",
      title: "Pay securely",
      description:
        "Choose OPay transfer or another available checkout option. Orders paid by transfer stay pending until we confirm the funds.",
      icon: CreditCard,
    },
    {
      step: "03",
      title: "Receive your access",
      description:
        "After payment is confirmed, we send the access details and setup instructions to the email or WhatsApp number on your order.",
      icon: KeyRound,
    },
  ];

  return (
    <section className="py-14 sm:py-20 border-t border-slate-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold block mb-2">
            WHAT TO EXPECT
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            From checkout to access.
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Check the listing for the plan length and delivery method that apply
            to your purchase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative p-6 sm:p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-display font-black text-3xl text-emerald-400/30">
                      {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-emerald-400">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {item.description}
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
