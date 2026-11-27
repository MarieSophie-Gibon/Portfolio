import type { ReactNode } from 'react';

/* ==================================================================
 * Champs de formulaire du tiroir d'édition — esthétique grimoire :
 * parchemin, encre brune, liseré laiton, titres en capitales gravées.
 * ================================================================== */

/** Palette partagée par tout le menu d'édition. */
export const UI = {
  ink: '#3A2414',
  inkSoft: '#6B4A2B',
  inkMute: '#8A6A48',
  paper: '#F3E9D2',
  paperLight: '#FBF5E6',
  line: 'rgba(142,106,62,0.35)',
  brass: '#B8893A',
  seal: '#8E2F2A',
  leather: '#3B2416',
} as const;

const inputCls =
  'mt-1 w-full rounded-md border border-[#8E6A3E]/35 bg-[#FBF5E6] px-3 py-2 text-sm text-[#3A2414] shadow-[inset_0_1px_2px_rgba(60,35,10,0.12)] placeholder:text-[#A08060] outline-none focus:border-[#B8893A] focus:ring-2 focus:ring-[#B8893A]/25';

/** Bouton principal = laiton (actions positives : enregistrer, valider, ajouter). */
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-md bg-[linear-gradient(180deg,#F2D58C_0%,#D8B36A_45%,#B8893A_100%)] px-4 py-2 text-sm font-semibold text-[#2A1A0E] shadow-[0_3px_0_#7A5622,0_6px_12px_-6px_rgba(60,35,10,0.6)] transition hover:brightness-105 active:translate-y-px active:shadow-[0_2px_0_#7A5622] disabled:cursor-not-allowed disabled:opacity-45';
/** Bouton danger = cire rouge (actions destructrices : supprimer, réinitialiser). */
export const btnDanger =
  'inline-flex items-center justify-center gap-2 rounded-md bg-[#8E2F2A] px-4 py-2 text-sm font-semibold text-[#F7E7C6] shadow-[0_3px_0_#5E1C18,0_6px_12px_-6px_rgba(60,20,10,0.6)] transition hover:brightness-110 active:translate-y-px active:shadow-[0_2px_0_#5E1C18] disabled:opacity-40';
/** Bandeau d'actions collé en bas d'un formulaire (Annuler / Enregistrer). */
export const stickyActions =
  // -bottom-4 / -mb-4 : compense la marge intérieure du tiroir pour coller au bord.
  'sticky -bottom-4 -mx-4 -mb-4 flex justify-end gap-2 border-t border-[#8E6A3E]/35 bg-[#EFE3C8]/95 px-4 py-3 shadow-[0_-8px_16px_-10px_rgba(60,35,10,0.35)] backdrop-blur-sm';
export const btnSecondary =
  'inline-flex items-center justify-center gap-1.5 rounded-md border border-[#8E6A3E]/40 bg-[#FBF5E6] px-3 py-1.5 text-sm text-[#3A2414] transition hover:border-[#B8893A] hover:bg-white disabled:opacity-40';

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block text-xs font-semibold text-[#6B4A2B]">
      {label}
      {children}
      {hint && <span className="mt-1 block text-[11px] font-normal text-[#8A6A48]">{hint}</span>}
    </label>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls} />;
}

export function TextArea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} className={`${inputCls} resize-y`} />;
}

export function ColorInput({ value, onChange }: { value: string; onChange: (v: `#${string}`) => void }) {
  return (
    <span className="mt-1 flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase() as `#${string}`)}
        className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-[#8E6A3E]/35 bg-[#FBF5E6] p-0.5"
      />
      <input
        value={value}
        onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && onChange(e.target.value.toUpperCase() as `#${string}`)}
        className={`${inputCls} mt-0 font-mono`}
      />
    </span>
  );
}

export function Select<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)} className={inputCls}>
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#FBF5E6] text-[#3A2414]">
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Bloc titré : filet double brun, titre en capitales gravées entre deux ornements. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-[#8E6A3E]/35 bg-[#FBF5E6]/55 p-3 shadow-[inset_0_0_0_3px_rgba(251,245,230,0.6),inset_0_0_0_4px_rgba(142,106,62,0.18)]">
      <legend className="t-fantasy px-1.5 text-[11px] uppercase tracking-[0.18em] text-[#6B4A2B]">
        <span className="text-[#B8893A]">✦</span> {title} <span className="text-[#B8893A]">✦</span>
      </legend>
      {children}
    </fieldset>
  );
}

/** Case à cocher assortie. */
export function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-[#3A2414]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#8E2F2A]" />
      {children}
    </label>
  );
}
