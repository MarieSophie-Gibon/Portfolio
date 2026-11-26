import type { SpreadParts } from '@/components/sketchbook/SpreadBase';
import { EditableText } from '@/components/admin/EditableText';
import { WashiTape } from '@/components/sketchbook/DestroyDecorations';
import { CharcoalPortraitSketchSVG } from '@/components/sketchbook/Illustrations';
import type { SpreadCtx } from './spreadContext';

export function renderMoodboard(ctx: SpreadCtx): SpreadParts {
  const m = ctx.content.moodboard;
  const set = (k: keyof typeof m) => (v: string) => ctx.edit((c) => void (c.moodboard[k] = v));

  return {
    left: (
      <div className="relative h-full flex flex-col justify-between gap-2">
        <div className="relative flex-1 bg-white p-2 pb-3 rounded-[3px] shadow-[0_12px_24px_-12px_rgba(20,60,80,0.45)] flex flex-col overflow-hidden" style={{ transform: 'rotate(-1deg)' }}>
          <WashiTape variant="pink" className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-16 h-3.5 z-20" rotate={2} />
          <div className="flex-1 bg-[#E53E2E] rounded-sm p-2.5 relative overflow-hidden flex flex-col justify-between">
            <div className="t-caption flex justify-between gap-2 font-mono text-white/90">
              <EditableText value={m.studyLabel} onSave={set('studyLabel')} />
              <EditableText value={m.studyTag} onSave={set('studyTag')} />
            </div>
            <svg viewBox="0 0 180 90" className="w-full h-32 my-auto" aria-hidden="true">
              <rect x="24" y="14" width="60" height="62" rx="4" fill="#F4F2EA" stroke="#13141A" strokeWidth="2.5" />
              <path d="M36 30 H72 M36 42 H66 M36 54 H58" stroke="#E53E2E" strokeWidth="3" strokeLinecap="round" />
              <circle cx="132" cy="48" r="24" fill="#00E5FF" stroke="#13141A" strokeWidth="2.5" />
              <path d="M118 48 L130 60 L148 36" fill="none" stroke="#13141A" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M12 76 Q90 62 168 78" fill="none" stroke="#B8FF00" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <span className="t-hand text-[#F4F2EA]">
              <EditableText value={m.studyCaption} onSave={set('studyCaption')} />
            </span>
          </div>
        </div>
        <p className="t-hand text-rose-700">
          <EditableText value={m.quote} onSave={set('quote')} multiline />
        </p>
      </div>
    ),
    right: (
      <div className="relative h-full flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="t-caption font-mono font-bold bg-sky text-ink px-2 py-0.5 rounded-[2px]">
            <EditableText value={m.sketchLabel} onSave={set('sketchLabel')} />
          </span>
          <span className="t-hand text-magenta">
            <EditableText value={m.sketchNote} onSave={set('sketchNote')} />
          </span>
        </div>
        <div className="flex-1 my-1 relative">
          <CharcoalPortraitSketchSVG />
        </div>
        <div className="flex items-center justify-between gap-2 bg-white/80 border border-ink/20 rounded-md px-2.5 py-1.5">
          <span className="t-caption font-mono font-bold text-ink shrink-0">INSPIRATIONS :</span>
          <span className="t-caption font-mono text-slate-600 truncate">
            <EditableText value={m.inspirations} onSave={set('inspirations')} />
          </span>
        </div>
      </div>
    ),
  };
}
