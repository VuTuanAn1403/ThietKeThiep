import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(6, { message: 'Mật khẩu tối thiểu 6 ký tự' }),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, { message: 'Họ tên tối thiểu 2 ký tự' }),
    email: z.string().email({ message: 'Email không hợp lệ' }),
    password: z.string().min(6, { message: 'Mật khẩu tối thiểu 6 ký tự' }),
    confirmPassword: z.string().min(6, { message: 'Xác nhận mật khẩu tối thiểu 6 ký tự' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
