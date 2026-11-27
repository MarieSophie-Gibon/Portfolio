import { PAGE_META, structuralSpread } from '@/data/defaultData';
import { relabelProjects } from '@/lib/contentOps';
import type { PortfolioContent, Spread } from '@/types/portfolio';

/**
 * v1 → v2 : nouvelle suite de pages
 * Home · À propos · Expériences · Projets (+ projets) · Services · Contact · Doodles.
 *
 * On garde ce qui a été saisi : stickers et « En savoir plus » des pages
 * existantes, toutes les doubles-pages projet (dans leur ordre), la page
 * Contact. L'ancien « Profil » devient « À propos », l'ancien « Lab » devient
 * « Doodles ».
 */
export function migrateToV2(c: PortfolioContent): PortfolioContent {
  if (c.schemaVersion === 2) return c;
  const old = c.spreads;
  const find = (kind: Spread['kind']) => old.find((s) => s.kind === kind);

  /** Page structurelle neuve, en reprenant le décor / la feuille d'une ancienne page. */
  const carry = (kind: Parameters<typeof structuralSpread>[0], from?: Spread): Spread => {
    const fresh = structuralSpread(kind);
    if (!from) return fresh;
    return {
      ...fresh,
      stickers: from.stickers,
      more: from.more,
      // Libellés déjà personnalisés : on les garde.
      label: from.label || fresh.label,
      tabLabel: from.tabLabel || fresh.tabLabel,
      edgeWord: from.edgeWord || fresh.edgeWord,
      day: from.day,
      dateLabel: from.dateLabel,
    } as Spread;
  };

  const projects = old.filter((s) => s.kind === 'project').map((s) => ({ ...s, hideTab: true, tabColor: PAGE_META.projects.color }));
  const contact = find('contact');

  c.spreads = [
    carry('cover', find('cover')),
    carry('about', find('profile')),
    structuralSpread('experience'),
    structuralSpread('projects'),
    ...projects,
    structuralSpread('services'),
    contact ? { ...carry('contact', contact), featuredArticleId: undefined } as Spread : structuralSpread('contact'),
    carry('doodles', find('moodboard')),
  ];
  if (!c.spreads.some((s) => s.id === c.settings.startSpreadId)) c.settings.startSpreadId = PAGE_META.cover.id;
  relabelProjects(c); // « 01 · Titre » pour le sommaire
  c.schemaVersion = 2;
  return c;
}
