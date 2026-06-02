'use client'

import styles from './FilterTabs.module.css';

type Filter = 'all' | 'in-progress' | 'completed';

interface FilterTabsProps {
  active: Filter;
  onChange: (filter: Filter) => void;
}

const tabs: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'in-progress', label: 'En Progreso' },
  { key: 'completed', label: 'Completados' },
];

export function FilterTabs({ active, onChange }: FilterTabsProps) {
  return (
    <div className={styles.tabs} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          className={`${styles.tab} ${active === tab.key ? styles.tabActive : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
