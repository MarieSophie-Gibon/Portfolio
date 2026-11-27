import type { SpreadParts } from '@/components/sketchbook/SpreadBase';
import { EditableText } from '@/components/admin/EditableText';
import { ShowIf, filled } from '@/components/admin/ShowIf';
import type { SpreadCtx } from './spreadContext';

/* Page « Lab & croquis » : uniquement du texte ; le décor (images, croquis,
 * stickers) s'ajoute librement via « + Sticker ». */
export function renderMoodboard(ctx: SpreadCtx): SpreadParts {
  const m = ctx.content.moodboard;
  const set = (k: keyof typeof m) => (v: string) => ctx.edit((c) => void (c.moodboard[k] = v));

  return {
    left: (
      <div className="relative h-full flex flex-col justify-between gap-2">
        <ShowIf has={filled(m.studyLabel, m.studyTag, m.studyCaption)}>
          <div className="relative bg-white/70 p-3 border border-ink/10 shadow-[0_10px_22px_-14px_rgba(60,40,15,0.45)]" style={{ transform: 'rotate(-1deg)' }}>
            <div className="t-caption flex justify-between gap-2 font-mono text-ink/60 uppercase tracking-widest">
              <EditableText value={m.studyLabel} onSave={set('studyLabel')} />
              <EditableText value={m.studyTag} onSave={set('studyTag')} />
            </div>
            <p className="t-hand mt-1 text-ink/80">
              <EditableText value={m.studyCaption} onSave={set('studyCaption')} />
            </p>
          </div>
        </ShowIf>
        <ShowIf has={filled(m.quote)}>
          <p className="t-hand text-ink/75 mt-auto">
            <EditableText value={m.quote} onSave={set('quote')} multiline />
          </p>
        </ShowIf>
      </div>
    ),
    right: (
      <div className="relative h-full flex flex-col justify-between">
        <ShowIf has={filled(m.sketchLabel, m.sketchNote)}>
          <div className="flex items-center justify-between gap-2">
            <span className="t-caption font-mono font-bold text-ink/60 uppercase tracking-widest">
              <EditableText value={m.sketchLabel} onSave={set('sketchLabel')} />
            </span>
            <span className="t-hand text-ink/70">
              <EditableText value={m.sketchNote} onSave={set('sketchNote')} />
            </span>
          </div>
        </ShowIf>
        <ShowIf has={filled(m.inspirations)}>
          <div className="mt-auto flex items-center justify-between gap-2 bg-white/60 border border-ink/15 rounded-md px-2.5 py-1.5">
            <span className="t-caption font-mono font-bold text-ink/70 shrink-0">INSPIRATIONS :</span>
            <span className="t-caption font-mono text-ink/70 truncate">
              <EditableText value={m.inspirations} onSave={set('inspirations')} />
            </span>
          </div>
        </ShowIf>
      </div>
    ),
  };
}
