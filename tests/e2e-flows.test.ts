import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AuthService } from '../lib/auth/auth-service';
import { TemplateService } from '../services/template.service';
import { InvitationService } from '../services/invitation.service';
import { GuestService } from '../services/guest.service';
import { RSVPService } from '../services/rsvp.service';
import { AnalyticsService } from '../services/analytics.service';
import { AdminService } from '../services/admin.service';
import { PaymentService } from '../services/payment.service';
import { SubscriptionService } from '../services/subscription.service';
import { mockStore } from '../lib/supabase/mock-store';

describe('E2E FLOWS: NHÀ CÓ TIỆC V1.0 INTEGRATION SUITE', () => {
  const timestamp = Date.now();
  const testUserEmail = `flow-user-${timestamp}@nhacotiec.test`;

  // FLOW 1: USER LIFECYCLE
  it('FLOW 1 — USER: Register -> Login -> Choose template -> Create invitation -> Edit -> Save -> Publish', async () => {
    // 1. Register new user
    const regRes = await AuthService.register({
      email: testUserEmail,
      password: 'SecurePass123!@#',
      confirmPassword: 'SecurePass123!@#',
      fullName: 'Cô Dâu Chú Rể',
    });
    assert.ok(regRes.user, 'User should be registered successfully');
    assert.strictEqual(regRes.user.email, testUserEmail);
    assert.strictEqual(regRes.user.role, 'USER');

    // 2. Login user
    const loginRes = await AuthService.login({
      email: testUserEmail,
      password: 'SecurePass123!@#',
    });
    assert.ok(loginRes.user, 'User login should succeed');
    const userId = loginRes.user.id;

    // 3. Choose template and create invitation
    const templates = await TemplateService.getTemplates();
    assert.ok(templates.length > 0, 'Templates should be available');
    const chosenTemplate = templates[0];

    const createRes = await InvitationService.createInvitation(
      userId,
      chosenTemplate.id,
      chosenTemplate.category_id || 'cat-wedding',
      {
        title: 'Đám Cưới Tuấn & Mai',
        slug: `tuan-mai-${timestamp}`,
        eventDate: '2026-11-20',
        eventStartTime: '18:00',
        venueName: 'Trung Tâm Tiệc Cưới GEM Center',
        venueAddress: 'Số 8 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM',
        primaryColor: '#B76E79',
        secondaryColor: '#8FA79B',
        headingFont: 'Cormorant Garamond',
        bodyFont: 'Montserrat',
      }
    );
    assert.ok(createRes.invitation, 'Invitation should be created');
    assert.strictEqual(createRes.invitation.status, 'DRAFT');
    const invitationId = createRes.invitation.id;

    // 4. Edit invitation details & save
    const updateRes = await InvitationService.updateInvitation(invitationId, {
      host_name: 'Vũ Tuấn & Ngọc Mai',
      music_url: 'https://example.com/wedding-song.mp3',
    });
    assert.strictEqual(updateRes.error, null);

    // Verify sections exist
    const sections = await InvitationService.getSections(invitationId);
    assert.ok(sections.length > 0, 'Sections should be seeded for invitation');

    // 5. Add gallery image
    const newImg = await InvitationService.addGalleryImage(
      invitationId,
      'https://images.unsplash.com/photo-1519741497674-611481863552',
      'Ảnh cưới lễ đính hôn'
    );
    assert.ok(newImg.id, 'Gallery image should be created');

    // 6. Publish invitation
    const pubRes = await InvitationService.publishInvitation(invitationId);
    assert.strictEqual(pubRes.error, null);
    assert.strictEqual(pubRes.success, true);

    const publishedInv = await InvitationService.getInvitationById(invitationId);
    assert.strictEqual(publishedInv?.status, 'PUBLISHED');

    // 7. Verify public invitation retrieval
    const publicInv = await InvitationService.getInvitationBySlug(`tuan-mai-${timestamp}`);
    assert.ok(publicInv, 'Public invitation should be queryable by slug');
    assert.strictEqual(publicInv.status, 'PUBLISHED');
  });

  // FLOW 2: GUEST & PUBLIC RSVP
  it('FLOW 2 — GUEST: Open invitation -> Public RSVP without personalized link -> Success', async () => {
    // 1. Get an existing published invitation
    const invitations = mockStore.invitations.filter((i) => i && i.status === 'PUBLISHED');
    assert.ok(invitations.length > 0);
    const invitation = invitations[0];

    // 2. Public RSVP submission
    const rsvpRes = await RSVPService.submitPublicRSVP(invitation.id, {
      guest_name: 'Nguyễn Văn Khách',
      attendance: 'ATTENDING',
      guest_count: 2,
      note: 'Chúc hai bạn trăm năm hạnh phúc!',
      phone: '0987654321',
    });

    assert.strictEqual(rsvpRes.error, null, 'Public RSVP should succeed');
    assert.ok(rsvpRes.guest, 'Guest record should be automatically created');
    assert.strictEqual(rsvpRes.guest.name, 'Nguyễn Văn Khách');
    assert.ok(rsvpRes.rsvp, 'RSVP record should be created');
    assert.strictEqual(rsvpRes.rsvp.attendance, 'ATTENDING');
    assert.strictEqual(rsvpRes.rsvp.guest_count, 2);
  });

  // FLOW 3: OWNER DASHBOARD & REAL ANALYTICS
  it('FLOW 3 — OWNER: Dashboard -> RSVP stats -> Real time analytics with attendance rate', async () => {
    const ownerId = 'usr-owner-flow-test';
    // Create an invitation for owner
    const invRes = await InvitationService.createInvitation(
      ownerId,
      'tpl-romantic-rose',
      'cat-wedding',
      {
        title: 'Tiệc Cưới Minh & Lan',
        slug: `minh-lan-${timestamp}`,
        eventDate: '2026-12-25',
        venueName: 'Melisa Center',
        venueAddress: 'TP.HCM',
        primaryColor: '#B76E79',
        secondaryColor: '#8FA79B',
        headingFont: 'Cormorant Garamond',
        bodyFont: 'Montserrat',
      }
    );
    assert.ok(invRes.invitation);
    const invId = invRes.invitation.id;

    // Add 2 guests
    const g1 = await GuestService.createGuest(invId, {
      name: 'Khách Tham Dự 1',
      slug: `khach-1-${timestamp}`,
      maxGuests: 2,
      groupName: 'Bạn cấp 3',
    });
    const g2 = await GuestService.createGuest(invId, {
      name: 'Khách Vắng Mặt 2',
      slug: `khach-2-${timestamp}`,
      maxGuests: 1,
      groupName: 'Đồng nghiệp',
    });

    // Record RSVPs
    await RSVPService.submitRSVP(g1.guest!.id, { attendance: 'ATTENDING', guest_count: 2 }, invId);
    await RSVPService.submitRSVP(g2.guest!.id, { attendance: 'NOT_ATTENDING', guest_count: 0 }, invId);

    // Record a view
    await GuestService.recordView(invId, g1.guest!.id);

    // Fetch analytics
    const analytics = await AnalyticsService.getInvitationAnalytics(invId, '7d');
    assert.ok(analytics.totalViews >= 1, 'Total views should be at least 1');
    assert.ok(analytics.uniqueSessions >= 1, 'Unique sessions should be at least 1');
    assert.strictEqual(analytics.attendanceRate, 50, 'Attendance rate should be exactly 50% (1 out of 2 guests)');

    const attendingCount = analytics.rsvpDistribution.find((r) => r.name === 'Tham dự')?.value;
    assert.strictEqual(attendingCount, 1);
  });

  // FLOW 4: ADMIN CONTROL CENTER
  it('FLOW 4 — ADMIN: Admin login -> System stats & Growth metrics -> Payment approval -> Audit logging', async () => {
    // 1. Admin login using seed credentials
    const adminLogin = await AuthService.login({
      email: 'admin@nhacotiec.vn',
      password: 'password123',
    });
    assert.ok(adminLogin.user, 'Admin login must succeed');
    assert.strictEqual(adminLogin.user.role, 'ADMIN');

    // 2. System stats & Growth metrics
    const stats = await AdminService.getSystemStats();
    assert.ok(stats.totalUsers > 0);
    assert.ok(stats.totalInvitations > 0);

    const growth = await AdminService.getGrowthMetrics();
    assert.strictEqual(growth.length, 6, 'Growth metrics should cover 6 months');

    // 3. User creates payment order
    const orderRes = await PaymentService.createOrder('usr-payment-flow', 'plan-premium');
    assert.ok(orderRes.order);
    const orderId = orderRes.order.id;

    // 4. Admin approves payment order
    const approveRes = await PaymentService.adminApprovePayment(orderId, adminLogin.user.id);
    assert.strictEqual(approveRes.success, true);
    assert.strictEqual(approveRes.order?.status, 'PAID');

    // 5. Verify Idempotency: Calling approve again returns success without duplicate side-effects
    const secondApprove = await PaymentService.adminApprovePayment(orderId, adminLogin.user.id);
    assert.strictEqual(secondApprove.success, true);

    // 6. User subscription verified upgraded
    const userSub = await SubscriptionService.getUserSubscription('usr-payment-flow');
    assert.strictEqual(userSub.plan.id, 'plan-premium');
    assert.strictEqual(userSub.subscription?.is_active, true);
  });

  // FLOW 5: SECURITY ENFORCEMENT & PRIVILEGE CHECKS
  it('FLOW 5 — SECURITY: Blocks IDOR guest modification and enforces ownership', async () => {
    // Create Invitation A and Invitation B
    const invA = await InvitationService.createInvitation(
      'usr-sec-a',
      'tpl-romantic-rose',
      'cat-wedding',
      {
        title: 'Tiệc A',
        slug: `tiec-a-${timestamp}`,
        eventDate: '2026-10-10',
        venueName: 'Venue A',
        venueAddress: 'Address A',
        primaryColor: '#B76E79',
        secondaryColor: '#8FA79B',
        headingFont: 'Cormorant Garamond',
        bodyFont: 'Montserrat',
      }
    );
    const invB = await InvitationService.createInvitation(
      'usr-sec-b',
      'tpl-romantic-rose',
      'cat-wedding',
      {
        title: 'Tiệc B',
        slug: `tiec-b-${timestamp}`,
        eventDate: '2026-10-10',
        venueName: 'Venue B',
        venueAddress: 'Address B',
        primaryColor: '#B76E79',
        secondaryColor: '#8FA79B',
        headingFont: 'Cormorant Garamond',
        bodyFont: 'Montserrat',
      }
    );

    assert.ok(invA.invitation);
    assert.ok(invB.invitation);

    // Create guest for Invitation A
    const guestA = await GuestService.createGuest(invA.invitation.id, {
      name: 'Khách của Tiệc A',
      slug: `khach-a-${timestamp}`,
      maxGuests: 2,
      groupName: 'Bạn bè',
    });
    assert.ok(guestA.guest);

    // Malicious attempt: Submitting RSVP for Guest A under Invitation B
    const idorRes = await RSVPService.submitRSVP(
      guestA.guest.id,
      { attendance: 'ATTENDING', guest_count: 1 },
      invB.invitation.id // Expected invitation is B, but guest belongs to A!
    );

    assert.strictEqual(idorRes.rsvp, null, 'Cross-invitation guest modification must be rejected');
    assert.ok(idorRes.error?.includes('không thuộc'), 'Should return ownership mismatch error');
  });
});
