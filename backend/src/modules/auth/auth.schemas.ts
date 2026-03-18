import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  login: z.string().min(3).max(100),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
