import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, ImagePlus, X } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { EditableList, EditableText, ItemTools, useCanEdit } from '@/components/admin/EditableText';
import { EditableImage, ImagePickerDialog } from '@/components/admin/EditableImage';
import type { ProjectArticle } from '@/types/portfolio';
import { GithubIcon } from './BrandIcons';
import { ProjectVisual } from './Illustrations';

interface Props {
  articleId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
}

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return Boolean(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable));
};

/** Lightbox étude de cas (verre dépoli sombre + préc./suiv.), éditable en mode admin. */
export function CaseStudyModal({ articleId, onClose, onSelect }: Props) {
  const { content, edit } = useAdmin();
  const canEdit = useCanEdit();
  const [addingImage, setAddingImage] = useState(false);
  const articles = content.articles;
  const idx = articles.findIndex((a) => a.id === articleId);
  const article = idx >= 0 ? articles[idx] : null;

  const go = (delta: number) => {
    if (idx < 0) return;
    onSelect(articles[(idx + delta + articles.length) % articles.length].id);
  };
  const goRef = useRef(go);
  goRef.current = go;

  useEffect(() => {
    if (!articleId) return;
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goRef.current(-1);
      if (e.key === 'ArrowRight') goRef.current(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [articleId, onClose]);

  if (!article) return null;

  const num = String(idx + 1).padStart(2, '0');
  const hasLink = (url: string) => Boolean(url) && url !== '#';
  const editA = (fn: (a: ProjectArticle) => void) =>
    edit((c) => {
      const a = c.articles.find((x) => x.id === article.id);
      if (a) fn(a);
    });
  const set = (k: 'title' | 'subtitle' | 'year' | 'client' | 'role' | 'impact' | 'challenge' | 'solution' | 'liveUrl' | 'repoUrl') => (v: string) =>
    editA((a) => void (a[k] = v));

  return (
    <div
      onClick={onClose}
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 bg-[#121624]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Étude de cas ${article.title}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#171A24]/95 backdrop-blur-xl text-zinc-100 rounded-3xl border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.75)] p-5 sm:p-7"
      >
        <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold text-ink shrink-0" style={{ backgroundColor: article.accent }}>
              PROJET {num}
            </span>
            <span className="font-mono text-[11px] text-zinc-400 truncate">
              <EditableText value={article.year} onSave={set('year')} /> · <EditableText value={article.client} onSave={set('client')} />
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 shrink-0 rounded-full bg-white/10 hover:bg-magenta text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h2 className="font-syne text-2xl sm:text-3xl font-extrabold text-white leading-tight">
          <EditableText value={article.title} onSave={set('title')} />
        </h2>
        <p className="font-sans text-xs sm:text-sm text-zinc-400 mt-0.5 mb-4">
          <EditableText value={article.subtitle} onSave={set('subtitle')} multiline />
        </p>

        <EditableImage
          value={article.coverImage}
          onSave={(img) => editA((a) => void (a.coverImage = img))}
          className="bg-black/40 p-2 rounded-2xl border border-white/10 mb-5 overflow-hidden"
        >
          <ProjectVisual article={article} />
        </EditableImage>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
          <div className="bg-white/[0.04] rounded-xl p-3.5 border border-white/10">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-magenta mb-1">01 // LE DÉFI</h3>
            <p className="font-sans text-xs text-zinc-300 leading-relaxed">
              <EditableText value={article.challenge} onSave={set('challenge')} multiline />
            </p>
          </div>
          <div className="bg-white/[0.04] rounded-xl p-3.5 border border-white/10">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan mb-1">02 // LA SOLUTION</h3>
            <p className="font-sans text-xs text-zinc-300 leading-relaxed">
              <EditableText value={article.solution} onSave={set('solution')} multiline />
            </p>
          </div>
        </div>

        <div className="bg-white/[0.05] rounded-2xl p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3 border border-white/10">
          <div>
            <span className="font-mono text-[9px] text-zinc-400 uppercase block">RÔLE</span>
            <span className="font-sans text-xs font-semibold text-white">
              <EditableText value={article.role} onSave={set('role')} />
            </span>
            <span className="font-mono text-[9px] text-zinc-400 uppercase block mt-2">RÉSULTATS</span>
            <span className="font-sans text-xs font-bold text-lime">
              <EditableText value={article.impact} onSave={set('impact')} multiline />
            </span>
          </div>
          <div>
            <span className="font-mono text-[9px] text-zinc-400 uppercase block mb-1.5">LIVRABLES</span>
            <EditableList items={article.deliverables} onSave={(items) => editA((a) => void (a.deliverables = items))} className="text-xs">
              <div className="flex flex-wrap gap-1.5">
                {article.deliverables.map((d) => (
                  <span key={d} className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-zinc-100">
                    {d}
                  </span>
                ))}
              </div>
            </EditableList>
          </div>
        </div>

        {(article.gallery.length > 0 || canEdit) && (
          <div className="grid grid-cols-2 gap-2 mb-5">
            {article.gallery.map((img, i) => (
              <figure key={`${i}-${img.src.slice(-24)}`} className="relative rounded-xl overflow-hidden border border-white/10 bg-black/30">
                <EditableImage value={img} allowRemove={false} onSave={(next) => editA((a) => void (a.gallery[i] = next))}>
                  <img src={img.src} alt={img.alt} className="w-full aspect-video object-cover" />
                </EditableImage>
                <figcaption className="flex items-center justify-between px-2 py-1 font-mono text-[10px] text-zinc-400">
                  <EditableText value={img.caption ?? ''} placeholder="Légende…" onSave={(v) => editA((a) => void (a.gallery[i].caption = v))} />
                  <ItemTools onRemove={() => editA((a) => void a.gallery.splice(i, 1))} />
                </figcaption>
              </figure>
            ))}
            {canEdit && (
              <button
                type="button"
                onClick={() => setAddingImage(true)}
                className="flex aspect-video flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-white/20 text-zinc-400 hover:border-magenta hover:text-white transition-colors"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="font-mono text-[10px]">Ajouter à la galerie</span>
              </button>
            )}
          </div>
        )}

        {canEdit && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5 font-mono text-[10px] text-zinc-400">
            <div className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2">
              LIEN LIVE : <EditableText value={article.liveUrl} placeholder="https://…" onSave={set('liveUrl')} className="text-zinc-200 break-all" />
            </div>
            <div className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2">
              LIEN GITHUB : <EditableText value={article.repoUrl} placeholder="https://github.com/…" onSave={set('repoUrl')} className="text-zinc-200 break-all" />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => go(-1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 font-mono text-[10px] font-bold text-white"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> PRÉC.
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 font-mono text-[10px] font-bold text-white"
            >
              SUIV. <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {hasLink(article.repoUrl) && (
              <a
                href={article.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 font-mono text-[10px] font-bold text-white"
              >
                <GithubIcon className="w-3.5 h-3.5" /> CODE
              </a>
            )}
            {hasLink(article.liveUrl) && (
              <a
                href={article.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-lime text-ink font-mono text-[10px] font-bold hover:bg-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> VOIR LIVE
              </a>
            )}
          </div>
        </div>
      </div>

      {addingImage && (
        <ImagePickerDialog
          value={{ src: '', alt: article.title }}
          allowRemove={false}
          onClose={() => setAddingImage(false)}
          onSave={(img) => img.src && editA((a) => void a.gallery.push(img))}
        />
      )}
    </div>
  );
}
