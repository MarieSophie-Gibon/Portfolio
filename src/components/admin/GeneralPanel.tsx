import { useState } from 'react';
import { Check, ImagePlus, Layers, Move, Stamp, Trash } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { BACKGROUNDS, BackgroundSwatch, DESK_PRESETS } from '@/components/sketchbook/DeskBackground';
import { guessStyle } from '@/components/sketchbook/DeskItemsLayer';
import { PAPER_PRESETS } from '@/components/sketchbook/PaperStickers';
import { uid } from '@/lib/contentOps';
import type { BackgroundPreset, DeskItem, DeskPreset } from '@/types/portfolio';
import { ImagePickerDialog } from './EditableImage';
import { Checkbox, Field, Section, btnPrimary, btnSecondary } from './formFields';

type ColorPreset = Exclude<BackgroundPreset, 'image'>;
type NewItem = Omit<DeskItem, 'id' | 'x' | 'y' | 'rotate'> & Partial<Pick<DeskItem, 'x' | 'y' | 'rotate'>>;

/** Position de départ : sur les bords, là où le carnet ne cache rien. */
function spawnPosition(n: number) {
  const left = n % 2 === 0;
  return { x: left ? 7 + Math.random() * 8 : 85 + Math.random() * 8, y: 25 + Math.random() * 50 };
}

/** Arrangement de papiers d'ambiance (tous modifiables ensuite). */
const PAPER_KIT: NewItem[] = [
  { kind: 'preset', preset: 'paper-parchment', alt: '', width: 420, x: 9, y: 30, rotate: -10, style: 'plain' },
  { kind: 'preset', preset: 'paper-ruled', alt: '', width: 250, x: 13, y: 66, rotate: 6, style: 'plain' },
  { kind: 'preset', preset: 'postit', alt: '', width: 130, x: 17, y: 42, rotate: -7, style: 'plain' },
  { kind: 'preset', preset: 'paper-torn', alt: '', width: 260, x: 90, y: 20, rotate: 8, style: 'plain' },
  { kind: 'preset', preset: 'paper-ruled', alt: '', width: 270, x: 91, y: 72, rotate: -9, style: 'plain', color: '#EDE3CF' },
  { kind: 'preset', preset: 'postit', alt: '', width: 115, x: 85, y: 40, rotate: 9, style: 'plain', color: '#E9B8B0' },
  { kind: 'preset', preset: 'postit', alt: '', width: 100, x: 80, y: 82, rotate: -4, style: 'plain', color: '#BFD3B0' },
];

const tile =
  'flex aspect-square items-center justify-center rounded-md border border-[#8E6A3E]/30 bg-[#E9DCC0] p-2 transition hover:border-[#B8893A] hover:bg-[#F3E9D2]';

