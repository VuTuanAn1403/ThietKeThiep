import { Category, Template } from '@/types/database.types';
import { mockStore } from '@/lib/supabase/mock-store';
import { createClient } from '@/lib/supabase/client';

export class TemplateService {
  private static isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder'));
  }

  static async getCategories(): Promise<Category[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('invitation_categories')
          .select('*')
          .order('created_at', { ascending: true });
        if (!error && data) return data as Category[];
      } catch (err) {
        console.error('Supabase getCategories error:', err);
      }
    }
    return mockStore.categories;
  }

  static async getTemplates(categoryId?: string, search?: string): Promise<Template[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase.from('templates').select('*').eq('is_active', true);

        if (categoryId && categoryId !== 'all') {
          query = query.eq('category_id', categoryId);
        }

        if (search && search.trim()) {
          query = query.ilike('name', `%${search.trim()}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data) return data as Template[];
      } catch (err) {
        console.error('Supabase getTemplates error:', err);
      }
    }

    let list = mockStore.templates.filter((t: Template) => t.is_active);

    if (categoryId && categoryId !== 'all') {
      list = list.filter((t: Template) => t.category_id === categoryId);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (t: Template) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
      );
    }

    return list;
  }

  static async getTemplateBySlug(slug: string): Promise<Template | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .eq('slug', slug)
          .single();
        if (!error && data) return data as Template;
      } catch (err) {
        console.error('Supabase getTemplateBySlug error:', err);
      }
    }
    return mockStore.templates.find((t: Template) => t.slug === slug) || null;
  }
}
