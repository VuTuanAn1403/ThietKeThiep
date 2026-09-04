import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server-auth';
import { mockStore } from '@/lib/supabase/mock-store';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.user || auth.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: auth.error || 'Yêu cầu quyền Quản trị viên' },
      { status: auth.statusCode || 403 }
    );
  }

  let logs: any[] = [];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (!error && data) logs = data;
    } catch {
      logs = mockStore.auditLogs || [];
    }
  } else {
    logs = mockStore.auditLogs || [];
  }

  return NextResponse.json({ data: logs });
}
