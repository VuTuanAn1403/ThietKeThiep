import {
  Invitation,
  InvitationSection,
  GalleryImage,
  StoryItem,
} from '@/types/database.types';
import { mockStore } from '@/lib/supabase/mock-store';
import { createClient } from '@/lib/supabase/client';
import { InvitationInput } from '@/lib/validations/invitation.schema';

export class InvitationService {
  private static isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder'));
  }

  static async getUserInvitations(userId: string): Promise<Invitation[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('invitations')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (!error && data) return data as Invitation[];
      } catch (err) {
        console.error('Supabase getUserInvitations error:', err);
      }
    }
    return mockStore.invitations.filter((i) => i.user_id === userId);
  }

  static async getInvitationById(id: string): Promise<Invitation | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('invitations')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) return data as Invitation;
      } catch (err) {
        console.error('Supabase getInvitationById error:', err);
      }
    }
    return mockStore.invitations.find((i) => i.id === id) || null;
  }

  static async getInvitationBySlug(slug: string): Promise<Invitation | null> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('invitations')
          .select('*')
          .eq('slug', slug)
          .single();
        if (!error && data) return data as Invitation;
      } catch (err) {
        console.error('Supabase getInvitationBySlug error:', err);
      }
    }
    return mockStore.invitations.find((i) => i.slug === slug) || null;
  }

  static async getSections(invitationId: string): Promise<InvitationSection[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('invitation_sections')
          .select('*')
          .eq('invitation_id', invitationId)
          .order('display_order', { ascending: true });
        if (!error && data) return data as InvitationSection[];
      } catch (err) {
        console.error('Supabase getSections error:', err);
      }
    }
    return mockStore.sections
      .filter((s) => s.invitation_id === invitationId)
      .sort((a, b) => a.display_order - b.display_order);
  }

  static async getGalleryImages(invitationId: string): Promise<GalleryImage[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          .eq('invitation_id', invitationId)
          .order('display_order', { ascending: true });
        if (!error && data) return data as GalleryImage[];
      } catch (err) {
        console.error('Supabase getGalleryImages error:', err);
      }
    }
    return mockStore.galleryImages
      .filter((g) => g.invitation_id === invitationId)
      .sort((a, b) => a.display_order - b.display_order);
  }

  static async getStoryItems(invitationId: string): Promise<StoryItem[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('story_items')
          .select('*')
          .eq('invitation_id', invitationId)
          .order('display_order', { ascending: true });
        if (!error && data) return data as StoryItem[];
      } catch (err) {
        console.error('Supabase getStoryItems error:', err);
      }
    }
    return mockStore.storyItems
      .filter((s) => s.invitation_id === invitationId)
      .sort((a, b) => a.display_order - b.display_order);
  }

  static async createInvitation(
    userId: string,
    templateId: string,
    categoryId: string,
    input: InvitationInput
  ): Promise<{ invitation: Invitation | null; error: string | null }> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: existing } = await supabase
          .from('invitations')
          .select('id')
          .eq('slug', input.slug)
          .single();

        if (existing) {
          return { invitation: null, error: `Slug "${input.slug}" đã tồn tại. Vui lòng chọn slug khác.` };
        }

        const { data: created, error } = await supabase
          .from('invitations')
          .insert({
            user_id: userId,
            template_id: templateId,
            category_id: categoryId,
            title: input.title,
            slug: input.slug,
            cover_title: input.coverTitle || input.title,
            host_name: input.hostName || 'Chủ tiệc',
            description: input.description || null,
            event_date: input.eventDate,
            event_start_time: input.eventStartTime || '11:00',
            event_end_time: input.eventEndTime || '14:00',
            venue_name: input.venueName,
            venue_address: input.venueAddress,
            latitude: 10.7769,
            longitude: 106.7009,
            map_url: input.mapUrl || null,
            primary_color: input.primaryColor,
            secondary_color: input.secondaryColor,
            heading_font: input.headingFont,
            body_font: input.bodyFont,
            music_url: input.musicUrl || null,
            status: 'DRAFT',
          })
          .select()
          .single();

        if (!error && created) {
          return { invitation: created as Invitation, error: null };
        }
        if (error) return { invitation: null, error: error.message };
      } catch (err: unknown) {
        console.error('Supabase createInvitation error:', err);
      }
    }

    // Standalone fallback
    const existing = mockStore.invitations.find((i) => i.slug === input.slug);
    if (existing) {
      return { invitation: null, error: `Slug "${input.slug}" đã tồn tại. Vui lòng chọn slug khác.` };
    }

    const invitationId = `inv-${Date.now()}`;
    const newInvitation: Invitation = {
      id: invitationId,
      user_id: userId,
      template_id: templateId,
      category_id: categoryId,
      title: input.title,
      slug: input.slug,
      cover_title: input.coverTitle || input.title,
      host_name: input.hostName || 'Chủ tiệc',
      description: input.description || null,
      event_date: input.eventDate,
      event_start_time: input.eventStartTime || '11:00',
      event_end_time: input.eventEndTime || '14:00',
      venue_name: input.venueName,
      venue_address: input.venueAddress,
      latitude: 10.7769,
      longitude: 106.7009,
      map_url: input.mapUrl || null,
      primary_color: input.primaryColor,
      secondary_color: input.secondaryColor,
      heading_font: input.headingFont,
      body_font: input.bodyFont,
      music_url: input.musicUrl || null,
      status: 'DRAFT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: null,
    };

    mockStore.invitations.push(newInvitation);

    const template = mockStore.templates.find((t) => t.id === templateId);
    const defaultSecs = template?.default_sections || [
      { section_type: 'HERO', display_order: 1, is_visible: true },
      { section_type: 'INTRO', display_order: 2, is_visible: true },
      { section_type: 'COUNTDOWN', display_order: 3, is_visible: true },
      { section_type: 'EVENT', display_order: 4, is_visible: true },
      { section_type: 'MAP', display_order: 5, is_visible: true },
      { section_type: 'RSVP', display_order: 6, is_visible: true },
      { section_type: 'FOOTER', display_order: 7, is_visible: true },
    ];

    defaultSecs.forEach((s, idx) => {
      mockStore.sections.push({
        id: `sec-${Date.now()}-${idx}`,
        invitation_id: invitationId,
        section_type: s.section_type,
        display_order: s.display_order,
        is_visible: s.is_visible,
        content_json: s.content_json || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    return { invitation: newInvitation, error: null };
  }

  static async updateInvitation(
    id: string,
    updates: Partial<Invitation>
  ): Promise<{ invitation: Invitation | null; error: string | null }> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        if (updates.slug) {
          const { data: existing } = await supabase
            .from('invitations')
            .select('id')
            .eq('slug', updates.slug)
            .neq('id', id)
            .single();
          if (existing) {
            return { invitation: null, error: `Slug "${updates.slug}" đã trùng lặp.` };
          }
        }

        const { data: updated, error } = await supabase
          .from('invitations')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (!error && updated) return { invitation: updated as Invitation, error: null };
        if (error) return { invitation: null, error: error.message };
      } catch (err) {
        console.error('Supabase updateInvitation error:', err);
      }
    }

    const idx = mockStore.invitations.findIndex((i) => i.id === id);
    if (idx === -1) {
      return { invitation: null, error: 'Không tìm thấy thiệp mời' };
    }

    if (updates.slug) {
      const existing = mockStore.invitations.find((i) => i.slug === updates.slug && i.id !== id);
      if (existing) {
        return { invitation: null, error: `Slug "${updates.slug}" đã trùng lặp.` };
      }
    }

    const current = mockStore.invitations[idx];
    const updated: Invitation = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    mockStore.invitations[idx] = updated;
    return { invitation: updated, error: null };
  }

  static async publishInvitation(id: string): Promise<{ success: boolean; error: string | null }> {
    const inv = await this.getInvitationById(id);
    if (!inv) return { success: false, error: 'Thiệp không tồn tại' };

    if (!inv.title || !inv.event_date || !inv.venue_name || !inv.venue_address) {
      return {
        success: false,
        error: 'Không thể xuất bản. Vui lòng điền đầy đủ Tên thiệp, Ngày diễn ra, Tên địa điểm và Địa chỉ.',
      };
    }

    const result = await this.updateInvitation(id, {
      status: 'PUBLISHED',
      published_at: new Date().toISOString(),
    });

    return { success: !result.error, error: result.error };
  }

  static async unpublishInvitation(id: string): Promise<{ success: boolean; error: string | null }> {
    const result = await this.updateInvitation(id, { status: 'DRAFT' });
    return { success: !result.error, error: result.error };
  }

  static async deleteInvitation(id: string): Promise<boolean> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('invitations').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.error('Supabase deleteInvitation error:', err);
      }
    }

    mockStore.invitations = mockStore.invitations.filter((i) => i.id !== id);
    mockStore.sections = mockStore.sections.filter((s) => s.invitation_id !== id);
    mockStore.galleryImages = mockStore.galleryImages.filter((g) => g.invitation_id !== id);
    mockStore.storyItems = mockStore.storyItems.filter((s) => s.invitation_id !== id);
    mockStore.guests = mockStore.guests.filter((g) => g.invitation_id !== id);
    return true;
  }

  static async uploadImage(
    invitationId: string,
    file: File
  ): Promise<{ url: string | null; error: string | null }> {
    // 1. Storage validation: Size limit 5MB
    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: 'Dung lượng file tối đa là 5MB.' };
    }

    // 2. MIME type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { url: null, error: 'Chỉ chấp nhận file ảnh định dạng JPG, PNG, WEBP.' };
    }

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const fileExt = file.name.split('.').pop();
        const filePath = `invitation-assets/${invitationId}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('invitation-assets')
          .upload(filePath, file, { upsert: true });

        if (uploadError) return { url: null, error: uploadError.message };

        const { data: publicUrlData } = supabase.storage
          .from('invitation-assets')
          .getPublicUrl(filePath);

        return { url: publicUrlData.publicUrl, error: null };
      } catch (err: unknown) {
        return { url: null, error: (err as Error).message };
      }
    }

    // Fallback URL for isolated local testing
    return {
      url: `https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80`,
      error: null,
    };
  }

  static async updateSections(invitationId: string, sections: InvitationSection[]): Promise<void> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('invitation_sections').delete().eq('invitation_id', invitationId);
        await supabase.from('invitation_sections').insert(sections);
        return;
      } catch (err) {
        console.error('Supabase updateSections error:', err);
      }
    }
    mockStore.sections = mockStore.sections.filter((s) => s.invitation_id !== invitationId);
    mockStore.sections.push(...sections);
  }

  static async addGalleryImage(invitationId: string, imageUrl: string, caption?: string): Promise<GalleryImage> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('gallery_images')
          .insert({
            invitation_id: invitationId,
            image_url: imageUrl,
            caption: caption || null,
            display_order: 1,
          })
          .select()
          .single();
        if (data) return data as GalleryImage;
      } catch (err) {
        console.error('Supabase addGalleryImage error:', err);
      }
    }

    const img: GalleryImage = {
      id: `img-${Date.now()}`,
      invitation_id: invitationId,
      image_url: imageUrl,
      caption: caption || null,
      display_order: mockStore.galleryImages.filter((g) => g.invitation_id === invitationId).length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockStore.galleryImages.push(img);
    return img;
  }

  static async deleteGalleryImage(imageId: string): Promise<void> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('gallery_images').delete().eq('id', imageId);
        return;
      } catch (err) {
        console.error('Supabase deleteGalleryImage error:', err);
      }
    }
    mockStore.galleryImages = mockStore.galleryImages.filter((g) => g.id !== imageId);
  }
}
