import { useEffect, useId, type ReactNode } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { LIGHT_RAYS, WOOD_GRAIN, WOOD_PLANKS } from '@/lib/textures';
import type { BackgroundPreset, DeskItem, DeskPreset } from '@/types/portfolio';
import { Parchment, PostIt, RuledSheet, TornNote } from './PaperStickers';

/* ==================================================================
 * Fond du bureau : fond prêt à l'emploi ou image perso, quadrillage
 * léger optionnel, grain, lumière et vignettage. Les éléments de
 * décor (images, stickers) sont rendus par DeskItemsLayer.
 * ================================================================== */

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.38 0 0 0 0 0.28 0 0 0 0.09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

interface BackgroundStyle {
  label: string;
  /** Couleur de base (aussi utilisée pour la barre du navigateur). */
  color: string;
  /** Calques CSS, du dessus vers le dessous. */
  layers: string[];
  /** Tailles des calques (même ordre ; 'auto' par défaut). */
  sizes?: string[];
  /** Couleur des lignes du quadrillage. */
  grid: string;
  /** 'lines' = carreaux, 'dots' = pointillés. */
  gridKind?: 'lines' | 'dots';
  /** Petite taille de case (px). */
  cell?: number;
  /** Assombrissement des bords (0..1). */
  vignette?: number;
  /** Halo de lumière derrière le carnet. */
  glow?: string;
}

const WOOD_SIZES = ['100% 100%', '100% 150px', '640px 640px', '100% 100%'];
const STARS =
  'radial-gradient(1.2px 1.2px at 12% 18%, rgba(255,240,200,0.9), transparent), radial-gradient(1px 1px at 72% 12%, rgba(255,240,200,0.8), transparent), radial-gradient(1.4px 1.4px at 86% 64%, rgba(255,240,200,0.85), transparent), radial-gradient(1px 1px at 32% 78%, rgba(255,240,200,0.7), transparent), radial-gradient(1.2px 1.2px at 52% 40%, rgba(255,240,200,0.6), transparent), radial-gradient(1px 1px at 8% 60%, rgba(255,240,200,0.75), transparent)';

export const BACKGROUNDS: Record<Exclude<BackgroundPreset, 'image'>, BackgroundStyle> = {
  neutral: {
    label: 'Taupe',
    color: '#3B342E',
    layers: ['linear-gradient(160deg, #4A423B 0%, #3B342E 55%, #2C2622 100%)'],
    grid: 'rgba(255,240,220,0.06)',
    vignette: 0.45,
    glow: 'rgba(255,236,210,0.1)',
  },
  linen: {
    label: 'Lin',
    color: '#CFC5B5',
    layers: ['linear-gradient(160deg, #DDD5C7 0%, #CFC5B5 55%, #BBB09F 100%)'],
    grid: 'rgba(90,70,45,0.1)',
    vignette: 0.3,
    glow: 'rgba(255,250,240,0.2)',
  },
  slate: {
    label: 'Ardoise',
    color: '#2A2D31',
    layers: ['linear-gradient(160deg, #373B40 0%, #2A2D31 55%, #1D1F22 100%)'],
    grid: 'rgba(255,255,255,0.05)',
    vignette: 0.45,
    glow: 'rgba(255,255,255,0.06)',
  },
  wood: {
    label: 'Bois',
    color: '#5A3B25',
    layers: [LIGHT_RAYS, WOOD_PLANKS, WOOD_GRAIN, 'linear-gradient(160deg, #7A5334 0%, #5A3B25 55%, #3E2716 100%)'],
    sizes: WOOD_SIZES,
    grid: 'rgba(255,220,170,0.08)',
    vignette: 0.6,
    glow: 'rgba(255,214,150,0.22)',
  },
  night: {
    label: 'Nuit',
    color: '#24284E',
    layers: [STARS, 'linear-gradient(155deg, #353A6E 0%, #24284E 55%, #181A36 100%)'],
    grid: 'rgba(233,196,106,0.1)',
    vignette: 0.45,
  },
};

const DEFAULT_BG = BACKGROUNDS.neutral;

