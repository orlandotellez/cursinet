'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import { getMyCertificates } from '@/src/shared/api/certificates';
import { getMyEnrollments } from '@/src/shared/api/enrollment';
import { DashboardHeader } from '@/src/features/dashboard/components/DashboardHeader';
import { ContinueLearning } from '@/src/features/dashboard/components/ContinueLearning';
import { StatsCards } from '@/src/features/dashboard/components/StatsCards';
import { RecentCertificates } from '@/src/features/dashboard/components/RecentCertificates';
import type { Certificate } from '@/src/shared/types';
import type { EnrollmentResponse } from '@/src/shared/api/enrollment';
import type { Enrollment } from '@/src/shared/types';
import styles from './page.module.css';

function transformEnrollment(enr: EnrollmentResponse): Enrollment {
  return {
    id: enr.id,
    courseId: enr.courseId,
    course: {
      id: enr.courseId,
      slug: enr.courseSlug,
      title: enr.courseTitle,
      shortDescription: '',
      thumbnail: enr.courseThumbnailUrl ?? '',
      instructor: { name: enr.instructorName, avatar: '' },
      category: { name: '' },
      level: 'beginner' as const,
      duration: enr.courseDurationMinutes,
      lessonsCount: enr.totalLessons,
      price: 0,
      rating: 0,
      reviewsCount: 0,
      studentsCount: 0,
    },
    progress: enr.progressPercentage,
    enrolledAt: enr.enrolledAt,
    lastAccessedAt: enr.lastAccessedAt ?? enr.enrolledAt,
    completedLessons: enr.completedLessons,
    totalLessons: enr.totalLessons,
  };
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const name = user?.name ?? 'Estudiante';
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [transformedEnrollments, setTransformedEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calcular stats reales desde los enrollments
  const studentStats = {
    completed: enrollments.filter((e) => e.progressPercentage === 100).length,
    lessonsDone: transformedEnrollments.reduce((acc, e) => acc + e.completedLessons, 0),
    totalHours: Math.round(transformedEnrollments.reduce((acc, e) => {
      if (e.totalLessons === 0) return acc;
      const avgMinPerLesson = e.course.duration / e.totalLessons;
      return acc + (e.completedLessons * avgMinPerLesson) / 60;
    }, 0)),
    streak: 0, // Requiere backend tracking
    currentStreak: 0, // Requiere backend tracking
  };

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [certs, enrs] = await Promise.all([
          getMyCertificates(),
          getMyEnrollments(),
        ]);
        if (mounted) {
          setCertificates(certs);
          setEnrollments(enrs);
          setTransformedEnrollments(enrs.map(transformEnrollment));
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <DashboardHeader name={name} />
        <div className={styles.loading}>Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <DashboardHeader name={name} />
      <ContinueLearning enrollments={transformedEnrollments} />
      <StatsCards stats={studentStats} />
      <RecentCertificates certificates={certificates} />
    </div>
  );
}
