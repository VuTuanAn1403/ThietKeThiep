import assert from 'node:assert';
import test from 'node:test';
import { AuthService } from '../lib/auth/auth-service';

test('AuthService - Login valid credentials', async () => {
  const res = await AuthService.login({
    email: 'minh.anh@gmail.com',
    password: '123',
  });
  assert.strictEqual(res.error, null);
  assert.strictEqual(res.user?.email, 'minh.anh@gmail.com');
});

test('AuthService - Login invalid credentials', async () => {
  const res = await AuthService.login({
    email: 'nonexistent@gmail.com',
    password: 'wrongpassword',
  });
  assert.notStrictEqual(res.error, null);
  assert.strictEqual(res.user, null);
});

test('AuthService - Register duplicate email', async () => {
  const res = await AuthService.register({
    fullName: 'Duplicate User',
    email: 'minh.anh@gmail.com',
    password: 'password123',
    confirmPassword: 'password123',
  });
  assert.notStrictEqual(res.error, null);
});
