import type { CSSProperties, ReactNode } from 'react';
import type { DeskItem, DeskPreset } from '@/types/portfolio';

/* ==================================================================
 * Papiers posables (bureau, couverture, pages) : parchemin, feuille
 * lignée, note déchirée, post-it. Couleur et texte personnalisables
 * (DeskItem.color / DeskItem.text). Ombres orientées vers le bas à
 * droite (lumière en haut à gauche) pour donner du relief.
 * ================================================================== */

export type PaperPreset = Extract<DeskPreset, 'paper-parchment' | 'paper-ruled' | 'paper-torn' | 'postit'>;

export const PAPER_PRESETS: PaperPreset[] = ['paper-parchment', 'paper-ruled', 'paper-torn', 'postit'];
export const isPaperPreset = (p?: DeskPreset): p is PaperPreset => Boolean(p && (PAPER_PRESETS as string[]).includes(p));

/** Couleurs proposées (la 1re est celle par défaut). */
export const PAPER_COLORS: Record<PaperPreset, string[]> = {
  'paper-parchment': ['#E6D3AA', '#EFE3C6', '#D9C49A', '#E9DCC9', '#CFB98E'],
  'paper-ruled': ['#F3EBDD', '#FBF7EE', '#EDE3CF', '#E8EEF2'],
  'paper-torn': ['#EDE1C4', '#F3EAD6', '#E2D1AC', '#E9E2D6'],
  postit: ['#E8D27E', '#E9B8B0', '#BFD3B0', '#B9CDE0', '#D9C2E6', '#F0C48E'],
};

const TORN =
  'polygon(0 2%, 7% 0, 22% 1.6%, 41% 0.4%, 63% 1.8%, 82% 0.2%, 100% 1.4%, 99% 24%, 100% 51%, 98.8% 77%, 100% 99%, 78% 98.2%, 55% 100%, 33% 98.4%, 14% 100%, 0 98%, 1.2% 72%, 0 47%, 1% 21%)';
const SHADOW = '3px 5px 4px rgba(15,6,0,0.28), 12px 18px 22px -6px rgba(15,6,0,0.42)';
const RULED = 'repeating-linear-gradient(180deg, transparent 0 8.5%, rgba(110,130,160,0.28) 8.5% calc(8.5% + 1px))';

/** Texte manuscrit, dimensionné selon la largeur du papier (unités cqw). */
function Writing({ text, size, inset, color = 'rgba(48,30,14,0.85)' }: { text?: string; size: number; inset: string; color?: string }) {
  if (!text) return null;
  return (
    <p
      className="absolute overflow-hidden whitespace-pre-line font-hand leading-[1.15]"
      style={{ inset, fontSize: `${size}cqw`, color, fontFamily: 'var(--font-hand)' }}
    >
      {text}
    </p>
  );
}

function Sheet({ color, aspect, torn, aged = true, children, style }: { color: string; aspect: string; torn?: boolean; aged?: boolean; children?: ReactNode; style?: CSSProperties }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: aspect, containerType: 'inline-size' }}>
      <div className="absolute inset-0" style={{ boxShadow: SHADOW, borderRadius: 2 }} />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          backgroundColor: color,
          backgroundImage: aged
            ? 'var(--tex-paper), radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(125,80,30,0.35) 100%)'
            : 'var(--tex-paper)',
          backgroundSize: '320px 320px, 100% 100%',
          clipPath: torn ? TORN : undefined,
          ...style,
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,250,235,0.22) 0%, transparent 45%, rgba(40,20,5,0.1) 100%)' }} />
        {children}
      </div>
    </div>
  );
}

export function Parchment({ item }: { item?: DeskItem }) {
  return (
    <Sheet color={item?.color ?? PAPER_COLORS['paper-parchment'][0]} aspect="4 / 3" torn>
      <Writing text={item?.text} size={7.5} inset="12% 10%" />
    </Sheet>
  );
}

export function RuledSheet({ item }: { item?: DeskItem }) {
  return (
    <Sheet color={item?.color ?? PAPER_COLORS['paper-ruled'][0]} aspect="3 / 4" aged={false}>
      <div className="absolute inset-0" style={{ backgroundImage: RULED, backgroundPosition: '0 12%' }} />
      <div className="absolute inset-y-0 left-[13%] w-px bg-[rgba(190,90,90,0.4)]" />
      {/* Coin soulevé */}
      <div
        className="absolute bottom-0 right-0 h-[14%] w-[14%]"
        style={{ background: 'linear-gradient(135deg, transparent 48%, rgba(255,248,230,0.8) 52%, #D9C69F 72%, rgba(60,30,8,0.25) 100%)' }}
      />
      <Writing text={item?.text} size={8.5} inset="9% 8% 8% 17%" />
    </Sheet>
  );
}

export function TornNote({ item }: { item?: DeskItem }) {
  return (
    <Sheet color={item?.color ?? PAPER_COLORS['paper-torn'][0]} aspect="1 / 1.1" torn>
      <Writing text={item?.text} size={10} inset="12% 11%" />
    </Sheet>
  );
}

export function PostIt({ item }: { item?: DeskItem }) {
  const color = item?.color ?? PAPER_COLORS.postit[0];
  return (
    <div className="relative w-full" style={{ aspectRatio: '1 / 1', containerType: 'inline-size' }}>
      {/* Ombre plus forte en bas : le post-it n'est collé qu'en haut */}
      <div className="absolute inset-x-[4%] bottom-[-4%] top-[30%]" style={{ background: 'rgba(15,6,0,0.4)', filter: 'blur(8px)', transform: 'skewX(-4deg) translateX(6%)' }} />
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: color,
          backgroundImage:
            'var(--tex-paper), linear-gradient(180deg, rgba(0,0,0,0.06) 0 14%, transparent 14%), linear-gradient(170deg, transparent 55%, rgba(255,255,255,0.28) 80%, rgba(0,0,0,0.12) 100%)',
          backgroundSize: '320px 320px, 100% 100%, 100% 100%',
          borderRadius: '1px 1px 3px 14px / 1px 1px 3px 8px',
        }}
      >
        <Writing text={item?.text} size={13} inset="20% 10% 8% 10%" />
      </div>
    </div>
  );
}
