import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { hasMoreContent } from '@/lib/moreInfo';
import { useAdmin } from '@/context/AdminContext';
import { EditScope } from '@/components/admin/EditableText';
import { ADMIN_BAR_H } from '@/components/admin/AdminTopBar';
import { renderSpreadParts } from '@/components/spreads/renderSpreadParts';
import { ActiveSpreadContext, type SpreadCtx } from '@/components/spreads/spreadContext';
import type { DeskItem, Spread } from '@/types/portfolio';
import { BOOK_H, BOOK_W, SpreadBase } from './SpreadBase';
import { FLIP_MS, PageTurnOverlay3D, type FlipDir, type FlipState } from './PageTurnOverlay3D';
import { DieCutTabs } from './DieCutTabs';
import { TopNav } from './TopNav';
import { LogoSticker } from './LogoSticker';
import { BookCover, OpenCoverBoards } from './BookCover';
import { MorePanel, type MoreTarget } from './MorePanel';
import { HiddenFooter } from './HiddenFooter';
import { DoodlesSketchbook } from './DoodlesSketchbook';
import { AddStickerButton, DeskItemsLayer, StickerLayer, newStickerId } from './DeskItemsLayer';

/* ------------------------------------------------------------------ */
/* Mise en page                                                        */
/* ------------------------------------------------------------------ */

const HEADER_H = 40; // simple marge haute (plus de titre) : laisse la place au logo et au menu
const DOCK_H = 84; // marge basse : de l'air sous le carnet + place pour la languette du footer
const TABS_H = 40;
const BOARDS_H = 40; // débord des plats en cuir autour des pages (haut + bas)

/* Éventail : décalage, échelle, ombrage et z-index par profondeur (1..4). */
const FAN = {
  offset: [0, 124, 234, 328, 404],
  scale: [1, 0.935, 0.875, 0.818, 0.765],
  shade: [0, 0.04, 0.08, 0.12, 0.16],
  z: [30, 22, 16, 10, 5],
};
const FAN_DEPTH = 4;
const HOVER_NUDGE = 22;

const NO_STICKERS: DeskItem[] = [];
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

function useViewport() {
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return vp;
}

/* Mode « une page à la fois » (téléphone en portrait). */
const PAGE_W = BOOK_W / 2;
const SINGLE_MAX_W = 700;
const SINGLE_TOP = 14; // pas d'onglets au-dessus du carnet dans ce mode
const SINGLE_MAX_STRETCH = 1.45; // la page peut s'allonger jusqu'à +45 % en hauteur

type PageSide = 'left' | 'right';

/** Téléphone (ou fenêtre étroite) tenu en portrait : on lit une page à la fois. */
const isSinglePage = (w: number, h: number) => w < SINGLE_MAX_W && h > w;

/** Échelle du carnet, hauteur de conception des pages et amplitude de l'éventail. */
function computeLayout(w: number, h: number, single: boolean) {
  if (single) {
    const availH = h - HEADER_H - DOCK_H - SINGLE_TOP - 6;
    const scale = Math.max(0.2, Math.min((w - 24) / PAGE_W, availH / BOOK_H));
    // Place verticale en trop : on allonge la page plutôt que de laisser du vide.
    const bookH = clamp(availH / scale, BOOK_H, BOOK_H * SINGLE_MAX_STRETCH);
    return { scale, fanFactor: 0, bookH };
  }
  // BOARDS_H : les plats en cuir dépassent des pages en haut et en bas.
  const availH = h - HEADER_H - DOCK_H - TABS_H - BOARDS_H - 6;
  const mobile = w < 640;
  const scale = Math.max(
    0.2,
    mobile ? Math.min((w - 24) / BOOK_W, availH / BOOK_H) : Math.min(availH / BOOK_H, (w * 0.72) / BOOK_W, 2.2),
  );
  const sideSpace = (w / scale - BOOK_W) / 2 - 24;
  const fanFactor = mobile ? 0.08 : clamp(sideSpace / FAN.offset[FAN_DEPTH], 0.2, 1.06);
  return { scale, fanFactor, bookH: BOOK_H };
}

