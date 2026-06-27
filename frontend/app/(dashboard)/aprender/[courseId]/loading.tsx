import s from '@/src/shared/styles/skeleton.module.css';

export function AprenderCourseSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
        gap: 16,
        padding: 24,
      }}
    >
      <div className={s.base} style={{ width: 48, height: 48, borderRadius: '50%' }} />
      <div className={s.base} style={{ width: 200, height: 16 }} />
      <div className={s.base} style={{ width: 140, height: 12 }} />
    </div>
  );
}

export default function Loading() {
  return <AprenderCourseSkeleton />;
}
