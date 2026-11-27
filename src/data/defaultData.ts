import type { HexColor, PortfolioContent, ProjectArticle } from '@/types/portfolio';

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

export const DEFAULT_CONTENT: PortfolioContent = {
  schemaVersion: 1,
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
    startSpreadId: 'sp-profile',
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
    kicker: '',
    thanks: '',
  },

  articles: [
    blankArticle('neon-riot', '#FF1E7A', '#B8FF00'),
    blankArticle('hex-os', '#00E5FF', '#FFB800'),
    blankArticle('shadow-net', '#B8FF00', '#FF1E7A', 'dark-punk-left'),
    blankArticle('kinetic-zine', '#8B5CF6', '#FF5E3A'),
  ],

  spreads: [
    {
      id: 'sp-cover',
      kind: 'cover',
      day: '',
      dateLabel: '',
      label: '',
      edgeWord: '',
      tabLabel: '',
      tabColor: '#FF1E7A',
      tabText: '#FFFFFF',
      tabRotate: -2.5,
      edgeLeftColor: '#FF1E7A',
      edgeRightColor: '#FFB800',
      swatches: ['#13141A', '#FF1E7A', '#00E5FF', '#B8FF00', '#FFB800'],
    },
    {
      id: 'sp-lab',
      kind: 'moodboard',
      day: '',
      dateLabel: '',
      label: '',
      edgeWord: '',
      tabLabel: '',
      tabColor: '#00E5FF',
      tabText: '#13141A',
      tabRotate: 1.5,
      edgeLeftColor: '#00E5FF',
      edgeRightColor: '#FF5E3A',
      swatches: ['#181920', '#E53E2E', '#FFB800', '#3B82F6', '#B8FF00'],
    },
    {
      id: 'sp-profile',
      kind: 'profile',
      day: '',
      dateLabel: '',
      label: '',
      edgeWord: '',
      tabLabel: '',
      tabColor: '#FFD400',
      tabText: '#13141A',
      tabRotate: -1.2,
      edgeLeftColor: '#8B5CF6',
      edgeRightColor: '#B8FF00',
      swatches: ['#13141A', '#FF5E3A', '#1F6F6D', '#8B5CF6', '#B8FF00'],
    },
    {
      id: 'sp-neon-riot',
      kind: 'project',
      articleId: 'neon-riot',
      day: '',
      dateLabel: '',
      label: '',
      edgeWord: '',
      tabLabel: '',
      tabColor: '#B8FF00',
      tabText: '#13141A',
      tabRotate: 2,
      edgeLeftColor: '#FF1E7A',
      edgeRightColor: '#FF1E7A',
      swatches: ['#13141A', '#FF1E7A', '#B8FF00', '#00E5FF', '#F4F2EA'],
    },
    {
      id: 'sp-hex-os',
      kind: 'project',
      articleId: 'hex-os',
      day: '',
      dateLabel: '',
      label: '',
      edgeWord: '',
      tabLabel: '',
      tabColor: '#A855F7',
      tabText: '#FFFFFF',
      tabRotate: -1.8,
      edgeLeftColor: '#00E5FF',
      edgeRightColor: '#00E5FF',
      swatches: ['#0D1118', '#00E5FF', '#FFB800', '#8B5CF6', '#F4F2EA'],
    },
    {
      id: 'sp-shadow-net',
      kind: 'project',
      articleId: 'shadow-net',
      day: '',
      dateLabel: '',
      label: '',
      edgeWord: '',
      tabLabel: '',
      tabColor: '#FF6B35',
      tabText: '#FFFFFF',
      tabRotate: 1.4,
      edgeLeftColor: '#B8FF00',
      edgeRightColor: '#B8FF00',
      swatches: ['#13141A', '#B8FF00', '#FF1E7A', '#7C3AED', '#F4F2EA'],
    },
    {
      id: 'sp-contact',
      kind: 'contact',
      featuredArticleId: 'kinetic-zine',
      day: '',
      dateLabel: '',
      label: '',
      edgeWord: '',
      tabLabel: '',
      tabColor: '#18181B',
      tabText: '#FFFFFF',
      tabRotate: -2,
      edgeLeftColor: '#FFB800',
      edgeRightColor: '#8B5CF6',
      swatches: ['#1A1B22', '#FF5E3A', '#FFB800', '#8B5CF6', '#22C55E'],
    },
  ],

  deskItems: [],
};
