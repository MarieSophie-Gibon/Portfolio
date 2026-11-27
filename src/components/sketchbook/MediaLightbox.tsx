import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import type { ImageAsset } from '@/types/portfolio';

const FADE_MS = 220;
const SWIPE_PX = 50;

interface Props {
  items: ImageAsset[];
  /** Index affiché ; null = fermé. */
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}

/** Carrousel plein écran pour photos et vidéos (clavier ← → Échap, swipe, miniatures). */
export function MediaLightbox({ items, index, onIndex, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const swipeX = useRef<number | null>(null);
  const open = index !== null && items.length > 0;
  const count = items.length;
  const current = open ? Math.min(index, count - 1) : 0;

  const go = (delta: number) => {
    if (count > 1) onIndex((current + delta + count) % count);
  };

  // Apparition en fondu
  useEffect(() => {
    if (!open) return setVisible(false);
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Clavier : écouté en capture pour passer avant la feuille (Échap) et la scène (← →).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else return;
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  });

  if (!open) return null;
  const item = items[current];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.alt || 'Média'}
      className="fixed inset-0 z-[70] flex flex-col bg-[#0d0e12]/92 backdrop-blur-md text-white transition-opacity select-none"
      style={{ opacity: visible ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
      onPointerDown={(e) => {
        e.stopPropagation();
        // Pas de swipe depuis une vidéo : on y glisse pour avancer dans la timeline.
        swipeX.current = (e.target as HTMLElement).tagName === 'VIDEO' ? null : e.clientX;
      }}
      onPointerUp={(e) => {
        if (swipeX.current === null) return;
        const dx = e.clientX - swipeX.current;
        swipeX.current = null;
        if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Barre du haut */}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="font-mono text-xs tracking-[0.3em] text-white/60">
          {String(current + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 hover:rotate-90"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Média */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {item.type === 'video' ? (
          <video
            key={item.src}
            src={item.src}
            aria-label={item.alt}
            controls
            autoPlay
            playsInline
            className="max-h-full max-w-full rounded-md shadow-2xl"
          />
        ) : (
          <img
            key={item.src}
            src={item.src}
            alt={item.alt}
            draggable={false}
            className="max-h-full max-w-full rounded-md object-contain shadow-2xl animate-[lightbox-in_240ms_ease-out]"
          />
        )}

        {count > 1 && (
          <>
            <NavButton side="left" onClick={() => go(-1)} />
            <NavButton side="right" onClick={() => go(1)} />
          </>
        )}
      </div>

      {/* Légende + miniatures */}
      <div className="flex flex-col items-center gap-3 px-4 pt-3 pb-5">
        <p className="t-hand min-h-[1.5em] text-center text-white/85" style={{ fontSize: 18 }}>
          {item.caption}
        </p>
        {count > 1 && (
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {items.map((it, i) => (
              <button
                key={`${i}-${it.src.slice(-20)}`}
                type="button"
                onClick={() => onIndex(i)}
                aria-label={`Média ${i + 1}`}
                aria-current={i === current}
                className={`relative h-12 w-16 shrink-0 overflow-hidden rounded transition ${
                  i === current ? 'ring-2 ring-white opacity-100' : 'opacity-45 hover:opacity-80'
                }`}
              >
                {it.type === 'video' ? (
                  <>
                    <video src={it.src} muted preload="metadata" className="h-full w-full object-cover" />
                    <Play className="absolute inset-0 m-auto h-4 w-4 fill-white" />
                  </>
                ) : (
                  <img src={it.src} alt="" draggable={false} className="h-full w-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

function NavButton({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClick}
      aria-label={side === 'left' ? 'Précédent' : 'Suivant'}
      className={`absolute top-1/2 ${side === 'left' ? 'left-3 sm:left-6' : 'right-3 sm:right-6'} flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/25`}
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}