/** Quadrillage : cases fines + une ligne plus marquée toutes les 5 cases. */
function gridLayers(color: string, kind: 'lines' | 'dots', cell: number) {
  if (kind === 'dots') {
    return { image: `radial-gradient(circle, ${color} 1.3px, transparent 1.6px)`, size: `${cell}px ${cell}px` };
  }
  const major = cell * 5;
  return {
    image: [
      `linear-gradient(${color} 1px, transparent 1px)`,
      `linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      `linear-gradient(${color} 1px, transparent 1px)`,
      `linear-gradient(90deg, ${color} 1px, transparent 1px)`,
    ].join(', '),
    size: `${major}px ${major}px, ${major}px ${major}px, ${cell}px ${cell}px, ${cell}px ${cell}px`,
  };
}

const layerStyle = (s: BackgroundStyle) => ({
  backgroundColor: s.color,
  backgroundImage: s.layers.join(', '),
  backgroundSize: s.layers.map((_, i) => s.sizes?.[i] ?? '100% 100%').join(', '),
});

export function DeskBackground() {
  const { content } = useAdmin();
  const settings = content.settings.background;
  const custom = settings?.preset === 'image' && settings.image.src ? settings.image : null;
  const style = settings && settings.preset !== 'image' ? BACKGROUNDS[settings.preset] ?? DEFAULT_BG : DEFAULT_BG;
  const showGrid = settings?.grid ?? false;
  const grid = gridLayers(custom ? 'rgba(255,255,255,0.22)' : style.grid, style.gridKind ?? 'lines', style.cell ?? 28);
  const vignette = custom ? 0.45 : (style.vignette ?? 0.2);
  const imageDim = settings?.imageDim ?? 0.15;
  const imageBlur = settings?.imageBlur ?? 0;
  const barColor = custom ? '#2b2b2b' : style.color;

  // Barre du navigateur mobile + zones de rebond assorties au fond.
  useEffect(() => {
    document.body.style.backgroundColor = barColor;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', barColor);
  }, [barColor]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0">
      {custom ? (
        <>
          {/* Débord de 2 % : le flou ne laisse pas de bords clairs */}
          <div
            className="absolute -inset-[2%] bg-cover bg-center"
            style={{ backgroundImage: `url("${custom.src}")`, filter: imageBlur ? `blur(${imageBlur}px)` : undefined }}
          />
          {/* Voile réglable pour que le carnet ressorte sur n'importe quelle photo */}
          <div className="absolute inset-0" style={{ backgroundColor: `rgba(12,8,5,${imageDim})` }} />
        </>
      ) : (
        <div className="absolute inset-0" style={layerStyle(style)} />
      )}
      {showGrid && <div className="absolute inset-0" style={{ backgroundImage: grid.image, backgroundSize: grid.size, backgroundPosition: 'center' }} />}
      <div className="absolute inset-0" style={{ backgroundImage: GRAIN, backgroundSize: '200px 200px' }} />
      {/* Halo chaud derrière le carnet + bords assombris */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse 60% 55% at 50% 48%, ${custom ? 'transparent' : (style.glow ?? 'rgba(255,255,255,0.2)')} 0%, transparent 70%)` }}
      />
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(10,5,2,${vignette}) 100%)` }} />
    </div>
  );
}

/** Vignette d'aperçu d'un fond (panneau Réglages). */
export function BackgroundSwatch({ preset }: { preset: Exclude<BackgroundPreset, 'image'> }) {
  return <span className="block h-full w-full" style={layerStyle(BACKGROUNDS[preset])} />;
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

/* ---------- Carnet de voyage : timbres dentelés & tampons ---------- */

/** Id SVG unique et sûr (sans « : ») pour masques et textPath. */
const useSvgId = (prefix: string) => prefix + useId().replace(/[^a-zA-Z0-9_-]/g, '');

/** Timbre-poste dentelé (80×100) : `children` = illustration dans le cadre intérieur. */
function Stamp({ paper = '#FBF6EA', children, country, value }: { paper?: string; children: ReactNode; country: string; value: string }) {
  const id = useSvgId('stamp');
  const holes: [number, number][] = [];
  for (let x = 4; x <= 76; x += 8) holes.push([x, 0], [x, 100]);
  for (let y = 6; y <= 94; y += 8) holes.push([0, y], [80, y]);
  return (
    <svg viewBox="0 0 80 100" className={`w-full ${softShadow}`}>
      <defs>
        <mask id={id}>
          <rect width="80" height="100" fill="#fff" />
          {holes.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.6" fill="#000" />
          ))}
        </mask>
      </defs>
      <g mask={`url(#${id})`}>
        <rect width="80" height="100" fill={paper} />
        <svg x="8" y="8" width="64" height="70" viewBox="0 0 64 70" overflow="hidden">
          {children}
        </svg>
        <rect x="8" y="8" width="64" height="70" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />
        <text x="8" y="91" fontFamily="Silkscreen, monospace" fontSize="7" fill="#3B2A20" letterSpacing="0.4">
          {country}
        </text>
        <text x="72" y="91" textAnchor="end" fontFamily="Silkscreen, monospace" fontSize="8" fill="#B23A3A">
          {value}
        </text>
      </g>
    </svg>
  );
}

