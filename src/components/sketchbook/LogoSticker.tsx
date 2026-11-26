import { EditableImage } from '@/components/admin/EditableImage';
import { useCanEdit } from '@/components/admin/EditableText';
import type { ImageAsset } from '@/types/portfolio';

/* Liseré blanc « die-cut » qui suit la forme (alpha) de l'image + ombre portée. */
export const DIE_CUT =
  'drop-shadow(3px 0 0 #fff) drop-shadow(-3px 0 0 #fff) drop-shadow(0 3px 0 #fff) drop-shadow(0 -3px 0 #fff) drop-shadow(0 8px 12px rgba(8,10,20,0.45))';

interface Props {
  logo: ImageAsset;
  onHome: () => void;
  onSave: (logo: ImageAsset) => void;
}

/** Logo façon sticker en haut à gauche ; clic = retour à la couverture. */
export function LogoSticker({ logo, onHome, onSave }: Props) {
  const canEdit = useCanEdit();
  if (!logo.src && !canEdit) return null;

  const img = logo.src ? (
    <img src={logo.src} alt={logo.alt} draggable={false} className="block w-full h-auto select-none" style={{ filter: DIE_CUT }} />
  ) : (
    <div className="flex aspect-square w-full items-center justify-center rounded-full border-2 border-dashed border-white/60 font-mono text-[9px] text-white/70">
      LOGO
    </div>
  );

  return (
    <div className="absolute left-4 top-3 z-40 w-14 sm:w-18 lg:w-22">
      {canEdit ? (
        <EditableImage value={logo} onSave={onSave} className="-rotate-6 rounded-full">
          {img}
        </EditableImage>
      ) : (
        <button
          type="button"
          onClick={onHome}
          onPointerDown={(e) => e.stopPropagation()}
          title="Retour à la couverture"
          aria-label="Retour à la couverture"
          className="block w-full -rotate-6 transition-transform duration-300 ease-out hover:rotate-0 hover:scale-110 active:scale-95"
        >
          {img}
        </button>
      )}
    </div>
  );
}
