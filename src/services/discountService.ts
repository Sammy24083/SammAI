import { Discount, FAQ, SiteSettings, Review } from "../types";
import {
  isLiveSupabaseConfigured,
  localStore,
  supabase,
} from "../lib/supabase";
import { orderService } from "./orderService";

export const discountService = {
  async getActiveDiscounts(): Promise<Discount[]> {
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .eq("is_active", true);
      if (!error && data) return data as Discount[];
    }
    return localStore.getDiscounts().filter((d) => d.is_active);
  },

  async getAllDiscounts(): Promise<Discount[]> {
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) return data as Discount[];
    }
    return localStore.getDiscounts();
  },

  async validateCode(
    code: string,
    subtotal: number,
  ): Promise<{
    valid: boolean;
    discount?: Discount;
    discountAmount: number;
    message?: string;
  }> {
    const discounts = await this.getActiveDiscounts();
    const found = discounts.find(
      (d) => d.code.toUpperCase() === code.trim().toUpperCase() && d.is_active,
    );

    if (!found) {
      return {
        valid: false,
        discountAmount: 0,
        message: "Invalid or expired coupon code",
      };
    }

    const now = Date.now();
    if (
      (found.starts_at && new Date(found.starts_at).getTime() > now) ||
      (found.expires_at && new Date(found.expires_at).getTime() < now) ||
      found.used_count >= found.usage_limit
    ) {
      return {
        valid: false,
        discountAmount: 0,
        message: "This offer is not currently available",
      };
    }

    if (subtotal < found.minimum_order_amount) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Minimum order amount of ₦${found.minimum_order_amount.toLocaleString()} required for ${found.code}`,
      };
    }

    let discountAmount = 0;
    if (found.type === "percentage") {
      discountAmount = Math.round((subtotal * found.value) / 100);
      if (found.maximum_discount && discountAmount > found.maximum_discount) {
        discountAmount = found.maximum_discount;
      }
    } else {
      discountAmount = found.value;
    }

    return {
      valid: true,
      discount: found,
      discountAmount: Math.min(discountAmount, subtotal),
    };
  },

  async createDiscount(
    discount: Omit<Discount, "id" | "used_count">,
  ): Promise<Discount> {
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("discounts")
        .insert(discount)
        .select()
        .single();
      if (!error && data) {
        const current = localStore
          .getDiscounts()
          .filter((item) => item.code !== data.code);
        localStore.setDiscounts([...current, data as Discount]);
        return data as Discount;
      }
    }
    const newDiscount: Discount = {
      ...discount,
      id: "disc-" + Date.now(),
      used_count: 0,
    };
    const current = localStore.getDiscounts();
    localStore.setDiscounts([...current, newDiscount]);
    return newDiscount;
  },

  async deleteDiscount(id: string): Promise<boolean> {
    if (isLiveSupabaseConfigured && supabase) {
      const { error } = await supabase.from("discounts").delete().eq("id", id);
      if (!error) {
        localStore.setDiscounts(
          localStore.getDiscounts().filter((d) => d.id !== id),
        );
        return true;
      }
    }
    const current = localStore.getDiscounts();
    localStore.setDiscounts(current.filter((d) => d.id !== id));
    return true;
  },
};

export const adminService = {
  async getAnalytics() {
    const orders = await orderService.getOrders();
    const products = localStore.getProducts();

    const totalRevenue = orders
      .filter((o) => o.payment_status === "paid")
      .reduce((sum, o) => sum + o.total_amount, 0);

    const paidOrders = orders.filter((o) => o.payment_status === "paid");
    const pendingOrders = orders.filter(
      (o) => o.order_status === "pending" || o.order_status === "processing",
    );
    const fulfilledOrders = orders.filter(
      (o) => o.order_status === "fulfilled",
    );

    // Unique customers
    const uniqueEmails = new Set(orders.map((o) => o.customer_email));

    return {
      totalRevenue,
      totalOrdersCount: orders.length,
      paidOrdersCount: paidOrders.length,
      pendingOrdersCount: pendingOrders.length,
      fulfilledOrdersCount: fulfilledOrders.length,
      totalCustomersCount: uniqueEmails.size,
      averageOrderValue: paidOrders.length
        ? Math.round(totalRevenue / paidOrders.length)
        : 0,
      recentOrders: orders.slice(0, 8),
    };
  },

  async getFaqs(): Promise<FAQ[]> {
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!error && data && data.length > 0) return data as FAQ[];
    }
    return localStore.getFaqs();
  },

  async updateFaq(id: string, updates: Partial<FAQ>): Promise<FAQ> {
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("faqs")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();
      if (!error && data) {
        localStore.setFaqs([
          ...localStore.getFaqs().filter((faq) => faq.id !== id),
          data as FAQ,
        ]);
        return data as FAQ;
      }
    }
    const faqs = localStore.getFaqs();
    const idx = faqs.findIndex((f) => f.id === id);
    if (idx === -1) throw new Error("FAQ not found");
    faqs[idx] = {
      ...faqs[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    localStore.setFaqs([...faqs]);
    return faqs[idx];
  },

  async createFaq(
    faq: Omit<FAQ, "id" | "created_at" | "updated_at">,
  ): Promise<FAQ> {
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("faqs")
        .insert(faq)
        .select()
        .single();
      if (!error && data) {
        localStore.setFaqs([...localStore.getFaqs(), data as FAQ]);
        return data as FAQ;
      }
    }
    const newFaq: FAQ = {
      ...faq,
      id: "faq-" + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const faqs = localStore.getFaqs();
    localStore.setFaqs([...faqs, newFaq]);
    return newFaq;
  },

  async deleteFaq(id: string): Promise<boolean> {
    if (isLiveSupabaseConfigured && supabase) {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (!error) {
        localStore.setFaqs(localStore.getFaqs().filter((faq) => faq.id !== id));
        return true;
      }
    }
    const faqs = localStore.getFaqs();
    localStore.setFaqs(faqs.filter((f) => f.id !== id));
    return true;
  },

  async getSiteSettings(): Promise<SiteSettings> {
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (!error && data)
        return { ...localStore.getSiteSettings(), ...data } as SiteSettings;
    }
    return localStore.getSiteSettings();
  },

  async updateSiteSettings(
    settings: Partial<SiteSettings>,
  ): Promise<SiteSettings> {
    const current = localStore.getSiteSettings();
    const updated = { ...current, ...settings };
    if (isLiveSupabaseConfigured && supabase) {
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .limit(1)
        .maybeSingle();
      const result = existing
        ? await supabase
            .from("site_settings")
            .update(settings)
            .eq("id", existing.id)
        : await supabase.from("site_settings").insert(updated);
      if (result.error) {
        console.warn(
          "Supabase settings save failed; saved locally instead:",
          result.error,
        );
      }
    }
    localStore.setSiteSettings(updated);
    return updated;
  },
};
