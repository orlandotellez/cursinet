'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import styles from './page.module.css';

const PLANS = [
  {
    name: 'Gratuito',
    description: 'Accedé a cursos seleccionados sin costo',
    price: 'Gratis',
    period: '',
    features: [
      'Cursos gratuitos seleccionados',
      'Certificados de finalización',
      'Comunidad de estudiantes',
    ],
    cta: 'Comenzar gratis',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'Todo el catálogo, un solo precio',
    price: '$10',
    period: '/mes',
    features: [
      'Todos los cursos del catálogo',
      'Certificados de finalización',
    ],
    cta: 'Suscribirme',
    href: '/register',
    highlighted: true,
  },
];

export default function PreciosPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <span className={styles.badge}>Planes flexibles</span>
        <h1 className={styles.title}>Elegí el plan ideal para vos</h1>
        <p className={styles.subtitle}>
          Empezá gratis y actualizá cuando quieras. Sin compromisos.
        </p>
      </section>

      {/* Plans grid */}
      <section className={styles.grid}>
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`${styles.card} ${plan.highlighted ? styles.cardHighlighted : ''}`}
          >
            {plan.highlighted && (
              <span className={styles.popularBadge}>Más popular</span>
            )}

            <div className={styles.cardBody}>
              <h2 className={styles.planName}>{plan.name}</h2>
              <p className={styles.planDesc}>{plan.description}</p>

              <div className={styles.priceRow}>
                <span className={styles.price}>{plan.price}</span>
                {plan.period && (
                  <span className={styles.period}>{plan.period}</span>
                )}
              </div>

              <Link
                href={isAuthenticated ? '/suscripcion' : plan.href}
                className={`${styles.cta} ${plan.highlighted ? styles.ctaPrimary : styles.ctaSecondary}`}
              >
                {plan.cta}
              </Link>
            </div>

            <div className={styles.featuresSection}>
              <h3 className={styles.featuresTitle}>Incluye:</h3>
              <ul className={styles.featureList}>
                {plan.features.map((feature) => (
                  <li key={feature} className={styles.featureItem}>
                    <span className={styles.featureIcon}>
                      <Check size={14} />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      {/* FAQ section */}
      <section className={styles.faq}>
        <h2 className={styles.faqTitle}>Preguntas frecuentes</h2>
        <div className={styles.faqGrid}>
          <div className={styles.faqItem}>
            <h4>¿Puedo cancelar cuando quiera?</h4>
            <p>Sí, sin multas ni cargos adicionales. Cancelás y seguís teniendo acceso hasta el final del período facturado.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué métodos de pago aceptan?</h4>
            <p>Aceptamos tarjetas de crédito, débito y PayPal. Todos los pagos son procesados de forma segura.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Hay período de prueba?</h4>
            <p>Podés empezar con el plan Gratuito sin límite de tiempo y actualizar a Pro cuando quieras.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Puedo acceder desde cualquier dispositivo?</h4>
            <p>Sí, desde cualquier navegador web. No necesitás instalar nada.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
