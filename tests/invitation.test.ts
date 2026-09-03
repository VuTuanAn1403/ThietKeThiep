import assert from 'node:assert';
import test from 'node:test';
import { InvitationService } from '../services/invitation.service';

test('InvitationService - Create valid invitation', async () => {
  const res = await InvitationService.createInvitation('usr-demo-01', 'tpl-01', 'cat-01', {
    title: 'Tiệc Tân Gia Nhà Mới',
    slug: 'tan-gia-nha-moi-2026',
    hostName: 'Gia đình Hoàng Minh',
    eventDate: '2026-12-01',
    venueName: 'Nhà Riêng',
    venueAddress: '123 Nguyễn Văn Cừ, Q.5, TP.HCM',
    primaryColor: '#B76E79',
    secondaryColor: '#8FA79B',
    headingFont: 'Cormorant Garamond',
    bodyFont: 'Montserrat',
  });

  assert.strictEqual(res.error, null);
  assert.notStrictEqual(res.invitation, null);
  assert.strictEqual(res.invitation?.slug, 'tan-gia-nha-moi-2026');
});

test('InvitationService - Duplicate slug validation', async () => {
  const res = await InvitationService.createInvitation('usr-demo-01', 'tpl-01', 'cat-01', {
    title: 'Duplicate Slug Test',
    slug: 'minh-anh', // Existing demo slug
    eventDate: '2026-10-20',
    venueName: 'White Palace',
    venueAddress: 'Hoàng Văn Thụ',
    primaryColor: '#B76E79',
    secondaryColor: '#8FA79B',
    headingFont: 'Cormorant Garamond',
    bodyFont: 'Montserrat',
  });

  assert.notStrictEqual(res.error, null);
  assert.strictEqual(res.invitation, null);
});
