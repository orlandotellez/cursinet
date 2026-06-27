import s from '@/src/shared/styles/skeleton.module.css';

export function FavoritosSkeleton() {
  return (
    <div style={{ margin: 'auto', width: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div className={s.base} style={{ height: 28, width: 140 }} />
        <div className={s.base} style={{ height: 14, width: 80 }} />
      </div>

      {/* Favorites grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Heart button skeleton */}
            <div
              className={s.base}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 32,
                height: 32,
                borderRadius: 8,
                zIndex: 1,
              }}
            />
            {/* Thumbnail */}
            <div className={s.base} style={{ width: '100%', aspectRatio: '16 / 9', borderRadius: 0 }} />
            {/* Body */}
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Meta: category + level */}
              <div style={{ display: 'flex', gap: 8 }}>
                <div className={s.base} style={{ height: 20, width: 80, borderRadius: 4 }} />
                <div className={s.base} style={{ height: 20, width: 90, borderRadius: 4 }} />
              </div>
              {/* Title */}
              <div className={s.base} style={{ height: 18, width: '85%' }} />
              {/* Description */}
              <div className={s.base} style={{ height: 14, width: '100%' }} />
              {/* Stats row */}
              <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div className={s.base} style={{ width: 14, height: 14, borderRadius: 3 }} />
                    <div className={s.base} style={{ width: 30, height: 12 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return <FavoritosSkeleton />;
}
