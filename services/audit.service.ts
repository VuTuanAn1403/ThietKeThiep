import { AuditLog } from '@/types/database.types';
import { mockStore } from '@/lib/supabase/mock-store';
import { createClient } from '@/lib/supabase/client';

export class AuditService {
  private static isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder'));
  }

  static async getLogs(): Promise<AuditLog[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) return data as AuditLog[];
      } catch (err) {
        console.error('Supabase getLogs error:', err);
      }
    }

    return [...mockStore.auditLogs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  static async logAdminAction(
    userId: string,
    action: string,
    resourceType: string,
    resourceId?: string | null
  ): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId || null,
      created_at: new Date().toISOString(),
    };

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('audit_logs')
          .insert(newLog)
          .select()
          .single();

        if (!error && data) return data as AuditLog;
      } catch (err) {
        console.error('Supabase logAdminAction error:', err);
      }
    }

    mockStore.auditLogs.unshift(newLog);
    return newLog;
  }
}
