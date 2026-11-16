import { z } from 'zod';

export const userRoleEnumValues = [
    'super_admin',
    'admin',
    'manager',
    'engineer',
    'production_staff',
    'store_manager',
    'accountant',
    'quality_inspector',
    'hr',
] as const;

export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerUserSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    fullName: z.string().min(2, 'Full name is required'),
    phone: z.string().optional(),
    role: z.enum(userRoleEnumValues).default('production_staff'),
    departmentId: z.string().uuid().optional(),
});

export const updateUserRoleSchema = z.object({
    userId: z.string().uuid(),
    role: z.enum(userRoleEnumValues),
});

export const updateProfileSchema = z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().optional(),
    avatarUrl: z.string().url().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

