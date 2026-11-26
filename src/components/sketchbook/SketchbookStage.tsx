import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PENCIL_COLORS } from '@/data/defaultData';
import { useSketchStrokes } from '@/lib/useSketchStrokes';
import { useAdmin } from '@/context/AdminContext';
import { EditScope } from '@/components/admin/EditableText';
import { ADMIN_BAR_H } from '@/components/admin/AdminTopBar';
import { renderSpreadParts } from '@/components/spreads/renderSpreadParts';
import { ActiveSpreadContext, type SpreadCtx } from '@/components/spreads/spreadContext';
import type { DeskItem, SketchStroke, Spread } from '@/types/portfolio';
import { BOOK_H, BOOK_W, SpreadBase } from './SpreadBase';
import { SpreadSketchCanvas } from './SpreadSketchCanvas';
import { FLIP_MS, PageTurnOverlay3D, type FlipDir, type FlipState } from './PageTurnOverlay3D';
import { DieCutTabs } from './DieCutTabs';
import { TopNav } from './TopNav';
import { DrawButton } from './DrawButton';
import { LogoSticker } from './LogoSticker';
import { BookCover } from './BookCover';
import { MorePanel, type MoreTarget } from './MorePanel';
import { AddStickerButton, DeskItemsLayer, StickerLayer, newStickerId } from './DeskItemsLayer';

/* ------------------------------------------------------------------ */
/* Mise en page                                                        */
/* ------------------------------------------------------------------ */

const HEADER_H = 40; // simple marge haute (plus de titre) : laisse la place au logo et au menu
const DOCK_H = 22; // marge basse (plus de dock : le bouton Dessiner flotte en bas à droite)
const TABS_H = 40;

/* Éventail : décalage, échelle, ombrage et z-index par profondeur (1..4). */
const FAN = {
  offset: [0, 124, 234, 328, 404],
  scale: [1, 0.935, 0.875, 0.818, 0.765],
  shade: [0, 0.04, 0.08, 0.12, 0.16],
  z: [30, 22, 16, 10, 5],
};
const FAN_DEPTH = 4;
const HOVER_NUDGE = 22;

const EMPTY_STROKES: SketchStroke[] = [];
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

/** Échelle du carnet + amplitude de l'éventail selon la taille d'écran. */
function computeLayout(w: number, h: number) {
  const availH = h - HEADER_H - DOCK_H - TABS_H - 6;
  const mobile = w < 640;
  const scale = Math.max(
    0.2,
    mobile ? Math.min((w - 24) / BOOK_W, availH / BOOK_H) : Math.min(availH / BOOK_H, (w * 0.72) / BOOK_W, 2.2),
  );
  const sideSpace = (w / scale - BOOK_W) / 2 - 24;
  const fanFactor = mobile ? 0.08 : clamp(sideSpace / FAN.offset[FAN_DEPTH], 0.2, 1.06);
  return { scale, fanFactor };
}

/* ------------------------------------------------------------------ */
/* Double-page mémoïsée : ne se re-rend que si SES props changent       */
/* (pas au survol de l'éventail, ni au début / à la fin d'un flip).     */
/* ------------------------------------------------------------------ */

interface SpreadViewProps {
  spread: Spread;
  index: number;
  count: number;
  /** Double-page active (interactive). false pour l'éventail et les copies du flip. */
  isActive: boolean;
  editing: boolean;
  pencilOn: boolean;
  pencilColor: string;
  eraser: boolean;
  strokes: SketchStroke[];
  alias: string;
  ctx: SpreadCtx;
  onPrev: () => void;
  onNext: () => void;
  addStroke: (spreadId: string, stroke: SketchStroke) => void;
  onMore: (spreadId: string) => void;
}

