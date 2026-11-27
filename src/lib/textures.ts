/* ==================================================================
 * Textures « peintes » partagées (SVG en data URL, aucun fichier) :
 * grain de cuir, fibres de parchemin, veinage du bois.
 * ================================================================== */

const svg = (body: string, size: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>${body}</svg>`,
  )}")`;

/** Grain de cuir : bruit fin + pores plus sombres. */
export const LEATHER_GRAIN = svg(
  `<filter id='a'><feTurbulence type='fractalNoise' baseFrequency='1.15' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.28 0'/></filter>
   <filter id='b'><feTurbulence type='turbulence' baseFrequency='0.045' numOctaves='2' seed='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 0.9'/></filter>
   <rect width='100%' height='100%' filter='url(#b)' opacity='0.12'/><rect width='100%' height='100%' filter='url(#a)'/>`,
  180,
);

/** Usure du cuir : marbrures claires et rayures fines. */
export const LEATHER_WEAR = svg(
  `<filter id='w'><feTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='4' seed='9' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.92  0 0 0 0 0.8  0 0 0 1.1 -0.72'/></filter>
   <rect width='100%' height='100%' filter='url(#w)' opacity='0.16'/>
   <g stroke='rgba(255,240,215,0.18)' stroke-width='0.7' fill='none' stroke-linecap='round'>
     <path d='M40 60 l60 -14'/><path d='M220 140 l44 18'/><path d='M120 300 l70 -6'/><path d='M300 260 l26 30'/><path d='M60 210 l18 22'/>
   </g>`,
  400,
);

/** Fibres et grain du parchemin. */
export const PAPER_FIBERS = svg(
  `<filter id='p'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.42  0 0 0 0 0.3  0 0 0 0 0.15  0 0 0 0.16 0'/></filter>
   <filter id='m'><feTurbulence type='fractalNoise' baseFrequency='0.006 0.02' numOctaves='3' seed='7' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.4  0 0 0 0 0.2  0 0 0 0.45 -0.17'/></filter>
   <rect width='100%' height='100%' filter='url(#m)'/><rect width='100%' height='100%' filter='url(#p)'/>`,
  320,
);

/** Veinage de planches de bois (horizontal). */
export const WOOD_GRAIN = svg(
  `<filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.004 0.16' numOctaves='4' seed='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.12  0 0 0 0 0.06  0 0 0 0 0.02  0 0 0 1.25 -0.38'/></filter>
   <filter id='k'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0'/></filter>
   <rect width='100%' height='100%' filter='url(#g)'/><rect width='100%' height='100%' filter='url(#k)'/>`,
  640,
);

/** Joints entre les planches (une planche ≈ 150px). */
export const WOOD_PLANKS =
  'repeating-linear-gradient(180deg, transparent 0 147px, rgba(25,12,4,0.55) 147px 149px, rgba(255,215,160,0.07) 149px 150px)';

/** Rais de lumière obliques venant d'en haut à gauche. */
export const LIGHT_RAYS =
  'linear-gradient(118deg, rgba(255,226,170,0.16) 0%, transparent 18%, rgba(255,226,170,0.1) 24%, transparent 32%, rgba(255,226,170,0.07) 40%, transparent 50%)';

/** Est-ce une couleur sombre ? (pour choisir dorure ou gaufrage). */
export function isDark(hex: string) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!m) return true;
  const [r, g, b] = m.slice(1).map((h) => parseInt(h, 16));
  return 0.299 * r + 0.587 * g + 0.114 * b < 120;
}
