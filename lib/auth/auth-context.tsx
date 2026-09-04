'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile } from '@/types/database.types';
import { AuthService } from './auth-service';
import { createClient } from '@/lib/supabase/client';
import { LoginInput, RegisterInput } from '@/lib/validations/auth.schema';

interface AuthContextType {
  user: UserProfile | null;
  role: 'USER' | 'ADMIN' | null;
  loading: boolean;
  login: (data: LoginInput) => Promise<{ user: UserProfile | null; error: string | null }>;
  register: (data: RegisterInput) => Promise<{ user: UserProfile | null; error: string | null }>;
  loginWithGoogle: (redirectTo?: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refresh: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  login: async () => ({ user: null, error: null }),
  register: async () => ({ user: null, error: null }),
  loginWithGoogle: async () => ({ error: null }),
  logout: async () => {},
  refresh: async () => null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 1. Initial state starts deterministic for both SSR and hydration
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Request version counter to prevent race conditions from stale async requests
  const reqVersionRef = useRef(0);

  const refresh = useCallback(async (): Promise<UserProfile | null> => {
    const version = ++reqVersionRef.current;
    try {
      const u = await AuthService.getCurrentUser();
      // Only commit state if this is still the latest request
      if (version === reqVersionRef.current) {
        setUser(u);
        setLoading(false);
      }
      return u;
    } catch {
      if (version === reqVersionRef.current) {
        setUser(null);
        setLoading(false);
      }
      return null;
    }
  }, []);

  useEffect(() => {
    // Fast initial sync
    const syncUser = AuthService.getCurrentUserSync();
    if (syncUser) {
      setUser(syncUser);
      setLoading(false);
    }

    // Full async verification with race condition guard
    refresh();

    // Supabase auth subscription if active
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      try {
        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            await refresh();
          } else {
            const version = ++reqVersionRef.current;
            if (version === reqVersionRef.current) {
              setUser(null);
            }
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch {
        // Ignore supabase subscription error
      }
    }
  }, [refresh]);

  const login = async (data: LoginInput) => {
    // Advance request version to cancel any pending refresh calls
    const version = ++reqVersionRef.current;
    setLoading(true);

    const res = await AuthService.login(data);
    if (version === reqVersionRef.current) {
      if (res.user) {
        setUser(res.user);
      }
      setLoading(false);
    }
    return res;
  };

  const register = async (data: RegisterInput) => {
    const version = ++reqVersionRef.current;
    setLoading(true);

    const res = await AuthService.register(data);
    if (version === reqVersionRef.current) {
      if (res.user) {
        setUser(res.user);
      }
      setLoading(false);
    }
    return res;
  };

  const loginWithGoogle = async (redirectTo?: string) => {
    return AuthService.loginWithGoogle(redirectTo);
  };

  const logout = async () => {
    // Invalidate any ongoing in-flight verification requests
    ++reqVersionRef.current;
    setLoading(true);
    await AuthService.logout();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
