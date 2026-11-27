import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { SpreadParts } from '@/components/sketchbook/SpreadBase';
import { AddItemButton, EditableList, EditableText, ItemTools } from '@/components/admin/EditableText';
import { EditableImage } from '@/components/admin/EditableImage';
import { ShowIf, filled } from '@/components/admin/ShowIf';
import { uid } from '@/lib/contentOps';
import type { Author } from '@/types/portfolio';
import { projectNumber, stop, type SpreadCtx } from './spreadContext';

/* ==================================================================
 * Pages « À propos » et « Expériences » — sobres, écrites à l'encre sur
 * le parchemin : titres en capitales gravées, filets fins, aucun décor.
 * Les blocs ci-dessous sont partagés par les deux pages.
 * ================================================================== */

export const INK = 'text-[#2E1C0E]';
export const INK_SOFT = 'text-[#5A3B22]';
export const INK_MUTE = 'text-[#8A6A48]';

/** Titre de section : capitales gravées + filet fin. */
export function Heading({ children, big = false }: { children: ReactNode; big?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <h3 className={`t-fantasy shrink-0 uppercase tracking-[0.14em] ${big ? 't-title' : 't-caption'} ${INK}`}>{children}</h3>
      <span className="h-px flex-1 bg-[#8E6A3E]/35" />
    </div>
  );
}

const editAuthorOf = (ctx: SpreadCtx) => (fn: (a: Author) => void) => ctx.edit((c) => fn(c.author));

/** Portrait + nom + métier + lieu + disponibilité. */
function Identity({ ctx, large = false }: { ctx: SpreadCtx; large?: boolean }) {
  const { author } = ctx.content;
  const editAuthor = editAuthorOf(ctx);
  const set = (k: 'name' | 'location' | 'role' | 'availability') => (v: string) => editAuthor((a) => void (a[k] = v));
  return (
    <ShowIf has={filled(author.name, author.location, author.role, author.avatar.src)}>
      <section className={large ? 'flex flex-col items-start gap-4' : 'flex items-start gap-3.5'}>
        <ShowIf has={author.avatar.src}>
          <div className={`${large ? 'w-44' : 'w-20'} shrink-0 rotate-[-2deg] bg-[#FBF7EE] p-1.5 pb-3 shadow-[0_10px_18px_-10px_rgba(40,20,5,0.6)]`}>
            <EditableImage value={author.avatar} onSave={(img) => editAuthor((a) => void (a.avatar = img))} className="overflow-hidden">
              {author.avatar.src ? (
                <img src={author.avatar.src} alt={author.avatar.alt} draggable={false} className="block aspect-square w-full object-cover" />
              ) : (
                <div className={`t-caption flex aspect-square w-full items-center justify-center border border-dashed border-[#8E6A3E]/40 font-mono ${INK_MUTE}`}>
                  PHOTO
                </div>
              )}
            </EditableImage>
          </div>
        </ShowIf>
        <div className="min-w-0">
          <p className={`t-title t-fantasy ${INK}`}>
            <EditableText value={author.name} onSave={set('name')} placeholder="Ton nom" />
          </p>
          <p className={`t-body mt-0.5 ${INK_SOFT}`}>
            <EditableText value={author.role} onSave={set('role')} placeholder="Ton métier" />
          </p>
          <p className={`t-caption mt-1 font-mono uppercase tracking-[0.16em] ${INK_MUTE}`}>
            <EditableText value={author.location} onSave={set('location')} placeholder="Ville, pays" />
          </p>
          <ShowIf has={author.availability}>
            <p className="t-hand mt-2 text-[#4E6B34]">
              ✦ <EditableText value={author.availability} onSave={set('availability')} placeholder="Disponibilité" />
            </p>
          </ShowIf>
        </div>
      </section>
    </ShowIf>
  );
}

function Bio({ ctx }: { ctx: SpreadCtx }) {
  const { author } = ctx.content;
  const editAuthor = editAuthorOf(ctx);
  return (
    <ShowIf has={author.bio}>
      <section>
        <Heading>À propos</Heading>
        <p className={`t-body mt-2 font-sans ${INK_SOFT}`}>
          <EditableText value={author.bio} onSave={(v) => editAuthor((a) => void (a.bio = v))} multiline placeholder="Quelques mots sur toi…" />
        </p>
      </section>
    </ShowIf>
  );
}

