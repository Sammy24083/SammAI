import { createClient } from "@supabase/supabase-js";
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_DISCOUNTS,
  INITIAL_FAQS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
  INITIAL_DELIVERY_RECORDS,
} from "./initialData";
import {
  Product,
  Category,
  Order,
  Discount,
  FAQ,
  SiteSettings,
  Review,
  DeliveryRecord,
  Payment,
} from "../types";

const DEFAULT_SUPABASE_URL = "https://ftagxjvtwhuorbcyjksm.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0YWd4anZ0d2h1b3JiY3lqa3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MDAwNzksImV4cCI6MjEwNjM3NjA3OX0.nY2W_DMlW3mrZNsXUVgrceJXqh7DPpYn2tMRHEHbbQQ";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL &&
  !import.meta.env.VITE_SUPABASE_URL.includes("your-project")
    ? import.meta.env.VITE_SUPABASE_URL
    : DEFAULT_SUPABASE_URL;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isLiveSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("https://"),
);

export const supabase = isLiveSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const REALTIME_TABLES = [
  "products",
  "categories",
  "product_features",
  "orders",
  "order_items",
  "delivery_records",
  "discounts",
  "faqs",
  "site_settings",
  "audit_logs",
];

export function subscribeToDatabaseChanges(): () => void {
  if (!supabase) return () => undefined;

  let channel = supabase.channel("samm-store-database-updates");
  REALTIME_TABLES.forEach((table) => {
    channel = channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table },
      () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("samm-store-update", { detail: { table } }),
          );
        }
      },
    );
  });

  channel.subscribe();
  return () => {
    void supabase?.removeChannel(channel);
  };
}

// ====================================================================
// Reactive Local Persistence Engine (Guarantees 100% Functionality)
// ====================================================================
const STORAGE_PREFIX = "samm_ai_";

function getStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
    // Dispatch custom event for cross-component realtime sync
    window.dispatchEvent(
      new CustomEvent("samm-store-update", { detail: { key } }),
    );
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

class ReactiveStore {
  getProducts(): Product[] {
    const list = getStorage<Product[]>("products", INITIAL_PRODUCTS);
    let updated = false;

    // Refresh the bundled copy once without replacing prices or other admin-managed fields.
    const copyVersionKey = STORAGE_PREFIX + "copy_version";
    if (localStorage.getItem(copyVersionKey) !== "2026-10-01") {
      INITIAL_PRODUCTS.forEach((initialProduct) => {
        const existing = list.find(
          (product) =>
            product.id === initialProduct.id ||
            product.slug === initialProduct.slug,
        );
        if (!existing) return;
        existing.name = initialProduct.name;
        existing.short_description = initialProduct.short_description;
        existing.description = initialProduct.description;
        existing.features = initialProduct.features;
        updated = true;
      });
      localStorage.setItem(copyVersionKey, "2026-10-01");
    }

    // 3. Ensure CapCut Pro monthly and yearly exist
    const capcutMonthly = list.find(
      (p) =>
        p.id === "prod-capcut-pro-monthly" || p.slug === "capcut-pro-monthly",
    );
    const initCapcutMonthly = INITIAL_PRODUCTS.find(
      (p) => p.id === "prod-capcut-pro-monthly",
    );
    if (!capcutMonthly && initCapcutMonthly) {
      list.push(initCapcutMonthly);
      updated = true;
    }

    const capcutYearly = list.find(
      (p) =>
        p.id === "prod-capcut-pro-yearly" || p.slug === "capcut-pro-yearly",
    );
    const initCapcutYearly = INITIAL_PRODUCTS.find(
      (p) => p.id === "prod-capcut-pro-yearly",
    );
    if (!capcutYearly && initCapcutYearly) {
      list.push(initCapcutYearly);
      updated = true;
    }

    const runwayPro = list.find(
      (product) =>
        product.id === "prod-runway-pro" || product.slug === "runway-pro",
    );
    const initialRunwayPro = INITIAL_PRODUCTS.find(
      (product) => product.id === "prod-runway-pro",
    );
    if (!runwayPro && initialRunwayPro) {
      list.push(initialRunwayPro);
      updated = true;
    }

    if (updated) {
      setStorage("products", list);
    }

    return list;
  }

  setProducts(products: Product[]): void {
    setStorage("products", products);
  }

  getCategories(): Category[] {
    return getStorage<Category[]>("categories", INITIAL_CATEGORIES);
  }

  setCategories(categories: Category[]): void {
    setStorage("categories", categories);
  }

  getOrders(): Order[] {
    const list = getStorage<Order[]>("orders", []);
    const clean = list.filter((o) => {
      const isMock =
        o.id === "ord-1001" ||
        o.id === "ord-1002" ||
        o.id === "ord-1003" ||
        o.customer_email === "fatima.bello@example.com";
      return !isMock;
    });
    if (clean.length !== list.length) {
      setStorage("orders", clean);
    }
    return clean;
  }

