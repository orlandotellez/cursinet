'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import { redirectByRole } from '@/src/shared/lib/authUtils';
import type { UserRole, User } from '@/src/shared/types';

interface AuthGuardOptions {
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
}

interface AuthGuardResult {
  isLoading: boolean;
  user: User | null;
}

export function useAuthGuard(options?: AuthGuardOptions): AuthGuardResult {
  const { requireAuth = true, allowedRoles } = options ?? {};
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const persist = useAuthStore.persist;
    if (!persist) {
      setHydrated(true);
      return;
    }
    const unsub = persist.onFinishHydration(() => setHydrated(true));
    if (persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (requireAuth) {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }
      if (!user) return;

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        redirectByRole(user.role, router.replace);
        return;
      }

      setIsLoading(false);
    } else {
      if (isAuthenticated) {
        const role = useAuthStore.getState().user?.role;
        redirectByRole(role, router.replace);
        return;
      }
      setIsLoading(false);
    }
  }, [hydrated, isAuthenticated, user, router, requireAuth, allowedRoles]);

  return { isLoading, user };
}
