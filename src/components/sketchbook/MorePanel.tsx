import { useEffect, useState, type ReactNode } from 'react';
import { ArrowUpRight, ExternalLink, ImagePlus, Maximize2, Play, X } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { EditableList, EditableText, ItemTools, useCanEdit } from '@/components/admin/EditableText';
import { EditableImage, ImagePickerDialog } from '@/components/admin/EditableImage';
import { MediaView } from '@/components/spreads/ScrapbookCollage';
import { getMoreInfo } from '@/lib/moreInfo';
import type { ImageAsset, MoreInfo, ProjectArticle, Spread } from '@/types/portfolio';
import { GithubIcon } from './BrandIcons';
import { ArtworkPresetSVG } from './Illustrations';
import { MediaLightbox } from './MediaLightbox';

const SLIDE_MS = 480;

/** Feuille à afficher : celle d'une double-page, ou la fiche d'un projet précis. */
export interface MoreTarget {
  spreadId: string;
  articleId?: string;
}

/* ------------------------------------------------------------------ */
/* Briques de mise en page (tailles calées sur les lignes de 22px)      */
/* ------------------------------------------------------------------ */

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="t-caption mt-5 font-mono font-bold uppercase tracking-[0.25em] text-gold">{children}</h3>;
}

const bodyCls = 't-body font-sans text-ink/85';

/** Vignette qui ouvre le carrousel plein écran (clic en visite, bouton ⤢ en édition). */
function Zoomable({ asset, canEdit, onOpen, children }: { asset: ImageAsset; canEdit: boolean; onOpen?: () => void; children: ReactNode }) {
  if (!onOpen || !asset.src) return <>{children}</>;
  return (
    <div className="group/zoom relative">
      {children}
      {!canEdit && (
        <button type="button" onClick={onOpen} aria-label="Voir en plein écran" className="absolute inset-0 cursor-zoom-in" />
      )}
      {asset.type === 'video' && (
        <span className="pointer-events-none absolute inset-0 m-auto flex h-9 w-9 items-center justify-center rounded-full bg-ink/60 text-white">
          <Play className="h-4 w-4 fill-white" />
        </span>
      )}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        aria-label="Voir en plein écran"
        className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow transition-opacity group-hover/zoom:opacity-100 focus-visible:opacity-100"
      >
        <Maximize2 className="h-3 w-3" />
      </button>
    </div>
  );
}

