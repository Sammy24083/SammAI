import { Product } from '../types';
import { supabase, isLiveSupabaseConfigured, localStore } from '../lib/supabase';
import { auditService } from './auditService';

export const DEFAULT_BADGES_BY_SLUG: Record<string, { is_trending?: boolean; is_best_seller?: boolean; is_new?: boolean }> = {
  'google-gemini-ai-pro': { is_best_seller: true, is_trending: true },
  'chatgpt-plus': { is_best_seller: true, is_trending: true },
  'capcut-pro-monthly': { is_new: true, is_trending: true },
  'capcut-pro-yearly': { is_new: true },
  'canva-pro': { is_best_seller: true },
  'x-premium': { is_trending: true },
  'super-grok': { is_trending: true },
  'claude-pro': { is_best_seller: true },
  'cursor-ai-pro': { is_trending: true },
  'perplexity-pro': { is_trending: true },
  'runway-pro': { is_new: true, is_trending: true, is_best_seller: true },
};

function getLocalCustomBadges(): Record<string, { is_trending?: boolean; is_best_seller?: boolean; is_new?: boolean }> {
  try {
    const saved = localStorage.getItem('samm_product_badges');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function saveLocalProductBadges(productIdOrSlug: string, badges: { is_trending?: boolean; is_best_seller?: boolean; is_new?: boolean }) {
  try {
    const existing = getLocalCustomBadges();
    existing[productIdOrSlug] = {
      ...(existing[productIdOrSlug] || {}),
      ...badges,
    };
    localStorage.setItem('samm_product_badges', JSON.stringify(existing));
  } catch {}
}

export function getLocalProductOverrides(): Record<string, Partial<Product>> {
  try {
    const saved = localStorage.getItem('samm_product_overrides');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function saveLocalProductOverride(productIdOrSlug: string, updates: Partial<Product>) {
  try {
    const existing = getLocalProductOverrides();
    existing[productIdOrSlug] = {
      ...(existing[productIdOrSlug] || {}),
      ...updates,
    };
    localStorage.setItem('samm_product_overrides', JSON.stringify(existing));
  } catch {}
}

export function enrichProductWithBadges(item: any): Product {
  const customBadges = getLocalCustomBadges();
  const overrides = getLocalProductOverrides();
  const slugBadges = DEFAULT_BADGES_BY_SLUG[item.slug] || {};
  const idBadges = customBadges[item.id] || customBadges[item.slug] || {};
  const override = overrides[item.id] || overrides[item.slug] || {};

  const stock_status = override.stock_status || item.stock_status || 'in_stock';
  const price = typeof override.price === 'number' ? override.price : item.price;
  const promo_price = override.promo_price !== undefined ? override.promo_price : item.promo_price;

  return {
    ...item,
    ...override,
    price,
    promo_price,
    stock_status,
    is_trending: typeof override.is_trending === 'boolean'
      ? override.is_trending
      : (typeof item.is_trending === 'boolean' ? item.is_trending : Boolean(idBadges.is_trending ?? slugBadges.is_trending)),
    is_best_seller: typeof override.is_best_seller === 'boolean'
      ? override.is_best_seller
      : (typeof item.is_best_seller === 'boolean' ? item.is_best_seller : Boolean(idBadges.is_best_seller ?? slugBadges.is_best_seller)),
    is_new: typeof override.is_new === 'boolean'
      ? override.is_new
      : (typeof item.is_new === 'boolean' ? item.is_new : Boolean(idBadges.is_new ?? slugBadges.is_new)),
    category_name: item.categories?.name || item.category_name,
    features: item.product_features?.map((f: any) => f.feature) || item.features || [],
  };
}

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    let prods: Product[] = [];
    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name), product_features(feature)')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          prods = data;
        }
      } catch (err) {
        console.warn('Supabase fetch failed or table not ready, using localStore:', err);
      }
    }

    if (prods.length === 0) {
      prods = localStore.getProducts().filter((p) => p.is_active);
    } else {
      // Merge with localStore so newly created local products aren't omitted
      const local = localStore.getProducts().filter((p) => p.is_active);
      const map = new Map<string, Product>();
      local.forEach((p) => map.set(p.slug || p.id, p));
      prods.forEach((p) => map.set(p.slug || p.id, { ...(map.get(p.slug || p.id) || {}), ...p }));
      prods = Array.from(map.values());
    }

    return prods.map(enrichProductWithBadges);
  },

  async getAllProductsAdmin(): Promise<Product[]> {
    let prods: Product[] = [];
    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name), product_features(feature)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          prods = data;
        }
      } catch (err) {
        console.warn('Supabase fetch admin failed, using localStore:', err);
      }
    }

    if (prods.length === 0) {
      prods = localStore.getProducts();
    } else {
      const local = localStore.getProducts();
      const map = new Map<string, Product>();
      local.forEach((p) => map.set(p.slug || p.id, p));
      prods.forEach((p) => map.set(p.slug || p.id, { ...(map.get(p.slug || p.id) || {}), ...p }));
      prods = Array.from(map.values());
    }

    return prods.map(enrichProductWithBadges);
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name), product_features(feature)')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        return enrichProductWithBadges(data);
      }
    }
    const products = localStore.getProducts();
    const found = products.find((p) => p.slug === slug || p.id === slug);
    return found ? enrichProductWithBadges(found) : null;
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const newId = 'prod-' + Date.now();
    const newProduct: Product = {
      ...product,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (product.is_trending !== undefined || product.is_best_seller !== undefined || product.is_new !== undefined) {
      saveLocalProductBadges(newId, {
        is_trending: product.is_trending,
        is_best_seller: product.is_best_seller,
        is_new: product.is_new,
      });
      saveLocalProductBadges(newProduct.slug, {
        is_trending: product.is_trending,
        is_best_seller: product.is_best_seller,
        is_new: product.is_new,
      });
    }

    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: newProduct.name,
          slug: newProduct.slug,
          short_description: newProduct.short_description,
          description: newProduct.description,
          category_id: newProduct.category_id,
          price: newProduct.price,
          promo_price: newProduct.promo_price,
          currency: newProduct.currency,
          subscription_duration: newProduct.subscription_duration,
          stock_status: newProduct.stock_status,
          stock_quantity: newProduct.stock_quantity,
          is_featured: newProduct.is_featured,
          is_on_sale: newProduct.is_on_sale,
          is_active: newProduct.is_active,
          image_url: newProduct.image_url,
          delivery_method: newProduct.delivery_method,
        })
        .select()
        .single();

      if (!error && data) {
        await auditService.logAction({
          action: 'create',
          entity: 'product',
          entity_id: data.id,
          details: `Created product "${newProduct.name}" (${newProduct.subscription_duration}) in Supabase`,
          status: 'success',
          metadata: { name: newProduct.name, price: newProduct.price, promo_price: newProduct.promo_price }
        });
        const current = localStore.getProducts();
        localStore.setProducts([data, ...current.filter((p) => p.id !== data.id)]);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('samm-store-update', { detail: { entity: 'products' } }));
        }
        return enrichProductWithBadges(data);
      } else if (error) {
        await auditService.logAction({
          action: 'create',
          entity: 'product',
          details: `Failed to insert product "${newProduct.name}" into Supabase: ${error.message}`,
          status: 'failed',
          metadata: { error: error.message }
        });
      }
    }

    const current = localStore.getProducts();
    const updated = [newProduct, ...current];
    localStore.setProducts(updated);

    await auditService.logAction({
      action: 'create',
      entity: 'product',
      entity_id: newProduct.id,
      details: `Created product "${newProduct.name}" in local catalog`,
      status: 'success',
      metadata: { name: newProduct.name, price: newProduct.price }
    });

    return enrichProductWithBadges(newProduct);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { is_trending, is_best_seller, is_new, features, ...dbUpdates } = updates as any;

    // 1. Always save persistent overrides by ID and find slug to also save by slug
    saveLocalProductOverride(id, updates);
    if (is_trending !== undefined || is_best_seller !== undefined || is_new !== undefined) {
      saveLocalProductBadges(id, { is_trending, is_best_seller, is_new });
    }

    const current = localStore.getProducts();
    const index = current.findIndex((p) => p.id === id || p.slug === id);
    if (index !== -1) {
      const prodSlug = current[index].slug;
      if (prodSlug) {
        saveLocalProductOverride(prodSlug, updates);
        if (is_trending !== undefined || is_best_seller !== undefined || is_new !== undefined) {
          saveLocalProductBadges(prodSlug, { is_trending, is_best_seller, is_new });
        }
      }
      current[index] = {
        ...current[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      localStore.setProducts([...current]);
    }

    // 2. Sync to Supabase if live database is available
    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update({
            ...dbUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          await auditService.logAction({
            action: 'update',
            entity: 'product',
            entity_id: id,
            details: `Updated product "${data.name || id}" in Supabase`,
            status: 'success',
            metadata: updates,
          });
          if (index !== -1) {
            current[index] = { ...current[index], ...data, ...updates };
            localStore.setProducts([...current]);
          }
        } else if (error) {
          console.warn('Supabase product update warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase product update error:', err);
      }
    }

    // 3. Dispatch real-time update event so all components and views refresh immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('samm-store-update', {
          detail: { entity: 'products', id, updates },
        })
      );
      // Also update a storage key to trigger cross-tab/window storage listeners
      try {
        localStorage.setItem('samm_last_store_sync', Date.now().toString());
      } catch {}
    }

    const finalProduct = index !== -1 ? current[index] : ({ id, ...updates } as Product);
    return enrichProductWithBadges(finalProduct);
  },

  async deleteProduct(id: string): Promise<boolean> {
    const current = localStore.getProducts();
    const targetProduct = current.find((p) => p.id === id);
    const productName = targetProduct?.name || id;

    // 1. Immediately update localStore so the product disappears from UI instantly
    const filtered = current.filter((p) => p.id !== id);
    localStore.setProducts(filtered);

    let supabaseDeleted = false;
    let supabaseErrorMsg = '';

    // 2. Also execute deletion in Supabase if live connection is configured
    if (isLiveSupabaseConfigured && supabase) {
      try {
        // Remove related features first to prevent foreign key errors
        await supabase.from('product_features').delete().eq('product_id', id);

        // Attempt deletion from products table
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
          supabaseDeleted = true;
        } else {
          supabaseErrorMsg = error.message;
          console.warn('Direct delete hit constraint, performing soft-delete is_active=false:', error);
          await supabase.from('products').update({ is_active: false }).eq('id', id);
        }
      } catch (err: any) {
        supabaseErrorMsg = err.message || 'Network exception';
        console.error('Supabase product delete exception:', err);
      }
    }

    // 3. Record in audit log
    await auditService.logAction({
      action: 'delete',
      entity: 'product',
      entity_id: id,
      details: supabaseDeleted
        ? `Deleted product "${productName}" from Supabase database and catalog`
        : isLiveSupabaseConfigured
          ? `Deleted product "${productName}" (Supabase status: ${supabaseErrorMsg || 'soft-deleted'})`
          : `Deleted product "${productName}" from catalog`,
      status: supabaseDeleted || !isLiveSupabaseConfigured ? 'success' : 'warning',
      metadata: { product_name: productName, id, supabase_deleted: supabaseDeleted, error: supabaseErrorMsg }
    });

    return true;
  },
};
