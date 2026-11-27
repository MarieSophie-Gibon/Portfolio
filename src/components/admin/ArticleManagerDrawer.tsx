import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Eye, Pencil, Plus, Trash, X } from 'lucide-react';
import { useAdmin, type DrawerTab } from '@/context/AdminContext';
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
import { leatherStyle } from '@/components/sketchbook/BookCover';
import type { Spread, SpreadKind } from '@/types/portfolio';
import { ADMIN_BAR_H } from './AdminTopBar';
import { ArticleForm } from './ArticleForm';
import { GeneralPanel } from './GeneralPanel';
import { SettingsPanel } from './SettingsPanel';
import { SpreadMetaForm } from './SpreadMetaForm';
import { btnPrimary, btnSecondary } from './formFields';

const KIND_LABEL: Record<SpreadKind, string> = {
  cover: 'Home',
  about: 'À propos',
  experience: 'Expériences',
  projects: 'Projets',
  project: 'Projet',
  services: 'Services',
  contact: 'Contact',
  doodles: 'Doodles',
  moodboard: 'Lab (ancien)',
  profile: 'Profil (ancien)',
};

const TABS: { tab: DrawerTab; label: string }[] = [
  { tab: 'general', label: 'Général' },
  { tab: 'pages', label: 'Pages' },
  { tab: 'settings', label: 'Réglages' },
];

/** Sous-vue de l'onglet Pages. */
type PagesView = { mode: 'list' } | { mode: 'new' } | { mode: 'edit'; spreadId: string };

const iconBtn =
  'flex h-7 w-7 items-center justify-center rounded-md text-[#6B4A2B] hover:bg-[#5A3520]/12 hover:text-[#3A2414] disabled:opacity-25 disabled:hover:bg-transparent';

