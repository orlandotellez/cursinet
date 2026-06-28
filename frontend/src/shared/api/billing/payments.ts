import { api } from '../lib/client';
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  ConfirmPaymentRequest,
  PaymentResponse,
} from '@/src/shared/types';
import { validateOrThrow } from '@/src/shared/lib/validation';
import { createPaymentSchema, confirmPaymentSchema } from '@/src/shared/validations';

export async function createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
  validateOrThrow(createPaymentSchema, data);
  return api.post<CreatePaymentResponse>('/payments/create', data);
}

export async function confirmPayment(data: ConfirmPaymentRequest): Promise<PaymentResponse> {
  validateOrThrow(confirmPaymentSchema, data);
  return api.post<PaymentResponse>('/payments/confirm', data);
}

export async function getMyPayments(): Promise<PaymentResponse[]> {
  return api.get<PaymentResponse[]>('/payments/mine');
}
