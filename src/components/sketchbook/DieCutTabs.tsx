import type { Spread } from '@/types/portfolio';

interface Props {
  spreads: Spread[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/** Hauteur de l'onglet glissée sous la page (masquée par la double-page, qui est au-dessus). */
const TUCK = 14;

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
            className={`t-caption pointer-events-auto relative flex min-w-0 flex-1 cursor-pointer items-start justify-center overflow-hidden whitespace-nowrap rounded-t-[7px] px-1.5 pt-2 text-center font-mono font-extrabold uppercase tracking-tight transition-[height,filter] duration-300 ease-out ${
              current ? 'brightness-100' : 'brightness-[0.97] hover:brightness-105'
            }`}
            style={{
              height: (current ? 36 : 29) + TUCK,
              backgroundColor: tab.tabColor,
              color: tab.tabText,
              // Liseré + ombre courte vers le haut seulement : l'onglet reste « collé » au carnet.
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), 0 -1px 3px rgba(20,60,80,0.18)',
            }}
          >
            {tab.tabLabel}
          </button>
        );
      })}
    </nav>
  );
}
