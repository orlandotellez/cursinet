'use client';

import { useMemo } from 'react';
import styles from './LineChart.module.css';

export interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  color?: string;
  formatValue?: (value: number) => string;
  height?: number;
}

export function LineChart({
  data = [],
  color = '#2563EB',
  formatValue = (v) => v.toLocaleString(),
  height = 220,
}: LineChartProps) {
  const { path, dots, yTicks, xLabels, viewBox } = useMemo(() => {
    if (data.length < 2) {
      return {
        path: '',
        dots: [] as { x: number; y: number; label: string }[],
        yTicks: [] as { y: number; label: string }[],
        xLabels: [] as { x: number; label: string }[],
        viewBox: `0 0 600 ${height}`,
      };
    }

    const values = data.map((d) => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    const pad = { top: 16, right: 16, bottom: 28, left: 48 };
    const w = 600;
    const h = height;
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    const points = data.map((d, i) => ({
      x: pad.left + (i / (data.length - 1)) * plotW,
      y: pad.top + plotH - ((d.value - min) / range) * plotH,
      label: d.label,
    }));

    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    // Y-axis ticks — 5 valores
    const tickCount = 5;
    const yTicks = Array.from({ length: tickCount }, (_, i) => {
      const val = min + (range / (tickCount - 1)) * i;
      const y = pad.top + plotH - ((val - min) / range) * plotH;
      return { y, label: formatValue(Math.round(val)) };
    });

    return {
      path: linePath,
      dots: points,
      yTicks,
      xLabels: points,
      viewBox: `0 0 ${w} ${h}`,
    };
  }, [data, height, formatValue]);

  if (data.length < 2) {
    return (
      <div className={styles.empty}>
        <span>Datos insuficientes</span>
      </div>
    );
  }

  return (
    <svg
      viewBox={viewBox}
      className={styles.svg}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Grid horizontal */}
      {yTicks.map((tick, i) => (
        <g key={i}>
          <line
            x1={48}
            y1={tick.y}
            x2={584}
            y2={tick.y}
            stroke="var(--border)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <text
            x={44}
            y={tick.y + 4}
            textAnchor="end"
            className={styles.yLabel}
          >
            {tick.label}
          </text>
        </g>
      ))}

      {/* Línea */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Puntos */}
      {dots.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill={color}
          stroke="var(--bg-card)"
          strokeWidth={2}
          className={styles.dot}
        />
      ))}

      {/* Labels del eje X */}
      {(() => {
        const skip = data.length > 12 ? Math.floor(data.length / 8) : 1;
        return xLabels.map((p, i) => {
          if (i % skip !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={i}
              x={p.x}
              y={height - 4}
              textAnchor="middle"
              className={styles.xLabel}
            >
              {p.label}
            </text>
          );
        });
      })()}
    </svg>
  );
}
