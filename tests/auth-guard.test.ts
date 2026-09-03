import { describe, it } from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';
import { AuthService } from '../lib/auth/auth-service';
import { mockStore } from '../lib/supabase/mock-store';

describe('Middleware Route Protection (Server-Side Guards)', () => {
  it('TC-ADMIN-01: Anonymous request to /admin should redirect to /admin/login', () => {
    const req = new NextRequest('http://localhost:3000/admin');
    const res = middleware(req);

    assert.strictEqual(res.status, 307);
    const location = res.headers.get('location');
    assert.ok(location);
    assert.ok(location.includes('/admin/login'));
    assert.ok(location.includes('redirect=%2Fadmin'));
  });

  it('TC-ADMIN-02: Normal USER request to /admin should redirect to /403', () => {
    const req = new NextRequest('http://localhost:3000/admin', {
      headers: {
        cookie: 'nha_co_tiec_role=USER; nha_co_tiec_user_id=usr-demo-01',
      },
    });
    const res = middleware(req);

    assert.strictEqual(res.status, 307);
    const location = res.headers.get('location');
    assert.ok(location);
    assert.ok(location.includes('/403'));
  });

  it('TC-ADMIN-03: ADMIN request to /admin should be allowed (status 200/next)', () => {
    const req = new NextRequest('http://localhost:3000/admin', {
      headers: {
        cookie: 'nha_co_tiec_role=ADMIN; nha_co_tiec_user_id=usr-admin-01',
      },
    });
    const res = middleware(req);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('location'), null);
  });

  it('TC-ADMIN-04: ADMIN request to /admin/users should be allowed', () => {
    const req = new NextRequest('http://localhost:3000/admin/users', {
      headers: {
        cookie: 'nha_co_tiec_role=ADMIN; nha_co_tiec_user_id=usr-admin-01',
      },
    });
    const res = middleware(req);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('location'), null);
  });

  it('TC-ADMIN-05: USER request to /admin/users should redirect to /403', () => {
    const req = new NextRequest('http://localhost:3000/admin/users', {
      headers: {
        cookie: 'nha_co_tiec_role=USER; nha_co_tiec_user_id=usr-demo-01',
      },
    });
    const res = middleware(req);

    assert.strictEqual(res.status, 307);
    const location = res.headers.get('location');
    assert.ok(location);
    assert.ok(location.includes('/403'));
  });

  it('TC-DASH-01: Anonymous request to /dashboard should redirect to /login', () => {
    const req = new NextRequest('http://localhost:3000/dashboard');
    const res = middleware(req);

    assert.strictEqual(res.status, 307);
    const location = res.headers.get('location');
    assert.ok(location);
    assert.ok(location.includes('/login'));
    assert.ok(location.includes('redirect=%2Fdashboard'));
  });

  it('TC-DASH-02: Authenticated USER request to /dashboard should be allowed', () => {
    const req = new NextRequest('http://localhost:3000/dashboard', {
      headers: {
        cookie: 'nha_co_tiec_role=USER; nha_co_tiec_user_id=usr-demo-01',
      },
    });
    const res = middleware(req);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('location'), null);
  });
});

describe('AuthService Session & Role Enforcement', () => {
  it('TC-AUTH-01: Login with valid USER credentials returns USER role', async () => {
    const res = await AuthService.login({ email: 'minh.anh@gmail.com', password: 'password123' });
    assert.strictEqual(res.error, null);
    assert.ok(res.user);
    assert.strictEqual(res.user.role, 'USER');
    assert.strictEqual(res.user.email, 'minh.anh@gmail.com');
  });

  it('TC-AUTH-02: Login with valid ADMIN credentials returns ADMIN role', async () => {
    const res = await AuthService.login({ email: 'admin@nhacotiec.vn', password: 'password123' });
    assert.strictEqual(res.error, null);
    assert.ok(res.user);
    assert.strictEqual(res.user.role, 'ADMIN');
  });

  it('TC-AUTH-03: Explicit logout clears user session', async () => {
    await AuthService.login({ email: 'minh.anh@gmail.com', password: 'password123' });
    assert.ok(AuthService.getCurrentUserSync());

    await AuthService.logout();
    assert.strictEqual(AuthService.getCurrentUserSync(), null);
  });
});
