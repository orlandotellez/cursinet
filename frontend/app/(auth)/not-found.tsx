import { NotFoundPage } from '@/src/shared/components/NotFoundPage';

export default function AuthNotFound() {
  return <NotFoundPage returnHref="/login" returnLabel="Volver al inicio de sesión" />;
}
