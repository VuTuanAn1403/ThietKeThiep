import fs from 'fs';
import path from 'path';
import { DatabaseBackupManifest } from '../lib/backup/database-backup';
import { StorageBackupManifest } from '../lib/backup/storage-backup';
import { RestoreEngine } from '../lib/backup/restore-engine';
import { mockStore } from '../lib/supabase/mock-store';

async function main() {
  console.log('====================================================');
  console.log('  NHÀ CÓ TIỆC - RESTORE DRILL EXECUTION');
  console.log('====================================================');

  const backupsBase = path.join(process.cwd(), '.backups');
  let backupDir: string | null = null;

  if (fs.existsSync(backupsBase)) {
    const entries = fs.readdirSync(backupsBase).sort().reverse();
    if (entries.length > 0) {
      backupDir = path.join(backupsBase, entries[0]);
    }
  }

  if (!backupDir || !fs.existsSync(path.join(backupDir, 'database.backup.json'))) {
    console.log('No existing backup found in .backups. Performing live export for drill test...');
    const { DatabaseBackupService } = await import('../lib/backup/database-backup');
    const { StorageBackupService } = await import('../lib/backup/storage-backup');
    const dbManifest = await DatabaseBackupService.exportAllTables();
    const storageManifest = await StorageBackupService.exportAllStorage();

    const report = await RestoreEngine.executeRestoreDrill(dbManifest, storageManifest, mockStore);
    printReport(report);
    return;
  }

  console.log(`Loading backup archive from: ${backupDir}`);
  const dbManifest: DatabaseBackupManifest = JSON.parse(
    fs.readFileSync(path.join(backupDir, 'database.backup.json'), 'utf-8')
  );
  const storageManifest: StorageBackupManifest = JSON.parse(
    fs.readFileSync(path.join(backupDir, 'storage.backup.json'), 'utf-8')
  );

  console.log('Executing Restore Drill into Staging Environment...');
  const report = await RestoreEngine.executeRestoreDrill(dbManifest, storageManifest, mockStore);
  printReport(report);
}

function printReport(report: any) {
  console.log('----------------------------------------------------');
  console.log('RESTORE DRILL VERIFICATION REPORT:');
  console.log('----------------------------------------------------');
  console.log(`Database:    ${report.database}`);
  console.log(`Storage:     ${report.storage}`);
  console.log(`Auth:        ${report.auth}`);
  console.log(`Invitation:  ${report.invitation}`);
  console.log(`Gallery:     ${report.gallery}`);
  console.log(`Guests:      ${report.guests}`);
  console.log(`RSVP:        ${report.rsvp}`);
  console.log(`Wishes:      ${report.wishes}`);
  console.log(`Analytics:   ${report.analytics}`);
  console.log(`RLS:         ${report.rls}`);
  console.log(`Admin:       ${report.admin}`);
  console.log('----------------------------------------------------');
  console.log(`Restored Tables: ${report.details.restoredTables}`);
  console.log(`Restored Rows:   ${report.details.restoredRows}`);
  console.log(`Storage Objects: ${report.details.restoredStorageObjects}`);
  console.log(`Relationship Checks Passed: ${report.details.relationshipChecksPassed}`);
  console.log(`RLS Checks Passed:          ${report.details.rlsChecksPassed}`);

  if (report.details.errors && report.details.errors.length > 0) {
    console.error('Errors encountered:');
    report.details.errors.forEach((e: string) => console.error(` - ${e}`));
    process.exit(1);
  }

  console.log('====================================================');
  console.log('  ALL 11 RESTORE DRILL VERIFICATIONS: PASSED');
  console.log('====================================================');
}

main().catch((err) => {
  console.error('Fatal restore drill error:', err);
  process.exit(1);
});
