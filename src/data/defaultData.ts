import type { HexColor, PortfolioContent, ProjectArticle, Spread } from '@/types/portfolio';

/* Palette néon — source unique côté JS (miroir des tokens CSS). */
export const NEON = {
  magenta: '#FF1E7A',
  cyan: '#00E5FF',
  lime: '#B8FF00',
  hazard: '#FFB800',
  violet: '#8B5CF6',
  ink: '#13141A',
  paper: '#EDE9DD',
} as const satisfies Record<string, HexColor>;

export const PENCIL_COLORS: { id: string; name: string; hex: HexColor }[] = [
  { id: 'magenta', name: 'Punk Magenta', hex: '#FF1E7A' },
  { id: 'cyan', name: 'Electric Cyan', hex: '#00E5FF' },
  { id: 'lime', name: 'Acid Lime', hex: '#B8FF00' },
  { id: 'yellow', name: 'Hazard Yellow', hex: '#FFB800' },
  { id: 'charcoal', name: 'Fusain Noir', hex: '#14151B' },
  { id: 'chalk', name: 'Craie Blanche', hex: '#FFFFFF' },
];

/* ==================================================================
 * Contenu initial : seed de la base de données et fallback quand ni
 * l'API ni localStorage ne renvoient de contenu. Volontairement vide
 * (structure + couleurs seulement) : tout se remplit via l'admin.
 * ================================================================== */

/** Article vierge (structure + couleurs seulement). */
function blankArticle(
  id: string,
  accent: HexColor,
  accentSecondary: HexColor,
  layout: ProjectArticle['layout'] = 'light-hobonichi',
): ProjectArticle {
  return {
    id,
    title: '',
    subtitle: '',
    year: '',
    client: '',
    role: '',
    accent,
    accentSecondary,
    layout,
    shortTag: '',
    impact: '',
    summary: '',
    challenge: '',
    solution: '',
    deliverables: [],
    tech: [],
    stats: [],
    doodleNote: '',
    coverImage: { src: '', alt: '' },
    gallery: [],
    liveUrl: '',
    repoUrl: '',
  };
}

/* ------------------------------------------------------------------ */
/* Pages du carnet                                                     */
/* ------------------------------------------------------------------ */

type StructuralKind = 'cover' | 'about' | 'experience' | 'projects' | 'services' | 'contact' | 'doodles';

/** Nom et couleur d'onglet de chaque page structurelle (teintes terreuses). */
export const PAGE_META: Record<StructuralKind, { id: string; label: string; color: HexColor }> = {
  cover: { id: 'sp-cover', label: 'Home', color: '#9E3B32' },
  about: { id: 'sp-about', label: 'À propos', color: '#B8893A' },
  experience: { id: 'sp-experience', label: 'Expériences', color: '#4E6B34' },
  projects: { id: 'sp-projects', label: 'Projets', color: '#2C4A6E' },
  services: { id: 'sp-services', label: 'Services', color: '#6B4A8E' },
  contact: { id: 'sp-contact', label: 'Contact', color: '#3A2414' },
  doodles: { id: 'sp-doodles', label: 'Doodles', color: '#C0703A' },
};

const pageBase = (label: string, color: HexColor) => ({
  day: '',
  dateLabel: '',
  label,
  edgeWord: label,
  tabLabel: label,
  tabColor: color,
  tabText: '#FFFFFF' as HexColor,
  tabRotate: 0,
  edgeLeftColor: color,
  edgeRightColor: color,
  swatches: [] as HexColor[],
});

/** Double-page structurelle vierge (Home, À propos, …). */
export function structuralSpread(kind: StructuralKind): Spread {
  const m = PAGE_META[kind];
  return { id: m.id, kind, ...pageBase(m.label, m.color) } as Spread;
}

/** Double-page d'un projet (sans onglet : on y accède depuis « Projets »). */
export function projectSpread(id: string, articleId: string): Spread {
  return { id, kind: 'project', articleId, ...pageBase('', PAGE_META.projects.color), hideTab: true };
}

/** Ordre de lecture par défaut. */
export const DEFAULT_SPREADS: Spread[] = [
  structuralSpread('cover'),
  structuralSpread('about'),
  structuralSpread('experience'),
  structuralSpread('projects'),
  projectSpread('sp-neon-riot', 'neon-riot'),
  projectSpread('sp-hex-os', 'hex-os'),
  projectSpread('sp-shadow-net', 'shadow-net'),
  structuralSpread('services'),
  structuralSpread('contact'),
  structuralSpread('doodles'),
];

export const DEFAULT_CONTENT: PortfolioContent = {
  schemaVersion: 2,
  updatedAt: '2026-11-27T00:00:00.000Z',

  settings: {
    title: '',
    logo: { src: '/logo.png', alt: 'Logo' },
    cover: {
      enabled: true,
      title: '',
      subtitle: '',
      footer: '',
      color: '#7A4528', // cuir châtaigne
      strap: '#3A2516',
      image: { src: '/logo.png', alt: 'Logo' },
      stickers: [
        { id: 'cov-stamp-1', kind: 'preset', preset: 'stamp-fuji', alt: '', x: 72, y: 56, width: 86, rotate: 7, style: 'plain' },
        { id: 'cov-stamp-2', kind: 'preset', preset: 'stamp-torii', alt: '', x: 36, y: 62, width: 78, rotate: -9, style: 'plain' },
        { id: 'cov-stamp-3', kind: 'preset', preset: 'postmark-tokyo', alt: '', x: 58, y: 74, width: 120, rotate: -8, style: 'plain' },
      ],
    },
    startSpreadId: 'sp-cover',
    background: { preset: 'neutral', image: { src: '', alt: '' }, grid: false, imageDim: 0.15, imageBlur: 0 },
  },

  author: {
    name: '',
    alias: '',
    role: '',
    location: '',
    availability: '',
    email: '',
    bio: '',
    avatar: { src: '', alt: '' },
    socials: [],
    education: [],
    skills: [],
    experiences: [],
  },

  cover: {
    badge: '',
    title: '',
    signature: '',
    stamp: '',
    barcode: '',
    manifestoKicker: '',
    manifestoTitle: '',
    manifestoText: '',
    turnHint: '',
  },

  moodboard: {
    studyLabel: '',
    studyTag: '',
    studyCaption: '',
    quote: '',
    sketchLabel: '',
    sketchNote: '',
    inspirations: '',
  },

  contact: {
    title: '',
    kicker: '',
    thanks: '',
  },

  projectsPage: { intro: '' },
  services: { intro: '', items: [] },
  doodles: { intro: '', items: [] },
  legal: { owner: '@marieso', mentions: '', cgv: '' },

  articles: [
    blankArticle('neon-riot', '#2C4A6E', '#B8893A'),
    blankArticle('hex-os', '#2C4A6E', '#B8893A'),
    blankArticle('shadow-net', '#2C4A6E', '#B8893A'),
  ],

  spreads: DEFAULT_SPREADS,

  deskItems: [],
};
