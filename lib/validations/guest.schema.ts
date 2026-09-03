import { z } from 'zod';

export const guestSchema = z.object({
  name: z.string().min(2, { message: 'Tên khách mời tối thiểu 2 ký tự' }),
  slug: z.string().optional(),
  phone: z.string().optional().nullable(),
  email: z.string().email({ message: 'Email không hợp lệ' }).optional().or(z.literal('')).nullable(),
  groupName: z.string().default('Khách mời'),
  maxGuests: z.number().min(1, { message: 'Số khách tối đa ít nhất là 1' }).default(1),
});

export type GuestInput = z.infer<typeof guestSchema>;
