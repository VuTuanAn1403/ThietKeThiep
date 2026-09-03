import { cookies } from 'next/headers';
import { UserProfile } from '@/types/database.types';
import { mockStore } from '@/lib/supabase/mock-store';
import { createClient } from '@/lib/supabase/server';
import { InvitationService } from '@/services/invitation.service';

const USER_ID_COOKIE = 'nha_co_tiec_user_id';
const ROLE_COOKIE = 'nha_co_tiec_role';

export interface AuthResult {
  user: UserProfile | null;
  role: 'USER' | 'ADMIN' | null;
  error?: string;
  statusCode?: number;
}

/**
 * Validates the current session against trusted database records.
 * NEVER trusts the role or permissions sent blindly in client cookies.
 */
export async function getAuthenticatedServerUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(USER_ID_COOKIE)?.value;

  // 1. Supabase Production Auth Path
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
    try {
      const supabase = await createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .eq('status', 'ACTIVE')
          .single();

        if (profile) {
          return profile as UserProfile;
        }
      }
    } catch {
      // Fallback
    }
  }

  // 2. Database / Local Store Path (Always verifies against trusted mockStore/DB)
  if (userId) {
    const trustedUser = mockStore.users.find(
      (u: UserProfile) => u.id === userId && u.status === 'ACTIVE'
    );
    if (trustedUser) {
      return trustedUser;
    }
  }

  return null;
}

/**
 * Requires an authenticated user. Returns 401 if unauthenticated.
 */
export async function requireAuth(): Promise<AuthResult> {
  const user = await getAuthenticatedServerUser();
  if (!user) {
    return { user: null, role: null, error: 'Chưa đăng nhập', statusCode: 401 };
  }
  return { user, role: user.role };
}

/**
 * Requires ADMIN role verified from database.
 * If user claimed ADMIN in cookie but database says USER -> Returns 403 Forbidden.
 */
export async function requireAdmin(): Promise<AuthResult> {
  const user = await getAuthenticatedServerUser();
  if (!user) {
    return { user: null, role: null, error: 'Yêu cầu đăng nhập tài khoản Quản trị', statusCode: 401 };
  }
  if (user.role !== 'ADMIN') {
    return { user, role: user.role, error: 'Không có quyền truy cập (Yêu cầu ADMIN)', statusCode: 403 };
  }
  return { user, role: 'ADMIN' };
}

/**
 * Validates that the authenticated user is the owner of the invitation (or an ADMIN).
 * Prevents User A from reading, modifying, or deleting User B's invitation.
 */
export async function requireInvitationOwnership(invitationId: string): Promise<{
  authorized: boolean;
  user: UserProfile | null;
  error?: string;
  statusCode?: number;
}> {
  const auth = await requireAuth();
  if (!auth.user) {
    return { authorized: false, user: null, error: auth.error, statusCode: auth.statusCode };
  }

  const invitation = await InvitationService.getInvitationById(invitationId);
  if (!invitation) {
    return { authorized: false, user: auth.user, error: 'Không tìm thấy thiệp mời', statusCode: 404 };
  }

  // ADMIN can manage all; USER can only manage their own
  if (auth.user.role !== 'ADMIN' && invitation.user_id !== auth.user.id) {
    return {
      authorized: false,
      user: auth.user,
      error: 'Bạn không có quyền truy cập thiệp mời của người khác',
      statusCode: 403,
    };
  }

  return { authorized: true, user: auth.user };
}
