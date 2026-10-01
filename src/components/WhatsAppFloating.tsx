import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

interface WhatsAppFloatingProps {
  productName?: string;
  orderNumber?: string;
}

export const WhatsAppFloating: React.FC<WhatsAppFloatingProps> = ({ productName, orderNumber }) => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '2347036192301'; // 07036192301 formatted with Nigeria country code

  const buildWhatsAppLink = (customText?: string) => {
    let message = 'Hello SAMM AI, I would like to inquire about your AI tool subscriptions.';

    if (orderNumber) {
      message = `Hello SAMM AI, I am following up on my Order #${orderNumber}. Please update me on delivery.`;
    } else if (productName) {
      message = `Hello SAMM AI, I am interested in purchasing ${productName}. Can you assist me?`;
    } else if (customText) {
      message = customText;
    }

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const quickPrompts = [
    { label: 'Gemini AI Pro 18M Promo', text: 'Hello SAMM AI, I want to get the Google Gemini Pro 18-month plan.' },
    { label: 'Canva Pro Setup Question', text: 'Hello SAMM AI, is Canva Pro added directly to my personal email?' },
    { label: 'Track Order / Delivery', text: 'Hello SAMM AI, I just made a payment and want to track delivery.' },
    { label: 'Custom Business / Team Plan', text: 'Hello SAMM AI, we need team subscriptions for our agency / developers.' },
  ];

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-5 z-40">
      {/* Expanded Quick Chat Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-4 backdrop-blur-xl animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">SAMM AI WhatsApp Support</h4>
                <p className="text-[11px] text-emerald-400 font-medium">Online · Typical reply in 3 mins</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Body */}
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            Need instant help with an order, payment, or tool invitation? Chat directly with our Nigerian support engineers.
          </p>

          {/* Quick Prompt Buttons */}
          <div className="space-y-1.5 mb-3">
            {quickPrompts.map((item, idx) => (
              <a
                key={idx}
                href={buildWhatsAppLink(item.text)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-left p-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-between group transition-colors"
              >
                <span>{item.label}</span>
                <Send className="w-3 h-3 text-emerald-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </a>
            ))}
          </div>

          {/* Main Direct WhatsApp Button */}
          <a
            href={buildWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp (07036192301)</span>
          </a>
        </div>
      )}

      {/* Floating Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chat with SAMM AI on WhatsApp"
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm tracking-wide shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all group"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline">Chat with SAMM AI</span>
        <span className="sm:hidden">WhatsApp</span>
      </button>
    </div>
  );
};
