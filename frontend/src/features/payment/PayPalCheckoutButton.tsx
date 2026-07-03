'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PayPalProvider,
  PayPalOneTimePaymentButton,
  PayPalGuestPaymentButton,
  usePayPal,
  INSTANCE_LOADING_STATE,
} from '@paypal/react-paypal-js/sdk-v6';
import { Spinner } from '@/src/shared/components/Spinner';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { createPayment, confirmPayment } from '@/src/shared/api/billing';
import { useEnrollmentStore } from '@/src/shared/store/useEnrollmentStore';
import styles from './PayPalCheckoutButton.module.css';

// ─── Props ─────────────────────────────────────────────────────────────────

interface PayPalCheckoutButtonProps {
  courseId: string;
  slug: string;
  amount: number;
  currency?: string;
  /** Si es true, muestra el botón de PayPal real. Si false, muestra un botón de prueba. */
  enabled: boolean;
}

// ─── Inner: botón que consume el contexto PayPal ───────────────────────────

function PayPalButtonInner({
  courseId,
  slug,
  firstLessonHref,
}: {
  courseId: string;
  slug: string;
  firstLessonHref: string;
}) {
  const router = useRouter();
  const { loadingStatus, error: sdkError } = usePayPal();
  const [status, setStatus] = useState<
    'idle' | 'creating' | 'approving' | 'success' | 'error'
  >('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Guardamos el paymentId entre createOrder y onApprove
  const paymentIdRef = useRef<string | null>(null);

  const handleCreateOrder = useCallback(async () => {
    setStatus('creating');
    setErrorMsg(null);

    const returnUrl = `${window.location.origin}/checkout/${slug}`;
    const cancelUrl = `${window.location.origin}/checkout/${slug}`;

    const payment = await createPayment({
      courseId,
      returnUrl,
      cancelUrl,
    });

    // Guardamos el paymentId para usarlo en onApprove
    paymentIdRef.current = payment.paymentId;

    return { orderId: payment.payPalOrderId };
  }, [courseId, slug]);

  const handleApprove = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (_data: { orderId: string }) => {
      setStatus('approving');
      setErrorMsg(null);

      try {
        const paymentId = paymentIdRef.current;
        if (!paymentId) {
          throw new Error('No se encontró el ID del pago');
        }

        await confirmPayment({
          paymentId,
          payPalOrderId: _data.orderId,
        });

        // Actualizamos el store local (el backend ya creó el enrollment)
        useEnrollmentStore.setState((state) => ({
          enrolledCourseIds: state.enrolledCourseIds.includes(courseId)
            ? state.enrolledCourseIds
            : [...state.enrolledCourseIds, courseId],
        }));

        setStatus('success');
        setTimeout(() => router.push(firstLessonHref), 1500);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Error al confirmar el pago';
        setErrorMsg(msg);
        setStatus('error');
      }
    },
    [courseId, router, firstLessonHref],
  );

  const handleCancel = useCallback(() => {
    paymentIdRef.current = null;
    setStatus('idle');
  }, []);

  const handleError = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_data: { message?: string }) => {
      setErrorMsg(_data.message ?? 'Error en el pago');
      setStatus('error');
    },
    [],
  );

  // ── SDK loading ──

  if (loadingStatus === INSTANCE_LOADING_STATE.PENDING) {
    return (
      <div className={styles.sdkLoading}>
        <Spinner size="lg" />
        <p className={styles.sdkLoadingText}>Cargando PayPal...</p>
      </div>
    );
  }

  if (loadingStatus === INSTANCE_LOADING_STATE.REJECTED) {
    return (
      <div className={styles.stateCardDanger}>
        <AlertCircle size={32} className={styles.stateIconDanger} />
        <p className={styles.stateTitleDanger}>
          No se pudo cargar PayPal
        </p>
        <p className={styles.stateSubtext}>
          {sdkError?.message ??
            'Verificá la conexión o la configuración del Client ID'}
        </p>
      </div>
    );
  }

  // ── Success ──

  if (status === 'success') {
    return (
      <div className={styles.stateCardSuccess}>
        <CheckCircle2 size={40} className={styles.stateIconSuccess} />
        <p className={styles.stateTitleSuccess}>¡Pago exitoso!</p>
        <p className={styles.stateSubtext}>
          Redirigiendo al curso...
        </p>
      </div>
    );
  }

  // ── Error ──

  if (status === 'error') {
    return (
      <div className={styles.stateCardDanger}>
        <AlertCircle size={32} className={styles.stateIconDanger} />
        <p className={styles.stateTitleDanger}>
          {errorMsg || 'Error al procesar el pago'}
        </p>
        <button
          onClick={() => {
            paymentIdRef.current = null;
            setStatus('idle');
          }}
          className={styles.retryBtn}
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  // ── Idle: PayPal + Guest card buttons ──

  return (
    <div className={styles.paymentButtons}>
      <PayPalOneTimePaymentButton
        createOrder={handleCreateOrder}
        onApprove={handleApprove}
        onCancel={handleCancel}
        onError={handleError}
        type="pay"
        className={styles.paypalButton}
      />

      <div className={styles.divider}>
        <span className={styles.dividerText}>O paga con tarjeta</span>
      </div>

      <div className={styles.guestButton}>
        <PayPalGuestPaymentButton
          createOrder={handleCreateOrder}
          onApprove={handleApprove}
          onCancel={handleCancel}
          onError={handleError}
        />
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────

const PAYPAL_CLIENT_ID =
  (typeof process !== 'undefined' &&
    (process.env as Record<string, string | undefined>)
      .NEXT_PUBLIC_PAYPAL_CLIENT_ID) ||
  '';

export function PayPalCheckoutButton(props: PayPalCheckoutButtonProps) {
  const { courseId, slug, firstLessonHref } = {
    ...props,
    firstLessonHref: `/aprender/${props.courseId}`,
  };

  const clientIdPromise = useMemo(() => Promise.resolve(PAYPAL_CLIENT_ID), []);

  return (
    <PayPalProvider
      clientId={clientIdPromise}
      environment="sandbox"
      components={['paypal-payments', 'paypal-guest-payments']}
      pageType="checkout"
    >
      <PayPalButtonInner
        courseId={courseId}
        slug={slug}
        firstLessonHref={firstLessonHref}
      />
    </PayPalProvider>
  );
}
