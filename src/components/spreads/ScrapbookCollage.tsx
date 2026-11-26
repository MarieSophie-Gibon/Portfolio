import { useContext, useState, type CSSProperties } from 'react';
import { Play, Plus } from 'lucide-react';
import { EditableImage, ImagePickerDialog } from '@/components/admin/EditableImage';
import { EditableText, ItemTools, useCanEdit } from '@/components/admin/EditableText';
import { MetallicPaperclip, WashiTape, type TapeVariant } from '@/components/sketchbook/DestroyDecorations';
import { ArtworkPresetSVG } from '@/components/sketchbook/Illustrations';
import type { ImageAsset, ProjectArticle } from '@/types/portfolio';
import { ActiveSpreadContext } from './spreadContext';

/* ------------------------------------------------------------------ */
/* Média (image ou vidéo)                                              */
/* ------------------------------------------------------------------ */

/** Image ou vidéo. Les vidéos ne tournent que sur la double-page active (muettes, en boucle). */
export function MediaView({ asset, className = '', controls = false }: { asset: ImageAsset; className?: string; controls?: boolean }) {
  const active = useContext(ActiveSpreadContext);
  if (asset.type === 'video') {
    return (
      <video
        src={asset.src}
        aria-label={asset.alt}
        muted
        loop
        playsInline
        autoPlay={active || controls}
        controls={controls}
        preload="metadata"
        className={className}
      />
    );
  }
  return <img src={asset.src} alt={asset.alt} draggable={false} className={className} />;
}

/* ------------------------------------------------------------------ */
/* Collage scrapbook (page gauche d'un projet)                         */
/* ------------------------------------------------------------------ */

type Slot = { l: number; t: number; w: number; r: number };

/** Emplacements (en % de la zone) selon le nombre de médias. */
const LAYOUTS: Slot[][] = [
  [],
  [{ l: 6, t: 4, w: 88, r: -2 }],
  [
    { l: 0, t: 2, w: 68, r: -3 },
    { l: 34, t: 44, w: 64, r: 4 },
  ],
  [
    { l: 0, t: 0, w: 62, r: -3 },
    { l: 42, t: 16, w: 58, r: 4 },
    { l: 6, t: 54, w: 56, r: 2 },
  ],
  [
    { l: 0, t: 0, w: 56, r: -3 },
    { l: 46, t: 3, w: 54, r: 5 },
    { l: 3, t: 50, w: 52, r: 3 },
    { l: 49, t: 53, w: 50, r: -4 },
  ],
];
const TAPES: TapeVariant[] = ['pink', 'cyan', 'checker', 'hazard'];

interface CollageProps {
  article: ProjectArticle;
  /** Modifie l'article dans le brouillon. */
  edit: (fn: (a: ProjectArticle) => void) => void;
  onOpen: () => void;
}

/**
 * Photos / vidéos en polaroids collés de travers.
 * Média n°1 = image principale (ou illustration intégrée), puis la galerie.
 */
export function ScrapbookCollage({ article, edit, onOpen }: CollageProps) {
  const canEdit = useCanEdit();
  const [adding, setAdding] = useState(false);

  type Entry = { asset: ImageAsset | null; galleryIndex: number | null };
  const entries: Entry[] = [
    { asset: article.coverImage.src ? article.coverImage : null, galleryIndex: null },
    ...article.gallery.map((g, i) => ({ asset: g, galleryIndex: i })),
  ].slice(0, 4);
  const slots = LAYOUTS[entries.length];

  return (
    <div className="relative h-full w-full">
      {entries.map((e, i) => {
        const s = slots[i];
        const style: CSSProperties = { left: `${s.l}%`, top: `${s.t}%`, width: `${s.w}%`, transform: `rotate(${s.r}deg)`, zIndex: i + 1 };
        const save = (next: ImageAsset) =>
          edit((a) => {
            if (e.galleryIndex === null) a.coverImage = next;
            else a.gallery[e.galleryIndex] = next;
          });
        return (
          <figure
            key={i}
            style={style}
            onClick={(ev) => {
              ev.stopPropagation();
              if (!canEdit) onOpen();
            }}
            className="absolute cursor-pointer bg-white p-[3%] pb-[2%] shadow-[0_12px_22px_-12px_rgba(20,60,80,0.55),0_2px_4px_rgba(20,60,80,0.12)] transition-transform hover:-translate-y-1"
          >
            {i === 0 ? (
              <MetallicPaperclip className="absolute -top-4 right-3 z-20 h-9 w-4" rotate={12} />
            ) : (
              <WashiTape variant={TAPES[i % TAPES.length]} className="absolute -top-2 left-1/2 z-20 h-3.5 w-16 -translate-x-1/2" rotate={i % 2 ? 4 : -3} />
            )}
            <EditableImage value={e.asset ?? { ...article.coverImage, type: 'image' }} onSave={save} allowRemove={e.galleryIndex === null} allowVideo>
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                {e.asset ? (
                  <MediaView asset={e.asset} className="h-full w-full object-cover" />
                ) : article.artwork ? (
                  <div className="flex h-full w-full items-center">
                    <ArtworkPresetSVG preset={article.artwork} />
                  </div>
                ) : (
                  <div className="halftone-dots h-full w-full" style={{ backgroundColor: article.accent }} />
                )}
                {e.asset?.type === 'video' && (
                  <span className="t-caption absolute bottom-1 left-1 inline-flex items-center gap-0.5 rounded-full bg-ink/70 px-1.5 py-0.5 font-mono font-bold text-white">
                    <Play className="h-2 w-2" /> VIDÉO
                  </span>
                )}
              </div>
            </EditableImage>
            <figcaption className="t-hand flex items-center justify-center gap-1 pt-0.5 text-center text-slate-600">
              {e.galleryIndex === null ? (
                <EditableText value={article.shortTag} onSave={(v) => edit((a) => void (a.shortTag = v))} />
              ) : (
                <>
                  <EditableText
                    value={e.asset?.caption ?? ''}
                    placeholder="légende…"
                    onSave={(v) => edit((a) => void (a.gallery[e.galleryIndex!].caption = v))}
                  />
                  <ItemTools onRemove={() => edit((a) => void a.gallery.splice(e.galleryIndex!, 1))} />
                </>
              )}
            </figcaption>
          </figure>
        );
      })}

      {canEdit && entries.length < 4 && (
        <button
          type="button"
          onPointerDown={(ev) => ev.stopPropagation()}
          onClick={(ev) => {
            ev.stopPropagation();
            setAdding(true);
          }}
          className="t-caption absolute bottom-1 right-1 z-30 inline-flex items-center gap-1 rounded-full border border-dashed border-magenta bg-white/90 px-2 py-0.5 font-mono font-bold text-magenta hover:bg-magenta hover:text-white"
        >
          <Plus className="h-3 w-3" /> photo / vidéo
        </button>
      )}
      {canEdit && entries.length >= 4 && article.gallery.length > 3 && (
        <span className="t-caption absolute bottom-1 right-1 z-30 rounded-full bg-white/90 px-2 py-0.5 font-mono text-slate-500">
          +{article.gallery.length - 3} dans la fiche
        </span>
      )}

      {adding && (
        <ImagePickerDialog
          value={{ src: '', alt: article.title }}
          allowRemove={false}
          allowVideo
          onClose={() => setAdding(false)}
          onSave={(img) => img.src && edit((a) => void a.gallery.push(img))}
        />
      )}
    </div>
  );
}
