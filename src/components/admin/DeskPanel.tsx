import { useState } from 'react';
import { ImagePlus, Move, Trash } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { DESK_PRESETS } from '@/components/sketchbook/DeskBackground';
import { guessStyle } from '@/components/sketchbook/DeskItemsLayer';
import { uid } from '@/lib/contentOps';
import type { DeskItem, DeskPreset } from '@/types/portfolio';
import { ImagePickerDialog } from './EditableImage';
import { Section } from './formFields';

/** Position de départ : sur les bords, là où le carnet ne cache rien. */
function spawnPosition(n: number) {
  const left = n % 2 === 0;
  return { x: left ? 6 + Math.random() * 8 : 86 + Math.random() * 8, y: 25 + Math.random() * 50 };
}


/** Onglet « Décor » : ajouter des images / photos / stickers autour du carnet. */
export function DeskPanel() {
  const { content, edit, editMode, setEditMode } = useAdmin();
  const [picking, setPicking] = useState(false);
  const items = content.deskItems;

  const add = (item: Omit<DeskItem, 'id' | 'x' | 'y' | 'rotate'>) =>
    edit((c) =>
      void c.deskItems.push({
        ...item,
        id: uid('desk'),
        ...spawnPosition(c.deskItems.length),
        rotate: Math.round(Math.random() * 16 - 8),
      }),
    );

  return (
    <div className="space-y-4">
      {!editMode && (
        <button
          type="button"
          onClick={() => setEditMode(true)}
          className="w-full rounded-xl border border-hazard/40 bg-hazard/10 px-3 py-2 text-left text-xs text-hazard"
        >
          Le mode édition est désactivé : clique ici pour pouvoir déplacer les éléments sur le bureau.
        </button>
      )}

      <button
        type="button"
        onClick={() => setPicking(true)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-magenta py-2.5 font-semibold hover:brightness-110"
      >
        <ImagePlus className="w-4 h-4" /> Ajouter une image ou une photo
      </button>
      <p className="-mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-zinc-500">
        <Move className="mt-0.5 w-3.5 h-3.5 shrink-0" />
        Fais glisser les éléments directement sur le bureau. Clique sur un élément pour le tourner, le redimensionner, changer son style (sticker,
        photo, brut) ou le supprimer. Astuce : un PNG détouré rend très bien en « sticker ».
      </p>

      <Section title="Stickers prêts à l'emploi">
        <div className="grid grid-cols-5 gap-2">
          {(Object.keys(DESK_PRESETS) as DeskPreset[]).map((p) => (
            <button
              key={p}
              type="button"
              title={DESK_PRESETS[p].label}
              aria-label={`Ajouter : ${DESK_PRESETS[p].label}`}
              onClick={() => add({ kind: 'preset', preset: p, alt: '', width: DESK_PRESETS[p].width, style: 'plain' })}
              className="flex aspect-square items-center justify-center rounded-lg bg-[#83C5D6] p-2 hover:ring-2 hover:ring-magenta"
            >
              <div className="w-full max-w-10">{DESK_PRESETS[p].render()}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title={`Sur le bureau (${items.length})`}>
        {items.length === 0 && <p className="text-xs text-zinc-500">Aucun élément pour l'instant.</p>}
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li key={it.id} className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-2 py-1.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded bg-[#83C5D6] p-1">
                {it.kind === 'image' && it.src ? (
                  <img src={it.src} alt="" className="max-h-full max-w-full object-contain" />
                ) : it.preset ? (
                  <span className="w-full">{DESK_PRESETS[it.preset]?.render()}</span>
                ) : null}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">
                {it.kind === 'preset' && it.preset ? DESK_PRESETS[it.preset]?.label : it.alt || `Image ${i + 1}`}
                <span className="ml-1.5 font-mono text-[10px] text-zinc-500">{it.kind === 'image' ? it.style : 'sticker'}</span>
              </span>
              <button
                type="button"
                aria-label="Supprimer"
                onClick={() => edit((c) => void c.deskItems.splice(i, 1))}
                className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:bg-magenta hover:text-white"
              >
                <Trash className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </Section>

      {picking && (
        <ImagePickerDialog
          value={{ src: '', alt: '' }}
          allowRemove={false}
          onClose={() => setPicking(false)}
          onSave={(img) => img.src && add({ kind: 'image', src: img.src, alt: img.alt, width: 180, style: guessStyle(img.src) })}
        />
      )}
    </div>
  );
}
