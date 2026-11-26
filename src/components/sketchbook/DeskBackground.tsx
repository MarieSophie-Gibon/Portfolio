import type { ReactNode } from 'react';
import type { DeskPreset } from '@/types/portfolio';

/* ==================================================================
 * Fond du bureau : papier crème neutre + grain léger + lumière douce.
 * Les éléments de décor (images, photos, stickers) sont des données
 * éditables, rendus par DeskItemsLayer.
 * ================================================================== */

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.38 0 0 0 0 0.28 0 0 0 0.09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function DeskBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      // Dégradé léger autour de #83C5D6 (plus clair en haut à gauche, plus soutenu en bas à droite) + grain.
      style={{
        backgroundColor: '#83C5D6',
        backgroundImage: `${GRAIN}, linear-gradient(155deg, #A3D6E3 0%, #83C5D6 50%, #72B6C9 100%)`,
        backgroundSize: '200px 200px, 100% 100%',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0)_60%)]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bibliothèque de stickers dessinés (ajoutables depuis l'admin)       */
/* ------------------------------------------------------------------ */

const softShadow = 'drop-shadow-[0_4px_6px_rgba(80,60,30,0.25)]';

function Washi({ color, pattern }: { color: string; pattern: 'dots' | 'stripes' | 'grid' }) {
  const bg =
    pattern === 'dots'
      ? 'radial-gradient(rgba(255,255,255,0.7) 1.5px, transparent 1.6px)'
      : pattern === 'stripes'
        ? 'repeating-linear-gradient(45deg, rgba(255,255,255,0.55) 0 5px, transparent 5px 11px)'
        : 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)';
  return (
    <div
      className="w-full aspect-[5/1] opacity-90 shadow-[0_2px_5px_rgba(80,60,30,0.2)]"
      style={{
        backgroundColor: color,
        backgroundImage: bg,
        backgroundSize: pattern === 'stripes' ? undefined : '8px 8px',
        clipPath: 'polygon(0 6%, 3% 0, 97% 4%, 100% 14%, 98% 50%, 100% 88%, 96% 100%, 2% 96%, 0 80%, 2% 46%)',
      }}
    />
  );
}

function Flower({ petal, core }: { petal: string; core: string }) {
  const petals = [0, 72, 144, 216, 288];
  return (
    <svg viewBox="0 0 100 100" className={`w-full ${softShadow}`}>
      <g stroke="#fff" strokeWidth="8" strokeLinejoin="round">
        {petals.map((r) => (
          <ellipse key={r} cx="50" cy="27" rx="17" ry="22" fill={petal} transform={`rotate(${r} 50 50)`} />
        ))}
      </g>
      {petals.map((r) => (
        <ellipse key={r} cx="50" cy="27" rx="17" ry="22" fill={petal} transform={`rotate(${r} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="14" fill={core} stroke="#fff" strokeWidth="3" />
    </svg>
  );
}

function Outlined({ d, color, highlight = false }: { d: string; color: string; highlight?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={`w-full ${softShadow}`}>
      <path d={d} fill="#fff" stroke="#fff" strokeWidth="10" strokeLinejoin="round" />
      <path d={d} fill={color} />
      {highlight && <ellipse cx="34" cy="36" rx="7" ry="4" fill="#fff" opacity="0.6" transform="rotate(-30 34 36)" />}
    </svg>
  );
}

const STAR = 'M50 6 L62 36 L94 38 L69 58 L77 90 L50 72 L23 90 L31 58 L6 38 L38 36 Z';
const HEART = 'M50 86 C20 66 8 48 12 32 C16 16 38 12 50 30 C62 12 84 16 88 32 C92 48 80 66 50 86 Z';

export const DESK_PRESETS: Record<DeskPreset, { label: string; width: number; render: () => ReactNode }> = {
  'washi-butter': { label: 'Washi jaune', width: 110, render: () => <Washi color="#FFE27A" pattern="dots" /> },
  'washi-lilac': { label: 'Washi lilas', width: 120, render: () => <Washi color="#CDBEF5" pattern="stripes" /> },
  'washi-blush': { label: 'Washi rose', width: 110, render: () => <Washi color="#F9C6D3" pattern="grid" /> },
  'washi-mint': { label: 'Washi menthe', width: 110, render: () => <Washi color="#BFE8D6" pattern="dots" /> },
  'flower-pink': { label: 'Fleur rose', width: 60, render: () => <Flower petal="#F9C6D3" core="#FFE27A" /> },
  'flower-yellow': { label: 'Fleur jaune', width: 60, render: () => <Flower petal="#FFE27A" core="#F9C6D3" /> },
  star: { label: 'Étoile', width: 42, render: () => <Outlined d={STAR} color="#FFE27A" /> },
  heart: { label: 'Cœur', width: 40, render: () => <Outlined d={HEART} color="#BFD9F5" highlight /> },
  sparkle: {
    label: 'Étincelle',
    width: 22,
    render: () => (
      <svg viewBox="0 0 40 40" className="w-full">
        <path d="M20 2 C22 14 26 18 38 20 C26 22 22 26 20 38 C18 26 14 22 2 20 C14 18 18 14 20 2 Z" fill="#C99A2E" />
      </svg>
    ),
  },
  paperclip: {
    label: 'Trombone',
    width: 26,
    render: () => (
      <svg viewBox="0 0 24 64" fill="none" className="w-full">
        <path d="M8 18 V50 C8 57 18 57 18 50 V12 C18 4 5 4 5 12 V46 C5 51 13 51 13 46 V20" stroke="#9AA6B8" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    ),
  },
};
