import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('El correo no tiene un formato válido'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'El nombre es obligatorio')
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(120, 'El nombre es demasiado largo'),
    email: z
      .string()
      .min(1, 'El correo es obligatorio')
      .email('El correo no tiene un formato válido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(128, 'La contraseña es demasiado larga'),
    confirmPassword: z
      .string()
      .min(1, 'Confirmá tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('El correo no tiene un formato válido'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .min(1, 'El correo es obligatorio')
      .email('El correo no tiene un formato válido'),
    code: z
      .string()
      .min(1, 'El código es obligatorio')
      .length(6, 'El código debe tener 6 dígitos'),
    newPassword: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(128, 'La contraseña es demasiado larga'),
    confirmPassword: z
      .string()
      .min(1, 'Confirmá tu nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const verifyEmailSchema = z.object({
  identifier: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('El correo no tiene un formato válido'),
  code: z
    .string()
    .min(1, 'El código es obligatorio')
    .length(6, 'El código debe tener 6 dígitos'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const resendVerificationSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('El correo no tiene un formato válido'),
});

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
