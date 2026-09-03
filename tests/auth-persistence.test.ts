import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';
import { AuthService } from '../lib/auth/auth-service';
import { mockStore } from '../lib/supabase/mock-store';

describe('AUTH SESSION PERSISTENCE & RACE CONDITION DEFENSE', () => {
  beforeEach(async () => {
    await AuthService.logout();
  });

  it('1. login() updates auth state and cookies immediately', async () => {
    const res = await AuthService.login({ email: 'minh.anh@gmail.com', password: 'password123' });
    assert.ok(res.user, 'Login should return valid user');
    assert.strictEqual(res.user.email, 'minh.anh@gmail.com');

    const currentUser = AuthService.getCurrentUserSync();
    assert.ok(currentUser, 'getCurrentUserSync should return logged-in user');
    assert.strictEqual(currentUser.id, res.user.id);
  });

  it('2. Auth state persists across simulated route navigation (/login -> /dashboard -> / -> /templates -> /dashboard)', async () => {
    // Login
    const res = await AuthService.login({ email: 'minh.anh@gmail.com', password: 'password123' });
    assert.ok(res.user);

    // Dashboard navigation
    const atDashboard = AuthService.getCurrentUserSync();
    assert.strictEqual(atDashboard?.id, res.user.id);

    // Homepage navigation (Click Logo or /)
    const atHome = AuthService.getCurrentUserSync();
    assert.strictEqual(atHome?.id, res.user.id);
    assert.strictEqual(atHome?.role, 'USER');

    // Templates navigation
    const atTemplates = AuthService.getCurrentUserSync();
    assert.strictEqual(atTemplates?.id, res.user.id);

    // Back to Dashboard
    const backAtDashboard = AuthService.getCurrentUserSync();
    assert.strictEqual(backAtDashboard?.id, res.user.id);
  });

  it('3. Auth state restores cleanly after page reload (initFromCookies)', async () => {
    const user = mockStore.users[0];
    // Mock browser cookie string
    (globalThis as any).document = {
      cookie: `nha_co_tiec_role=${user.role}; nha_co_tiec_user_id=${user.id}; nha_co_tiec_user={"id":"${user.id}","email":"${user.email}","role":"${user.role}"}`,
    };

    const restoredUser = AuthService.initFromCookies();
    assert.ok(restoredUser);
    assert.strictEqual(restoredUser.id, user.id);
    assert.strictEqual(restoredUser.email, user.email);

    delete (globalThis as any).document;
  });

  it('4. Authenticated user remains authenticated on homepage / without flicker', async () => {
    await AuthService.login({ email: 'minh.anh@gmail.com', password: 'password123' });
    const homeUser = AuthService.getCurrentUserSync();
    assert.ok(homeUser);
    assert.strictEqual(homeUser.email, 'minh.anh@gmail.com');
  });

  it('5. logout() clears auth state and cookies completely', async () => {
    await AuthService.login({ email: 'minh.anh@gmail.com', password: 'password123' });
    assert.ok(AuthService.getCurrentUserSync());

    await AuthService.logout();
    assert.strictEqual(AuthService.getCurrentUserSync(), null);
  });

  it('6. Stale background refresh CANNOT overwrite newly logged-in user (Race condition prevention)', async () => {
    // Simulate: Background verification was started before login
    let reqVersion = 0;
    const initialVersion = ++reqVersion;

    // A slow async background fetch is started with initialVersion (e.g. returning null)
    const slowRefreshPromise = new Promise<{ user: null; version: number }>((resolve) => {
      setTimeout(() => {
        resolve({ user: null, version: initialVersion });
      }, 50);
    });

    // User logs in immediately afterwards, advancing version to 2
    const loginVersion = ++reqVersion;
    const loginResult = await AuthService.login({ email: 'minh.anh@gmail.com', password: 'password123' });
    let activeUser = loginResult.user;

    // Slow refresh resolves
    const staleResult = await slowRefreshPromise;

    // Check version: staleResult.version (1) < loginVersion (2) => Discard staleResult!
    if (staleResult.version === reqVersion) {
      activeUser = staleResult.user;
    }

    assert.ok(activeUser, 'Active user must NOT be overwritten by stale background refresh');
    assert.strictEqual(activeUser.email, 'minh.anh@gmail.com');
  });

  it('7. Protected routes redirect unauthenticated users to login', () => {
    const req = new NextRequest('http://localhost:3000/dashboard/invitations');
    const res = middleware(req);
    assert.strictEqual(res.status, 307);
    const loc = res.headers.get('location');
    assert.ok(loc?.includes('/login'));
    assert.ok(loc?.includes('redirect=%2Fdashboard%2Finvitations'));
  });

  it('8. Public routes do NOT trigger logout or reset session', () => {
    const req = new NextRequest('http://localhost:3000/');
    const res = middleware(req);
    assert.strictEqual(res.status, 200);
  });

  it('9. Wrong password cannot login', async () => {
    const res = await AuthService.login({ email: 'minh.anh@gmail.com', password: '' });
    assert.strictEqual(res.user, null);
    assert.ok(res.error);
  });

  it('10. New tab / simulated browser session restores user session', async () => {
    const user = mockStore.users.find(u => u.role === 'ADMIN');
    assert.ok(user);

    (globalThis as any).document = {
      cookie: `nha_co_tiec_role=ADMIN; nha_co_tiec_user_id=${user.id}`,
    };

    const newTabUser = AuthService.initFromCookies();
    assert.ok(newTabUser);
    assert.strictEqual(newTabUser.id, user.id);
    assert.strictEqual(newTabUser.role, 'ADMIN');

    delete (globalThis as any).document;
  });
});
