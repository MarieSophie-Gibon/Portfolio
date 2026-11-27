/* ==================================================================
 * Modèle de données du Digital Sketchbook.
 * Tout le contenu éditable du site tient dans un seul objet
 * `PortfolioContent`, sérialisable en JSON (localStorage / API / DB).
 * ================================================================== */

/** Couleur hexadécimale `#RRGGBB`. */
export type HexColor = `#${string}`;

/** URL absolue, chemin `/…` ou DataURL (fallback upload en dev). */
export type ImageSrc = string;

export type LayoutStyle = 'light-hobonichi' | 'dark-punk-left';

export type SocialIcon = 'github' | 'linkedin' | 'instagram' | 'globe';

/** Illustrations SVG intégrées, utilisées quand aucune image n'est fournie. */
export type ArtworkPreset = 'neon-riot' | 'hex-os' | 'shadow-net' | 'kinetic-zine';

/* ------------------------------------------------------------------ */
/* Briques                                                             */
/* ------------------------------------------------------------------ */

export interface ImageAsset {
  /** Vide = on affiche l'illustration `preset` (ou un placeholder). */
  src: ImageSrc;
  alt: string;
  caption?: string;
  /** Média vidéo (mp4/webm) au lieu d'une image. */
  type?: 'image' | 'video';
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: SocialIcon;
}

export interface Stat {
  label: string;
  value: string;
}

export interface Education {
  id: string;
  period: string;
  degree: string;
  school: string;
}

export interface Skill {
  id: string;
  label: string;
  highlight: boolean;
}

export interface Experience {
  id: string;
  period: string;
  title: string;
  company: string;
  badge: string;
  bullets: string[];
}

/* ------------------------------------------------------------------ */
/* Auteur & réglages globaux                                           */
/* ------------------------------------------------------------------ */

export interface Author {
  name: string;
  /** Signature affichée en pied de page gauche (ex: "ALEX K. // RUNNER_26"). */
  alias: string;
  role: string;
  location: string;
  availability: string;
  email: string;
  bio: string;
  /** src vide = avatar illustré par défaut. */
  avatar: ImageAsset;
  socials: SocialLink[];
  education: Education[];
  skills: Skill[];
  experiences: Experience[];
}

export interface SketchbookSettings {
  /** Titre affiché dans le header centré (ex: "Sketchbook"). */
  title: string;
  /** Logo sticker en haut à gauche (PNG transparent conseillé). */
  logo: ImageAsset;
  /** Couverture du carnet fermé (affichée au chargement). */
  cover: BookCoverSettings;
  /** Double-page ouverte au chargement (id de spread). */
  startSpreadId: string;
  /** Fond du bureau derrière le carnet. */
  background: DeskBackgroundSettings;
}

/** Fonds prêts à l'emploi ('image' = image personnalisée). */
export type BackgroundPreset = 'neutral' | 'linen' | 'slate' | 'wood' | 'night' | 'image';

export interface DeskBackgroundSettings {
  preset: BackgroundPreset;
  /** Image personnalisée (utilisée quand preset = 'image'). */
  image: ImageAsset;
  /** Quadrillage léger par-dessus le fond. */
  grid: boolean;
  /** Image perso : voile sombre (0..0.7). */
  imageDim: number;
  /** Image perso : flou en px (0 = net). */
  imageBlur: number;
}

export interface BookCoverSettings {
  /** false = le carnet s'ouvre directement sur la première double-page. */
  enabled: boolean;
  title: string;
  subtitle: string;
  /** Petite mention en bas (ex. « VOL. 07 — 2026 »). */
  footer: string;
  /** Couleur de la couverture rigide. */
  color: HexColor;
  /** Couleur de l'élastique. */
  strap: HexColor;
  /** Visuel collé sur la couverture (src vide = aucun). */
  image: ImageAsset;
  stickers: DeskItem[];
}

/* ------------------------------------------------------------------ */
/* Articles / projets                                                  */
/* ------------------------------------------------------------------ */

