import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { districts, type Property } from '../data';
import { useI18n } from '../i18n';
import { Facade, FloorPlan } from '../art';
import { titleOf } from './PropertyCard';

function Mortgage({ price }: { price: number }) {
  const { t, money } = useI18n();
  const [downPct, setDownPct] = useState(30);
  const [rate, setRate] = useState(16);
  const [years, setYears] = useState(20);

  const loan = price * (1 - downPct / 100);
  const r = rate / 100 / 12;
  const n = years * 12;
  const monthly = r === 0 ? loan / n : (loan * r) / (1 - Math.pow(1 + r, -n));
  const total = monthly * n;
  const interest = total - loan;
  const share = total > 0 ? loan / total : 1;
  const C = 2 * Math.PI * 42;

  return (
    <section className="panel mortgage">
      <h3>{t('mortgage')}</h3>
      <div className="mortgage__grid">
        <div className="mortgage__inputs">
          <label className="slider">
            <span>
              {t('down')} <strong>{downPct}% · {money(price * (downPct / 100))}</strong>
            </span>
            <input type="range" min={10} max={90} step={5} value={downPct} onChange={(e) => setDownPct(Number(e.target.value))} />
          </label>
          <label className="slider">
            <span>
              {t('rate')} <strong>{rate.toFixed(1)}%</strong>
            </span>
            <input type="range" min={2} max={25} step={0.5} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          </label>
          <label className="slider">
            <span>
              {t('term')} <strong>{t('years', { n: years })}</strong>
            </span>
            <input type="range" min={5} max={30} step={1} value={years} onChange={(e) => setYears(Number(e.target.value))} />
          </label>
        </div>
        <div className="mortgage__result">
          <svg viewBox="0 0 100 100" className="donut" aria-hidden="true">
            <circle cx="50" cy="50" r="42" className="donut__bg" />
            <circle cx="50" cy="50" r="42" className="donut__fg" style={{ strokeDasharray: `${C * share} ${C}` }} />
          </svg>
          <div className="mortgage__monthly">
            <small>{t('monthly')}</small>
            <strong>{money(Math.round(monthly))}</strong>
          </div>
          <dl>
            <div>
              <dt>
                <i className="sw sw--p" />
                {t('loan')}
              </dt>
              <dd>{money(Math.round(loan))}</dd>
            </div>
            <div>
              <dt>
                <i className="sw sw--i" />
                {t('overpay')}
              </dt>
              <dd>{money(Math.round(interest))}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function AgentForm() {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState(t('msgDefault'));
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = t('errName');
    if (phone.replace(/\D/g, '').length < 10) next.phone = t('errPhone');
    setErrors(next);
    if (!Object.keys(next).length) setSent(true);
  };

  if (sent) return <p className="sent" role="status">✓ {t('sent')}</p>;

  return (
    <form className="agent" onSubmit={submit} noValidate>
      <label className={errors.name ? 'has-error' : ''}>
        <span>{t('name')}</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={!!errors.name} />
        {errors.name && <em role="alert">{errors.name}</em>}
      </label>
      <label className={errors.phone ? 'has-error' : ''}>
        <span>{t('phone')}</span>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 900 000-00-00" autoComplete="tel" aria-invalid={!!errors.phone} />
        {errors.phone && <em role="alert">{errors.phone}</em>}
      </label>
      <label>
        <span>{t('message')}</span>
        <textarea rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} />
      </label>
      <button className="btn btn--primary btn--block">{t('send')}</button>
    </form>
  );
}

type Props = { p: Property; fav: boolean; onFav: () => void; onClose: () => void; onShare: () => void };

