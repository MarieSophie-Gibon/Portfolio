import { Check, LayoutList, Loader2, LogOut, Undo2 } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

export const ADMIN_BAR_H = 52;

/** Barre flottante d'administration (visible une fois connecté). */
export function AdminTopBar() {
  const { isAdmin, editMode, setEditMode, dirty, save, discard, saveStatus, saveError, setDrawerOpen, drawerOpen, logout, backend } = useAdmin();
  if (!isAdmin) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] flex items-center gap-2 sm:gap-3 px-3 sm:px-4 bg-ink/90 backdrop-blur-xl border-b border-white/10 text-white"
      style={{ height: ADMIN_BAR_H, paddingTop: 'env(safe-area-inset-top, 0px)' }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <span className="hidden md:inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-widest text-magenta">
        <span className="w-2 h-2 rounded-full bg-magenta animate-pulse" /> ADMIN
      </span>

      {/* Interrupteur Mode Édition */}
      <button
        type="button"
        role="switch"
        aria-checked={editMode}
        onClick={() => setEditMode(!editMode)}
        title="Désactive pour voir le rendu visiteur"
        className="inline-flex items-center gap-2 text-sm font-medium"
      >
        <span className={`relative w-9 h-5 rounded-full transition-colors ${editMode ? 'bg-magenta' : 'bg-white/20'}`}>
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${editMode ? 'translate-x-4' : ''}`} />
        </span>
        <span className="hidden sm:inline">Édition {editMode ? 'ON' : 'OFF'}</span>
      </button>

      <button
        type="button"
        onClick={() => setDrawerOpen(!drawerOpen)}
        className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-sm font-medium transition-colors ${
          drawerOpen ? 'bg-white text-ink' : 'bg-white/10 hover:bg-white/20'
        }`}
      >
        <LayoutList className="w-4 h-4" />
        <span className="hidden sm:inline">Gérer les articles</span>
      </button>

      <div className="flex-1 min-w-0 text-center text-xs truncate">
        {saveStatus === 'error' ? (
          <span className="text-magenta">{saveError}</span>
        ) : dirty ? (
          <span className="text-hazard">● Modifications non publiées</span>
        ) : saveStatus === 'saved' ? (
          <span className="text-lime">Publié ✓</span>
        ) : (
          <span className="hidden sm:inline text-white/40">{backend === 'local' ? 'Mode local — sauvegarde dans ce navigateur' : 'À jour'}</span>
        )}
      </div>

      {dirty && (
        <button
          type="button"
          onClick={discard}
          title="Annuler les modifications non publiées"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-sm"
        >
          <Undo2 className="w-4 h-4" />
          <span className="hidden lg:inline">Annuler</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => void save()}
        disabled={!dirty || saveStatus === 'saving'}
        className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full bg-lime text-ink text-sm font-semibold hover:bg-white disabled:opacity-40 disabled:hover:bg-lime transition-colors"
      >
        {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
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
        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
