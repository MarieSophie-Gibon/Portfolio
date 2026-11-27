import { useState } from 'react';
import { Eraser, Trash } from 'lucide-react';
import type { SketchStroke } from '@/types/portfolio';
import { SpreadSketchCanvas } from './SpreadSketchCanvas';

/* ==================================================================
 * Page 404 : feuille volante posée sur le bureau, avec un feutre à
 * droite pour dessiner dessus (le seul endroit du site où l'on dessine).
 * Les dessins ne sont pas sauvegardés : c'est un petit jeu.
 * ================================================================== */

const INKS = [
  { name: 'Encre de seiche', hex: '#2E1C0E' },
  { name: 'Rouge sceau', hex: '#9B2F2A' },
  { name: 'Bleu de Prusse', hex: '#2C4A6E' },
  { name: 'Vert mousse', hex: '#4E6B34' },
];

/* Papier « sale » : plis de pliage, ronds de café, taches d'encre, traces
 * de doigts, rayures et bords brûlés (tout en CSS / SVG, aucune image). */
const GRIME_SVG = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='675' viewBox='0 0 900 675'>
    <filter id='r'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='3'/><feDisplacementMap in='SourceGraphic' scale='6'/></filter>
    <g filter='url(#r)'>
      <circle cx='770' cy='560' r='50' fill='none' stroke='rgba(120,70,20,0.13)' stroke-width='3'/>
      <ellipse cx='95' cy='600' rx='12' ry='8' fill='rgba(40,25,12,0.16)'/>
      <circle cx='114' cy='612' r='2.5' fill='rgba(40,25,12,0.16)'/>
    </g>
    <g stroke='rgba(80,50,20,0.08)' stroke-width='0.7' fill='none' stroke-linecap='round'>
      <path d='M60 260 l140 -22'/><path d='M620 90 l90 30'/><path d='M300 600 l160 -8'/><path d='M760 330 l40 70'/><path d='M420 70 l-60 40'/>
    </g>
    <g fill='rgba(90,60,30,0.045)'>
      <ellipse cx='820' cy='610' rx='38' ry='26' transform='rotate(-30 820 610)'/>
      <ellipse cx='60' cy='70' rx='30' ry='20' transform='rotate(20 60 70)'/>
    </g>
  </svg>`,
)}")`;

const DIRTY_PAPER = [
  GRIME_SVG,
  // Plis de pliage (en croix) : arête claire + ombre
  'linear-gradient(90deg, transparent calc(50% - 6px), rgba(70,40,10,0.07) calc(50% - 1px), rgba(255,248,230,0.25) 50%, rgba(70,40,10,0.04) calc(50% + 3px), transparent calc(50% + 8px))',
  'linear-gradient(180deg, transparent calc(50% - 6px), rgba(70,40,10,0.06) calc(50% - 1px), rgba(255,248,230,0.22) 50%, rgba(70,40,10,0.035) calc(50% + 3px), transparent calc(50% + 8px))',
  'var(--tex-paper)',
  // Taches diffuses + jaunissement
  'radial-gradient(ellipse 30% 22% at 22% 70%, rgba(150,95,35,0.09), transparent 70%)',
  'radial-gradient(ellipse 22% 18% at 80% 30%, rgba(150,95,35,0.08), transparent 70%)',
  // Bords brûlés / encrassés
  'radial-gradient(ellipse at 50% 48%, transparent 50%, rgba(120,72,25,0.22) 82%, rgba(80,45,15,0.42) 100%)',
].join(', ');
const DIRTY_SIZES = ['100% 100%', '100% 100%', '100% 100%', '320px 320px', 'auto', 'auto', 'auto'].join(', ');

/** Feutre dessiné (corps + capuchon) ; débouché quand `on`. */
function Marker({ color, on }: { color: string; on: boolean }) {
  return (
    <svg viewBox="0 0 60 240" className="h-full w-auto drop-shadow-[0_14px_14px_rgba(15,6,0,0.45)]" aria-hidden="true">
      <defs>
        <linearGradient id="marker-body" x1="0" x2="1">
          <stop offset="0" stopColor="#1E1A17" />
          <stop offset="0.45" stopColor="#4A423B" />
          <stop offset="1" stopColor="#1A1613" />
        </linearGradient>
        <linearGradient id="marker-cap" x1="0" x2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.85" />
          <stop offset="0.45" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity="0.8" />
        </linearGradient>
      </defs>
      {/* Pointe */}
      <path d="M24 8 L36 8 L33 26 L27 26 Z" fill={color} />
      <rect x="21" y="26" width="18" height="14" rx="2" fill="#B9A88E" />
      {/* Corps */}
      <rect x="16" y="40" width="28" height="170" rx="6" fill="url(#marker-body)" />
      <rect x="16" y="150" width="28" height="22" fill={color} opacity="0.9" />
      <rect x="20" y="48" width="4" height="150" rx="2" fill="rgba(255,255,255,0.18)" />
      <rect x="16" y="206" width="28" height="12" rx="4" fill="#2A2420" />
      {/* Capuchon : posé sur la pointe, ou glissé au bout quand on dessine */}
      <g style={{ transform: on ? 'translateY(206px)' : 'none', transition: 'transform 300ms ease' }}>
        <rect x="14" y="2" width="32" height="56" rx="7" fill="url(#marker-cap)" />
        <rect x="40" y="10" width="5" height="40" rx="2.5" fill="rgba(0,0,0,0.25)" />
        <rect x="18" y="8" width="4" height="44" rx="2" fill="rgba(255,255,255,0.3)" />
      </g>
    </svg>
  );
}

