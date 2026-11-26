import type { ReactNode } from 'react';

export type FlipDir = 'next' | 'prev';

export interface FlipState {
  from: number;
  to: number;
  dir: FlipDir;
  key: number;
}

export const FLIP_MS = 620; // synchronisé avec les @keyframes leaf-turn-* (index.css)

interface Props {
  flip: FlipState;
  /** Rend une double-page complète (version statique, non interactive). */
  renderSpread: (index: number) => ReactNode;
}

/** Affiche une moitié d'une double-page complète (on rend à 200% et on décale). */
function HalfOf({ side, children }: { side: 'left' | 'right'; children: ReactNode }) {
  return (
    <div className="h-full" style={{ width: '200%', marginLeft: side === 'left' ? '0%' : '-100%' }}>
      {children}
    </div>
  );
}

/**
 * Tournage de page 3D sans flash blanc.
 * - Sous-calque : garde la demi-page sortante jusqu'à l'atterrissage.
 * - Feuille recto-verso : recto = demi-page sortante, verso = demi-page entrante.
 * La spread de destination est déjà rendue dessous par la scène.
 */
export function PageTurnOverlay3D({ flip, renderSpread }: Props) {
  const next = flip.dir === 'next';
  // next : la page droite se soulève et se pose à gauche (et inversement).
  const stillSide = next ? 'left' : 'right';
  const frontSide = next ? 'right' : 'left';
  const backSide = next ? 'left' : 'right';

  return (
    <>
      <div
        className={`pointer-events-none absolute top-0 bottom-0 w-1/2 overflow-hidden ${
          next ? 'left-0 rounded-l-[10px]' : 'right-0 rounded-r-[10px]'
        }`}
        style={{ zIndex: 35 }}
      >
        <HalfOf side={stillSide}>{renderSpread(flip.from)}</HalfOf>
      </div>

      <div key={flip.key} className="flip-stage-3d pointer-events-none absolute inset-0 rounded-[10px]" style={{ zIndex: 45 }}>
        <div className={`leaf-3d-wrapper absolute top-0 bottom-0 w-1/2 ${next ? 'left-1/2 animate-leaf-next' : 'left-0 animate-leaf-prev'}`}>
          {/* RECTO */}
          <div
            className={`leaf-face ${next ? 'rounded-r-[10px]' : 'rounded-l-[10px]'}`}
            style={{ boxShadow: next ? '-10px 0 28px rgba(20,60,80,0.25)' : '10px 0 28px rgba(20,60,80,0.25)' }}
          >
            <HalfOf side={frontSide}>{renderSpread(flip.from)}</HalfOf>
            <div className="leaf-shade absolute inset-0 bg-[#1f4f5e]" />
          </div>
          {/* VERSO */}
          <div
            className={`leaf-face ${next ? 'rounded-l-[10px]' : 'rounded-r-[10px]'}`}
            style={{
              transform: next ? 'rotateY(180deg)' : 'rotateY(-180deg)',
              boxShadow: next ? '10px 0 28px rgba(20,60,80,0.25)' : '-10px 0 28px rgba(20,60,80,0.25)',
            }}
          >
            <HalfOf side={backSide}>{renderSpread(flip.to)}</HalfOf>
            <div className="leaf-shade absolute inset-0 bg-[#1f4f5e]" />
          </div>
        </div>
      </div>
    </>
  );
}
