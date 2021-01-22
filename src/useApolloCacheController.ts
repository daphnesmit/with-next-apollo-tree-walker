import { InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { useContext, useMemo } from 'react';

import { ApolloCacheController } from './ApolloCacheController';

interface UseApolloCacheController  {
  register: (name: string, cache: InMemoryCache) => void
  extract: (name: string) => NormalizedCacheObject | undefined
}

export const useApolloCacheController = (): UseApolloCacheController => {
  const context = useContext(ApolloCacheController.getContext());
  if (context === null) {
    throw new Error('Cannot use useApolloCacheController without context provider');
  }

  const state = useMemo(() => ({
    register: (name: string, cache: InMemoryCache) => context.registerCache(name, cache),
    extract: (name: string) => context.getExtractedCache(name)
  }),[])

  return state;
};
