import { useEffect, useState } from 'react';
import { districts, FEATURES, type Property } from '../data';
import { useI18n } from '../i18n';
import { Facade } from '../art';
import { titleOf } from './PropertyCard';

type Props = { items: Property[]; onRemove: (id: number) => void; onClear: () => void; onOpen: (id: number) => void };

export default function Compare({ items, onRemove, onClear, onOpen }: Props) {
  const { t, lang, money, num } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    document.body.classList.add('no-scroll');
    return () => {
      window.removeEventListener('keydown', esc);
      document.body.classList.remove('no-scroll');
    };
  }, [open]);

  useEffect(() => {
    if (items.length === 0) setOpen(false);
  }, [items.length]);

  if (!items.length) return null;

  // best value per row is highlighted
  const minPerM2 = Math.min(...items.map((p) => p.price / p.area));
  const maxArea = Math.max(...items.map((p) => p.area));

  return (
    <>
      <div className="cbar" role="region" aria-label={t('compare')}>
        <div className="cbar__thumbs">
          {items.map((p) => (
            <button key={p.id} className="cbar__thumb" onClick={() => onRemove(p.id)} aria-label={`${t('clear')}: ${p.street[lang]}`}>
              <Facade p={p} className="cbar__img" />
              <span aria-hidden="true">✕</span>
            </button>
          ))}
        </div>
        <span className="cbar__hint">{t('compareHint', { n: items.length })}</span>
        <button className="link" onClick={onClear}>
          {t('clear')}
        </button>
        <button className="btn btn--primary btn--sm" disabled={items.length < 2} onClick={() => setOpen(true)}>
          {t('compare')}
        </button>
      </div>

      {open && (
        <div className="cmodal" role="dialog" aria-modal="true" aria-label={t('compareTitle')} onClick={() => setOpen(false)}>
          <div className="cmodal__box" onClick={(e) => e.stopPropagation()}>
            <div className="cmodal__head">
              <h2>{t('compareTitle')}</h2>
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label={t('close')} autoFocus>
                ✕
              </button>
            </div>
            <div className="ctable-wrap">
              <table className="ctable">
                <thead>
                  <tr>
                    <th />
                    {items.map((p) => (
                      <th key={p.id}>
                        <button
                          className="ctable__head"
                          onClick={() => {
                            setOpen(false);
                            onOpen(p.id);
                          }}
                        >
                          <Facade p={p} className="ctable__img" />
                          <span>{titleOf(p, t)}</span>
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>{t('price')}</th>
                    {items.map((p) => (
                      <td key={p.id}>
                        <strong>{money(p.price)}</strong>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>{t('perM2', { p: '' }).trim()}</th>
                    {items.map((p) => (
                      <td key={p.id} className={p.price / p.area === minPerM2 ? 'is-best' : ''}>
                        {money(Math.round(p.price / p.area))}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>{t('totalArea')}</th>
                    {items.map((p) => (
                      <td key={p.id} className={p.area === maxArea ? 'is-best' : ''}>
                        {num(p.area)} {t('m2')}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>{t('floorL')}</th>
                    {items.map((p) => (
                      <td key={p.id}>
                        {p.floor} / {p.floors}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>{t('year')}</th>
                    {items.map((p) => (
                      <td key={p.id}>{p.year}</td>
                    ))}
                  </tr>
                  <tr>
                    <th>{t('district')}</th>
                    {items.map((p) => (
                      <td key={p.id}>{districts.find((d) => d.id === p.district)!.name[lang]}</td>
                    ))}
                  </tr>
                  <tr>
                    <th>{t('metro')}</th>
                    {items.map((p) => (
                      <td key={p.id}>
                        {p.metro[lang]} · {t('walk', { n: p.walk })}
                      </td>
                    ))}
                  </tr>
                  {FEATURES.map((f) => (
                    <tr key={f}>
                      <th>{t(`f.${f}`)}</th>
                      {items.map((p) => (
                        <td key={p.id} className="ctable__feat">
                          {p.features.includes(f) ? '✓' : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