const SpreadView = memo(function SpreadView({
  spread,
  index,
  count,
  isActive,
  editing,
  pencilOn,
  pencilColor,
  eraser,
  strokes,
  alias,
  ctx,
  onPrev,
  onNext,
  addStroke,
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
    <EditScope.Provider value={isActive && !pencilOn}>
      <div className="relative w-full h-full">
        <SpreadBase
          spread={spread}
          alias={alias}
          parts={renderSpreadParts(spread, ctx)}
          // En mode édition, un clic sur la page sert à éditer, pas à tourner.
          interactive={isActive && !pencilOn && !editing}
          ribbon={isActive}
          canPrev={index > 0}
          canNext={index < count - 1}
          onPrev={onPrev}
          onNext={onNext}
          onMore={isActive ? () => onMore(spread.id) : undefined}
        />
        {/* Stickers collés sur la double-page (tournent avec elle) */}
        <StickerLayer items={spread.stickers ?? NO_STICKERS} onEdit={editStickers} className="z-[28]" />
        {isActive && (
          <AddStickerButton onAdd={(item) => editStickers((list) => void list.push({ ...item, id: newStickerId() }))} />
        )}
        {(isActive || strokes.length > 0) && (
          <SpreadSketchCanvas
            strokes={strokes}
            enabled={isActive && pencilOn}
            color={pencilColor}
            eraser={eraser}
            onAddStroke={(s) => addStroke(spread.id, s)}
          />
        )}
      </div>
    </EditScope.Provider>
    </ActiveSpreadContext.Provider>
  );
});

/* ------------------------------------------------------------------ */
/* Flèche latérale (page précédente / suivante)                        */
/* ------------------------------------------------------------------ */

