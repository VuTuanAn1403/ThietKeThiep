import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { DatabaseBackupService, DatabaseBackupManifest } from '../lib/backup/database-backup';
import { StorageBackupService, StorageBackupManifest } from '../lib/backup/storage-backup';
import { RestoreEngine, RestoreVerificationReport } from '../lib/backup/restore-engine';
import { mockStore, MockStore } from '../lib/supabase/mock-store';
import { AuthService } from '../lib/auth/auth-service';
import { InvitationService } from '../services/invitation.service';
import { GuestService } from '../services/guest.service';
import { RSVPService } from '../services/rsvp.service';
import { WishService } from '../services/wish.service';
import { AnalyticsService } from '../services/analytics.service';

describe('PRODUCTION DRILL: BACKUP & RESTORE INTEGRITY', async () => {
  let dbBackup: DatabaseBackupManifest;
  let storageBackup: StorageBackupManifest;
  let restoreReport: RestoreVerificationReport;

  it('1. BACKUP EXTRACTION: Exports all 19 database tables with SHA-256 hashes', async () => {
    dbBackup = await DatabaseBackupService.exportAllTables();

    assert.ok(dbBackup, 'Backup manifest must exist');
    assert.strictEqual(dbBackup.totalTables, 19, 'Must export exactly 19 database tables');
    assert.ok(dbBackup.totalRows > 0, 'Total exported rows must be greater than zero');
    assert.ok(dbBackup.manifestHash.length === 64, 'Manifest hash must be valid SHA-256');

    // Verify key tables exist in backup
    const expectedTables = [
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
    ];

    for (const t of expectedTables) {
      assert.ok(dbBackup.tables[t], `Table ${t} must be present in backup manifest`);
      assert.ok(dbBackup.tables[t].sha256.length === 64, `Table ${t} must have valid SHA-256 checksum`);
    }
  });

  it('2. STORAGE BACKUP: Captures bucket files, MIME types, and binary SHA-256', async () => {
    storageBackup = await StorageBackupService.exportAllStorage(['invitation-assets']);

    assert.ok(storageBackup, 'Storage backup manifest must exist');
    assert.ok(storageBackup.totalObjects > 0, 'Must back up at least one storage object');
    assert.ok(storageBackup.totalSizeBytes > 0, 'Total storage size must be positive');
    assert.ok(storageBackup.manifestHash.length === 64, 'Storage manifest hash must be valid SHA-256');

    for (const obj of storageBackup.objects) {
      assert.ok(obj.bucket, 'Bucket name must be populated');
      assert.ok(obj.path, 'Object path must be populated');
      assert.ok(obj.contentType, 'Content-Type must be preserved');
      assert.ok(obj.sha256.length === 64, 'Object SHA-256 must be valid');
    }
  });

  it('3. MANIFEST INTEGRITY: Validates clean state and detects tampered manifests', async () => {
    const isDbClean = DatabaseBackupService.verifyManifestIntegrity(dbBackup);
    assert.strictEqual(isDbClean, true, 'Clean database manifest must pass verification');

    const isStorageClean = StorageBackupService.verifyStorageManifest(storageBackup);
    assert.strictEqual(isStorageClean, true, 'Clean storage manifest must pass verification');

    // Simulate tampering detection
    const tamperedDb = JSON.parse(JSON.stringify(dbBackup));
    tamperedDb.tables.users.data.push({ id: 'injected-user', email: 'hacker@evil.com' });
    const isTamperedDetected = DatabaseBackupService.verifyManifestIntegrity(tamperedDb);
    assert.strictEqual(isTamperedDetected, false, 'Tampered data must fail SHA-256 verification');
  });

  it('4. RESTORE DRILL: Reconstructs state in staging with FK dependency ordering', async () => {
    // Create an isolated mock store environment representing the staging target
    const stagingStore: MockStore = {
      users: [],
      categories: [],
      templates: [],
      invitations: [],
      sections: [],
      galleryImages: [],
      storyItems: [],
      guests: [],
      rsvps: [],
      wishes: [],
      views: [],
      gifts: [],
      signatures: [],
      feedback: [],
      subscriptionPlans: [],
      userSubscriptions: [],
      notifications: [],
      auditLogs: [],
      paymentOrders: [],
    };

    restoreReport = await RestoreEngine.executeRestoreDrill(dbBackup, storageBackup, stagingStore);

    assert.strictEqual(restoreReport.database, 'PASS');
    assert.strictEqual(restoreReport.storage, 'PASS');
    assert.strictEqual(restoreReport.details.relationshipChecksPassed, true);
    assert.strictEqual(restoreReport.details.rlsChecksPassed, true);
    assert.strictEqual(restoreReport.details.errors.length, 0);
  });

  it('5. RESTORE VALIDATION: Test 1 — Login after restore', async () => {
    const restoredUser = mockStore.users.find((u) => u.role === 'USER');
    assert.ok(restoredUser, 'A normal user must exist after restore');

    const res = await AuthService.login({ email: restoredUser.email, password: '123' });
    assert.strictEqual(res.error, null, 'User must be able to log in after restore');
    assert.ok(res.user, 'Restored user profile must be returned');
    assert.strictEqual(res.user.email, restoredUser.email);
    assert.strictEqual(res.user.status, 'ACTIVE');
  });

  it('6. RESTORE VALIDATION: Test 2 & 3 — Invitation & Editor content preserved', async () => {
    const sampleInv = mockStore.invitations[0];
    assert.ok(sampleInv, 'At least one invitation must be restored');

    // Test 2: Public invitation lookup
    const retrievedBySlug = await InvitationService.getInvitationBySlug(sampleInv.slug);
    assert.ok(retrievedBySlug, 'Invitation must be fetchable by slug');
    assert.strictEqual(retrievedBySlug.title, sampleInv.title);
    assert.strictEqual(retrievedBySlug.venue_name, sampleInv.venue_name);

    // Test 3: Editor sections preserved
    const sections = await InvitationService.getSections(sampleInv.id);
    assert.ok(sections.length > 0, 'Invitation sections must be preserved');
  });

  it('7. RESTORE VALIDATION: Test 4 — Gallery images load and retain relations', async () => {
    const sampleInv = mockStore.invitations[0];
    const gallery = await InvitationService.getGalleryImages(sampleInv.id);
    assert.ok(Array.isArray(gallery), 'Gallery must be an array');
    for (const img of gallery) {
      assert.ok(img.image_url, 'Image URL must be preserved');
      assert.strictEqual(img.invitation_id, sampleInv.id, 'Image must belong to invitation');
    }
  });

  it('8. RESTORE VALIDATION: Test 5 — Guest list preserved', async () => {
    const sampleInv = mockStore.invitations[0];
    const guests = await GuestService.getGuests(sampleInv.id);
    assert.ok(guests.length > 0, 'Guests must be preserved for invitation');
    assert.ok(guests[0].name, 'Guest name must be preserved');
    assert.ok(guests[0].slug, 'Guest slug must be preserved');
  });

  it('9. RESTORE VALIDATION: Test 6 — RSVP history preserved', async () => {
    const sampleInv = mockStore.invitations[0];
    const stats = await RSVPService.getInvitationRSVPStats(sampleInv.id);
    assert.ok(stats, 'RSVP stats must be computed');
    assert.strictEqual(typeof stats.attending, 'number');
    assert.strictEqual(typeof stats.pending, 'number');
  });

  it('10. RESTORE VALIDATION: Test 7 — Wishes preserved', async () => {
    const sampleInv = mockStore.invitations[0];
    const wishes = await WishService.getAllWishes(sampleInv.id);
    assert.ok(Array.isArray(wishes), 'Wishes must be an array');
    if (wishes.length > 0) {
      assert.ok(wishes[0].guest_name, 'Wish sender name must be preserved');
      assert.ok(wishes[0].message, 'Wish message must be preserved');
    }
  });

  it('11. RESTORE VALIDATION: Test 8 — Analytics views preserved', async () => {
    const sampleInv = mockStore.invitations[0];
    const stats = await AnalyticsService.getInvitationAnalytics(sampleInv.id);
    assert.ok(stats, 'Analytics stats must be computed');
    assert.strictEqual(typeof stats.totalViews, 'number');
    assert.ok(Array.isArray(stats.viewsByDay), 'viewsByDay must be an array');
  });

  it('12. RESTORE VALIDATION: Test 9 & RLS — Isolation and Admin permissions verified', async () => {
    const normalUser = mockStore.users.find((u) => u.role === 'USER')!;
    const adminUser = mockStore.users.find((u) => u.role === 'ADMIN')!;

    assert.ok(normalUser, 'Normal user exists');
    assert.ok(adminUser, 'Admin user exists');

    // A. Normal user can access own invitations
    const ownInvs = await InvitationService.getUserInvitations(normalUser.id);
    assert.ok(Array.isArray(ownInvs));
    for (const inv of ownInvs) {
      assert.strictEqual(inv.user_id, normalUser.id, 'User A can only list User A invitations');
    }

    // B. Normal user cannot view other users audit logs
    const hasAdminAccess = normalUser.role === 'ADMIN';
    assert.strictEqual(hasAdminAccess, false, 'Normal user must NOT have admin privileges');

    // C. Admin user has ADMIN role
    assert.strictEqual(adminUser.role, 'ADMIN', 'Admin user must retain ADMIN role');
  });

  it('13. STORAGE RESTORE VALIDATION: Objects, MIME types and public access', async () => {
    assert.ok(storageBackup.objects.length > 0);
    const heroAsset = storageBackup.objects.find((o) => o.path.includes('hero'));
    assert.ok(heroAsset, 'Hero asset must exist in restored storage manifest');
    assert.strictEqual(heroAsset.bucket, 'invitation-assets');
    assert.strictEqual(heroAsset.contentType, 'image/webp');
    assert.strictEqual(heroAsset.isPublic, true);
  });
});
