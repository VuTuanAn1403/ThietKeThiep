import { Feedback, FeedbackType, FeedbackStatus } from '@/types/database.types';
import { mockStore } from '@/lib/supabase/mock-store';
import { createClient } from '@/lib/supabase/client';

export interface FeedbackInput {
  type: FeedbackType;
  title: string;
  content: string;
  rating: number;
}

export class FeedbackService {
  private static isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder'));
  }

  static async getUserFeedback(userId: string): Promise<Feedback[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('feedback')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (!error && data) return data as Feedback[];
      } catch (err) {
        console.error('Supabase getUserFeedback error:', err);
      }
    }
    return mockStore.feedback
      .filter((f) => f.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async getAllFeedback(): Promise<Feedback[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data as Feedback[];
      } catch (err) {
        console.error('Supabase getAllFeedback error:', err);
      }
    }
    return [...mockStore.feedback].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async submitFeedback(
    userId: string,
    input: FeedbackInput
  ): Promise<{ feedback: Feedback | null; error: string | null }> {
    if (!input.title.trim() || !input.content.trim()) {
      return { feedback: null, error: 'Vui lòng nhập tiêu đề và nội dung góp ý.' };
    }

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('feedback')
          .insert({
            id: `fb-${Date.now()}`,
            user_id: userId,
            type: input.type,
            title: input.title.trim(),
            content: input.content.trim(),
            rating: input.rating,
            status: 'NEW',
          })
          .select()
          .single();

        if (!error && data) return { feedback: data as Feedback, error: null };
        if (error) return { feedback: null, error: error.message };
      } catch (err: unknown) {
        console.error('Supabase submitFeedback error:', err);
      }
    }

    const newFb: Feedback = {
      id: `fb-${Date.now()}`,
      user_id: userId,
      type: input.type,
      title: input.title.trim(),
      content: input.content.trim(),
      rating: input.rating,
      status: 'NEW',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockStore.feedback.unshift(newFb);
    return { feedback: newFb, error: null };
  }

  static async updateStatus(
    feedbackId: string,
    status: FeedbackStatus
  ): Promise<{ feedback: Feedback | null; error: string | null }> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('feedback')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', feedbackId)
          .select()
          .single();
        if (!error && data) return { feedback: data as Feedback, error: null };
        if (error) return { feedback: null, error: error.message };
      } catch (err) {
        console.error('Supabase updateStatus feedback error:', err);
      }
    }

    const fb = mockStore.feedback.find((f) => f.id === feedbackId);
    if (!fb) return { feedback: null, error: 'Không tìm thấy phản hồi' };
    fb.status = status;
    fb.updated_at = new Date().toISOString();
    return { feedback: fb, error: null };
  }
}
