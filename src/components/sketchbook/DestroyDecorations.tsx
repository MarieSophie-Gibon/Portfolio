import { useId, type CSSProperties, type ReactNode } from 'react';

/* ==================================================================
 * Stickers die-cut, rubans, agrafes, tampons — accessoires SVG purs.
 * Tous décoratifs : pointer-events none + aria-hidden.
 * ================================================================== */

interface DecoProps {
  className?: string;
  rotate?: number;
}

export function MetallicPaperclip({ className = '', rotate = -8 }: DecoProps) {
  const gid = useId();
  const d = 'M12 24 V66 C12 75 24 75 24 66 V16 C24 6 8 6 8 16 V60 C8 66 18 66 18 60 V26';
  return (
    <svg
      viewBox="0 0 36 86"
      fill="none"
      className={`pointer-events-none select-none drop-shadow-[0_3px_4px_rgba(0,0,0,0.4)] ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      <path d={d} stroke="#1E2028" strokeWidth="5" strokeLinecap="round" />
      <path d={d} stroke={`url(#${gid})`} strokeWidth="3" strokeLinecap="round" />
      <defs>
        <linearGradient id={gid} x1="8" y1="6" x2="26" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export type TapeVariant = 'hazard' | 'duct' | 'pink' | 'cyan' | 'checker';

const TAPE_STYLES: Record<TapeVariant, CSSProperties> = {
  hazard: {
    backgroundImage: 'repeating-linear-gradient(-45deg, #FFB800 0px, #FFB800 6px, #13141A 6px, #13141A 12px)',
  },
  duct: {
    backgroundColor: '#7A828E',
    backgroundImage:
      'repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px), linear-gradient(180deg, rgba(255,255,255,0.22), rgba(0,0,0,0.22))',
  },
  pink: {
    backgroundColor: 'rgba(255, 30, 122, 0.86)',
    backgroundImage:
      'repeating-linear-gradient(45deg, rgba(255,255,255,0.22) 0px, rgba(255,255,255,0.22) 4px, transparent 4px, transparent 10px)',
  },
  cyan: {
    backgroundColor: 'rgba(0, 229, 255, 0.82)',
    backgroundImage:
      'repeating-linear-gradient(-45deg, rgba(19,20,26,0.22) 0px, rgba(19,20,26,0.22) 4px, transparent 4px, transparent 9px)',
  },
  checker: {
    backgroundColor: '#FFB800',
    backgroundImage:
      'linear-gradient(45deg, rgba(255,255,255,0.55) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.55) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.55) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.55) 75%)',
    backgroundSize: '10px 10px',
    backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
  },
};

export function WashiTape({ variant = 'hazard', className = '', rotate = -3 }: DecoProps & { variant?: TapeVariant }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none shadow-[0_2px_6px_rgba(0,0,0,0.35)] ${className}`}
      style={{
        ...TAPE_STYLES[variant],
        transform: `rotate(${rotate}deg)`,
        clipPath: 'polygon(0% 8%, 4% 0%, 96% 3%, 100% 18%, 97% 44%, 100% 72%, 95% 98%, 3% 100%, 0% 76%, 3% 45%)',
      }}
    />
  );
}

export function InkSplatter({ color = '#13141A', className = '', opacity = 0.22 }: { color?: string; className?: string; opacity?: number }) {
  return (
    <svg viewBox="0 0 120 120" className={`pointer-events-none select-none ${className}`} style={{ opacity }} aria-hidden="true">
      <path
        d="M58 28 C64 20, 74 26, 72 36 C82 32, 92 42, 82 52 C94 56, 92 70, 78 68 C82 80, 68 88, 60 76 C52 88, 36 82, 42 68 C28 68, 26 52, 38 48 C30 38, 42 26, 52 34 Z"
        fill={color}
      />
      <circle cx="20" cy="30" r="4.5" fill={color} />
      <circle cx="96" cy="24" r="3" fill={color} />
      <circle cx="104" cy="76" r="5" fill={color} />
      <circle cx="24" cy="92" r="3.5" fill={color} />
      <circle cx="78" cy="100" r="2.5" fill={color} />
      <circle cx="44" cy="14" r="2" fill={color} />
    </svg>
  );
}

export function GrungeStaples({ className = '', rotate = -6 }: DecoProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none flex flex-col gap-1 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="w-5 h-[3px] rounded-[1px] bg-gradient-to-r from-zinc-700 via-zinc-200 to-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.65)]" />
      <div className="w-5 h-[3px] rounded-[1px] bg-gradient-to-r from-zinc-800 via-zinc-300 to-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.65)] translate-x-0.5" />
    </div>
  );
}

const STAMP_MASK = 'repeating-linear-gradient(125deg, #000 0px, #000 6px, rgba(0,0,0,0.45) 6px, rgba(0,0,0,0.45) 8px)';

export function GrungeStamp({ text, color = '#FF1E7A', className = '', rotate = -8 }: DecoProps & { text: ReactNode; color?: string }) {
  return (
    <div
      className={`pointer-events-none select-none inline-block px-2 py-0.5 border-2 font-mono text-[8px] font-extrabold tracking-[0.22em] uppercase ${className}`}
      style={{
        color,
        borderColor: color,
        transform: `rotate(${rotate}deg)`,
        opacity: 0.78,
        maskImage: STAMP_MASK,
        WebkitMaskImage: STAMP_MASK,
      }}
    >
      {text}
    </div>
  );
}

export function SpikyMascotSticker({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 88 88" className={`pointer-events-none select-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.38)] ${className}`} aria-hidden="true">
      <path
        d="M44 6 L54 26 L77 18 L66 39 L84 54 L61 59 L64 81 L44 68 L24 81 L27 59 L4 54 L22 39 L11 18 L34 26 Z"
        fill="#FFFFFF"
        stroke="#FFFFFF"
        strokeWidth="9"
        strokeLinejoin="round"
      />
      <path
        d="M44 10 L53 28 L73 21 L63 39 L79 52 L58 56 L61 76 L44 64 L27 76 L30 56 L9 52 L25 39 L15 21 L35 28 Z"
        fill="#FF2E54"
        stroke="#13141A"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <ellipse cx="36" cy="43" rx="4.5" ry="6" fill="#FFFFFF" stroke="#13141A" strokeWidth="1.8" />
      <ellipse cx="51" cy="43" rx="4.5" ry="6" fill="#FFFFFF" stroke="#13141A" strokeWidth="1.8" />
      <circle cx="37.5" cy="44" r="2.2" fill="#13141A" />
      <circle cx="52.5" cy="44" r="2.2" fill="#13141A" />
      <path d="M35 54 Q43.5 62 52 54 Z" fill="#13141A" />
      <path d="M39 55 H48" stroke="#FFFFFF" strokeWidth="1.6" />
    </svg>
  );
}

export function LightningSticker({ color = '#B8FF00', className = '' }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 64 76" className={`pointer-events-none select-none drop-shadow-[0_4px_7px_rgba(0,0,0,0.35)] ${className}`} aria-hidden="true">
      <path d="M36 6 L10 42 H30 L24 70 L54 32 H34 Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="10" strokeLinejoin="round" />
      <path d="M36 8 L12 42 H31 L25 68 L52 32 H33 Z" fill={color} stroke="#13141A" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

export function CassetteSticker({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 68" className={`pointer-events-none select-none drop-shadow-[0_5px_9px_rgba(0,0,0,0.4)] ${className}`} aria-hidden="true">
      <rect x="4" y="4" width="92" height="60" rx="9" fill="#FFFFFF" />
      <rect x="9" y="9" width="82" height="50" rx="5" fill="#13141A" stroke="#13141A" strokeWidth="2" />
      <rect x="14" y="14" width="72" height="22" rx="2" fill="#FF1E7A" />
      <text x="19" y="24" fill="#FFFFFF" fontSize="7" fontFamily="monospace" fontWeight="bold">
        SIDE A // RUN_03
      </text>
      <rect x="24" y="28" width="52" height="14" rx="7" fill="#0B0C10" stroke="#B8FF00" strokeWidth="1.4" />
      <circle cx="35" cy="35" r="4.5" fill="#F4F2EA" />
      <circle cx="65" cy="35" r="4.5" fill="#F4F2EA" />
      <circle cx="35" cy="35" r="1.8" fill="#13141A" />
      <circle cx="65" cy="35" r="1.8" fill="#13141A" />
      <polygon points="24,59 30,48 70,48 76,59" fill="#272A36" />
    </svg>
  );
}

const BARCODE_WIDTHS = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 2, 1, 2];

export function BarcodeSticker({ code, className = '' }: { code: string; className?: string }) {
  let x = 8;
  const bars = BARCODE_WIDTHS.map((w, i) => {
    const el = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w * 1.6} height={20} fill="#13141A" /> : null;
    x += w * 2.4;
    return el;
  });
  return (
    <div
      aria-hidden="true"
      className={`inline-flex flex-col items-center bg-white px-2 py-1 rounded-[4px] border-2 border-white shadow-[0_4px_10px_rgba(0,0,0,0.28)] select-none pointer-events-none ${className}`}
    >
      <svg viewBox="0 0 88 20" className="w-16 h-3.5">
        {bars}
      </svg>
      <span className="font-mono text-[6.5px] font-bold tracking-[0.2em] text-[#13141A] mt-0.5">{code}</span>
    </div>
  );
}