/* ------------------------------------------------------------------ */
/* Double-page mémoïsée : ne se re-rend que si SES props changent       */
/* (pas au survol de l'éventail, ni au début / à la fin d'un flip).     */
/* ------------------------------------------------------------------ */

interface SpreadViewProps {
  spread: Spread;
  index: number;
  /** Une couverture existe : depuis la 1re double-page, « précédent » y retourne. */
  hasCover: boolean;
  count: number;
  /** Double-page active (interactive). false pour l'éventail et les copies du flip. */
  isActive: boolean;
  /** Mode une page à la fois : pas de clic sur la page pour tourner (swipe + flèches). */
  single: boolean;
  editing: boolean;
  alias: string;
  ctx: SpreadCtx;
  onPrev: () => void;
  onNext: () => void;
  onMore: (spreadId: string) => void;
}

const SpreadView = memo(function SpreadView({
  spread,
  index,
  hasCover,
  count,
  isActive,
  single,
  editing,
  alias,
  ctx,
  onPrev,
  onNext,
  onMore,
}: SpreadViewProps) {
  const editStickers = (fn: (items: DeskItem[]) => void) =>
    ctx.edit((c) => {
      const s = c.spreads.find((x) => x.id === spread.id);
      if (!s) return;
      s.stickers ??= [];
      fn(s.stickers);
    });

  return (
    <ActiveSpreadContext.Provider value={isActive}>
    <EditScope.Provider value={isActive}>
      <div className="relative w-full h-full">
        <SpreadBase
          spread={spread}
          alias={alias}
          parts={renderSpreadParts(spread, ctx)}
          // En mode édition, un clic sur la page sert à éditer, pas à tourner.
          interactive={isActive && !editing && !single}
          canPrev={index > 0 || hasCover}
          canNext={index < count - 1}
          onPrev={onPrev}
          onNext={onNext}
          onMore={isActive ? () => onMore(spread.id) : undefined}
          showMore={editing || hasMoreContent(spread, ctx.content)}
        />
        {/* Stickers collés sur la double-page (tournent avec elle) */}
        <StickerLayer items={spread.stickers ?? NO_STICKERS} onEdit={editStickers} className="z-[28]" />
        {isActive && (
          <AddStickerButton onAdd={(item) => editStickers((list) => void list.push({ ...item, id: newStickerId() }))} />
        )}
      </div>
    </EditScope.Provider>
    </ActiveSpreadContext.Provider>
  );
});

/* ------------------------------------------------------------------ */
/* Scène                                                               */
/* ------------------------------------------------------------------ */

const DRAWER_W = 420;

