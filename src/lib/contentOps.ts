import type { HexColor, LayoutStyle, PortfolioContent, ProjectArticle, ProjectSpread, Spread } from '@/types/portfolio';

/* Opérations pures sur le contenu (mutent le brouillon passé en argument). */

export const uid = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

/** Texte noir ou blanc selon la luminance du fond. */
export function contrastText(hex: string): HexColor {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return '#FFFFFF';
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#13141A' : '#FFFFFF';
}

/** Champs du formulaire « article » du tiroir admin. */
export interface ArticleFormValues {
  title: string;
  subtitle: string;
  day: string;
  dateLabel: string;
  tabLabel: string;
  accent: HexColor;
  accentSecondary: HexColor;
  layout: LayoutStyle;
  year: string;
  client: string;
  role: string;
  summary: string;
  challenge: string;
  solution: string;
  tech: string[];
  coverImage: string;
}

export function emptyArticleForm(): ArticleFormValues {
  return {
    title: 'NOUVEAU PROJET',
    subtitle: '',
    day: String(new Date().getDate()).padStart(2, '0'),
    dateLabel: '',
    tabLabel: 'NEW',
    accent: '#FF1E7A',
    accentSecondary: '#B8FF00',
    layout: 'light-hobonichi',
    year: String(new Date().getFullYear()),
    client: '',
    role: '',
    summary: '',
    challenge: '',
    solution: '',
    tech: [],
    coverImage: '',
  };
}

export function articleFormFrom(article: ProjectArticle, spread: Spread): ArticleFormValues {
  return {
    title: article.title,
    subtitle: article.subtitle,
    day: spread.day,
    dateLabel: spread.dateLabel,
    tabLabel: spread.tabLabel,
    accent: article.accent,
    accentSecondary: article.accentSecondary,
    layout: article.layout,
    year: article.year,
    client: article.client,
    role: article.role,
    summary: article.summary,
    challenge: article.challenge,
    solution: article.solution,
    tech: article.tech,
    coverImage: article.coverImage.src,
  };
}

function applyForm(article: ProjectArticle, spread: Spread, v: ArticleFormValues) {
  Object.assign(article, {
    title: v.title,
    subtitle: v.subtitle,
    accent: v.accent,
    accentSecondary: v.accentSecondary,
    layout: v.layout,
    year: v.year,
    client: v.client,
    role: v.role,
    summary: v.summary,
    challenge: v.challenge,
    solution: v.solution,
    tech: v.tech,
  });
  article.coverImage = { ...article.coverImage, src: v.coverImage };
  Object.assign(spread, {
    day: v.day,
    dateLabel: v.dateLabel,
    tabLabel: v.tabLabel,
    tabColor: v.accent,
    tabText: contrastText(v.accent),
    edgeWord: v.title.slice(0, 14),
    edgeLeftColor: v.accent,
    edgeRightColor: v.accentSecondary,
    swatches: ['#13141A', v.accent, v.accentSecondary, '#00E5FF', '#F4F2EA'],
  });
}

/** Rafraîchit les libellés « 01 · TITRE » selon l'ordre des articles. */
export function relabelProjects(c: PortfolioContent) {
  for (const s of c.spreads) {
    if (s.kind !== 'project') continue;
    const i = c.articles.findIndex((a) => a.id === s.articleId);
    const a = c.articles[i];
    if (a) s.label = a.title ? `${String(i + 1).padStart(2, '0')} · ${a.title}` : '';
  }
}

/** Remet `articles` dans l'ordre d'apparition des spreads (numérotation cohérente). */
function syncArticleOrder(c: PortfolioContent) {
  const order = new Map<string, number>();
  c.spreads.forEach((s, i) => {
    if (s.kind === 'project') order.set(s.articleId, i);
    if (s.kind === 'contact' && s.featuredArticleId) order.set(s.featuredArticleId, i);
  });
  c.articles.sort((a, b) => (order.get(a.id) ?? 1e9) - (order.get(b.id) ?? 1e9));
  relabelProjects(c);
}

