import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/supabase/mock-store';

export interface TableBackupData<T = Record<string, unknown>> {
  tableName: string;
  rowCount: number;
  data: T[];
  sha256: string;
}

export interface DatabaseBackupManifest {
  version: string;
  timestamp: string;
  environment: string;
  totalTables: number;
  totalRows: number;
  tables: Record<string, TableBackupData>;
  manifestHash: string;
  migrationVersion: string;
}

export const BACKUP_TABLE_SEQUENCE = [
  'users',
  'invitation_categories',
  'templates',
  'invitations',
  'invitation_sections',
  'story_items',
  'gallery_images',
  'guests',
  'rsvps',
  'wishes',
  'invitation_views',
  'gifts',
  'signatures',
  'feedback',
  'subscription_plans',
  'user_subscriptions',
  'notifications',
  'audit_logs',
  'payment_orders',
] as const;

export type BackupTableName = (typeof BACKUP_TABLE_SEQUENCE)[number];

function computeSha256(data: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

export class DatabaseBackupService {
  /**
   * Export all 19 tables from database or current runtime store
   */
  static async exportAllTables(): Promise<DatabaseBackupManifest> {
    const timestamp = new Date().toISOString();
    const tables: Record<string, TableBackupData> = {};
    let totalRows = 0;

    let supabaseClient: any = null;
    try {
      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
      ) {
        supabaseClient = await createClient();
      }
    } catch {
      supabaseClient = null;
    }

    for (const tableName of BACKUP_TABLE_SEQUENCE) {
      let rows: any[] = [];

      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.from(tableName).select('*');
          if (!error && Array.isArray(data)) {
            rows = data;
          } else {
            rows = this.getRowsFromMockStore(tableName);
          }
        } catch {
          rows = this.getRowsFromMockStore(tableName);
        }
      } else {
        rows = this.getRowsFromMockStore(tableName);
      }

      const tableData: TableBackupData = {
        tableName,
        rowCount: rows.length,
        data: rows,
        sha256: computeSha256(rows),
      };

      tables[tableName] = tableData;
      totalRows += rows.length;
    }

    const manifestWithoutHash = {
      version: '1.0.0',
      timestamp,
      environment: process.env.NODE_ENV || 'production',
      totalTables: BACKUP_TABLE_SEQUENCE.length,
      totalRows,
      tables,
      migrationVersion: '20260903030000_create_payment_orders',
    };

    const manifestHash = computeSha256(manifestWithoutHash);

    return {
      ...manifestWithoutHash,
      manifestHash,
    };
  }

  /**
   * Map database table name to mockStore key
   */
  static getRowsFromMockStore(tableName: BackupTableName): any[] {
    switch (tableName) {
      case 'users':
        return mockStore.users || [];
      case 'invitation_categories':
        return mockStore.categories || [];
      case 'templates':
        return mockStore.templates || [];
      case 'invitations':
        return mockStore.invitations || [];
      case 'invitation_sections':
        return mockStore.sections || [];
      case 'story_items':
        return mockStore.storyItems || [];
      case 'gallery_images':
        return mockStore.galleryImages || [];
      case 'guests':
        return mockStore.guests || [];
      case 'rsvps':
        return mockStore.rsvps || [];
      case 'wishes':
        return mockStore.wishes || [];
      case 'invitation_views':
        return mockStore.views || [];
      case 'gifts':
        return mockStore.gifts || [];
      case 'signatures':
        return mockStore.signatures || [];
      case 'feedback':
        return mockStore.feedback || [];
      case 'subscription_plans':
        return mockStore.subscriptionPlans || [];
      case 'user_subscriptions':
        return mockStore.userSubscriptions || [];
      case 'notifications':
        return mockStore.notifications || [];
      case 'audit_logs':
        return mockStore.auditLogs || [];
      case 'payment_orders':
        return mockStore.paymentOrders || [];
      default:
        return [];
    }
  }

  /**
   * Validate a manifest checksum
   */
  static verifyManifestIntegrity(manifest: DatabaseBackupManifest): boolean {
    const { manifestHash, ...rest } = manifest;
    const computedHash = computeSha256(rest);
    if (computedHash !== manifestHash) return false;

    // Verify individual table hashes
    for (const [tableName, tableBackup] of Object.entries(manifest.tables)) {
      const tableHash = computeSha256(tableBackup.data);
      if (tableHash !== tableBackup.sha256) return false;
      if (tableBackup.rowCount !== tableBackup.data.length) return false;
    }

    return true;
  }
}
