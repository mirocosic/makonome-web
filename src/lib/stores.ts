// Links to our store listings, tagged with a campaign per placement so App Store Connect and the
// Play Console count the installs that come from makonome.com (Miro, 2026-11-12). The campaign
// names are listed in makonome-hq docs/ANALYTICS_EVENTS.md (Website). Only our own listings go
// through here; links to other apps (the compare pages) stay untagged.
export type Store = 'app-store' | 'google-play';

const APP_STORE_BASE = 'https://apps.apple.com/app/makonome/id6747674877';
const GOOGLE_PLAY_BASE = 'https://play.google.com/store/apps/details?id=com.makonome.app';

// Apple's provider token (the `pt=` value of a campaign link from App Store Connect: Apps →
// Makonome → Analytics → Acquisition → Campaigns → Generate a campaign link). Apple ignores
// `ct` without it. Empty = App Store links stay untagged.
export const APP_STORE_PROVIDER_TOKEN = '128588958';

// Lowercase letters, digits and hyphens, at most 40 characters (Apple's `ct` limit). No user data.
const CAMPAIGN = /^[a-z0-9-]{1,40}$/;

export function storeUrl(store: Store, campaign: string): string {
  if (!CAMPAIGN.test(campaign)) throw new Error(`Bad store campaign "${campaign}": use a-z, 0-9 and -, at most 40`);
  if (store === 'app-store') {
    if (!APP_STORE_PROVIDER_TOKEN) return APP_STORE_BASE;
    return `${APP_STORE_BASE}?pt=${APP_STORE_PROVIDER_TOKEN}&ct=${campaign}&mt=8`;
  }
  // Play reads the install referrer as one URL-encoded parameter.
  const referrer = `utm_source=makonome.com&utm_medium=website&utm_campaign=${campaign}`;
  return `${GOOGLE_PLAY_BASE}&referrer=${encodeURIComponent(referrer)}`;
}