export interface ProjectArticle {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  client: string;
  role: string;
  accent: HexColor;
  accentSecondary: HexColor;
  layout: LayoutStyle;
  /** Libellé court sous le Polaroid (ex: "WEBGL · AUDIO"). */
  shortTag: string;
  impact: string;
  summary: string;
  challenge: string;
  solution: string;
  deliverables: string[];
  tech: string[];
  stats: Stat[];
  /** Annotation manuscrite (police Caveat). */
  doodleNote: string;
  coverImage: ImageAsset;
  artwork?: ArtworkPreset;
  gallery: ImageAsset[];
  liveUrl: string;
  repoUrl: string;
}

/* ------------------------------------------------------------------ */
/* Contenus des spreads « fixes »                                      */
/* ------------------------------------------------------------------ */

export interface CoverContent {
  badge: string;
  title: string; // "\n" = retour à la ligne
  signature: string;
  stamp: string;
  barcode: string;
  manifestoKicker: string;
  manifestoTitle: string;
  manifestoText: string;
  turnHint: string;
}

export interface MoodboardContent {
  studyLabel: string;
  studyTag: string;
  studyCaption: string;
  quote: string;
  sketchLabel: string;
  sketchNote: string;
  inspirations: string;
}

export interface ContactContent {
  /** Grand titre de la page (ex. « Travaillons ensemble »). */
  title: string;
  kicker: string;
  thanks: string;
}

/** Page « Projets » (index des projets). */
export interface ProjectsPageContent {
  intro: string;
}

/** Une offre de la page « Services ». */
export interface ServiceItem {
  id: string;
  title: string;
  /** Ex. « à partir de 800 € » (facultatif). */
  price: string;
  description: string;
  details: string[];
}

export interface ServicesContent {
  intro: string;
  items: ServiceItem[];
}

/** Page « Doodles » : dessins et croquis déposés librement. */
export interface DoodlesContent {
  intro: string;
  items: ImageAsset[];
}

/** Footer caché : copyright + documents légaux. */
export interface LegalContent {
  /** Ex. « @marieso ». */
  owner: string;
  mentions: string;
  cgv: string;
}

/* ------------------------------------------------------------------ */
/* Spreads (doubles-pages) — union discriminée par `kind`              */
/* ------------------------------------------------------------------ */

interface SpreadCommon {
  id: string;
  /** Grand chiffre Hobonichi (ex: "08"). */
  day: string;
  /** Sous-titre de date (ex: "MERCREDI • MAI"). */
  dateLabel: string;
  /** Libellé long (header + pastille de l'éventail). */
  label: string;
  /** Mot vertical en outline sur le bord droit. */
  edgeWord: string;
  tabLabel: string;
  tabColor: HexColor;
  tabText: HexColor;
  tabRotate: number;
  edgeLeftColor: HexColor;
  edgeRightColor: HexColor;
  swatches: HexColor[];
  hideTab?: boolean;
  /** Stickers / images collés sur la double-page (positions en % de la double-page). */
  stickers?: DeskItem[];
  /** Contenu de la feuille « En savoir plus » (absent = feuille par défaut). */
  more?: MoreInfo;
}

export interface MoreLink {
  label: string;
  url: string;
}

/** Feuille de cahier supplémentaire qui glisse par-dessus le carnet. */
export interface MoreInfo {
  title: string;
  body: string;
  images: ImageAsset[];
  links: MoreLink[];
  /** Outils / technos (facultatif). */
  tools?: string[];
}

