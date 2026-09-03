import { Gift } from '@/types/database.types';
import { mockStore } from '@/lib/supabase/mock-store';
import { createClient } from '@/lib/supabase/client';

export interface GiftInput {
  title: string;
  description?: string | null;
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrImageUrl?: string | null;
  isVisible: boolean;
}

export class GiftService {
  private static isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder'));
  }

  static async getGiftByInvitationId(invitationId: string): Promise<Gift | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('gifts')
          .select('*')
          .eq('invitation_id', invitationId)
          .single();
        if (!error && data) return data as Gift;
      } catch (err) {
        console.error('Supabase getGiftByInvitationId error:', err);
      }
    }
    return mockStore.gifts.find((g) => g.invitation_id === invitationId) || null;
  }

  static async saveGift(
    invitationId: string,
    input: GiftInput
  ): Promise<{ gift: Gift | null; error: string | null }> {
    if (!input.bankName || !input.accountName || !input.accountNumber) {
      return { gift: null, error: 'Vui lòng điền đầy đủ Tên ngân hàng, Chủ tài khoản và Số tài khoản.' };
    }

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: existing } = await supabase
          .from('gifts')
          .select('id')
          .eq('invitation_id', invitationId)
          .single();

        if (existing) {
          const { data: updated, error } = await supabase
            .from('gifts')
            .update({
              title: input.title,
              description: input.description || null,
              bank_name: input.bankName,
              account_name: input.accountName,
              account_number: input.accountNumber,
              qr_image_url: input.qrImageUrl || null,
              is_visible: input.isVisible,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
            .select()
            .single();

          if (!error && updated) return { gift: updated as Gift, error: null };
          if (error) return { gift: null, error: error.message };
        } else {
          const { data: created, error } = await supabase
            .from('gifts')
            .insert({
              id: `gift-${Date.now()}`,
              invitation_id: invitationId,
              title: input.title,
              description: input.description || null,
              bank_name: input.bankName,
              account_name: input.accountName,
              account_number: input.accountNumber,
              qr_image_url: input.qrImageUrl || null,
              is_visible: input.isVisible,
            })
            .select()
            .single();

          if (!error && created) return { gift: created as Gift, error: null };
          if (error) return { gift: null, error: error.message };
        }
      } catch (err: unknown) {
        console.error('Supabase saveGift error:', err);
      }
    }

    const existingIdx = mockStore.gifts.findIndex((g) => g.invitation_id === invitationId);
    if (existingIdx !== -1) {
      const updated: Gift = {
        ...mockStore.gifts[existingIdx],
        title: input.title,
        description: input.description || null,
        bank_name: input.bankName,
        account_name: input.accountName,
        account_number: input.accountNumber,
        qr_image_url: input.qrImageUrl || null,
        is_visible: input.isVisible,
        updated_at: new Date().toISOString(),
      };
      mockStore.gifts[existingIdx] = updated;
      return { gift: updated, error: null };
    } else {
      const newGift: Gift = {
        id: `gift-${Date.now()}`,
        invitation_id: invitationId,
        title: input.title,
        description: input.description || null,
        bank_name: input.bankName,
        account_name: input.accountName,
        account_number: input.accountNumber,
        qr_image_url: input.qrImageUrl || null,
        is_visible: input.isVisible,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockStore.gifts.push(newGift);
      return { gift: newGift, error: null };
    }
  }

  static async toggleVisibility(invitationId: string): Promise<Gift | null> {
    const gift = await this.getGiftByInvitationId(invitationId);
    if (!gift) return null;

    const res = await this.saveGift(invitationId, {
      title: gift.title,
      description: gift.description,
      bankName: gift.bank_name,
      accountName: gift.account_name,
      accountNumber: gift.account_number,
      qrImageUrl: gift.qr_image_url,
      isVisible: !gift.is_visible,
    });
    return res.gift;
  }
}
