# Database Specification — NHÀ CÓ TIỆC

Tài liệu mô tả chi tiết Schema Cơ sở Dữ liệu Relational PostgreSQL / Supabase cho dự án **Nhà Có Tiệc**.

---

## 1. Relational Schema Summary

Hệ thống bao gồm 11 bảng cơ sở dữ liệu chính:

```text
1. users (Profile mở rộng kết nối auth.users)
2. invitation_categories (Danh mục tiệc: Đám cưới, Sinh nhật, Tân gia...)
3. templates (Mẫu thiết kế thiệp)
4. invitations (Thiệp mời của người dùng)
5. invitation_sections (Các phần hiển thị của thiệp: Hero, Countdown, Map, RSVP...)
6. story_items (Timeline mốc kỷ niệm/câu chuyện)
7. gallery_images (Hình ảnh album thiệp)
8. guests (Danh sách khách mời)
9. rsvps (Phản hồi tham dự từ khách mời)
10. wishes (Lời chúc từ khách mời - Sổ lời chúc)
11. invitation_views (Thống kê lượt xem thiệp)
```

---

## 2. Table Definitions

### 2.1 `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.2 `invitation_categories`
```sql
CREATE TABLE invitation_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.3 `templates`
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES invitation_categories(id) ON DELETE RESTRICT,
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
```

### 2.4 `invitations`
```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES invitation_categories(id) ON DELETE RESTRICT,

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
```

### 2.5 `invitation_sections`
```sql
CREATE TABLE invitation_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN (
    'HERO', 'INTRO', 'STORY', 'COUNTDOWN', 'EVENT', 'GALLERY', 'MAP', 'RSVP', 'GUESTBOOK', 'FOOTER'
  )),
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.6 `story_items`
```sql
CREATE TABLE story_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT,
  description TEXT,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.7 `gallery_images`
```sql
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.8 `guests`
```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
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
```

### 2.9 `rsvps`
```sql
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID UNIQUE NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  attendance TEXT NOT NULL CHECK (attendance IN ('ATTENDING', 'NOT_ATTENDING', 'MAYBE')),
  guest_count INT NOT NULL DEFAULT 1,
  note TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.10 `wishes`
```sql
CREATE TABLE wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.11 `invitation_views`
```sql
CREATE TABLE invitation_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  session_id TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 3. Performance Indexes

```sql
CREATE INDEX idx_invitations_user_id ON invitations(user_id);
CREATE INDEX idx_invitations_slug ON invitations(slug);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_guests_invitation_id ON guests(invitation_id);
CREATE INDEX idx_guests_invitation_slug ON guests(invitation_id, slug);
CREATE INDEX idx_rsvps_guest_id ON rsvps(guest_id);
CREATE INDEX idx_wishes_invitation_id ON wishes(invitation_id);
CREATE INDEX idx_wishes_is_visible ON wishes(is_visible);
CREATE INDEX idx_invitation_views_invitation_id ON invitation_views(invitation_id);
CREATE INDEX idx_invitation_views_viewed_at ON invitation_views(viewed_at);
```
