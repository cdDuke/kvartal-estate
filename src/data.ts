export type Lang = 'ru' | 'en';
export type T = Record<Lang, string>;
export type Deal = 'sale' | 'rent';
export type Feature = 'balcony' | 'parking' | 'newbuild' | 'view' | 'furnished' | 'pets';
export type Facade = 'classic' | 'tower' | 'brick' | 'modern';
export type DistrictId = 'center' | 'petrogradsky' | 'vasileostrovsky' | 'primorsky' | 'moskovsky' | 'nevsky';

export type Property = {
  id: number;
  deal: Deal;
  rooms: number; // 0 = studio
  area: number;
  floor: number;
  floors: number;
  year: number;
  price: number; // RUB, per month for rent
  district: DistrictId;
  street: T;
  metro: T;
  walk: number;
  x: number;
  y: number;
  features: Feature[];
  facade: Facade;
  hue: number;
  daysAgo: number;
};

export const districts: { id: DistrictId; name: T; cx: number; cy: number; path: string }[] = [
  { id: 'primorsky', name: { ru: 'Приморский', en: 'Primorsky' }, cx: 210, cy: 110, path: 'M40 40 L360 30 L380 170 L60 200 Z' },
  { id: 'petrogradsky', name: { ru: 'Петроградский', en: 'Petrogradsky' }, cx: 500, cy: 160, path: 'M390 60 L640 70 L660 250 L400 250 Z' },
  { id: 'vasileostrovsky', name: { ru: 'Васильевский', en: 'Vasileostrovsky' }, cx: 210, cy: 300, path: 'M60 230 L370 230 L380 380 L70 390 Z' },
  { id: 'center', name: { ru: 'Центральный', en: 'Central' }, cx: 530, cy: 370, path: 'M420 290 L700 290 L700 450 L420 460 Z' },
  { id: 'nevsky', name: { ru: 'Невский', en: 'Nevsky' }, cx: 830, cy: 390, path: 'M740 220 L960 230 L950 560 L740 560 Z' },
  { id: 'moskovsky', name: { ru: 'Московский', en: 'Moskovsky' }, cx: 520, cy: 580, path: 'M380 490 L700 490 L690 670 L390 670 Z' },
];

const streets: Record<DistrictId, [string, string][]> = {
  center: [['Невский пр.', 'Nevsky Ave'], ['ул. Рубинштейна', 'Rubinshteina St'], ['наб. Фонтанки', 'Fontanka Emb.'], ['Литейный пр.', 'Liteyny Ave']],
  petrogradsky: [['Каменноостровский пр.', 'Kamennoostrovsky Ave'], ['Большой пр. П.С.', 'Bolshoy Ave P.S.'], ['ул. Рентгена', 'Rentgena St']],
  vasileostrovsky: [['Средний пр. В.О.', 'Sredny Ave V.O.'], ['7-я линия В.О.', '7th Line V.O.'], ['наб. Макарова', 'Makarova Emb.']],
  primorsky: [['Приморский пр.', 'Primorsky Ave'], ['ул. Савушкина', 'Savushkina St'], ['Коломяжский пр.', 'Kolomyazhsky Ave']],
  moskovsky: [['Московский пр.', 'Moskovsky Ave'], ['ул. Решетникова', 'Reshetnikova St'], ['Лиговский пр.', 'Ligovsky Ave']],
  nevsky: [['пр. Обуховской Обороны', 'Obukhovskoy Oborony Ave'], ['Дальневосточный пр.', 'Dalnevostochny Ave'], ['ул. Коллонтай', 'Kollontai St']],
};

