import React from "react";
import { MessageCircle, Mail, ShieldCheck } from "lucide-react";

interface FooterProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-850 pt-16 pb-24 lg:pb-12 text-slate-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-display font-extrabold text-emerald-400 text-sm">
                SA
              </div>
              <span className="font-display font-black text-xl text-white tracking-tight">
                SAMM <span className="text-emerald-400">AI</span>
              </span>
            </div>

            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              Premium AI. Smarter Access.
            </p>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              A straightforward place to find digital subscriptions and tools,
              with local payment options and help from our team when you need
              it.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/2347036192301?text=Hello%20SAMM%20AI%20Support"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 text-xs flex items-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>07036192301</span>
              </a>

              <a
                href="mailto:amaechisamuelugo@gmail.com"
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 text-xs flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>amaechisamuelugo@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Column 1: Marketplace Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate("home")}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    onNavigate("products", { category: "ai-tools" })
                  }
                  className="hover:text-emerald-400 transition-colors"
                >
                  AI Tools
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    onNavigate("products", { category: "creative-tools" })
                  }
                  className="hover:text-emerald-400 transition-colors"
                >
                  Creative Tools
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    onNavigate("products", { category: "productivity" })
                  }
                  className="hover:text-emerald-400 transition-colors"
                >
                  Productivity
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    onNavigate("products", { category: "developer-tools" })
                  }
                  className="hover:text-emerald-400 transition-colors"
                >
                  Developer Tools
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("deals")}
                  className="hover:text-emerald-400 transition-colors text-amber-400 font-semibold"
                >
                  🔥 Special Deals
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Company & Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate("about")}
                  className="hover:text-emerald-400 transition-colors"
                >
                  About SAMM AI
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("faq")}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("account")}
                  className="hover:text-emerald-400 transition-colors"
                >
                  My Account / Subscriptions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("admin")}
                  className="hover:text-amber-400 transition-colors text-slate-400"
                >
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Legal &amp; Trust
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Payment options at checkout</span>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("policies", { section: "terms" })}
                  className="hover:text-emerald-400"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("policies", { section: "privacy" })}
                  className="hover:text-emerald-400"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    onNavigate("policies", { section: "delivery" })
                  }
                  className="hover:text-emerald-400"
                >
                  Digital Delivery &amp; Access Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("policies", { section: "refunds" })}
                  className="hover:text-emerald-400"
                >
                  Refund &amp; Replacement Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom divider and copyright */}
        <div className="pt-8 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 SAMM AI. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Instagram: @samm_ai</span>
            <span>·</span>
            <span>X / Twitter: @samm_ai</span>
            <span>·</span>
            <span>WhatsApp: 07036192301</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