  setOrders(orders: Order[]): void {
    const clean = orders.filter((o) => {
      const isMock =
        o.id === "ord-1001" ||
        o.id === "ord-1002" ||
        o.id === "ord-1003" ||
        o.customer_email === "fatima.bello@example.com";
      return !isMock;
    });
    setStorage("orders", clean);
  }

  getDeliveryRecords(): DeliveryRecord[] {
    const list = getStorage<DeliveryRecord[]>("delivery_records", []);
    const clean = list.filter(
      (d) =>
        d.id !== "del-1" &&
        d.id !== "del-2" &&
        d.order_number !== "SAMM-2026-000124" &&
        d.order_number !== "SAMM-2026-000126",
    );
    if (clean.length !== list.length) {
      setStorage("delivery_records", clean);
    }
    return clean;
  }

  setDeliveryRecords(records: DeliveryRecord[]): void {
    const clean = records.filter((d) => d.id !== "del-1" && d.id !== "del-2");
    setStorage("delivery_records", clean);
  }

  getDiscounts(): Discount[] {
    return getStorage<Discount[]>("discounts", INITIAL_DISCOUNTS);
  }

  setDiscounts(discounts: Discount[]): void {
    setStorage("discounts", discounts);
  }

  getFaqs(): FAQ[] {
    const faqs = getStorage<FAQ[]>("faqs", INITIAL_FAQS);
    const copyVersionKey = STORAGE_PREFIX + "faq_copy_version";
    if (localStorage.getItem(copyVersionKey) !== "2026-10-01") {
      const migratedFaqs = faqs.map((faq) => {
        const updatedCopy = INITIAL_FAQS.find(
          (initialFaq) => initialFaq.id === faq.id,
        );
        return updatedCopy
          ? {
              ...faq,
              question: updatedCopy.question,
              answer: updatedCopy.answer,
            }
          : faq;
      });
      setStorage("faqs", migratedFaqs);
      localStorage.setItem(copyVersionKey, "2026-10-01");
      return migratedFaqs;
    }
    return faqs;
  }

  setFaqs(faqs: FAQ[]): void {
    setStorage("faqs", faqs);
  }

  getReviews(): Review[] {
    const reviews = getStorage<Review[]>("reviews", INITIAL_REVIEWS);
    const seededReviewIds = new Set(["rev-1", "rev-2", "rev-3", "rev-4"]);
    const realReviews = reviews.filter(
      (review) => !seededReviewIds.has(review.id),
    );
    if (realReviews.length !== reviews.length) {
      setStorage("reviews", realReviews);
    }
    return realReviews;
  }

  setReviews(reviews: Review[]): void {
    setStorage("reviews", reviews);
  }

  getSiteSettings(): SiteSettings {
    const stored = getStorage<SiteSettings>("settings", INITIAL_SETTINGS);
    let updated = false;
    if (stored.support_email !== "amaechisamuelugo@gmail.com") {
      stored.support_email = "amaechisamuelugo@gmail.com";
      updated = true;
    }
    if (
      !stored.paystack_public_key ||
      stored.paystack_public_key.includes("sample")
    ) {
      stored.paystack_public_key = INITIAL_SETTINGS.paystack_public_key;
      updated = true;
    }
    if (updated) {
      setStorage("settings", stored);
    }
    return stored;
  }

  setSiteSettings(settings: SiteSettings): void {
    setStorage("settings", settings);
  }

  getAuditLogs(): any[] {
    return getStorage<any[]>("audit_logs", [
      {
        id: "init-audit-1",
        action: "status_change",
        entity: "settings",
        details: "Audit logging engine initialized",
        performed_by: "SAMM AI System",
        status: "success",
        synced_to_supabase: true,
        created_at: new Date().toISOString(),
      },
    ]);
  }

  setAuditLogs(logs: any[]): void {
    setStorage("audit_logs", logs);
  }

  resetToDefaults(): void {
    localStorage.removeItem(STORAGE_PREFIX + "products");
    localStorage.removeItem(STORAGE_PREFIX + "categories");
    localStorage.removeItem(STORAGE_PREFIX + "orders");
    localStorage.removeItem(STORAGE_PREFIX + "delivery_records");
    localStorage.removeItem(STORAGE_PREFIX + "discounts");
    localStorage.removeItem(STORAGE_PREFIX + "faqs");
    localStorage.removeItem(STORAGE_PREFIX + "reviews");
    localStorage.removeItem(STORAGE_PREFIX + "settings");
    window.dispatchEvent(
      new CustomEvent("samm-store-update", { detail: { key: "all" } }),
    );
  }
}

export const localStore = new ReactiveStore();
