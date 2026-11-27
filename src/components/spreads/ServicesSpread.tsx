import type { SpreadParts } from '@/components/sketchbook/SpreadBase';
import { AddItemButton, EditableList, EditableText, ItemTools } from '@/components/admin/EditableText';
import { ShowIf, filled } from '@/components/admin/ShowIf';
import { uid } from '@/lib/contentOps';
import type { ServiceItem, ServicesContent } from '@/types/portfolio';
import { Heading, INK, INK_SOFT } from './ProfileExperienceSpread';
import type { SpreadCtx } from './spreadContext';

/** Nombre d'offres sur la page gauche (sous l'intro) ; le reste va à droite. */
const LEFT_COUNT = 1;

function Offer({ ctx, item, i }: { ctx: SpreadCtx; item: ServiceItem; i: number }) {
  const editItem = (fn: (s: ServiceItem) => void) => ctx.edit((c) => fn(c.services.items[i]));
  const set = (k: 'title' | 'price' | 'description') => (v: string) => editItem((s) => void (s[k] = v));
  return (
    <article className="border-l border-[#8E6A3E]/35 pl-3">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className={`t-body t-fantasy uppercase tracking-[0.08em] ${INK}`}>
          <EditableText value={item.title} onSave={set('title')} placeholder="Nom de l'offre" />
        </h4>
        <span className="flex items-center">
          <ShowIf has={item.price}>
            <span className="t-hand text-[#8E5A1E]">
              <EditableText value={item.price} onSave={set('price')} placeholder="Prix (facultatif)" />
            </span>
          </ShowIf>
          <ItemTools onRemove={() => ctx.edit((c) => void c.services.items.splice(i, 1))} />
        </span>
      </div>
      <ShowIf has={item.description}>
        <p className={`t-body mt-1 ${INK_SOFT}`}>
          <EditableText value={item.description} onSave={set('description')} multiline placeholder="Ce que comprend cette offre…" />
        </p>
      </ShowIf>
      <ShowIf has={item.details.length}>
        <EditableList items={item.details} onSave={(items) => editItem((s) => void (s.details = items))} className="t-body mt-1">
          <ul className="mt-1 space-y-0.5">
            {item.details.map((d, j) => (
              <li key={j} className={`t-body flex gap-1.5 ${INK_SOFT}`}>
                <span className="shrink-0 text-[#B8893A]">✦</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </EditableList>
      </ShowIf>
    </article>
  );
}

function Offers({ ctx, from, to, showAdd }: { ctx: SpreadCtx; from: number; to?: number; showAdd: boolean }) {
  const items = ctx.content.services.items;
  const list = items.slice(from, to);
  return (
    <div className="space-y-4">
      {list.map((item, k) => (
        <Offer key={item.id} ctx={ctx} item={item} i={from + k} />
      ))}
      {showAdd && (
        <AddItemButton
          label="offre"
          onClick={() =>
            ctx.edit((c) => void c.services.items.push({ id: uid('svc'), title: 'Nouvelle offre', price: '', description: '', details: [] }))
          }
        />
      )}
    </div>
  );
}

export function renderServices(ctx: SpreadCtx): SpreadParts {
  const s: ServicesContent = ctx.content.services;
  const many = s.items.length > LEFT_COUNT;
  return {
    left: (
      <div className="relative flex h-full flex-col gap-4">
        <ShowIf has={filled(s.intro, s.items)}>
          <Heading big>Services</Heading>
        </ShowIf>
        <ShowIf has={s.intro}>
          <p className={`t-body ${INK_SOFT}`}>
            <EditableText value={s.intro} onSave={(v) => ctx.edit((c) => void (c.services.intro = v))} multiline placeholder="Comment tu peux aider…" />
          </p>
        </ShowIf>
        <Offers ctx={ctx} from={0} to={LEFT_COUNT} showAdd={!many} />
      </div>
    ),
    right: (
      <div className="relative flex h-full flex-col pt-14">
        {many && <Offers ctx={ctx} from={LEFT_COUNT} showAdd />}
      </div>
    ),
  };
}
