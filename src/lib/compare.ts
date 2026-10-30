// Data shape for the /compare/<competitor> pages, rendered by components/compare/CompareTable.astro.
// Facts come only from makonome-hq docs/competitors/<app>.md (the competitor) and docs/FEATURES.md
// (Makonome). A row needs a confirmed fact for both apps: when the competitor file says "?", leave the row out.

export type Mark = 'yes' | 'no' | 'partial';

export interface Cell {
  mark: Mark;
  note?: string;
}

export interface CompareRow {
  feature: string;
  makonome: Cell;
  them: Cell;
}

export interface CompareGroup {
  title: string;
  rows: CompareRow[];
}

export const MARK_LABELS: Record<Mark, string> = {
  yes: 'Yes',
  no: 'No',
  partial: 'Partly',
};
