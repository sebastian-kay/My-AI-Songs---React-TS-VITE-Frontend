import { CachedAudio } from '../types';

class AudioCacheManager {
  private cache = new Map<string, CachedAudio>();
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of cached audio files
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  async cacheAudio(url: string): Promise<string> {
    try {
      // Check if already cached and not expired
      const existing = this.cache.get(url);
      if (existing && !this.isExpired(existing)) {
        return existing.url;
      }

      // Clean up expired entries
      this.cleanupExpired();

      // Ensure we don't exceed cache size
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        this.removeOldest();
      }

      // Fetch and cache the audio
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Store in cache
      this.cache.set(url, {
        blob,
        url: blobUrl,
        timestamp: Date.now()
      });

      return blobUrl;
    } catch (error) {
      console.error('Error caching audio:', error);
      // Return original URL as fallback
      return url;
    }
  }

  getCachedAudio(url: string): string | null {
    const cached = this.cache.get(url);
    if (cached && !this.isExpired(cached)) {
      return cached.url;
    }
    return null;
  }

  private isExpired(cached: CachedAudio): boolean {
    return Date.now() - cached.timestamp > this.CACHE_EXPIRY;
  }

  private cleanupExpired(): void {
    for (const [url, cached] of this.cache.entries()) {
      if (this.isExpired(cached)) {
        URL.revokeObjectURL(cached.url);
        this.cache.delete(url);
      }
    }
  }

  private removeOldest(): void {
    let oldestUrl: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [url, cached] of this.cache.entries()) {
      if (cached.timestamp < oldestTimestamp) {
        oldestTimestamp = cached.timestamp;
        oldestUrl = url;
      }
    }

    if (oldestUrl) {
      const cached = this.cache.get(oldestUrl);
      if (cached) {
        URL.revokeObjectURL(cached.url);
        this.cache.delete(oldestUrl);
      }
    }
  }

  clearCache(): void {
    for (const cached of this.cache.values()) {
      URL.revokeObjectURL(cached.url);
    }
    this.cache.clear();
  }

  preloadTrack(url: string): void {
    // Pre-fetch audio in background without blocking
    setTimeout(() => {
      this.cacheAudio(url).catch(console.error);
    }, 100);
  }
}

export const audioCache = new AudioCacheManager();