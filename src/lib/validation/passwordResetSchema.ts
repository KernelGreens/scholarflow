import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().email('A valid email address is required.'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required.').max(200, 'Reset token is too long.'),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128, 'Password must be at most 128 characters.'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
