'use client'

import { Award, Download } from 'lucide-react';
import type { Certificate } from '@/src/shared/types';
import styles from './CertificateCard.module.css';

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
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
      <button className={styles.downloadBtn}>
        <Download size={16} />
        Descargar
      </button>
    </div>
  );
}
