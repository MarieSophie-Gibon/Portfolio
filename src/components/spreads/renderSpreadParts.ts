import type { SpreadParts } from '@/components/sketchbook/SpreadBase';
import type { Spread } from '@/types/portfolio';
import { renderContact } from './ContactSpread';
import { renderCoverManifesto } from './CoverManifestoSpread';
import { renderMoodboard } from './MoodboardSpread';
import { renderProfileExperience } from './ProfileExperienceSpread';
import { renderProjectArticle } from './ProjectArticleSpread';
import { findArticle, type SpreadCtx } from './spreadContext';

/** Aiguillage : type de spread → contenu des pages gauche/droite. */
export function renderSpreadParts(spread: Spread, ctx: SpreadCtx): SpreadParts {
  switch (spread.kind) {
    case 'cover':
      return renderCoverManifesto(ctx);
    case 'moodboard':
      return renderMoodboard(ctx);
    case 'profile':
      return renderProfileExperience(ctx);
    case 'project':
      return renderProjectArticle(ctx, findArticle(ctx.content, spread.articleId));
    case 'contact':
      return renderContact(ctx, spread);
  }
}
