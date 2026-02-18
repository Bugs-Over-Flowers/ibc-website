import { cacheLife } from "next/cache";

export const CACHE_PROFILES = {
  publicHours: "publicHours",
  admin5m: "admin5m",
  realtime60s: "realtime60s",
} as const;

export type CacheProfileName =
  (typeof CACHE_PROFILES)[keyof typeof CACHE_PROFILES];

export function usePublicHoursCache(): void {
  cacheLife(CACHE_PROFILES.publicHours);
}

export function useAdmin5mCache(): void {
  cacheLife(CACHE_PROFILES.admin5m);
}

export function useRealtime60sCache(): void {
  cacheLife(CACHE_PROFILES.realtime60s);
}
