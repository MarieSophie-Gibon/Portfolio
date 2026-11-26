import type { ReactNode } from 'react';

/* Champs de formulaire sombres partagés par le tiroir admin. */

const inputCls =
  'mt-1 w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-magenta';

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block text-xs text-zinc-400">
      {label}
      {children}
      {hint && <span className="mt-1 block text-[10px] text-zinc-500">{hint}</span>}
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
        className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-white/15 bg-transparent"
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
        <option key={o.value} value={o.value} className="bg-[#171A24]">
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3 rounded-xl border border-white/10 p-3">
      <legend className="px-1 font-mono text-[10px] font-bold tracking-widest text-zinc-500 uppercase">{title}</legend>
      {children}
    </fieldset>
  );
}
