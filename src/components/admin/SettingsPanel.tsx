import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { DEFAULT_CONTENT } from '@/data/defaultData';
import { uid } from '@/lib/contentOps';
import type { SocialIcon } from '@/types/portfolio';
import { Checkbox, ColorInput, Field, Section, Select, TextArea, TextInput, btnPrimary, btnSecondary } from './formFields';

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
      <p className="text-xs text-[#8A6A48]">Les changements s'appliquent en direct ; clique sur « Publier » pour les enregistrer.</p>

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
        <Checkbox checked={settings.cover.enabled} onChange={(v) => edit((c) => void (c.settings.cover.enabled = v))}>
          Afficher le carnet fermé (couverture) au chargement
        </Checkbox>
        <Field label="Couleur du cuir" hint="Cuir clair : titre gravé en creux. Cuir sombre : titre doré.">
          <ColorInput value={settings.cover.color} onChange={(v) => edit((c) => void (c.settings.cover.color = v))} />
        </Field>
        <p className="text-[11px] text-[#8A6A48]">
          Titre, sous-titre, pied de page et décor se modifient directement sur la couverture (mode édition). Pour les timbres : « + Sticker » → « Timbre avec
          mon image », ou sélectionne un timbre existant puis l'icône image pour y mettre ta photo.
        </p>
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
              className="mb-0.5 flex h-9 w-9 items-center justify-center rounded-md border border-[#8E6A3E]/35 bg-[#FBF5E6] text-[#6B4A2B] hover:bg-[#8E2F2A] hover:text-[#F7E7C6]"
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
          className={`${btnSecondary} border-dashed`}
        >
          <Plus className="w-4 h-4" /> Ajouter un lien
        </button>
      </Section>

      <Section title="Zone sensible">
        {confirmReset ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#3A2414]">Tout effacer et repartir d'un carnet vierge ?</span>
            <button
              type="button"
              onClick={() => {
                edit((c) => Object.assign(c, structuredClone(DEFAULT_CONTENT)));
                setConfirmReset(false);
              }}
              className={btnPrimary}
            >
              Oui, réinitialiser
            </button>
            <button type="button" onClick={() => setConfirmReset(false)} className={btnSecondary}>
              Non
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmReset(true)} className={btnSecondary}>
            Réinitialiser (carnet vierge)
          </button>
        )}
        <p className="text-[11px] text-[#8A6A48]">Rien n'est définitif tant que tu n'as pas cliqué sur « Publier ».</p>
      </Section>
    </div>
  );
}
