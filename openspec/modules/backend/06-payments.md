# Stripe Payments ⏳ Planned

Sistema de pagos con Stripe — aún no implementado.

## Status

**⏳ Planned / Future feature.** No hay código de payments en el backend actual.

La entidad `PaymentStatus` enum existe en Domain (`Pending, Completed, Failed, Refunded`) y `SubcriptionPlan` enum (`Monthly, Annual, Lifetime`) como preparación, pero no hay servicios, endpoints ni lógica de Stripe implementados.

## Cuando se implemente

### One-time Purchase
1. Frontend: POST `/payments/checkout/course {courseId}`
2. Backend: create Stripe Checkout Session (mode: payment)
3. Redirect to Stripe checkout
4. On success: Stripe webhook → verify signature → create Enrollment + Payment

### Webhook Security
- Verify Stripe-Signature header with signing secret
- Process idempotently (check PaymentIntentId)

### Plans
| Plan | Price |
|------|-------|
| MONTHLY | $19/month |
| ANNUAL | $149/year |
| LIFETIME | $399 one-time |
