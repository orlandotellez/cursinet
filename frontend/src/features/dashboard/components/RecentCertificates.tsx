'use client'

import Link from 'next/link';
import { Award, Download } from 'lucide-react';
import { SkeletonBase } from '@/src/shared/skeleton';
import type { Certificate } from '@/src/shared/types';
import styles from './RecentCertificates.module.css';

interface RecentCertificatesProps {
  certificates: Certificate[];
  loading?: boolean;
}

export function RecentCertificates({ certificates, loading }: RecentCertificatesProps) {
  const recent = certificates.slice(0, 3);
  const hasCertificates = recent.length > 0;
  const isEmpty = !hasCertificates && !loading;

  // Always render the full skeleton structure – when empty, hide it with
  // visibility:hidden so the section's occupied space (padding, borders, gap)
  // is preserved and there is zero layout shift.
  return (
    <section aria-hidden={isEmpty || undefined}>
      <div className={`${styles.sectionHeader} ${isEmpty ? styles.hidden : ''}`}>
        {loading || isEmpty ? (
          <SkeletonBase width={200} height={18} />
        ) : (
          <>
            <h2 className={styles.sectionTitle}>Certificados recientes</h2>
            {certificates.length > 3 && (
              <Link href="/certificados" className={styles.seeAll}>
                Ver todos
              </Link>
            )}
          </>
        )}
      </div>
      <div className={`${styles.list} ${isEmpty ? styles.hidden : ''}`}>
        {loading || isEmpty
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className={styles.card}>
                <div className={styles.body}>
                  <SkeletonBase width={20} height={20} />
                  <div>
                    <SkeletonBase width={200} height={16} style={{ marginBottom: 4 }} />
                    <SkeletonBase width={160} height={12} />
                  </div>
                </div>
                <SkeletonBase width={32} height={32} borderRadius={8} />
              </div>
            ))
          : hasCertificates && (
              <>
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
              </>
            )}
      </div>
    </section>
  );
}
