import type { SpreadParts } from '@/components/sketchbook/SpreadBase';
import type { Spread } from '@/types/portfolio';
import { renderContact } from './ContactSpread';
import { renderCoverManifesto } from './CoverManifestoSpread';
import { renderDoodles } from './DoodlesSpread';
import { renderMoodboard } from './MoodboardSpread';
import { renderAbout, renderExperience, renderProfileExperience } from './ProfileExperienceSpread';
import { renderProjectArticle } from './ProjectArticleSpread';
import { renderProjectsIndex } from './ProjectsIndexSpread';
import { renderServices } from './ServicesSpread';
import { findArticle, type SpreadCtx } from './spreadContext';

/** Aiguillage : type de page → contenu des pages gauche/droite. */
export function renderSpreadParts(spread: Spread, ctx: SpreadCtx): SpreadParts {
  switch (spread.kind) {
    case 'cover':
      return renderCoverManifesto(ctx);
    case 'about':
      return renderAbout(ctx);
    case 'experience':
      return renderExperience(ctx);
    case 'projects':
      return renderProjectsIndex(ctx);
    case 'project':
      return renderProjectArticle(ctx, findArticle(ctx.content, spread.articleId));
    case 'services':
      return renderServices(ctx);
    case 'contact':
      return renderContact(ctx);
    case 'doodles':
      return renderDoodles(ctx);
    // Anciens formats (v1), normalement convertis au chargement.
    case 'moodboard':
      return renderMoodboard(ctx);
    case 'profile':
      return renderProfileExperience(ctx);
  }
}
