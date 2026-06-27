import s from '@/src/shared/styles/skeleton.module.css';

export function DashboardSkeleton() {
  return (
    <div style={{ margin: 'auto', width: '100%' }}>
      {/* Header: greeting + subtitle + button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 32,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1 }}>
          <div className={s.base} style={{ height: 28, width: 260, marginBottom: 8 }} />
          <div className={s.base} style={{ height: 16, width: 200 }} />
        </div>
        <div className={s.base} style={{ height: 36, width: 140, borderRadius: 8 }} />
      </div>

      {/* Stats Cards section */}
      <div style={{ marginBottom: 32 }}>
        <div className={s.base} style={{ height: 18, width: 120, marginBottom: 16 }} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={s.base}
              style={{
                height: 140,
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <div className={s.base} style={{ width: 40, height: 40, borderRadius: 8 }} />
              <div className={s.base} style={{ width: 48, height: 24, borderRadius: 4 }} />
              <div className={s.base} style={{ width: 80, height: 12, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Continue Learning section */}
      <div style={{ marginBottom: 32 }}>
        <div className={s.base} style={{ height: 18, width: 200, marginBottom: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 16,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-card)',
              }}
            >
              <div className={s.base} style={{ width: 48, height: 48, borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={s.base} style={{ height: 16, width: '70%', marginBottom: 10 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className={s.base} style={{ flex: 1, height: 6, borderRadius: 3 }} />
                  <div className={s.base} style={{ width: 36, height: 14 }} />
                </div>
              </div>
              <div className={s.base} style={{ width: 18, height: 18, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Certificates section */}
      <div>
        <div className={s.base} style={{ height: 18, width: 200, marginBottom: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: 16,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className={s.base} style={{ width: 40, height: 40, borderRadius: 8 }} />
                <div>
                  <div className={s.base} style={{ height: 16, width: 200, marginBottom: 6 }} />
                  <div className={s.base} style={{ height: 12, width: 140 }} />
                </div>
              </div>
              <div className={s.base} style={{ width: 36, height: 36, borderRadius: 8 }} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default function Loading() {
  return <DashboardSkeleton />;
}
