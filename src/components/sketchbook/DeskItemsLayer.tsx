import { useEffect, useRef, useState, type PointerEvent, type ReactNode, type RefObject } from 'react';
import { ArrowUpToLine, ImagePlus, Minus, Plus, RotateCcw, RotateCw, Sticker, Trash } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useCanEdit } from '@/components/admin/EditableText';
import { ImagePickerDialog } from '@/components/admin/EditableImage';
import { uid } from '@/lib/contentOps';
import type { DeskItem, DeskItemStyle, DeskPreset } from '@/types/portfolio';
import { DESK_PRESETS } from './DeskBackground';
import { DIE_CUT } from './LogoSticker';

/* ==================================================================
 * Stickers & images positionnables (bureau ET pages du carnet).
 * Mode visiteur : décor figé. Mode édition admin : glisser pour
 * déplacer, clic pour tourner / redimensionner / changer de style.
 * ================================================================== */

const STYLE_LABEL: Record<DeskItemStyle, string> = { sticker: 'Sticker', photo: 'Photo', plain: 'Brut' };
const NEXT_STYLE: Record<DeskItemStyle, DeskItemStyle> = { sticker: 'photo', photo: 'plain', plain: 'sticker' };

/** Photo (JPEG) => cadre polaroid ; sinon (PNG, SVG, WebP…) => sticker découpé. */
export function guessStyle(src: string): DeskItemStyle {
  return /^data:image\/jpe?g|\.jpe?g(\?|$)/i.test(src) ? 'photo' : 'sticker';
}

/** Visuel d'un élément selon son type et son style. */
function ItemVisual({ item }: { item: DeskItem }) {
  if (item.kind === 'preset' && item.preset) return <>{DESK_PRESETS[item.preset]?.render()}</>;
  if (!item.src) return null;

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
      className="h-7 min-w-7 px-1.5 rounded-full flex items-center justify-center text-[11px] font-semibold hover:bg-white/15"
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
  const start = useRef<{ px: number; py: number; x0: number; y0: number; w: number; h: number } | null>(null);
  const pos = drag ?? { x: item.x, y: item.y };

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
        className={`${canEdit ? 'rounded-sm outline-dashed outline-1 outline-offset-4 outline-transparent hover:outline-magenta/60' : ''} ${
          selected ? '!outline-magenta outline-2' : ''
        }`}
        style={{ transform: `rotate(${item.rotate}deg)` }}
      >
        <ItemVisual item={item} />
      </div>

      {canEdit && selected && (
        <div className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 flex items-center gap-0.5 rounded-full bg-ink/95 px-1 py-0.5 text-white shadow-xl whitespace-nowrap">
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
          {item.kind === 'image' && (
            <ToolBtn title="Changer le style" onClick={() => onChange({ style: NEXT_STYLE[item.style] })}>
              {STYLE_LABEL[item.style]}
            </ToolBtn>
          )}
          <ToolBtn title="Mettre au premier plan" onClick={onFront}>
            <ArrowUpToLine className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Supprimer" onClick={onRemove}>
            <Trash className="w-3.5 h-3.5 text-magenta" />
          </ToolBtn>
        </div>
      )}
    </div>
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
    <div ref={layerRef} className={`pointer-events-none absolute inset-0 select-none ${className}`}>
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
  const [picking, setPicking] = useState(false);
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
        <div className="absolute bottom-full left-1/2 mb-2 w-64 -translate-x-1/2 rounded-2xl bg-ink/95 p-2.5 text-white shadow-2xl">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setPicking(true);
            }}
            className="mb-2 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-magenta py-2 text-xs font-semibold hover:brightness-110"
          >
            <ImagePlus className="w-3.5 h-3.5" /> Importer une image
          </button>
          <p className="mb-1.5 font-mono text-[9px] tracking-widest text-white/50 uppercase">Stickers prêts</p>
          <div className="grid grid-cols-5 gap-1.5">
            {(Object.keys(DESK_PRESETS) as DeskPreset[]).map((p) => (
              <button
                key={p}
                type="button"
                title={DESK_PRESETS[p].label}
                onClick={() => addPreset(p)}
                className="flex aspect-square items-center justify-center rounded-lg bg-white/10 p-1.5 hover:bg-white/25"
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
        className="inline-flex items-center gap-1 rounded-full bg-magenta px-3 py-1 font-mono text-[10px] font-bold text-white shadow-lg hover:brightness-110"
      >
        <Sticker className="w-3 h-3" /> {open ? 'Fermer' : '+ Sticker'}
      </button>

      {picking && (
        <ImagePickerDialog
          value={{ src: '', alt: '' }}
          allowRemove={false}
          onClose={() => setPicking(false)}
          onSave={(img) => img.src && onAdd({ ...base, kind: 'image', src: img.src, alt: img.alt, width: 150, style: guessStyle(img.src) })}
        />
      )}
    </div>
  );
}

export const newStickerId = () => uid('stk');
