'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { getCourses } from '@/src/shared/api/courses';
import { getCategories } from '@/src/shared/api/categories';
import { coursesToCards, categoriesToMock, landingStats } from '@/src/shared/api/mappers';
import { pricingPlans } from '@/src/features/courses/data';
import { CategoriesGrid } from '@/src/features/home/components/CategoriesGrid';
import { FeaturedCourses } from '@/src/features/home/components/FeaturedCourses';
import { FinalCta } from '@/src/features/home/components/FinalCta';
import { HeroSection } from '@/src/features/home/components/Hero';
import { PricingSection } from '@/src/features/home/components/PricingSection';
import { StatsBar } from '@/src/features/home/components/StatsBar';
import styles from './page.module.css';

export default function HomePage() {
  const [featured, setFeatured] = useState<ReturnType<typeof coursesToCards>>([]);
  const [categories, setCategories] = useState<ReturnType<typeof categoriesToMock>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [coursesData, categoriesData] = await Promise.all([
          getCourses({ isFeatured: true, isPublished: true }),
          getCategories(),
        ]);
        setFeatured(coursesToCards(coursesData));
        setCategories(categoriesToMock(categoriesData));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al cargar datos';
        console.error('Landing page fetch error:', msg);
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.loadingIcon} />
      </div>
    );
  }

  return (
    <>
      <HeroSection />
      <StatsBar stats={landingStats} />
      {error ? (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      ) : (
        <FeaturedCourses featuredCourses={featured} />
      )}
      <CategoriesGrid categories={categories} />
      <PricingSection pricingPlans={pricingPlans} />
      <FinalCta />
    </>
  );
}
