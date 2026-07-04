'use client';

import { useState, useCallback, useRef } from 'react';
import { getCourses, deleteCourse, publishCourse, unpublishCourse, type CourseDTO } from '@/src/shared/api/courses';
import { getCategories, type CategoryDTO } from '@/src/shared/api/courses';
import { useToastStore } from '@/src/shared/store/useToastStore';

export interface DeleteTarget {
  id: string;
  title: string;
}

export type StatusFilter = 'all' | 'published' | 'draft' | 'deleted';

export function useCourseCrud() {
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [instructorFilter, setInstructorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishTarget, setPublishTarget] = useState<DeleteTarget | null>(null);
  const deleteIdRef = useRef<string | null>(null);
  const publishIdRef = useRef<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesData, categoriesData] = await Promise.all([
        getCourses({ includeDeleted: true }),
        getCategories(),
      ]);
      setCourses(coursesData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleConfirmDelete() {
    const id = deleteIdRef.current;
    if (!id) return;
    setDeletingId(id);
    try {
      await deleteCourse(id);
      await fetchData();
      setDeleteTarget(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar';
      useToastStore.getState().error(msg);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleConfirmPublish() {
    const id = publishIdRef.current;
    if (!id) return;
    setPublishingId(id);
    try {
      await publishCourse(id);
      await fetchData();
      setPublishTarget(null);
    } catch (err) {
      useToastStore.getState().error(err instanceof Error ? err.message : 'Error al publicar');
    } finally {
      setPublishingId(null);
    }
  }

  function confirmPublish(id: string, title: string) {
    publishIdRef.current = id;
    setPublishTarget({ id, title });
  }

  function cancelPublish() {
    setPublishTarget(null);
    setPublishingId(null);
  }

  async function handleUnpublish(id: string) {
    setPublishingId(id);
    try {
      await unpublishCourse(id);
      await fetchData();
    } catch (err) {
      useToastStore.getState().error(err instanceof Error ? err.message : 'Error al despublicar');
    } finally {
      setPublishingId(null);
    }
  }

  function confirmDelete(id: string, title: string) {
    deleteIdRef.current = id;
    setDeleteTarget({ id, title });
  }

  function cancelDelete() {
    setDeleteTarget(null);
    setDeletingId(null);
  }

  return {
    // State
    courses,
    categories,
    loading,
    error,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    instructorFilter, setInstructorFilter,
    statusFilter, setStatusFilter,
    deleteTarget,
    deletingId,
    publishingId,
    publishTarget,

    // Actions
    fetchData,
    handleConfirmDelete,
    handleConfirmPublish,
    handleUnpublish,
    confirmDelete,
    cancelDelete,
    confirmPublish,
    cancelPublish,
  };
}