function SideArrow({ dir, offset, disabled, onClick }: { dir: FlipDir; offset: number; disabled: boolean; onClick: () => void }) {
  const prev = dir === 'prev';
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      disabled={disabled}
      aria-label={prev ? 'Double-page précédente' : 'Double-page suivante'}
      title={prev ? 'Précédente (←)' : 'Suivante (→)'}
      className="group absolute top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink/30 transition-all duration-300 hover:bg-white/40 hover:text-ink/80 active:scale-95 disabled:pointer-events-none disabled:opacity-0"
      style={prev ? { right: `calc(100% + ${offset}px - 18px)` } : { left: `calc(100% + ${offset}px - 18px)` }}
    >
      {/* Flèche tracée « à la main » */}
      <svg viewBox="0 0 32 32" className={`h-5 w-5 transition-transform duration-300 ${prev ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'}`} fill="none">
        <path d="M5 16.5 C11 15.6 18 16.4 25 15.8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M18.5 9.5 C21 12 23.5 14 26 15.8 C23.2 17.6 20.8 19.8 18.8 22.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Scène                                                               */
/* ------------------------------------------------------------------ */

const DRAWER_W = 420;

export function SketchbookStage() {
  const { content, edit, isAdmin, editMode, drawerOpen, focusRequest, openLogin } = useAdmin();
  const { spreads, author, settings } = content;
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
  const openSpreadSheet = useCallback((spreadId: string) => setMoreTarget({ spreadId }), []);
  const closeMore = useCallback(() => setMoreTarget(null), []);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [swipeHint, setSwipeHint] = useState<FlipDir | null>(null);

  const [pencilOn, setPencilOn] = useState(false);
  const [pencilColor, setPencilColor] = useState<string>(PENCIL_COLORS[0].hex);
  const [eraser, setEraser] = useState(false);
  const { strokes, addStroke, clearStrokes } = useSketchStrokes();

  const { w, h } = useViewport();
  // Barre admin en haut + tiroir à droite (sur grand écran) réduisent l'espace du carnet.
  const topInset = isAdmin ? ADMIN_BAR_H : 0;
  const rightInset = isAdmin && drawerOpen && w >= 900 ? DRAWER_W : 0;
  const { scale, fanFactor } = computeLayout(w - rightInset, h - topInset);
  // Distance entre le bord du carnet et le centre des flèches latérales.
  const sideRoom = ((w - rightInset) - BOOK_W * scale) / 2;
  // Assez de place : flèches à côté du carnet ; sinon (mobile) posées sur ses bords.
  const arrowOffset = sideRoom > 60 ? clamp(sideRoom * 0.35, 22, 64) : -26;
  // Même facteur d'échelle pour les feuilles volantes (.ui-scaled) : tailles de texte identiques partout.
  useEffect(() => {
    document.documentElement.style.setProperty('--ui-scale', String(clamp(scale, 1, 1.6)));
  }, [scale]);

  const modalOpenRef = useRef(false);
  modalOpenRef.current = moreTarget !== null; // pas de navigation sous la feuille volante
  const pencilRef = useRef(false);
  pencilRef.current = pencilOn;
  const editingRef = useRef(false);
  editingRef.current = editing;

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

      window.clearTimeout(flipTimer.current);
      if (prefersReducedMotion()) {
        setFlip(null);
        return;
      }
      setFlip({ from, to, dir: to > from ? 'next' : 'prev', key: Date.now() });
      flipTimer.current = window.setTimeout(() => setFlip(null), FLIP_MS + 40); // marge : laisse la dernière frame se peindre
    },
    [count, minIndex],
  );

  useEffect(() => () => window.clearTimeout(flipTimer.current), []);

  // Le tiroir admin demande d'afficher une page précise.
  useEffect(() => {
    if (!focusRequest) return;
    const i = spreads.findIndex((s) => s.id === focusRequest.spreadId);
    if (i >= 0) goTo(i);
  }, [focusRequest]); // uniquement à chaque nouvelle demande

  // Un clic qui termine un swipe ne doit pas aussi tourner la page.
  const suppressClick = useRef(false);
  const clickPrev = useCallback(() => void (!suppressClick.current && goTo(activeRef.current - 1)), [goTo]);
  const clickNext = useCallback(() => void (!suppressClick.current && goTo(activeRef.current + 1)), [goTo]);

  // Clavier ← / →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (modalOpenRef.current) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(activeRef.current + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(activeRef.current - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo]);

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
        goTo(activeRef.current + Math.sign(acc));
        acc = 0;
        locked = true;
        lockedAt = now;
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [goTo]);

  // Swipe tactile / glisser à la souris
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: PointerEvent) => {
    if (modalOpenRef.current || pencilRef.current) return;
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
      goTo(activeRef.current + (dx < 0 ? 1 : -1));
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

  const togglePencil = () => {
    setPencilOn((on) => {
      setToast(on ? 'Mode navigation' : 'Mode Apple Pencil — dessine sur la double-page !');
      return !on;
    });
  };

  const activeSpread = spreads[safeIndex];
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
        <EditScope.Provider value={live && !pencilOn}>
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
        count={count}
        isActive={!isClone && index === safeIndex}
        editing={editing}
        pencilOn={pencilOn}
        pencilColor={pencilColor}
        eraser={eraser}
        strokes={strokes[spread.id] ?? EMPTY_STROKES}
        alias={author.alias}
        ctx={ctx}
        onPrev={clickPrev}
        onNext={clickNext}
        addStroke={addStroke}
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
        <div className="pointer-events-auto relative" style={{ width: BOOK_W * scale, height: BOOK_H * scale, marginTop: TABS_H }}>
          <div
            className="absolute left-0 top-0 origin-top-left transition-transform duration-[620ms] ease-[cubic-bezier(0.45,0.05,0.25,1)]"
            // Fermé : on décale d'un quart pour centrer la couverture (moitié droite) sur le bureau.
            style={{ width: BOOK_W, height: BOOK_H, transform: `scale(${scale}) translateX(${closed ? -BOOK_W / 4 : 0}px)` }}
          >
            {/* Ombre portée sur le bureau */}
            <div
              className="pointer-events-none absolute -bottom-8 left-[-16%] right-[-16%] h-16 rounded-full blur-2xl"
              style={{ background: 'rgba(20,60,80,0.35)' }}
            />

            <DieCutTabs spreads={spreads} activeIndex={safeIndex} onSelect={goTo} />

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

          {/* Flèches de part et d'autre du carnet (hors de l'échelle : taille constante) */}
          <SideArrow dir="prev" offset={arrowOffset} disabled={safeIndex === minIndex} onClick={() => goTo(activeRef.current - 1)} />
          <SideArrow dir="next" offset={arrowOffset} disabled={safeIndex === count - 1} onClick={() => goTo(activeRef.current + 1)} />
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
      />

      <DrawButton
        on={pencilOn}
        color={pencilColor}
        eraser={eraser}
        toggle={togglePencil}
        setColor={setPencilColor}
        setEraser={setEraser}
        clear={() => {
          if (activeSpread) clearStrokes(activeSpread.id);
          setToast('Annotations effacées sur cette double-page');
        }}
      />

      <MorePanel target={moreTarget} onClose={closeMore} />
    </div>
  );
}