export default function PropertyView({ p, fav, onFav, onClose, onShare }: Props) {
  const { t, lang, money, num } = useI18n();
  const [slide, setSlide] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const district = districts.find((d) => d.id === p.district)!;
  const labels = useMemo(
    () => ({ living: t('living'), bedroom: t('bedroom'), kitchen: t('kitchen'), bath: t('bath'), hall: t('hall'), studio: t('studioRoom'), m2: t('m2'), fmt: num }),
    [t, num]
  );

  useEffect(() => {
    document.body.classList.add('no-scroll');
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setSlide(1);
      if (e.key === 'ArrowLeft') setSlide(0);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('no-scroll');
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="view" role="dialog" aria-modal="true" aria-label={titleOf(p, t)}>
      <div className="view__inner" ref={ref} tabIndex={-1}>
        <div className="view__top">
          <button className="link" onClick={onClose}>
            ← {t('back')}
          </button>
          <div className="view__actions">
            <button className="icon-btn" onClick={onShare} aria-label={t('share')} title={t('share')}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button className={`icon-btn fav-inline${fav ? ' is-on' : ''}`} onClick={onFav} aria-pressed={fav} aria-label={fav ? t('removeFav') : t('addFav')}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M12 20s-7-4.4-9.2-8.6C1.2 8.2 3.2 4.5 6.8 4.5c2 0 3.5 1.1 4.2 2.5.7-1.4 2.2-2.5 4.2-2.5 3.6 0 5.6 3.7 4 6.9C19 15.6 12 20 12 20Z" />
              </svg>
            </button>
            <button className="icon-btn" onClick={onClose} aria-label={t('close')}>
              ✕
            </button>
          </div>
        </div>

        <div className="view__grid">
          <div className="view__main">
            <div className="gallery">
              <div className="gallery__stage">
                <div className={`gallery__slide${slide === 0 ? ' is-on' : ''}`}>
                  <Facade p={p} className="gallery__img" />
                </div>
                <div className={`gallery__slide gallery__slide--plan${slide === 1 ? ' is-on' : ''}`}>
                  <FloorPlan p={p} labels={labels} className="gallery__img" />
                </div>
              </div>
              <div className="gallery__thumbs" role="tablist">
                {[t('facade'), t('plan')].map((label, i) => (
                  <button key={label} role="tab" aria-selected={slide === i} className={slide === i ? 'is-on' : ''} onClick={() => setSlide(i)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <section className="panel">
              <h1 className="view__title">
                {titleOf(p, t)}, {num(p.area)} {t('m2')}
              </h1>
              <p className="view__addr">
                {p.street[lang]} · <i className="metro-dot">M</i> {p.metro[lang]}, {t('walk', { n: p.walk })}
              </p>
              <h3>{t('about')}</h3>
              <dl className="specs">
                <div>
                  <dt>{t('totalArea')}</dt>
                  <dd>
                    {num(p.area)} {t('m2')}
                  </dd>
                </div>
                <div>
                  <dt>{t('floorL')}</dt>
                  <dd>
                    {p.floor} / {p.floors}
                  </dd>
                </div>
                <div>
                  <dt>{t('year')}</dt>
                  <dd>{p.year}</dd>
                </div>
                <div>
                  <dt>{t('district')}</dt>
                  <dd>{district.name[lang]}</dd>
                </div>
              </dl>
              {p.features.length > 0 && (
                <ul className="tags">
                  {p.features.map((f) => (
                    <li key={f}>✓ {t(`f.${f}`)}</li>
                  ))}
                </ul>
              )}
            </section>

            {p.deal === 'sale' ? (
              <Mortgage price={p.price} />
            ) : (
              <section className="panel">
                <h3>{t('rentInfo')}</h3>
                <dl className="specs">
                  <div>
                    <dt>{t('deposit')}</dt>
                    <dd>{money(p.price)}</dd>
                  </div>
                  <div>
                    <dt>{t('commission')}</dt>
                    <dd>{t('noCommission')}</dd>
                  </div>
                  <div>
                    <dt>{t('minTerm')}</dt>
                    <dd>{t('months')}</dd>
                  </div>
                </dl>
              </section>
            )}
          </div>

          <aside className="view__side">
            <div className="panel panel--sticky">
              <p className="view__price">
                {money(p.price)}
                {p.deal === 'rent' && <small>{t('perMonth')}</small>}
              </p>
              {p.deal === 'sale' && <p className="card__m2">{t('perM2', { p: money(Math.round(p.price / p.area / 100) * 100) })}</p>}
              <div className="agent-head">
                <span className="avatar" aria-hidden="true">{lang === 'ru' ? 'ЕК' : 'EK'}</span>
                <div>
                  <strong>{lang === 'ru' ? 'Екатерина Климова' : 'Ekaterina Klimova'}</strong>
                  <small>Kvartal · 4.9 ★</small>
                </div>
              </div>
              <h3>{t('agent')}</h3>
              <AgentForm />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
