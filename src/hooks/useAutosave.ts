// src/hooks/useAutosave.ts

import { useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { debounce } from 'lodash-es';

interface UseAutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutosave<T>({
  data,
  onSave,
  delay = 2000,
  enabled = true
}: UseAutosaveOptions<T>) {
  const lastSavedRef = useRef<string>('');

  const mutation = useMutation({
    mutationFn: onSave,
  });

  const debouncedSave = useCallback(
    debounce((newData: T) => {
      const serialized = JSON.stringify(newData);
      if (serialized !== lastSavedRef.current) {
        lastSavedRef.current = serialized;
        mutation.mutate(newData);
      }
    }, delay),
    [delay]
  );

  useEffect(() => {
    if (enabled) {
      debouncedSave(data);
    }
    return () => debouncedSave.cancel();
  }, [data, enabled, debouncedSave]);

  return {
    status: mutation.isPending ? ('saving' as const) : mutation.isError ? ('error' as const) : ('saved' as const),
    error: mutation.error,
  };
}
