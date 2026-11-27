import { useEffect, useId, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { leatherStyle } from './BookCover';

/* ==================================================================
 * Passeport de voyage : chaque page visitée y imprime un tampon.
 * Fermé dans le coin bas gauche du bureau ; un clic l'ouvre.
 * Toutes les pages visitées → sceau doré « carnet complet ».
 * ================================================================== */

export interface PassportEntry {
  id: string;
  label: string;
  color: string;
}

const SHAPES = ['circle', 'rect', 'hex', 'oval'] as const;
type Shape = (typeof SHAPES)[number];

const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getFullYear()).slice(2)}`;
};

/** Tampon encré (forme variée, texte circulaire ou droit, léger flou d'encre). */
export function StampMark({ label, date, color, shape, rotate = 0 }: { label: string; date?: string; color: string; shape: Shape; rotate?: number }) {
  const id = 'st' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const text = label.toUpperCase();
  return (
    <svg viewBox="0 0 120 120" className="w-full" style={{ transform: `rotate(${rotate}deg)`, mixBlendMode: 'multiply' }} aria-hidden="true">
      <defs>
        <filter id={`${id}f`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" />
          <feDisplacementMap in="SourceGraphic" scale="2.2" />
        </filter>
        <path id={`${id}p`} d="M60 60 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
      </defs>
      <g filter={`url(#${id}f)`} fill="none" stroke={color} opacity="0.85">
        {shape === 'circle' && (
          <>
            <circle cx="60" cy="60" r="52" strokeWidth="3.5" />
            <circle cx="60" cy="60" r="30" strokeWidth="1.6" />
            <text fill={color} stroke="none" fontFamily="Cinzel, serif" fontWeight="700" fontSize="11" letterSpacing="2">
              <textPath href={`#${id}p`}>{`${text} ✦ ${text} ✦`}</textPath>
            </text>
            {date && (
              <text x="60" y="65" textAnchor="middle" fill={color} stroke="none" fontFamily="Silkscreen, monospace" fontSize="11">
                {date}
              </text>
            )}
          </>
        )}
        {shape !== 'circle' && (
          <>
            {shape === 'rect' && <rect x="10" y="24" width="100" height="72" rx="8" strokeWidth="3.5" />}
            {shape === 'hex' && <polygon points="60,8 108,34 108,86 60,112 12,86 12,34" strokeWidth="3.5" />}
            {shape === 'oval' && <ellipse cx="60" cy="60" rx="54" ry="40" strokeWidth="3.5" />}
            <line x1="24" y1={shape === 'hex' ? 52 : 50} x2="96" y2={shape === 'hex' ? 52 : 50} strokeWidth="1.4" />
            <text x="60" y={shape === 'hex' ? 46 : 44} textAnchor="middle" fill={color} stroke="none" fontFamily="Cinzel, serif" fontWeight="700" fontSize={text.length > 9 ? 10 : 13} letterSpacing="1.5">
              {text}
            </text>
            {date && (
              <text x="60" y={shape === 'hex' ? 72 : 70} textAnchor="middle" fill={color} stroke="none" fontFamily="Silkscreen, monospace" fontSize="12">
                {date}
              </text>
            )}
            <text x="60" y={shape === 'hex' ? 90 : 86} textAnchor="middle" fill={color} stroke="none" fontSize="10">
              ✦ ✦ ✦
            </text>
          </>
        )}
      </g>
    </svg>
  );
}

/** Rose des vents dorée (emblème de la couverture). */
function Emblem() {
  return (
    <svg viewBox="0 0 60 60" className="w-[46%]" aria-hidden="true">
      <g fill="none" stroke="#E3BF6A" strokeWidth="1.6">
        <circle cx="30" cy="30" r="20" />
        <circle cx="30" cy="30" r="13" strokeWidth="0.8" />
        <path d="M30 4 L34 26 L30 30 L26 26 Z M30 56 L34 34 L30 30 L26 34 Z M4 30 L26 26 L30 30 L26 34 Z M56 30 L34 26 L30 30 L34 34 Z" fill="rgba(227,191,106,0.35)" />
      </g>
    </svg>
  );
}

interface Props {
  entries: PassportEntry[];
  visited: Record<string, string>;
  fresh: string | null;
  onReset: () => void;
}

