'use client'

import { useState } from 'react';
import { Award, Download, Loader2 } from 'lucide-react';
import { SkeletonBase } from '@/src/shared/skeleton';
import { downloadCertificate } from '@/src/shared/api/student';
import type { Certificate } from '@/src/shared/types';
import styles from './CertificateCard.module.css';

interface CertificateCardProps {
  certificate?: Certificate;
  loading?: boolean;
}

export function CertificateCard({ certificate, loading }: CertificateCardProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!certificate || downloading) return;
    setDownloading(true);
    try {
      await downloadCertificate(certificate.id);
    } catch {
      // Error silencioso — el toast del fetch ya muestra el error
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.left}>
          <SkeletonBase width={48} height={48} borderRadius={8} />
          <div>
            <SkeletonBase width={220} height={18} style={{ marginBottom: 4 }} />
            <SkeletonBase width={180} height={14} />
          </div>
        </div>
        <SkeletonBase width={120} height={36} borderRadius={8} />
      </div>
    );
  }

  if (!certificate) return null;

  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <div className={styles.badge}>
          <Award size={24} />
        </div>
        <div>
          <h3 className={styles.name}>{certificate.courseName}</h3>
          <p className={styles.meta}>
            {certificate.instructorName} &middot;{' '}
            {new Date(certificate.issuedAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
      <button
        className={styles.downloadBtn}
        onClick={handleDownload}
        disabled={downloading}
      >
        {downloading ? (
          <Loader2 size={16} className={styles.spinner} />
        ) : (
          <Download size={16} />
        )}
        {downloading ? 'Descargando...' : 'Descargar'}
      </button>
    </div>
  );
}
