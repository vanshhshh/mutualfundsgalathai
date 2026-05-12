// Cache utility for simple in-memory caching
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

export function setCache<T>(key: string, data: T, ttlMS: number = 3600000) {
  cache.set(key, {
    data,
    timestamp: Date.now() + ttlMS,
  });
}

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  
  if (!entry) return null;
  
  if (Date.now() > entry.timestamp) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

export function clearCache(pattern?: string) {
  if (!pattern) {
    cache.clear();
    return;
  }
  
  const regex = new RegExp(pattern);
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}
