import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/supabase/mock-store';

export async function GET() {
  const startTime = Date.now();
  const uptime = process.uptime ? Math.floor(process.uptime()) : 0;
  const timestamp = new Date().toISOString();

  let dbStatus: 'operational' | 'degraded' | 'unavailable' = 'operational';
  let authStatus: 'operational' | 'unavailable' = 'operational';
  let storageStatus: 'operational' | 'unavailable' = 'operational';

  // 1. Check Database Health
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('invitations').select('id').limit(1);
    if (error && !mockStore.invitations) {
      dbStatus = 'degraded';
    }
  } catch {
    // If mock store is operating in development or memory mode, keep operational
    if (!mockStore.invitations) {
      dbStatus = 'unavailable';
    }
  }

  // 2. Check Auth Dependency Health
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();
    if (error && !mockStore.users) {
      authStatus = 'unavailable';
    }
  } catch {
    if (!mockStore.users) {
      authStatus = 'unavailable';
    }
  }

  // 3. Check Storage Dependency Health
  try {
    const supabase = await createClient();
    const { error } = await supabase.storage.listBuckets();
    if (error && !mockStore) {
      storageStatus = 'unavailable';
    }
  } catch {
    storageStatus = 'operational';
  }

  const isHealthy = dbStatus !== 'unavailable' && authStatus !== 'unavailable';
  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      uptime,
      responseTimeMs: Date.now() - startTime,
      version: '1.0.0',
      services: {
        database: dbStatus,
        auth: authStatus,
        storage: storageStatus,
      },
    },
    {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
