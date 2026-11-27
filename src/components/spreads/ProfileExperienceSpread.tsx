import { ArrowUpRight } from 'lucide-react';
import type { SpreadParts } from '@/components/sketchbook/SpreadBase';
import { AddItemButton, EditableList, EditableText, ItemTools } from '@/components/admin/EditableText';
import { EditableImage } from '@/components/admin/EditableImage';
import { ShowIf, filled } from '@/components/admin/ShowIf';
import { uid } from '@/lib/contentOps';
import type { Author } from '@/types/portfolio';
import { projectNumber, stop, type SpreadCtx } from './spreadContext';

export function renderProfileExperience(ctx: SpreadCtx): SpreadParts {
  const { author, articles } = ctx.content;
  const editAuthor = (fn: (a: Author) => void) => ctx.edit((c) => fn(c.author));
  const setAuthor = (k: 'name' | 'location' | 'bio' | 'role') => (v: string) => editAuthor((a) => void (a[k] = v));
  const listed = articles.filter((a) => filled(a.title));

  return {
    left: (
      <div className="relative h-full flex flex-col justify-between gap-1.5">
        {/* Carte HELLO! + portrait */}
        <ShowIf has={filled(author.name, author.location, author.bio, author.avatar.src)}>
        <div className="relative bg-[#C5D3B8] border-2 border-ink p-2.5 shadow-[4px_4px_0_#13141A] torn-paper-card" style={{ transform: 'rotate(-1.2deg)' }}>
          <div className="flex items-start gap-2.5">
            <ShowIf has={author.avatar.src}>
            <div
              className="relative w-20 shrink-0 bg-white p-1 pb-2 border-2 border-ink shadow-[3px_3px_0_rgba(0,0,0,0.4)] -mt-1 -ml-1"
              style={{ transform: 'rotate(-5deg)' }}
            >
              <EditableImage value={author.avatar} onSave={(img) => editAuthor((a) => void (a.avatar = img))} className="overflow-hidden border border-ink/30">
                {author.avatar.src ? (
                  <img src={author.avatar.src} alt={author.avatar.alt} draggable={false} className="block w-full aspect-square object-cover" />
                ) : (
                  <div className="t-caption flex aspect-square w-full items-center justify-center border border-dashed border-ink/30 font-mono text-ink/40">PHOTO</div>
                )}
              </EditableImage>
            </div>
            </ShowIf>
            <div className="min-w-0 flex-1">
              <div className="t-title font-syne font-extrabold tracking-tight text-[#FF5E3A] drop-shadow-[2px_2px_0_#13141A]">HELLO!</div>
              <div className="t-caption mt-1 space-y-0.5 font-mono text-ink">
                <div className="border-b border-dashed border-ink/60">
                  <span className="font-bold">NOM :</span>{' '}
                  <span className="t-hand font-bold text-rose-800">
                    <EditableText value={author.name} onSave={setAuthor('name')} />
                  </span>
                </div>
                <div className="border-b border-dashed border-ink/60">
                  <span className="font-bold">BASE :</span> <EditableText value={author.location} onSave={setAuthor('location')} />
                </div>
              </div>
            </div>
          </div>
          <p className="t-body mt-1.5 font-sans text-ink">
            <EditableText value={author.bio} onSave={setAuthor('bio')} multiline />
          </p>
        </div>
        </ShowIf>

        {/* Formation */}
        <ShowIf has={author.education.length}>
        <div className="relative bg-[#1F6F6D] text-[#F4F2EA] p-2 border-2 border-ink shadow-[3px_3px_0_#13141A]" style={{ transform: 'rotate(0.8deg)' }}>
          <div className="t-caption font-syne font-extrabold tracking-wider text-amber-200 uppercase">Formation</div>
          {author.education.map((ed, i) => (
            <div key={ed.id} className="t-body mt-0.5">
              <span className="t-caption font-mono text-lime font-bold mr-1">
                <EditableText value={ed.period} onSave={(v) => editAuthor((a) => void (a.education[i].period = v))} />
              </span>
              <span className="font-semibold text-white">
                <EditableText value={ed.degree} onSave={(v) => editAuthor((a) => void (a.education[i].degree = v))} />
              </span>
              <ItemTools onRemove={() => editAuthor((a) => void a.education.splice(i, 1))} />
            </div>
          ))}
          <AddItemButton
            label="formation"
            className="mt-1"
            onClick={() => editAuthor((a) => void a.education.push({ id: uid('ed'), period: '20XX', degree: 'Diplôme', school: '' }))}
          />
        </div>
        </ShowIf>

        {/* Compétences */}
        <ShowIf has={author.skills.length}>
        <div className="relative bg-violet text-white p-2 border-2 border-ink shadow-[4px_4px_0_#13141A]" style={{ transform: 'rotate(-2.1deg)' }}>
          <div className="flex items-center justify-between mb-0.5">
            <span className="t-caption font-syne font-extrabold text-ink bg-lime px-1.5">LIST OF SKILLS</span>
            <span className="t-hand text-yellow-200">outils ✦</span>
          </div>
          <div className="grid grid-cols-1 gap-0.5">
            {author.skills.map((sk, i) => (
              <div key={sk.id} className="t-body flex items-center gap-1">
                <span className="t-caption font-mono text-lime font-bold">{String(i + 1).padStart(2, '0')}.</span>
                <span className={sk.highlight ? 'bg-white text-violet-900 px-1 font-semibold' : 'text-white'}>
                  <EditableText value={sk.label} onSave={(v) => editAuthor((a) => void (a.skills[i].label = v))} />
                </span>
                <ItemTools
                  toggled={sk.highlight}
                  onToggle={() => editAuthor((a) => void (a.skills[i].highlight = !a.skills[i].highlight))}
                  onRemove={() => editAuthor((a) => void a.skills.splice(i, 1))}
                />
              </div>
            ))}
            <AddItemButton
              label="compétence"
              className="mt-0.5 w-fit"
              onClick={() => editAuthor((a) => void a.skills.push({ id: uid('sk'), label: 'Nouvelle compétence', highlight: false }))}
            />
          </div>
        </div>
        </ShowIf>
      </div>
    ),
    right: (
      <div className="relative h-full w-full flex items-center justify-center">
        <ShowIf has={filled(author.role, author.experiences, listed)}>
        <div
          className="relative w-full h-full bg-white text-ink p-3 shadow-[0_12px_26px_-14px_rgba(20,60,80,0.45)] flex flex-col justify-between border border-ink/10 torn-paper-card"
          style={{ transform: 'rotate(1.4deg)' }}
        >
          <div className="text-center border-b border-dashed border-ink/15 pb-1.5">
            <h2 className="t-title font-syne font-extrabold tracking-tight text-ink [text-shadow:3px_3px_0_#CDBEF5]">EXPERIENCE</h2>
            <div className="t-caption inline-block mt-1 px-2 py-0.5 bg-magenta text-white font-mono font-bold tracking-[0.16em] uppercase -rotate-1">
              <EditableText value={author.role} onSave={setAuthor('role')} />
            </div>
          </div>

          <div className="space-y-1.5 my-1 min-h-0 overflow-hidden">
            {author.experiences.map((exp, i) => {
              const setExp = (k: 'period' | 'badge' | 'title' | 'company') => (v: string) => editAuthor((a) => void (a.experiences[i][k] = v));
              return (
                <div key={exp.id} className="bg-[#FBF8F1] border border-dashed border-ink/15 rounded-md p-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="t-caption font-mono text-sky-700 font-bold">
                      <EditableText value={exp.period} onSave={setExp('period')} />
                    </span>
                    <span className="flex items-center">
                      <span className="t-caption px-1.5 bg-lilac text-violet-900 font-mono font-bold">
                        <EditableText value={exp.badge} onSave={setExp('badge')} />
                      </span>
                      <ItemTools onRemove={() => editAuthor((a) => void a.experiences.splice(i, 1))} />
                    </span>
                  </div>
                  <div className="t-body font-syne font-bold text-ink mt-0.5">
                    <EditableText value={exp.title} onSave={setExp('title')} />{' '}
                    <span className="text-magenta">
                      @ <EditableText value={exp.company} onSave={setExp('company')} />
                    </span>
                  </div>
                  <EditableList items={exp.bullets} onSave={(items) => editAuthor((a) => void (a.experiences[i].bullets = items))} className="t-body mt-1">
                    <ul className="mt-1 space-y-0.5">
                      {exp.bullets.map((b, j) => (
                        <li key={j} className="t-body text-zinc-600 flex gap-1">
                          <span className="text-magenta shrink-0">✖</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </EditableList>
                </div>
              );
            })}
            <AddItemButton
              label="expérience"
              onClick={() =>
                editAuthor(
                  (a) =>
                    void a.experiences.push({
                      id: uid('xp'),
                      period: '20XX – 20XX',
                      title: 'Poste',
                      company: 'ENTREPRISE',
                      badge: 'BADGE',
                      bullets: ['Une réalisation marquante.'],
                    }),
                )
              }
            />
          </div>

          {listed.length > 0 && (
          <div className="bg-[#FBF8F1] border border-ink/10 rounded-md p-1.5">
            <div className="flex items-center justify-between mb-1">
              <span className="t-caption font-mono font-bold tracking-widest text-ink/70">PROJETS // INDEX</span>
              <span className="t-hand text-magenta">ouvrir ↓</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {listed.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={(e) => {
                    stop(e);
                    ctx.goToArticle(a.id);
                  }}
                  className="text-left flex items-center justify-between gap-1 px-1.5 py-1 bg-white hover:bg-blush border border-ink/15 rounded transition-colors"
                >
                  <span className="t-caption font-syne font-bold text-ink truncate">
                    {projectNumber(ctx.content, a.id)} {a.title}
                  </span>
                  <ArrowUpRight className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
          )}
        </div>
        </ShowIf>
      </div>
    ),
  };
}
