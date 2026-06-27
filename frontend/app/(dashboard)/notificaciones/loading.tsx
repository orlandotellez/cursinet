import s from '@/src/shared/styles/skeleton.module.css';

export function NotificacionesSkeleton() {
  return (
    <div style={{ margin: 'auto', width: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 24,
          gap: 16,
        }}
      >
        <div>
          <div className={s.base} style={{ height: 28, width: 200, marginBottom: 8 }} />
          <div className={s.base} style={{ height: 16, width: 80, borderRadius: 10 }} />
        </div>
        <div className={s.base} style={{ height: 36, width: 180, borderRadius: 8 }} />
      </div>

      {/* Notification cards list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: 16,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)',
            }}
          >
            {/* Icon */}
            <div className={s.base} style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
            {/* Body */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className={s.base} style={{ height: 15, width: '60%', marginBottom: 6 }} />
              <div className={s.base} style={{ height: 13, width: '90%', marginBottom: 4 }} />
              <div className={s.base} style={{ height: 12, width: 80 }} />
            </div>
            {/* Link */}
            <div className={s.base} style={{ width: 40, height: 20, borderRadius: 4, flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return <NotificacionesSkeleton />;
}
