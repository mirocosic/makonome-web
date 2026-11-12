// Cloudflare Web Analytics for makonome.com (Miro, 2026-11-12): cookieless, so no consent banner.
// The token is the site's beacon token from the Cloudflare dashboard (Web Analytics → makonome.com).
// It isn't a secret: it ends up in every page's source. Empty = no beacon on any page.
export const CLOUDFLARE_BEACON_TOKEN = '';

// The beacon loads only on this host, so `npm run dev`, `npm run preview` and the Lighthouse run
// (all on localhost) neither count as visits nor load a third-party script.
export const ANALYTICS_HOST = 'makonome.com';
