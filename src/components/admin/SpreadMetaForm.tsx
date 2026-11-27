import { useState } from 'react';
import type { Spread } from '@/types/portfolio';
import { ColorInput, Field, Section, TextInput } from './formFields';

type Meta = Pick<Spread, 'label' | 'day' | 'dateLabel' | 'tabLabel' | 'tabColor' | 'edgeWord' | 'edgeLeftColor' | 'edgeRightColor' | 'hideTab'>;

interface Props {
  spread: Spread;
  onSubmit: (meta: Meta) => void;
  onCancel: () => void;
}

/** Réglages d'une page « fixe » (couverture, moodboard, profil, contact). */
export function SpreadMetaForm({ spread, onSubmit, onCancel }: Props) {
  const [m, setM] = useState<Meta>({
    label: spread.label,
    day: spread.day,
    dateLabel: spread.dateLabel,
    tabLabel: spread.tabLabel,
    tabColor: spread.tabColor,
    edgeWord: spread.edgeWord,
    edgeLeftColor: spread.edgeLeftColor,
    edgeRightColor: spread.edgeRightColor,
    hideTab: spread.hideTab ?? false,
  });
  const set = <K extends keyof Meta>(k: K, value: Meta[K]) => setM((p) => ({ ...p, [k]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(m);
      }}
    >
      <Section title="Page">
        <Field label="Nom (sommaire & en-tête)">
          <TextInput value={m.label} onChange={(x) => set('label', x)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Jour Hobonichi">
            <TextInput value={m.day} onChange={(x) => set('day', x.slice(0, 2))} />
          </Field>
          <Field label="Sous-titre de date">
            <TextInput value={m.dateLabel} onChange={(x) => set('dateLabel', x.toUpperCase())} />
          </Field>
        </div>
        <Field label="Mot vertical (bord droit)">
          <TextInput value={m.edgeWord} onChange={(x) => set('edgeWord', x.toUpperCase())} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tranche gauche">
            <ColorInput value={m.edgeLeftColor} onChange={(x) => set('edgeLeftColor', x)} />
          </Field>
          <Field label="Tranche droite">
            <ColorInput value={m.edgeRightColor} onChange={(x) => set('edgeRightColor', x)} />
          </Field>
        </div>
      </Section>
      <Section title="Intercalaire">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Libellé">
            <TextInput value={m.tabLabel} onChange={(x) => set('tabLabel', x.toUpperCase().slice(0, 10))} />
          </Field>
          <Field label="Couleur">
            <ColorInput value={m.tabColor} onChange={(x) => set('tabColor', x)} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-[#4A2E18]">
          <input type="checkbox" checked={m.hideTab} onChange={(e) => set('hideTab', e.target.checked)} className="accent-[#8E2F2A]" />
          Masquer l'intercalaire
        </label>
      </Section>
      <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t border-[#8E6A3E]/25 bg-[#14161F] px-4 py-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-[#5A3520]/10 text-sm hover:bg-[#5A3520]/20">
          Annuler
        </button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-[#8E2F2A] text-sm font-semibold hover:brightness-110">
          Enregistrer
        </button>
      </div>
    </form>
  );
}

