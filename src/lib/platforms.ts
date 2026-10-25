// Client-safe: imported by browser scripts too, so no astro:content here.
export const PLATFORMS = ['ios', 'mac', 'android'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  ios: 'iOS',
  mac: 'Mac',
  android: 'Android',
};

/** localStorage key for the remembered platform choice (see PlatformInit.astro). */
export const PLATFORM_STORAGE_KEY = 'makonome-manual-platform';

/** Parses a space-separated platform list ("ios mac"). Unknown names fail the build. */
export function parsePlatforms(value: string | readonly string[] | undefined, fallback: readonly Platform[]): Platform[] {
  if (value === undefined) return [...fallback];
  const names = typeof value === 'string' ? value.split(/\s+/).filter(Boolean) : [...value];
  for (const name of names) {
    if (!(PLATFORMS as readonly string[]).includes(name)) {
      throw new Error(`Unknown platform "${name}". Use one of: ${PLATFORMS.join(', ')}.`);
    }
  }
  return names as Platform[];
}
