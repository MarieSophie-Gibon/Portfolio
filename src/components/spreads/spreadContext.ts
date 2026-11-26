import { createContext } from 'react';
import type { MouseEvent } from 'react';
import type { PortfolioContent, ProjectArticle } from '@/types/portfolio';

/** Ce dont chaque gabarit de spread a besoin pour se rendre, naviguer et s'éditer. */
export interface SpreadCtx {
  content: PortfolioContent;
  /** Modifie le brouillon (sans effet hors mode admin : les champs ne sont pas cliquables). */
  edit: (fn: (draft: PortfolioContent) => void) => void;
  goToArticle: (articleId: string) => void;
  openProject: (articleId: string) => void;
  copyEmail: () => void;
  copied: boolean;
}

/** Les éléments interactifs internes ne doivent pas tourner la page. */
export const stop = (e: MouseEvent) => e.stopPropagation();

export const projectNumber = (content: PortfolioContent, articleId: string) =>
  String(content.articles.findIndex((a) => a.id === articleId) + 1).padStart(2, '0');

export const findArticle = (content: PortfolioContent, id?: string): ProjectArticle | undefined =>
  id ? content.articles.find((a) => a.id === id) : undefined;

/** Raccourci : modifie un article du brouillon par son id. */
export const editArticle = (ctx: SpreadCtx, id: string, fn: (a: ProjectArticle) => void) =>
  ctx.edit((c) => {
    const a = c.articles.find((x) => x.id === id);
    if (a) fn(a);
  });

/** true dans la double-page active (sert à ne lire les vidéos que sur la page ouverte). */
export const ActiveSpreadContext = createContext(false);
