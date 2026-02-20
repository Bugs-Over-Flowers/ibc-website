import { cacheLife } from "next/cache";

export const CACHE_PROFILES = {
  publicHours: "publicHours",
  admin5m: "admin5m",
  realtime60s: "realtime60s",
} as const;

export type CacheProfileName =
  (typeof CACHE_PROFILES)[keyof typeof CACHE_PROFILES];

export function applyPublicHoursCache(): void {
  cacheLife(CACHE_PROFILES.publicHours);
}

export function applyAdmin5mCache(): void {
  cacheLife(CACHE_PROFILES.admin5m);
}

export function applyRealtime60sCache(): void {
  cacheLife(CACHE_PROFILES.realtime60s);
}
