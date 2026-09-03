-- NHÀ CÓ TIỆC - SQL Migration Schema

-- 1. Users Table (Profile)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.invitation_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Templates Table
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.invitation_categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  thumbnail_url TEXT NOT NULL,
  preview_url TEXT,
  theme_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  default_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Invitations Table
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES public.invitation_categories(id) ON DELETE RESTRICT,

  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,

  cover_title TEXT,
  host_name TEXT,
  description TEXT,

  event_date DATE NOT NULL,
  event_start_time TIME,
  event_end_time TIME,

  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,

  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  map_url TEXT,

  primary_color TEXT DEFAULT '#B76E79',
  secondary_color TEXT DEFAULT '#8FA79B',

  heading_font TEXT DEFAULT 'Cormorant Garamond',
  body_font TEXT DEFAULT 'Montserrat',

  music_url TEXT,

  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 5. Invitation Sections Table
CREATE TABLE IF NOT EXISTS public.invitation_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN (
    'HERO', 'INTRO', 'STORY', 'COUNTDOWN', 'EVENT', 'GALLERY', 'MAP', 'RSVP', 'GUESTBOOK', 'FOOTER'
  )),
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Story Items Table
CREATE TABLE IF NOT EXISTS public.story_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT,
  description TEXT,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Gallery Images Table
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Guests Table
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  group_name TEXT DEFAULT 'Khách mời',
  max_guests INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_invitation_guest_slug UNIQUE (invitation_id, slug)
);

-- 9. RSVPs Table
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID UNIQUE NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  attendance TEXT NOT NULL CHECK (attendance IN ('ATTENDING', 'NOT_ATTENDING', 'MAYBE')),
  guest_count INT NOT NULL DEFAULT 1,
  note TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Wishes Table
CREATE TABLE IF NOT EXISTS public.wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Invitation Views Table
CREATE TABLE IF NOT EXISTS public.invitation_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  session_id TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON public.invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_slug ON public.invitations(slug);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);
CREATE INDEX IF NOT EXISTS idx_guests_invitation_id ON public.guests(invitation_id);
CREATE INDEX IF NOT EXISTS idx_guests_invitation_slug ON public.guests(invitation_id, slug);
CREATE INDEX IF NOT EXISTS idx_rsvps_guest_id ON public.rsvps(guest_id);
CREATE INDEX IF NOT EXISTS idx_wishes_invitation_id ON public.wishes(invitation_id);
CREATE INDEX IF NOT EXISTS idx_wishes_is_visible ON public.wishes(is_visible);
CREATE INDEX IF NOT EXISTS idx_invitation_views_invitation_id ON public.invitation_views(invitation_id);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_views ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Public read active categories" ON public.invitation_categories FOR SELECT USING (true);
CREATE POLICY "Public read active templates" ON public.templates FOR SELECT USING (is_active = true);
CREATE POLICY "Public read published invitations" ON public.invitations FOR SELECT USING (status = 'PUBLISHED' OR auth.uid() = user_id);
CREATE POLICY "User manage own invitations" ON public.invitations FOR ALL USING (auth.uid() = user_id);