function Skills({ ctx }: { ctx: SpreadCtx }) {
  const { author } = ctx.content;
  const editAuthor = editAuthorOf(ctx);
  return (
    <ShowIf has={author.skills.length}>
      <section>
        <Heading>Compétences</Heading>
        <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
          {author.skills.map((sk, i) => (
            <li key={sk.id} className="t-body flex items-center gap-1">
              <span className={sk.highlight ? 'text-[#B8893A]' : INK_MUTE}>✦</span>
              <span className={sk.highlight ? `font-semibold ${INK}` : INK_SOFT}>
                <EditableText value={sk.label} onSave={(v) => editAuthor((a) => void (a.skills[i].label = v))} />
              </span>
              <ItemTools
                toggled={sk.highlight}
                onToggle={() => editAuthor((a) => void (a.skills[i].highlight = !a.skills[i].highlight))}
                onRemove={() => editAuthor((a) => void a.skills.splice(i, 1))}
              />
            </li>
          ))}
        </ul>
        <AddItemButton
          label="compétence"
          className="mt-1 w-fit"
          onClick={() => editAuthor((a) => void a.skills.push({ id: uid('sk'), label: 'Nouvelle compétence', highlight: false }))}
        />
      </section>
    </ShowIf>
  );
}

function Education({ ctx }: { ctx: SpreadCtx }) {
  const { author } = ctx.content;
  const editAuthor = editAuthorOf(ctx);
  return (
    <ShowIf has={author.education.length}>
      <section>
        <Heading>Formation</Heading>
        <ul className="mt-1.5 space-y-1">
          {author.education.map((ed, i) => (
            <li key={ed.id} className="t-body flex items-baseline gap-2">
              <span className={`t-caption shrink-0 font-mono ${INK_MUTE}`}>
                <EditableText value={ed.period} onSave={(v) => editAuthor((a) => void (a.education[i].period = v))} />
              </span>
              <span className={`min-w-0 flex-1 font-semibold ${INK}`}>
                <EditableText value={ed.degree} onSave={(v) => editAuthor((a) => void (a.education[i].degree = v))} />
                <ShowIf has={ed.school}>
                  <span className={`font-normal ${INK_MUTE}`}>
                    {' — '}
                    <EditableText value={ed.school} onSave={(v) => editAuthor((a) => void (a.education[i].school = v))} placeholder="École" />
                  </span>
                </ShowIf>
              </span>
              <ItemTools onRemove={() => editAuthor((a) => void a.education.splice(i, 1))} />
            </li>
          ))}
        </ul>
        <AddItemButton
          label="formation"
          className="mt-1"
          onClick={() => editAuthor((a) => void a.education.push({ id: uid('ed'), period: '20XX', degree: 'Diplôme', school: '' }))}
        />
      </section>
    </ShowIf>
  );
}

