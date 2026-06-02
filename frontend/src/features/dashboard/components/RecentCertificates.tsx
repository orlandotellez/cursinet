'use client'

import Link from 'next/link';
import { Award, Download } from 'lucide-react';
import type { Certificate } from '@/src/shared/types';
import styles from './RecentCertificates.module.css';

interface RecentCertificatesProps {
  certificates: Certificate[];
}

export function RecentCertificates({ certificates }: RecentCertificatesProps) {
  const recent = certificates.slice(0, 3);

  if (recent.length === 0) return null;

  return (
    <section>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Certificados recientes</h2>
        {certificates.length > 3 && (
          <Link href="/certificados" className={styles.seeAll}>
            Ver todos
          </Link>
        )}
      </div>
      <div className={styles.list}>
        {recent.map((cert) => (
          <div key={cert.id} className={styles.card}>
            <div className={styles.body}>
              <Award size={20} className={styles.icon} />
              <div>
                <h4 className={styles.name}>{cert.courseName}</h4>
                <p className={styles.meta}>
                  {cert.instructorName} &middot;{' '}
                  {new Date(cert.issuedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <button className={styles.downloadBtn}>
              <Download size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
