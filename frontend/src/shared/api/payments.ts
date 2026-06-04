import { API_URL } from '../lib/constants';
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  ConfirmPaymentRequest,
  PaymentResponse,
} from '../types/payment.types';

export async function createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
  const res = await fetch(`${API_URL}/payments/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al crear pago' }));
    throw new Error(error.message || 'Error al crear pago');
  }

  return res.json();
}

export async function confirmPayment(data: ConfirmPaymentRequest): Promise<PaymentResponse> {
  const res = await fetch(`${API_URL}/payments/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al confirmar pago' }));
    throw new Error(error.message || 'Error al confirmar pago');
  }

  return res.json();
}

export async function getMyPayments(): Promise<PaymentResponse[]> {
  const res = await fetch(`${API_URL}/payments/mine`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al obtener pagos' }));
    throw new Error(error.message || 'Error al obtener pagos');
  }

  return res.json();
}
