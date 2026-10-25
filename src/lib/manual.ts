import { getCollection, type CollectionEntry } from 'astro:content';

export { PLATFORMS, PLATFORM_LABELS, PLATFORM_STORAGE_KEY, parsePlatforms, type Platform } from './platforms';

export type ManualEntry = CollectionEntry<'manual'>;

/** All manual pages in reading order: by `order`, then id. */
export async function getManualPages(): Promise<ManualEntry[]> {
  const pages = await getCollection('manual');
  return pages.sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id));
}

/** Groups in the order their first page appears. */
export function groupPages(pages: ManualEntry[]): { group: string; pages: ManualEntry[] }[] {
  const groups: { group: string; pages: ManualEntry[] }[] = [];
  for (const page of pages) {
    let g = groups.find((x) => x.group === page.data.group);
    if (!g) {
      g = { group: page.data.group, pages: [] };
      groups.push(g);
    }
    g.pages.push(page);
  }
  return groups;
}

export function pageUrl(id: string): string {
  return `/manual/${id}/`;
}
