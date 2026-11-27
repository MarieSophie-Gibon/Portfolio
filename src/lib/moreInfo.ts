import type { MoreInfo, PortfolioContent, Spread } from '@/types/portfolio';

/** La feuille « En savoir plus » de cette page a-t-elle quelque chose à montrer ? */
export function hasMoreContent(spread: Spread, content: PortfolioContent): boolean {
  const nonEmpty = (v: string | undefined) => Boolean(v && v.trim() && v !== '#');
  if (spread.kind === 'project') {
    const a = content.articles.find((x) => x.id === spread.articleId);
    if (
      a &&
      (nonEmpty(a.summary) || nonEmpty(a.challenge) || nonEmpty(a.solution) || nonEmpty(a.liveUrl) || nonEmpty(a.repoUrl) ||
        a.gallery.length > 0 || nonEmpty(a.coverImage.src) || a.tech.length > 0 || a.deliverables.length > 0)
    )
      return true;
  }
  const m = spread.more;
  return Boolean(m && (nonEmpty(m.body) || m.images.length || m.links.length || m.tools?.length));
}

/** Feuille « En savoir plus » d'une page : contenu saisi > défaut générique. */
export function getMoreInfo(spread: Spread, content: PortfolioContent): MoreInfo {
  if (spread.more) return spread.more;
  if (spread.kind === 'project') {
    const a = content.articles.find((x) => x.id === spread.articleId);
    if (a) {
      return {
        title: `Coulisses — ${a.title}`,
        body: [a.challenge && `Le défi : ${a.challenge}`, a.solution && `La solution : ${a.solution}`].filter(Boolean).join('\n\n'),
        images: a.gallery,
        links: [
          ...(a.liveUrl && a.liveUrl !== '#' ? [{ label: 'Voir le projet en ligne', url: a.liveUrl }] : []),
          ...(a.repoUrl && a.repoUrl !== '#' ? [{ label: 'Code source', url: a.repoUrl }] : []),
        ],
      };
    }
  }
  return { title: spread.label, body: '', images: [], links: [] };
}
