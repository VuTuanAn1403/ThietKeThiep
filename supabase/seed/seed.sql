-- NHÀ CÓ TIỆC - SQL Seed Data

-- 1. Insert Invitation Categories
INSERT INTO public.invitation_categories (id, name, slug, description) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Đám Cưới', 'wedding', 'Mẫu thiệp sang trọng, lãng mạn dành cho tiệc cưới'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Sinh Nhật', 'birthday', 'Mẫu thiệp tươi trẻ, ấm áp mừng tuổi mới'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Tân Gia', 'housewarming', 'Mẫu thiệp ấm cúng chào đón tổ ấm mới'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Tốt Nghiệp', 'graduation', 'Mẫu thiệp kỷ niệm mốc vàng rực rỡ'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Kỷ Niệm', 'anniversary', 'Mẫu thiệp kỷ niệm ngày đặc biệt'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Tiệc Thường', 'party', 'Mẫu thiệp hiện đại cho các buổi tiệc họp mặt')
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Templates
INSERT INTO public.templates (id, category_id, name, slug, thumbnail_url, preview_url, theme_config, default_sections) VALUES
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b21',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Romantic Rose',
    'romantic-rose',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    '{"primaryColor": "#B76E79", "secondaryColor": "#8FA79B", "headingFont": "Cormorant Garamond", "bodyFont": "Montserrat", "heroStyle": "center"}'::jsonb,
    '[{"section_type": "HERO", "display_order": 1, "is_visible": true}, {"section_type": "INTRO", "display_order": 2, "is_visible": true}, {"section_type": "COUNTDOWN", "display_order": 3, "is_visible": true}, {"section_type": "EVENT", "display_order": 4, "is_visible": true}, {"section_type": "STORY", "display_order": 5, "is_visible": true}, {"section_type": "GALLERY", "display_order": 6, "is_visible": true}, {"section_type": "MAP", "display_order": 7, "is_visible": true}, {"section_type": "RSVP", "display_order": 8, "is_visible": true}, {"section_type": "GUESTBOOK", "display_order": 9, "is_visible": true}, {"section_type": "FOOTER", "display_order": 10, "is_visible": true}]'::jsonb
  ),
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Elegant Beige',
    'elegant-beige',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    '{"primaryColor": "#C2A68c", "secondaryColor": "#7A8B7B", "headingFont": "Playfair Display", "bodyFont": "Montserrat", "heroStyle": "minimal"}'::jsonb,
    '[{"section_type": "HERO", "display_order": 1, "is_visible": true}, {"section_type": "INTRO", "display_order": 2, "is_visible": true}, {"section_type": "COUNTDOWN", "display_order": 3, "is_visible": true}, {"section_type": "EVENT", "display_order": 4, "is_visible": true}, {"section_type": "GALLERY", "display_order": 5, "is_visible": true}, {"section_type": "MAP", "display_order": 6, "is_visible": true}, {"section_type": "RSVP", "display_order": 7, "is_visible": true}, {"section_type": "GUESTBOOK", "display_order": 8, "is_visible": true}, {"section_type": "FOOTER", "display_order": 9, "is_visible": true}]'::jsonb
  ),
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b23',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Sage Garden',
    'sage-garden',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
    '{"primaryColor": "#6B8E23", "secondaryColor": "#8FA79B", "headingFont": "Cormorant Garamond", "bodyFont": "Montserrat", "heroStyle": "modern"}'::jsonb,
    '[{"section_type": "HERO", "display_order": 1, "is_visible": true}, {"section_type": "INTRO", "display_order": 2, "is_visible": true}, {"section_type": "COUNTDOWN", "display_order": 3, "is_visible": true}, {"section_type": "EVENT", "display_order": 4, "is_visible": true}, {"section_type": "MAP", "display_order": 5, "is_visible": true}, {"section_type": "RSVP", "display_order": 6, "is_visible": true}, {"section_type": "GUESTBOOK", "display_order": 7, "is_visible": true}, {"section_type": "FOOTER", "display_order": 8, "is_visible": true}]'::jsonb
  ),
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b24',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'Birthday Pastel',
    'birthday-pastel',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    '{"primaryColor": "#FF9AA2", "secondaryColor": "#E2F0CB", "headingFont": "Montserrat", "bodyFont": "Montserrat", "heroStyle": "festive"}'::jsonb,
    '[{"section_type": "HERO", "display_order": 1, "is_visible": true}, {"section_type": "INTRO", "display_order": 2, "is_visible": true}, {"section_type": "COUNTDOWN", "display_order": 3, "is_visible": true}, {"section_type": "EVENT", "display_order": 4, "is_visible": true}, {"section_type": "GALLERY", "display_order": 5, "is_visible": true}, {"section_type": "RSVP", "display_order": 6, "is_visible": true}, {"section_type": "GUESTBOOK", "display_order": 7, "is_visible": true}, {"section_type": "FOOTER", "display_order": 8, "is_visible": true}]'::jsonb
  ),
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b25',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'Minimal White',
    'minimal-white',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    '{"primaryColor": "#333333", "secondaryColor": "#888888", "headingFont": "Cormorant Garamond", "bodyFont": "Montserrat", "heroStyle": "clean"}'::jsonb,
    '[{"section_type": "HERO", "display_order": 1, "is_visible": true}, {"section_type": "INTRO", "display_order": 2, "is_visible": true}, {"section_type": "EVENT", "display_order": 3, "is_visible": true}, {"section_type": "MAP", "display_order": 4, "is_visible": true}, {"section_type": "RSVP", "display_order": 5, "is_visible": true}, {"section_type": "FOOTER", "display_order": 6, "is_visible": true}]'::jsonb
  ),
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b26',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
    'Modern Party',
    'modern-party',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    '{"primaryColor": "#D4AF37", "secondaryColor": "#1A1A1A", "headingFont": "Playfair Display", "bodyFont": "Montserrat", "heroStyle": "vibrant"}'::jsonb,
    '[{"section_type": "HERO", "display_order": 1, "is_visible": true}, {"section_type": "INTRO", "display_order": 2, "is_visible": true}, {"section_type": "COUNTDOWN", "display_order": 3, "is_visible": true}, {"section_type": "EVENT", "display_order": 4, "is_visible": true}, {"section_type": "RSVP", "display_order": 5, "is_visible": true}, {"section_type": "GUESTBOOK", "display_order": 6, "is_visible": true}, {"section_type": "FOOTER", "display_order": 7, "is_visible": true}]'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;
