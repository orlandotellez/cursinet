'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, X, Shield } from 'lucide-react';
import { Spinner } from '@/src/shared/components/Spinner';
import { createPayment, confirmPayment } from '@/src/shared/api/payments';
import styles from './PaymentModal.module.css';

interface PaymentModalProps {
  courseId: string;
  courseTitle: string;
  price: number;
  onSuccess: () => void;
  onClose: () => void;
}

export function PaymentModal({ courseId, courseTitle, price, onSuccess, onClose }: PaymentModalProps) {
  const [step, setStep] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setStep('processing');
    setError(null);

    try {
      const payment = await createPayment({ courseId });

      await confirmPayment({ paymentId: payment.paymentId });

      setStep('success');
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al procesar el pago';
      setError(msg);
      setStep('error');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
          <X size={20} />
        </button>

        <div className={styles.header}>
          <Shield size={32} className={styles.shieldIcon} />
          <h2 className={styles.title}>Confirmar inscripción</h2>
        </div>

        {step === 'confirm' && (
          <div className={styles.body}>
            <p className={styles.courseName}>{courseTitle}</p>
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Total:</span>
              <span className={styles.priceAmount}>${price.toFixed(2)} USD</span>
            </div>
            <p className={styles.hint}>
              Este es un entorno de desarrollo — el pago se simulará sin cargo real.
            </p>
            <button className={styles.payBtn} onClick={handlePay}>
              Pagar ${price.toFixed(2)} e inscribirme
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className={styles.body}>
            <div className={styles.centerState}>
              <Spinner size="lg" className={styles.spinner} />
              <p>Procesando pago...</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className={styles.body}>
            <div className={styles.centerState}>
              <CheckCircle2 size={40} className={styles.successIcon} />
              <p className={styles.successText}>¡Pago exitoso! Redirigiendo...</p>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className={styles.body}>
            <div className={styles.centerState}>
              <AlertCircle size={32} className={styles.errorIcon} />
              <p className={styles.errorText}>{error || 'Error al procesar el pago'}</p>
              <button className={styles.retryBtn} onClick={handlePay}>
                Intentar de nuevo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
