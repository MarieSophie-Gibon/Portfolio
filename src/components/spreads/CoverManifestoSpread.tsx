import { ArrowUpRight } from 'lucide-react';
import type { SpreadParts } from '@/components/sketchbook/SpreadBase';
import { EditableText } from '@/components/admin/EditableText';
import { ShowIf, filled } from '@/components/admin/ShowIf';
import { projectNumber, stop, type SpreadCtx } from './spreadContext';

export function renderCoverManifesto(ctx: SpreadCtx): SpreadParts {
  const { cover, articles } = ctx.content;
  const set = (k: keyof typeof cover) => (v: string) => ctx.edit((c) => void (c.cover[k] = v));
  const listed = articles.filter((a) => filled(a.title));

  return {
    left: (
      <div className="relative h-full flex flex-col justify-between">
        <ShowIf has={filled(cover.badge, cover.title, cover.signature, cover.stamp)}>
          <div
            className="relative bg-white/70 text-ink p-4 border border-ink/10 shadow-[0_12px_26px_-14px_rgba(60,40,15,0.45)] flex-1 flex flex-col justify-between overflow-hidden"
            style={{ transform: 'rotate(-0.8deg)' }}
          >
            <div className="relative">
              <span className="t-caption inline-block font-mono font-bold text-ink/60 uppercase tracking-widest">
                <EditableText value={cover.badge} onSave={set('badge')} />
              </span>
            </div>
            <div className="my-auto py-2 relative">
              <h2 className="t-display t-fantasy text-ink">
                <EditableText value={cover.title} onSave={set('title')} multiline />
              </h2>
              <p className="t-hand text-ink/70 -rotate-2 mt-2">
                <EditableText value={cover.signature} onSave={set('signature')} />
              </p>
              <p className="t-caption t-fantasy mt-2 uppercase text-ink/55">
                <EditableText value={cover.stamp} onSave={set('stamp')} />
              </p>
            </div>
          </div>
        </ShowIf>
      </div>
    ),
    right: (
      <div className="relative h-full flex flex-col justify-between gap-2">
        <ShowIf has={filled(cover.manifestoKicker, cover.manifestoTitle, cover.manifestoText)}>
          <div className="relative bg-white/70 border border-ink/10 p-3 shadow-[0_10px_22px_-14px_rgba(60,40,15,0.45)]" style={{ transform: 'rotate(-1.1deg)' }}>
            <span className="t-caption font-mono font-bold text-ink/60 uppercase tracking-widest">
              <EditableText value={cover.manifestoKicker} onSave={set('manifestoKicker')} />
            </span>
            <h3 className="t-body t-fantasy text-ink mt-1">
              <EditableText value={cover.manifestoTitle} onSave={set('manifestoTitle')} multiline />
            </h3>
            <p className="t-body font-sans text-ink/75 mt-1.5">
              <EditableText value={cover.manifestoText} onSave={set('manifestoText')} multiline />
            </p>
          </div>
        </ShowIf>

        {listed.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5 my-auto">
            {listed.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={(e) => {
                  stop(e);
                  ctx.goToArticle(a.id);
                }}
                className="text-left p-2 bg-white/70 text-ink border border-ink/15 rounded-md shadow-[0_3px_8px_-4px_rgba(60,40,15,0.35)] hover:bg-white transition-colors flex items-center justify-between gap-1"
              >
                <span className="t-caption t-fantasy truncate">
                  {projectNumber(ctx.content, a.id)} · {a.title}
                </span>
                <ArrowUpRight className="w-3 h-3 shrink-0" />
              </button>
            ))}
          </div>
        )}

        <ShowIf has={filled(cover.turnHint)}>
          <span className="t-hand text-ink/70 -rotate-2 self-start">
            <EditableText value={cover.turnHint} onSave={set('turnHint')} />
          </span>
        </ShowIf>
      </div>
    ),
  };
}
