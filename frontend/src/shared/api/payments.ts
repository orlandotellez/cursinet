import { API_URL } from '../lib/constants';
import { authedFetch } from '../lib/api';
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  ConfirmPaymentRequest,
  PaymentResponse,
} from '../types/payment.types';
import { validateOrThrow } from '../lib/validation';
import { createPaymentSchema, confirmPaymentSchema } from '../validations';
import { handleJsonResponse } from './helpers';

export async function createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
  validateOrThrow(createPaymentSchema, data);
  const res = await authedFetch(`${API_URL}/payments/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleJsonResponse<CreatePaymentResponse>(res);
}

export async function confirmPayment(data: ConfirmPaymentRequest): Promise<PaymentResponse> {
  validateOrThrow(confirmPaymentSchema, data);
  const res = await authedFetch(`${API_URL}/payments/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleJsonResponse<PaymentResponse>(res);
}

export async function getMyPayments(): Promise<PaymentResponse[]> {
  const res = await authedFetch(`${API_URL}/payments/mine`);
  return handleJsonResponse<PaymentResponse[]>(res);
}