/** Feuille de fougère argentée (frond stylisée). */
function FernFrond() {
  const leaves = [];
  for (let i = 0; i < 9; i++) {
    const y = 60 - i * 6;
    const len = 16 - i * 1.4;
    leaves.push(
      <path key={`l${i}`} d={`M32 ${y} q-${len * 0.6} -2 -${len} -${4 + i * 0.3}`} />,
      <path key={`r${i}`} d={`M32 ${y} q${len * 0.6} -2 ${len} -${4 + i * 0.3}`} />,
    );
  }
  return (
    <g fill="none" stroke="#DDE8E0" strokeWidth="2.2" strokeLinecap="round">
      <path d="M32 68 C32 46 33 26 36 8" strokeWidth="2.6" />
      {leaves}
    </g>
  );
}

/** Tampon d'oblitération rond avec texte circulaire + ondes d'annulation. */
function Postmark({ top, center, ink }: { top: string; center: string; ink: string }) {
  const id = useSvgId('pm');
  return (
    <svg viewBox="0 0 150 90" className="w-full" style={{ mixBlendMode: 'multiply' }}>
      <defs>
        <path id={id} d="M45 45 m-31 0 a31 31 0 1 1 62 0 a31 31 0 1 1 -62 0" />
      </defs>
      <g fill="none" stroke={ink} opacity="0.78">
        <circle cx="45" cy="45" r="40" strokeWidth="2.4" />
        <circle cx="45" cy="45" r="25" strokeWidth="1.4" />
        {[30, 40, 50, 60].map((y, i) => (
          <path key={y} d={`M90 ${y} c10 -6 18 6 28 0 s18 6 28 0`} strokeWidth="2.2" strokeDasharray={i % 2 ? '0' : '40 3'} />
        ))}
      </g>
      <text fontFamily="Silkscreen, monospace" fontSize="8.5" fill={ink} opacity="0.8" letterSpacing="1.2">
        <textPath href={`#${id}`} startOffset="0">
          {top}
        </textPath>
      </text>
      <text x="45" y="49" textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize="10" fill={ink} opacity="0.85">
        {center}
      </text>
    </svg>
  );
}

/* ---------- Grimoire & rétro gaming ---------- */

/** Dé à 20 faces (icosaèdre vu de face). */
function D20({ face = '#7B4FB8', edge = '#F2D27A' }: { face?: string; edge?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`w-full ${softShadow}`}>
      <polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill="#fff" stroke="#fff" strokeWidth="8" strokeLinejoin="round" />
      <polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill={face} />
      <polygon points="50,22 76,66 24,66" fill="rgba(255,255,255,0.12)" />
      <g fill="none" stroke={edge} strokeWidth="2.2" strokeLinejoin="round">
        <polygon points="50,4 91,27 91,73 50,96 9,73 9,27" />
        <polygon points="50,22 76,66 24,66" />
        <path d="M50 4 L50 22 M91 27 L76 66 M91 27 L50 22 M9 27 L50 22 M9 27 L24 66 M91 73 L76 66 M9 73 L24 66 M50 96 L24 66 M50 96 L76 66" />
      </g>
      <text x="50" y="57" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight="800" fontSize="17" fill={edge}>
        20
      </text>
    </svg>
  );
}

/** Pixel art à partir d'une grille de caractères ('#' = couleur, 'o' = reflet). */
function Pixels({ rows, color, light = '#fff' }: { rows: string[]; color: string; light?: string }) {
  const w = rows[0].length;
  const h = rows.length;
  return (
    <svg viewBox={`-1 -1 ${w + 2} ${h + 2}`} className={`w-full ${softShadow}`} shapeRendering="crispEdges">
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) =>
          ch === '.' ? null : (
            <g key={`${x}-${y}`}>
              {/* Liseré blanc de sticker */}
              <rect x={x - 0.6} y={y - 0.6} width="2.2" height="2.2" fill="#fff" />
            </g>
          ),
        ),
      )}
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) => (ch === '.' ? null : <rect key={`p${x}-${y}`} x={x} y={y} width="1" height="1" fill={ch === 'o' ? light : color} />)),
      )}
    </svg>
  );
}

