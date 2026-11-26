import { Check, Copy, Layers } from 'lucide-react';
import type { SpreadParts } from '@/components/sketchbook/SpreadBase';
import { EditableText } from '@/components/admin/EditableText';
import { EditableImage } from '@/components/admin/EditableImage';
import { MetallicPaperclip, SpikyMascotSticker, WashiTape } from '@/components/sketchbook/DestroyDecorations';
import { ProjectVisual } from '@/components/sketchbook/Illustrations';
import { SocialGlyph } from '@/components/sketchbook/BrandIcons';
import type { ContactSpread as ContactSpreadType } from '@/types/portfolio';
import { editArticle, findArticle, projectNumber, stop, type SpreadCtx } from './spreadContext';

export function renderContact(ctx: SpreadCtx, spread: ContactSpreadType): SpreadParts {
  const { author, contact } = ctx.content;
  const featured = findArticle(ctx.content, spread.featuredArticleId);
  const setAuthor = (k: 'name' | 'role' | 'email' | 'availability') => (v: string) => ctx.edit((c) => void (c.author[k] = v));
  const setContact = (k: 'kicker' | 'thanks') => (v: string) => ctx.edit((c) => void (c.contact[k] = v));

  const left = featured ? (
    <div className="relative h-full flex flex-col justify-between gap-1.5">
      <div className="flex items-start justify-between">
        <div>
          <span
            className="t-caption inline-block px-2 py-0.5 rounded-[3px] text-white font-mono font-bold tracking-widest"
            style={{ backgroundColor: featured.accent }}
          >
            PROJET {projectNumber(ctx.content, featured.id)} · {featured.year}
          </span>
          <h2 className="t-title font-syne font-extrabold text-ink mt-1">
            <EditableText value={featured.title} onSave={(v) => editArticle(ctx, featured.id, (a) => void (a.title = v))} />
          </h2>
        </div>
        <SpikyMascotSticker className="w-10 h-10 rotate-6 shrink-0" />
      </div>

      <div
        onClick={(e) => {
          stop(e);
          ctx.openProject(featured.id);
        }}
        className="relative bg-white p-1.5 pb-2.5 rounded-[4px] border-2 border-ink shadow-[4px_4px_0_#13141A] cursor-pointer hover:scale-[1.02] transition-transform"
        style={{ transform: 'rotate(-1.2deg)' }}
      >
        <WashiTape variant="checker" className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-3 z-20" rotate={2} />
        <EditableImage value={featured.coverImage} onSave={(img) => editArticle(ctx, featured.id, (a) => void (a.coverImage = img))}>
          <ProjectVisual article={featured} />
        </EditableImage>
      </div>

      <button
        type="button"
        onClick={(e) => {
          stop(e);
          ctx.openProject(featured.id);
        }}
        className="t-caption w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-ink text-white font-syne font-extrabold shadow-[2px_2px_0_#13141A] hover:brightness-110 transition-all"
        style={{ backgroundColor: featured.accentSecondary }}
      >
        <Layers className="w-3 h-3" /> Voir la fiche projet →
      </button>
    </div>
  ) : (
    <div className="relative h-full flex flex-col justify-center gap-3">
      <h2 className="t-title font-syne font-extrabold text-ink">
        ON BOSSE
        <br />
        ENSEMBLE ?
      </h2>
      <SpikyMascotSticker className="w-16 h-16 rotate-6" />
    </div>
  );

  const right = (
    <div className="relative h-full flex flex-col justify-between gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="t-caption px-2 py-0.5 rounded-[3px] bg-magenta text-white font-mono font-bold tracking-widest">
          <EditableText value={contact.kicker} onSave={setContact('kicker')} />
        </span>
        <span className="t-caption px-2 py-0.5 rounded-full border border-emerald-600 bg-emerald-100 text-emerald-800 font-mono font-bold">
          ● <EditableText value={author.availability} onSave={setAuthor('availability')} />
        </span>
      </div>

      <div className="relative bg-white text-ink rounded-xl p-3.5 border border-ink/10 shadow-[5px_5px_0_#F9C6D3] my-auto" style={{ transform: 'rotate(-1.2deg)' }}>
        <MetallicPaperclip className="absolute -top-5 right-4 w-5 h-10 z-20" rotate={12} />
        <div className="t-body font-syne font-extrabold">
          <EditableText value={author.name} onSave={setAuthor('name')} />
        </div>
        <div className="t-caption font-sans text-zinc-500 mb-2.5">
          <EditableText value={author.role} onSave={setAuthor('role')} />
        </div>

        <div className="flex items-center justify-between gap-1.5 bg-[#F3EFE6] rounded-lg px-2 py-1.5 mb-2.5">
          <span className="t-caption font-mono text-ink truncate">
            <EditableText value={author.email} onSave={setAuthor('email')} />
          </span>
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              ctx.copyEmail();
            }}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded t-caption font-mono font-bold shrink-0 transition-colors ${
              ctx.copied ? 'bg-lime text-ink' : 'bg-cyan hover:bg-white text-ink'
            }`}
          >
            {ctx.copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {ctx.copied ? 'COPIÉ ✓' : 'COPIER'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {author.socials.map((s, i) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              onClick={stop}
              className="t-caption inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#F3EFE6] hover:bg-blush font-mono text-ink transition-colors"
            >
              <SocialGlyph icon={s.icon} className={`w-3 h-3 ${i % 2 ? 'text-magenta' : 'text-cyan'}`} /> {s.label}
            </a>
          ))}
        </div>
      </div>

      <p className="t-hand text-slate-700 text-center">
        <EditableText value={contact.thanks} onSave={setContact('thanks')} />
      </p>
    </div>
  );

  return { left, right };
}
