import type { CSSProperties } from 'react';
import type { Spread } from '@/types/portfolio';

interface Props {
  spreads: Spread[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/** Hauteur glissée sous la page (masquée par la double-page, qui est au-dessus). */
const TUCK = 14;

/** Voile chaud + grain de cuir : patine la couleur choisie (adoucit les tons vifs). */
const PATINA = 'linear-gradient(180deg, rgba(255,235,200,0.18), rgba(60,30,10,0.32)), var(--tex-leather)';

const leather = (color: string): CSSProperties => ({
  backgroundColor: color,
  backgroundImage: PATINA,
  backgroundSize: '100% 100%, 180px 180px',
  boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.35), inset 0 0 0 1px rgba(0,0,0,0.2), 0 -1px 3px rgba(20,10,0,0.35)',
});

/** Étiquette de parchemin qui apparaît au survol au-dessus d'un onglet. */
function Tooltip({ label }: { label: string }) {
  if (!label) return null;
  return (
    <span className="t-caption t-fantasy pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-sm bg-[#F3E9D2] px-2 py-0.5 uppercase tracking-[0.1em] text-[#3A2414] opacity-0 shadow-[0_4px_10px_-4px_rgba(20,10,0,0.6)] transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
      {label}
    </span>
  );
}

/**
 * Intercalaires coincés entre les pages, en haut à droite du carnet : de
 * simples languettes de cuir colorées (sans texte, le nom apparaît au survol).
 * (Les Doodles ont leur propre carnet de croquis, en bas à droite de l'écran.)
 */
export function DieCutTabs({ spreads, activeIndex, onSelect }: Props) {
  const select = (index: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(index);
  };

  return (
    <>
      <nav
        aria-label="Intercalaires du carnet"
        className="pointer-events-none absolute left-[52%] right-[4%] z-28 flex items-end gap-1.5"
        style={{ bottom: `calc(100% - ${TUCK}px)` }}
      >
        {spreads.map((tab, index) => {
          if (tab.hideTab) return null;
          const current = index === activeIndex;
          const label = tab.tabLabel || tab.label;
          return (
            <div key={tab.id} className="group relative min-w-0 flex-1">
              <Tooltip label={label} />
              <button
                type="button"
                onClick={select(index)}
                aria-label={label || `Page ${index + 1}`}
                aria-current={current ? 'page' : undefined}
                className={`pointer-events-auto relative block w-full cursor-pointer overflow-hidden rounded-t-[6px] transition-[height,filter] duration-300 ease-out ${
                  current ? 'brightness-100' : 'brightness-[0.95] hover:brightness-105'
                }`}
                style={{ height: (current ? 34 : 26) + TUCK, ...leather(tab.tabColor) }}
              >
                {/* Couture */}
                <span className="pointer-events-none absolute inset-x-[3px] bottom-0 top-[3px] rounded-t-[4px] border border-b-0 border-dashed border-white/35" />
              </button>
            </div>
          );
        })}
      </nav>

    </>
  );
}