/** Home (titre, signature, manifeste). */
export interface CoverSpread extends SpreadCommon {
  kind: 'cover';
}
export interface AboutSpread extends SpreadCommon {
  kind: 'about';
}
export interface ExperienceSpread extends SpreadCommon {
  kind: 'experience';
}
export interface ProjectsSpread extends SpreadCommon {
  kind: 'projects';
}
export interface ServicesSpread extends SpreadCommon {
  kind: 'services';
}
export interface DoodlesSpread extends SpreadCommon {
  kind: 'doodles';
}
/** Ancien format (v1) : converti en « Doodles » au chargement. */
export interface MoodboardSpread extends SpreadCommon {
  kind: 'moodboard';
}
/** Ancien format (v1) : converti en « À propos » + « Expériences » au chargement. */
export interface ProfileSpread extends SpreadCommon {
  kind: 'profile';
}
export interface ProjectSpread extends SpreadCommon {
  kind: 'project';
  articleId: string;
}
export interface ContactSpread extends SpreadCommon {
  kind: 'contact';
  /** Projet mis en avant sur la page gauche (facultatif). */
  featuredArticleId?: string;
}

export type Spread =
  | CoverSpread
  | AboutSpread
  | ExperienceSpread
  | ProjectsSpread
  | ProjectSpread
  | ServicesSpread
  | ContactSpread
  | DoodlesSpread
  | MoodboardSpread
  | ProfileSpread;
export type SpreadKind = Spread['kind'];

/* ------------------------------------------------------------------ */
/* Décor du bureau (éléments posés autour du carnet)                   */
/* ------------------------------------------------------------------ */

export type DeskPreset =
  | 'washi-butter'
  | 'washi-lilac'
  | 'washi-blush'
  | 'washi-mint'
  | 'flower-pink'
  | 'flower-yellow'
  | 'star'
  | 'heart'
  | 'sparkle'
  | 'paperclip'
  /* Carnet de voyage */
  | 'stamp-fuji'
  | 'stamp-fern'
  | 'stamp-torii'
  | 'postmark-tokyo'
  | 'postmark-aotearoa'
  /* Grimoire & rétro gaming */
  | 'd20'
  | 'pixel-heart'
  | 'pixel-star'
  | 'press-start'
  /* Papiers (couleur + texte personnalisables) */
  | 'paper-parchment'
  | 'paper-ruled'
  | 'paper-torn'
  | 'postit';

/** sticker = liseré blanc découpé · photo = cadre polaroid · stamp = timbre dentelé · plain = image brute. */
export type DeskItemStyle = 'sticker' | 'photo' | 'stamp' | 'plain';

export interface DeskItem {
  id: string;
  kind: 'image' | 'preset';
  /** kind 'image' : URL / DataURL. */
  src?: string;
  /** kind 'preset' : sticker dessiné intégré. */
  preset?: DeskPreset;
  alt: string;
  /** Centre de l'élément, en % de la scène (0..100). */
  x: number;
  y: number;
  /** Largeur en px sur un écran de référence de 1440px (adaptée ensuite). */
  width: number;
  rotate: number;
  style: DeskItemStyle;
  /** Papiers : couleur choisie (sinon couleur par défaut du modèle). */
  color?: string;
  /** Papiers : texte manuscrit écrit dessus. */
  text?: string;
}

/* ------------------------------------------------------------------ */
/* Document racine                                                     */
/* ------------------------------------------------------------------ */

export interface PortfolioContent {
  /** 2 = structure Home / À propos / Expériences / Projets / Services / Contact / Doodles. */
  schemaVersion: 1 | 2;
  updatedAt: string; // ISO 8601
  settings: SketchbookSettings;
  author: Author;
  cover: CoverContent;
  moodboard: MoodboardContent;
  contact: ContactContent;
  projectsPage: ProjectsPageContent;
  services: ServicesContent;
  doodles: DoodlesContent;
  legal: LegalContent;
  articles: ProjectArticle[];
  /** Ordre de lecture du carnet. */
  spreads: Spread[];
  /** Éléments de décor sur le bureau (ordre = superposition). */
  deskItems: DeskItem[];
}

/* ------------------------------------------------------------------ */
/* Dessin Apple Pencil                                                 */
/* ------------------------------------------------------------------ */

export interface SketchPoint {
  x: number; // 0..1
  y: number; // 0..1
}

export interface SketchStroke {
  color: string;
  eraser: boolean;
  points: SketchPoint[];
}
