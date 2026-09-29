import { districts, FEATURES, type Deal, type DistrictId, type Feature, type Property } from './data';

export type SortKey = 'new' | 'cheap' | 'expensive' | 'm2' | 'area';
export type View = 'list' | 'map';

export type Filters = {
  deal: Deal;
  rooms: number[]; // 0 = studio, 4 = 4+
  min: number | null;
  max: number | null;
  area: number | null;
  districts: DistrictId[];
  features: Feature[];
  sort: SortKey;
  view: View;
};

export const RANGE: Record<Deal, { min: number; max: number; step: number }> = {
  sale: { min: 3_000_000, max: 60_000_000, step: 500_000 },
  rent: { min: 20_000, max: 300_000, step: 5_000 },
};

export const defaults = (deal: Deal = 'sale'): Filters => ({
  deal,
  rooms: [],
  min: null,
  max: null,
  area: null,
  districts: [],
  features: [],
  sort: 'new',
  view: 'list',
});

const SORTS: SortKey[] = ['new', 'cheap', 'expensive', 'm2', 'area'];
const IDS = districts.map((d) => d.id);

/** Filters live in the query string so any search can be shared as a link. */
export function fromURL(search: string): Filters {
  const q = new URLSearchParams(search);
  const deal: Deal = q.get('deal') === 'rent' ? 'rent' : 'sale';
  const f = defaults(deal);
  const num = (k: string) => {
    const v = Number(q.get(k));
    return q.has(k) && Number.isFinite(v) && v > 0 ? v : null;
  };
  f.rooms = (q.get('rooms') ?? '').split(',').filter(Boolean).map(Number).filter((n) => n >= 0 && n <= 4);
  f.min = num('min');
  f.max = num('max');
  f.area = num('area');
  f.districts = (q.get('d') ?? '').split(',').filter((d): d is DistrictId => IDS.includes(d as DistrictId));
  f.features = (q.get('f') ?? '').split(',').filter((x): x is Feature => FEATURES.includes(x as Feature));
  const sort = q.get('sort') as SortKey;
  if (SORTS.includes(sort)) f.sort = sort;
  if (q.get('view') === 'map') f.view = 'map';
  return f;
}

export function toURL(f: Filters): string {
  const q = new URLSearchParams();
  if (f.deal !== 'sale') q.set('deal', f.deal);
  if (f.rooms.length) q.set('rooms', [...f.rooms].sort().join(','));
  if (f.min) q.set('min', String(f.min));
  if (f.max) q.set('max', String(f.max));
  if (f.area) q.set('area', String(f.area));
  if (f.districts.length) q.set('d', f.districts.join(','));
  if (f.features.length) q.set('f', f.features.join(','));
  if (f.sort !== 'new') q.set('sort', f.sort);
  if (f.view !== 'list') q.set('view', f.view);
  const s = q.toString();
  return s ? `?${s}` : '';
}

const sorters: Record<SortKey, (a: Property, b: Property) => number> = {
  new: (a, b) => a.daysAgo - b.daysAgo,
  cheap: (a, b) => a.price - b.price,
  expensive: (a, b) => b.price - a.price,
  m2: (a, b) => a.price / a.area - b.price / b.area,
  area: (a, b) => b.area - a.area,
};

export function apply(list: Property[], f: Filters): Property[] {
  return list
    .filter(
      (p) =>
        p.deal === f.deal &&
        (!f.rooms.length || f.rooms.includes(Math.min(p.rooms, 4))) &&
        (f.min === null || p.price >= f.min) &&
        (f.max === null || p.price <= f.max) &&
        (f.area === null || p.area >= f.area) &&
        (!f.districts.length || f.districts.includes(p.district)) &&
        f.features.every((x) => p.features.includes(x))
    )
    .sort(sorters[f.sort]);
}

export const isDirty = (f: Filters) => toURL({ ...f, sort: 'new', view: 'list', deal: 'sale' }) !== '';
