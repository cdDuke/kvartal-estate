import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { districts, FEATURES } from '../data';
import { RANGE, defaults, isDirty, type Filters, type SortKey } from '../filters';
import { useI18n } from '../i18n';

type Props = { f: Filters; set: (f: Filters) => void; count: number };

const toggle = <X,>(arr: X[], x: X) => (arr.includes(x) ? arr.filter((y) => y !== x) : [...arr, x]);

function DualRange({ f, set }: Props) {
  const { t, compact } = useI18n();
  const r = RANGE[f.deal];
  const lo = f.min ?? r.min;
  const hi = f.max ?? r.max;
  const pct = (v: number) => ((v - r.min) / (r.max - r.min)) * 100;
  const setLo = (v: number) => set({ ...f, min: v <= r.min ? null : Math.min(v, hi - r.step) });
  const setHi = (v: number) => set({ ...f, max: v >= r.max ? null : Math.max(v, lo + r.step) });

  return (
    <div className="dual">
      <div className="dual__label">
        <span>{t('price')}</span>
        <strong>
          {compact(lo)} — {hi >= r.max ? '∞' : compact(hi)} ₽
        </strong>
      </div>
      <div className="dual__track" style={{ '--a': `${pct(lo)}%`, '--b': `${pct(hi)}%` } as CSSProperties}>
        <input type="range" min={r.min} max={r.max} step={r.step} value={lo} onChange={(e) => setLo(Number(e.target.value))} aria-label={`${t('price')} ${t('from')}`} />
        <input type="range" min={r.min} max={r.max} step={r.step} value={hi} onChange={(e) => setHi(Number(e.target.value))} aria-label={`${t('price')} ${t('to')}`} />
      </div>
    </div>
  );
}

function DistrictPicker({ f, set }: Props) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', esc);
    };
  }, []);

  const label = f.districts.length === 0 ? t('allDistricts') : f.districts.length === 1 ? districts.find((d) => d.id === f.districts[0])!.name[lang] : `${t('districts')}: ${f.districts.length}`;

  return (
    <div className="picker" ref={ref}>
      <button className={`select-btn${f.districts.length ? ' is-set' : ''}`} aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)}>
        {label}
        <svg viewBox="0 0 12 8" width="10" height="8" aria-hidden="true">
          <path d="m1 1.5 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      {open && (
        <div className="picker__menu" role="group" aria-label={t('districts')}>
          {districts.map((d) => (
            <label key={d.id} className="check">
              <input type="checkbox" checked={f.districts.includes(d.id)} onChange={() => set({ ...f, districts: toggle(f.districts, d.id) })} />
              <span className="check__box" aria-hidden="true" />
              {d.name[lang]}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FiltersBar(props: Props) {
  const { f, set, count } = props;
  const { t } = useI18n();
  const rooms = [0, 1, 2, 3, 4];

  return (
    <section className="filters" aria-label={t('rooms')}>
      <div className="filters__row">
        <div className="rooms" role="group" aria-label={t('rooms')}>
          {rooms.map((n) => (
            <button key={n} className={`room${f.rooms.includes(n) ? ' is-on' : ''}`} aria-pressed={f.rooms.includes(n)} onClick={() => set({ ...f, rooms: toggle(f.rooms, n) })}>
              {n === 0 ? t('studio') : n === 4 ? '4+' : n}
            </button>
          ))}
        </div>

        <DualRange {...props} />

        <label className="area-input">
          <span>{t('area')}</span>
          <input
            type="number"
            inputMode="numeric"
            min={10}
            max={300}
            placeholder="—"
            value={f.area ?? ''}
            onChange={(e) => set({ ...f, area: e.target.value ? Math.max(0, Number(e.target.value)) : null })}
          />
          <em>{t('m2')}</em>
        </label>

        <DistrictPicker {...props} />
      </div>

      <div className="filters__row filters__row--second">
        <div className="features" role="group" aria-label={t('features')}>
          {FEATURES.map((x) => (
            <button key={x} className={`feat${f.features.includes(x) ? ' is-on' : ''}`} aria-pressed={f.features.includes(x)} onClick={() => set({ ...f, features: toggle(f.features, x) })}>
              {t(`f.${x}`)}
            </button>
          ))}
        </div>
        <div className="filters__tools">
          <span className="found" aria-live="polite">
            {t('found', { n: count })}
          </span>
          {isDirty(f) && (
            <button className="link" onClick={() => set({ ...defaults(f.deal), sort: f.sort, view: f.view })}>
              {t('reset')}
            </button>
          )}
          <label className="sort">
            <span className="sr-only">{t('sort')}</span>
            <select value={f.sort} onChange={(e) => set({ ...f, sort: e.target.value as SortKey })}>
              {(['new', 'cheap', 'expensive', 'm2', 'area'] as SortKey[]).map((s) => (
                <option key={s} value={s}>
                  {t(`s.${s}`)}
                </option>
              ))}
            </select>
          </label>
          <div className="viewtoggle" role="group">
            <button className={f.view === 'list' ? 'is-on' : ''} aria-pressed={f.view === 'list'} onClick={() => set({ ...f, view: 'list' })}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M4 5h16M4 12h16M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {t('list')}
            </button>
            <button className={f.view === 'map' ? 'is-on' : ''} aria-pressed={f.view === 'map'} onClick={() => set({ ...f, view: 'map' })}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              {t('map')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