/** Crée un article + sa double-page (après le dernier projet, sinon après la page Projets). Retourne l'id du spread. */
export function createArticle(c: PortfolioContent, v: ArticleFormValues): string {
  const article: ProjectArticle = {
    id: uid('art'),
    title: v.title,
    subtitle: '',
    year: '',
    client: '',
    role: '',
    accent: v.accent,
    accentSecondary: v.accentSecondary,
    layout: v.layout,
    shortTag: v.tech.slice(0, 2).join(' · ').toUpperCase() || 'PROJET',
    impact: '',
    summary: '',
    challenge: '',
    solution: '',
    deliverables: [],
    tech: [],
    stats: [
      { label: 'Stat', value: '—' },
      { label: 'Stat', value: '—' },
      { label: 'Stat', value: '—' },
    ],
    doodleNote: '« une petite note manuscrite »',
    coverImage: { src: '', alt: v.title },
    gallery: [],
    liveUrl: '',
    repoUrl: '',
  };
  const spread: ProjectSpread = {
    id: uid('sp'),
    kind: 'project',
    articleId: article.id,
    day: '',
    dateLabel: '',
    label: '',
    edgeWord: '',
    tabLabel: '',
    tabColor: v.accent,
    tabText: '#FFFFFF',
    tabRotate: Math.round((Math.random() * 4 - 2) * 10) / 10,
    edgeLeftColor: v.accent,
    edgeRightColor: v.accentSecondary,
    swatches: [],
  };
  applyForm(article, spread, v);
  c.articles.push(article);
  // Après le dernier projet ; sinon juste après l'index « Projets » ; sinon avant Services / Contact.
  const lastProject = c.spreads.map((s) => s.kind).lastIndexOf('project');
  const indexAt = c.spreads.findIndex((s) => s.kind === 'projects');
  const beforeAt = c.spreads.findIndex((s) => s.kind === 'services' || s.kind === 'contact');
  const at = lastProject >= 0 ? lastProject + 1 : indexAt >= 0 ? indexAt + 1 : beforeAt >= 0 ? beforeAt : c.spreads.length;
  spread.hideTab = true; // accessible depuis la page « Projets » et le sommaire
  c.spreads.splice(at, 0, spread);
  syncArticleOrder(c);
  return spread.id;
}

export function updateArticle(c: PortfolioContent, spreadId: string, v: ArticleFormValues) {
  const spread = c.spreads.find((s) => s.id === spreadId);
  if (!spread || spread.kind !== 'project') return;
  const article = c.articles.find((a) => a.id === spread.articleId);
  if (!article) return;
  applyForm(article, spread, v);
  relabelProjects(c);
}

export function duplicateSpread(c: PortfolioContent, spreadId: string): string | null {
  const i = c.spreads.findIndex((s) => s.id === spreadId);
  const spread = c.spreads[i];
  if (!spread || spread.kind !== 'project') return null;
  const article = c.articles.find((a) => a.id === spread.articleId);
  if (!article) return null;
  const copyA: ProjectArticle = { ...structuredClone(article), id: uid('art'), title: `${article.title} (copie)` };
  const copyS: ProjectSpread = { ...structuredClone(spread), id: uid('sp'), articleId: copyA.id };
  c.articles.push(copyA);
  c.spreads.splice(i + 1, 0, copyS);
  syncArticleOrder(c);
  return copyS.id;
}

/** Supprime une double-page projet et son article. */
export function deleteSpread(c: PortfolioContent, spreadId: string) {
  const spread = c.spreads.find((s) => s.id === spreadId);
  if (!spread || spread.kind !== 'project') return;
  c.spreads = c.spreads.filter((s) => s.id !== spreadId);
  c.articles = c.articles.filter((a) => a.id !== spread.articleId);
  for (const s of c.spreads) if (s.kind === 'contact' && s.featuredArticleId === spread.articleId) s.featuredArticleId = undefined;
  if (c.settings.startSpreadId === spreadId) c.settings.startSpreadId = c.spreads[0]?.id ?? '';
  syncArticleOrder(c);
}

export function moveSpread(c: PortfolioContent, spreadId: string, delta: -1 | 1) {
  const i = c.spreads.findIndex((s) => s.id === spreadId);
  const j = i + delta;
  if (i < 0 || j < 0 || j >= c.spreads.length) return;
  [c.spreads[i], c.spreads[j]] = [c.spreads[j], c.spreads[i]];
  syncArticleOrder(c);
}
