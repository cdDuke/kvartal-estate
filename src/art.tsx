import { memo, useId } from 'react';
import type { Property } from './data';

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

const PALETTES = {
  classic: ['#e9c46a', '#f4a261', '#e5d3b3', '#9fc5a3', '#d8a7b1'],
  brick: ['#b5543c', '#9c4a36', '#c46a4a'],
  tower: ['#7aa2c8', '#8fb3cf', '#6c8fb3'],
  modern: ['#f1ede6', '#e6e1d8', '#dcd5c9'],
} as const;

/** Stylised facade illustration for a listing (no photos needed). */
export const Facade = memo(function Facade({ p, className }: { p: Property; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const r = rng(p.id * 97);
  const pal = PALETTES[p.facade];
  const wall = pal[p.id % pal.length];
  const W = 400;
  const H = 280;
  const sky = p.hue % 2 ? ['#bcd8f5', '#eef6ff'] : ['#f7d9c4', '#fdf1e7'];

  const cols = p.facade === 'tower' ? 7 : p.facade === 'classic' ? 6 : 5;
  const rows = p.facade === 'tower' ? 9 : p.facade === 'classic' ? 5 : 6;
  const bx = p.facade === 'tower' ? 110 : 60;
  const bw = W - bx * 2;
  const top = p.facade === 'tower' ? 20 : p.facade === 'classic' ? 70 : 50;
  const bottom = 246;
  const winW = (bw / cols) * 0.5;
  const rowH = (bottom - top - 30) / rows;

  const windows = [];
  for (let row = 0; row < rows; row++) {
    for (let c = 0; c < cols; c++) {
      const x = bx + (bw / cols) * c + (bw / cols - winW) / 2;
      const y = top + 20 + row * rowH;
      const lit = r() < 0.25;
      windows.push(
        <g key={`${row}-${c}`}>
          <rect x={x} y={y} width={winW} height={rowH * 0.62} rx={p.facade === 'classic' ? 3 : 1} fill={lit ? '#ffe39a' : p.facade === 'tower' ? '#a9cbe8' : '#5f7a8c'} opacity={lit ? 1 : 0.85} />
          {p.facade === 'classic' && <path d={`M${x - 3} ${y - 3} q${winW / 2 + 3} -8 ${winW + 6} 0`} fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2" />}
          {(p.facade === 'modern' || p.facade === 'brick') && row % 2 === 1 && c % 2 === 0 && (
            <rect x={x - 4} y={y + rowH * 0.62} width={winW + 8} height="4" fill="#3d4a54" opacity=".6" />
          )}
        </g>
      );
    }
  }

  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`s${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
        <linearGradient id={`g${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".25" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".12" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#s${uid})`} />
      <circle cx={60 + r() * 280} cy={40} r="16" fill="#fff" opacity=".7" />
      {/* neighbours */}
      <rect x={0} y={110} width={bx - 6} height={140} fill="#cfd6de" />
      <rect x={W - bx + 6} y={130} width={bx - 6} height={120} fill="#d9dee4" />
      {/* building */}
      <rect x={bx} y={top} width={bw} height={bottom - top} fill={wall} />
      <rect x={bx} y={top} width={bw} height={bottom - top} fill={`url(#g${uid})`} />
      {p.facade === 'brick' &&
        Array.from({ length: 14 }, (_, i) => <line key={i} x1={bx} x2={bx + bw} y1={top + i * 14} y2={top + i * 14} stroke="#000" strokeOpacity=".06" />)}
      {p.facade === 'classic' && (
        <>
          <rect x={bx - 8} y={top - 10} width={bw + 16} height="14" fill="#fff" opacity=".7" />
          <path d={`M${bx + bw / 2 - 40} ${top - 10} L${bx + bw / 2} ${top - 34} L${bx + bw / 2 + 40} ${top - 10}Z`} fill={wall} stroke="#fff" strokeOpacity=".7" strokeWidth="3" />
        </>
      )}
      {p.facade === 'tower' && <rect x={bx + bw / 2 - 3} y={top} width="6" height={bottom - top} fill="#fff" opacity=".35" />}
      {windows}
      {/* entrance */}
      <rect x={bx + bw / 2 - 16} y={bottom - 34} width="32" height="34" rx="3" fill="#3b4650" />
      {/* ground & trees */}
      <rect x="0" y={bottom} width={W} height={H - bottom} fill="#c9d3b6" />
      <rect x="0" y={bottom} width={W} height="6" fill="#b3bea0" />
      {[30, W - 40].map((tx) => (
        <g key={tx}>
          <rect x={tx - 2} y={bottom - 30} width="4" height="30" fill="#6b5a45" />
          <circle cx={tx} cy={bottom - 42} r="20" fill="#6f9a5a" />
          <circle cx={tx + 8} cy={bottom - 50} r="12" fill="#86b06e" />
        </g>
      ))}
    </svg>
  );
});

type Room = { x: number; y: number; w: number; h: number; label: string; area: number };

/**
 * Simple floor-plan generator: split the rectangle into a living zone and a
 * service strip, then slice the living zone into bedrooms.
 */
export function floorPlan(p: Property, labels: { living: string; bedroom: string; kitchen: string; bath: string; hall: string; studio: string; m2: string; fmt: (n: number) => string }): { rooms: Room[]; W: number; H: number } {
  const W = 400;
  const H = 280;
  const k = p.area / ((W * H) / 900); // area units per plan px²
  const serviceH = 90;
  const rooms: Room[] = [];
  const area = (w: number, h: number) => Math.round(((w * h) / 900) * k * 10) / 10;

  // service strip: bath, hall, kitchen
  const bathW = 90;
  const hallW = 110;
  rooms.push({ x: 0, y: H - serviceH, w: bathW, h: serviceH, label: labels.bath, area: area(bathW, serviceH) });
  rooms.push({ x: bathW, y: H - serviceH, w: hallW, h: serviceH, label: labels.hall, area: area(hallW, serviceH) });
  const kitchenW = W - bathW - hallW;
  if (p.rooms === 0) {
    rooms.push({ x: bathW + hallW, y: H - serviceH, w: kitchenW, h: serviceH, label: labels.kitchen, area: area(kitchenW, serviceH) });
    rooms.push({ x: 0, y: 0, w: W, h: H - serviceH, label: labels.studio, area: area(W, H - serviceH) });
    return { rooms, W, H };
  }
  rooms.push({ x: bathW + hallW, y: H - serviceH, w: kitchenW, h: serviceH, label: labels.kitchen, area: area(kitchenW, serviceH) });

  // living + bedrooms across the top
  const topH = H - serviceH;
  const n = p.rooms;
  const livingW = n === 1 ? W : W * (n >= 3 ? 0.36 : 0.5);
  rooms.push({ x: 0, y: 0, w: livingW, h: topH, label: n === 1 ? labels.living : labels.living, area: area(livingW, topH) });
  const bedrooms = n - 1;
  if (bedrooms > 0) {
    const restW = W - livingW;
    const perRow = bedrooms > 2 ? 2 : bedrooms;
    const rowsN = Math.ceil(bedrooms / perRow);
    let i = 0;
    for (let row = 0; row < rowsN; row++) {
      const inRow = Math.min(perRow, bedrooms - i);
      const w = restW / inRow;
      const h = topH / rowsN;
      for (let c = 0; c < inRow; c++) {
        rooms.push({ x: livingW + c * w, y: row * h, w, h, label: `${labels.bedroom} ${i + 1}`, area: area(w, h) });
        i++;
      }
    }
  }
  return { rooms, W, H };
}

export function FloorPlan({ p, labels, className }: { p: Property; labels: Parameters<typeof floorPlan>[1]; className?: string }) {
  const { rooms, W, H } = floorPlan(p, labels);
  const pad = 14;
  return (
    <svg className={className} viewBox={`${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}`} aria-hidden="true">
      <rect x={-pad} y={-pad} width={W + pad * 2} height={H + pad * 2} fill="#f8f7f3" />
      {rooms.map((room, i) => (
        <g key={i}>
          <rect x={room.x} y={room.y} width={room.w} height={room.h} fill={i === 3 || (p.rooms === 0 && i === 3) ? '#fff' : '#fdfcf9'} stroke="#2b2f36" strokeWidth="4" />
          <text x={room.x + room.w / 2} y={room.y + room.h / 2 - 4} textAnchor="middle" fontSize="13" fontWeight="600" fill="#2b2f36">
            {room.label}
          </text>
          <text x={room.x + room.w / 2} y={room.y + room.h / 2 + 14} textAnchor="middle" fontSize="12" fill="#7a7f89">
            {labels.fmt(room.area)} {labels.m2}
          </text>
        </g>
      ))}
      {/* door gaps */}
      {rooms.slice(3).map((room, i) => (
        <rect key={`d${i}`} x={room.x + room.w / 2 - 14} y={room.y + room.h - 3} width="28" height="6" fill="#f8f7f3" />
      ))}
      <rect x={90 + 40} y={H - 3} width="30" height="6" fill="#f8f7f3" />
      {/* windows on the outer walls */}
      {rooms.slice(3).map((room, i) => (room.y === 0 ? <rect key={`w${i}`} x={room.x + room.w / 2 - 22} y={-3} width="44" height="6" fill="#9ec5e8" /> : null))}
    </svg>
  );
}
