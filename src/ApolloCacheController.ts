import { ApolloCache } from '@apollo/client/cache/core/cache';
import { NormalizedCacheObject } from '@apollo/client/cache/inmemory/types';
import React, { Context } from 'react';

export type ApolloCacheControllerCacheSnapshot = Record<string, NormalizedCacheObject>;

export class ApolloCacheController {
  private cacheInstances = new Map<string, ApolloCache<NormalizedCacheObject>>();
  private storedExtractedCache = new Map<string, NormalizedCacheObject>();
  private static context: Context<ApolloCacheController | null>;

  public static getContext() {
    if (!ApolloCacheController.context) {
      ApolloCacheController.context = React.createContext<ApolloCacheController | null>(null);
    }

    return ApolloCacheController.context;
  }

  public registerCache(key: string, cache: ApolloCache<NormalizedCacheObject>) {
    if (this.cacheInstances.has(key)) {
      const extractedCache = this.extractCache(key);
      if (extractedCache) {
        this.cacheInstances.set(key, cache.restore(extractedCache));
      }
      return;
    }
    this.cacheInstances.set(key, cache);
  }

  public extractCache(key: string): NormalizedCacheObject | null {
    const cache = this.cacheInstances.get(key);
    if (cache) {
      return cache.extract();
    }

    return null;
  }

  public getExtractedCache(key: string): NormalizedCacheObject | undefined {
    return this.storedExtractedCache.get(key);
  }

  public getSnapshot(): ApolloCacheControllerCacheSnapshot {
    const allCacheExtracts: ApolloCacheControllerCacheSnapshot = {};
    this.cacheInstances.forEach((value, key) => {
      allCacheExtracts[key] = value.extract();
    });
    return allCacheExtracts;
  }

  public restoreSnapshot(snapshot: ApolloCacheControllerCacheSnapshot) {
    for (const key in snapshot) {
      this.storedExtractedCache.set(key, snapshot[key]);
    }
  }

  public seal(): void {
    this.cacheInstances.clear();
    this.storedExtractedCache.clear();
  }
}
