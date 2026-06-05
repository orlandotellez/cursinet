export interface CreatePaymentRequest {
  courseId: string;
}

export interface CreatePaymentResponse {
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
}

export interface ConfirmPaymentRequest {
  paymentId: string;
  stripePaymentIntentId?: string;
}

export interface PaymentResponse {
  id: string;
  userId: string;
  courseId?: string;
  courseTitle?: string;
  amount: number;
  currency: string;
  status: string;
  type?: string;
  paidAt?: string;
  createdAt: string;
}