/** Expériences [from, to) — permet de répartir la liste sur deux pages. */
function Experiences({ ctx, from = 0, to, withTitle = true }: { ctx: SpreadCtx; from?: number; to?: number; withTitle?: boolean }) {
  const { author } = ctx.content;
  const editAuthor = editAuthorOf(ctx);
  const list = author.experiences.slice(from, to);
  const isLastChunk = to === undefined || to >= author.experiences.length;
  if (!list.length && !withTitle) return null;
  return (
    <ShowIf has={author.experiences.length}>
      <section className="min-h-0">
        {withTitle && <Heading big>Expériences</Heading>}
        <ol className={`${withTitle ? 'mt-3' : ''} space-y-3`}>
          {list.map((exp, k) => {
            const i = from + k;
            const setExp = (key: 'period' | 'badge' | 'title' | 'company') => (v: string) => editAuthor((a) => void (a.experiences[i][key] = v));
            return (
              <li key={exp.id} className="border-l border-[#8E6A3E]/35 pl-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`t-caption font-mono ${INK_MUTE}`}>
                    <EditableText value={exp.period} onSave={setExp('period')} />
                  </span>
                  <span className="flex items-center">
                    <span className={`t-caption t-fantasy uppercase tracking-[0.1em] ${INK_MUTE}`}>
                      <EditableText value={exp.badge} onSave={setExp('badge')} placeholder="Rôle" />
                    </span>
                    <ItemTools onRemove={() => editAuthor((a) => void a.experiences.splice(i, 1))} />
                  </span>
                </div>
                <p className={`t-body mt-0.5 font-semibold ${INK}`}>
                  <EditableText value={exp.title} onSave={setExp('title')} />
                  <ShowIf has={exp.company}>
                    <span className={`font-normal ${INK_SOFT}`}>
                      {' · '}
                      <EditableText value={exp.company} onSave={setExp('company')} />
                    </span>
                  </ShowIf>
                </p>
                <EditableList items={exp.bullets} onSave={(items) => editAuthor((a) => void (a.experiences[i].bullets = items))} className="t-body mt-1">
                  <ul className="mt-1 space-y-0.5">
                    {exp.bullets.map((b, j) => (
                      <li key={j} className={`t-body flex gap-1.5 ${INK_SOFT}`}>
                        <span className={`shrink-0 ${INK_MUTE}`}>–</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </EditableList>
              </li>
            );
          })}
        </ol>
        {isLastChunk && (
          <AddItemButton
            label="expérience"
            className="mt-2"
            onClick={() =>
              editAuthor(
                (a) =>
                  void a.experiences.push({
                    id: uid('xp'),
                    period: '20XX – 20XX',
                    title: 'Poste',
                    company: 'Entreprise',
                    badge: '',
                    bullets: ['Une réalisation marquante.'],
                  }),
              )
            }
          />
        )}
      </section>
    </ShowIf>
  );
}

/** Liste courte des projets (titre cliquable). */
function ProjectLinks({ ctx }: { ctx: SpreadCtx }) {
  const listed = ctx.content.articles.filter((a) => filled(a.title));
  if (!listed.length) return null;
  return (
    <section className="mt-auto">
      <Heading>Projets</Heading>
      <ul className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
        {listed.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                ctx.goToArticle(a.id);
              }}
              className={`t-body group inline-flex max-w-full items-center gap-1 text-left ${INK} hover:text-[#8E5A1E]`}
            >
              <span className={`t-caption font-mono ${INK_MUTE}`}>{projectNumber(ctx.content, a.id)}</span>
              <span className="truncate underline decoration-[#8E6A3E]/35 underline-offset-2 group-hover:decoration-[#B8893A]">{a.title}</span>
              <ArrowUpRight className="h-3 w-3 shrink-0 opacity-60" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

/** À propos : identité (portrait) à gauche ; bio + compétences à droite. */
export function renderAbout(ctx: SpreadCtx): SpreadParts {
  return {
    left: (
      <div className="relative flex h-full flex-col justify-center">
        <Identity ctx={ctx} large />
      </div>
    ),
    right: (
      <div className="relative flex h-full flex-col gap-5 pt-2">
        <Bio ctx={ctx} />
        <Skills ctx={ctx} />
      </div>
    ),
  };
}

/** Expériences : la liste à gauche (3 premières), la suite + la formation à droite. */
const LEFT_COUNT = 3;
export function renderExperience(ctx: SpreadCtx): SpreadParts {
  return {
    left: (
      <div className="relative flex h-full flex-col">
        <Experiences ctx={ctx} to={LEFT_COUNT} />
      </div>
    ),
    right: (
      <div className="relative flex h-full flex-col gap-5 pt-2">
        <Experiences ctx={ctx} from={LEFT_COUNT} withTitle={false} />
        <Education ctx={ctx} />
      </div>
    ),
  };
}

/** Ancien format v1 (« Profil ») — conservé pour compatibilité. */
export function renderProfileExperience(ctx: SpreadCtx): SpreadParts {
  return {
    left: (
      <div className="relative flex h-full flex-col gap-4">
        <Identity ctx={ctx} />
        <Bio ctx={ctx} />
        <Education ctx={ctx} />
        <Skills ctx={ctx} />
      </div>
    ),
    right: (
      <div className="relative flex h-full flex-col gap-3">
        <Experiences ctx={ctx} />
        <ProjectLinks ctx={ctx} />
      </div>
    ),
  };
}
