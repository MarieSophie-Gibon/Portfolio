import type { MoreInfo, PortfolioContent, Spread } from '@/types/portfolio';

/* Contenu par défaut des feuilles « En savoir plus » des pages de démo. */
const DEFAULT_MORE: Record<string, MoreInfo> = {
  'sp-cover': {
    title: 'Pourquoi un carnet ?',
    body: "Parce que tout commence toujours sur papier : des listes, des flèches, des couleurs qui débordent.\n\nCe portfolio reprend ce rituel — feuillette-le comme un vrai sketchbook, dessine dessus, et ouvre ces feuilles volantes pour les coulisses.",
    images: [],
    links: [],
  },
  'sp-lab': {
    title: 'Dans mon labo',
    body: "Mes outils du quotidien : carnets Hobonichi, feutres à alcool, iPad + Procreate, et beaucoup de washi tape.\n\nChaque projet démarre par une page de recherches : moodboard, palette, typographies et premiers croquis d'interface.",
    images: [],
    links: [],
  },
  'sp-profile': {
    title: 'Un peu plus sur moi',
    body: "J'aime les interfaces qui ont du caractère, les détails qui font sourire et les animations qui ont du poids.\n\nEn dehors du code : illustration, fanzines, jeux de rôle et longues balades photo.",
    images: [],
    links: [],
  },
  'sp-contact': {
    title: 'Travailler ensemble',
    body: "Je suis disponible pour des missions freelance : sites vitrines animés, portfolios, prototypes interactifs et design systems.\n\nÉcris-moi avec quelques mots sur ton projet, tes délais et ce qui t'inspire — je réponds sous 48h.",
    images: [],
    links: [],
  },
};

/** Feuille « En savoir plus » d'une page : contenu saisi > défaut de démo > défaut générique. */
export function getMoreInfo(spread: Spread, content: PortfolioContent): MoreInfo {
  if (spread.more) return spread.more;
  if (DEFAULT_MORE[spread.id]) return DEFAULT_MORE[spread.id];
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
