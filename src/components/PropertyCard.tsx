import { memo } from 'react';
import { districts, type Property } from '../data';
import { useI18n } from '../i18n';
import { Facade } from '../art';

type Props = {
  p: Property;
  fav: boolean;
  inCompare: boolean;
  highlighted: boolean;
  onFav: () => void;
  onCompare: () => void;
  onOpen: () => void;
  onHover: (id: number | null) => void;
};

export function titleOf(p: Property, t: ReturnType<typeof useI18n>['t']) {
  return p.rooms === 0 ? t('studioFlat') : t('roomsN', { n: p.rooms });
}

function PropertyCard({ p, fav, inCompare, highlighted, onFav, onCompare, onOpen, onHover }: Props) {
  const { t, lang, money, locale, num } = useI18n();
  const district = districts.find((d) => d.id === p.district)!;
  const perM2 = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Math.round(p.price / p.area / 100) * 100);

  return (
    <article
      className={`card${highlighted ? ' is-hl' : ''}`}
      id={`card-${p.id}`}
      onPointerEnter={() => onHover(p.id)}
      onPointerLeave={() => onHover(null)}
    >
      <button className="card__media" onClick={onOpen} aria-label={`${titleOf(p, t)}, ${p.street[lang]}`}>
        <Facade p={p} className="card__img" />
        <span className="card__badges">
          {p.features.includes('newbuild') && <span className="badge badge--new">{t('f.newbuild')}</span>}
          {p.daysAgo <= 2 && <span className="badge">{p.daysAgo === 0 ? t('posted') : t('postedDays', { n: p.daysAgo })}</span>}
        </span>
      </button>
      <button className={`fav${fav ? ' is-on' : ''}`} onClick={onFav} aria-pressed={fav} aria-label={fav ? t('removeFav') : t('addFav')}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M12 20s-7-4.4-9.2-8.6C1.2 8.2 3.2 4.5 6.8 4.5c2 0 3.5 1.1 4.2 2.5.7-1.4 2.2-2.5 4.2-2.5 3.6 0 5.6 3.7 4 6.9C19 15.6 12 20 12 20Z" />
        </svg>
      </button>

      <div className="card__body">
        <p className="card__price">
          {money(p.price)}
          {p.deal === 'rent' && <small>{t('perMonth')}</small>}
        </p>
        {p.deal === 'sale' && <p className="card__m2">{t('perM2', { p: `${perM2} ₽` })}</p>}
        <h3 className="card__title">
          <button onClick={onOpen}>
            {titleOf(p, t)}, {num(p.area)} {t('m2')}
          </button>
        </h3>
        <p className="card__meta">
          {t('floor', { f: p.floor, n: p.floors })} · {district.name[lang]}
        </p>
        <p className="card__addr">{p.street[lang]}</p>
        <p className="card__metro">
          <i aria-hidden="true">M</i> {p.metro[lang]} · {t('walk', { n: p.walk })}
        </p>
        <label className="check check--sm card__compare">
          <input type="checkbox" checked={inCompare} onChange={onCompare} />
          <span className="check__box" aria-hidden="true" />
          {inCompare ? t('inCompare') : t('addCompare')}
        </label>
      </div>
    </article>
  );
}

export default memo(PropertyCard);
