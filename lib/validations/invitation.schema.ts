import { z } from 'zod';

export const invitationSchema = z.object({
  title: z.string().min(2, { message: 'Tên thiệp tối thiểu 2 ký tự' }),
  slug: z
    .string()
    .min(2, { message: 'Slug tối thiểu 2 ký tự' })
    .regex(/^[a-z0-9-]+$/, { message: 'Slug chỉ bao gồm chữ cái thường, số và dấu gạch ngang' }),
  coverTitle: z.string().optional(),
  hostName: z.string().optional(),
  description: z.string().optional(),
  eventDate: z.string().min(1, { message: 'Vui lòng chọn ngày diễn ra sự kiện' }),
  eventStartTime: z.string().optional(),
  eventEndTime: z.string().optional(),
  venueName: z.string().min(2, { message: 'Tên địa điểm không được để trống' }),
  venueAddress: z.string().min(3, { message: 'Địa chỉ địa điểm không được để trống' }),
  mapUrl: z.string().url({ message: 'URL bản đồ không hợp lệ' }).optional().or(z.literal('')),
  primaryColor: z.string().default('#B76E79'),
  secondaryColor: z.string().default('#8FA79B'),
  headingFont: z.string().default('Cormorant Garamond'),
  bodyFont: z.string().default('Montserrat'),
  musicUrl: z.string().optional().nullable(),
});

export type InvitationInput = z.infer<typeof invitationSchema>;
