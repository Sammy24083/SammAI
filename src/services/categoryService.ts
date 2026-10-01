import { Category } from '../types';
import { supabase, isLiveSupabaseConfigured, localStore } from '../lib/supabase';

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase categories fetch failed, using localStore:', err);
      }
    }
    return localStore.getCategories().filter((c) => c.is_active);
  },

  async getAllCategoriesAdmin(): Promise<Category[]> {
    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase categories admin fetch failed, using localStore:', err);
      }
    }
    return localStore.getCategories();
  },

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const newCat: Category = {
      ...category,
      id: 'cat-' + Date.now(),
    };

    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: newCat.name,
            slug: newCat.slug,
            description: newCat.description,
            icon: newCat.icon,
            sort_order: newCat.sort_order,
            is_active: newCat.is_active,
          })
          .select()
          .single();

        if (!error && data) {
          const current = localStore.getCategories();
          localStore.setCategories([...current, data]);
          return data;
        }
      } catch (err) {
        console.warn('Supabase category create fallback:', err);
      }
    }

    const current = localStore.getCategories();
    localStore.setCategories([...current, newCat]);
    return newCat;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    if (isLiveSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('categories')
          .update(updates)
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase category update fallback:', err);
      }
    }

    const current = localStore.getCategories();
    const index = current.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');
    current[index] = { ...current[index], ...updates };
    localStore.setCategories([...current]);
    return current[index];
  },
};