function Polaroids({
  items,
  canEdit,
  onChange,
  onRemove,
  onAdd,
  onOpen,
  lead,
}: {
  items: ImageAsset[];
  canEdit: boolean;
  onChange: (i: number, next: ImageAsset) => void;
  onRemove: (i: number) => void;
  onAdd: () => void;
  /** Ouvre le carrousel sur la i-ème image de `items`. */
  onOpen: (i: number) => void;
  /** Visuel placé en premier (ex. image principale du projet). */
  lead?: ReactNode;
}) {
  if (!items.length && !lead && !canEdit) return null;
  return (
    <div className="mt-2 grid grid-cols-3 gap-3">
      {lead}
      {items.map((img, i) => (
        <figure
          key={`${i}-${img.src.slice(-20)}`}
          className="bg-white p-1.5 pb-0.5 shadow-[0_8px_16px_-8px_rgba(20,60,80,0.5)]"
          style={{ transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)` }}
        >
          <Zoomable asset={img} canEdit={canEdit} onOpen={() => onOpen(i)}>
            <EditableImage value={img} allowRemove={false} allowVideo onSave={(next) => onChange(i, next)}>
              <MediaView asset={img} className="aspect-[4/3] w-full object-cover" />
            </EditableImage>
          </Zoomable>
          <figcaption className="t-hand flex items-center justify-center gap-1 truncate py-0.5 text-center text-slate-600">
            <EditableText value={img.caption ?? ''} placeholder="légende…" onSave={(v) => onChange(i, { ...img, caption: v })} />
            <ItemTools onRemove={() => onRemove(i)} />
          </figcaption>
        </figure>
      ))}
      {canEdit && (
        <button
          type="button"
          onClick={onAdd}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded border-2 border-dashed border-slate-300 text-slate-400 hover:border-[#B8893A] hover:text-[#8E2F2A]"
        >
          <ImagePlus className="h-4 w-4" />
          <span className="t-caption font-mono">photo / vidéo</span>
        </button>
      )}
    </div>
  );
}

function Chips({ items, onSave }: { items: string[]; onSave: (items: string[]) => void }) {
  return (
    <EditableList items={items} onSave={onSave}>
      <div className="flex flex-wrap gap-1.5 py-0.5">
        {items.map((t) => (
          <span key={t} className="t-caption rounded-full border border-ink/15 bg-white px-2.5 py-0.5 font-mono font-bold text-ink/80">
            {t}
          </span>
        ))}
      </div>
    </EditableList>
  );
}

/* ------------------------------------------------------------------ */
/* Fiche projet                                                        */
/* ------------------------------------------------------------------ */

/** Médias visibles dans le carrousel d'un projet : image principale (si fournie) + galerie. */
export function projectMedia(article: ProjectArticle): ImageAsset[] {
  return [...(article.coverImage.src ? [article.coverImage] : []), ...article.gallery];
}

/** Feuille paysage : deux colonnes séparées par une marge rose (une seule sur petit écran). */
function TwoColumns({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-2">
      <div className="min-w-0">{left}</div>
      <div className="min-w-0 lg:border-l lg:border-rose-300/60 lg:pl-10 lg:pt-1">{right}</div>
    </div>
  );
}

function ProjectSheet({ article, onAddMedia, onOpen }: { article: ProjectArticle; onAddMedia: () => void; onOpen: (i: number) => void }) {
  const { edit } = useAdmin();
  const canEdit = useCanEdit();
  const editA = (fn: (a: ProjectArticle) => void) =>
    edit((c) => {
      const a = c.articles.find((x) => x.id === article.id);
      if (a) fn(a);
    });
  type K = 'title' | 'subtitle' | 'year' | 'client' | 'role' | 'summary' | 'challenge' | 'solution' | 'impact' | 'liveUrl' | 'repoUrl';
  const set = (k: K) => (v: string) => editA((a) => void (a[k] = v));
  const hasLink = (u: string) => Boolean(u) && u !== '#';

  const lead = (
    <figure className="bg-white p-1.5 pb-0.5 shadow-[0_8px_16px_-8px_rgba(20,60,80,0.5)]" style={{ transform: 'rotate(-1deg)' }}>
      <Zoomable asset={article.coverImage} canEdit={canEdit} onOpen={() => onOpen(0)}>
        <EditableImage value={article.coverImage} allowVideo onSave={(img) => editA((a) => void (a.coverImage = img))}>
          {article.coverImage.src ? (
            <MediaView asset={article.coverImage} className="aspect-[4/3] w-full object-cover" />
          ) : article.artwork ? (
            <div className="flex aspect-[4/3] w-full items-center overflow-hidden bg-zinc-100">
              <ArtworkPresetSVG preset={article.artwork} />
            </div>
          ) : (
            <div className="halftone-dots aspect-[4/3] w-full" style={{ backgroundColor: article.accent }} />
          )}
        </EditableImage>
      </Zoomable>
      <figcaption className="t-hand py-0.5 text-center text-slate-600">{article.shortTag}</figcaption>
    </figure>
  );

  const coverOffset = article.coverImage.src ? 1 : 0;

  const left = (
    <>
      <h2 className="t-title mt-4 text-ink">
        <EditableText value={article.title} onSave={set('title')} />
      </h2>
      <p className="t-caption font-sans font-medium text-ink/60">
        <EditableText value={article.subtitle} onSave={set('subtitle')} />
      </p>

      {/* Infos clés */}
      <dl className="t-body mt-2 grid grid-cols-3 gap-2 font-sans">
        {(
          [
            ['Année', 'year'],
            ['Client', 'client'],
            ['Rôle', 'role'],
          ] as const
        ).map(([label, k]) => (
          <div key={k} className="min-w-0">
            <dt className="t-caption font-mono uppercase tracking-[0.2em] text-slate-400">{label}</dt>
            <dd className="truncate font-semibold text-ink">
              <EditableText value={article[k]} onSave={set(k)} />
            </dd>
          </div>
        ))}
      </dl>

      <SectionTitle>Photos & vidéos</SectionTitle>
      <Polaroids
        items={article.gallery}
        canEdit={canEdit}
        lead={lead}
        onChange={(i, next) => editA((a) => void (a.gallery[i] = next))}
        onRemove={(i) => editA((a) => void a.gallery.splice(i, 1))}
        onAdd={onAddMedia}
        onOpen={(i) => onOpen(i + coverOffset)}
      />
    </>
  );

  const right = (
    <>
      <SectionTitle>Description</SectionTitle>
      <div className={bodyCls}>
        <EditableText value={article.summary} onSave={set('summary')} multiline />
      </div>

      {(article.challenge || canEdit) && (
        <>
          <SectionTitle>Le défi</SectionTitle>
          <div className={bodyCls}>
            <EditableText value={article.challenge} onSave={set('challenge')} multiline placeholder="Le problème à résoudre…" />
          </div>
        </>
      )}
      {(article.solution || canEdit) && (
        <>
          <SectionTitle>La solution</SectionTitle>
          <div className={bodyCls}>
            <EditableText value={article.solution} onSave={set('solution')} multiline placeholder="Comment tu l'as résolu…" />
          </div>
        </>
      )}

      <SectionTitle>Outils & technos</SectionTitle>
      <Chips items={article.tech} onSave={(items) => editA((a) => void (a.tech = items))} />

      {(article.deliverables.length > 0 || canEdit) && (
        <>
          <SectionTitle>Livrables</SectionTitle>
          <EditableList items={article.deliverables} onSave={(items) => editA((a) => void (a.deliverables = items))}>
            <ul className={`${bodyCls} list-none`}>
              {article.deliverables.map((d) => (
                <li key={d}>
                  <span className="mr-1.5 text-[#8E2F2A]">✦</span>
                  {d}
                </li>
              ))}
            </ul>
          </EditableList>
        </>
      )}

      {(article.stats.length > 0 || article.impact) && (
        <>
          <SectionTitle>En chiffres</SectionTitle>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {article.stats.map((st, i) => (
              <div key={i} className="rounded-md border border-ink/10 bg-white px-2 py-1 text-center">
                <div className="t-body t-fantasy font-extrabold text-ink">
                  <EditableText value={st.value} onSave={(v) => editA((a) => void (a.stats[i].value = v))} />
                </div>
                <div className="t-caption font-mono uppercase tracking-wider text-slate-500">
                  <EditableText value={st.label} onSave={(v) => editA((a) => void (a.stats[i].label = v))} />
                </div>
              </div>
            ))}
          </div>
          {(article.impact || canEdit) && (
            <p className="t-hand mt-2 text-ink/80">
              <EditableText value={article.impact} onSave={set('impact')} placeholder="Résultat marquant…" />
            </p>
          )}
        </>
      )}

      <SectionTitle>Liens</SectionTitle>
      <div className="flex flex-wrap gap-2 pt-1">
        {hasLink(article.repoUrl) && (
          <a
            href={article.repoUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => canEdit && e.preventDefault()}
            className="t-caption inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 font-mono font-bold text-white hover:bg-[#8E2F2A]"
          >
            <GithubIcon className="h-3.5 w-3.5" /> GitHub
          </a>
        )}
        {hasLink(article.liveUrl) && (
          <a
            href={article.liveUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => canEdit && e.preventDefault()}
            className="t-caption inline-flex items-center gap-1.5 rounded-full bg-butter px-3 py-1 font-mono font-bold text-ink hover:bg-blush"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Voir en ligne
          </a>
        )}
        {!hasLink(article.repoUrl) && !hasLink(article.liveUrl) && !canEdit && <span className={`${bodyCls} text-slate-400`}>—</span>}
      </div>
      {canEdit && (
        <div className="t-caption mt-2 space-y-0.5 font-mono text-slate-500">
          <div>
            GitHub : <EditableText value={article.repoUrl} placeholder="https://github.com/…" onSave={set('repoUrl')} className="break-all text-ink" />
          </div>
          <div>
            En ligne : <EditableText value={article.liveUrl} placeholder="https://…" onSave={set('liveUrl')} className="break-all text-ink" />
          </div>
        </div>
      )}
    </>
  );

  return <TwoColumns left={left} right={right} />;
}

/* ------------------------------------------------------------------ */
/* Feuille générique (autres pages)                                    */
/* ------------------------------------------------------------------ */

function GenericSheet({ spread, info, onAddMedia, onOpen }: { spread: Spread; info: MoreInfo; onAddMedia: () => void; onOpen: (i: number) => void }) {
  const { edit } = useAdmin();
  const canEdit = useCanEdit();
  const editMore = (fn: (m: MoreInfo) => void) =>
    edit((c) => {
      const s = c.spreads.find((x) => x.id === spread.id);
      if (!s) return;
      s.more ??= structuredClone(getMoreInfo(s, c));
      fn(s.more);
    });
  const tools = info.tools ?? [];
  const isEmpty = !info.body && !info.images.length && !info.links.length && !tools.length;

  const left = (
    <>
      <h2 className="t-title mt-4 text-ink">
        <EditableText value={info.title} onSave={(v) => editMore((m) => void (m.title = v))} />
      </h2>
      <div className={`mt-1 ${bodyCls}`}>
        {isEmpty && !canEdit ? (
          <p className="t-hand text-slate-400">Bientôt plus d'infos ici ✎</p>
        ) : (
          <EditableText value={info.body} placeholder="Écris ici les informations supplémentaires…" multiline onSave={(v) => editMore((m) => void (m.body = v))} />
        )}
      </div>
    </>
  );

  const right = (
    <>
      {(info.images.length > 0 || canEdit) && (
        <>
          <SectionTitle>Images</SectionTitle>
          <Polaroids
            items={info.images}
            canEdit={canEdit}
            onChange={(i, next) => editMore((m) => void (m.images[i] = next))}
            onRemove={(i) => editMore((m) => void m.images.splice(i, 1))}
            onAdd={onAddMedia}
            onOpen={onOpen}
          />
        </>
      )}

      {(tools.length > 0 || canEdit) && (
        <>
          <SectionTitle>Outils</SectionTitle>
          <Chips items={tools} onSave={(items) => editMore((m) => void (m.tools = items))} />
        </>
      )}

      {(info.links.length > 0 || canEdit) && (
        <>
          <SectionTitle>Liens</SectionTitle>
          <EditableList
            items={info.links.map((l) => `${l.label} | ${l.url}`)}
            onSave={(items) =>
              editMore(
                (m) =>
                  void (m.links = items.map((line) => {
                    const [label, url] = line.split('|').map((s) => s.trim());
                    return { label, url: url || label };
                  })),
              )
            }
          >
            <ul className={bodyCls}>
              {info.links.map((l) => (
                <li key={l.url + l.label}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => canEdit && e.preventDefault()}
                    className="inline-flex items-center gap-1 underline decoration-blush decoration-2 underline-offset-2 hover:text-[#8E2F2A]"
                  >
                    {l.label} <ArrowUpRight className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </EditableList>
          {canEdit && <p className="t-caption font-mono text-slate-400">Une ligne par lien : « Libellé | https://… »</p>}
        </>
      )}
    </>
  );

  return <TwoColumns left={left} right={right} />;
}

/* ------------------------------------------------------------------ */
/* Feuille volante                                                     */
/* ------------------------------------------------------------------ */

interface Props {
  target: MoreTarget | null;
  onClose: () => void;
}

/** Feuille de cahier qui glisse depuis la droite (garde l'élément monté pendant la sortie). */
export function MorePanel({ target, onClose }: Props) {
  const { content, edit } = useAdmin();
  const [shown, setShown] = useState<MoreTarget | null>(target);
  const [visible, setVisible] = useState(false);
  const [addingMedia, setAddingMedia] = useState(false);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);

  useEffect(() => {
    if (target) {
      setShown(target);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    setZoomIndex(null);
    const t = window.setTimeout(() => setShown(null), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [target]);

  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [target, onClose]);

  const spread = content.spreads.find((s) => s.id === shown?.spreadId);
  if (!shown || !spread) return null;

  const articleId = shown.articleId ?? (spread.kind === 'project' ? spread.articleId : undefined);
  const article = articleId ? content.articles.find((a) => a.id === articleId) : undefined;
  const info = getMoreInfo(spread, content);
  const title = article?.title ?? info.title;
  const media = (article ? projectMedia(article) : info.images).filter((m) => m.src);

  const addMedia = (img: ImageAsset) => {
    if (!img.src) return;
    if (article) {
      edit((c) => void c.articles.find((a) => a.id === article.id)?.gallery.push(img));
    } else {
      edit((c) => {
        const s = c.spreads.find((x) => x.id === spread.id);
        if (!s) return;
        s.more ??= structuredClone(getMoreInfo(s, c));
        s.more.images.push(img);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[45]" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
      <div
        className="absolute inset-0 bg-[#1f4f5e]/25 backdrop-blur-[2px] transition-opacity"
        style={{ opacity: visible ? 1 : 0, transitionDuration: `${SLIDE_MS}ms` }}
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="ui-scaled absolute inset-x-0 top-[4vh] bottom-[4vh] mx-auto"
        style={{
          // Format paysage (2 colonnes) ; la largeur suit l'échelle du texte.
          width: 'min(calc(1040px * var(--ui-scale)), 96vw)',
          transform: visible ? 'translateX(0) rotate(-0.4deg)' : 'translateX(calc(50vw + 100%)) rotate(5deg)',
          transition: `transform ${SLIDE_MS}ms cubic-bezier(0.22, 1.15, 0.36, 1)`,
        }}
      >
        <div
          className="absolute -top-3 left-1/2 z-20 h-6 w-32 -translate-x-1/2 -rotate-3 bg-butter/90 shadow-sm"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1.5px, transparent 1.6px)',
            backgroundSize: '8px 8px',
            clipPath: 'polygon(0 8%, 4% 0, 96% 4%, 100% 16%, 98% 88%, 95% 100%, 3% 96%, 0 82%)',
          }}
        />

        <div className="relative h-full overflow-y-auto rounded-r-xl rounded-l-[3px] ruled-paper text-ink shadow-[0_30px_60px_-20px_rgba(20,60,80,0.6),0_8px_18px_-8px_rgba(20,60,80,0.35)]">
          <div className="pointer-events-none absolute inset-y-0 left-14 w-px bg-rose-300/70" />
          <div className="pointer-events-none absolute inset-y-0 left-4 flex flex-col justify-around py-10">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="block h-4 w-4 rounded-full bg-desk shadow-[inset_0_2px_3px_rgba(0,0,0,0.25)]" />
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-blush text-ink shadow-[0_3px_8px_rgba(20,60,80,0.3)] ring-2 ring-white transition-transform hover:rotate-90"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="pl-20 pr-8 pt-6 pb-10">
            <div className="t-caption flex items-end gap-4 font-mono tracking-[0.2em] text-slate-400">
              <span className="flex items-end gap-1.5">
                NO.
                <span className="t-hand min-w-10 border-b border-slate-300 text-center tracking-normal text-gold">{spread.day}</span>
              </span>
              <span className="flex flex-1 items-end gap-1.5 pr-10">
                {article ? 'FICHE PROJET' : 'DATE'}
                <span className="flex-1 border-b border-slate-300 pb-0.5 tracking-[0.15em] text-slate-500">{spread.dateLabel}</span>
              </span>
            </div>

            {article ? (
              <ProjectSheet article={article} onAddMedia={() => setAddingMedia(true)} onOpen={setZoomIndex} />
            ) : (
              <GenericSheet spread={spread} info={info} onAddMedia={() => setAddingMedia(true)} onOpen={setZoomIndex} />
            )}
          </div>
        </div>
      </aside>

      <MediaLightbox items={media} index={zoomIndex} onIndex={setZoomIndex} onClose={() => setZoomIndex(null)} />

      {addingMedia && (
        <ImagePickerDialog value={{ src: '', alt: '' }} allowRemove={false} allowVideo onClose={() => setAddingMedia(false)} onSave={addMedia} />
      )}
    </div>
  );
}
