import s from '@/src/shared/styles/skeleton.module.css';

export function CertificadosSkeleton() {
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
        <div className={s.base} style={{ height: 28, width: 160 }} />
        <div className={s.base} style={{ height: 14, width: 100 }} />
      </div>

      {/* Certificate cards list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 20,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Award icon */}
              <div className={s.base} style={{ width: 48, height: 48, borderRadius: 12 }} />
              <div>
                <div className={s.base} style={{ height: 18, width: 240, marginBottom: 8 }} />
                <div className={s.base} style={{ height: 14, width: 180 }} />
              </div>
            </div>
            {/* Download button */}
            <div className={s.base} style={{ height: 36, width: 110, borderRadius: 8 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return <CertificadosSkeleton />;
}
