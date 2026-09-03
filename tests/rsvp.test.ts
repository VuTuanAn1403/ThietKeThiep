import assert from 'node:assert';
import test from 'node:test';
import { RSVPService } from '../services/rsvp.service';

test('RSVPService - Valid ATTENDING response', async () => {
  const res = await RSVPService.submitRSVP('gst-01', {
    attendance: 'ATTENDING',
    guest_count: 2,
    note: 'Sẽ có mặt đúng giờ!',
  });

  assert.strictEqual(res.error, null);
  assert.strictEqual(res.rsvp?.attendance, 'ATTENDING');
  assert.strictEqual(res.rsvp?.guest_count, 2);
});

test('RSVPService - Exceed max guests limit', async () => {
  // gst-01 has max_guests = 2
  const res = await RSVPService.submitRSVP('gst-01', {
    attendance: 'ATTENDING',
    guest_count: 10, // exceeds max_guests
  });

  assert.notStrictEqual(res.error, null);
});

test('RSVPService - NOT_ATTENDING forces guest_count = 0', async () => {
  const res = await RSVPService.submitRSVP('gst-02', {
    attendance: 'NOT_ATTENDING',
    guest_count: 3,
  });

  assert.strictEqual(res.error, null);
  assert.strictEqual(res.rsvp?.guest_count, 0);
});
