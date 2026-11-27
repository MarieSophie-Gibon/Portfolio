import { useEffect, useRef, useState, type CSSProperties } from 'react';

/* ==================================================================
 * Dé à 20 faces posé sur le bureau : un clic le lance.
 * 20 → « Coup critique ! » + gerbe d'étoiles ; 1 → « Échec critique… »
 * et le carnet tremble (événement « sketchbook:shake »).
 * ================================================================== */

const ROLL_MS = 900;
export const SHAKE_EVENT = 'sketchbook:shake';

function Die({ value, rolling }: { value: number | null; rolling: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={`w-full drop-shadow-[0_8px_8px_rgba(10,5,0,0.55)] ${rolling ? 'animate-[d20-roll_900ms_cubic-bezier(0.3,0.9,0.4,1)]' : ''}`} aria-hidden="true">
      <polygon points="50,3 93,27 93,73 50,97 7,73 7,27" fill="#4A2160" />
      <polygon points="50,22 77,68 23,68" fill="#6A3584" />
      <polygon points="50,3 93,27 50,22" fill="#7E44A0" />
      <polygon points="7,27 50,3 50,22" fill="#5A2A74" />
      <g fill="none" stroke="#E9C877" strokeWidth="2" strokeLinejoin="round">
        <polygon points="50,3 93,27 93,73 50,97 7,73 7,27" />
        <polygon points="50,22 77,68 23,68" />
        <path d="M50 3 L50 22 M93 27 L77 68 M93 27 L50 22 M7 27 L50 22 M7 27 L23 68 M93 73 L77 68 M7 73 L23 68 M50 97 L23 68 M50 97 L77 68" />
      </g>
      <text x="50" y="56" textAnchor="middle" fontFamily="Cinzel, serif" fontWeight="700" fontSize="18" fill="#F3DA94">
        {value ?? 20}
      </text>
    </svg>
  );
}

/** Gerbe d'étoiles et de petits tampons qui jaillissent du dé. */
function Burst() {
  const bits = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const dist = 70 + (i % 3) * 28;
    return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist - 40, glyph: i % 4 === 0 ? '◉' : '✦', color: ['#E9C877', '#9E3B32', '#2C4A6E', '#4E6B34'][i % 4] };
  });
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2">
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 text-[18px] animate-[burst_900ms_cubic-bezier(0.2,0.8,0.3,1)_forwards]"
          style={{ color: b.color, ['--dx' as string]: `${b.dx}px`, ['--dy' as string]: `${b.dy}px` } as CSSProperties}
        >
          {b.glyph}
        </span>
      ))}
    </div>
  );
}

export function D20Roller() {
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const roll = () => {
    if (rolling) return;
    timers.current.forEach((t) => window.clearTimeout(t));
    setResult(null);
    setRolling(true);
    // Les faces défilent pendant le roulé…
    const flicker = window.setInterval(() => setFace(1 + Math.floor(Math.random() * 20)), 70);
    const final = 1 + Math.floor(Math.random() * 20);
    timers.current = [
      flicker, // clearTimeout annule aussi un setInterval (même file d'identifiants)
      window.setTimeout(() => {
        window.clearInterval(flicker);
        setFace(final);
        setResult(final);
        setRolling(false);
        if (final === 1) window.dispatchEvent(new CustomEvent(SHAKE_EVENT));
      }, ROLL_MS),
      window.setTimeout(() => setResult(null), ROLL_MS + 2800),
    ];
  };

  const message = result === 20 ? 'Coup critique !' : result === 1 ? 'Échec critique…' : result ? `${result}` : null;

  return (
    <div className="fixed bottom-5 left-[88px] z-[16] w-[50px] origin-bottom-left max-sm:bottom-3 max-sm:left-[58px] max-sm:scale-75" onPointerDown={(e) => e.stopPropagation()}>
      {message && (
        <div
          role="status"
          // Alignée à gauche du dé (il est près du bord de l'écran) : la bulle ne déborde pas.
          className={`pointer-events-none absolute bottom-full left-0 mb-3 origin-bottom-left whitespace-nowrap rounded-md px-3 py-1 shadow-[0_8px_18px_-6px_rgba(10,5,0,0.6)] animate-[pop-in_450ms_cubic-bezier(0.2,1.6,0.4,1)] ${
            result === 20 ? 'bg-[#E9C877] text-[#3A2414]' : result === 1 ? 'bg-[#8E2F2A] text-[#F7E7C6]' : 'bg-[#F3E9D2] text-[#3A2414]'
          }`}
        >
          <span className={`t-fantasy ${result === 20 || result === 1 ? 'text-[15px] uppercase tracking-[0.1em]' : 'text-[20px]'}`}>{message}</span>
        </div>
      )}
      {result === 20 && <Burst />}
      <button
        type="button"
        onClick={roll}
        aria-label="Lancer le d20"
        title="Lancer le dé"
        className="block w-full rotate-[12deg] transition-transform duration-200 hover:-translate-y-1 hover:rotate-[4deg] active:scale-95"
      >
        <Die value={face} rolling={rolling} />
      </button>
    </div>
  );
}
