import { z } from 'zod';

export const createPaymentSchema = z.object({
  courseId: z.string().min(1, 'El curso es obligatorio'),
  returnUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const confirmPaymentSchema = z.object({
  paymentId: z.string().min(1, 'El pago es obligatorio'),
  payPalOrderId: z.string().optional(),
});

export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
