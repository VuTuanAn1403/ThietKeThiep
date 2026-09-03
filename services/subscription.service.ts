import { SubscriptionPlan, UserSubscription } from '@/types/database.types';
import { mockStore, mockSubscriptionPlans } from '@/lib/supabase/mock-store';
import { createClient } from '@/lib/supabase/client';

export class SubscriptionService {
  private static isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder'));
  }

  static async getPlans(): Promise<SubscriptionPlan[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('subscription_plans').select('*').order('price_vnd', { ascending: true });
        if (!error && data) return data as SubscriptionPlan[];
      } catch (err) {
        console.error('Supabase getPlans error:', err);
      }
    }
    return mockSubscriptionPlans;
  }

  static async getUserSubscription(userId: string): Promise<{ plan: SubscriptionPlan; subscription: UserSubscription | null }> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('*, subscription_plans(*)')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();

        if (sub && sub.subscription_plans) {
          return {
            plan: sub.subscription_plans as SubscriptionPlan,
            subscription: sub as UserSubscription,
          };
        }
      } catch (err) {
        console.error('Supabase getUserSubscription error:', err);
      }
    }

    const sub = mockStore.userSubscriptions.find((s) => s.user_id === userId && s.is_active);
    const plan = mockSubscriptionPlans.find((p) => p.id === (sub?.plan_id || 'plan-free')) || mockSubscriptionPlans[0];
    return { plan, subscription: sub || null };
  }

  static async upgradeSubscription(userId: string, planId: string): Promise<UserSubscription> {
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // Deactivate old subscriptions
        await supabase
          .from('user_subscriptions')
          .update({ is_active: false })
          .eq('user_id', userId);

        const { data, error } = await supabase
          .from('user_subscriptions')
          .insert({
            id: `sub-${Date.now()}`,
            user_id: userId,
            plan_id: planId,
            started_at: now,
            expires_at: expiresAt,
            is_active: true,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single();

        if (!error && data) return data as UserSubscription;
      } catch (err) {
        console.error('Supabase upgradeSubscription error:', err);
      }
    }

    // Update in mock store
    mockStore.userSubscriptions.forEach((s) => {
      if (s.user_id === userId) s.is_active = false;
    });

    const newSub: UserSubscription = {
      id: `sub-${Date.now()}`,
      user_id: userId,
      plan_id: planId,
      started_at: now,
      expires_at: expiresAt,
      is_active: true,
      created_at: now,
      updated_at: now,
    };
    mockStore.userSubscriptions.push(newSub);
    return newSub;
  }
}
