'use client';

import { type ReactNode } from 'react';
import s from './PageSkeleton.module.css';

interface BoxProps {
  className?: string;
  style?: React.CSSProperties;
}

function Base({ className = '', style }: BoxProps) {
  return <div className={`${s.base} ${className}`} style={style} />;
}

export function SkeletonCard({ children }: { children: ReactNode }) {
  return <div className={s.card}>{children}</div>;
}

export function SkeletonThumbnail() {
  return <div className={s.thumbnail} />;
}

export function SkeletonRow({
  iconSize = 36,
  lines,
}: {
  iconSize?: number;
  lines: number;
}) {
  return (
    <SkeletonCard>
      <div className={s.row}>
        <Base style={{ width: iconSize, height: iconSize, borderRadius: 8, flexShrink: 0 }} />
        <div className={s.rowBody}>
          {Array.from({ length: lines }).map((_, i) => (
            <Base
              key={i}
              style={{
                height: i === 0 ? 15 : 13,
                width: i === 0 ? '60%' : '90%',
                marginBottom: i < lines - 1 ? 4 : 0,
              }}
            />
          ))}
        </div>
      </div>
    </SkeletonCard>
  );
}

export function SkeletonCardContent({
  showHeart,
  showStats,
}: {
  showHeart?: boolean;
  showStats?: boolean;
}) {
  return (
    <div className={s.fullCard}>
      {showHeart && <Base className={s.heartBtn} />}
      <SkeletonThumbnail />
      <div className={s.cardBody}>
        <div className={s.metaRow}>
          <Base style={{ height: 20, width: 80, borderRadius: 4 }} />
          <Base style={{ height: 20, width: 90, borderRadius: 4 }} />
        </div>
        <Base style={{ height: 18, width: '85%' }} />
        <Base style={{ height: 14, width: '100%' }} />
        {showStats && (
          <div className={s.statsRow}>
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className={s.statItem}>
                <Base style={{ width: 14, height: 14, borderRadius: 3 }} />
                <Base style={{ width: 24, height: 12 }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SkeletonProgress() {
  return (
    <div className={s.progressRow}>
      <Base style={{ flex: 1, height: 6, borderRadius: 3 }} />
      <Base style={{ width: 60, height: 14 }} />
    </div>
  );
}

export function SkeletonButton({ width = 120 }: { width?: number }) {
  return <Base style={{ height: 36, width, borderRadius: 8 }} />;
}

export function SkeletonHeader({
  titleWidth = 140,
  subtitleWidth,
  actionWidth,
}: {
  titleWidth?: number;
  subtitleWidth?: number;
  actionWidth?: number;
}) {
  return (
    <div className={s.header}>
      <div>
        <Base style={{ height: 28, width: titleWidth, marginBottom: subtitleWidth ? 8 : 0 }} />
        {subtitleWidth && <Base style={{ height: 14, width: subtitleWidth }} />}
      </div>
      {actionWidth && <Base style={{ height: 36, width: actionWidth, borderRadius: 8 }} />}
    </div>
  );
}

export function SkeletonTabs({ count = 3 }: { count?: number }) {
  return (
    <div className={s.tabsRow}>
      {Array.from({ length: count }).map((_, i) => (
        <Base key={i} style={{ height: 36, width: 110, borderRadius: 8 }} />
      ))}
    </div>
  );
}

export function SkeletonCardGrid({
  count = 6,
  showHeart,
  showStats,
}: {
  count?: number;
  showHeart?: boolean;
  showStats?: boolean;
}) {
  return (
    <div className={s.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCardContent key={i} showHeart={showHeart} showStats={showStats} />
      ))}
    </div>
  );
}

export function SkeletonRowList({
  count = 4,
  iconSize = 36,
  lines = 2,
}: {
  count?: number;
  iconSize?: number;
  lines?: number;
}) {
  return (
    <div className={s.list}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} iconSize={iconSize} lines={lines} />
      ))}
    </div>
  );
}

export function SkeletonStatCards() {
  return (
    <div className={s.statsGrid}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={s.statCard}>
          <Base style={{ width: 40, height: 40, borderRadius: 8 }} />
          <Base style={{ width: 48, height: 24, borderRadius: 4 }} />
          <Base style={{ width: 80, height: 12, borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonContinueCard() {
  return (
    <SkeletonCard>
      <div className={s.continueRow}>
        <Base style={{ width: 48, height: 48, borderRadius: 8, flexShrink: 0 }} />
        <div className={s.continueBody}>
          <Base style={{ height: 16, width: '70%', marginBottom: 10 }} />
          <SkeletonProgress />
        </div>
        <Base style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0 }} />
      </div>
    </SkeletonCard>
  );
}

export function SkeletonCertCard() {
  return (
    <SkeletonCard>
      <div className={s.continueRow}>
        <Base style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }} />
        <div className={s.continueBody}>
          <Base style={{ height: 16, width: 200, marginBottom: 6 }} />
          <Base style={{ height: 12, width: 140 }} />
        </div>
        <Base style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
      </div>
    </SkeletonCard>
  );
}
