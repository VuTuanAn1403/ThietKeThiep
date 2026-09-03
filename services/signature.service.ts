import { Signature } from '@/types/database.types';
import { mockStore } from '@/lib/supabase/mock-store';
import { createClient } from '@/lib/supabase/client';

export class SignatureService {
  private static isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder'));
  }

  static async getVisibleSignatures(invitationId: string): Promise<Signature[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('signatures')
          .select('*')
          .eq('invitation_id', invitationId)
          .eq('is_visible', true)
          .order('created_at', { ascending: false });
        if (!error && data) return data as Signature[];
      } catch (err) {
        console.error('Supabase getVisibleSignatures error:', err);
      }
    }
    return mockStore.signatures
      .filter((s) => s.invitation_id === invitationId && s.is_visible)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async getAllSignatures(invitationId: string): Promise<Signature[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('signatures')
          .select('*')
          .eq('invitation_id', invitationId)
          .order('created_at', { ascending: false });
        if (!error && data) return data as Signature[];
      } catch (err) {
        console.error('Supabase getAllSignatures error:', err);
      }
    }
    return mockStore.signatures
      .filter((s) => s.invitation_id === invitationId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async submitSignature(
    invitationId: string,
    guestName: string,
    message: string,
    signatureImageUrl?: string | null,
    guestId?: string | null
  ): Promise<{ signature: Signature | null; error: string | null }> {
    if (!guestName.trim() || !message.trim()) {
      return { signature: null, error: 'Vui lòng nhập tên và lời nhắn lưu bút.' };
    }

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('signatures')
          .insert({
            id: `sig-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            invitation_id: invitationId,
            guest_id: guestId || null,
            guest_name: guestName.trim(),
            message: message.trim(),
            signature_image_url: signatureImageUrl || null,
            is_visible: true,
          })
          .select()
          .single();

        if (!error && data) return { signature: data as Signature, error: null };
        if (error) return { signature: null, error: error.message };
      } catch (err: unknown) {
        console.error('Supabase submitSignature error:', err);
      }
    }

    const newSig: Signature = {
      id: `sig-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      invitation_id: invitationId,
      guest_id: guestId || null,
      guest_name: guestName.trim(),
      message: message.trim(),
      signature_image_url: signatureImageUrl || null,
      is_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockStore.signatures.unshift(newSig);
    return { signature: newSig, error: null };
  }

  static async toggleVisibility(signatureId: string): Promise<Signature | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: current } = await supabase.from('signatures').select('is_visible').eq('id', signatureId).single();
        if (current) {
          const { data: updated } = await supabase
            .from('signatures')
            .update({ is_visible: !current.is_visible, updated_at: new Date().toISOString() })
            .eq('id', signatureId)
            .select()
            .single();
          if (updated) return updated as Signature;
        }
      } catch (err) {
        console.error('Supabase toggleVisibility signature error:', err);
      }
    }

    const sig = mockStore.signatures.find((s) => s.id === signatureId);
    if (!sig) return null;
    sig.is_visible = !sig.is_visible;
    sig.updated_at = new Date().toISOString();
    return sig;
  }

  static async deleteSignature(signatureId: string): Promise<boolean> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('signatures').delete().eq('id', signatureId);
        if (!error) return true;
      } catch (err) {
        console.error('Supabase deleteSignature error:', err);
      }
    }

    mockStore.signatures = mockStore.signatures.filter((s) => s.id !== signatureId);
    return true;
  }
}
