import { createClient } from '@/lib/supabase/client';
import { mockStore } from '@/lib/supabase/mock-store';
import { UserProfile } from '@/types/database.types';
import { LoginInput, RegisterInput } from '@/lib/validations/auth.schema';

const ROLE_COOKIE_NAME = 'nha_co_tiec_role';
const USER_ID_COOKIE_NAME = 'nha_co_tiec_user_id';
const USER_DATA_COOKIE_NAME = 'nha_co_tiec_user';

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
      try {
        setClientCookie(USER_DATA_COOKIE_NAME, JSON.stringify(user));
      } catch {
        // Ignore json error
      }
    } else {
      deleteClientCookie(ROLE_COOKIE_NAME);
      deleteClientCookie(USER_ID_COOKIE_NAME);
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
      (u: UserProfile) => u.email.toLowerCase() === data.email.toLowerCase() && u.status === 'ACTIVE'
    );

    if (!found) {
      return { user: null, error: 'Email hoặc mật khẩu không chính xác' };
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

    const existing = mockStore.users.find((u: UserProfile) => u.email.toLowerCase() === data.email.toLowerCase());
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