export function NotFoundPage() {
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState(INKS[0].hex);
  const [eraser, setEraser] = useState(false);
  const [strokes, setStrokes] = useState<SketchStroke[]>([]);

  return (
    <main className="fixed inset-0 flex items-center justify-center gap-6 overflow-hidden p-6 pt-20 max-sm:flex-col">
      {/* Retour au carnet : en haut à gauche de la page */}
      <a
        href="/"
        className="t-fantasy fixed left-5 top-5 z-50 inline-flex items-center rounded-md px-4 py-2 text-[13px] uppercase tracking-[0.14em] text-[#2A1A0E] shadow-[0_3px_0_#7A5622,0_8px_16px_-8px_rgba(0,0,0,0.6)] transition hover:brightness-105"
        style={{ background: 'linear-gradient(180deg, #F2D58C 0%, #D8B36A 45%, #B8893A 100%)' }}
      >
        ← Retour au carnet
      </a>

      {/* Feuille volante (grande, froissée, tachée) */}
      <div className="relative aspect-[4/3] w-[min(960px,86vw,calc((100vh_-_140px)*4/3))] -rotate-[1.2deg]">
        <div className="absolute inset-0 shadow-[4px_8px_6px_rgba(15,6,0,0.3),20px_30px_40px_-10px_rgba(15,6,0,0.55)]" />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            backgroundColor: '#EADCBB',
            backgroundImage: DIRTY_PAPER,
            backgroundSize: DIRTY_SIZES,
            clipPath:
              'polygon(0 1.5%, 7% 0, 22% 1.2%, 41% 0.3%, 63% 1.4%, 82% 0.2%, 100% 1%, 99.3% 24%, 100% 51%, 99.1% 77%, 100% 99%, 78% 98.6%, 55% 100%, 33% 98.8%, 14% 100%, 0 98.5%, 0.9% 72%, 0 47%, 0.8% 21%)',
          }}
        >
          <div className="flex h-full flex-col items-center px-8 pt-[7%] text-center">
            <p className="t-fantasy text-[clamp(44px,6.5vw,84px)] leading-none text-[#3A2414]/85 [text-shadow:0_2px_0_rgba(255,240,210,0.6)]">404</p>
            <p className="mt-2 text-[clamp(18px,2.4vw,24px)] text-[#4A2E18]" style={{ fontFamily: 'var(--font-hand)' }}>
              Cette page s'est égarée entre deux quêtes…
            </p>
            <p className="mt-1 text-sm text-[#6B4A2B]">{drawing ? 'Dessine-lui une carte pour qu’elle retrouve son chemin.' : 'Prends le feutre à droite pour griffonner en attendant.'}</p>
          </div>
          <SpreadSketchCanvas strokes={strokes} enabled={drawing} color={color} eraser={eraser} onAddStroke={(s) => setStrokes((list) => [...list, s])} />
        </div>
      </div>

      {/* Feutre + encres */}
      <div className="flex items-center gap-4 sm:flex-col">
        <button
          type="button"
          onClick={() => setDrawing((v) => !v)}
          aria-pressed={drawing}
          title={drawing ? 'Reboucher le feutre' : 'Prendre le feutre pour dessiner'}
          className={`h-[min(240px,32vh)] transition-transform duration-300 hover:-translate-y-1 max-sm:h-28 max-sm:rotate-90 ${drawing ? 'rotate-[8deg]' : 'rotate-[14deg]'}`}
        >
          <Marker color={eraser ? '#B9A88E' : color} on={drawing} />
        </button>

        {drawing && (
          <div className="flex items-center gap-2 rounded-full border border-[#8E6A3E]/40 bg-[#F3E9D2] px-2.5 py-1.5 shadow-[0_8px_20px_-6px_rgba(30,15,3,0.55)] sm:flex-col">
            {INKS.map((ink) => (
              <button
                key={ink.hex}
                type="button"
                title={ink.name}
                aria-label={ink.name}
                onClick={() => {
                  setEraser(false);
                  setColor(ink.hex);
                }}
                className={`h-6 w-6 rounded-full border border-black/20 ${!eraser && color === ink.hex ? 'ring-2 ring-[#B8893A] ring-offset-2 ring-offset-[#F3E9D2]' : ''}`}
                style={{ backgroundColor: ink.hex }}
              />
            ))}
            <button
              type="button"
              title="Gomme"
              aria-label="Gomme"
              aria-pressed={eraser}
              onClick={() => setEraser((v) => !v)}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[#3A2414] ${eraser ? 'bg-[#D8B36A]' : 'hover:bg-[#5A3520]/10'}`}
            >
              <Eraser className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Tout effacer"
              aria-label="Tout effacer"
              onClick={() => setStrokes([])}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#8E2F2A] hover:bg-[#8E2F2A]/10"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
