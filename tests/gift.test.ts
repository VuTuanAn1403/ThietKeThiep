import { describe, it } from 'node:test';
import assert from 'node:assert';

// Mock store setup
import { mockStore } from '../lib/supabase/mock-store';

describe('GiftService - Save gift configuration', () => {
  it('should save gift with bank info', async () => {
    const { GiftService } = await import('../services/gift.service');
    const res = await GiftService.saveGift('inv-demo-01', {
      title: 'Quà Mừng Test',
      description: 'Test description',
      bankName: 'MBBank',
      accountName: 'TRAN VAN B',
      accountNumber: '999888777666',
      qrImageUrl: null,
      isVisible: true,
    });

    assert.strictEqual(res.error, null);
    assert.ok(res.gift);
    assert.strictEqual(res.gift.bank_name, 'MBBank');
    assert.strictEqual(res.gift.account_name, 'TRAN VAN B');
    assert.strictEqual(res.gift.account_number, '999888777666');
    assert.strictEqual(res.gift.is_visible, true);
  });

  it('should reject empty bank info', async () => {
    const { GiftService } = await import('../services/gift.service');
    const res = await GiftService.saveGift('inv-demo-01', {
      title: 'Test',
      bankName: '',
      accountName: '',
      accountNumber: '',
      isVisible: true,
    });

    assert.ok(res.error);
    assert.strictEqual(res.gift, null);
  });
});

describe('GiftService - Toggle visibility', () => {
  it('should toggle gift visibility', async () => {
    const { GiftService } = await import('../services/gift.service');
    const gift = mockStore.gifts.find((g) => g.invitation_id === 'inv-demo-01');
    assert.ok(gift);
    const originalVis = gift.is_visible;

    const toggled = await GiftService.toggleVisibility('inv-demo-01');
    assert.ok(toggled);
    assert.strictEqual(toggled.is_visible, !originalVis);
  });
});
