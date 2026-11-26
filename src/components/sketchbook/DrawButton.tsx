import { Check, Eraser, Pencil, Trash } from 'lucide-react';
import { PENCIL_COLORS } from '@/data/defaultData';
import { DIE_CUT } from './LogoSticker';

interface Props {
  on: boolean;
  color: string;
  eraser: boolean;
  toggle: () => void;
  setColor: (hex: string) => void;
  setEraser: (v: boolean) => void;
  clear: () => void;
}

/** Mode dessin (Apple Pencil) : bouton rond en bas à droite + outils qui se déploient à sa gauche. */
export function DrawButton({ on, color, eraser, toggle, setColor, setEraser, clear }: Props) {
  return (
    <div
      className="fixed right-5 z-40 flex items-center gap-3"
      style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {on && (
        <div className="flex items-center gap-1.5 rounded-full bg-white py-1 pl-2.5 pr-1 text-ink shadow-[0_12px_30px_-8px_rgba(20,60,80,0.45)] ring-1 ring-black/5 animate-[index-in_200ms_ease-out]">
          <div className="flex items-center gap-1.5">
            {PENCIL_COLORS.map((c) => {
              const active = !eraser && color === c.hex;
              return (
                <button
                  key={c.id}
                  type="button"
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={active}
                  onClick={() => {
                    setEraser(false);
                    setColor(c.hex);
                  }}
                  className={`h-5 w-5 rounded-full border border-black/15 transition-transform ${active ? 'scale-110 ring-2 ring-ink ring-offset-2' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c.hex }}
                />
              );
            })}
          </div>
          <span className="h-5 w-px bg-slate-200" />
          <button
            type="button"
            onClick={() => setEraser(!eraser)}
            title="Gomme"
            aria-label="Gomme"
            aria-pressed={eraser}
            className={`rounded-full p-1 transition-colors ${eraser ? 'bg-ink text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Eraser className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={clear}
            title="Tout effacer sur cette page"
            aria-label="Tout effacer sur cette page"
            className="rounded-full p-1 text-slate-600 transition-colors hover:bg-rose-100 hover:text-rose-600"
          >
            <Trash className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        aria-label={on ? 'Terminer le dessin' : 'Dessiner sur la page'}
        title={on ? 'Terminer' : 'Dessiner sur la page'}
        // Sticker : liseré blanc découpé + ombre portée, légèrement de travers ; discret au repos.
        className={`group relative flex h-9 w-9 items-center justify-center transition-all duration-300 active:scale-95 ${
          on ? 'opacity-100' : 'opacity-75 hover:opacity-100'
        }`}
        style={{ filter: DIE_CUT }}
      >
        <span
          className={`flex h-full w-full items-center justify-center rounded-[46%_54%_50%_50%/52%_48%_52%_48%] transition-transform duration-300 ${
            on ? 'rotate-0 bg-ink text-white' : '-rotate-12 bg-butter text-ink group-hover:rotate-0 group-hover:scale-105'
          }`}
        >
          {on ? <Check className="h-4 w-4" /> : <Pencil className="h-3.5 w-3.5" />}
        </span>
        {!on && (
          <span className="t-hand pointer-events-none absolute -top-6 right-0 -rotate-6 whitespace-nowrap font-bold text-ink/80 opacity-0 transition-opacity group-hover:opacity-100">
            dessiner ✎
          </span>
        )}
      </button>
    </div>
  );
}
