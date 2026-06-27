import { type ReactNode } from 'react';
import { SkeletonHeader } from '@/src/shared/components/PageSkeleton';
import s from '@/src/shared/styles/skeleton.module.css';

function SectionShell({ children }: { children: ReactNode }) {
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

function Field({ labelWidth, inputHeight = 40 }: { labelWidth: number; inputHeight?: number }) {
  return (
    <div>
      <div className={s.base} style={{ height: 13, width: labelWidth, marginBottom: 6 }} />
      <div className={s.base} style={{ height: inputHeight, width: '100%', borderRadius: 8 }} />
    </div>
  );
}

function SectionHeader({ iconSize = 18, textWidth }: { iconSize?: number; textWidth: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div className={s.base} style={{ width: iconSize, height: iconSize, borderRadius: 4 }} />
      <div className={s.base} style={{ height: 16, width: textWidth }} />
    </div>
  );
}

export const ConfiguracionSkeleton = Loading;

export default function Loading() {
  return (
    <div style={{ maxWidth: 700, margin: 'auto', width: '100%' }}>
      <SkeletonHeader titleWidth={180} />

      {/* Profile Section */}
      <SectionShell>
        <SectionHeader iconSize={18} textWidth={60} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field labelWidth={60} />
          <Field labelWidth={140} />
          <Field labelWidth={50} inputHeight={80} />
        </div>
      </SectionShell>

      {/* Password Section */}
      <SectionShell>
        <SectionHeader iconSize={18} textWidth={100} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Field key={i} labelWidth={130} />
          ))}
        </div>
      </SectionShell>

      {/* Notifications Section */}
      <SectionShell>
        <SectionHeader iconSize={18} textWidth={120} />
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
      </SectionShell>

      {/* Save button */}
      <div className={s.base} style={{ height: 40, width: 150, borderRadius: 8, marginTop: 8 }} />
    </div>
  );
}
