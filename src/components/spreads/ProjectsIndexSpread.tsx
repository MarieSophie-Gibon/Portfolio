import type { SpreadParts } from '@/components/sketchbook/SpreadBase';
import { EditableText, useCanEdit } from '@/components/admin/EditableText';
import { ShowIf, filled } from '@/components/admin/ShowIf';
import type { ProjectArticle } from '@/types/portfolio';
import { Heading, INK, INK_MUTE, INK_SOFT } from './ProfileExperienceSpread';
import { MediaView } from './ScrapbookCollage';
import { projectNumber, stop, type SpreadCtx } from './spreadContext';

/** Carte de projet (vignette + titre) qui ouvre sa double-page. */
function ProjectCard({ ctx, article, i }: { ctx: SpreadCtx; article: ProjectArticle; i: number }) {
  const media = article.coverImage.src ? article.coverImage : article.gallery[0];
  return (
    <button
      type="button"
      onClick={(e) => {
        stop(e);
        ctx.goToArticle(article.id);
      }}
      className="group block w-full text-left"
      style={{ transform: `rotate(${i % 2 ? 1 : -1}deg)` }}
    >
      <div className="bg-[#FBF7EE] p-1.5 pb-2 shadow-[0_10px_18px_-10px_rgba(40,20,5,0.6)] transition-transform group-hover:-translate-y-1">
        <div className="aspect-[4/3] w-full overflow-hidden bg-[#EDE3CC]">
          {media?.src ? (
            <MediaView asset={media} className="h-full w-full object-cover" />
          ) : (
            <div className={`t-caption flex h-full w-full items-center justify-center border border-dashed border-[#8E6A3E]/35 font-mono ${INK_MUTE}`}>IMAGE</div>
          )}
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5 px-0.5">
          <span className={`t-caption font-mono ${INK_MUTE}`}>{projectNumber(ctx.content, article.id)}</span>
          <span className={`t-body t-fantasy min-w-0 flex-1 truncate ${INK}`}>{article.title || 'Sans titre'}</span>
          {article.year && <span className={`t-caption font-mono ${INK_MUTE}`}>{article.year}</span>}
        </div>
        {article.shortTag && <p className={`t-caption truncate px-0.5 ${INK_SOFT}`}>{article.shortTag}</p>}
      </div>
    </button>
  );
}

function Cards({ ctx, list, offset }: { ctx: SpreadCtx; list: ProjectArticle[]; offset: number }) {
  if (!list.length) return null;
  return (
    <div className="grid grid-cols-2 gap-4">
      {list.map((a, k) => (
        <ProjectCard key={a.id} ctx={ctx} article={a} i={offset + k} />
      ))}
    </div>
  );
}

/** Projets visibles : avec un titre (visiteur) ou tous (édition). */
function useListed(ctx: SpreadCtx) {
  const canEdit = useCanEdit();
  return ctx.content.articles.filter((a) => canEdit || filled(a.title));
}

function LeftPage({ ctx }: { ctx: SpreadCtx }) {
  const listed = useListed(ctx);
  const intro = ctx.content.projectsPage.intro;
  return (
    <div className="relative flex h-full flex-col gap-4">
      <Heading big>Projets</Heading>
      <ShowIf has={intro}>
        <p className={`t-body ${INK_SOFT}`}>
          <EditableText value={intro} onSave={(v) => ctx.edit((c) => void (c.projectsPage.intro = v))} multiline placeholder="Une phrase pour présenter tes projets…" />
        </p>
      </ShowIf>
      {/* Au-delà de 4 projets, les suivants se rangent ici, sous l'intro. */}
      <Cards ctx={ctx} list={listed.slice(4, 6)} offset={4} />
    </div>
  );
}

function RightPage({ ctx }: { ctx: SpreadCtx }) {
  const listed = useListed(ctx);
  return (
    <div className="relative flex h-full flex-col justify-center pt-2">
      <Cards ctx={ctx} list={listed.slice(0, 4)} offset={0} />
      {listed.length > 6 && <p className={`t-hand mt-3 text-right ${INK_MUTE}`}>… et {listed.length - 6} autres dans le sommaire</p>}
    </div>
  );
}

export function renderProjectsIndex(ctx: SpreadCtx): SpreadParts {
  return { left: <LeftPage ctx={ctx} />, right: <RightPage ctx={ctx} /> };
}
