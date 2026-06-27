'use client';

import { useState, useCallback } from 'react';

interface AuthFormState {
  isLoading: boolean;
  error: string | null;
}

export function useAuthForm() {
  const [state, setState] = useState<AuthFormState>({
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setState({ isLoading: true, error: null });
    try {
      const result = await fn();
      setState({ isLoading: false, error: null });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado';
      setState({ isLoading: false, error: message });
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    isLoading: state.isLoading,
    error: state.error,
    execute,
    clearError,
  };
}
