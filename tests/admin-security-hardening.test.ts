import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { AuthService } from '../lib/auth/auth-service';
import { requireAdmin, requireAuth } from '../lib/auth/server-auth';
import { mockStore } from '../lib/supabase/mock-store';
import { createSignedSessionToken, verifySessionToken } from '../lib/auth/session-token';
import { GET as adminUsersGet } from '../app/api/v1/admin/users/route';
import { GET as adminUsersAliasGet } from '../app/api/admin/users/route';
import { PATCH as mePatch } from '../app/api/v1/me/route';
import { POST as adminLoginPost } from '../app/api/v1/auth/admin/login/route';
import { NextRequest } from 'next/server';

describe('SECURITY SUITE: ADMIN AUTHORIZATION & ANTI-SPOOFING HARDENING', () => {
  const normalUser = mockStore.users.find((u) => u.role === 'USER')!;
  const adminUser = mockStore.users.find((u) => u.role === 'ADMIN')!;

  it('TEST 1 — USER ADMIN PAGE: Normal user is rejected from admin with 403', async () => {
    // Authenticate as normal USER
    await AuthService.login({ email: normalUser.email, password: '123' });

    // Verify requireAdmin rejects normal user with 403
    const authResult = await requireAdmin();
    assert.strictEqual(authResult.role, 'USER');
    assert.strictEqual(authResult.statusCode, 403);
    assert.strictEqual(authResult.error?.includes('Yêu cầu ADMIN'), true);
  });

  it('TEST 2 — USER ADMIN API: Normal user calling admin API receives 403 Forbidden', async () => {
    // Authenticate as normal USER
    await AuthService.login({ email: normalUser.email, password: '123' });

    const req = new NextRequest('http://localhost:3000/api/v1/admin/users');
    const res = await adminUsersGet(req);
    assert.strictEqual(res.status, 403, 'Normal user calling /api/v1/admin/users must receive 403');

    const resAlias = await adminUsersAliasGet(req);
    assert.strictEqual(resAlias.status, 403, 'Normal user calling /api/admin/users must receive 403');
  });

  it('TEST 3 — ROLE ESCALATION: Normal user attempting to self-grant ADMIN is rejected with 403', async () => {
    // Authenticate as normal USER
    await AuthService.login({ email: normalUser.email, password: '123' });

    const patchReq = new Request('http://localhost:3000/api/v1/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'ADMIN' }),
    });

    const res = await mePatch(patchReq);
    const json = await res.json();

    assert.strictEqual(res.status, 403, 'Must reject role escalation with 403 Forbidden');
    assert.strictEqual(json.error, 'ROLE_ESCALATION_FORBIDDEN');
    assert.strictEqual(normalUser.role, 'USER', 'Role in store must remain unchanged as USER');
  });

  it('TEST 4 — STATUS ESCALATION: Normal user attempting to self-modify status is rejected with 403', async () => {
    await AuthService.login({ email: normalUser.email, password: '123' });

    const patchReq = new Request('http://localhost:3000/api/v1/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACTIVE' }),
    });

    const res = await mePatch(patchReq);
    const json = await res.json();

    assert.strictEqual(res.status, 403);
    assert.strictEqual(json.error, 'STATUS_MODIFICATION_FORBIDDEN');
  });

  it('TEST 5 — ADMIN ACCESS: Authorized admin successfully passes requireAdmin', async () => {
    // Authenticate as ADMIN
    await AuthService.login({ email: adminUser.email, password: '123' });

    const authResult = await requireAdmin();
    assert.strictEqual(authResult.role, 'ADMIN');
    assert.strictEqual(authResult.user?.role, 'ADMIN');
    assert.strictEqual(authResult.statusCode, undefined);
  });

  it('TEST 6 — ADMIN API: Admin user calling /api/v1/admin/users receives 200 OK with data', async () => {
    await AuthService.login({ email: adminUser.email, password: '123' });

    const req = new NextRequest('http://localhost:3000/api/v1/admin/users');
    const res = await adminUsersGet(req);
    const json = await res.json();

    assert.strictEqual(res.status, 200, 'Admin calling /api/v1/admin/users must receive 200');
    assert.ok(Array.isArray(json.data), 'Data must be array of users');
    assert.ok(json.data.length > 0, 'Users list must not be empty');
  });

  it('TEST 7 — SUSPENDED ACCOUNT: Suspended user cannot log in and has access denied', async () => {
    // Create a temporary suspended user
    const suspendedId = `usr-suspended-${Date.now()}`;
    mockStore.users.push({
      id: suspendedId,
      email: 'banned.user@example.com',
      full_name: 'Banned User',
      avatar_url: null,
      role: 'USER',
      status: 'SUSPENDED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const loginRes = await AuthService.login({ email: 'banned.user@example.com', password: '123' });
    assert.strictEqual(loginRes.user, null, 'Suspended user must not be granted login session');
    assert.strictEqual(loginRes.error?.includes('khóa'), true, 'Must return account suspended message');

    // Clean up
    const idx = mockStore.users.findIndex((u) => u.id === suspendedId);
    if (idx !== -1) mockStore.users.splice(idx, 1);
  });

  it('TEST 8 — COOKIE ROLE SPOOFING: Tampered cookie without HMAC signature is rejected', () => {
    // Attacker crafts a fake session token by swapping USER with ADMIN
    const validUserToken = createSignedSessionToken('usr-attacker', 'USER');
    const spoofedToken = validUserToken.replace('.USER.', '.ADMIN.');

    // Verifier must detect signature mismatch
    const result = verifySessionToken(spoofedToken);
    assert.strictEqual(result.valid, false, 'Tampered token must fail HMAC verification');
    assert.strictEqual(result.error, 'SIGNATURE_MISMATCH');

    // Valid token must succeed
    const validAdminToken = createSignedSessionToken('usr-admin-1', 'ADMIN');
    const validResult = verifySessionToken(validAdminToken);
    assert.strictEqual(validResult.valid, true);
    assert.strictEqual(validResult.role, 'ADMIN');
  });

  it('TEST 9 — ADMIN LOGIN API FORBIDDEN FOR NORMAL USER', async () => {
    // Submit normal user credentials to /api/v1/auth/admin/login
    const req = new Request('http://localhost:3000/api/v1/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalUser.email, password: '123' }),
    });

    const res = await adminLoginPost(req);
    const json = await res.json();

    assert.strictEqual(res.status, 403, 'Normal user logging into admin endpoint must receive 403');
    assert.strictEqual(json.error, 'FORBIDDEN');
  });

  it('TEST 10 — GOOGLE OAUTH SECURITY: Google user defaults to USER role and cannot bypass Admin', async () => {
    const oauthProfile = await AuthService.syncOAuthUserProfile({
      id: `usr-google-${Date.now()}`,
      email: 'new.google.user@example.com',
      user_metadata: { full_name: 'Google Customer' },
    });

    assert.ok(oauthProfile.user);
    assert.strictEqual(oauthProfile.user.role, 'USER', 'Google OAuth user must default to USER role');

    // Google USER cannot access admin
    await AuthService.login({ email: 'new.google.user@example.com', password: '123' });
    const adminCheck = await requireAdmin();
    assert.strictEqual(adminCheck.statusCode, 403);
  });
});
