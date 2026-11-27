import type { Spread } from '@/types/portfolio';

interface Props {
  spreads: Spread[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/** Hauteur de l'onglet glissée sous la page (masquée par la double-page, qui est au-dessus). */
const TUCK = 14;

/** Voile chaud + grain de cuir : patine la couleur choisie (adoucit les tons vifs). */
const PATINA = "linear-gradient(180deg, rgba(255,235,200,0.18), rgba(60,30,10,0.32)), var(--tex-leather)";

/**
 * Intercalaires coincés entre les pages, en haut à droite du carnet.
 * Droits (pas d'inclinaison), le bas caché sous la page : ils sortent du
 * carnet au lieu de flotter. L'onglet actif est simplement plus haut.
 */
export function DieCutTabs({ spreads, activeIndex, onSelect }: Props) {
  return (
    <nav
      aria-label="Intercalaires du carnet"
      className="pointer-events-none absolute left-[52%] right-[3%] z-28 flex items-end gap-1"
      style={{ bottom: `calc(100% - ${TUCK}px)` }}
    >
      {spreads.map((tab, index) => {
        if (tab.hideTab) return null;
        const current = index === activeIndex;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(index);
            }}
            title={`${tab.day} — ${tab.label}`}
            aria-current={current ? 'page' : undefined}
            className={`t-caption t-fantasy pointer-events-auto relative flex min-w-0 flex-1 cursor-pointer items-start justify-center overflow-hidden whitespace-nowrap rounded-t-[6px] px-1 pt-2 text-center uppercase transition-[height,filter] duration-300 ease-out ${
              current ? 'brightness-100' : 'brightness-[0.97] hover:brightness-105'
            }`}
            style={{
              height: (current ? 36 : 29) + TUCK,
              backgroundColor: tab.tabColor,
              color: tab.tabText,
              backgroundImage: PATINA,
              backgroundSize: "100% 100%, 180px 180px",
              textShadow: "0 1px 0 rgba(0,0,0,0.25)",
              // Liseré + ombre courte vers le haut seulement : l'onglet reste « collé » au carnet.
              boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.35), inset 0 0 0 1px rgba(0,0,0,0.2), 0 -1px 3px rgba(20,10,0,0.35)',
            }}
          >
            {/* Couture */}
            <span className="pointer-events-none absolute inset-x-[3px] top-[3px] bottom-0 rounded-t-[4px] border border-b-0 border-dashed border-white/35" />
            <span className="relative">{tab.tabLabel}</span>
          </button>
        );
      })}
    </nav>
  );
}