/** Tiroir d'édition : Général (fond + décor), Pages (ordre, articles), Réglages. */
export function ArticleManagerDrawer() {
  const { isAdmin, drawerOpen, setDrawerOpen, drawerTab, setDrawerTab, content, edit, focusSpread } = useAdmin();
  const [view, setView] = useState<PagesView>({ mode: 'list' });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Revenir à la liste quand on change d'onglet.
  useEffect(() => setView({ mode: 'list' }), [drawerTab]);

  if (!isAdmin || !drawerOpen) return null;

  const { spreads, articles } = content;
  const editing = view.mode === 'edit' ? spreads.find((s) => s.id === view.spreadId) : undefined;
  const editingArticle = editing?.kind === 'project' ? articles.find((a) => a.id === editing.articleId) : undefined;

  const row = (s: Spread, i: number) => (
    <li key={s.id} className="group flex items-center gap-2 rounded-md border border-[#8E6A3E]/20 bg-[#FBF5E6]/80 px-2.5 py-2 hover:border-[#B8893A]/60">
      <span className="h-3 w-3 shrink-0 rounded-full ring-2 ring-[#FBF5E6] shadow-[0_0_0_3px_rgba(142,106,62,0.3)]" style={{ backgroundColor: s.tabColor }} />
      <button type="button" onClick={() => focusSpread(s.id)} className="min-w-0 flex-1 text-left" title="Afficher cette page">
        <span className="block truncate text-sm font-semibold text-[#3A2414]">{s.label || s.tabLabel || KIND_LABEL[s.kind]}</span>
        <span className="font-mono text-[10px] text-[#8A6A48]">
          {KIND_LABEL[s.kind]}
          {s.tabLabel ? ` · onglet ${s.tabLabel}` : ''}
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
            className="rounded-md bg-[#8E2F2A] px-2 py-1 text-xs font-semibold text-[#F7E7C6]"
          >
            Supprimer
          </button>
          <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-md bg-[#5A3520]/10 px-2 py-1 text-xs text-[#3A2414]">
            Non
          </button>
        </span>
      ) : (
        <span className="flex items-center">
          <button type="button" className={iconBtn} title="Monter" aria-label="Monter" disabled={i === 0} onClick={() => edit((c) => moveSpread(c, s.id, -1))}>
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={iconBtn}
            title="Descendre"
            aria-label="Descendre"
            disabled={i === spreads.length - 1}
            onClick={() => edit((c) => moveSpread(c, s.id, 1))}
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <button type="button" className={iconBtn} title="Modifier" aria-label="Modifier" onClick={() => setView({ mode: 'edit', spreadId: s.id })}>
            <Pencil className="h-4 w-4" />
          </button>
          {s.kind === 'project' && (
            <>
              <button type="button" className={iconBtn} title="Dupliquer" aria-label="Dupliquer" onClick={() => edit((c) => void duplicateSpread(c, s.id))}>
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={`${iconBtn} hover:!bg-[#8E2F2A] hover:!text-[#F7E7C6]`}
                title="Supprimer"
                aria-label="Supprimer"
                onClick={() => setConfirmDelete(s.id)}
              >
                <Trash className="h-4 w-4" />
              </button>
            </>
          )}
        </span>
      )}
    </li>
  );

  return (
    <aside
      className="fixed bottom-0 right-0 z-[55] flex w-[420px] max-w-full flex-col text-[#3A2414]"
      style={{ top: ADMIN_BAR_H }}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      aria-label="Menu d'édition"
    >
      {/* Dos en cuir */}
      <div className="absolute inset-y-0 left-0 w-3" style={{ ...leatherStyle('#5A3520'), boxShadow: 'inset -2px 0 3px rgba(0,0,0,0.35)' }} />

      <div
        className="ml-3 flex min-h-0 flex-1 flex-col shadow-[-20px_0_50px_rgba(10,5,0,0.45)]"
        style={{
          backgroundColor: '#F3E9D2',
          backgroundImage: 'var(--tex-paper), radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(140,95,40,0.18) 100%)',
          backgroundSize: '320px 320px, 100% 100%',
        }}
      >
        <header className="flex items-end gap-1 border-b border-[#8E6A3E]/30 px-3 pt-2">
          {TABS.map(({ tab, label }) => {
            const active = drawerTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setDrawerTab(tab)}
                className={`t-fantasy -mb-px rounded-t-md border px-3 py-1.5 text-[12px] uppercase tracking-[0.12em] transition ${
                  active
                    ? 'border-[#8E6A3E]/30 border-b-[#F3E9D2] bg-[#F3E9D2] text-[#3A2414]'
                    : 'border-transparent text-[#8A6A48] hover:text-[#3A2414]'
                }`}
              >
                {label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Fermer"
            className="mb-1.5 ml-auto flex h-8 w-8 items-center justify-center rounded-full text-[#6B4A2B] hover:bg-[#5A3520]/10"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {drawerTab === 'general' && <GeneralPanel />}
          {drawerTab === 'settings' && <SettingsPanel />}

          {drawerTab === 'pages' && view.mode === 'list' && (
            <>
              <button type="button" onClick={() => setView({ mode: 'new' })} className={`${btnPrimary} mb-4 w-full py-2.5`}>
                <Plus className="h-4 w-4" /> Nouvel article
              </button>
              <p className="t-fantasy mb-2 text-[11px] uppercase tracking-[0.18em] text-[#6B4A2B]">
                <span className="text-[#B8893A]">✦</span> Ordre du carnet
              </p>
              <ul className="space-y-1.5">{spreads.map(row)}</ul>
              <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-[#8A6A48]">
                <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Clique sur un titre pour afficher la page. Les textes et images se modifient directement en
                cliquant dessus dans le carnet.
              </p>
            </>
          )}

          {drawerTab === 'pages' && view.mode === 'new' && (
            <>
              <h2 className="t-fantasy mb-3 text-lg">Nouvel article</h2>
              <ArticleForm
                initial={emptyArticleForm()}
                submitLabel="Créer la double-page"
                onCancel={() => setView({ mode: 'list' })}
                onSubmit={(values) => {
                  let newId = '';
                  edit((c) => {
                    newId = createArticle(c, values);
                  });
                  setView({ mode: 'list' });
                  if (newId) window.setTimeout(() => focusSpread(newId), 0);
                }}
              />
            </>
          )}

          {drawerTab === 'pages' && view.mode === 'edit' && editing && (
            <>
              <button type="button" onClick={() => setView({ mode: 'list' })} className={`${btnSecondary} mb-3`}>
                ← Retour
              </button>
              <h2 className="t-fantasy mb-3 text-lg">Modifier · {editing.label || KIND_LABEL[editing.kind]}</h2>
              {editing.kind === 'project' && editingArticle ? (
                <ArticleForm
                  key={editing.id}
                  initial={articleFormFrom(editingArticle, editing)}
                  submitLabel="Enregistrer"
                  onCancel={() => setView({ mode: 'list' })}
                  onSubmit={(values) => {
                    edit((c) => updateArticle(c, editing.id, values));
                    setView({ mode: 'list' });
                  }}
                />
              ) : (
                <SpreadMetaForm
                  key={editing.id}
                  spread={editing}
                  onCancel={() => setView({ mode: 'list' })}
                  onSubmit={(meta) => {
                    edit((c) => {
                      const s = c.spreads.find((x) => x.id === editing.id);
                      if (s) Object.assign(s, meta, { tabText: contrastText(meta.tabColor) });
                    });
                    setView({ mode: 'list' });
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
