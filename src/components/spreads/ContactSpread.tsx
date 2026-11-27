import { Check, Copy } from 'lucide-react';
import type { SpreadParts } from '@/components/sketchbook/SpreadBase';
import { EditableText } from '@/components/admin/EditableText';
import { ShowIf, filled } from '@/components/admin/ShowIf';
import { SocialGlyph } from '@/components/sketchbook/BrandIcons';
import { Heading, INK, INK_MUTE, INK_SOFT } from './ProfileExperienceSpread';
import { stop, type SpreadCtx } from './spreadContext';

/** Contact : grand titre + accroche à gauche ; coordonnées à droite. Sobre, à l'encre. */
export function renderContact(ctx: SpreadCtx): SpreadParts {
  const { author, contact } = ctx.content;
  const setAuthor = (k: 'name' | 'role' | 'email' | 'availability') => (v: string) => ctx.edit((c) => void (c.author[k] = v));
  const setContact = (k: 'title' | 'kicker' | 'thanks') => (v: string) => ctx.edit((c) => void (c.contact[k] = v));

  const left = (
    <div className="relative flex h-full flex-col justify-center gap-4">
      <ShowIf has={filled(contact.title)}>
        <h2 className={`t-display t-fantasy ${INK}`}>
          <EditableText value={contact.title} onSave={setContact('title')} multiline placeholder="Travaillons ensemble" />
        </h2>
      </ShowIf>
      <ShowIf has={filled(contact.kicker)}>
        <p className={`t-body max-w-[90%] ${INK_SOFT}`}>
          <EditableText value={contact.kicker} onSave={setContact('kicker')} multiline placeholder="Une phrase d'accroche…" />
        </p>
      </ShowIf>
      <ShowIf has={filled(author.availability)}>
        <p className="t-hand text-[#4E6B34]">
          ✦ <EditableText value={author.availability} onSave={setAuthor('availability')} placeholder="Disponibilité" />
        </p>
      </ShowIf>
    </div>
  );

  const right = (
    <div className="relative flex h-full flex-col justify-center gap-5">
      <ShowIf has={filled(author.name, author.role, author.email, author.socials)}>
        <section>
          <Heading>Me contacter</Heading>
          <div className="mt-3">
            <p className={`t-body t-fantasy ${INK}`}>
              <EditableText value={author.name} onSave={setAuthor('name')} placeholder="Ton nom" />
            </p>
            <p className={`t-caption ${INK_MUTE}`}>
              <EditableText value={author.role} onSave={setAuthor('role')} placeholder="Ton métier" />
            </p>
          </div>

          <ShowIf has={filled(author.email)}>
            <div className="mt-3 flex items-center justify-between gap-2 border-b border-dashed border-[#8E6A3E]/40 pb-1.5">
              <span className={`t-body truncate font-mono ${INK}`}>
                <EditableText value={author.email} onSave={setAuthor('email')} placeholder="email@exemple.com" />
              </span>
              <button
                type="button"
                onClick={(e) => {
                  stop(e);
                  ctx.copyEmail();
                }}
                className={`t-caption inline-flex shrink-0 items-center gap-1 rounded px-2 py-1 font-mono font-bold transition-colors ${
                  ctx.copied ? 'bg-[#4E6B34] text-[#F3E9D2]' : 'bg-[#5A3520]/10 text-[#3A2414] hover:bg-[#D8B36A]'
                }`}
              >
                {ctx.copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {ctx.copied ? 'Copié' : 'Copier'}
              </button>
            </div>
          </ShowIf>

          {author.socials.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              {author.socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={stop}
                    className={`t-body inline-flex items-center gap-1.5 underline decoration-[#8E6A3E]/35 underline-offset-2 hover:decoration-[#B8893A] ${INK}`}
                  >
                    <SocialGlyph icon={s.icon} className="h-3.5 w-3.5" /> {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </ShowIf>

      <ShowIf has={filled(contact.thanks)}>
        <p className={`t-hand mt-4 text-center ${INK_SOFT}`}>
          <EditableText value={contact.thanks} onSave={setContact('thanks')} placeholder="Un petit mot de fin…" />
        </p>
      </ShowIf>
    </div>
  );

  return { left, right };
}
