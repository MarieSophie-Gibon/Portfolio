import { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import type { ArticleFormValues } from '@/lib/contentOps';
import { ImagePickerDialog } from './EditableImage';
import { ColorInput, Field, Section, Select, TextArea, TextInput } from './formFields';

interface Props {
  initial: ArticleFormValues;
  submitLabel: string;
  onSubmit: (values: ArticleFormValues) => void;
  onCancel: () => void;
}

/** Formulaire de création / modification d'un article (+ son intercalaire). */
export function ArticleForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [v, setV] = useState(initial);
  const [techText, setTechText] = useState(initial.tech.join(', '));
  const [pickImage, setPickImage] = useState(false);
  const set = <K extends keyof ArticleFormValues>(k: K, value: ArticleFormValues[K]) => setV((prev) => ({ ...prev, [k]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...v,
          title: v.title.trim() || 'SANS TITRE',
          tech: techText
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        });
      }}
    >
      <Section title="Contenu">
        <Field label="Titre">
          <TextInput value={v.title} onChange={(x) => set('title', x)} />
        </Field>
        <Field label="Sous-titre">
          <TextInput value={v.subtitle} onChange={(x) => set('subtitle', x)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Année">
            <TextInput value={v.year} onChange={(x) => set('year', x)} />
          </Field>
          <Field label="Client">
            <TextInput value={v.client} onChange={(x) => set('client', x)} />
          </Field>
        </div>
        <Field label="Rôle">
          <TextInput value={v.role} onChange={(x) => set('role', x)} />
        </Field>
        <Field label="Résumé">
          <TextArea value={v.summary} onChange={(x) => set('summary', x)} />
        </Field>
        <Field label="Défi">
          <TextArea value={v.challenge} onChange={(x) => set('challenge', x)} />
        </Field>
        <Field label="Solution">
          <TextArea value={v.solution} onChange={(x) => set('solution', x)} />
        </Field>
        <Field label="Tags techniques" hint="Séparés par des virgules">
          <TextInput value={techText} onChange={setTechText} placeholder="React, Three.js, GLSL" />
        </Field>
        <Field label="Image principale">
          <button
            type="button"
            onClick={() => setPickImage(true)}
            className="mt-1 flex w-full items-center gap-3 rounded-lg border border-dashed border-[#8E6A3E]/40 bg-[#FBF5E6] p-2 text-left hover:border-[#B8893A]"
          >
            {v.coverImage ? (
              <img src={v.coverImage} alt="" className="h-12 w-20 rounded object-cover" />
            ) : (
              <span className="flex h-12 w-20 items-center justify-center rounded bg-[#5A3520]/5">
                <ImagePlus className="w-5 h-5 text-[#8A6A48]" />
              </span>
            )}
            <span className="text-sm text-[#4A2E18]">{v.coverImage ? 'Changer l’image' : 'Ajouter une image'}</span>
          </button>
        </Field>
      </Section>

      <Section title="Intercalaire & mise en page">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Jour Hobonichi">
            <TextInput value={v.day} onChange={(x) => set('day', x.slice(0, 2))} placeholder="14" />
          </Field>
          <Field label="Libellé intercalaire">
            <TextInput value={v.tabLabel} onChange={(x) => set('tabLabel', x.toUpperCase().slice(0, 10))} />
          </Field>
        </div>
        <Field label="Sous-titre de date" hint="Ex : MERCREDI • MAI">
          <TextInput value={v.dateLabel} onChange={(x) => set('dateLabel', x.toUpperCase())} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Couleur d’accent">
            <ColorInput value={v.accent} onChange={(x) => set('accent', x)} />
          </Field>
          <Field label="Couleur secondaire">
            <ColorInput value={v.accentSecondary} onChange={(x) => set('accentSecondary', x)} />
          </Field>
        </div>
        <Field label="Style de page gauche">
          <Select
            value={v.layout}
            onChange={(x) => set('layout', x)}
            options={[
              { value: 'light-hobonichi', label: 'Light Hobonichi (papier)' },
              { value: 'dark-punk-left', label: 'Carte teintée (couleur d’accent)' },
            ]}
          />
        </Field>
      </Section>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t border-[#8E6A3E]/25 bg-[#14161F] px-4 py-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-[#5A3520]/10 text-sm hover:bg-[#5A3520]/20">
          Annuler
        </button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-[#8E2F2A] text-sm font-semibold hover:brightness-110">
          {submitLabel}
        </button>
      </div>

      {pickImage && (
        <ImagePickerDialog
          value={{ src: v.coverImage, alt: v.title }}
          allowRemove
          onClose={() => setPickImage(false)}
          onSave={(img) => set('coverImage', img.src)}
        />
      )}
    </form>
  );
}
