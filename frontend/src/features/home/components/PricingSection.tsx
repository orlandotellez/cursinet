'use client';

import { Check } from "lucide-react";
import styles from "./PricingSection.module.css"
import Link from "next/link";
import { PricingPlan } from "@/src/shared/types";
import { useAuthStore } from "@/src/shared/store/useAuthStore";
import { useSubscriptionStore } from "@/src/shared/store/useSubscriptionStore";

interface PricingSecitonProps {
  pricingPlans: PricingPlan[]
}

export const PricingSection = ({ pricingPlans }: PricingSecitonProps) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const subscription = useSubscriptionStore((s) => s.subscription);

  function getCta(plan: PricingPlan) {
    if (!isAuthenticated) return { text: plan.cta, href: '/register' };

    if (plan.price === 0) {
      return { text: 'Tu suscripción actual', href: '/suscripcion' };
    }

    if (subscription?.plan === 'pro') {
      return { text: 'Tu suscripción actual', href: '/suscripcion' };
    }

    return { text: 'Actualizar a Pro', href: '/suscripcion' };
  }

  return (
    <section className={styles.section} id="pricing">
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Precios simples</h2>
          <p className={styles.sectionSubtitle}>
            Elige el plan que mejor se adapte a tu aprendizaje
          </p>
        </div>
        <div className={styles.pricingGrid}>
          {pricingPlans.map((plan) => {
            const cta = getCta(plan);
            return (
              <div
                key={plan.name}
                className={`${styles.pricingCard} ${plan.highlighted ? styles.pricingHighlighted : ''}`}
              >
                {plan.highlighted && (
                  <span className={styles.pricingPopular}>Más popular</span>
                )}
                <div className={styles.pricingHeader}>
                  <h3 className={styles.pricingName}>{plan.name}</h3>
                  <p className={styles.pricingDesc}>{plan.description}</p>
                </div>
                <div className={styles.pricingPrice}>
                  <span className={styles.pricingAmount}>
                    {plan.price === 0 ? 'Gratis' : `$${plan.price}`}
                  </span>
                  <span className={styles.pricingPeriod}>{plan.period}</span>
                </div>
                <ul className={styles.pricingFeatures}>
                  {plan.features.map((feature) => (
                    <li key={feature} className={styles.pricingFeature}>
                      <Check size={16} className={styles.pricingCheck} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={cta.href}
                  className={`${styles.pricingCta} ${plan.highlighted ? styles.pricingCtaPrimary : styles.pricingCtaSecondary}`}
                >
                  {cta.text}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


