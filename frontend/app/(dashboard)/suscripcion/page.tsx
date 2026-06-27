'use client'

import { useEffect, useState } from 'react';
import { Check, Crown } from 'lucide-react';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import { useSubscriptionStore } from '@/src/shared/store/useSubscriptionStore';
import s from '@/src/shared/styles/skeleton.module.css';
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
  const { subscription, setFreePlan, upgradeToPro, cancelSubscription } = useSubscriptionStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!subscription) setFreePlan();
    setReady(true);
  }, [isAuthenticated, subscription, setFreePlan]);

  if (!ready) {
    return <SuscripcionSkeleton />;
  }

  const isFree = subscription?.plan === 'free';
  const isPro = subscription?.plan === 'pro';
  const isCancelled = subscription?.status === 'cancelled';

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Suscripción</h1>

      {isCancelled && (
        <div className={styles.cancelledBanner}>
          Tu suscripción está cancelada. Vas a conservar el acceso hasta el final del período facturado.
        </div>
      )}

      <div className={styles.currentPlan}>
        <div className={styles.planBadge}>
          <Crown size={20} />
          <span>Plan actual: {isFree ? 'Gratuito' : 'Pro'}</span>
        </div>
        <p className={styles.planDesc}>
          {isFree
            ? 'Estás disfrutando de nuestros cursos gratuitos. Actualizá a Pro para acceder a todo el catálogo.'
            : 'Tenés acceso completo a todos los cursos y funcionalidades premium.'}
        </p>
      </div>

      <div className={styles.plansGrid}>
        <div className={`${styles.planCard} ${isFree ? styles.planActive : ''}`}>
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
        </div>

        <div className={`${styles.planCard} ${isPro ? styles.planActive : ''}`}>
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
            <button className={styles.cancelBtn} onClick={cancelSubscription}>
              Cancelar suscripción
            </button>
          )}

          {isPro && isCancelled && (
            <button className={styles.upgradeBtn} onClick={upgradeToPro}>
              Reactivar suscripción
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SuscripcionSkeleton() {
  return (
    <div className={styles.page}>
      <div className={s.base} style={{ height: 28, width: 200, marginBottom: 32 }} />

      {/* Current plan skeleton */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-card)',
          padding: 24,
          marginBottom: 32,
        }}
      >
        <div className={s.base} style={{ width: 160, height: 28, borderRadius: 100, marginBottom: 12 }} />
        <div className={s.base} style={{ width: '80%', height: 16, marginBottom: 8 }} />
        <div className={s.base} style={{ width: '50%', height: 16 }} />
      </div>

      {/* Plans grid skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)',
              padding: 28,
            }}
          >
            <div className={s.base} style={{ width: 80, height: 22, marginBottom: 16 }} />
            <div className={s.base} style={{ width: 60, height: 36, marginBottom: 24 }} />
            {Array.from({ length: 4 }).map((_, j) => (
              <div
                key={j}
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}
              >
                <div className={s.base} style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0 }} />
                <div className={s.base} style={{ flex: 1, height: 14 }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
