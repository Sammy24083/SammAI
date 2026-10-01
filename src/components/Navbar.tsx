import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../contexts/CartContext";
import { useCurrency, CurrencyCode } from "../contexts/CurrencyContext";
import { useAuth } from "../contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Flame,
  Layers,
  HelpCircle,
  MessageCircle,
  ArrowRight,
  Bot,
  Palette,
  Briefcase,
  Code2,
} from "lucide-react";

interface NavbarProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  currentPage: string;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  currentPage,
  onOpenSearch,
}) => {
  const { totalItemCount, setIsCartOpen } = useCart();
  const { currency, setCurrency } = useCurrency();
  const { user, isAdmin } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(e.target as Node)
      ) {
        setCategoriesDropdownOpen(false);
      }
      if (
        currencyRef.current &&
        !currencyRef.current.contains(e.target as Node)
      ) {
        setCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (page: string, category?: string) => {
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
    if (category) {
      onNavigate(page, { category });
    } else {
      onNavigate(page);
    }
  };

  const currencies: {
    code: CurrencyCode;
    label: string;
    flag: string;
    symbol: string;
  }[] = [
    { code: "NGN", label: "Nigerian Naira", flag: "🇳🇬", symbol: "₦" },
    { code: "USD", label: "US Dollar", flag: "🇺🇸", symbol: "$" },
    { code: "GHS", label: "Ghanaian Cedi", flag: "🇬🇭", symbol: "₵" },
    { code: "KES", label: "Kenyan Shilling", flag: "🇰🇪", symbol: "KSh" },
  ];

  const categoryItems = [
    {
      id: "ai-tools",
      title: "AI Models & LLMs",
      desc: "ChatGPT, Gemini Pro, Claude 3.5, Grok & Perplexity",
      icon: Bot,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      id: "creative-tools",
      title: "Creative & Video AI",
      desc: "Design, image, and video subscriptions",
      icon: Palette,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      id: "productivity",
      title: "Productivity & Research",
      desc: "Notion AI, Grammarly Premium, Microsoft 365 Copilot",
      icon: Briefcase,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      id: "developer-tools",
      title: "Developer & Coding",
      desc: "Cursor AI, GitHub Copilot, Replit Core, Claude Code",
      icon: Code2,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl shadow-black/50"
            : "bg-slate-950/75 backdrop-blur-md border-b border-slate-800/40"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* BRAND LOGO */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavClick("home")}
              className="flex items-center gap-3 group text-left focus:outline-none"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <span className="font-display font-black text-white text-base tracking-tighter">
                      S<span className="text-emerald-400">A</span>
                    </span>
                  </div>
                </div>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                    SAMM <span className="text-emerald-400">AI</span>
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                    Africa
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium hidden xs:block">
                  Premium AI Marketplace
                </span>
              </div>
            </motion.button>

            {/* DESKTOP NAVIGATION BAR (Center & Organized) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {/* Home */}
              <button
                onClick={() => handleNavClick("home")}
                onMouseEnter={() => setHoveredNav("home")}
                onMouseLeave={() => setHoveredNav(null)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-colors ${
                  currentPage === "home"
                    ? "text-emerald-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <span>Home</span>
                {currentPage === "home" && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>

              {/* Explore Categories Dropdown */}
              <div ref={categoriesRef} className="relative">
                <button
                  onClick={() =>
                    setCategoriesDropdownOpen(!categoriesDropdownOpen)
                  }
                  onMouseEnter={() => setCategoriesDropdownOpen(true)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-colors ${
                    currentPage === "products"
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                      : "text-slate-300 hover:text-white hover:bg-slate-900/60"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Explore Tools</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      categoriesDropdownOpen
                        ? "rotate-180 text-emerald-400"
                        : "text-slate-400"
                    }`}
                  />
                </button>

                {/* Animated Mega Dropdown */}
                <AnimatePresence>
                  {categoriesDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      onMouseLeave={() => setCategoriesDropdownOpen(false)}
                      className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl shadow-black/40 p-3 z-50 backdrop-blur-2xl"
                    >
                      <div className="px-3 py-2 border-b border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          AI Tool Categories
                        </span>
                        <button
                          onClick={() => handleNavClick("products")}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                        >
                          View all tools
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="grid gap-1.5 pt-2">
                        {categoryItems.map((cat) => {
                          const Icon = cat.icon;
                          return (
                            <motion.button
                              key={cat.id}
                              whileHover={{ x: 4 }}
                              onClick={() => handleNavClick("products", cat.id)}
                              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-900/90 transition-all flex items-start gap-3 group"
                            >
                              <div
                                className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${cat.color}`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                                  <span>{cat.title}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                  {cat.desc}
                                </p>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-800/80 px-2 py-1 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/40 rounded-xl">
                        <span>⚡ Instant delivery via WhatsApp & Email</span>
                        <span className="text-emerald-400 font-semibold">
                          24/7 Verified
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Deals Link with Fire Badge */}
              <button
                onClick={() => handleNavClick("deals")}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 ${
                  currentPage === "deals"
                    ? "text-amber-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Deals</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-gradient-to-r from-amber-500 to-rose-500 text-black">
                  HOT
                </span>
                {currentPage === "deals" && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-amber-500/10 border border-amber-500/20 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>

              {/* FAQ */}
              <button
                onClick={() => handleNavClick("faq")}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-colors ${
                  currentPage === "faq"
                    ? "text-emerald-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <span>FAQ</span>
                {currentPage === "faq" && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>

              {/* WhatsApp Support Direct Link */}
              <a
                href="https://wa.me/2347036192301?text=Hello%20SAMM%20AI%20Support,%20I%20have%20an%20inquiry%20about%20an%20AI%20subscription"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Support</span>
              </a>
            </nav>

            {/* RIGHT SIDE ACTIONS & TOOLS */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Bar Trigger */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenSearch}
                aria-label="Search AI subscriptions"
                className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs transition-all shadow-inner group"
              >
                <Search className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline text-slate-400">
                  Search tools...
                </span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] bg-slate-800 text-slate-400 rounded border border-slate-700 font-mono">
                  ⌘K
                </kbd>
              </motion.button>

              {/* Currency Dropdown */}
              <div ref={currencyRef} className="relative">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-bold text-white transition-all"
                >
                  <span className="text-sm">
                    {currencies.find((c) => c.code === currency)?.flag}
                  </span>
                  <span className="font-mono">{currency}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </motion.button>

                <AnimatePresence>
                  {currencyDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-44 rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl py-1.5 z-50 overflow-hidden"
                    >
                      <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Select Currency
                      </div>
                      {currencies.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => {
                            setCurrency(c.code);
                            setCurrencyDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                            currency === c.code
                              ? "bg-emerald-500/10 text-emerald-400 font-bold"
                              : "text-slate-300 hover:bg-slate-850 hover:text-white"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{c.flag}</span>
                            <span>{c.code}</span>
                            <span className="text-slate-500 text-[11px]">
                              ({c.symbol})
                            </span>
                          </span>
                          {currency === c.code && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Toggle Button */}
              <ThemeToggle />

              {/* Account / Admin Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleNavClick(isAdmin ? "admin" : "account")}
                aria-label="User Account"
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isAdmin
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-slate-850"
                }`}
              >
                {isAdmin ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin</span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate max-w-[80px]">
                      {user ? user.full_name.split(" ")[0] : "Account"}
                    </span>
                  </>
                )}
              </motion.button>

              {/* Shopping Cart Drawer Trigger */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartOpen(true)}
                aria-label="Shopping Cart"
                className="relative p-2.5 sm:px-3 sm:py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition-all flex items-center gap-2 group shadow-sm shadow-emerald-500/10"
              >
                <ShoppingBag className="w-4 h-4 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline text-xs font-bold text-emerald-300">
                  Cart
                </span>
                <AnimatePresence>
                  {totalItemCount > 0 && (
                    <motion.span
                      key={totalItemCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="bg-emerald-400 text-black font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40"
                    >
                      {totalItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Mobile Hamburger Toggle Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
                className="lg:hidden p-2.5 rounded-xl bg-slate-900 border border-slate-850 text-slate-300 hover:text-white"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU FULL DRAWER (Framer Motion Animated) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden border-b border-slate-800 bg-slate-950/98 backdrop-blur-2xl overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                {/* Mobile Quick Search Input */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSearch();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 text-xs text-left"
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-emerald-400" />
                    <span>Search AI tools, ChatGPT, Gemini, etc...</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                    Search
                  </span>
                </button>

                {/* Primary Nav Links */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNavClick("home")}
                    className={`p-3 rounded-xl text-left border flex items-center gap-2.5 text-xs font-bold transition-all ${
                      currentPage === "home"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-slate-900/60 border-slate-800/80 text-slate-200"
                    }`}
                  >
                    <span>Home</span>
                  </button>

                  <button
                    onClick={() => handleNavClick("deals")}
                    className={`p-3 rounded-xl text-left border flex items-center justify-between text-xs font-bold transition-all ${
                      currentPage === "deals"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-slate-900/60 border-slate-800/80 text-slate-200"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-400" /> Deals
                    </span>
                    <span className="text-[9px] px-1 py-0.5 bg-amber-500 text-black font-black rounded">
                      HOT
                    </span>
                  </button>
                </div>

                {/* Category Tiles */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Browse Categories</span>
                    <button
                      onClick={() => handleNavClick("products")}
                      className="text-emerald-400 underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 pt-1">
                    {categoryItems.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleNavClick("products", cat.id)}
                          className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:bg-slate-900 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`p-1.5 rounded-lg border ${cat.color}`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">
                              {cat.title}
                            </span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Bottom Utility Shortcuts */}
                <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <ThemeToggle
                    showLabel
                    className="col-span-2 justify-center py-2.5 font-bold"
                  />

                  <button
                    onClick={() =>
                      handleNavClick(isAdmin ? "admin" : "account")
                    }
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold flex items-center justify-center gap-2"
                  >
                    {isAdmin ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-amber-400" /> Admin
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 text-slate-300" /> My Account
                      </>
                    )}
                  </button>

                  <a
                    href="https://wa.me/2347036192301?text=Hello%20SAMM%20AI%20Support"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp Help
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
