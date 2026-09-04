import fs from 'fs';
import path from 'path';
import { DatabaseBackupService } from '../lib/backup/database-backup';
import { StorageBackupService } from '../lib/backup/storage-backup';

async function main() {
  console.log('====================================================');
  console.log('  NHÀ CÓ TIỆC - PRODUCTION BACKUP AUTOMATION');
  console.log('====================================================');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), '.backups', timestamp);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log(`[1/3] Starting Database Backup for all 19 tables...`);
  const dbManifest = await DatabaseBackupService.exportAllTables();
  const dbBackupPath = path.join(backupDir, 'database.backup.json');
  fs.writeFileSync(dbBackupPath, JSON.stringify(dbManifest, null, 2), 'utf-8');
  console.log(`✓ Database backup saved: ${dbBackupPath}`);
  console.log(`  - Total tables: ${dbManifest.totalTables}`);
  console.log(`  - Total rows: ${dbManifest.totalRows}`);
  console.log(`  - Manifest SHA-256: ${dbManifest.manifestHash}`);

  console.log(`[2/3] Starting Supabase Storage Backup...`);
  const storageManifest = await StorageBackupService.exportAllStorage(['invitation-assets']);
  const storageBackupPath = path.join(backupDir, 'storage.backup.json');
  fs.writeFileSync(storageBackupPath, JSON.stringify(storageManifest, null, 2), 'utf-8');
  console.log(`✓ Storage backup saved: ${storageBackupPath}`);
  console.log(`  - Total objects: ${storageManifest.totalObjects}`);
  console.log(`  - Total bytes: ${storageManifest.totalSizeBytes}`);
  console.log(`  - Storage Manifest SHA-256: ${storageManifest.manifestHash}`);

  console.log(`[3/3] Verifying Backup Integrity Checksums...`);
  const isDbValid = DatabaseBackupService.verifyManifestIntegrity(dbManifest);
  const isStorageValid = StorageBackupService.verifyStorageManifest(storageManifest);

  if (!isDbValid || !isStorageValid) {
    console.error('❌ BACKUP VERIFICATION FAILED: Checksum mismatch or corrupted payload.');
    process.exit(1);
  }

  console.log('✓ All backup manifests verified successfully.');
  console.log('====================================================');
  console.log(`BACKUP COMPLETED AT: ${backupDir}`);
  console.log('====================================================');
}

main().catch((err) => {
  console.error('Fatal backup error:', err);
  process.exit(1);
});
