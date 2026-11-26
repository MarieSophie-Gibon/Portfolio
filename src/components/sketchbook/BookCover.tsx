import type { BookCoverSettings, DeskItem, PortfolioContent } from '@/types/portfolio';
import { EditableText, useCanEdit } from '@/components/admin/EditableText';
import { EditableImage } from '@/components/admin/EditableImage';
import { AddStickerButton, StickerLayer, newStickerId } from './DeskItemsLayer';
import { DIE_CUT } from './LogoSticker';

interface Props {
  cover: BookCoverSettings;
  /** Couverture affichée en vrai (cliquable) ; false pour les copies du flip. */
  interactive: boolean;
  onOpen: () => void;
  edit: (fn: (draft: PortfolioContent) => void) => void;
}

/**
 * Carnet fermé. Occupe la même surface qu'une double-page :
 * moitié gauche vide (bureau), couverture rigide sur la moitié droite.
 * Ainsi le tournage 3D existant sert aussi à l'ouverture / fermeture.
 */
export function BookCover({ cover, interactive, onOpen, edit }: Props) {
  const canEdit = useCanEdit();
  const set = (k: 'title' | 'subtitle' | 'footer') => (v: string) => edit((c) => void (c.settings.cover[k] = v));
  const editStickers = (fn: (items: DeskItem[]) => void) => edit((c) => fn(c.settings.cover.stickers));

  return (
    <div className="pointer-events-none relative h-full w-full select-none">
      <div
        onClick={interactive && !canEdit ? onOpen : undefined}
        role={interactive && !canEdit ? 'button' : undefined}
        aria-label={interactive && !canEdit ? 'Ouvrir le carnet' : undefined}
        className={`pointer-events-auto group absolute inset-y-0 left-1/2 w-1/2 rounded-l-[5px] rounded-r-[14px] ${
          interactive && !canEdit ? 'cursor-pointer' : ''
        }`}
        style={{
          backgroundColor: cover.color,
          // Toile de la couverture + reflet + bloc de pages qui dépasse.
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.035) 0 1px, transparent 1px 3px), linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0) 45%, rgba(0,0,0,0.06))',
          boxShadow:
            'inset 0 0 0 1px rgba(0,0,0,0.08), inset 0 2px 0 rgba(255,255,255,0.35), 2px 2px 0 #F4EFE4, 3px 3px 0 #E3DBCB, 4px 4px 0 #F4EFE4, 5px 5px 0 #DAD1BF',
        }}
      >
        {/* Charnière du dos */}
        <div
          className="absolute inset-y-0 left-0 w-5 rounded-l-[5px]"
          style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.18), rgba(0,0,0,0.04) 60%, rgba(255,255,255,0.12) 85%, rgba(0,0,0,0.08))' }}
        />

        {/* Élastique */}
        <div
          className="absolute inset-y-0 right-9 w-3.5"
          style={{
            background: `linear-gradient(90deg, rgba(0,0,0,0.25), transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%, rgba(0,0,0,0.25)), ${cover.strap}`,
            boxShadow: '2px 0 4px rgba(0,0,0,0.18)',
          }}
        />

        {/* Étiquette de titre */}
        <div className="absolute left-[12%] right-[22%] top-[17%] -rotate-1 rounded-[4px] bg-[#FBF8F1] px-5 py-4 shadow-[0_6px_14px_-6px_rgba(20,60,80,0.4)]">
          <div className="pointer-events-none absolute inset-1.5 rounded-[3px] border border-dashed border-ink/20" />
          <h1 className="t-title relative text-ink">
            <EditableText value={cover.title} onSave={set('title')} />
          </h1>
          <div className="relative mt-2 h-px bg-ink/15" />
          <p className="t-caption relative mt-2 font-mono uppercase tracking-[0.2em] text-ink/60">
            <EditableText value={cover.subtitle} onSave={set('subtitle')} />
          </p>
        </div>

        {/* Visuel (logo, illustration…) */}
        {(cover.image.src || canEdit) && (
          <div className="absolute left-[24%] top-[46%] w-[34%] rotate-[-6deg]">
            <EditableImage value={cover.image} onSave={(img) => edit((c) => void (c.settings.cover.image = img))}>
              {cover.image.src ? (
                <img src={cover.image.src} alt={cover.image.alt} draggable={false} className="block w-full" style={{ filter: DIE_CUT }} />
              ) : (
                <div className="t-caption flex aspect-square items-center justify-center rounded-full border-2 border-dashed border-ink/30 font-mono text-ink/50">
                  IMAGE
                </div>
              )}
            </EditableImage>
          </div>
        )}

        {/* Pied de couverture */}
        <p className="t-caption absolute bottom-6 left-[12%] font-mono uppercase tracking-[0.25em] text-ink/55">
          <EditableText value={cover.footer} onSave={set('footer')} />
        </p>
        {interactive && !canEdit && (
          <span className="t-hand absolute bottom-5 right-16 -rotate-3 font-bold text-ink/75 transition-transform group-hover:translate-x-1">
            ouvrir le carnet →
          </span>
        )}

        <StickerLayer items={cover.stickers} onEdit={editStickers} className="z-20" />
        {interactive && <AddStickerButton onAdd={(item) => editStickers((list) => void list.push({ ...item, id: newStickerId() }))} />}
      </div>
    </div>
  );
}
