import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AuthService } from '../lib/auth/auth-service';
import { mockStore } from '../lib/supabase/mock-store';
import { UserProfile } from '../types/database.types';

describe('GOOGLE OAUTH: AUTHENTICATION & PROFILE SYNC', () => {
  beforeEach(() => {
    // Reset mockStore to standard baseline before each test
    mockStore.users = [
      {
        id: 'usr-admin-01',
        email: 'admin@nhacotiec.vn',
        full_name: 'Quản Trị Viên Hệ Thống',
        avatar_url: null,
        role: 'ADMIN',
        status: 'ACTIVE',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'usr-demo-01',
        email: 'user@nhacotiec.vn',
        full_name: 'Nguyễn Văn Demo',
        avatar_url: null,
        role: 'USER',
        status: 'ACTIVE',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'usr-suspended-01',
        email: 'badactor@example.com',
        full_name: 'Người Dùng Bị Khóa',
        avatar_url: null,
        role: 'USER',
        status: 'SUSPENDED',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
    ];
  });

  it('1. GOOGLE SIGNUP: Creates new user profile with USER role and ACTIVE status', async () => {
    const authUser = {
      id: 'google-uid-1001',
      email: 'newbie@gmail.com',
      user_metadata: {
        full_name: 'Trần Google Mới',
        avatar_url: 'https://lh3.googleusercontent.com/a/newbie-avatar',
      },
    };

    const res = await AuthService.syncOAuthUserProfile(authUser);
    assert.strictEqual(res.error, null);
    assert.ok(res.user);
    assert.strictEqual(res.user.email, 'newbie@gmail.com');
    assert.strictEqual(res.user.full_name, 'Trần Google Mới');
    assert.strictEqual(res.user.role, 'USER'); // Standard USER role, never ADMIN
    assert.strictEqual(res.user.status, 'ACTIVE');
    assert.strictEqual(res.user.avatar_url, 'https://lh3.googleusercontent.com/a/newbie-avatar');

    // Verify record exists in store
    const inStore = mockStore.users.find(u => u.email === 'newbie@gmail.com');
    assert.ok(inStore);
    assert.strictEqual(inStore.id, 'google-uid-1001');
  });

  it('2. DUPLICATE ACCOUNT PROTECTION: Existing email/password user logging in with Google does NOT create duplicate account', async () => {
    // usr-demo-01 already exists with email 'user@nhacotiec.vn'
    const initialCount = mockStore.users.length;

    const authUser = {
      id: 'google-uid-existing-email',
      email: 'user@nhacotiec.vn',
      user_metadata: {
        name: 'Nguyễn Văn Demo Google',
        picture: 'https://lh3.googleusercontent.com/a/demo-picture',
      },
    };

    const res = await AuthService.syncOAuthUserProfile(authUser);
    assert.strictEqual(res.error, null);
    assert.ok(res.user);

    // Profile ID must remain the original usr-demo-01!
    assert.strictEqual(res.user.id, 'usr-demo-01');
    assert.strictEqual(res.user.email, 'user@nhacotiec.vn');

    // Store must NOT contain duplicate records for this email
    const usersWithEmail = mockStore.users.filter(u => u.email === 'user@nhacotiec.vn');
    assert.strictEqual(usersWithEmail.length, 1);
    assert.strictEqual(mockStore.users.length, initialCount);
  });

  it('3. ROLE INTEGRITY: Google login NEVER escalates standard user to ADMIN', async () => {
    const authUser = {
      id: 'google-uid-normal-user',
      email: 'vip.person@gmail.com',
      user_metadata: {
        full_name: 'VIP User',
      },
    };

    const res = await AuthService.syncOAuthUserProfile(authUser);
    assert.ok(res.user);
    assert.strictEqual(res.user.role, 'USER'); // Strict USER role
  });

  it('4. ADMIN ROLE PRESERVATION: Existing ADMIN retains ADMIN role upon Google login', async () => {
    // usr-admin-01 has role 'ADMIN'
    const authUser = {
      id: 'google-admin-uid',
      email: 'admin@nhacotiec.vn',
      user_metadata: {
        full_name: 'Quản Trị Viên Hệ Thống',
      },
    };

    const res = await AuthService.syncOAuthUserProfile(authUser);
    assert.ok(res.user);
    assert.strictEqual(res.user.id, 'usr-admin-01');
    assert.strictEqual(res.user.role, 'ADMIN'); // Retains ADMIN role
  });

  it('5. SUSPENDED USER PROTECTION: Blocked Google user is rejected', async () => {
    // usr-suspended-01 is SUSPENDED
    const authUser = {
      id: 'google-suspended-uid',
      email: 'badactor@example.com',
      user_metadata: {
        full_name: 'Hacker',
      },
    };

    const res = await AuthService.syncOAuthUserProfile(authUser);
    assert.strictEqual(res.user, null);
    assert.strictEqual(res.error, 'ACCOUNT_SUSPENDED');
  });

  it('6. MISSING EMAIL HANDLING: OAuth payload without email fails safely', async () => {
    const authUser = {
      id: 'google-no-email',
      user_metadata: {},
    };

    const res = await AuthService.syncOAuthUserProfile(authUser as any);
    assert.strictEqual(res.user, null);
    assert.ok(res.error);
  });

  it('7. OPEN REDIRECT SANITIZATION: Validates safe internal redirects in callback', async () => {
    // Import callback route GET handler
    const { GET } = await import('../app/auth/callback/route');

    // Case A: Malicious external URL
    const evilReq = new Request('http://localhost:3000/auth/callback?code=mock_google_code&next=https://evil-site.com');
    const evilRes = await GET(evilReq);
    const locationA = evilRes.headers.get('location');
    assert.ok(locationA);
    // Must redirect to localhost internal path, never external evil-site!
    assert.strictEqual(locationA.includes('evil-site.com'), false);
    assert.ok(locationA.includes('/dashboard') || locationA.includes('/admin'));

    // Case B: Protocol-relative open redirect '//evil.com'
    const protoReq = new Request('http://localhost:3000/auth/callback?code=mock_google_code&next=//evil.com');
    const protoRes = await GET(protoReq);
    const locationB = protoRes.headers.get('location');
    assert.ok(locationB);
    assert.strictEqual(locationB.includes('//evil.com'), false);

    // Case C: Valid safe internal path '/dashboard/invitations'
    const safeReq = new Request('http://localhost:3000/auth/callback?code=mock_google_code&next=/dashboard/invitations');
    const safeRes = await GET(safeReq);
    const locationC = safeRes.headers.get('location');
    assert.ok(locationC);
    assert.ok(locationC.includes('/dashboard/invitations'));
  });

  it('8. INVALID / MISSING CODE: Missing callback code redirects to login with error', async () => {
    const { GET } = await import('../app/auth/callback/route');
    const req = new Request('http://localhost:3000/auth/callback'); // No ?code=
    const res = await GET(req);
    const location = res.headers.get('location');
    assert.ok(location);
    assert.ok(location.includes('/login?error=invalid_code'));
  });

  it('9. OAUTH PROVIDER ERROR: Provider error parameter redirects to login with oauth_denied', async () => {
    const { GET } = await import('../app/auth/callback/route');
    const req = new Request('http://localhost:3000/auth/callback?error=access_denied&error_description=User+cancelled');
    const res = await GET(req);
    const location = res.headers.get('location');
    assert.ok(location);
    assert.ok(location.includes('/login?error=oauth_denied'));
  });
});
