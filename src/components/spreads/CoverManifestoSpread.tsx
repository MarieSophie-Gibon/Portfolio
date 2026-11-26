import { ArrowUpRight } from 'lucide-react';
import type { SpreadParts } from '@/components/sketchbook/SpreadBase';
import { EditableText } from '@/components/admin/EditableText';
import {
  BarcodeSticker,
  GrungeStamp,
  GrungeStaples,
  InkSplatter,
  LightningSticker,
  SpikyMascotSticker,
  WashiTape,
} from '@/components/sketchbook/DestroyDecorations';
import { projectNumber, stop, type SpreadCtx } from './spreadContext';

export function renderCoverManifesto(ctx: SpreadCtx): SpreadParts {
  const { cover, articles } = ctx.content;
  const set = (k: keyof typeof cover) => (v: string) => ctx.edit((c) => void (c.cover[k] = v));

  return {
    left: (
      <div className="relative h-full flex flex-col justify-between">
        <div
          className="relative bg-white text-ink p-4 border border-ink/10 shadow-[0_12px_26px_-14px_rgba(20,60,80,0.45)] flex-1 flex flex-col justify-between overflow-hidden torn-paper-card"
          style={{ transform: 'rotate(-0.8deg)' }}
        >
          <WashiTape variant="hazard" className="absolute top-3 -right-7 w-32 h-4" rotate={28} />
          <WashiTape variant="duct" className="absolute -top-1 left-4 w-16 h-4" rotate={-4} />
          <InkSplatter color="#FF1E7A" opacity={0.28} className="absolute -bottom-6 -right-4 w-28 h-28" />
          <div className="relative z-10">
            <span className="t-caption inline-block font-mono font-bold px-2 py-0.5 bg-magenta text-white">
              <EditableText value={cover.badge} onSave={set('badge')} />
            </span>
          </div>
          <div className="my-auto py-2 relative z-10">
            <h2 className="t-display font-syne font-extrabold text-ink [text-shadow:3px_3px_0_#F9C6D3]">
              <EditableText value={cover.title} onSave={set('title')} multiline />
            </h2>
            <p className="t-hand text-magenta -rotate-2 mt-2">
              <EditableText value={cover.signature} onSave={set('signature')} />
            </p>
            <GrungeStamp text={<EditableText value={cover.stamp} onSave={set('stamp')} />} color="#00E5FF" rotate={-5} className="mt-2" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-dashed border-ink/15 relative z-10">
            <BarcodeSticker code={cover.barcode} />
            <LightningSticker color="#B8FF00" className="w-8 h-10 rotate-12" />
          </div>
        </div>
      </div>
    ),
    right: (
      <div className="relative h-full flex flex-col justify-between gap-2">
        <div
          className="relative bg-[#FAF8F2] border-2 border-ink p-3 shadow-[5px_5px_0_#13141A] torn-paper-card"
          style={{ transform: 'rotate(-1.1deg)' }}
        >
          <GrungeStaples className="absolute -top-1.5 right-3" rotate={8} />
          <span className="t-caption font-mono font-bold text-magenta uppercase tracking-widest">
            <EditableText value={cover.manifestoKicker} onSave={set('manifestoKicker')} />
          </span>
          <h3 className="t-body font-syne font-extrabold text-ink mt-1">
            <EditableText value={cover.manifestoTitle} onSave={set('manifestoTitle')} multiline />
          </h3>
          <p className="t-body font-sans text-zinc-700 mt-1.5">
            <EditableText value={cover.manifestoText} onSave={set('manifestoText')} multiline />
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 my-auto">
          {articles.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={(e) => {
                stop(e);
                ctx.goToArticle(a.id);
              }}
              className="text-left p-2 bg-white text-ink border border-ink/15 rounded-md shadow-[0_3px_8px_-4px_rgba(20,60,80,0.35)] hover:bg-blush transition-colors flex items-center justify-between gap-1"
            >
              <span className="t-caption font-syne font-bold truncate">
                {projectNumber(ctx.content, a.id)} · {a.title}
              </span>
              <ArrowUpRight className="w-3 h-3 shrink-0" />
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="t-hand text-ink -rotate-2">
            <EditableText value={cover.turnHint} onSave={set('turnHint')} />
          </span>
          <SpikyMascotSticker className="w-11 h-11 rotate-6" />
        </div>
      </div>
    ),
  };
}
