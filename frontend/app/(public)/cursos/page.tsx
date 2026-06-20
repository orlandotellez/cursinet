import { getPublishedCourses, getPublicCategories } from '@/src/shared/api/public-data';
import { CatalogClient } from './CatalogClient';

export const revalidate = 300;

export default async function CatalogPage() {
  const [allCards, categories] = await Promise.all([
    getPublishedCourses(),
    getPublicCategories(),
  ]);

  return <CatalogClient allCards={allCards} categories={categories} />;
}
