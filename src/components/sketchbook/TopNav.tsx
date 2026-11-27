import { useEffect, useRef, useState, type ReactNode } from 'react';
import { List, Lock, Mail } from 'lucide-react';
import type { Spread } from '@/types/portfolio';

/** Étiquette papier façon sticker (liseré blanc découpé + légère inclinaison). */
function StickerTag({
  children,
  color,
  rotate,
  shape,
  active = false,
  onClick,
  ariaExpanded,
  label,
}: {
  children: ReactNode;
  color: string;
  rotate: number;
  shape: 'tag' | 'stamp';
  active?: boolean;
  onClick: () => void;
  ariaExpanded?: boolean;
  label: string;
}) {
  // tag : étiquette à bout pointu avec œillet ; stamp : timbre aux bords haut/bas dentelés.
  const clip = shape === 'tag' ? 'polygon(14px 0, 100% 0, 100% 100%, 14px 100%, 0 50%)' : undefined;
  const stampMask =
    shape === 'stamp'
      ? 'radial-gradient(circle 3px at 50% 0, transparent 96%, #000) top / 9px 51% repeat-x, radial-gradient(circle 3px at 50% 100%, transparent 96%, #000) bottom / 9px 51% repeat-x'
      : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={ariaExpanded}
      className="group relative block active:scale-95"
      // Ombre portée simple (plus de liseré blanc « sticker découpé »).
      style={{ filter: 'drop-shadow(0 3px 4px rgba(20,10,0,0.45))' }}
    >
      <span
        // Inclinaison via variable CSS pour que le survol puisse la redresser.
        className="relative flex h-8 items-center gap-1.5 pl-5 pr-3 text-ink transition-transform duration-300 ease-out [transform:rotate(var(--r))] group-hover:[transform:translateY(-2px)_rotate(0deg)]"
        style={{
          ['--r' as string]: active ? '0deg' : `${rotate}deg`,
          backgroundColor: color,
          clipPath: clip,
          WebkitMask: stampMask,
          mask: stampMask,
          paddingLeft: shape === 'stamp' ? 12 : undefined,
        }}
      >
        {shape === 'tag' && <span className="absolute left-[7px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#3A2414]/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]" />}
        {shape === 'stamp' && <span className="pointer-events-none absolute inset-[4px] rounded-[2px] border border-dashed border-ink/25" />}
        {children}
      </span>
    </button>
  );
}

interface Props {
  spreads: Spread[];
  activeIndex: number;
  onGoTo: (index: number) => void;
  onContact: () => void;
  /** Lien discret « Accès admin » en bas du sommaire (absent une fois connecté). */
  onAdminAccess?: () => void;
  /** Retour à la couverture (carnet fermé), si elle est activée. */
  onCover?: () => void;
  coverActive?: boolean;
  /** Ouvre le second carnet (Doodles). */
  onDoodles?: () => void;
}

/** Sommaire + Contact, à droite du logo. */
export function TopNav({ spreads, activeIndex, onGoTo, onContact, onAdminAccess, onCover, coverActive = false, onDoodles }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Fermeture au clic extérieur / Échap.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="ui-scaled absolute top-5 z-40 flex items-center gap-3 left-[84px] sm:left-[104px] lg:left-[122px]"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <StickerTag color="#FFE27A" rotate={-4} shape="tag" active={open} ariaExpanded={open} label="Sommaire" onClick={() => setOpen((v) => !v)}>
        <List className="h-3.5 w-3.5 shrink-0" />
        <span className="t-hand hidden font-bold sm:inline">Sommaire</span>
      </StickerTag>
      <StickerTag color="#F9C6D3" rotate={3} shape="stamp" label="Contact" onClick={onContact}>
        <Mail className="h-3.5 w-3.5 shrink-0" />
        <span className="t-hand hidden font-bold sm:inline">Contact</span>
      </StickerTag>

      {/* Fiche d'index */}
      {open && (
        <div className="absolute left-0 top-full mt-4 w-[min(calc(300px*var(--ui-scale)),88vw)] -rotate-1 origin-top-left animate-[index-in_220ms_ease-out]">
          <div
            className="absolute -top-2.5 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rotate-2 bg-[#CDBEF5]/90"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.55) 0 5px, transparent 5px 11px)',
              clipPath: 'polygon(0 8%, 4% 0, 96% 4%, 100% 16%, 98% 88%, 95% 100%, 3% 96%, 0 82%)',
            }}
          />
          <nav
            aria-label="Sommaire du carnet"
            className="ruled-paper rounded-md px-5 pb-4 pt-5 text-ink shadow-[0_24px_40px_-16px_rgba(20,60,80,0.55),0_4px_10px_-4px_rgba(20,60,80,0.3)]"
          >
            <p className="t-caption mb-2 font-mono uppercase tracking-[0.3em] text-gold">Sommaire</p>
            <ol>
              {onCover && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onCover();
                    }}
                    aria-current={coverActive ? 'page' : undefined}
                    className={`t-body flex w-full items-baseline gap-2 rounded-sm px-1 py-0.5 text-left italic transition-colors hover:bg-butter/50 ${coverActive ? 'bg-butter/70 font-semibold' : ''}`}
                  >
                    <span className="h-2 w-2 shrink-0 -translate-y-px rounded-full bg-blush ring-1 ring-black/10" />
                    <span className="truncate">Couverture</span>
                    <span className="mx-1 min-w-4 flex-1 -translate-y-0.75 border-b-2 border-dotted border-ink/20" />
                    <span className="t-hand shrink-0 text-gold">00</span>
                  </button>
                </li>
              )}
              {spreads.map((s, i) => {
                const current = i === activeIndex;
                return (
                  <li key={s.id} className={s.kind === 'project' ? 'pl-4' : ''}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onGoTo(i);
                      }}
                      aria-current={current ? 'page' : undefined}
                      className={`t-body group/row flex w-full items-baseline gap-2 rounded-sm px-1 py-0.5 text-left transition-colors hover:bg-butter/50 ${
                        current ? 'bg-butter/70 font-semibold' : ''
                      }`}
                    >
                      <span className="h-2 w-2 shrink-0 translate-y-[-1px] rounded-full ring-1 ring-black/10" style={{ backgroundColor: s.tabColor }} />
                      <span className={`truncate ${s.kind === 'project' ? 't-caption italic' : ''}`}>{s.label || s.tabLabel || (s.kind === 'project' ? 'Projet sans titre' : 'Sans titre')}</span>
                      <span className="mx-1 min-w-4 flex-1 translate-y-[-3px] border-b-2 border-dotted border-ink/20" />
                      <span className="t-hand shrink-0 text-gold">{s.day}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            {onDoodles && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onDoodles();
                }}
                className="t-body mt-2 flex w-full items-baseline gap-2 rounded-sm border-t border-dashed border-ink/15 px-1 pb-0.5 pt-2 text-left transition-colors hover:bg-butter/50"
              >
                <span className="h-2 w-2 shrink-0 -translate-y-px rounded-[2px] bg-[#B08A5E] ring-1 ring-black/10" />
                <span className="truncate">Doodles</span>
                <span className="t-hand ml-auto shrink-0 text-gold">carnet de croquis ↘</span>
              </button>
            )}
            {onAdminAccess && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onAdminAccess();
                }}
                className="t-caption mt-3 inline-flex items-center gap-1 font-mono text-slate-400 hover:text-ink"
              >
                <Lock className="h-3 w-3" /> Accès admin
              </button>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
