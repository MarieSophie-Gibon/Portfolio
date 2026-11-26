import type { ReactNode } from 'react';
import type { Spread } from '@/types/portfolio';

/* Taille de conception du carnet (en px) : tout est mis à l'échelle
 * par SketchbookStage, ce qui garde la mise en page identique partout. */
export const BOOK_W = 900;
export const BOOK_H = 625;

/** Pli central : creux de reliure doux, sans spirale. */
function Gutter() {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-16 z-25">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(120,95,55,0.06) 30%, rgba(110,85,45,0.22) 47%, rgba(90,70,35,0.32) 50%, rgba(110,85,45,0.2) 53%, rgba(120,95,55,0.06) 70%, transparent 100%)',
        }}
      />
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-[#B9A47C]/50" />
    </div>
  );
}

/** Petits gribouillis dorés (étoiles, flèche pointillée) sur le papier. */
function GoldDoodles({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 900 625" className="pointer-events-none absolute inset-0 w-full h-full z-5" aria-hidden="true">
      <g fill="none" stroke="#C99A2E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.55">
        <path d="M398 70 l5 11 12 1 -9 8 3 12 -11 -6 -11 6 3 -12 -9 -8 12 -1 Z" />
        <path d="M808 560 c18 -14 34 -14 50 -2" strokeDasharray="3 5" />
        <path d="M852 552 l8 6 -9 4" />
      </g>
      <g fill={color} opacity="0.35">
        <circle cx="470" cy="590" r="3" />
        <circle cx="482" cy="596" r="2" />
        <circle cx="60" cy="40" r="2.5" />
      </g>
    </svg>
  );
}

/** Marque-pages adhésifs qui dépassent du bord extérieur d'une page. */
function StickyFlags({ side, color }: { side: 'left' | 'right'; color: string }) {
  const pos = side === 'left' ? 'left-0' : 'right-0';
  return (
    <div className={`pointer-events-none absolute ${pos} top-[22%] z-20 flex flex-col gap-10`}>
      {[color, '#FFE27A'].map((c, i) => (
        <span key={i} className="block h-6 w-3 opacity-90 shadow-sm" style={{ backgroundColor: c, opacity: i ? 0.75 : 0.9 }} />
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
  /** Signet en ruban (uniquement sur la double-page active). */
  ribbon?: boolean;
  /** Ouvre la feuille « En savoir plus » de cette double-page. */
  onMore?: () => void;
}

/** Double-page : couverture rigide moutarde + pages crème lignées. */
export function SpreadBase({ spread, alias, parts, interactive, canPrev, canNext, onPrev, onNext, ribbon = false, onMore }: SpreadBaseProps) {
  const leftClickable = interactive && canPrev;
  const rightClickable = interactive && canNext;

  return (
    <div
      className="relative w-full h-full rounded-[10px] select-none"
      // Tranche du bloc de pages (fines feuilles empilées), sans couverture colorée.
      style={{ boxShadow: '0 1px 0 #F4EFE4, 0 2px 0 #E3DBCB, 0 3px 0 #F4EFE4, 0 4px 0 #DAD1BF, 0 0 0 1px rgba(150,125,85,0.25)' }}
    >
      <div className="relative w-full h-full rounded-[10px] overflow-hidden ruled-paper text-ink flex">
        <div className="pointer-events-none absolute inset-0 z-15" style={{ boxShadow: 'inset 0 0 30px rgba(150,120,70,0.12)' }} />
        <GoldDoodles color={spread.tabColor} />

        {/* ============ PAGE GAUCHE ============ */}
        <div
          onClick={leftClickable ? onPrev : undefined}
          className={`group/left relative w-1/2 h-full flex flex-col justify-between pl-7 pr-9 pt-2.5 pb-3 overflow-hidden ${leftClickable ? 'cursor-pointer' : ''}`}
        >
          <StickyFlags side="left" color={spread.edgeLeftColor} />

          {/* En-tête de carnet : NO. / DATE */}
          <div className="t-caption relative z-10 flex items-end gap-4 pb-1 pointer-events-none font-mono tracking-[0.2em] text-slate-400">
            <span className="flex items-end gap-1.5">
              NO.
              <span className="t-hand min-w-12 border-b border-slate-300 pb-px text-center tracking-normal text-gold">{spread.day}</span>
            </span>
            <span className="flex flex-1 items-end gap-1.5">
              DATE
              <span className="t-caption flex-1 border-b border-slate-300 pb-0.5 tracking-[0.15em] text-slate-500">{spread.dateLabel}</span>
            </span>
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-between py-1.5 min-h-0">{parts.left}</div>

          <div className="relative z-10 flex items-center justify-between pt-1 pointer-events-none">
            <span className="t-hand text-gold truncate max-w-[220px]">{alias}</span>
            <span className="t-caption font-mono tracking-widest text-slate-400">— {spread.day} —</span>
          </div>

          {leftClickable && <div className="pointer-events-none absolute bottom-0 left-0 w-12 h-12 z-20 page-curl-left" />}
        </div>

        {/* ============ PAGE DROITE ============ */}
        <div
          onClick={rightClickable ? onNext : undefined}
          className={`group/right relative w-1/2 h-full flex flex-col justify-between pl-9 pr-8 pt-2.5 pb-3 overflow-hidden ${rightClickable ? 'cursor-pointer' : ''}`}
        >
          <StickyFlags side="right" color={spread.edgeRightColor} />

          <div className="t-caption relative z-10 flex items-end gap-4 pb-1 pointer-events-none font-mono tracking-[0.2em] text-slate-400">
            <span className="flex flex-1 items-end gap-1.5">
              TITLE
              <span className="t-hand flex-1 border-b border-slate-300 pb-px tracking-normal text-gold truncate">
                {spread.edgeWord.toLowerCase()}
              </span>
            </span>
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-between py-1 min-h-0">{parts.right}</div>

          {/* Pastilles de couleur + semaine */}
          <div className="relative z-10 flex items-center justify-between pt-1.5 pointer-events-none">
            <div className="flex items-center gap-1.5">
              {spread.swatches.map((hex, i) => (
                <span key={i} className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: hex }} />
              ))}
            </div>
            {onMore ? (
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

      {/* Signet en ruban qui dépasse en bas */}
      {ribbon && (
      <div
        className="pointer-events-none absolute left-[calc(50%+14px)] -top-1 z-30 w-[11px] h-[calc(100%+22px)]"
        style={{
          background: 'linear-gradient(90deg, #E9B935, #F7D46A 50%, #E2AA28)',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 9px), 0 100%)',
          boxShadow: '1px 0 2px rgba(0,0,0,0.15)',
          opacity: 0.95,
        }}
      />
      )}
    </div>
  );
}
