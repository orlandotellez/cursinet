'use client'

import { Award } from 'lucide-react';
import { certificates } from '@/src/features/courses/data';
import { CertificateCard } from '@/src/features/courses/certificates/CertificateCard';
import styles from './page.module.css';

export default function CertificadosPage() {
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
            Completa un curso para obtener tu primer certificado.
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
