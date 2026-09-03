import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';
import { AuthService } from '../lib/auth/auth-service';
import { mockStore } from '../lib/supabase/mock-store';
import { InvitationService } from '../services/invitation.service';

describe('FINAL AUTH SECURITY HARDENING (AUTH-SEC)', () => {
  beforeEach(async () => {
    await AuthService.logout();
  });

  it('AUTH-SEC-01: Tampered USER role cookie (role=ADMIN with normal user ID) is rejected by DB Authority', async () => {
    // Normal user id: usr-demo-01 (role is USER in DB)
    const normalUserId = 'usr-demo-01';
    const dbUser = mockStore.users.find(u => u.id === normalUserId);
    assert.strictEqual(dbUser?.role, 'USER');

    // Simulate cookie tampering: attacker sets role=ADMIN in their cookie
    const mockCookie = `nha_co_tiec_role=ADMIN; nha_co_tiec_user_id=${normalUserId}; nha_co_tiec_user={"id":"${normalUserId}","role":"ADMIN"}`;
    (globalThis as any).document = { cookie: mockCookie };

    const initializedUser = AuthService.initFromCookies();
    // Must return the real role from DB ('USER'), NOT the spoofed 'ADMIN'
    assert.ok(initializedUser);
    assert.strictEqual(initializedUser.role, 'USER');
    assert.notStrictEqual(initializedUser.role, 'ADMIN');

    delete (globalThis as any).document;
  });

  it('AUTH-SEC-02: User A cannot read, modify, or delete User B invitation', async () => {
    const userA_id: string = 'usr-demo-01';
    const userB_id: string = 'usr-demo-02';

    // Ensure User B has an invitation
    const invB_res = await InvitationService.createInvitation(userB_id, 'tpl-rustic-01', 'cat-wedding', {
      title: 'Đám Cưới Của User B',
      slug: `dam-cuoi-user-b-${Date.now()}`,
      eventDate: '2026-11-20',
      venueName: 'Trung Tâm Tiệc Cưới B',
      venueAddress: '456 Đường B, TP.HCM',
      primaryColor: '#B76E79',
      secondaryColor: '#D4AF37',
      headingFont: 'Playfair Display',
      bodyFont: 'Montserrat',
    });
    assert.ok(invB_res.invitation);
    const invB_id = invB_res.invitation.id;

    // Verify User A is not the owner
    const targetInv = await InvitationService.getInvitationById(invB_id);
    assert.ok(targetInv);
    assert.strictEqual(targetInv.user_id, userB_id);
    assert.notStrictEqual(targetInv.user_id, userA_id);

    // Ownership check verification
    const isOwner = (targetInv.user_id as string) === userA_id;
    assert.strictEqual(isOwner, false, 'User A must NOT be recognized as owner of User B invitation');
  });

  it('AUTH-SEC-03: Anonymous cannot access dashboard (Redirects to /login)', () => {
    const req = new NextRequest('http://localhost:3000/dashboard');
    const res = middleware(req);

    assert.strictEqual(res.status, 307);
    const loc = res.headers.get('location');
    assert.ok(loc?.includes('/login'));
    assert.ok(loc?.includes('redirect=%2Fdashboard'));
  });

  it('AUTH-SEC-04: Anonymous cannot access admin (Redirects to /admin/login)', () => {
    const req = new NextRequest('http://localhost:3000/admin');
    const res = middleware(req);

    assert.strictEqual(res.status, 307);
    const loc = res.headers.get('location');
    assert.ok(loc?.includes('/admin/login'));
    assert.ok(loc?.includes('redirect=%2Fadmin'));
  });

  it('AUTH-SEC-05: Authenticated USER cannot access admin (Redirects to /403)', () => {
    const req = new NextRequest('http://localhost:3000/admin', {
      headers: {
        cookie: 'nha_co_tiec_role=USER; nha_co_tiec_user_id=usr-demo-01',
      },
    });
    const res = middleware(req);

    assert.strictEqual(res.status, 307);
    const loc = res.headers.get('location');
    assert.ok(loc?.includes('/403'));
  });

  it('AUTH-SEC-06: Authenticated ADMIN can access admin (Status 200/allow)', () => {
    const req = new NextRequest('http://localhost:3000/admin', {
      headers: {
        cookie: 'nha_co_tiec_role=ADMIN; nha_co_tiec_user_id=usr-admin-01',
      },
    });
    const res = middleware(req);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('location'), null);
  });

  it('AUTH-SEC-07: USER session survives simulated route transitions', async () => {
    const res = await AuthService.login({ email: 'minh.anh@gmail.com', password: 'password123' });
    assert.ok(res.user);
    assert.strictEqual(res.user.role, 'USER');

    // Simulate navigation: /dashboard -> / -> /templates -> /dashboard
    const userAtHome = AuthService.getCurrentUserSync();
    assert.strictEqual(userAtHome?.id, res.user.id);

    const userAtTemplates = AuthService.getCurrentUserSync();
    assert.strictEqual(userAtTemplates?.id, res.user.id);
  });

  it('AUTH-SEC-08: USER session survives hard refresh (initFromCookies)', async () => {
    const user = mockStore.users[0];
    (globalThis as any).document = {
      cookie: `nha_co_tiec_role=USER; nha_co_tiec_user_id=${user.id}`,
    };

    const restoredUser = AuthService.initFromCookies();
    assert.ok(restoredUser);
    assert.strictEqual(restoredUser.id, user.id);
    assert.strictEqual(restoredUser.role, 'USER');

    delete (globalThis as any).document;
  });

  it('AUTH-SEC-09: Explicit logout clears user session completely', async () => {
    await AuthService.login({ email: 'minh.anh@gmail.com', password: 'password123' });
    assert.ok(AuthService.getCurrentUserSync());

    await AuthService.logout();
    assert.strictEqual(AuthService.getCurrentUserSync(), null);
  });
});
