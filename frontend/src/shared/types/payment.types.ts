export interface CreatePaymentRequest {
  courseId: string;
  /** URL a la que PayPal redirige después de aprobar el pago */
  returnUrl?: string;
  /** URL a la que PayPal redirige si el usuario cancela */
  cancelUrl?: string;
}

export interface CreatePaymentResponse {
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  /** PayPal Order ID devuelto por la API Orders v2 */
  payPalOrderId: string;
  /** URL de aprobación para flujos basados en redirect */
  approvalUrl?: string;
}

export interface ConfirmPaymentRequest {
  paymentId: string;
  /** PayPal Order ID opcional (eco). El server ya lo tiene del Payment record. */
  payPalOrderId?: string;
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
  refundedAt?: string;
  createdAt: string;
  payPalOrderId?: string;
  payPalCaptureId?: string;
}
