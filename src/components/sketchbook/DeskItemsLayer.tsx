import { useEffect, useRef, useState, type PointerEvent, type ReactNode, type RefObject } from 'react';
import { ArrowUpToLine, ImagePlus, Minus, Plus, RotateCcw, RotateCw, Stamp, Sticker, Trash } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useCanEdit } from '@/components/admin/EditableText';
import { ImagePickerDialog } from '@/components/admin/EditableImage';
import { uid } from '@/lib/contentOps';
import type { DeskItem, DeskItemStyle, DeskPreset } from '@/types/portfolio';
import { DESK_PRESETS } from './DeskBackground';
import { PAPER_COLORS, isPaperPreset } from './PaperStickers';
import { DIE_CUT } from './LogoSticker';

/* ==================================================================
 * Stickers & images positionnables (bureau ET pages du carnet).
 * Mode visiteur : décor figé. Mode édition admin : glisser pour
 * déplacer, clic pour tourner / redimensionner / changer de style.
 * ================================================================== */

const STYLE_LABEL: Record<DeskItemStyle, string> = { sticker: 'Sticker', photo: 'Photo', stamp: 'Timbre', plain: 'Brut' };
const NEXT_STYLE: Record<DeskItemStyle, DeskItemStyle> = { sticker: 'photo', photo: 'stamp', stamp: 'plain', plain: 'sticker' };

/** Stickers prêts qui sont des timbres : remplacer leur image garde le cadre dentelé. */
const isStampPreset = (p?: DeskPreset) => Boolean(p?.startsWith('stamp-'));

/* Dentelure de timbre : encoches rondes sur une bande de 5px tout autour,
 * intérieur plein (2 calques de masque additionnés). */
const STAMP_MASK =
  'radial-gradient(circle 3px at 4px 4px, transparent 96%, #000) -4px -4px / 8px 8px, linear-gradient(#000 0 0) 5px 5px / calc(100% - 10px) calc(100% - 10px) no-repeat';

/** Timbre-poste dentelé autour d'une image perso. */
function StampFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="drop-shadow-[0_6px_8px_rgba(40,20,5,0.35)]">
      <div className="bg-[#FBF5E6] p-[9%] pb-[12%]" style={{ WebkitMask: STAMP_MASK, mask: STAMP_MASK }}>
        <div className="relative">
          <img src={src} alt={alt} draggable={false} className="block aspect-[4/5] w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.25)]" />
        </div>
      </div>
    </div>
  );
}

/** Photo (JPEG) => cadre polaroid ; sinon (PNG, SVG, WebP…) => sticker découpé. */
export function guessStyle(src: string): DeskItemStyle {
  return /^data:image\/jpe?g|\.jpe?g(\?|$)/i.test(src) ? 'photo' : 'sticker';
}

/** Visuel d'un élément selon son type et son style. */
function ItemVisual({ item }: { item: DeskItem }) {
  if (item.kind === 'preset' && item.preset) return <>{DESK_PRESETS[item.preset]?.render(item)}</>;
  if (!item.src) return null;

  if (item.style === 'stamp') return <StampFrame src={item.src} alt={item.alt} />;

  if (item.style === 'photo') {
    return (
      <div className="relative bg-white p-[6%] pb-[16%] rounded-[2px] shadow-[0_12px_24px_-10px_rgba(20,60,80,0.5),0_2px_4px_rgba(20,60,80,0.15)]">
        <img src={item.src} alt={item.alt} draggable={false} className="block w-full h-auto" />
        <div
          className="absolute -top-[6%] left-1/2 -translate-x-1/2 w-[38%] aspect-[4/1] bg-[#FFE27A]/85 rotate-[-4deg]"
          style={{ clipPath: 'polygon(0 10%, 4% 0, 96% 6%, 100% 20%, 97% 90%, 2% 100%)' }}
        />
      </div>
    );
  }
  return (
    <img
      src={item.src}
      alt={item.alt}
      draggable={false}
      className="block w-full h-auto"
      style={{ filter: item.style === 'sticker' ? DIE_CUT : 'drop-shadow(0 8px 12px rgba(20,60,80,0.35))' }}
    />
  );
}

