import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as api from '@/services/contentApi';
import { relabelProjects } from '@/lib/contentOps';
import type { PortfolioContent } from '@/types/portfolio';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AdminState {
  content: PortfolioContent;
  backend: api.Backend;

  isAdmin: boolean;
  editMode: boolean;
  setEditMode: (on: boolean) => void;

  /** Applique une modification au brouillon (fn mute une copie). */
  edit: (fn: (draft: PortfolioContent) => void) => void;
  dirty: boolean;
  save: () => Promise<void>;
  discard: () => void;
  saveStatus: SaveStatus;
  saveError: string | null;

  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;

  drawerOpen: boolean;
  setDrawerOpen: (on: boolean) => void;

  /** Demande à la scène d'ouvrir une double-page (nonce pour re-déclencher). */
  focusRequest: { spreadId: string; nonce: number } | null;
  focusSpread: (spreadId: string) => void;
}

const AdminCtx = createContext<AdminState | null>(null);

export function useAdmin(): AdminState {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error('useAdmin doit être utilisé dans <AdminProvider>');
  return ctx;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [published, setPublished] = useState<PortfolioContent | null>(null);
  const [backend, setBackend] = useState<api.Backend>('api');

  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<AdminState['focusRequest']>(null);

  /* Chargement initial + session + route /admin */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await api.loadContent();
      const admin = await api.checkSession();
      if (cancelled) return;
      setContent(c);
      setPublished(c);
      setBackend(api.getBackend());
      setIsAdmin(admin);
      setLoaded(true);
      if (window.location.pathname.replace(/\/$/, '') === '/admin') {
        window.history.replaceState(null, '', '/');
        if (!admin) setLoginOpen(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = content !== published;
  const isAdminRef = useRef(isAdmin);
  isAdminRef.current = isAdmin;

  /* Raccourci Ctrl/Cmd + Shift + A */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (isAdminRef.current) setEditMode((v) => !v);
        else setLoginOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* Avertit avant de quitter avec des modifications non publiées */
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  // Le brouillon courant est suivi par une ref : `fn` s'exécute une seule fois
  // (pas dans un updater React, rejoué en StrictMode), ce qui permet d'y générer des ids.
  const contentRef = useRef(content);
  contentRef.current = content;

  const edit = useCallback((fn: (draft: PortfolioContent) => void) => {
    const prev = contentRef.current;
    if (!prev) return;
    const draft = structuredClone(prev);
    fn(draft);
    relabelProjects(draft); // « 01 · TITRE » suit les renommages inline
    contentRef.current = draft;
    setContent(draft);
    setSaveStatus('idle');
  }, []);

  const save = useCallback(async () => {
    if (!content) return;
    setSaveStatus('saving');
    setSaveError(null);
    try {
      const saved = await api.saveContent(content);
      setContent(saved);
      setPublished(saved);
      setBackend(api.getBackend());
      setSaveStatus('saved');
    } catch (e) {
      setSaveStatus('error');
      setSaveError(e instanceof Error ? e.message : 'Échec de la sauvegarde.');
    }
  }, [content]);

  const discard = useCallback(() => {
    setContent(published);
    setSaveStatus('idle');
  }, [published]);

  const login = useCallback(async (password: string) => {
    await api.login(password);
    setBackend(api.getBackend());
    setIsAdmin(true);
    setEditMode(true);
    setLoginOpen(false);
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setIsAdmin(false);
    setDrawerOpen(false);
    setContent(published); // le visiteur voit la version publiée
  }, [published]);

  const focusSpread = useCallback((spreadId: string) => setFocusRequest({ spreadId, nonce: Date.now() }), []);

  const value = useMemo<AdminState | null>(
    () =>
      content && {
        content,
        backend,
        isAdmin,
        editMode,
        setEditMode,
        edit,
        dirty,
        save,
        discard,
        saveStatus,
        saveError,
        loginOpen,
        openLogin: () => setLoginOpen(true),
        closeLogin: () => setLoginOpen(false),
        login,
        logout,
        drawerOpen,
        setDrawerOpen,
        focusRequest,
        focusSpread,
      },
    [content, backend, isAdmin, editMode, edit, dirty, save, discard, saveStatus, saveError, loginOpen, login, logout, drawerOpen, focusRequest, focusSpread],
  );

  if (!loaded || !value) {
    return (
      <div className="fixed inset-0 flex items-center justify-center font-mono text-xs tracking-[0.3em] text-white/60 uppercase">
        Chargement du carnet…
      </div>
    );
  }

  return <AdminCtx.Provider value={value}>{children}</AdminCtx.Provider>;
}
