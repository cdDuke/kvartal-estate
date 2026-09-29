import { useCallback, useEffect, useMemo, useState } from 'react';
import { properties, type Deal } from './data';
import { apply, defaults, fromURL, toURL, type Filters } from './filters';
import { useI18n } from './i18n';
import { useLocalStorage } from './useLocalStorage';
import FiltersBar from './components/FiltersBar';
import PropertyCard from './components/PropertyCard';
import CityMap from './components/CityMap';
import PropertyView from './components/PropertyView';
import Compare from './components/Compare';

/** Property pages live in the hash (#/p/12) so the back button closes them. */
const readHash = () => {
  const m = location.hash.match(/^#\/p\/(\d+)$/);
  return m ? Number(m[1]) : null;
};

export default function App() {
  const { t, lang, setLang } = useI18n();
  const [filters, setFiltersState] = useState<Filters>(() => fromURL(location.search));
  const [favs, setFavs] = useLocalStorage<number[]>('kvartal-favs', []);
  const [compare, setCompare] = useLocalStorage<number[]>('kvartal-compare', []);
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [openId, setOpenId] = useState<number | null>(readHash);
  const [toast, setToast] = useState('');

  // keep the query string in sync without adding history entries
  const setFilters = useCallback((f: Filters) => {
    setFiltersState(f);
    history.replaceState(null, '', `${location.pathname}${toURL(f)}${location.hash}`);
  }, []);

  useEffect(() => {
    const onHash = () => setOpenId(readHash());
    const onPop = () => setFiltersState(fromURL(location.search));
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  const results = useMemo(() => {
    const list = apply(properties, filters);
    return onlyFavs ? list.filter((p) => favs.includes(p.id)) : list;
  }, [filters, onlyFavs, favs]);

  const open = (id: number) => (location.hash = `/p/${id}`);
  const close = useCallback(() => {
    if (history.length > 1 && readHash() !== null) history.back();
    else location.hash = '';
  }, []);

  const toggleFav = (id: number) => setFavs(favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id]);
  const toggleCompare = (id: number) => setCompare(compare.includes(id) ? compare.filter((x) => x !== id) : [...compare, id].slice(-3));

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      notify(t('copied'));
    } catch {
      notify(location.href);
    }
  };

  const setDeal = (deal: Deal) => setFilters({ ...defaults(deal), view: filters.view, sort: filters.sort });
  const current = openId ? properties.find((p) => p.id === openId) : undefined;
  const compareItems = compare.map((id) => properties.find((p) => p.id === id)!).filter(Boolean);
  const totalForDeal = properties.filter((p) => p.deal === filters.deal).length;

  return (
    <>
      <header className="header">
        <a href="./" className="logo" aria-label="Kvartal">
          <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
            <rect width="32" height="32" rx="9" fill="currentColor" />
            <path d="M8 24V13l8-5 8 5v11h-5v-6h-6v6Z" fill="#fff" />
          </svg>
          Kvartal
        </a>
        <div className="deal" role="group" aria-label={`${t('buy')} / ${t('rent')}`}>
          {(['sale', 'rent'] as Deal[]).map((d) => (
            <button key={d} className={filters.deal === d ? 'is-on' : ''} aria-pressed={filters.deal === d} onClick={() => setDeal(d)}>
              {d === 'sale' ? t('buy') : t('rent')}
            </button>
          ))}
        </div>
        <div className="header__right">
          <button className={`chip-btn${onlyFavs ? ' is-on' : ''}`} aria-pressed={onlyFavs} onClick={() => setOnlyFavs((v) => !v)}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M12 20s-7-4.4-9.2-8.6C1.2 8.2 3.2 4.5 6.8 4.5c2 0 3.5 1.1 4.2 2.5.7-1.4 2.2-2.5 4.2-2.5 3.6 0 5.6 3.7 4 6.9C19 15.6 12 20 12 20Z" />
            </svg>
            <span className="hide-sm">{t('favs')}</span>
            {favs.length > 0 && <b>{favs.length}</b>}
          </button>
          <div className="lang" role="group" aria-label="Language">
            {(['ru', 'en'] as const).map((l) => (
              <button key={l} className={lang === l ? 'is-on' : ''} aria-pressed={lang === l} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="main">
        <section className="intro">
          <h1 dangerouslySetInnerHTML={{ __html: t('heroTitle') }} />
          <p>{t('heroSub', { n: totalForDeal })}</p>
        </section>

        <FiltersBar f={filters} set={setFilters} count={results.length} />

        {results.length === 0 ? (
          <div className="empty">
            <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
              <path d="M10 54V26l22-14 22 14v28H38V38H26v16Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
            </svg>
            <h2>{t('empty')}</h2>
            <p>{t('emptyHint')}</p>
            <button className="btn btn--primary" onClick={() => setFilters({ ...defaults(filters.deal), view: filters.view })}>
              {t('reset')}
            </button>
          </div>
        ) : (
          <div className={`results results--${filters.view}`}>
            <div className="grid">
              {results.map((p) => (
                <PropertyCard
                  key={p.id}
                  p={p}
                  fav={favs.includes(p.id)}
                  inCompare={compare.includes(p.id)}
                  highlighted={hovered === p.id}
                  onFav={() => toggleFav(p.id)}
                  onCompare={() => toggleCompare(p.id)}
                  onOpen={() => open(p.id)}
                  onHover={setHovered}
                />
              ))}
            </div>
            {filters.view === 'map' && (
              <div className="results__map">
                <CityMap
                  list={results}
                  hovered={hovered}
                  onHover={(id) => {
                    setHovered(id);
                    if (id) document.getElementById(`card-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                  }}
                  onOpen={open}
                  selectedDistricts={filters.districts}
                />
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer">{t('footer')}</footer>

      <Compare items={compareItems} onRemove={toggleCompare} onClear={() => setCompare([])} onOpen={open} />

      {current && <PropertyView key={current.id} p={current} fav={favs.includes(current.id)} onFav={() => toggleFav(current.id)} onClose={close} onShare={share} />}

      <div className={`toast${toast ? ' is-on' : ''}`} role="status">
        {toast}
      </div>
    </>
  );
}
