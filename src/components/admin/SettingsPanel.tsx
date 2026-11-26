import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { DEFAULT_CONTENT } from '@/data/defaultData';
import { uid } from '@/lib/contentOps';
import type { SocialIcon } from '@/types/portfolio';
import { ColorInput, Field, Section, Select, TextArea, TextInput } from './formFields';

const ICONS: { value: SocialIcon; label: string }[] = [
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'globe', label: 'Site web' },
];

/** Paramètres globaux : carnet, identité, liens. Modifie directement le brouillon. */
export function SettingsPanel() {
  const { content, edit } = useAdmin();
  const { author, settings, spreads } = content;
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">Les changements s'appliquent en direct ; clique sur « Publier » pour les enregistrer.</p>

      <Section title="Carnet">
        <Field label="Titre du carnet (en-tête)">
          <TextInput value={settings.title} onChange={(v) => edit((c) => void (c.settings.title = v))} />
        </Field>
        <Field label="Page ouverte au chargement">
          <Select
            value={settings.startSpreadId}
            onChange={(v) => edit((c) => void (c.settings.startSpreadId = v))}
            options={spreads.map((s) => ({ value: s.id, label: s.label }))}
          />
        </Field>
      </Section>

      <Section title="Couverture">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={settings.cover.enabled}
            onChange={(e) => edit((c) => void (c.settings.cover.enabled = e.target.checked))}
            className="accent-magenta"
          />
          Afficher le carnet fermé (couverture) au chargement
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Couleur de la couverture">
            <ColorInput value={settings.cover.color} onChange={(v) => edit((c) => void (c.settings.cover.color = v))} />
          </Field>
          <Field label="Couleur de l'élastique">
            <ColorInput value={settings.cover.strap} onChange={(v) => edit((c) => void (c.settings.cover.strap = v))} />
          </Field>
        </div>
        <p className="text-[11px] text-zinc-500">Titre, sous-titre, image et stickers se modifient directement sur la couverture (mode édition).</p>
      </Section>

      <Section title="Identité">
        <Field label="Nom">
          <TextInput value={author.name} onChange={(v) => edit((c) => void (c.author.name = v))} />
        </Field>
        <Field label="Signature (pied de page)">
          <TextInput value={author.alias} onChange={(v) => edit((c) => void (c.author.alias = v))} />
        </Field>
        <Field label="Rôle">
          <TextInput value={author.role} onChange={(v) => edit((c) => void (c.author.role = v))} />
        </Field>
        <Field label="Localisation">
          <TextInput value={author.location} onChange={(v) => edit((c) => void (c.author.location = v))} />
        </Field>
        <Field label="Disponibilité">
          <TextInput value={author.availability} onChange={(v) => edit((c) => void (c.author.availability = v))} />
        </Field>
        <Field label="Email">
          <TextInput type="email" value={author.email} onChange={(v) => edit((c) => void (c.author.email = v))} />
        </Field>
        <Field label="Bio">
          <TextArea rows={4} value={author.bio} onChange={(v) => edit((c) => void (c.author.bio = v))} />
        </Field>
      </Section>

      <Section title="Réseaux sociaux">
        {author.socials.map((s, i) => (
          <div key={s.id} className="grid grid-cols-[110px_1fr_auto] items-end gap-2">
            <Select value={s.icon} onChange={(v) => edit((c) => void (c.author.socials[i].icon = v))} options={ICONS} />
            <TextInput value={s.url} placeholder="https://…" onChange={(v) => edit((c) => void (c.author.socials[i].url = v))} />
            <button
              type="button"
              aria-label="Supprimer ce lien"
              onClick={() => edit((c) => void c.author.socials.splice(i, 1))}
              className="mb-0.5 w-9 h-9 rounded-lg bg-white/10 hover:bg-magenta flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="col-span-3 -mt-1">
              <TextInput value={s.label} placeholder="Libellé" onChange={(v) => edit((c) => void (c.author.socials[i].label = v))} />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => edit((c) => void c.author.socials.push({ id: uid('soc'), label: 'Site', url: 'https://', icon: 'globe' }))}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-white/25 text-sm text-zinc-300 hover:border-magenta"
        >
          <Plus className="w-4 h-4" /> Ajouter un lien
        </button>
      </Section>

      <Section title="Zone sensible">
        {confirmReset ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-zinc-300">Remplacer tout le contenu par la démo ?</span>
            <button
              type="button"
              onClick={() => {
                edit((c) => Object.assign(c, structuredClone(DEFAULT_CONTENT)));
                setConfirmReset(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-magenta text-sm font-semibold"
            >
              Oui, réinitialiser
            </button>
            <button type="button" onClick={() => setConfirmReset(false)} className="px-3 py-1.5 rounded-lg bg-white/10 text-sm">
              Non
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmReset(true)} className="px-3 py-1.5 rounded-lg bg-white/10 text-sm hover:bg-white/20">
            Réinitialiser avec le contenu de démo
          </button>
        )}
        <p className="text-[10px] text-zinc-500">Rien n'est définitif tant que tu n'as pas cliqué sur « Publier ».</p>
      </Section>
    </div>
  );
}
