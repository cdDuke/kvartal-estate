import { districts, type Property } from '../data';
import { useI18n } from '../i18n';

type Props = {
  list: Property[];
  hovered: number | null;
  onHover: (id: number | null) => void;
  onOpen: (id: number) => void;
  selectedDistricts: string[];
};

/** Stylised SVG city map with price pins (no map tiles or API keys needed). */
export default function CityMap({ list, hovered, onHover, onOpen, selectedDistricts }: Props) {
  const { t, lang, compact } = useI18n();
  const sorted = [...list].sort((a, b) => (a.id === hovered ? 1 : b.id === hovered ? -1 : a.y - b.y));

  return (
    <div className="map" role="region" aria-label={t('map')}>
      <svg viewBox="0 0 1000 700" className="map__svg">
        <rect width="1000" height="700" fill="#eef1ea" />
        {/* districts */}
        {districts.map((d) => (
          <g key={d.id}>
            <path d={d.path} className={`map__district${selectedDistricts.includes(d.id) ? ' is-on' : ''}`} />
            <text x={d.cx} y={d.cy - 30} className="map__label" textAnchor="middle">
              {d.name[lang]}
            </text>
          </g>
        ))}
        {/* parks */}
        <ellipse cx="560" cy="200" rx="60" ry="30" fill="#cfe2c2" />
        <ellipse cx="300" cy="610" rx="80" ry="40" fill="#cfe2c2" />
        {/* river */}
        <path
          className="map__river"
          d="M-20 250 C120 230 260 200 380 262 S560 280 640 262 S700 170 760 180 S880 300 980 280 L1020 300 L1020 330 C900 330 820 250 770 220 S700 300 640 300 S470 310 380 300 S150 270 -20 290 Z"
        />
        {/* roads */}
        <g className="map__roads">
          <path d="M0 470 L1000 450" />
          <path d="M560 0 L540 700" />
          <path d="M100 0 L380 700" />
          <path d="M1000 120 L700 700" />
        </g>
        {/* pins */}
        {sorted.map((p) => {
          const on = p.id === hovered;
          const label = compact(p.price);
          const w = label.length * 12.5 + 26;
          return (
            <g
              key={p.id}
              className={`pin${on ? ' is-on' : ''}`}
              transform={`translate(${p.x} ${p.y})`}
              tabIndex={0}
              role="button"
              aria-label={`${label} ₽ — ${p.street[lang]}`}
              onPointerEnter={() => onHover(p.id)}
              onPointerLeave={() => onHover(null)}
              onFocus={() => onHover(p.id)}
              onBlur={() => onHover(null)}
              onClick={() => onOpen(p.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen(p.id))}
            >
              <rect x={-w / 2} y={-44} width={w} height={36} rx={18} />
              <path d="M-6 -9 L0 -2 L6 -9Z" />
              <text y={-19} textAnchor="middle">
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="map__hint">{t('mapHint')}</p>
    </div>
  );
}
