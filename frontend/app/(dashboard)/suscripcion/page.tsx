'use client'

import { useEffect, useState } from 'react';
import { Check, Crown } from 'lucide-react';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import { useSubscriptionStore } from '@/src/shared/store/useSubscriptionStore';
import { SkeletonBase } from '@/src/shared/skeleton';
import styles from './page.module.css';

const freeFeatures = [
  'Cursos gratuitos seleccionados',
  'Certificados de finalización',
  'Comunidad de estudiantes',
  'Foro de preguntas',
];

const proFeatures = [
  'Todos los cursos del catálogo',
  'Certificados profesionales',
  'Proyectos prácticos',
  'Ejercicios con revisión de código',
  'Acceso a workshops en vivo',
  'Sin anuncios',
];

export default function SuscripcionPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { subscription, loading, fetchSubscription, setFreePlan, upgradeToPro, cancelMySubscription, reactivateMySubscription } = useSubscriptionStore();
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchSubscription();
  }, [isAuthenticated, fetchSubscription]);

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelMySubscription();
    } catch {
      // error handled by store
    } finally {
      setCancelling(false);
    }
  }

  async function handleReactivate() {
    try {
      await reactivateMySubscription();
    } catch {
      // error handled by store
    }
  }

  const isFree = subscription?.plan === 'free';
  const isPro = subscription?.plan === 'pro';
  const isCancelled = subscription?.status === 'cancelled';

  // On first render, subscription may be null but loading=false.
  // Show a minimal skeleton to avoid flashing incorrect plan text.
  const isFirstLoad = !subscription && !loading;

  return (
    <div className={styles.page}>
      {loading || isFirstLoad ? (
        <SkeletonBase height={28} width={200} style={{ marginBottom: 32 }} />
      ) : (
        <h1 className={styles.title}>Suscripción</h1>
      )}

      {!loading && isCancelled && (
        <div className={styles.cancelledBanner}>
          Tu suscripción está cancelada. Vas a conservar el acceso hasta el final del período facturado.
        </div>
      )}

      <div className={styles.currentPlan}>
        {loading || isFirstLoad ? (
          <>
            <SkeletonBase width={160} height={28} borderRadius={100} style={{ marginBottom: 12 }} />
            <SkeletonBase width="80%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonBase width="50%" height={16} />
          </>
        ) : (
          <>
            <div className={styles.planBadge}>
              <Crown size={20} />
              <span>Plan actual: {isFree ? 'Gratuito' : 'Pro'}</span>
            </div>
            <p className={styles.planDesc}>
              {isFree
                ? 'Estás disfrutando de nuestros cursos gratuitos. Actualizá a Pro para acceder a todo el catálogo.'
                : 'Tenés acceso completo a todos los cursos y funcionalidades premium.'}
            </p>
          </>
        )}
      </div>

      <div className={styles.plansGrid}>
        <div className={`${styles.planCard} ${!loading && isFree && !isFirstLoad ? styles.planActive : ''}`}>
          {loading || isFirstLoad ? (
            <>
              <SkeletonBase width={80} height={22} style={{ marginBottom: 16 }} />
              <div className={styles.planPrice}>
                <SkeletonBase width={60} height={36} />
              </div>
              <ul className={styles.featureList}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <li key={j} className={styles.featureItem}>
                    <SkeletonBase width={16} height={16} borderRadius={4} style={{ flexShrink: 0 }} />
                    <SkeletonBase style={{ flex: 1, height: 14 }} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <h2 className={styles.planName}>Gratuito</h2>
              <div className={styles.planPrice}>
                <span className={styles.priceAmount}>Gratis</span>
              </div>
              <ul className={styles.featureList}>
                {freeFeatures.map((f) => (
                  <li key={f} className={styles.featureItem}>
                    <Check size={16} className={styles.featureCheck} />
                    {f}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className={`${styles.planCard} ${!loading && isPro && !isFirstLoad ? styles.planActive : ''}`}>
          {loading || isFirstLoad ? (
            <>
              <div className={styles.planHeader}>
                <SkeletonBase width={100} height={22} borderRadius={100} style={{ margin: '0 auto' }} />
              </div>
              <SkeletonBase width={80} height={22} style={{ marginBottom: 16 }} />
              <div className={styles.planPrice}>
                <SkeletonBase width={80} height={36} />
              </div>
              <ul className={styles.featureList}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <li key={j} className={styles.featureItem}>
                    <SkeletonBase width={16} height={16} borderRadius={4} style={{ flexShrink: 0 }} />
                    <SkeletonBase style={{ flex: 1, height: 14 }} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <div className={styles.planHeader}>
                <span className={styles.popularBadge}>Más popular</span>
              </div>
              <h2 className={styles.planName}>Pro</h2>
              <div className={styles.planPrice}>
                <span className={styles.priceAmount}>$10</span>
                <span className={styles.pricePeriod}>/mes</span>
              </div>
              <ul className={styles.featureList}>
                {proFeatures.map((f) => (
                  <li key={f} className={styles.featureItem}>
                    <Check size={16} className={styles.featureCheck} />
                    {f}
                  </li>
                ))}
              </ul>

              {isFree && (
                <button className={styles.upgradeBtn} onClick={upgradeToPro}>
                  Actualizar a Pro
                </button>
              )}

              {isPro && !isCancelled && (
                <button className={styles.cancelBtn} onClick={handleCancel} disabled={cancelling}>
                  {cancelling ? 'Cancelando...' : 'Cancelar suscripción'}
                </button>
              )}

              {isPro && isCancelled && (
                <button className={styles.upgradeBtn} onClick={handleReactivate}>
                  Reactivar suscripción
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