export function Passport({ entries, visited, fresh, onReset }: Props) {
  const [open, setOpen] = useState(false);
  const done = entries.filter((e) => visited[e.id]).length;
  const complete = entries.length > 0 && done === entries.length;
  const freshEntry = entries.find((e) => e.id === fresh);
  const freshIndex = entries.findIndex((e) => e.id === fresh);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopImmediatePropagation();
      setOpen(false);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open]);

  return (
    <>
      {/* Passeport fermé (coin bas gauche) */}
      <div className="fixed bottom-4 left-4 z-[16] origin-bottom-left max-sm:bottom-2 max-sm:left-2 max-sm:scale-75" onPointerDown={(e) => e.stopPropagation()}>
        {freshEntry && (
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-24 -translate-x-1/2 animate-[stamp-thunk_600ms_cubic-bezier(0.2,1.6,0.4,1)]">
            <StampMark label={freshEntry.label} date={shortDate(visited[freshEntry.id])} color={freshEntry.color} shape={SHAPES[freshIndex % SHAPES.length]} rotate={-8} />
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Passeport de voyage : ${done} page${done > 1 ? 's' : ''} sur ${entries.length}`}
          title="Passeport de voyage"
          className={`relative flex h-[76px] w-[56px] -rotate-[8deg] flex-col items-center justify-center gap-1 rounded-[4px] transition-transform duration-300 hover:-translate-y-1 hover:-rotate-[4deg] ${fresh ? 'animate-[passport-bump_500ms_ease-out]' : ''}`}
          style={{ ...leatherStyle('#5E1F28'), boxShadow: '0 10px 18px -8px rgba(10,5,0,0.7), inset 0 0 0 1px rgba(0,0,0,0.3), inset 3px 0 0 rgba(0,0,0,0.25)' }}
        >
          <Emblem />
          <span className="font-pixel text-[9px] leading-none text-[#E3BF6A]">
            {done}/{entries.length}
          </span>
          {complete && <span className="absolute -right-2 -top-2 h-5 w-5 rounded-full shadow" style={{ background: 'radial-gradient(circle at 35% 30%, #FBE7B0, #C9A24E 55%, #7A5622)' }} />}
        </button>
      </div>

      {/* Passeport ouvert */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1A0F08]/60 p-4 backdrop-blur-sm"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Passeport de voyage"
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-[min(760px,94vw)] animate-[sketch-open_380ms_cubic-bezier(0.22,1,0.36,1)] gap-[3px] rounded-lg p-[9px] max-sm:flex-col"
            style={{ ...leatherStyle('#5E1F28'), boxShadow: '0 30px 70px -20px rgba(10,5,0,0.75)' }}
          >
            {[0, 1].map((page) => {
              const half = Math.ceil(entries.length / 2);
              const list = entries.slice(page * half, (page + 1) * half);
              return (
                <div
                  key={page}
                  className={`relative min-h-[340px] flex-1 px-6 pb-5 pt-5 ${page === 0 ? 'rounded-l-md' : 'rounded-r-md'}`}
                  style={{
                    backgroundColor: '#F1E9D6',
                    // Guilloches de passeport
                    backgroundImage:
                      'var(--tex-paper), repeating-radial-gradient(circle at 50% 120%, transparent 0 9px, rgba(94,31,40,0.06) 9px 10px), linear-gradient(' +
                      (page === 0 ? '270deg' : '90deg') +
                      ', rgba(60,30,10,0.14), transparent 10%)',
                    backgroundSize: '320px 320px, 100% 100%, 100% 100%',
                  }}
                >
                  {page === 0 && (
                    <p className="t-fantasy mb-3 text-center text-[13px] uppercase tracking-[0.3em] text-[#5E1F28]">Passeport · {done}/{entries.length}</p>
                  )}
                  {page === 1 && <p className="mb-3 text-center font-pixel text-[10px] uppercase tracking-[0.2em] text-[#8A6A48]">Visas</p>}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {list.map((e, k) => {
                      const i = page * half + k;
                      const date = visited[e.id];
                      return (
                        <div key={e.id} className="flex flex-col items-center">
                          {date ? (
                            <div className="w-[92px]">
                              <StampMark label={e.label} date={shortDate(date)} color={e.color} shape={SHAPES[i % SHAPES.length]} rotate={((i * 37) % 24) - 12} />
                            </div>
                          ) : (
                            <div className="flex h-[92px] w-[92px] items-center justify-center rounded-full border-2 border-dashed border-[#8A6A48]/35">
                              <span className="t-fantasy text-[11px] uppercase tracking-[0.12em] text-[#8A6A48]/70">{e.label}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {page === 1 && complete && (
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <span
                        className="flex h-14 w-14 items-center justify-center rounded-full text-[#5E3A10] shadow-[0_4px_8px_rgba(60,35,10,0.45)]"
                        style={{ background: 'radial-gradient(circle at 35% 30%, #FBE7B0, #D8B36A 50%, #8C6A2A)' }}
                      >
                        ✦
                      </span>
                      <p className="t-hand text-[20px] text-[#5E1F28]">Carnet complet !</p>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer le passeport"
              className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#F3E9D2] text-[#3A2414] shadow-[0_4px_10px_rgba(10,5,0,0.45)] ring-2 ring-[#5E1F28] transition-transform hover:rotate-90"
            >
              <X className="h-4 w-4" />
            </button>
            {done > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="absolute -bottom-9 right-0 inline-flex items-center gap-1 text-xs text-[#F3E9D2]/70 hover:text-[#F3E9D2]"
              >
                <RotateCcw className="h-3 w-3" /> Effacer les tampons
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
