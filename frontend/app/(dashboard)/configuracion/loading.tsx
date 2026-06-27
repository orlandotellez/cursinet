import { type ReactNode } from 'react';
import s from '@/src/shared/styles/skeleton.module.css';

export function ConfiguracionSkeleton() {
  return (
    <div style={{ maxWidth: 700, margin: 'auto', width: '100%' }}>
      {/* Title */}
      <div className={s.base} style={{ height: 28, width: 180, marginBottom: 32 }} />

      {/* Profile Section */}
      <SectionSkeleton>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div className={s.base} style={{ width: 18, height: 18, borderRadius: 4 }} />
          <div className={s.base} style={{ height: 16, width: 60 }} />
        </div>
        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Name field */}
          <div>
            <div className={s.base} style={{ height: 13, width: 60, marginBottom: 6 }} />
            <div className={s.base} style={{ height: 40, width: '100%', borderRadius: 8 }} />
          </div>
          {/* Email field */}
          <div>
            <div className={s.base} style={{ height: 13, width: 140, marginBottom: 6 }} />
            <div className={s.base} style={{ height: 40, width: '100%', borderRadius: 8 }} />
          </div>
          {/* Bio field */}
          <div>
            <div className={s.base} style={{ height: 13, width: 50, marginBottom: 6 }} />
            <div className={s.base} style={{ height: 80, width: '100%', borderRadius: 8 }} />
          </div>
        </div>
      </SectionSkeleton>

      {/* Password Section */}
      <SectionSkeleton>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div className={s.base} style={{ width: 18, height: 18, borderRadius: 4 }} />
          <div className={s.base} style={{ height: 16, width: 100 }} />
        </div>
        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className={s.base} style={{ height: 13, width: 130, marginBottom: 6 }} />
              <div className={s.base} style={{ height: 40, width: '100%', borderRadius: 8 }} />
            </div>
          ))}
        </div>
      </SectionSkeleton>

      {/* Notifications Section */}
      <SectionSkeleton>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div className={s.base} style={{ width: 18, height: 18, borderRadius: 4 }} />
          <div className={s.base} style={{ height: 16, width: 120 }} />
        </div>
        {/* Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
              }}
            >
              <div className={s.base} style={{ height: 14, width: 200 }} />
              <div className={s.base} style={{ width: 40, height: 22, borderRadius: 11 }} />
            </div>
          ))}
        </div>
      </SectionSkeleton>

      {/* Save button */}
      <div className={s.base} style={{ height: 40, width: 150, borderRadius: 8, marginTop: 8 }} />
    </div>
  );
}

function SectionSkeleton({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        padding: 24,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

export default function Loading() {
  return <ConfiguracionSkeleton />;
}
