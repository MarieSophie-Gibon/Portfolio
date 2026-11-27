import type { ReactNode } from 'react';
import { BookOpen, Check, Loader2, LogOut, Settings2, Sparkles, Undo2 } from 'lucide-react';
import { useAdmin, type DrawerTab } from '@/context/AdminContext';
import { leatherStyle } from '@/components/sketchbook/BookCover';

export const ADMIN_BAR_H = 52;

const GOLD = '#E9CF8E';

/** Bouton d'onglet de la barre (actif = parchemin). */
function TabButton({ tab, icon, label }: { tab: DrawerTab; icon: ReactNode; label: string }) {
  const { drawerOpen, drawerTab, toggleDrawer } = useAdmin();
  const active = drawerOpen && drawerTab === tab;
  return (
    <button
      type="button"
      onClick={() => toggleDrawer(tab)}
      aria-pressed={active}
      className={`t-fantasy inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] uppercase tracking-[0.12em] transition ${
        active
          ? 'bg-[#F3E9D2] text-[#3A2414] shadow-[inset_0_-2px_0_#B8893A]'
          : 'text-[#E9CF8E] hover:bg-[#F3E9D2]/10'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/** Barre d'administration (visible une fois connectée) : bande de cuir, accents laiton. */
export function AdminTopBar() {
  const { isAdmin, editMode, setEditMode, dirty, save, discard, saveStatus, saveError, logout, backend } = useAdmin();
  if (!isAdmin) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] flex items-center gap-1.5 px-3 text-[#F3E6C8] sm:gap-2.5 sm:px-4"
      style={{
        ...leatherStyle('#3B2416'),
        height: ADMIN_BAR_H,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        boxShadow: 'inset 0 -1px 0 rgba(233,207,142,0.35), inset 0 -4px 0 rgba(0,0,0,0.25), 0 6px 18px rgba(10,5,0,0.45)',
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Couture */}
      <div className="pointer-events-none absolute inset-x-2 bottom-[5px] border-b border-dashed border-[#E9CF8E]/30" />

      <span className="t-fantasy hidden items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] md:inline-flex" style={{ color: GOLD }}>
        ✦ Atelier
      </span>

      {/* Interrupteur mode édition */}
      <button
        type="button"
        role="switch"
        aria-checked={editMode}
        onClick={() => setEditMode(!editMode)}
        title="Désactive pour voir le rendu visiteur"
        className="inline-flex items-center gap-2 text-sm"
      >
        <span
          className={`relative h-5 w-9 rounded-full border transition-colors ${editMode ? 'border-[#E9CF8E] bg-[#8E2F2A]' : 'border-[#E9CF8E]/40 bg-black/30'}`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-3.5 w-3.5 rounded-full transition-transform ${editMode ? 'translate-x-4' : ''}`}
            style={{ background: 'radial-gradient(circle at 35% 30%, #FBE7B0, #C9A24E 55%, #6E4E1C)' }}
          />
        </span>
        <span className="hidden text-[13px] sm:inline">Édition</span>
      </button>

      <span className="mx-0.5 hidden h-6 w-px bg-[#E9CF8E]/25 sm:block" />

      <TabButton tab="general" icon={<Sparkles className="h-4 w-4" />} label="Général" />
      <TabButton tab="pages" icon={<BookOpen className="h-4 w-4" />} label="Pages" />
      <TabButton tab="settings" icon={<Settings2 className="h-4 w-4" />} label="Réglages" />

      <div className="min-w-0 flex-1 truncate text-center text-xs">
        {saveStatus === 'error' ? (
          <span className="text-[#F2A79C]">{saveError}</span>
        ) : dirty ? (
          <span style={{ color: GOLD }}>● Modifications non publiées</span>
        ) : saveStatus === 'saved' ? (
          <span className="text-[#C9DDA6]">Publié ✓</span>
        ) : (
          <span className="hidden text-[#F3E6C8]/45 sm:inline">{backend === 'local' ? 'Mode local — sauvegarde dans ce navigateur' : 'À jour'}</span>
        )}
      </div>

      {dirty && (
        <button
          type="button"
          onClick={discard}
          title="Annuler les modifications non publiées"
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm text-[#F3E6C8] hover:bg-[#F3E9D2]/10"
        >
          <Undo2 className="h-4 w-4" />
          <span className="hidden lg:inline">Annuler</span>
        </button>
      )}

      {/* Publier : sceau de cire */}
      <button
        type="button"
        onClick={() => void save()}
        disabled={!dirty || saveStatus === 'saving'}
        className="t-fantasy inline-flex h-8 items-center gap-1.5 rounded-md bg-[#8E2F2A] px-3.5 text-[12px] uppercase tracking-[0.12em] text-[#F7E7C6] shadow-[0_2px_0_#5E1C18,inset_0_1px_0_rgba(255,220,200,0.25)] transition hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
      >
        {saveStatus === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        Publier
      </button>

      <button
        type="button"
        onClick={() => {
          if (dirty && !window.confirm('Des modifications ne sont pas publiées et seront perdues. Se déconnecter quand même ?')) return;
          void logout();
        }}
        title="Déconnexion"
        aria-label="Déconnexion"
        className="flex h-8 w-8 items-center justify-center rounded-md text-[#E9CF8E] hover:bg-[#F3E9D2]/10"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