/** Onglet « Général » : fond du bureau + décor posé autour du carnet. */
export function GeneralPanel() {
  const { content, edit, editMode, setEditMode } = useAdmin();
  const [picking, setPicking] = useState<false | 'bg' | 'image' | 'stamp'>(false);
  const bg = content.settings.background;
  const items = content.deskItems;
  const otherPresets = (Object.keys(DESK_PRESETS) as DeskPreset[]).filter((p) => !(PAPER_PRESETS as string[]).includes(p));

  const add = (...list: NewItem[]) =>
    edit((c) => {
      for (const item of list) {
        c.deskItems.push({
          ...spawnPosition(c.deskItems.length),
          rotate: Math.round(Math.random() * 16 - 8),
          ...item,
          id: uid('desk'),
        });
      }
    });

  return (
    <div className="space-y-4">
      {!editMode && (
        <button type="button" onClick={() => setEditMode(true)} className={`${btnSecondary} w-full justify-start text-left text-xs`}>
          Le mode édition est désactivé : clique ici pour pouvoir déplacer les éléments sur le bureau.
        </button>
      )}

      {/* ---------------- Fond ---------------- */}
      <Section title="Fond du bureau">
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(BACKGROUNDS) as ColorPreset[]).map((p) => {
            const active = bg.preset === p;
            return (
              <button
                key={p}
                type="button"
                title={BACKGROUNDS[p].label}
                aria-pressed={active}
                onClick={() => edit((c) => void (c.settings.background.preset = p))}
                className={`relative overflow-hidden rounded-md text-left ring-2 transition ${active ? 'ring-[#B8893A]' : 'ring-[#8E6A3E]/20 hover:ring-[#8E6A3E]/50'}`}
              >
                <span className="block h-12">
                  <BackgroundSwatch preset={p} />
                </span>
                <span className="block truncate bg-[#3B2416]/80 px-1.5 py-0.5 text-[10px] text-[#F3E6C8]">{BACKGROUNDS[p].label}</span>
                {active && <Check className="absolute right-1 top-1 h-3.5 w-3.5 rounded-full bg-[#8E2F2A] p-0.5 text-[#F7E7C6]" />}
              </button>
            );
          })}
          <button
            type="button"
            title="Ma propre image"
            aria-pressed={bg.preset === 'image'}
            onClick={() => (bg.image.src ? edit((c) => void (c.settings.background.preset = 'image')) : setPicking('bg'))}
            className={`relative overflow-hidden rounded-md text-left ring-2 transition ${bg.preset === 'image' ? 'ring-[#B8893A]' : 'ring-[#8E6A3E]/20 hover:ring-[#8E6A3E]/50'}`}
          >
            <span
              className="flex h-12 items-center justify-center bg-[#E9DCC0] bg-cover bg-center text-[#6B4A2B]"
              style={bg.image.src ? { backgroundImage: `url("${bg.image.src}")` } : undefined}
            >
              {!bg.image.src && <ImagePlus className="h-4 w-4" />}
            </span>
            <span className="block truncate bg-[#3B2416]/80 px-1.5 py-0.5 text-[10px] text-[#F3E6C8]">Mon image</span>
            {bg.preset === 'image' && <Check className="absolute right-1 top-1 h-3.5 w-3.5 rounded-full bg-[#8E2F2A] p-0.5 text-[#F7E7C6]" />}
          </button>
        </div>

        {bg.image.src && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setPicking('bg')} className={btnSecondary}>
              Changer l'image
            </button>
            <button
              type="button"
              onClick={() =>
                edit((c) => {
                  c.settings.background.image = { src: '', alt: '' };
                  if (c.settings.background.preset === 'image') c.settings.background.preset = 'neutral';
                })
              }
              className={btnSecondary}
            >
              Retirer l'image
            </button>
          </div>
        )}

        {bg.preset === 'image' && bg.image.src && (
          <div className="grid grid-cols-2 gap-3">
            <Field label={`Assombrir · ${Math.round((bg.imageDim ?? 0.15) * 100)} %`}>
              <input
                type="range"
                min={0}
                max={0.7}
                step={0.05}
                value={bg.imageDim ?? 0.15}
                onChange={(e) => edit((c) => void (c.settings.background.imageDim = Number(e.target.value)))}
                className="mt-1 w-full accent-[#8E2F2A]"
              />
            </Field>
            <Field label={`Flou · ${bg.imageBlur ?? 0} px`}>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={bg.imageBlur ?? 0}
                onChange={(e) => edit((c) => void (c.settings.background.imageBlur = Number(e.target.value)))}
                className="mt-1 w-full accent-[#8E2F2A]"
              />
            </Field>
          </div>
        )}

        <Checkbox checked={bg.grid} onChange={(v) => edit((c) => void (c.settings.background.grid = v))}>
          Quadrillage léger
        </Checkbox>
        <p className="text-[11px] text-[#8A6A48]">
          Photo : choisis une image large (1920 px ou plus). Un léger flou (2–4 px) donne de la profondeur et fait ressortir le carnet.
        </p>
      </Section>

      {/* ---------------- Papiers ---------------- */}
      <Section title="Papiers & post-it">
        <div className="grid grid-cols-4 gap-2">
          {PAPER_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              title={DESK_PRESETS[p].label}
              aria-label={`Ajouter : ${DESK_PRESETS[p].label}`}
              onClick={() => add({ kind: 'preset', preset: p, alt: '', width: DESK_PRESETS[p].width, style: 'plain' })}
              className={tile}
            >
              <span className="w-full max-w-11">{DESK_PRESETS[p].render()}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => add(...PAPER_KIT)} className={`${btnSecondary} w-full`}>
          <Layers className="h-4 w-4" /> Poser un arrangement de papiers
        </button>
        <p className="text-[11px] text-[#8A6A48]">
          Clique sur un papier posé pour changer sa couleur, écrire dessus, le tourner ou le redimensionner.
        </p>
      </Section>

      {/* ---------------- Stickers & images ---------------- */}
      <Section title="Stickers & images">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setPicking('image')} className={btnPrimary}>
            <ImagePlus className="h-4 w-4" /> Image / photo
          </button>
          <button type="button" onClick={() => setPicking('stamp')} className={btnSecondary}>
            <Stamp className="h-4 w-4" /> Timbre perso
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {otherPresets.map((p) => (
            <button
              key={p}
              type="button"
              title={DESK_PRESETS[p].label}
              aria-label={`Ajouter : ${DESK_PRESETS[p].label}`}
              onClick={() => add({ kind: 'preset', preset: p, alt: '', width: DESK_PRESETS[p].width, style: 'plain' })}
              className={tile}
            >
              <span className="w-full max-w-10">{DESK_PRESETS[p].render()}</span>
            </button>
          ))}
        </div>
        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-[#8A6A48]">
          <Move className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Fais glisser les éléments directement sur le bureau. Pour décorer une page ou la couverture, utilise « + Sticker » sur le carnet.
        </p>
      </Section>

      {/* ---------------- Inventaire ---------------- */}
      <Section title={`Sur le bureau (${items.length})`}>
        {items.length === 0 && <p className="text-xs text-[#8A6A48]">Aucun élément pour l'instant.</p>}
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li key={it.id} className="flex items-center gap-2 rounded-md border border-[#8E6A3E]/20 bg-[#FBF5E6]/80 px-2 py-1.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded bg-[#E9DCC0] p-1">
                {it.kind === 'image' && it.src ? (
                  <img src={it.src} alt="" className="max-h-full max-w-full object-contain" />
                ) : it.preset ? (
                  <span className="w-full">{DESK_PRESETS[it.preset]?.render(it)}</span>
                ) : null}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-[#3A2414]">
                {it.kind === 'preset' && it.preset ? DESK_PRESETS[it.preset]?.label : it.alt || `Image ${i + 1}`}
                {it.text && <span className="ml-1.5 text-[11px] italic text-[#8A6A48]">« {it.text.slice(0, 24)} »</span>}
              </span>
              <button
                type="button"
                aria-label="Supprimer"
                onClick={() => edit((c) => void c.deskItems.splice(i, 1))}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[#6B4A2B] hover:bg-[#8E2F2A] hover:text-[#F7E7C6]"
              >
                <Trash className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </Section>

      {picking && (
        <ImagePickerDialog
          value={picking === 'bg' ? bg.image : { src: '', alt: '' }}
          allowRemove={false}
          onClose={() => setPicking(false)}
          onSave={(img) => {
            if (!img.src) return;
            if (picking === 'bg') {
              edit((c) => {
                c.settings.background.image = img;
                c.settings.background.preset = 'image';
              });
            } else if (picking === 'stamp') {
              add({ kind: 'image', src: img.src, alt: img.alt, width: 100, style: 'stamp' });
            } else {
              add({ kind: 'image', src: img.src, alt: img.alt, width: 180, style: guessStyle(img.src) });
            }
          }}
        />
      )}
    </div>
  );
}
