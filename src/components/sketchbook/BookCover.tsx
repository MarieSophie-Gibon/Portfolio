import type { BookCoverSettings, DeskItem, PortfolioContent } from '@/types/portfolio';
import { EditableText, useCanEdit } from '@/components/admin/EditableText';
import { isDark } from '@/lib/textures';
import { AddStickerButton, StickerLayer, newStickerId } from './DeskItemsLayer';

interface Props {
  cover: BookCoverSettings;
  /** Couverture affichée en vrai (cliquable) ; false pour les copies du flip. */
  interactive: boolean;
  onOpen: () => void;
  edit: (fn: (draft: PortfolioContent) => void) => void;
}

/** Matière du cuir (partagée par la couverture et les plats du livre ouvert). */
export const leatherStyle = (color: string) => ({
  backgroundColor: color,
  // Cuir : usure claire, grain, reflet, bords assombris.
  backgroundImage:
    'var(--tex-leather-wear), var(--tex-leather), radial-gradient(ellipse at 30% 20%, rgba(255,240,210,0.18), transparent 55%), radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(25,10,2,0.45) 100%)',
  backgroundSize: '400px 400px, 180px 180px, 100% 100%, 100% 100%',
});

/** Rivet de laiton. */
function Stud({ className }: { className: string }) {
  return (
    <span
      className={`pointer-events-none absolute h-[2.6%] aspect-square rounded-full ${className}`}
      style={{
        background: 'radial-gradient(circle at 35% 30%, #FBE7B0 0%, #C9A24E 45%, #6E4E1C 100%)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.55), inset 0 -1px 1px rgba(0,0,0,0.3)',
      }}
    />
  );
}

/** Fleuron d'angle gaufré (orientation via les classes de symétrie). */
function Corner({ className, color }: { className: string; color: string }) {
  return (
    <svg viewBox="0 0 60 60" className={`pointer-events-none absolute w-[13%] ${className}`} aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round">
        <path d="M2 30 V2 H30" />
        <path d="M8 26 C8 14 14 8 26 8" />
        <path d="M14 8 C20 14 20 20 14 26 C8 20 8 14 14 8 Z" />
        <circle cx="14" cy="14" r="1.6" fill={color} />
      </g>
    </svg>
  );
}

/**
 * Carnet fermé : grimoire de voyage en cuir. Occupe la même surface qu'une
 * double-page (moitié gauche vide, couverture rigide sur la moitié droite),
 * ainsi le tournage 3D existant sert aussi à l'ouverture / fermeture.
 * Tout le décor (timbres, sceau, images…) est fait de stickers éditables.
 */