function ToolBtn({ title, onClick, children }: { title: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="h-7 min-w-7 px-1.5 rounded-full flex items-center justify-center text-[11px] font-semibold hover:bg-[#5A3520]/12"
    >
      {children}
    </button>
  );
}

interface ItemProps {
  item: DeskItem;
  z: number;
  k: number;
  canEdit: boolean;
  selected: boolean;
  layerRef: RefObject<HTMLDivElement | null>;
  onSelect: () => void;
  onChange: (patch: Partial<DeskItem>) => void;
  onRemove: () => void;
  onFront: () => void;
}

function ItemView({ item, z, k, canEdit, selected, layerRef, onSelect, onChange, onRemove, onFront }: ItemProps) {
  // Position temporaire pendant le glisser (le contenu n'est modifié qu'au relâchement).
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [replacing, setReplacing] = useState(false);
  const paper = item.kind === 'preset' && isPaperPreset(item.preset) ? item.preset : null;
  const start = useRef<{ px: number; py: number; x0: number; y0: number; w: number; h: number } | null>(null);
  const pos = drag ?? { x: item.x, y: item.y };
  // Barres d'outils alignées vers l'intérieur de l'écran près des bords.
  const align = pos.x > 70 ? 'right-0' : pos.x < 30 ? 'left-0' : 'left-1/2 -translate-x-1/2';

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!canEdit) return;
    e.stopPropagation(); // pas de swipe de page
    onSelect();
    const rect = layerRef.current?.getBoundingClientRect();
    if (!rect) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { px: e.clientX, py: e.clientY, x0: item.x, y0: item.y, w: rect.width, h: rect.height };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s) return;
    setDrag({
      x: Math.min(100, Math.max(0, s.x0 + ((e.clientX - s.px) / s.w) * 100)),
      y: Math.min(100, Math.max(0, s.y0 + ((e.clientY - s.py) / s.h) * 100)),
    });
  };
  const onPointerUp = () => {
    start.current = null;
    if (drag) onChange({ x: Math.round(drag.x * 10) / 10, y: Math.round(drag.y * 10) / 10 });
    setDrag(null);
  };

  return (
    <>
    <div
      data-sticker-item
      className={`absolute ${canEdit ? 'pointer-events-auto cursor-move touch-none' : 'pointer-events-none'}`}
      style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: item.width * k, transform: 'translate(-50%, -50%)', zIndex: selected ? 1000 : z }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={(e) => canEdit && e.stopPropagation()}
    >
      <div
        className={`${canEdit ? 'rounded-sm outline-dashed outline-1 outline-offset-4 outline-transparent hover:outline-[#B8893A]/70' : ''} ${
          selected ? '!outline-[#B8893A] outline-2' : ''
        }`}
        style={{ transform: `rotate(${item.rotate}deg)` }}
      >
        <ItemVisual item={item} />
      </div>

      {canEdit && selected && (
        <div className={`absolute ${align} bottom-full mb-3 flex items-center gap-0.5 rounded-full border border-[#8E6A3E]/40 bg-[#F3E9D2] px-1 py-0.5 text-[#3A2414] shadow-[0_8px_20px_-6px_rgba(30,15,3,0.55)] whitespace-nowrap`}>
          <ToolBtn title="Tourner à gauche" onClick={() => onChange({ rotate: item.rotate - 10 })}>
            <RotateCcw className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Tourner à droite" onClick={() => onChange({ rotate: item.rotate + 10 })}>
            <RotateCw className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Réduire" onClick={() => onChange({ width: Math.max(16, Math.round(item.width * 0.85)) })}>
            <Minus className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Agrandir" onClick={() => onChange({ width: Math.min(900, Math.round(item.width * 1.18)) })}>
            <Plus className="w-3.5 h-3.5" />
          </ToolBtn>
          {!paper && (
            <ToolBtn title={isStampPreset(item.preset) ? "Mettre ma propre image dans ce timbre" : "Remplacer l'image"} onClick={() => setReplacing(true)}>
              <ImagePlus className="w-3.5 h-3.5" />
            </ToolBtn>
          )}
          {item.kind === 'image' && (
            <ToolBtn title="Changer le style" onClick={() => onChange({ style: NEXT_STYLE[item.style] })}>
              {STYLE_LABEL[item.style]}
            </ToolBtn>
          )}
          <ToolBtn title="Mettre au premier plan" onClick={onFront}>
            <ArrowUpToLine className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Supprimer" onClick={onRemove}>
            <Trash className="w-3.5 h-3.5 text-[#8E2F2A]" />
          </ToolBtn>
        </div>
      )}

      {/* Papiers : couleur + texte manuscrit */}
      {canEdit && selected && paper && (
        <div
          className={`absolute ${align} top-full mt-3 w-56 rounded-xl border border-[#8E6A3E]/40 bg-[#F3E9D2] p-2 text-[#3A2414] shadow-[0_8px_20px_-6px_rgba(30,15,3,0.55)]`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-1.5 flex items-center gap-1.5">
            {PAPER_COLORS[paper].map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                aria-label={`Couleur ${c}`}
                onClick={() => onChange({ color: c })}
                className={`h-6 w-6 rounded-full border border-[#3A2414]/25 ${(item.color ?? PAPER_COLORS[paper][0]) === c ? 'ring-2 ring-[#B8893A] ring-offset-1 ring-offset-[#F3E9D2]' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <textarea
            value={item.text ?? ''}
            rows={3}
            placeholder="Écris quelque chose…"
            onChange={(e) => onChange({ text: e.target.value })}
            onKeyDown={(e) => e.stopPropagation()}
            className="w-full resize-none rounded-lg border border-[#8E6A3E]/35 bg-[#FBF5E6] px-2 py-1 text-[15px] leading-tight text-[#3A2414] outline-none placeholder:text-[#A08060] focus:border-[#B8893A]"
            style={{ fontFamily: 'var(--font-hand)' }}
          />
        </div>
      )}
    </div>

      {/* Hors du sticker : les clics dans la fenêtre ne doivent pas déclencher le glisser. */}
      {replacing && (
        <ImagePickerDialog
          value={{ src: item.src ?? '', alt: item.alt }}
          allowRemove={false}
          onClose={() => setReplacing(false)}
          onSave={(img) => {
            if (!img.src) return;
            // Un timbre prêt garde son cadre dentelé ; un autre sticker prêt devient une image.
            const style: DeskItemStyle =
              item.kind === 'image' ? item.style : isStampPreset(item.preset) ? 'stamp' : guessStyle(img.src);
            onChange({ kind: 'image', preset: undefined, src: img.src, alt: img.alt, style });
          }}
        />
      )}
    </>
  );
}

interface StickerLayerProps {
  items: DeskItem[];
  /** Applique une modification à la liste (dans le brouillon). */
  onEdit: (fn: (items: DeskItem[]) => void) => void;
  /** Facteur de taille (1 = largeur stockée telle quelle). */
  k?: number;
  className?: string;
}

/** Calque de stickers éditables. */
export function StickerLayer({ items, onEdit, k = 1, className = '' }: StickerLayerProps) {
  const canEdit = useCanEdit();
  const layerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Clic en dehors d'un sticker = désélection.
  useEffect(() => {
    if (!selectedId) return;
    const onDown = (e: globalThis.PointerEvent) => {
      if (!(e.target as HTMLElement).closest('[data-sticker-item]')) setSelectedId(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [selectedId]);

  const editItem = (id: string, fn: (list: DeskItem[], i: number) => void) =>
    onEdit((list) => {
      const i = list.findIndex((d) => d.id === id);
      if (i >= 0) fn(list, i);
    });

  return (
    <div
      ref={layerRef}
      className={`pointer-events-none absolute inset-0 select-none ${className}`}
      // Élément sélectionné : le calque passe au-dessus du carnet pour que ses outils restent accessibles.
      style={canEdit && selectedId ? { zIndex: 45 } : undefined}
    >
      {items.map((item, i) => (
        <ItemView
          key={item.id}
          item={item}
          z={i + 1}
          k={k}
          canEdit={canEdit}
          selected={canEdit && selectedId === item.id}
          layerRef={layerRef}
          onSelect={() => setSelectedId(item.id)}
          onChange={(patch) => editItem(item.id, (list, idx) => Object.assign(list[idx], patch))}
          onRemove={() => {
            setSelectedId(null);
            editItem(item.id, (list, idx) => void list.splice(idx, 1));
          }}
          onFront={() => editItem(item.id, (list, idx) => void list.push(...list.splice(idx, 1)))}
        />
      ))}
    </div>
  );
}

/** Décor du bureau, derrière le carnet (taille adaptée à l'écran, référence 1440px). */
export function DeskItemsLayer({ viewportW }: { viewportW: number }) {
  const { content, edit } = useAdmin();
  const k = Math.min(1.25, Math.max(0.45, viewportW / 1440));
  return <StickerLayer items={content.deskItems} onEdit={(fn) => edit((c) => fn(c.deskItems))} k={k} className="z-0" />;
}

/* ------------------------------------------------------------------ */
/* Bouton « + Sticker » sur la double-page active (mode édition)       */
/* ------------------------------------------------------------------ */

export function AddStickerButton({ onAdd }: { onAdd: (item: Omit<DeskItem, 'id'>) => void }) {
  const canEdit = useCanEdit();
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState<false | 'image' | 'stamp'>(false);
  if (!canEdit) return null;

  const base = { x: 50 + (Math.random() * 20 - 10), y: 45 + (Math.random() * 20 - 10), rotate: Math.round(Math.random() * 16 - 8) };
  const addPreset = (p: DeskPreset) => {
    onAdd({ ...base, kind: 'preset', preset: p, alt: '', width: DESK_PRESETS[p].width * 1.2, style: 'plain' });
    setOpen(false);
  };

  return (
    <div
      className="absolute bottom-2 left-1/2 z-[29] -translate-x-1/2"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {open && (
        <div className="absolute bottom-full left-1/2 mb-2 w-64 -translate-x-1/2 rounded-2xl border border-[#8E6A3E]/40 bg-[#F3E9D2] p-2.5 text-[#3A2414] shadow-[0_12px_28px_-8px_rgba(30,15,3,0.6)]">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setPicking('image');
            }}
            className="mb-1.5 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(180deg,#F2D58C_0%,#D8B36A_45%,#B8893A_100%)] py-2 text-xs font-semibold text-[#2A1A0E] hover:brightness-105"
          >
            <ImagePlus className="w-3.5 h-3.5" /> Importer une image
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setPicking('stamp');
            }}
            className="mb-2 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#5A3520]/15 py-2 text-xs font-semibold hover:bg-[#5A3520]/20"
          >
            <Stamp className="w-3.5 h-3.5" /> Timbre avec mon image
          </button>
          <p className="mb-1.5 font-mono text-[9px] tracking-widest text-[#8A6A48] uppercase">Stickers prêts</p>
          <div className="grid grid-cols-5 gap-1.5">
            {(Object.keys(DESK_PRESETS) as DeskPreset[]).map((p) => (
              <button
                key={p}
                type="button"
                title={DESK_PRESETS[p].label}
                onClick={() => addPreset(p)}
                className="flex aspect-square items-center justify-center rounded-lg bg-[#5A3520]/10 p-1.5 hover:bg-[#5A3520]/20"
              >
                <span className="w-full max-w-8">{DESK_PRESETS[p].render()}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full bg-[linear-gradient(180deg,#F2D58C_0%,#D8B36A_45%,#B8893A_100%)] px-3 py-1 font-mono text-[10px] font-bold text-[#2A1A0E] shadow-[0_2px_0_#7A5622,0_6px_12px_-6px_rgba(30,15,3,0.6)] hover:brightness-105"
      >
        <Sticker className="w-3 h-3" /> {open ? 'Fermer' : '+ Sticker'}
      </button>

      {picking && (
        <ImagePickerDialog
          value={{ src: '', alt: '' }}
          allowRemove={false}
          onClose={() => setPicking(false)}
          onSave={(img) =>
            img.src &&
            onAdd(
              picking === 'stamp'
                ? { ...base, kind: 'image', src: img.src, alt: img.alt, width: 96, style: 'stamp' }
                : { ...base, kind: 'image', src: img.src, alt: img.alt, width: 150, style: guessStyle(img.src) },
            )
          }
        />
      )}
    </div>
  );
}

export const newStickerId = () => uid('stk');
