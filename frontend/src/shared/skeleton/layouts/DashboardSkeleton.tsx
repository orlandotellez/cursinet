import { SkeletonBase } from '../SkeletonBase';
import { SkeletonTextLines } from '../composables/TextLines';
import { SkeletonButton } from '../composables/Button';
import { SkeletonCardGrid } from '../blocks/CardGrid';
import { SkeletonRowList } from '../blocks/RowList';
import { SkeletonStatsGrid } from '../blocks/StatsGrid';
import { SkeletonContinueCard, SkeletonCertCard } from '../blocks/Cards';
import { SkeletonFormSkeleton } from '../blocks/FormSkeleton';

interface DashboardSkeletonProps {
  variant: 'home' | 'grid' | 'list' | 'form' | 'config' | 'lesson';
  count?: number;
}

export function DashboardSkeleton({ variant, count = 6 }: DashboardSkeletonProps) {
  switch (variant) {
    case 'home':
      return <DashboardHome count={count} />;
    case 'grid':
      return <DashboardGrid count={count} />;
    case 'list':
      return <DashboardList />;
    case 'form':
    case 'config':
      return <DashboardConfig />;
    case 'lesson':
      return <DashboardLesson />;
    default:
      return null;
  }
}

function Header({
  titleWidth = 140,
  subtitleWidth,
  actionWidth,
}: {
  titleWidth?: number;
  subtitleWidth?: number;
  actionWidth?: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <SkeletonBase width={titleWidth} height={28} style={{ marginBottom: subtitleWidth ? 8 : 0 }} />
        {subtitleWidth && <SkeletonBase width={subtitleWidth} height={14} />}
      </div>
      {actionWidth && <SkeletonButton width={actionWidth} />}
    </div>
  );
}

function DashboardHome({ count }: { count?: number }) {
  return (
    <div style={{ margin: 'auto', width: '100%' }}>
      <Header titleWidth={260} subtitleWidth={200} actionWidth={140} />
      <div style={{ marginBottom: 32 }}>
        <SkeletonStatsGrid count={Math.min(count ?? 4, 4)} />
      </div>
      <div style={{ marginBottom: 32 }}>
        <SkeletonBase width={200} height={18} style={{ marginBottom: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonContinueCard key={i} />
          ))}
        </div>
      </div>
      <div>
        <SkeletonBase width={200} height={18} style={{ marginBottom: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonCertCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardGrid({ count }: { count?: number }) {
  return (
    <div style={{ margin: 'auto', width: '100%' }}>
      <Header titleWidth={140} actionWidth={80} />
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBase key={i} width={110} height={36} borderRadius={8} />
        ))}
      </div>
      <SkeletonCardGrid count={count ?? 6} showHeart={false} showStats={false} />
    </div>
  );
}

function DashboardList() {
  return (
    <div style={{ margin: 'auto', width: '100%' }}>
      <Header titleWidth={200} subtitleWidth={80} actionWidth={180} />
      <SkeletonRowList count={4} iconSize={36} lines={3} showAction />
    </div>
  );
}

function DashboardConfig() {
  return (
    <div style={{ maxWidth: 700, margin: 'auto', width: '100%' }}>
      <SkeletonBase width={180} height={28} style={{ marginBottom: 32 }} />
      <SkeletonFormSkeleton sections={3} />
      <SkeletonButton width={150} />
    </div>
  );
}

function DashboardLesson() {
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
      <SkeletonBase width={48} height={48} borderRadius={9999} />
      <SkeletonBase width={200} height={16} />
      <SkeletonBase width={140} height={12} />
    </div>
  );
}
