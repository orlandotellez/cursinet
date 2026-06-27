import { Suspense } from 'react';
import s from '@/src/shared/styles/skeleton.module.css';
import { getPublishedCourses, getPublicCategories } from '@/src/shared/api/public-data';
import { CatalogClient } from './CatalogClient';

export const revalidate = 300;

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogDataFetcher />
    </Suspense>
  );
}

async function CatalogDataFetcher() {
  const [allCards, categories] = await Promise.all([
    getPublishedCourses(),
    getPublicCategories(),
  ]);
  return <CatalogClient allCards={allCards} categories={categories} />;
}

function CatalogSkeleton() {
  return (
    <div className="catalogSkeletonPage">
      <div className="catalogSkeletonContainer">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div className={s.base} style={{ width: 42, height: 14 }} />
          <div className={s.base} style={{ width: 10, height: 14 }} />
        </div>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div className={s.base} style={{ height: 28, width: 260, marginBottom: 8 }} />
          <div className={s.base} style={{ height: 14, width: 140 }} />
        </div>

        {/* Category ribbon */}
        <div style={{ marginBottom: 24 }}>
          <div className={s.base} style={{ height: 12, width: 70, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            {[60, 90, 110, 75, 100].map((w, i) => (
              <div key={i} className={s.base} style={{ height: 34, width: w, borderRadius: 5 }} />
            ))}
          </div>
        </div>

        {/* Sub-toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
          <div className={s.base} style={{ flex: 1, minWidth: 200, height: 38, borderRadius: 6 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {[62, 88, 88, 88].map((w, i) => (
              <div key={i} className={s.base} style={{ height: 34, width: w, borderRadius: 5 }} />
            ))}
          </div>
        </div>

        {/* Course grid */}
        <div className="catalogSkeletonGrid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="catalogSkeletonCard">
              <div className={s.base} style={{ aspectRatio: '16 / 9', width: '100%', borderRadius: 0 }} />
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className={s.base} style={{ width: 60, height: 14 }} />
                  <div className={s.base} style={{ width: 52, height: 14 }} />
                </div>
                <div className={s.base} style={{ height: 16, width: '85%' }} />
                <div className={s.base} style={{ height: 16, width: '60%' }} />
                <div className={s.base} style={{ height: 12, width: '100%' }} />
                <div className={s.base} style={{ height: 12, width: '75%' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className={s.base} style={{ width: 24, height: 24, borderRadius: '50%' }} />
                  <div className={s.base} style={{ width: 120, height: 13 }} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className={s.base} style={{ width: 52, height: 12 }} />
                  ))}
                </div>
                <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div className={s.base} style={{ width: 50, height: 20 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .catalogSkeletonPage {
          padding: 100px 24px 80px;
        }
        .catalogSkeletonContainer {
          max-width: 1280px;
          margin: 0 auto;
        }
        .catalogSkeletonGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .catalogSkeletonCard {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-card);
          overflow: hidden;
        }
        @media (min-width: 640px) {
          .catalogSkeletonGrid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .catalogSkeletonGrid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
