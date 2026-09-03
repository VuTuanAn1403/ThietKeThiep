import { UserProfile, Category, Template } from '@/types/database.types';
import { mockStore } from '@/lib/supabase/mock-store';
import { createClient } from '@/lib/supabase/client';

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalInvitations: number;
  publishedInvitations: number;
  totalTemplates: number;
  totalCategories: number;
}

export class AdminService {
  private static isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder'));
  }

  static async getSystemStats(): Promise<SystemStats> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const [{ count: totalUsers }, { count: totalInvitations }, { count: publishedInvitations }, { count: totalTemplates }, { count: totalCategories }] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('invitations').select('*', { count: 'exact', head: true }),
          supabase.from('invitations').select('*', { count: 'exact', head: true }).eq('status', 'PUBLISHED'),
          supabase.from('templates').select('*', { count: 'exact', head: true }),
          supabase.from('invitation_categories').select('*', { count: 'exact', head: true }),
        ]);

        return {
          totalUsers: totalUsers || 0,
          activeUsers: totalUsers || 0,
          totalInvitations: totalInvitations || 0,
          publishedInvitations: publishedInvitations || 0,
          totalTemplates: totalTemplates || 0,
          totalCategories: totalCategories || 0,
        };
      } catch (err) {
        console.error('Supabase getSystemStats error:', err);
      }
    }

    return {
      totalUsers: mockStore.users.length,
      activeUsers: mockStore.users.filter((u: UserProfile) => u.status === 'ACTIVE').length,
      totalInvitations: mockStore.invitations.length,
      publishedInvitations: mockStore.invitations.filter((i) => i.status === 'PUBLISHED').length,
      totalTemplates: mockStore.templates.length,
      totalCategories: mockStore.categories.length,
    };
  }

  static async getUsers(search?: string): Promise<UserProfile[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase.from('users').select('*');
        if (search && search.trim()) {
          const q = `%${search.trim()}%`;
          query = query.or(`email.ilike.${q},full_name.ilike.${q}`);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data) return data as UserProfile[];
      } catch (err) {
        console.error('Supabase getUsers error:', err);
      }
    }

    let list = [...mockStore.users];
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (u: UserProfile) => u.email.toLowerCase().includes(q) || (u.full_name && u.full_name.toLowerCase().includes(q))
      );
    }
    return list;
  }

  static async toggleUserStatus(userId: string): Promise<UserProfile | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: current } = await supabase.from('users').select('status').eq('id', userId).single();
        if (current) {
          const newStatus = current.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          const { data: updated } = await supabase
            .from('users')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single();
          if (updated) return updated as UserProfile;
        }
      } catch (err) {
        console.error('Supabase toggleUserStatus error:', err);
      }
    }

    const user = mockStore.users.find((u: UserProfile) => u.id === userId);
    if (!user) return null;
    user.status = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    user.updated_at = new Date().toISOString();
    return user;
  }

  static async getCategories(): Promise<Category[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('invitation_categories').select('*').order('created_at', { ascending: true });
        if (!error && data) return data as Category[];
      } catch (err) {
        console.error('Supabase getCategories error:', err);
      }
    }
    return [...mockStore.categories];
  }

  static async createCategory(name: string, slug: string, description?: string): Promise<Category> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('invitation_categories')
          .insert({ name, slug, description: description || null })
          .select()
          .single();
        if (data) return data as Category;
      } catch (err) {
        console.error('Supabase createCategory error:', err);
      }
    }

    const cat: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug,
      description: description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockStore.categories.push(cat);
    return cat;
  }

  static async deleteCategory(id: string): Promise<boolean> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('invitation_categories').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.error('Supabase deleteCategory error:', err);
      }
    }
    mockStore.categories = mockStore.categories.filter((c) => c.id !== id);
    return true;
  }

  static async getTemplates(): Promise<Template[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('templates').select('*').order('created_at', { ascending: false });
        if (!error && data) return data as Template[];
      } catch (err) {
        console.error('Supabase getTemplates error:', err);
      }
    }
    return [...mockStore.templates];
  }

  static async toggleTemplateStatus(templateId: string): Promise<Template | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: current } = await supabase.from('templates').select('is_active').eq('id', templateId).single();
        if (current) {
          const { data: updated } = await supabase
            .from('templates')
            .update({ is_active: !current.is_active, updated_at: new Date().toISOString() })
            .eq('id', templateId)
            .select()
            .single();
          if (updated) return updated as Template;
        }
      } catch (err) {
        console.error('Supabase toggleTemplateStatus error:', err);
      }
    }

    const tpl = mockStore.templates.find((t: Template) => t.id === templateId);
    if (!tpl) return null;
    tpl.is_active = !tpl.is_active;
    tpl.updated_at = new Date().toISOString();
    return tpl;
  }

  static async getAllInvitations(): Promise<import('@/types/database.types').Invitation[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('invitations')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data as import('@/types/database.types').Invitation[];
      } catch (err) {
        console.error('Supabase getAllInvitations error:', err);
      }
    }
    return [...mockStore.invitations];
  }

  static async archiveInvitation(id: string): Promise<import('@/types/database.types').Invitation | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('invitations')
          .update({ status: 'ARCHIVED', updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (data) return data as import('@/types/database.types').Invitation;
      } catch (err) {
        console.error('Supabase archiveInvitation error:', err);
      }
    }
    const inv = mockStore.invitations.find((i) => i.id === id);
    if (!inv) return null;
    inv.status = 'ARCHIVED';
    inv.updated_at = new Date().toISOString();
    return inv;
  }
}
