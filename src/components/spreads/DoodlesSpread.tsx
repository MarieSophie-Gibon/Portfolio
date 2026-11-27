import { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import type { SpreadParts } from '@/components/sketchbook/SpreadBase';
import { EditableText, ItemTools, useCanEdit } from '@/components/admin/EditableText';
import { ImagePickerDialog } from '@/components/admin/EditableImage';
import { ShowIf, filled } from '@/components/admin/ShowIf';
import { MediaLightbox } from '@/components/sketchbook/MediaLightbox';
import type { ImageAsset } from '@/types/portfolio';
import { Heading, INK_MUTE, INK_SOFT } from './ProfileExperienceSpread';
import { MediaView } from './ScrapbookCollage';
import type { SpreadCtx } from './spreadContext';

/* ==================================================================
 * Doodles : mur de dessins et croquis. Les images se déposent en vrac
 * (légère rotation), un clic les ouvre en plein écran (carrousel).
 * Gauche : titre + intro + 2 dessins ; droite : les 4 suivants.
 * ================================================================== */

const LEFT = 2;
const RIGHT = 4;
const TILT = [-3, 2.5, -1.5, 3, -2.5, 1.5];

function Wall({ ctx, from, count, showAdd }: { ctx: SpreadCtx; from: number; count: number; showAdd: boolean }) {
  const canEdit = useCanEdit();
  const [zoom, setZoom] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const items = ctx.content.doodles.items;
  const list = items.slice(from, from + count);
  const hidden = items.length - (LEFT + RIGHT);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        {list.map((img, k) => {
          const i = from + k;
          return (
            <figure key={`${i}-${img.src.slice(-16)}`} className="group/doodle" style={{ transform: `rotate(${TILT[i % TILT.length]}deg)` }}>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom(i);
                }}
                className="block w-full cursor-zoom-in bg-[#FBF7EE] p-1.5 shadow-[0_10px_18px_-10px_rgba(40,20,5,0.6)] transition-transform hover:-translate-y-1"
              >
                <MediaView asset={img} className="block aspect-square w-full object-cover" />
              </button>
              <figcaption className={`t-hand mt-1 flex items-center justify-center gap-1 text-center ${INK_MUTE}`}>
                <EditableText
                  value={img.caption ?? ''}
                  placeholder="légende…"
                  onSave={(v) => ctx.edit((c) => void (c.doodles.items[i].caption = v))}
                />
                <ItemTools onRemove={() => ctx.edit((c) => void c.doodles.items.splice(i, 1))} />
              </figcaption>
            </figure>
          );
        })}
        {canEdit && showAdd && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setAdding(true);
            }}
            className={`t-caption flex aspect-square flex-col items-center justify-center gap-1 rounded border-2 border-dashed border-[#8E6A3E]/40 font-mono ${INK_MUTE} hover:border-[#B8893A] hover:text-[#8E5A1E]`}
          >
            <ImagePlus className="h-5 w-5" /> dessin / croquis
          </button>
        )}
      </div>
      {showAdd && hidden > 0 && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setZoom(LEFT + RIGHT);
          }}
          className={`t-hand mt-3 block w-full text-right ${INK_MUTE} hover:text-[#8E5A1E]`}
        >
          + {hidden} autre{hidden > 1 ? 's' : ''} →
        </button>
      )}

      <MediaLightbox items={items} index={zoom} onIndex={setZoom} onClose={() => setZoom(null)} />
      {adding && (
        <ImagePickerDialog
          value={{ src: '', alt: '' }}
          allowRemove={false}
          allowVideo
          onClose={() => setAdding(false)}
          onSave={(img: ImageAsset) => img.src && ctx.edit((c) => void c.doodles.items.push(img))}
        />
      )}
    </>
  );
}

export function renderDoodles(ctx: SpreadCtx): SpreadParts {
  const d = ctx.content.doodles;
  return {
    left: (
      <div className="relative flex h-full flex-col gap-4">
        <ShowIf has={filled(d.intro, d.items)}>
          <Heading big>Doodles</Heading>
        </ShowIf>
        <ShowIf has={d.intro}>
          <p className={`t-hand ${INK_SOFT}`}>
            <EditableText value={d.intro} onSave={(v) => ctx.edit((c) => void (c.doodles.intro = v))} multiline placeholder="Un mot sur ces griffonnages…" />
          </p>
        </ShowIf>
        <div className="mt-auto">
          <Wall ctx={ctx} from={0} count={LEFT} showAdd={d.items.length < LEFT} />
        </div>
      </div>
    ),
    right: (
      <div className="relative flex h-full flex-col justify-center pt-2">
        <Wall ctx={ctx} from={LEFT} count={RIGHT} showAdd={d.items.length >= LEFT} />
      </div>
    ),
  };
}
