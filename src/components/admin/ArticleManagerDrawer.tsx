import { useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Eye, Pencil, Plus, Trash, X } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import {
  articleFormFrom,
  contrastText,
  createArticle,
  deleteSpread,
  duplicateSpread,
  emptyArticleForm,
  moveSpread,
  updateArticle,
} from '@/lib/contentOps';
import type { Spread, SpreadKind } from '@/types/portfolio';
import { ADMIN_BAR_H } from './AdminTopBar';
import { ArticleForm } from './ArticleForm';
import { SettingsPanel } from './SettingsPanel';
import { DeskPanel } from './DeskPanel';
import { SpreadMetaForm } from './SpreadMetaForm';

const KIND_LABEL: Record<SpreadKind, string> = {
  cover: 'Couverture',
  moodboard: 'Moodboard',
  profile: 'Profil',
  project: 'Article',
  contact: 'Contact',
};

type View = { tab: 'pages' } | { tab: 'desk' } | { tab: 'settings' } | { tab: 'new' } | { tab: 'edit'; spreadId: string };

const iconBtn = 'w-7 h-7 rounded-md flex items-center justify-center text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-25 disabled:hover:bg-transparent';

/** Tiroir latéral : pages du carnet (CRUD articles, ordre) + réglages globaux. */
export function ArticleManagerDrawer() {
  const { isAdmin, drawerOpen, setDrawerOpen, content, edit, focusSpread } = useAdmin();
  const [view, setView] = useState<View>({ tab: 'pages' });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (!isAdmin || !drawerOpen) return null;

  const { spreads, articles } = content;
  const editing = view.tab === 'edit' ? spreads.find((s) => s.id === view.spreadId) : undefined;
  const editingArticle = editing?.kind === 'project' ? articles.find((a) => a.id === editing.articleId) : undefined;

  const row = (s: Spread, i: number) => (
    <li key={s.id} className="group flex items-center gap-2 rounded-xl bg-white/[0.04] px-2.5 py-2 hover:bg-white/[0.07]">
      <span className="w-3 h-3 shrink-0 rounded-full ring-2 ring-white/80" style={{ backgroundColor: s.tabColor }} />
      <button type="button" onClick={() => focusSpread(s.id)} className="min-w-0 flex-1 text-left" title="Afficher cette page">
        <span className="block truncate text-sm font-semibold">{s.label}</span>
        <span className="font-mono text-[10px] text-zinc-500">
          {KIND_LABEL[s.kind]} · jour {s.day} · onglet {s.tabLabel}
        </span>
      </button>

      {confirmDelete === s.id ? (
        <span className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              edit((c) => deleteSpread(c, s.id));
              setConfirmDelete(null);
            }}
            className="px-2 py-1 rounded-md bg-magenta text-xs font-semibold"
          >
            Supprimer
          </button>
          <button type="button" onClick={() => setConfirmDelete(null)} className="px-2 py-1 rounded-md bg-white/10 text-xs">
            Non
          </button>
        </span>
      ) : (
        <span className="flex items-center">
          <button type="button" className={iconBtn} title="Monter" aria-label="Monter" disabled={i === 0} onClick={() => edit((c) => moveSpread(c, s.id, -1))}>
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={iconBtn}
            title="Descendre"
            aria-label="Descendre"
            disabled={i === spreads.length - 1}
            onClick={() => edit((c) => moveSpread(c, s.id, 1))}
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button type="button" className={iconBtn} title="Modifier" aria-label="Modifier" onClick={() => setView({ tab: 'edit', spreadId: s.id })}>
            <Pencil className="w-4 h-4" />
          </button>
          {s.kind === 'project' && (
            <>
              <button
                type="button"
                className={iconBtn}
                title="Dupliquer"
                aria-label="Dupliquer"
                onClick={() => edit((c) => void duplicateSpread(c, s.id))}
              >
                <Copy className="w-4 h-4" />
              </button>
              <button type="button" className={`${iconBtn} hover:!bg-magenta`} title="Supprimer" aria-label="Supprimer" onClick={() => setConfirmDelete(s.id)}>
                <Trash className="w-4 h-4" />
              </button>
            </>
          )}
        </span>
      )}
    </li>
  );

  return (
    <aside
      className="fixed right-0 bottom-0 z-[55] flex w-[420px] max-w-full flex-col border-l border-white/10 bg-[#14161F]/92 text-zinc-100 shadow-[-20px_0_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      style={{ top: ADMIN_BAR_H }}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      aria-label="Gestion du carnet"
    >
      <header className="flex items-center gap-1 border-b border-white/10 px-3 py-2">
        {(['pages', 'desk', 'settings'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setView({ tab: t })}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              view.tab === t || (t === 'pages' && (view.tab === 'new' || view.tab === 'edit')) ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t === 'pages' ? 'Pages & articles' : t === 'desk' ? 'Décor' : 'Réglages'}
          </button>
        ))}
        <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Fermer" className="ml-auto w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {view.tab === 'pages' && (
          <>
            <button
              type="button"
              onClick={() => setView({ tab: 'new' })}
              className="mb-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-magenta py-2.5 font-semibold hover:brightness-110"
            >
              <Plus className="w-4 h-4" /> Nouvel article
            </button>
            <p className="mb-2 font-mono text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Ordre du carnet</p>
            <ul className="space-y-1.5">{spreads.map(row)}</ul>
            <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-zinc-500">
              <Eye className="mt-0.5 w-3.5 h-3.5 shrink-0" /> Clique sur un titre pour afficher la page. Les textes et images se modifient directement en cliquant
              dessus dans le carnet.
            </p>
          </>
        )}

        {view.tab === 'desk' && <DeskPanel />}
        {view.tab === 'settings' && <SettingsPanel />}

        {view.tab === 'new' && (
          <>
            <h2 className="mb-3 font-syne text-lg font-extrabold">Nouvel article</h2>
            <ArticleForm
              initial={emptyArticleForm()}
              submitLabel="Créer la double-page"
              onCancel={() => setView({ tab: 'pages' })}
              onSubmit={(values) => {
                let newId = '';
                edit((c) => {
                  newId = createArticle(c, values);
                });
                setView({ tab: 'pages' });
                if (newId) window.setTimeout(() => focusSpread(newId), 0);
              }}
            />
          </>
        )}

        {view.tab === 'edit' && editing && (
          <>
            <h2 className="mb-3 font-syne text-lg font-extrabold">Modifier · {editing.label}</h2>
            {editing.kind === 'project' && editingArticle ? (
              <ArticleForm
                key={editing.id}
                initial={articleFormFrom(editingArticle, editing)}
                submitLabel="Enregistrer"
                onCancel={() => setView({ tab: 'pages' })}
                onSubmit={(values) => {
                  edit((c) => updateArticle(c, editing.id, values));
                  setView({ tab: 'pages' });
                }}
              />
            ) : (
              <SpreadMetaForm
                key={editing.id}
                spread={editing}
                onCancel={() => setView({ tab: 'pages' })}
                onSubmit={(meta) => {
                  edit((c) => {
                    const s = c.spreads.find((x) => x.id === editing.id);
                    if (s) Object.assign(s, meta, { tabText: contrastText(meta.tabColor) });
                  });
                  setView({ tab: 'pages' });
                }}
              />
            )}
          </>
        )}
      </div>
    </aside>
  );
}
