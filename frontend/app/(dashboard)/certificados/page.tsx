'use client';

import { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import { getMyCertificates } from '@/src/shared/api/certificates';
import { CertificateCard } from '@/src/features/courses/certificates/CertificateCard';
import type { Certificate } from '@/src/shared/types';
import { CertificadosSkeleton } from './loading';
import styles from './page.module.css';

export default function CertificadosPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCertificates()
      .then(setCertificates)
      .catch(() => {}) // Silently fail — empty state shows
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CertificadosSkeleton />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Certificados</h1>
        <span className={styles.count}>
          {certificates.length} certificado{certificates.length !== 1 ? 's' : ''}
        </span>
      </div>

      {certificates.length === 0 ? (
        <div className={styles.empty}>
          <Award size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>Sin certificados aún</h3>
          <p className={styles.emptyText}>
            Completá un curso para obtener tu primer certificado.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {certificates.map((cert) => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </div>
      )}
    </div>
  );
}