const metros: Record<DistrictId, [string, string][]> = {
  center: [['Маяковская', 'Mayakovskaya'], ['Гостиный двор', 'Gostiny Dvor'], ['Владимирская', 'Vladimirskaya']],
  petrogradsky: [['Петроградская', 'Petrogradskaya'], ['Горьковская', 'Gorkovskaya'], ['Чкаловская', 'Chkalovskaya']],
  vasileostrovsky: [['Василеостровская', 'Vasileostrovskaya'], ['Приморская', 'Primorskaya']],
  primorsky: [['Чёрная речка', 'Chyornaya Rechka'], ['Старая Деревня', 'Staraya Derevnya'], ['Пионерская', 'Pionerskaya']],
  moskovsky: [['Московская', 'Moskovskaya'], ['Электросила', 'Elektrosila'], ['Парк Победы', 'Park Pobedy']],
  nevsky: [['Ломоносовская', 'Lomonosovskaya'], ['Пролетарская', 'Proletarskaya'], ['Ладожская', 'Ladozhskaya']],
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PRICE_PER_M2: Record<DistrictId, number> = {
  center: 340_000,
  petrogradsky: 330_000,
  vasileostrovsky: 260_000,
  primorsky: 210_000,
  moskovsky: 230_000,
  nevsky: 180_000,
};

/** Deterministic catalogue so every visitor (and every screenshot) sees the same listings. */
function generate(): Property[] {
  const r = rng(2026);
  const pick = <X>(a: X[]) => a[Math.floor(r() * a.length)];
  const all: FeatureList = ['balcony', 'parking', 'newbuild', 'view', 'furnished', 'pets'];
  const list: Property[] = [];
  for (let id = 1; id <= 30; id++) {
    const d = districts[Math.floor(r() * districts.length)];
    const deal: Deal = r() < 0.62 ? 'sale' : 'rent';
    const rooms = pick([0, 1, 1, 2, 2, 2, 3, 3, 4]);
    const area = Math.round((rooms === 0 ? 22 + r() * 12 : 28 + rooms * 18 + r() * 22) * 10) / 10;
    const facade: Facade = d.id === 'center' || d.id === 'petrogradsky' ? pick(['classic', 'classic', 'brick', 'modern']) : pick(['tower', 'modern', 'brick', 'tower']);
    const newbuild = facade === 'tower' || facade === 'modern' ? r() < 0.7 : false;
    const year = newbuild ? 2022 + Math.floor(r() * 5) : facade === 'classic' ? 1880 + Math.floor(r() * 50) : 1960 + Math.floor(r() * 50);
    const floors = facade === 'tower' ? 16 + Math.floor(r() * 12) : facade === 'classic' ? 5 + Math.floor(r() * 2) : 6 + Math.floor(r() * 10);
    const perM2 = PRICE_PER_M2[d.id] * (0.85 + r() * 0.35) * (newbuild ? 1.1 : 1);
    const salePrice = Math.round((area * perM2) / 50_000) * 50_000;
    const rent = Math.round((salePrice * 0.0042) / 1000) * 1000;
    const features = all.filter((f) => (f === 'newbuild' ? newbuild : r() < 0.38));
    const [sru, sen] = pick(streets[d.id]);
    const [mru, men] = pick(metros[d.id]);
    const house = 1 + Math.floor(r() * 90);
    // scatter inside the district shape around its centre
    const x = d.cx + (r() - 0.5) * 220;
    const y = d.cy + (r() - 0.5) * 110;
    list.push({
      id,
      deal,
      rooms,
      area,
      floor: 1 + Math.floor(r() * floors),
      floors,
      year,
      price: deal === 'sale' ? salePrice : rent,
      district: d.id,
      street: { ru: `${sru}, ${house}`, en: `${house} ${sen}` },
      metro: { ru: mru, en: men },
      walk: 3 + Math.floor(r() * 18),
      x: Math.max(60, Math.min(940, x)),
      y: Math.max(50, Math.min(650, y)),
      features,
      facade,
      hue: Math.floor(r() * 360),
      daysAgo: Math.floor(r() * 30),
    });
  }
  return list;
}

type FeatureList = Feature[];
export const properties = generate();
export const FEATURES: Feature[] = ['balcony', 'parking', 'newbuild', 'view', 'furnished', 'pets'];
