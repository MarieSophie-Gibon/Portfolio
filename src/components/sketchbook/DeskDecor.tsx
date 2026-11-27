import type { CSSProperties, ReactNode } from 'react';

/* ==================================================================
 * Papiers posés sur le bureau, autour du carnet (décor d'ambiance non
 * éditable) : parchemins, feuilles volantes, post-it.
 *
 * Profondeur : lumière en haut à gauche → ombres portées vers le bas à
 * droite, plus longues et plus floues pour les couches hautes ; les
 * couches basses sont légèrement floutées et assombries ; certains
 * coins se soulèvent (reflet + ombre sous le coin).
 * ================================================================== */

type Depth = 0 | 1 | 2;

/** Ombre portée selon la hauteur de la feuille au-dessus du bureau. */
const SHADOW: Record<Depth, string> = {
  0: '2px 3px 3px rgba(15,6,0,0.35), 6px 10px 14px -4px rgba(15,6,0,0.35)',
  1: '3px 5px 4px rgba(15,6,0,0.3), 12px 18px 22px -6px rgba(15,6,0,0.45)',
  2: '4px 7px 6px rgba(15,6,0,0.28), 18px 26px 30px -8px rgba(15,6,0,0.5)',
};
/* Couches basses : un peu floues et plus sombres (profondeur de champ). */
const LAYER_FILTER: Record<Depth, string> = {
  0: 'blur(0.9px) brightness(0.82) saturate(0.9)',
  1: 'blur(0.35px) brightness(0.92)',
  2: 'none',
};

interface PaperProps {
  className: string;
  depth: Depth;
  /** Couleur du papier. */
  color?: string;
  /** Texture parchemin + bords brunis. */
  aged?: boolean;
  /** Coin soulevé (bas droite / bas gauche). */
  curl?: 'br' | 'bl';
  /** Bords déchirés irréguliers. */
  torn?: boolean;
  style?: CSSProperties;
  children?: ReactNode;
}

const TORN = 'polygon(0 1.5%, 7% 0, 22% 1.2%, 41% 0.3%, 63% 1.4%, 82% 0.2%, 100% 1%, 99.3% 24%, 100% 51%, 99.1% 77%, 100% 99%, 78% 98.6%, 55% 100%, 33% 98.8%, 14% 100%, 0 98.5%, 0.9% 72%, 0 47%, 0.8% 21%)';

/** Feuille de papier avec ombre, grain et éventuel coin soulevé. */
function Paper({ className, depth, color = '#EFE3C6', aged = true, curl, torn = false, style, children }: PaperProps) {
  return (
    <div className={`absolute ${className}`} style={{ filter: LAYER_FILTER[depth], ...style }}>
      {/* L'ombre est portée par un calque séparé pour rester visible malgré le clip-path du papier. */}
      <div className="absolute inset-0" style={{ boxShadow: SHADOW[depth], borderRadius: 2 }} />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          backgroundColor: color,
          backgroundImage: aged
            ? 'var(--tex-paper), radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(125,80,30,0.38) 100%)'
            : 'var(--tex-paper)',
          backgroundSize: '320px 320px, 100% 100%',
          clipPath: torn ? TORN : undefined,
        }}
      >
        {/* Lumière rasante venue d'en haut à gauche */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,250,235,0.22) 0%, transparent 45%, rgba(40,20,5,0.12) 100%)' }} />
        {children}
        {curl && (
          <div
            className={`absolute bottom-0 h-[16%] w-[16%] ${curl === 'br' ? 'right-0' : 'left-0'}`}
            style={{
              background:
                curl === 'br'
                  ? 'linear-gradient(135deg, transparent 48%, rgba(255,248,230,0.75) 52%, #D9C69F 70%, rgba(60,30,8,0.25) 100%)'
                  : 'linear-gradient(225deg, transparent 48%, rgba(255,248,230,0.75) 52%, #D9C69F 70%, rgba(60,30,8,0.25) 100%)',
            }}
          />
        )}
      </div>
      {/* Ombre sous le coin soulevé */}
      {curl && (
        <div
          className={`absolute -bottom-[3%] h-[14%] w-[18%] ${curl === 'br' ? '-right-[2%]' : '-left-[2%]'}`}
          style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(15,6,0,0.35), transparent 70%)', zIndex: -1 }}
        />
      )}
    </div>
  );
}

/** Lignes d'écriture « manuscrite » (gribouillis réguliers). */
function Handwriting({ lines, top = 18, gap = 9, ink = 'rgba(55,35,18,0.42)' }: { lines: number; top?: number; gap?: number; ink?: string }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <g fill="none" stroke={ink} strokeWidth="0.55" strokeLinecap="round" vectorEffect="non-scaling-stroke">
        {Array.from({ length: lines }, (_, i) => {
          const y = top + i * gap;
          const end = 88 - ((i * 23) % 30);
          return <path key={i} d={`M10 ${y} q3 -1.4 6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 L${end} ${y}`} vectorEffect="non-scaling-stroke" />;
        })}
      </g>
    </svg>
  );
}

