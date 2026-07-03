import { getFeaturedCourses, getPublicCategories, getLandingStats } from '@/src/shared/api/public';
import { CategoriesGrid } from '@/src/features/home/components/CategoriesGrid';
import { FeaturedCourses } from '@/src/features/home/components/FeaturedCourses';
import { FinalCta } from '@/src/features/home/components/FinalCta';
import { HeroSection } from '@/src/features/home/components/Hero';
import { StatsBar } from '@/src/features/home/components/StatsBar';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featured, categories, stats] = await Promise.all([
    getFeaturedCourses(),
    getPublicCategories(),
    getLandingStats(),
  ]);

  return (
    <>
      <HeroSection />
      <StatsBar stats={stats} />
      {featured.length > 0 && <FeaturedCourses featuredCourses={featured} />}
      {categories.length > 0 && <CategoriesGrid categories={categories} />}
      <FinalCta />
    </>
  );
}
