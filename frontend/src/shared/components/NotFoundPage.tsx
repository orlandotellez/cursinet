import Link from 'next/link';
import styles from './NotFoundPage.module.css';

interface NotFoundPageProps {
  title?: string;
  description?: string;
  returnHref?: string;
  returnLabel?: string;
}

export function NotFoundPage({
  title = 'Página no encontrada',
  description = 'La página que buscas no existe o ha sido movida.',
  returnHref = '/',
  returnLabel = 'Volver al inicio',
}: NotFoundPageProps) {
  return (
    <div className={styles.container}>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      <Link href={returnHref} className={styles.returnLink}>
        {returnLabel}
      </Link>
    </div>
  );
}
