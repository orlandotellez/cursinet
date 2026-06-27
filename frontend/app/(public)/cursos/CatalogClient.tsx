'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { CatalogHeader } from '@/src/features/courses/catalog/CatalogHeader';
import { CourseGrid } from '@/src/features/courses/catalog/CourseGrid';
import { CatalogEmptyState } from '@/src/features/courses/catalog/CatalogEmptyState';
import type { CourseCardData, Level, Category } from '@/src/shared/types';
import styles from './catalog.module.css';

const LEVELS: { value: Level | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
];

interface CatalogClientProps {
  allCards: CourseCardData[];
  categories: Category[];
}

import { useDebounce } from '@/src/shared/hooks/useDebounce';

export function CatalogClient({ allCards, categories }: CatalogClientProps) {
  const searchParams = useSearchParams();
  const categoriaParam = searchParams.get('categoria') ?? '';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoriaParam);
  const [selectedLevel, setSelectedLevel] = useState<Level | ''>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    return allCards.filter((c) => {
      if (debouncedSearch && !c.title.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      if (selectedCategory && c.category.name !== selectedCategory) return false;
      if (selectedLevel && c.level !== selectedLevel) return false;
      return true;
    });
  }, [allCards, debouncedSearch, selectedCategory, selectedLevel]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setSelectedCategory('');
    setSelectedLevel('');
    inputRef.current?.focus();
  }, []);

  const hasFilters = search || selectedCategory || selectedLevel;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb}>
          <Link href="/cursos">Cursos</Link>
          <span className={styles.separator}>/</span>
        </nav>

        <CatalogHeader totalCount={filtered.length} />

        {/* ── Category ribbon ── */}
        <div className={styles.categorySection}>
          <span className={styles.categoryLabel}>Categorías</span>
          <div className={styles.categoryRibbon}>
            <button
              className={`${styles.catPill} ${!selectedCategory ? styles.catPillActive : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.catPill} ${selectedCategory === cat.name ? styles.catPillActive : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? '' : cat.name)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Sub-toolbar: search + level + clear ── */}
        <div className={styles.subToolbar}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Buscar cursos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className={styles.levelGroup}>
            {LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                className={`${styles.levelBtn} ${selectedLevel === lvl.value ? styles.levelBtnActive : ''}`}
                onClick={() => setSelectedLevel(lvl.value as Level | '')}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button className={styles.clearBtn} onClick={clearFilters}>
              <X size={14} />
              Limpiar
            </button>
          )}
        </div>

        {/* ── Results ── */}
        <div className={styles.results}>
          {filtered.length > 0 ? (
            <CourseGrid courses={filtered} />
          ) : (
            <CatalogEmptyState onClear={clearFilters} />
          )}
        </div>
      </div>
    </div>
  );
}
