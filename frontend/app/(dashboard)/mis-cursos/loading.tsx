import s from '@/src/shared/styles/skeleton.module.css';

export function MisCursosSkeleton() {
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

      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
        }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={s.base} style={{ height: 36, width: 110, borderRadius: 8 }} />
        ))}
      </div>

      {/* Course cards grid */}
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
            }}
          >
            {/* Thumbnail */}
            <div className={s.base} style={{ width: '100%', aspectRatio: '16 / 9', borderRadius: 0 }} />
            {/* Body */}
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Meta row: category + level */}
              <div style={{ display: 'flex', gap: 8 }}>
                <div className={s.base} style={{ height: 20, width: 80, borderRadius: 4 }} />
                <div className={s.base} style={{ height: 20, width: 90, borderRadius: 4 }} />
              </div>
              {/* Title */}
              <div className={s.base} style={{ height: 18, width: '85%' }} />
              {/* Instructor */}
              <div className={s.base} style={{ height: 14, width: '50%' }} />
              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <div className={s.base} style={{ flex: 1, height: 6, borderRadius: 3 }} />
                <div className={s.base} style={{ width: 60, height: 14 }} />
              </div>
              {/* Button */}
              <div className={s.base} style={{ height: 36, width: 120, borderRadius: 8, marginTop: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return <MisCursosSkeleton />;
}
