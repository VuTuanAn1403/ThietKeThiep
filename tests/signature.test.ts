import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('SignatureService - Submit signature', () => {
  it('should create a new signature', async () => {
    const { SignatureService } = await import('../services/signature.service');
    const res = await SignatureService.submitSignature(
      'inv-demo-01',
      'Nguyễn Thị Test',
      'Chúc mừng trăm năm hạnh phúc!'
    );

    assert.strictEqual(res.error, null);
    assert.ok(res.signature);
    assert.strictEqual(res.signature.guest_name, 'Nguyễn Thị Test');
    assert.strictEqual(res.signature.is_visible, true);
  });

  it('should reject empty guest name', async () => {
    const { SignatureService } = await import('../services/signature.service');
    const res = await SignatureService.submitSignature(
      'inv-demo-01',
      '',
      'Some message'
    );

    assert.ok(res.error);
    assert.strictEqual(res.signature, null);
  });

  it('should reject empty message', async () => {
    const { SignatureService } = await import('../services/signature.service');
    const res = await SignatureService.submitSignature(
      'inv-demo-01',
      'Test Name',
      '   '
    );

    assert.ok(res.error);
    assert.strictEqual(res.signature, null);
  });
});

describe('SignatureService - Visibility', () => {
  it('should toggle signature visibility', async () => {
    const { SignatureService } = await import('../services/signature.service');
    const sigs = await SignatureService.getAllSignatures('inv-demo-01');
    assert.ok(sigs.length > 0);

    const firstSig = sigs[0];
    const originalVis = firstSig.is_visible;

    const toggled = await SignatureService.toggleVisibility(firstSig.id);
    assert.ok(toggled);
    assert.strictEqual(toggled.is_visible, !originalVis);
  });
});
