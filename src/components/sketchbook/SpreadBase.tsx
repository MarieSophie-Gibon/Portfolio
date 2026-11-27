import type { ReactNode } from 'react';
import type { Spread } from '@/types/portfolio';

/* Taille de conception du carnet (en px) : tout est mis à l'échelle
 * par SketchbookStage, ce qui garde la mise en page identique partout. */
export const BOOK_W = 900;
export const BOOK_H = 625;

/* Anneaux de classeur (positions verticales en % de la page). */
const RINGS = [13, 33, 67, 87];

/** Pli central : creux de reliure + anneaux métalliques de classeur. */
function Gutter() {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-24 z-25">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(110,80,40,0.08) 30%, rgba(90,62,30,0.3) 46%, rgba(60,40,18,0.42) 50%, rgba(90,62,30,0.28) 54%, rgba(110,80,40,0.08) 70%, transparent 100%)',
        }}
      />
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-[#8E7246]/50" />
      {RINGS.map((top) => (
        <div key={top} className="absolute left-1/2 h-[14px] w-[58px] -translate-x-1/2 -translate-y-1/2" style={{ top: `${top}%` }}>
          {/* Perforations dans le papier */}
          <span className="absolute left-[3px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full bg-[#3A2414] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
          <span className="absolute right-[3px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full bg-[#3A2414] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
          {/* Anneau (laiton bruni) */}
          <span
            className="absolute inset-x-[6px] inset-y-[2px] rounded-full"
            style={{
              background: 'linear-gradient(180deg, #F3DDA2 0%, #C9A24E 35%, #7A5622 70%, #B88E44 100%)',
              boxShadow: '0 3px 4px rgba(30,15,3,0.45), inset 0 1px 0 rgba(255,245,210,0.7), inset 0 -1px 1px rgba(0,0,0,0.35)',
            }}
          />
        </div>
      ))}
    </div>
  );
}

export interface SpreadParts {
  left: ReactNode;
  right: ReactNode;
  crossGutter?: ReactNode;
}

interface SpreadBaseProps {
  spread: Spread;
  alias: string;
  parts: SpreadParts;
  /** Active + hors mode dessin/édition : clic gauche/droite pour tourner. */
  interactive: boolean;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  /** Ouvre la feuille « En savoir plus » de cette double-page. */
  onMore?: () => void;
  /** Afficher le bouton « En savoir plus » (contenu présent ou mode édition). */
  showMore?: boolean;
}

/** Double-page : pages de parchemin reliées par des anneaux (le cuir est réservé à la couverture). */
export function SpreadBase({ spread, alias, parts, interactive, canPrev, canNext, onPrev, onNext, onMore, showMore = true }: SpreadBaseProps) {
  const leftClickable = interactive && canPrev;
  const rightClickable = interactive && canNext;

  return (
    <div
      className="relative w-full h-full rounded-[10px] select-none"
      // Tranche du bloc de pages (fines feuilles empilées).
      style={{ boxShadow: '0 1px 0 #F1E6CC, 0 2px 0 #DCCDA8, 0 3px 0 #F1E6CC, 0 4px 0 #D3C29A, 0 0 0 1px rgba(120,90,50,0.35), 0 26px 46px -16px rgba(10,5,0,0.6), 0 8px 16px -8px rgba(10,5,0,0.4)' }}
    >
      <div className="relative w-full h-full rounded-[10px] overflow-hidden ruled-paper text-ink flex">
        <div className="pointer-events-none absolute inset-0 z-15" style={{ boxShadow: "inset 0 0 40px rgba(150,105,45,0.2), inset 0 0 0 1px rgba(150,110,50,0.18)" }} />

        {/* ============ PAGE GAUCHE ============ */}
        <div
          onClick={leftClickable ? onPrev : undefined}
          className={`group/left relative w-1/2 h-full flex flex-col justify-between pl-7 pr-9 pt-2.5 pb-3 overflow-hidden ${leftClickable ? 'cursor-pointer' : ''}`}
        >
          {/* En-tête de carnet : NO. / DATE */}
          <div className="t-pixel relative z-10 flex items-end gap-4 pb-1 pointer-events-none text-[#9A8463]">
            <span className="flex items-end gap-1.5">
              NO.
              <span className="t-hand min-w-12 border-b border-[#CDB98F] pb-px text-center tracking-normal text-gold">{spread.day}</span>
            </span>
            <span className="flex flex-1 items-end gap-1.5">
              DATE
              <span className="t-caption flex-1 border-b border-[#CDB98F] pb-0.5 font-mono tracking-[0.15em] normal-case text-[#7A6448]">{spread.dateLabel}</span>
            </span>
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-between py-1.5 min-h-0">{parts.left}</div>

          <div className="relative z-10 flex items-center justify-between pt-1 pointer-events-none">
            <span className="t-hand text-gold truncate max-w-[220px]">{alias}</span>
            <span className="t-pixel text-[#9A8463]">{spread.day ? `PG.${spread.day}` : ""}</span>
          </div>

          {leftClickable && <div className="pointer-events-none absolute bottom-0 left-0 w-12 h-12 z-20 page-curl-left" />}
        </div>

        {/* ============ PAGE DROITE ============ */}
        <div
          onClick={rightClickable ? onNext : undefined}
          className={`group/right relative w-1/2 h-full flex flex-col justify-between pl-9 pr-8 pt-2.5 pb-3 overflow-hidden ${rightClickable ? 'cursor-pointer' : ''}`}
        >
          <div className="t-pixel relative z-10 flex items-end gap-4 pb-1 pointer-events-none text-[#9A8463]">
            <span className="flex flex-1 items-end gap-1.5">
              TITLE
              <span className="t-hand flex-1 border-b border-[#CDB98F] pb-px tracking-normal text-gold truncate">
                {spread.edgeWord.toLowerCase()}
              </span>
            </span>
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-between py-1 min-h-0">{parts.right}</div>

          {/* Pied de page : bouton « En savoir plus » (seulement s'il y a quelque chose à montrer) */}
          <div className="relative z-10 flex min-h-6 items-center justify-end pt-1.5 pointer-events-none">
            {!showMore ? null : onMore ? (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation(); // ne pas tourner la page
                  onMore();
                }}
                className="t-hand pointer-events-auto mr-5 -rotate-2 rounded-[3px] bg-butter px-3 py-0.5 font-bold text-ink shadow-[0_3px_6px_-2px_rgba(20,60,80,0.35)] transition-transform hover:-translate-y-0.5 hover:rotate-0"
              >
                En savoir plus →
              </button>
            ) : (
              // Pages de l'éventail / copies du flip : même rendu, mais inerte.
              <span
                aria-hidden="true"
                className="t-hand mr-5 -rotate-2 rounded-[3px] bg-butter px-3 py-0.5 font-bold text-ink shadow-[0_3px_6px_-2px_rgba(20,60,80,0.35)]"
              >
                En savoir plus →
              </span>
            )}
          </div>

          {rightClickable && <div className="pointer-events-none absolute bottom-0 right-0 w-12 h-12 z-20 page-curl-right" />}
        </div>

        <Gutter />
        {parts.crossGutter}
      </div>
    </div>
  );
}
