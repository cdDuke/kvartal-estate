import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from './data';

const dict = {
  ru: {
    title: 'Kvartal — квартиры в Петербурге',
    buy: 'Купить',
    rent: 'Снять',
    favs: 'Избранное',
    compare: 'Сравнить',
    heroTitle: 'Найдите дом, в котором <em>хочется жить</em>',
    heroSub: '{n} проверенных объявлений в Санкт-Петербурге — с планировками и честной ценой за метр.',
    rooms: 'Комнаты',
    studio: 'Студия',
    price: 'Цена',
    from: 'от',
    to: 'до',
    area: 'Площадь от',
    districts: 'Районы',
    allDistricts: 'Все районы',
    features: 'Удобства',
    'f.balcony': 'Балкон',
    'f.parking': 'Парковка',
    'f.newbuild': 'Новостройка',
    'f.view': 'Видовая',
    'f.furnished': 'С мебелью',
    'f.pets': 'Можно с питомцами',
    sort: 'Сортировка',
    's.new': 'Сначала новые',
    's.cheap': 'Сначала дешевле',
    's.expensive': 'Сначала дороже',
    's.m2': 'Цена за м²',
    's.area': 'По площади',
    list: 'Список',
    map: 'Карта',
    found: 'Найдено: {n}',
    reset: 'Сбросить',
    empty: 'Под такие условия пока ничего нет',
    emptyHint: 'Попробуйте расширить бюджет или выбрать больше районов.',
    perMonth: '/мес',
    perM2: '{p} за м²',
    walk: '{n} мин пешком',
    floor: '{f} из {n} этажа',
    roomsN: '{n}-комн. квартира',
    studioFlat: 'Квартира-студия',
    posted: 'сегодня',
    postedDays: '{n} дн. назад',
    addFav: 'В избранное',
    removeFav: 'Убрать из избранного',
    addCompare: 'К сравнению',
    inCompare: 'В сравнении',
    compareTitle: 'Сравнение объектов',
    compareHint: 'Выбрано {n} из 3',
    clear: 'Очистить',
    close: 'Закрыть',
    back: 'Назад к списку',
    facade: 'Фасад',
    plan: 'Планировка',
    about: 'Об объекте',
    totalArea: 'Общая площадь',
    floorL: 'Этаж',
    year: 'Год постройки',
    district: 'Район',
    metro: 'Метро',
    mortgage: 'Ипотечный калькулятор',
    down: 'Первый взнос',
    rate: 'Ставка',
    term: 'Срок',
    years: '{n} лет',
    monthly: 'Ежемесячный платёж',
    loan: 'Сумма кредита',
    overpay: 'Переплата',
    principal: 'Основной долг',
    interest: 'Проценты',
    rentInfo: 'Условия аренды',
    deposit: 'Залог',
    commission: 'Комиссия',
    noCommission: 'без комиссии',
    minTerm: 'Минимальный срок',
    months: '11 месяцев',
    agent: 'Связаться с агентом',
    name: 'Имя',
    phone: 'Телефон',
    message: 'Сообщение',
    msgDefault: 'Здравствуйте! Хочу посмотреть квартиру.',
    send: 'Записаться на просмотр',
    sent: 'Заявка отправлена — агент перезвонит в течение 15 минут.',
    errName: 'Укажите имя',
    errPhone: 'Проверьте номер телефона',
    living: 'Гостиная',
    bedroom: 'Спальня',
    kitchen: 'Кухня',
    bath: 'Санузел',
    hall: 'Прихожая',
    studioRoom: 'Комната-студия',
    m2: 'м²',
    footer: 'Kvartal · концепт сервиса недвижимости для портфолио. Объявления сгенерированы.',
    share: 'Скопировать ссылку',
    copied: 'Ссылка скопирована',
    mapHint: 'Наведите на метку, чтобы увидеть объект',
  },
  en: {
    title: 'Kvartal — homes in St Petersburg',
    buy: 'Buy',
    rent: 'Rent',
    favs: 'Saved',
    compare: 'Compare',
    heroTitle: 'Find a home you’ll <em>love living in</em>',
    heroSub: '{n} verified listings in St Petersburg — with floor plans and honest price per square metre.',
    rooms: 'Rooms',
    studio: 'Studio',
    price: 'Price',
    from: 'from',
    to: 'to',
    area: 'Area from',
    districts: 'Districts',
    allDistricts: 'All districts',
    features: 'Amenities',
    'f.balcony': 'Balcony',
    'f.parking': 'Parking',
    'f.newbuild': 'New build',
    'f.view': 'Great view',
    'f.furnished': 'Furnished',
    'f.pets': 'Pets allowed',
    sort: 'Sort by',
    's.new': 'Newest first',
    's.cheap': 'Price: low to high',
    's.expensive': 'Price: high to low',
    's.m2': 'Price per m²',
    's.area': 'Largest first',
    list: 'List',
    map: 'Map',
    found: '{n} found',
    reset: 'Reset',
    empty: 'Nothing matches these filters yet',
    emptyHint: 'Try a bigger budget or more districts.',
    perMonth: '/mo',
    perM2: '{p} per m²',
    walk: '{n} min walk',
    floor: 'floor {f} of {n}',
    roomsN: '{n}-room apartment',
    studioFlat: 'Studio apartment',
    posted: 'today',
    postedDays: '{n} days ago',
    addFav: 'Save',
    removeFav: 'Remove from saved',
    addCompare: 'Compare',
    inCompare: 'Comparing',
    compareTitle: 'Compare listings',
    compareHint: '{n} of 3 selected',
    clear: 'Clear',
    close: 'Close',
    back: 'Back to results',
    facade: 'Facade',
    plan: 'Floor plan',
    about: 'About this home',
    totalArea: 'Total area',
    floorL: 'Floor',
    year: 'Built',
    district: 'District',
    metro: 'Metro',
    mortgage: 'Mortgage calculator',
    down: 'Down payment',
    rate: 'Interest rate',
    term: 'Term',
    years: '{n} years',
    monthly: 'Monthly payment',
    loan: 'Loan amount',
    overpay: 'Total interest',
    principal: 'Principal',
    interest: 'Interest',
    rentInfo: 'Rental terms',
    deposit: 'Deposit',
    commission: 'Fee',
    noCommission: 'no agency fee',
    minTerm: 'Minimum term',
    months: '11 months',
    agent: 'Contact the agent',
    name: 'Name',
    phone: 'Phone',
    message: 'Message',
    msgDefault: 'Hi! I would like to book a viewing.',
    send: 'Book a viewing',
    sent: 'Request sent — the agent will call you back within 15 minutes.',
    errName: 'Please enter your name',
    errPhone: 'Please check the phone number',
    living: 'Living room',
    bedroom: 'Bedroom',
    kitchen: 'Kitchen',
    bath: 'Bathroom',
    hall: 'Hall',
    studioRoom: 'Studio room',
    m2: 'm²',
    footer: 'Kvartal · real-estate concept for a portfolio. Listings are generated.',
    share: 'Copy link',
    copied: 'Link copied',
    mapHint: 'Hover a pin to preview the home',
  },
} satisfies Record<Lang, Record<string, string>>;

export type Key = keyof (typeof dict)['ru'];

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key, vars?: Record<string, string | number>) => string;
  locale: string;
  money: (n: number) => string;
  compact: (n: number) => string;
  num: (n: number) => string;
};

const I18n = createContext<Ctx | null>(null);

const readLang = (): Lang => {
  try {
    const v = localStorage.getItem('lang');
    if (v === 'ru' || v === 'en') return v;
  } catch {
    /* blocked */
  }
  return 'ru';
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('lang', l);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = dict[lang].title;
  }, [lang]);

  const value = useMemo<Ctx>(() => {
    const locale = lang === 'ru' ? 'ru-RU' : 'en-GB';
    const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
    const compact = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 });
    return {
      lang,
      setLang,
      locale,
      t: (k, vars = {}) => dict[lang][k].replace(/\{(\w+)\}/g, (_, v: string) => String(vars[v] ?? '')),
      money: (n) => money.format(n),
      compact: (n) => compact.format(n),
      num: (n) => n.toLocaleString(locale, { maximumFractionDigits: 1 }),
    };
  }, [lang, setLang]);

  return <I18n.Provider value={value}>{children}</I18n.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18n);
  if (!ctx) throw new Error('useI18n outside provider');
  return ctx;
}
