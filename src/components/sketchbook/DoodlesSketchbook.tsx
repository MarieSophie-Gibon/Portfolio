import { useEffect, useMemo, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { renderDoodles } from '@/components/spreads/DoodlesSpread';
import type { SpreadCtx } from '@/components/spreads/spreadContext';
import type { DeskItem } from '@/types/portfolio';
import { AddStickerButton, StickerLayer, newStickerId } from './DeskItemsLayer';

/* ==================================================================
 * Second carnet : le carnet de croquis « Doodles ».
 * Au repos, il dépasse à peine en bas à droite de l'écran (couverture
 * kraft à spirale) ; au clic, il glisse au centre et s'ouvre.
 * ================================================================== */

const KRAFT = '#B08A5E';
const SKETCH_PAPER = '#F4EFE4';

/** Spirale métallique (anneaux) le long d'un bord. */
function Spiral({ vertical = false, count = 14 }: { vertical?: boolean; count?: number }) {
  return (
    <div className={`pointer-events-none absolute flex justify-around ${vertical ? 'inset-y-[4%] left-1/2 w-6 -translate-x-1/2 flex-col' : 'inset-x-[6%] -top-2.5 h-6'}`}>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`block rounded-full ${vertical ? 'h-2.5 w-7 -ml-0.5' : 'h-6 w-2'}`}
          style={{
            background: vertical
              ? 'linear-gradient(180deg, #F3F1EC 0%, #9A9690 45%, #4A4744 100%)'
              : 'linear-gradient(90deg, #4A4744 0%, #D9D6D0 45%, #6E6A66 100%)',
            boxShadow: '0 2px 3px rgba(0,0,0,0.45)',
          }}
        />
      ))}
    </div>
  );
}

/** Couverture kraft (carnet fermé). */
function Cover() {
  return (
    <div
      className="relative h-full w-full rounded-[6px]"
      style={{
        backgroundColor: KRAFT,
        backgroundImage:
          'var(--tex-paper), radial-gradient(ellipse at 30% 20%, rgba(255,240,210,0.25), transparent 55%), radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(60,35,10,0.35) 100%)',
        backgroundSize: '320px 320px, 100% 100%, 100% 100%',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2), 0 0 0 3px #EFE7D6, 0 0 0 4px rgba(0,0,0,0.15), -14px -10px 30px rgba(10,5,0,0.45)',
      }}
    >
      <Spiral count={12} />
      {/* Élastique noir */}
      <div className="absolute inset-y-0 right-[14%] w-2.5 bg-[#1E1A17] shadow-[2px_0_3px_rgba(0,0,0,0.35)]" />
      {/* Petit croquis à l'encre sur la couverture */}
      <svg viewBox="0 0 120 120" className="absolute left-[16%] top-[18%] w-[34%] opacity-60" aria-hidden="true">
        <g fill="none" stroke="#3A2414" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 90 C30 60 50 40 70 34 C88 30 100 40 96 56 C92 72 70 78 58 70 C48 62 56 48 68 50" />
          <path d="M18 104 C40 98 80 100 104 94" strokeDasharray="4 6" />
          <path d="M84 18 l4 9 10 1 -8 6 3 10 -9 -5 -9 5 3 -10 -8 -6 10 -1 Z" />
        </g>
      </svg>
    </div>
  );
}

/** Page de papier à dessin. */
function SketchPage({ side, children }: { side: 'left' | 'right'; children: ReactNode }) {
  return (
    <div
      className={`relative min-h-0 flex-1 overflow-hidden px-[5%] pb-[4%] pt-[5%] ${side === 'left' ? 'rounded-l-md' : 'rounded-r-md'}`}
      style={{
        backgroundColor: SKETCH_PAPER,
        backgroundImage: `var(--tex-paper), linear-gradient(${side === 'left' ? '270deg' : '90deg'}, rgba(60,40,15,0.16), transparent 12%)`,
        backgroundSize: '320px 320px, 100% 100%',
      }}
    >
      {children}
    </div>
  );
}

interface Props {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function DoodlesSketchbook({ open, onOpen, onClose }: Props) {
  const { content, edit } = useAdmin();
  const spread = content.spreads.find((s) => s.kind === 'doodles');

  const ctx = useMemo<SpreadCtx>(
    () => ({ content, edit, goToArticle: () => {}, openProject: () => {}, copyEmail: () => {}, copied: false }),
    [content, edit],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopImmediatePropagation();
      onClose();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  const editStickers = (fn: (items: DeskItem[]) => void) =>
    edit((c) => {
      const s = c.spreads.find((x) => x.kind === 'doodles');
      if (!s) return;
      s.stickers ??= [];
      fn(s.stickers);
    });

  const parts = renderDoodles(ctx);

  return (
    <>
      {/* Carnet fermé qui dépasse en bas à droite */}
      {!open && (
        <button
          type="button"
          onClick={onOpen}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Ouvrir le carnet de croquis (Doodles)"
          title="Doodles"
          className="group fixed bottom-0 right-0 z-[15] h-[min(320px,42vw)] w-[min(240px,32vw)] translate-x-[22%] translate-y-[78%] -rotate-[10deg] transition-transform duration-300 ease-out hover:translate-y-[66%] hover:-rotate-[8deg] focus-visible:translate-y-[66%]"
        >
          <Cover />
        </button>
      )}

      {/* Carnet ouvert */}
      {open && (
        <div
          className="fixed inset-0 z-[46] flex items-center justify-center bg-[#1A0F08]/55 p-4 backdrop-blur-[2px]"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Carnet de croquis — Doodles"
            onClick={(e) => e.stopPropagation()}
            className="ui-scaled relative flex aspect-[1.44] w-[min(1080px,94vw,calc((100vh_-_60px)*1.44))] animate-[sketch-open_420ms_cubic-bezier(0.22,1,0.36,1)] rounded-md p-[10px] text-ink max-sm:aspect-auto max-sm:h-[86vh] max-sm:flex-col"
            style={{
              backgroundColor: KRAFT,
              backgroundImage: 'var(--tex-paper)',
              backgroundSize: '320px 320px',
              boxShadow: '0 30px 70px -20px rgba(10,5,0,0.75), 0 10px 20px -8px rgba(10,5,0,0.5)',
            }}
          >
            <div className="relative flex min-h-0 flex-1 gap-[3px] max-sm:flex-col max-sm:overflow-y-auto">
              <SketchPage side="left">{parts.left}</SketchPage>
              <SketchPage side="right">{parts.right}</SketchPage>
              <div className="max-sm:hidden">
                <Spiral vertical count={16} />
              </div>
              {spread && <StickerLayer items={spread.stickers ?? []} onEdit={editStickers} className="z-[28]" />}
              {spread && <AddStickerButton onAdd={(item) => editStickers((list) => void list.push({ ...item, id: newStickerId() }))} />}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer le carnet de croquis"
              className="absolute -right-3 -top-3 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-[#F3E9D2] text-[#3A2414] shadow-[0_4px_10px_rgba(10,5,0,0.45)] ring-2 ring-[#B08A5E] transition-transform hover:rotate-90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