export function SketchbookStage() {
  const { content, edit, isAdmin, editMode, drawerOpen, focusRequest, openLogin } = useAdmin();
  const { author, settings } = content;
  // Les Doodles vivent dans un second carnet (en bas à droite) : hors de la lecture du carnet principal.
  const spreads = useMemo(() => content.spreads.filter((s) => s.kind !== 'doodles'), [content.spreads]);
  const hasDoodles = content.spreads.some((s) => s.kind === 'doodles');
  const editing = isAdmin && editMode;
  const count = spreads.length;

  // Couverture : index -1 = carnet fermé (affiché au chargement si activée).
  const hasCover = settings.cover?.enabled !== false;
  const minIndex = hasCover ? -1 : 0;
  const [activeIndex, setActiveIndex] = useState(() => (hasCover ? -1 : Math.max(0, spreads.findIndex((s) => s.id === settings.startSpreadId))));
  const safeIndex = clamp(activeIndex, minIndex, count - 1);
  const closed = safeIndex === -1;
  const activeRef = useRef(safeIndex);
  activeRef.current = safeIndex;

  const [flip, setFlip] = useState<FlipState | null>(null);
  const flipTimer = useRef<number | undefined>(undefined);
  const [hovered, setHovered] = useState<number | null>(null);
  // Feuille volante « En savoir plus » (fiche projet ou infos de la page).
  const [moreTarget, setMoreTarget] = useState<MoreTarget | null>(null);
  const [doodlesOpen, setDoodlesOpen] = useState(false);
  const openDoodles = useCallback(() => setDoodlesOpen(true), []);
  const closeDoodles = useCallback(() => setDoodlesOpen(false), []);
  const openSpreadSheet = useCallback((spreadId: string) => setMoreTarget({ spreadId }), []);
  const closeMore = useCallback(() => setMoreTarget(null), []);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [swipeHint, setSwipeHint] = useState<FlipDir | null>(null);

  const { w, h } = useViewport();
  // Barre admin en haut + tiroir à droite (sur grand écran) réduisent l'espace du carnet.
  const topInset = isAdmin ? ADMIN_BAR_H : 0;
  const rightInset = isAdmin && drawerOpen && w >= 900 ? DRAWER_W : 0;
  const single = isSinglePage(w - rightInset, h - topInset);
  const { scale, fanFactor, bookH } = computeLayout(w - rightInset, h - topInset, single);
  const viewW = single ? PAGE_W : BOOK_W; // largeur visible du carnet (px de conception)
  // Même facteur d'échelle pour les feuilles volantes (.ui-scaled) : tailles de texte identiques partout.
  useEffect(() => {
    document.documentElement.style.setProperty('--ui-scale', String(clamp(scale, 1, 1.6)));
  }, [scale]);

  const modalOpenRef = useRef(false);
  modalOpenRef.current = moreTarget !== null || doodlesOpen; // pas de navigation sous une feuille / le carnet de croquis
  const editingRef = useRef(false);
  editingRef.current = editing;

  // Mode une page : page visible de la double-page active + sens de la dernière navigation.
  const [pageSide, setPageSide] = useState<PageSide>('left');
  const sideRef = useRef<PageSide>('left');
  sideRef.current = pageSide;
  const singleRef = useRef(single);
  singleRef.current = single;
  const [navDir, setNavDir] = useState<FlipDir>('next');

  /* ---------------- Toast ---------------- */
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  /* ---------------- Navigation + flip 3D ---------------- */
  const goTo = useCallback(
    (target: number) => {
      const from = activeRef.current;
      const to = clamp(target, minIndex, count - 1);
      if (to === from) return;
      activeRef.current = to;
      setActiveIndex(to);
      setHovered(null);
      setPageSide('left'); // une double-page s'ouvre sur sa page gauche
      sideRef.current = 'left';
      setNavDir(to > from ? 'next' : 'prev');

      window.clearTimeout(flipTimer.current);
      // Mode une page : glissement simple à la place du flip 3D de la double-page.
      if (prefersReducedMotion() || singleRef.current) {
        setFlip(null);
        return;
      }
      setFlip({ from, to, dir: to > from ? 'next' : 'prev', key: Date.now() });
      flipTimer.current = window.setTimeout(() => setFlip(null), FLIP_MS + 40); // marge : laisse la dernière frame se peindre
    },
    [count, minIndex],
  );

  useEffect(() => () => window.clearTimeout(flipTimer.current), []);

  /** Page suivante / précédente : double-page entière, ou demi-page en mode une page. */
  const step = useCallback(
    (delta: 1 | -1) => {
      const i = activeRef.current;
      if (!singleRef.current || i === -1) return goTo(i + delta);
      const side = sideRef.current;
      if (delta > 0 && side === 'left') {
        setPageSide('right');
        sideRef.current = 'right';
      } else if (delta < 0 && side === 'right') {
        setPageSide('left');
        sideRef.current = 'left';
      } else if (delta > 0) {
        goTo(i + 1);
      } else if (i - 1 >= minIndex) {
        goTo(i - 1);
        // En reculant, on arrive sur la page droite de la double-page précédente.
        setPageSide('right');
        sideRef.current = 'right';
      }
    },
    [goTo, minIndex],
  );

  // Le tiroir admin demande d'afficher une page précise.
  useEffect(() => {
    if (!focusRequest) return;
    const i = spreads.findIndex((s) => s.id === focusRequest.spreadId);
    if (i >= 0) goTo(i);
  }, [focusRequest]); // uniquement à chaque nouvelle demande

  // Un clic qui termine un swipe ne doit pas aussi tourner la page.
  const suppressClick = useRef(false);
  const clickPrev = useCallback(() => void (!suppressClick.current && step(-1)), [step]);
  const clickNext = useCallback(() => void (!suppressClick.current && step(1)), [step]);

  // Clavier ← / →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (modalOpenRef.current) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        step(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        step(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  // Trackpad 2 doigts horizontal : cumul de deltaX + verrou jusqu'à la fin de l'inertie.
  useEffect(() => {
    let acc = 0;
    let lastEvent = 0;
    let locked = false;
    let lockedAt = 0;
    const onWheel = (e: WheelEvent) => {
      if (modalOpenRef.current) return;
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const now = performance.now();
      const gap = now - lastEvent;
      lastEvent = now;
      if (locked) {
        if (now - lockedAt > 450 && gap > 160) locked = false;
        else return;
      }
      if (gap > 200) acc = 0;
      acc += e.deltaX;
      if (Math.abs(acc) > 30) {
        step(acc > 0 ? 1 : -1);
        acc = 0;
        locked = true;
        lockedAt = now;
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [step]);

  // Swipe tactile / glisser à la souris
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: PointerEvent) => {
    if (modalOpenRef.current) return;
    if (e.pointerType === 'mouse' && (e.button !== 0 || editingRef.current)) return; // en édition : pas de glisser souris

    pointerStart.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: PointerEvent) => {
    const start = pointerStart.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    setSwipeHint(Math.abs(dx) > 26 && Math.abs(dx) > Math.abs(dy) * 1.2 ? (dx < 0 ? 'next' : 'prev') : null);
  };
  const onPointerUp = (e: PointerEvent) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    setSwipeHint(null);
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      suppressClick.current = true;
      window.setTimeout(() => (suppressClick.current = false), 120);
      step(dx < 0 ? 1 : -1);
    }
  };

  /* ---------------- Actions ---------------- */
  const copyEmail = useCallback(() => {
    navigator.clipboard?.writeText(author.email).catch(() => {});
    setCopied(true);
    setToast(`Email copié : ${author.email}`);
    window.setTimeout(() => setCopied(false), 2200);
  }, [author.email]);

  const goToArticle = useCallback(
    (articleId: string) => {
      const i = spreads.findIndex(
        (s) => (s.kind === 'project' && s.articleId === articleId) || (s.kind === 'contact' && s.featuredArticleId === articleId),
      );
      if (i >= 0) goTo(i);
    },
    [spreads, goTo],
  );

  const contactIndex = spreads.findIndex((s) => s.kind === 'contact');
  // Ouvre la fiche d'un projet (depuis une photo, un index…), rattachée à sa double-page.
  const openArticleSheet = useCallback(
    (articleId: string) => {
      const s = spreads.find(
        (x) => (x.kind === 'project' && x.articleId === articleId) || (x.kind === 'contact' && x.featuredArticleId === articleId),
      );
      if (s) setMoreTarget({ spreadId: s.id, articleId });
    },
    [spreads],
  );

  /* ---------------- Rendu d'une double-page ---------------- */
  const ctx = useMemo<SpreadCtx>(
    () => ({ content, edit, goToArticle, openProject: openArticleSheet, copyEmail, copied }),
    [content, edit, goToArticle, openArticleSheet, copyEmail, copied],
  );

  const renderSpread = (index: number, isClone = false) => {
    if (index === -1) {
      const live = !isClone && closed;
      return (
        <EditScope.Provider value={live}>
          <BookCover cover={settings.cover} interactive={live} onOpen={() => goTo(0)} edit={edit} />
        </EditScope.Provider>
      );
    }
    const spread = spreads[index];
    if (!spread) return null;
    return (
      <SpreadView
        spread={spread}
        index={index}
        hasCover={hasCover}
        count={count}
        isActive={!isClone && index === safeIndex}
        single={single}
        editing={editing}
        alias={author.alias}
        ctx={ctx}
        onPrev={clickPrev}
        onNext={clickNext}
        onMore={openSpreadSheet}
      />
    );
  };

  // Uniquement transform + opacity (composités par le GPU) : pas de filter animé.
  const fanStyle = (index: number): CSSProperties => {
    const offset = index - safeIndex;
    const depth = Math.abs(offset);
    const sign = Math.sign(offset);
    if (depth === 0) return { transform: 'translateX(0) scale(1)', zIndex: FAN.z[0] };
    if (depth > FAN_DEPTH) {
      return { transform: `translateX(${sign * FAN.offset[FAN_DEPTH] * fanFactor}px) scale(0.72)`, zIndex: 1, opacity: 0, pointerEvents: 'none' };
    }
    const isHovered = hovered === index;
    const tx = sign * (FAN.offset[depth] * fanFactor + (isHovered ? HOVER_NUDGE : 0));
    return { transform: `translateX(${tx}px) scale(${FAN.scale[depth]})`, zIndex: FAN.z[depth] };
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        pointerStart.current = null;
        setSwipeHint(null);
      }}
      className="fixed inset-0 overflow-hidden text-white select-none transition-[right] duration-300"
      style={{ top: topInset, right: rightInset }}
    >
      {/* Décor du bureau (derrière tout le reste) */}
      <DeskItemsLayer viewportW={w} />

      <LogoSticker
        logo={settings.logo}
        onHome={() => goTo(minIndex)}
        onSave={(logo) => edit((c) => void (c.settings.logo = logo))}
      />


      {(toast || swipeHint) && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          {swipeHint ? (
            <div className="bg-white text-ink font-mono text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-xl flex items-center gap-1">
              {swipeHint === 'next' ? (
                <>
                  Suivant <ChevronRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <ChevronLeft className="w-3.5 h-3.5" /> Précédent
                </>
              )}
            </div>
          ) : (
            <div className="bg-ink/90 backdrop-blur-md text-white font-mono text-[11px] px-4 py-2 rounded-full border border-white/15 shadow-xl">{toast}</div>
          )}
        </div>
      )}

      {/* Carnet */}
      <main className="pointer-events-none absolute inset-x-0 z-10 flex items-center justify-center" style={{ top: HEADER_H, bottom: DOCK_H }}>
        <div
          // Mode une page : remonté à chaque double-page pour jouer l'entrée (pas de flip 3D).
          key={single ? `page-${safeIndex}` : 'book'}
          className={`pointer-events-auto relative ${single && !prefersReducedMotion() ? (navDir === 'next' ? 'animate-page-in-next' : 'animate-page-in-prev') : ''}`}
          style={{ width: viewW * scale, height: bookH * scale, marginTop: single ? SINGLE_TOP : TABS_H }}
        >
          {/* Mode une page : fenêtre de la largeur d'une page sur la double-page complète. */}
          <div
            className={single ? 'absolute inset-0 overflow-hidden rounded-[10px]' : 'contents'}
            style={single ? { boxShadow: '0 22px 44px -14px rgba(20,60,80,0.5), 0 6px 12px -6px rgba(20,60,80,0.25)' } : undefined}
          >
          <div
            className={`absolute left-0 top-0 origin-top-left transition-transform duration-[620ms] ease-[cubic-bezier(0.45,0.05,0.25,1)] ${single ? 'single-page' : ''}`}
            style={{
              width: BOOK_W,
              height: bookH,
              transform: `scale(${scale}) translateX(${
                single
                  ? closed || pageSide === 'right'
                    ? -PAGE_W // couverture et page droite = moitié droite
                    : 0
                  : closed
                    ? -BOOK_W / 4 // fermé : centre la couverture (moitié droite) sur le bureau
                    : 0
              }px)`,
            }}
          >
            {!single && (
              <>
                {/* Ombre portée sur le bureau */}
                <div
                  className="pointer-events-none absolute -bottom-8 left-[-16%] right-[-16%] h-16 rounded-full blur-2xl"
                  style={{ background: 'rgba(20,60,80,0.35)' }}
                />
                {/* Onglets : remplacés par le sommaire en mode une page (trop étroit). */}
                <DieCutTabs spreads={spreads} activeIndex={safeIndex} onSelect={goTo} />
                {/* Livre ouvert : plats en cuir (couleur de la couverture) de part et d'autre des pages */}
                {!closed && <OpenCoverBoards color={settings.cover.color} />}
              </>
            )}

            {closed ? (
              // Carnet fermé : seule la couverture est affichée.
              <div className="absolute inset-0" style={{ zIndex: FAN.z[0] }}>
                {renderSpread(-1)}
              </div>
            ) : (
            spreads.map((spread, index) => {
              const offset = index - safeIndex;
              const depth = Math.abs(offset);
              if (depth > FAN_DEPTH + 1) return null;
              if (single && depth > 0) return null; // pas d'éventail en mode une page
              const isActive = depth === 0;
              const isSide = depth >= 1 && depth <= FAN_DEPTH;
              return (
                <div
                  key={spread.id}
                  style={{
                    ...fanStyle(index),
                    // Ouverture depuis la couverture : la page gauche et l'éventail n'apparaissent qu'à l'atterrissage.
                    ...(flip?.from === -1 ? (isActive ? { clipPath: 'inset(0 0 0 50%)' } : { opacity: 0 }) : null),
                  }}
                  onMouseEnter={() => isSide && setHovered(index)}
                  onMouseLeave={() => setHovered((h) => (h === index ? null : h))}
                  onClick={() => isSide && goTo(index)}
                  className={`fan-spread-item absolute inset-0 rounded-[10px] ${isSide ? 'cursor-pointer' : ''}`}
                >
                  <div
                    className="relative w-full h-full rounded-[10px]"
                    style={{
                      boxShadow: isActive
                        ? '0 26px 50px -14px rgba(20,60,80,0.5), 0 8px 14px -6px rgba(20,60,80,0.25)'
                        : '0 16px 30px -10px rgba(20,60,80,0.35)',
                    }}
                  >
                    {renderSpread(index)}
                    {/* Ombrage de profondeur (opacité animable, contrairement à filter) */}
                    <div
                      className="pointer-events-none absolute inset-0 z-40 rounded-[10px] bg-[#1f4f5e] transition-opacity duration-500"
                      style={{ opacity: depth <= FAN_DEPTH ? (hovered === index ? 0 : FAN.shade[depth]) : 0 }}
                    />
                    {isSide && <div className="absolute inset-0 z-40 rounded-[10px]" />}
                    {isSide && hovered === index && (
                      <div
                        className={`absolute top-4 z-50 px-3 py-1 rounded-full bg-ink/95 text-white font-mono text-[12px] font-bold shadow-xl border border-white/20 whitespace-nowrap pointer-events-none flex items-center gap-1.5 ${
                          offset < 0 ? 'left-3' : 'right-3'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: spread.tabColor }} />
                        {offset < 0 ? `← ${spread.day} • ${spread.tabLabel}` : `${spread.day} • ${spread.tabLabel} →`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
            )}

            {flip && <PageTurnOverlay3D flip={flip} renderSpread={(i) => renderSpread(i, true)} />}
          </div>
          </div>
        </div>
      </main>

      <TopNav
        spreads={spreads}
        activeIndex={safeIndex}
        onGoTo={goTo}
        onContact={() => contactIndex >= 0 && goTo(contactIndex)}
        onAdminAccess={isAdmin ? undefined : openLogin}
        onCover={hasCover ? () => goTo(-1) : undefined}
        coverActive={closed}
        onDoodles={hasDoodles ? openDoodles : undefined}
      />

      <HiddenFooter />

      {hasDoodles && <DoodlesSketchbook open={doodlesOpen} onOpen={openDoodles} onClose={closeDoodles} />}

      <MorePanel target={moreTarget} onClose={closeMore} />
    </div>
  );
}