/** Lignes réglées d'une feuille de cahier. */
const RULED = 'repeating-linear-gradient(180deg, transparent 0 21px, rgba(110,130,160,0.25) 21px 22px)';

/** Post-it légèrement courbé (le bas se soulève). */
function PostIt({ className, color, children }: { className: string; color: string; children?: ReactNode }) {
  return (
    <div className={`absolute ${className}`}>
      {/* Ombre plus forte en bas : le post-it n'est collé qu'en haut */}
      <div
        className="absolute inset-x-[4%] bottom-[-4%] top-[30%]"
        style={{ background: 'rgba(15,6,0,0.42)', filter: 'blur(9px)', transform: 'skewX(-4deg) translateX(6%)' }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: color,
          backgroundImage:
            'var(--tex-paper), linear-gradient(180deg, rgba(0,0,0,0.06) 0 14%, transparent 14%), linear-gradient(170deg, transparent 55%, rgba(255,255,255,0.28) 80%, rgba(0,0,0,0.12) 100%)',
          backgroundSize: '320px 320px, 100% 100%, 100% 100%',
          borderRadius: '1px 1px 3px 14px / 1px 1px 3px 8px',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Carte ancienne : côtes, chemin pointillé, rose des vents (encre pâle). */
function MapInk() {
  const ink = 'rgba(92,58,26,0.45)';
  return (
    <svg viewBox="0 0 560 520" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <g fill="none" stroke={ink} strokeLinecap="round" strokeLinejoin="round">
        <path strokeWidth="2" d="M40 120 C90 90 140 110 170 80 S260 60 300 100 C330 130 380 120 420 150 S500 230 470 290 C450 330 480 380 430 410 S320 450 270 420 C230 400 180 440 130 410 S50 330 70 270 C85 220 20 180 40 120 Z" />
        <path strokeWidth="1.8" strokeDasharray="6 7" d="M120 360 C170 330 200 280 250 300 S330 360 380 320 S420 230 400 190" />
        <path strokeWidth="2.4" d="M392 182 l16 16 M408 182 l-16 16" stroke="rgba(140,40,30,0.55)" />
        <g transform="translate(470 90)">
          <circle r="28" strokeWidth="1.2" />
          <path strokeWidth="1.2" d="M0 -38 L6 -6 L0 0 L-6 -6 Z M0 38 L6 6 L0 0 L-6 6 Z M-38 0 L-6 -6 L0 0 L-6 6 Z M38 0 L6 -6 L0 0 L6 6 Z" />
        </g>
      </g>
    </svg>
  );
}

export function DeskDecor() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* ---------- Pile de gauche ---------- */}
      <Paper className="left-[-6vw] top-[6vh] h-[min(54vh,500px)] w-[min(34vw,520px)] -rotate-[11deg]" depth={0} color="#E3CFA3">
        <MapInk />
      </Paper>
      <Paper
        className="left-[2vw] top-[38vh] h-[min(40vh,380px)] w-[min(22vw,320px)] rotate-[6deg]"
        depth={1}
        color="#F3EBDD"
        aged={false}
        curl="br"
      >
        <div className="absolute inset-0" style={{ backgroundImage: RULED, backgroundPosition: '0 30px' }} />
        <div className="absolute inset-y-0 left-[14%] w-px bg-[rgba(190,90,90,0.35)]" />
        <Handwriting lines={9} top={16} gap={9} />
      </Paper>
      <PostIt className="left-[11vw] top-[30vh] h-[min(13vw,150px)] w-[min(13vw,150px)] -rotate-[7deg]" color="#E8D27E">
        <Handwriting lines={3} top={32} gap={18} ink="rgba(60,40,15,0.5)" />
      </PostIt>
      <Paper className="bottom-[-4vh] left-[-2vw] h-[min(24vh,220px)] w-[min(18vw,260px)] rotate-[-4deg]" depth={1} color="#E6D4AE" torn />

      {/* ---------- Pile de droite ---------- */}
      <Paper className="right-[-5vw] top-[-4vh] h-[min(46vh,430px)] w-[min(28vw,420px)] rotate-[8deg]" depth={0} color="#E0CB9E" torn>
        <Handwriting lines={10} top={22} gap={7} ink="rgba(70,40,15,0.35)" />
      </Paper>
      <Paper
        className="bottom-[-6vh] right-[-2vw] h-[min(52vh,480px)] w-[min(25vw,370px)] rotate-[-9deg]"
        depth={1}
        color="#EDE1C4"
        curl="bl"
      >
        <div className="absolute inset-x-0 top-1/2 h-px bg-[rgba(110,70,25,0.18)]" />
        <Handwriting lines={11} top={14} gap={7.5} />
      </Paper>
      <PostIt className="right-[9vw] top-[22vh] h-[min(11vw,130px)] w-[min(11vw,130px)] rotate-[9deg]" color="#E9B8B0">
        <Handwriting lines={2} top={38} gap={20} ink="rgba(80,35,30,0.45)" />
      </PostIt>
      <PostIt className="bottom-[16vh] right-[16vw] h-[min(9vw,110px)] w-[min(9vw,110px)] -rotate-[4deg]" color="#BFD3B0" />
    </div>
  );
}
