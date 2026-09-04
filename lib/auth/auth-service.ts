import { createClient } from '@/lib/supabase/client';
import { mockStore } from '@/lib/supabase/mock-store';
import { UserProfile } from '@/types/database.types';
import { LoginInput, RegisterInput } from '@/lib/validations/auth.schema';

import { createSignedSessionToken } from './session-token';

const ROLE_COOKIE_NAME = 'nha_co_tiec_role';
const USER_ID_COOKIE_NAME = 'nha_co_tiec_user_id';
const USER_DATA_COOKIE_NAME = 'nha_co_tiec_user';
const SESSION_COOKIE_NAME = 'nha_co_tiec_session';

function setClientCookie(name: string, value: string, maxAgeDays = 7) {
  if (typeof document === 'undefined') return;
  const maxAgeSeconds = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function getClientCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function deleteClientCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export class AuthService {
  private static currentUser: UserProfile | null = null;
  private static isInitialized = false;

  private static isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder'));
  }

  private static syncCookiesWithUser(user: UserProfile | null) {
    if (user) {
      setClientCookie(ROLE_COOKIE_NAME, user.role);
      setClientCookie(USER_ID_COOKIE_NAME, user.id);
      // Cryptographically signed session token to prevent role spoofing
      const sessionToken = createSignedSessionToken(user.id, user.role);
      setClientCookie(SESSION_COOKIE_NAME, sessionToken);

      try {
        setClientCookie(USER_DATA_COOKIE_NAME, JSON.stringify(user));
      } catch {
        // Ignore json error
      }
    } else {
      deleteClientCookie(ROLE_COOKIE_NAME);
      deleteClientCookie(USER_ID_COOKIE_NAME);
      deleteClientCookie(SESSION_COOKIE_NAME);
      deleteClientCookie(USER_DATA_COOKIE_NAME);
    }
  }

  static initFromCookies(): UserProfile | null {
    if (this.currentUser) return this.currentUser;
    if (typeof document === 'undefined') return null;

    try {
      const userId = getClientCookie(USER_ID_COOKIE_NAME);
      const userJson = getClientCookie(USER_DATA_COOKIE_NAME);

      let lookupId = userId;
      if (!lookupId && userJson) {
        try {
          const parsed = JSON.parse(userJson);
          lookupId = parsed?.id;
        } catch {
          // Ignore
        }
      }

      if (lookupId) {
        const dbUser = mockStore.users.find((u: UserProfile) => u.id === lookupId && u.status === 'ACTIVE');
        if (dbUser) {
          // Always use trusted DB user record and role, never raw tampered cookie values
          this.currentUser = dbUser;
          return dbUser;
        }
      }
    } catch {
      // Ignore cookie parse error
    }

    return null;
  }

  static async login(data: LoginInput): Promise<{ user: UserProfile | null; error: string | null }> {
    // 1. Real Supabase Production Auth Path
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (authError || !authData.user) {
          return { user: null, error: authError?.message || 'Đăng nhập không thành công' };
        }

        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profile) {
          const userProfile = profile as UserProfile;
          if (userProfile.status === 'SUSPENDED') {
            try { await supabase.auth.signOut(); } catch {}
            return { user: null, error: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên.' };
          }
          if (userProfile.status === 'INACTIVE') {
            try { await supabase.auth.signOut(); } catch {}
            return { user: null, error: 'Tài khoản chưa được kích hoạt.' };
          }
          this.currentUser = userProfile;
          this.syncCookiesWithUser(userProfile);
          return { user: userProfile, error: null };
        }
      } catch (err: unknown) {
        console.error('Supabase Auth login error:', err);
      }
    }

    // 2. Standalone Development / Test Mode Fallback
    if (!data.password || !data.password.trim()) {
      return { user: null, error: 'Email hoặc mật khẩu không chính xác' };
    }

    const found = mockStore.users.find(
      (u: UserProfile) => u && u.email && u.email.toLowerCase() === data.email.toLowerCase()
    );

    if (!found) {
      return { user: null, error: 'Email hoặc mật khẩu không chính xác' };
    }

    if (found.status === 'SUSPENDED') {
      return { user: null, error: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên.' };
    }

    if (found.status === 'INACTIVE') {
      return { user: null, error: 'Tài khoản chưa được kích hoạt.' };
    }

    this.currentUser = found;
    this.syncCookiesWithUser(found);
    return { user: found, error: null };
  }

  static async register(data: RegisterInput): Promise<{ user: UserProfile | null; error: string | null }> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
            },
          },
        });

        if (authError || !authData.user) {
          return { user: null, error: authError?.message || 'Đăng ký thất bại' };
        }

        const newUser: UserProfile = {
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          avatar_url: null,
          role: 'USER',
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        this.currentUser = newUser;
        this.syncCookiesWithUser(newUser);
        return { user: newUser, error: null };
      } catch (err: unknown) {
        console.error('Supabase Register error:', err);
      }
    }

    const existing = mockStore.users.find(
      (u: UserProfile) => u && u.email && u.email.toLowerCase() === data.email.toLowerCase()
    );
    if (existing) {
      return { user: null, error: 'Email này đã được sử dụng' };
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: data.email,
      full_name: data.fullName,
      avatar_url: null,
      role: 'USER',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockStore.users.push(newUser);
    this.currentUser = newUser;
    this.syncCookiesWithUser(newUser);
    return { user: newUser, error: null };
  }

  static async loginWithGoogle(redirectTo?: string): Promise<{ error: string | null }> {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const safeRedirect = redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
      ? redirectTo
      : '/dashboard';
    const callbackUrl = `${siteUrl}/auth/callback?next=${encodeURIComponent(safeRedirect)}`;

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: callbackUrl,
          },
        });
        if (error) return { error: error.message };
        return { error: null };
      } catch (err: unknown) {
        console.error('Google OAuth signIn error:', err);
        return { error: 'Không thể khởi tạo đăng nhập Google' };
      }
    }

    // Local / Dev / Mock fallback
    if (typeof window !== 'undefined') {
      window.location.href = `/auth/callback?code=mock_google_code&next=${encodeURIComponent(safeRedirect)}`;
      return { error: null };
    }

    return { error: null };
  }

  static async syncOAuthUserProfile(authUser: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  }): Promise<{ user: UserProfile | null; error: string | null }> {
    if (!authUser.email) {
      return { user: null, error: 'Tài khoản Google không có email' };
    }

    const email = authUser.email.toLowerCase();
    const fullName =
      (authUser.user_metadata?.full_name as string) ||
      (authUser.user_metadata?.name as string) ||
      email.split('@')[0];
    const avatarUrl =
      (authUser.user_metadata?.avatar_url as string) ||
      (authUser.user_metadata?.picture as string) ||
      null;

    // 1. Supabase Database Sync
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // Check if user already exists by email or auth id
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .or(`id.eq.${authUser.id},email.eq.${email}`)
          .maybeSingle();

        if (existingUser) {
          const profile = existingUser as UserProfile;
          if (profile.status === 'SUSPENDED' || profile.status === 'INACTIVE') {
            return { user: null, error: 'ACCOUNT_SUSPENDED' };
          }

          // Update profile avatar/name if missing, but strictly preserve role, status, etc.
          const updates: Partial<UserProfile> = {
            updated_at: new Date().toISOString(),
          };
          if (!profile.avatar_url && avatarUrl) updates.avatar_url = avatarUrl;
          if ((!profile.full_name || profile.full_name === email.split('@')[0]) && fullName) updates.full_name = fullName;

          await supabase.from('users').update(updates).eq('id', profile.id);
          const updatedProfile = { ...profile, ...updates };
          return { user: updatedProfile, error: null };
        }

        // Create new user profile for fresh Google signup
        const newProfile: UserProfile = {
          id: authUser.id,
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          role: 'USER', // Standard user, NEVER auto-escalate to ADMIN
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: inserted, error: insertError } = await supabase
          .from('users')
          .insert([newProfile])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating Google user profile:', insertError);
          return { user: newProfile, error: null };
        }

        return { user: (inserted as UserProfile) || newProfile, error: null };
      } catch (err) {
        console.error('Supabase OAuth user sync error:', err);
      }
    }

    // 2. Mock Store / Test Fallback
    const existing = mockStore.users.find(
      (u: UserProfile) => u.id === authUser.id || u.email.toLowerCase() === email
    );

    if (existing) {
      if (existing.status === 'SUSPENDED' || existing.status === 'INACTIVE') {
        return { user: null, error: 'ACCOUNT_SUSPENDED' };
      }
      if (!existing.avatar_url && avatarUrl) existing.avatar_url = avatarUrl;
      existing.updated_at = new Date().toISOString();
      return { user: existing, error: null };
    }

    const newProfile: UserProfile = {
      id: authUser.id || `usr-google-${Date.now()}`,
      email,
      full_name: fullName,
      avatar_url: avatarUrl,
      role: 'USER',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockStore.users.push(newProfile);
    return { user: newProfile, error: null };
  }

  static async logout(): Promise<void> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // Ignore signout error
      }
    }
    this.currentUser = null;
    this.syncCookiesWithUser(null);
  }

  static getCurrentUserSync(): UserProfile | null {
    if (this.currentUser) return this.currentUser;
    return this.initFromCookies();
  }

  static async getCurrentUser(): Promise<UserProfile | null> {
    if (this.currentUser) return this.currentUser;

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profile) {
            const userProfile = profile as UserProfile;
            this.currentUser = userProfile;
            this.syncCookiesWithUser(userProfile);
            return userProfile;
          }
        }
      } catch (err) {
        console.error('Supabase getCurrentUser error:', err);
      }
    }

    return this.initFromCookies();
  }
}