export function BookCover({ cover, interactive, onOpen, edit }: Props) {
  const canEdit = useCanEdit();
  const set = (k: 'title' | 'subtitle' | 'footer') => (v: string) => edit((c) => void (c.settings.cover[k] = v));
  const editStickers = (fn: (items: DeskItem[]) => void) => edit((c) => fn(c.settings.cover.stickers));

  // Cuir sombre : dorure ; cuir clair : gaufrage (creux sombre + reflet clair).
  const dark = isDark(cover.color);
  const line = dark ? 'rgba(227,191,106,0.75)' : 'rgba(55,30,12,0.45)';
  const titleStyle = dark
    ? { backgroundImage: 'linear-gradient(180deg, #F7E2A4 0%, #E3BF6A 45%, #B8893A 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.6))' }
    : { color: 'rgba(52,28,10,0.82)', textShadow: '0 1px 0 rgba(255,236,200,0.35), 0 -1px 0 rgba(0,0,0,0.25)' };
  const softText = dark ? 'text-[#E9D3A0]/80' : 'text-[#3A200C]/70';

  return (
    <div className="pointer-events-none relative h-full w-full select-none">
      {/* Feuilles volantes qui dépassent du carnet */}
      <div className="absolute left-[calc(50%+18px)] right-[3%] top-[-1.6%] h-[30%] rotate-[1.2deg] rounded-sm bg-[#F3E6C8] shadow-[0_2px_4px_rgba(0,0,0,0.25)]" />
      <div className="absolute right-[-1.4%] top-[16%] h-[26%] w-[10%] rotate-[2deg] rounded-sm bg-[#EADBB8] shadow-[0_2px_4px_rgba(0,0,0,0.25)]" />
      <div className="absolute right-[-0.8%] top-[58%] h-[8%] w-[6%] rounded-r-sm bg-[#9E3B32] shadow-[0_2px_3px_rgba(0,0,0,0.3)]" />

      <div
        onClick={interactive && !canEdit ? onOpen : undefined}
        role={interactive && !canEdit ? 'button' : undefined}
        aria-label={interactive && !canEdit ? 'Ouvrir le carnet' : undefined}
        className={`pointer-events-auto group absolute inset-y-0 left-1/2 w-1/2 overflow-hidden rounded-l-[6px] rounded-r-[16px] ${
          interactive && !canEdit ? 'cursor-pointer' : ''
        }`}
        style={{
          ...leatherStyle(cover.color),
          boxShadow:
            'inset 0 0 0 1px rgba(0,0,0,0.3), inset 0 0 18px rgba(0,0,0,0.35), 2px 2px 0 #EFE3C8, 3px 3px 0 #D8C69E, 4px 4px 0 #EFE3C8, 5px 5px 0 #CDB88C, 8px 12px 24px -6px rgba(0,0,0,0.5)',
        }}
      >
        {/* Charnière du dos */}
        <div
          className="absolute inset-y-0 left-0 w-[7%]"
          style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.42), rgba(0,0,0,0.1) 55%, rgba(255,235,200,0.14) 80%, rgba(0,0,0,0.22))' }}
        />

        {/* Filets gaufrés + fleurons d'angle */}
        <div className="pointer-events-none absolute inset-[6%] left-[11%] rounded-[4px]" style={{ boxShadow: `0 0 0 1.5px ${line}, inset 0 0 0 5px transparent, inset 0 0 0 6px ${line}` }} />
        <Corner className="left-[12.5%] top-[7.5%]" color={line} />
        <Corner className="right-[7.5%] top-[7.5%] -scale-x-100" color={line} />
        <Corner className="bottom-[7.5%] left-[12.5%] -scale-y-100" color={line} />
        <Corner className="bottom-[7.5%] right-[7.5%] -scale-100" color={line} />

        <Stud className="left-[9%] top-[2.4%]" />
        <Stud className="right-[3%] top-[2.4%]" />
        <Stud className="bottom-[2.4%] left-[9%]" />
        <Stud className="bottom-[2.4%] right-[3%]" />

        {/* Titre */}
        <div className="absolute left-[16%] right-[12%] top-[20%] text-center">
          <h1 className="t-title t-fantasy relative" style={titleStyle}>
            <EditableText value={cover.title} onSave={set('title')} />
          </h1>
          <div className="mx-auto mt-3 flex w-[64%] items-center gap-2" aria-hidden="true">
            <span className="h-px flex-1" style={{ background: line }} />
            <span className="text-[9px]" style={{ color: line }}>
              ✦
            </span>
            <span className="h-px flex-1" style={{ background: line }} />
          </div>
          <p className={`t-caption t-fantasy relative mt-2.5 uppercase ${softText}`}>
            <EditableText value={cover.subtitle} onSave={set('subtitle')} />
          </p>
        </div>

        {/* Pied de couverture */}
        <p className={`t-caption t-fantasy absolute bottom-[11%] left-0 right-0 text-center uppercase ${softText}`}>
          <EditableText value={cover.footer} onSave={set('footer')} />
        </p>
        {interactive && !canEdit && (
          <span
            className="t-hand absolute bottom-[4.5%] right-[10%] -rotate-2 font-bold opacity-80 transition-transform group-hover:translate-x-1"
            style={{ color: dark ? '#F2DCA0' : '#3A200C' }}
          >
            ouvrir le grimoire →
          </span>
        )}

        <StickerLayer items={cover.stickers} onEdit={editStickers} className="z-20" />
        {interactive && <AddStickerButton onAdd={(item) => editStickers((list) => void list.push({ ...item, id: newStickerId() }))} />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Livre ouvert : plats de couverture de part et d'autre des pages      */
/* ------------------------------------------------------------------ */

/** Débord du cuir autour des pages (px de conception). */
const BOARD_X = 24;
const BOARD_Y = 17;

/**
 * Plats en cuir du livre ouvert (plat avant rabattu à gauche, plat arrière
 * à droite), même couleur et même matière que la couverture. Ils dépassent
 * légèrement des pages, comme sur un vrai carnet relié.
 */
export function OpenCoverBoards({ color }: { color: string }) {
  const dark = isDark(color);
  const line = dark ? 'rgba(227,191,106,0.55)' : 'rgba(55,30,12,0.35)';
  const board = (side: 'left' | 'right') => (
    <div
      className={`absolute ${side === 'left' ? 'rounded-l-[16px] rounded-r-[4px]' : 'rounded-l-[4px] rounded-r-[16px]'}`}
      style={{
        ...leatherStyle(color),
        top: -BOARD_Y,
        bottom: -BOARD_Y - 4,
        ...(side === 'left' ? { left: -BOARD_X, right: 'calc(50% + 3px)' } : { right: -BOARD_X, left: 'calc(50% + 3px)' }),
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3), inset 0 0 16px rgba(0,0,0,0.35), 0 26px 46px -16px rgba(10,5,0,0.6), 0 8px 16px -8px rgba(10,5,0,0.4)',
      }}
    >
      {/* Filet gaufré ou doré qui court le long du bord du plat */}
      <div className="absolute inset-[5px] rounded-[12px]" style={{ boxShadow: `inset 0 0 0 1px ${line}` }} />
      <Stud className={`top-[1.4%] ${side === 'left' ? 'left-[0.8%]' : 'right-[0.8%]'}`} />
      <Stud className={`bottom-[1.4%] ${side === 'left' ? 'left-[0.8%]' : 'right-[0.8%]'}`} />
    </div>
  );
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {board('left')}
      {board('right')}
      {/* Dos du livre, visible entre les deux plats */}
      <div
        className="absolute left-1/2 w-[10px] -translate-x-1/2"
        style={{ top: -BOARD_Y + 4, bottom: -BOARD_Y, ...leatherStyle(color), filter: 'brightness(0.65)' }}
      />
    </div>
  );
}
