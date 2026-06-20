'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { CatalogHeader } from '@/src/features/courses/catalog/CatalogHeader';
import { SearchInput } from '@/src/features/courses/catalog/SearchInput';
import { CategoryFilter } from '@/src/features/courses/catalog/CategoryFilter';
import { LevelFilter } from '@/src/features/courses/catalog/LevelFilter';
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

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function CatalogClient({ allCards, categories }: CatalogClientProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
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
        <CatalogHeader totalCount={filtered.length} />

        <div className={styles.toolbar}>
          <SearchInput value={search} onChange={setSearch} inputRef={inputRef} />
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
          <LevelFilter
            levels={LEVELS}
            selected={selectedLevel}
            onChange={setSelectedLevel}
          />

          {hasFilters && (
            <button className={styles.clearAll} onClick={clearFilters}>
              <X size={14} />
              Limpiar filtros
            </button>
          )}
        </div>

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
