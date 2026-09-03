export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone?: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headingFont?: string;
  bodyFont?: string;
  heroStyle?: string;
  animation?: string;
}

export type SectionType =
  | 'HERO'
  | 'INTRO'
  | 'STORY'
  | 'COUNTDOWN'
  | 'EVENT'
  | 'GALLERY'
  | 'MAP'
  | 'GIFT'
  | 'SIGNATURE'
  | 'RSVP'
  | 'GUESTBOOK'
  | 'FOOTER';

export interface Template {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  thumbnail_url: string;
  preview_url: string | null;
  theme_config: ThemeConfig;
  default_sections: Array<{
    section_type: SectionType;
    display_order: number;
    is_visible: boolean;
    content_json?: Record<string, unknown>;
  }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type InvitationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Invitation {
  id: string;
  user_id: string;
  template_id: string;
  category_id: string;
  title: string;
  slug: string;
  cover_title: string | null;
  host_name: string | null;
  description: string | null;
  event_date: string;
  event_start_time: string | null;
  event_end_time: string | null;
  venue_name: string;
  venue_address: string;
  latitude: number | null;
  longitude: number | null;
  map_url: string | null;
  primary_color: string;
  secondary_color: string;
  heading_font: string;
  body_font: string;
  music_url: string | null;
  status: InvitationStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface InvitationSection {
  id: string;
  invitation_id: string;
  section_type: SectionType;
  display_order: number;
  is_visible: boolean;
  content_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StoryItem {
  id: string;
  invitation_id: string;
  title: string;
  date: string | null;
  description: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  invitation_id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Guest {
  id: string;
  invitation_id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  group_name: string;
  max_guests: number;
  created_at: string;
  updated_at: string;
}

export type RSVPAttendance = 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE';

export interface RSVP {
  id: string;
  guest_id: string;
  attendance: RSVPAttendance;
  guest_count: number;
  note: string | null;
  submitted_at: string;
  updated_at: string;
}

export interface Wish {
  id: string;
  invitation_id: string;
  guest_id: string | null;
  guest_name: string;
  message: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvitationView {
  id: string;
  invitation_id: string;
  guest_id: string | null;
  session_id: string | null;
  viewed_at: string;
}

export interface Gift {
  id: string;
  invitation_id: string;
  title: string;
  description: string | null;
  bank_name: string;
  account_name: string;
  account_number: string;
  qr_image_url: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Signature {
  id: string;
  invitation_id: string;
  guest_id: string | null;
  guest_name: string;
  message: string;
  signature_image_url: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export type FeedbackType = 'BUG' | 'FEATURE' | 'UI_UX' | 'OTHER';
export type FeedbackStatus = 'NEW' | 'REVIEWING' | 'RESOLVED' | 'CLOSED';

export interface Feedback {
  id: string;
  user_id: string;
  type: FeedbackType;
  title: string;
  content: string;
  rating: number;
  status: FeedbackStatus;
  created_at: string;
  updated_at: string;
}

export type SubscriptionTier = 'FREE' | 'BASIC' | 'PREMIUM';

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  price_vnd: number;
  max_invitations: number;
  max_images_per_invitation: number;
  max_views_per_invitation: number;
  allow_custom_qr: boolean;
  allow_custom_music: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  started_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type NotificationType = 'RSVP_RECEIVED' | 'WISH_RECEIVED' | 'SIGNATURE_RECEIVED' | 'INVITATION_PUBLISHED' | 'SYSTEM_ALERT';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  created_at: string;
}

export type PaymentOrderStatus =
  | 'PENDING'
  | 'WAITING_CONFIRMATION'
  | 'PAID'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface PaymentOrder {
  id: string;
  user_id: string;
  subscription_plan_id: string;
  order_code: string;
  amount: number;
  discount_amount: number;
  final_amount: number;
  currency: string;
  payment_method: string;
  status: PaymentOrderStatus;
  transfer_content: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  qr_code_url: string;
  expires_at: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}


