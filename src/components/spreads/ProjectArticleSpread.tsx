import type { SpreadParts } from '@/components/sketchbook/SpreadBase';
import { EditableText } from '@/components/admin/EditableText';
import { LightningSticker } from '@/components/sketchbook/DestroyDecorations';
import type { ProjectArticle } from '@/types/portfolio';
import { ScrapbookCollage } from './ScrapbookCollage';
import { editArticle, projectNumber, type SpreadCtx } from './spreadContext';

type TextKey = 'title' | 'subtitle' | 'year' | 'client' | 'summary' | 'doodleNote';

/**
 * Double-page projet :
 * - gauche : collage scrapbook de photos / vidéos ;
 * - droite : description très brève (le détail est dans la fiche « En savoir plus »).
 */
export function renderProjectArticle(ctx: SpreadCtx, article: ProjectArticle | undefined): SpreadParts {
  if (!article) {
    return { left: <p className="t-body font-mono text-zinc-500">Article introuvable.</p>, right: null };
  }

  const num = projectNumber(ctx.content, article.id);
  const tinted = article.layout === 'dark-punk-left';
  const edit = (fn: (a: ProjectArticle) => void) => editArticle(ctx, article.id, fn);
  const set = (k: TextKey) => (v: string) => edit((a) => void (a[k] = v));

  const left = (
    <div className="relative flex h-full flex-col gap-2">
      <div
        className={`relative min-h-0 flex-1 ${tinted ? 'rounded-md p-3 torn-paper-card' : 'pt-2'}`}
        style={tinted ? { backgroundColor: `color-mix(in srgb, ${article.accent} 16%, white)` } : undefined}
      >
        <ScrapbookCollage article={article} edit={edit} onOpen={() => ctx.openProject(article.id)} />
      </div>
      <p className="t-hand pl-1 font-bold text-ink/75 -rotate-1">
        ↳ <EditableText value={article.doodleNote} onSave={set('doodleNote')} />
      </p>
    </div>
  );

  const right = (
    <div className="relative flex h-full flex-col">
      <div className="flex items-start justify-between gap-2 pt-3">
        <span
          className="t-caption inline-block rounded-[3px] px-2 py-0.5 font-mono font-bold tracking-widest"
          style={{ backgroundColor: article.accent, color: '#13141A' }}
        >
          PROJET {num} · <EditableText value={article.year} onSave={set('year')} />
        </span>
        <LightningSticker color={article.accentSecondary} className="h-10 w-8 shrink-0 rotate-12" />
      </div>

      <h2
        className="t-title mt-2 font-syne font-extrabold text-ink"
        style={{ textShadow: `3px 3px 0 color-mix(in srgb, ${article.accent} 35%, transparent)` }}
      >
        <EditableText value={article.title} onSave={set('title')} />
      </h2>
      <p className="t-caption mt-2 font-sans font-medium text-ink/70">
        <EditableText value={article.subtitle} onSave={set('subtitle')} multiline />
      </p>

      <div className="my-4 h-px w-16 bg-ink/20" />

      <p className="t-body font-sans text-ink/85">
        <EditableText value={article.summary} onSave={set('summary')} multiline placeholder="Une ou deux phrases pour présenter le projet…" />
      </p>

      <div className="mt-4 flex flex-wrap gap-1">
        {article.tech.slice(0, 4).map((t) => (
          <span key={t} className="t-caption rounded-full border border-ink/15 bg-white px-2 py-0.5 font-mono font-bold text-ink/80">
            #{t}
          </span>
        ))}
      </div>

      <p className="t-caption mt-auto pb-1 text-right font-mono tracking-wide text-ink/50">
        <EditableText value={article.client} onSave={set('client')} />
      </p>
      <p className="t-hand pb-1 text-right text-gold">toutes les infos dans la fiche ↓</p>
    </div>
  );

  return { left, right };
}