const PIXEL_HEART = ['.##.##.', '#o#####', '#######', '.#####.', '..###..', '...#...'];
const PIXEL_STAR = ['....#....', '...###...', '#########', '.#######.', '..#####..', '.###.###.', '.##...##.'];

/** Bibliothèque : `render(item)` reçoit l'élément (couleur / texte des papiers). */
export const DESK_PRESETS: Record<DeskPreset, { label: string; width: number; render: (item?: DeskItem) => ReactNode }> = {
  'paper-parchment': { label: 'Parchemin', width: 260, render: (item) => <Parchment item={item} /> },
  'paper-ruled': { label: 'Feuille lignée', width: 190, render: (item) => <RuledSheet item={item} /> },
  'paper-torn': { label: 'Note déchirée', width: 170, render: (item) => <TornNote item={item} /> },
  postit: { label: 'Post-it', width: 120, render: (item) => <PostIt item={item} /> },
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

  'stamp-fuji': {
    label: 'Timbre Fuji',
    width: 80,
    render: () => (
      <Stamp country="NIPPON" value="120">
        <rect width="64" height="70" fill="#F6E3C8" />
        <circle cx="46" cy="20" r="9" fill="#D9423A" />
        <path d="M0 70 L0 58 C10 56 14 50 22 40 C26 35 30 30 34 30 C38 30 42 35 46 40 C54 50 58 56 64 58 L64 70 Z" fill="#3E5A8A" />
        <path d="M22 40 C26 35 30 30 34 30 C38 30 42 35 46 40 L42 41 L39 38 L35 42 L31 38 L27 42 Z" fill="#fff" />
        <path d="M0 64 C12 60 22 66 32 62 S52 60 64 64 L64 70 L0 70 Z" fill="#2B4470" />
      </Stamp>
    ),
  },
  'stamp-fern': {
    label: 'Timbre fougère',
    width: 80,
    render: () => (
      <Stamp country="AOTEAROA" value="$2">
        <rect width="64" height="70" fill="#1F4D3A" />
        <circle cx="50" cy="14" r="5" fill="#F2D27A" opacity="0.9" />
        <FernFrond />
      </Stamp>
    ),
  },
  'stamp-torii': {
    label: 'Timbre torii',
    width: 80,
    render: () => (
      <Stamp country="KYOTO" value="84">
        <rect width="64" height="70" fill="#F7EEDC" />
        <circle cx="32" cy="30" r="20" fill="#F4C7B8" />
        <g fill="#D2452F">
          <rect x="8" y="20" width="48" height="5" rx="1.5" />
          <rect x="12" y="28" width="40" height="3.5" />
          <rect x="17" y="24" width="4.5" height="40" />
          <rect x="42.5" y="24" width="4.5" height="40" />
        </g>
        <rect x="0" y="62" width="64" height="8" fill="#8BB0A0" />
      </Stamp>
    ),
  },
  'postmark-tokyo': {
    label: 'Tampon Tokyo',
    width: 110,
    render: () => <Postmark top="TOKYO ✦ 東京 ✦ JAPAN ✦" center="2019" ink="#8C2F39" />,
  },
  'postmark-aotearoa': {
    label: 'Tampon Aotearoa',
    width: 110,
    render: () => <Postmark top="AOTEAROA ✦ NEW ZEALAND ✦" center="NZ" ink="#24476B" />,
  },
  d20: { label: 'Dé d20', width: 54, render: () => <D20 /> },
  'pixel-heart': { label: 'Cœur pixel', width: 40, render: () => <Pixels rows={PIXEL_HEART} color="#E0435A" /> },
  'pixel-star': { label: 'Étoile pixel', width: 44, render: () => <Pixels rows={PIXEL_STAR} color="#F2C230" /> },
  'press-start': {
    label: 'Press start',
    width: 120,
    render: () => (
      <svg viewBox="0 0 120 30" className={`w-full ${softShadow}`}>
        <rect x="1" y="1" width="118" height="28" rx="5" fill="#fff" />
        <rect x="4" y="4" width="112" height="22" rx="3" fill="#0F380F" />
        <text x="60" y="19.5" textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize="10" fill="#9BBC0F" letterSpacing="0.5">
          ▶ PRESS START
        </text>
      </svg>
    ),
  },
};
