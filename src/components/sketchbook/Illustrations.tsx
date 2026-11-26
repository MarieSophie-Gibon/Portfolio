import { useId } from 'react';
import type { ArtworkPreset, ProjectArticle } from '@/types/portfolio';

/* ==================================================================
 * Illustrations SVG intégrées (utilisées tant qu'aucune image n'est
 * uploadée via l'admin).
 * ================================================================== */

export function PunkAvatarSVG() {
  const gid = useId();
  return (
    <svg viewBox="0 0 120 120" className="w-full aspect-square block bg-[#1A1C26]" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF1E7A" />
          <stop offset="55%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#00E5FF" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill={`url(#${gid})`} />
      <circle cx="60" cy="60" r="46" fill="#13141A" opacity="0.22" />
      <path d="M26 62 C24 30, 44 18, 66 20 C88 22, 96 38, 94 64 L84 56 L78 44 L44 42 L34 58 Z" fill="#13141A" />
      <path d="M58 20 L74 12 L72 28 L86 24 L80 38" fill="#00E5FF" stroke="#13141A" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M38 50 Q38 86 60 88 Q82 86 82 50 Q60 44 38 50 Z" fill="#FDE4CF" stroke="#13141A" strokeWidth="2.8" />
      <rect x="39" y="54" width="42" height="14" rx="5" fill="#13141A" />
      <rect x="43" y="58" width="14" height="5" rx="2" fill="#B8FF00" />
      <rect x="63" y="58" width="14" height="5" rx="2" fill="#FF1E7A" />
      <path d="M52 75 Q60 81 68 74" fill="none" stroke="#13141A" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="69" y="69" width="10" height="4" rx="1" fill="#FFB800" stroke="#13141A" strokeWidth="1.2" transform="rotate(-14 74 71)" />
      <path d="M26 120 L38 92 L60 100 L82 92 L94 120 Z" fill="#13141A" />
      <path d="M46 95 L60 112 L74 95" fill="none" stroke="#FF1E7A" strokeWidth="3" />
    </svg>
  );
}

export function CharcoalPortraitSketchSVG() {
  return (
    <svg viewBox="0 0 260 180" className="w-full h-full block" aria-hidden="true">
      <circle cx="52" cy="128" r="28" fill="#FFB800" opacity="0.82" />
      <circle cx="58" cy="124" r="22" fill="#FF5E3A" opacity="0.28" />
      <path
        d="M214 22 L220 38 L238 38 L224 48 L229 64 L214 54 L199 64 L204 48 L190 38 L208 38 Z"
        fill="none"
        stroke="#181A22"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <g stroke="#161820" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M74 66 C82 32, 134 24, 168 46 C192 62, 194 106, 164 130 C134 152, 86 144, 72 110" strokeWidth="3.2" />
        <path d="M64 78 C78 38, 138 14, 180 42 C204 58, 212 96, 198 134" strokeWidth="5.5" opacity="0.85" />
        <path d="M68 92 C90 148, 152 158, 194 122" strokeWidth="4" opacity="0.7" />
        <path d="M100 76 Q112 68 124 76 Q112 83 100 76 Z" strokeWidth="2.2" />
        <circle cx="112" cy="76" r="3" fill="#161820" />
        <path d="M140 78 Q152 70 164 78 Q152 85 140 78 Z" strokeWidth="2.2" />
        <circle cx="152" cy="78" r="3" fill="#161820" />
        <path d="M132 82 L128 98 L136 100" strokeWidth="2" />
        <path d="M116 112 Q132 120 148 110" strokeWidth="2.4" />
        <path d="M180 62 L206 54 M186 74 L214 68 M188 88 L216 84 M182 102 L212 100" strokeWidth="2" opacity="0.6" />
      </g>
      <path d="M96 34 L154 26" stroke="#00E5FF" strokeWidth="6" strokeLinecap="round" opacity="0.55" />
      <path d="M142 146 L224 140" stroke="#FF1E7A" strokeWidth="5" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

export function ArtworkPresetSVG({ preset }: { preset: ArtworkPreset }) {
  const gid = useId();

  if (preset === 'neon-riot') {
    return (
      <svg viewBox="0 0 360 190" className="w-full h-auto block bg-[#101118]" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF1E7A" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <rect width="360" height="190" fill="#101118" />
        <g opacity="0.22" stroke="#00E5FF" strokeWidth="1">
          {[30, 60, 90, 120, 150].map((y) => (
            <line key={y} x1="0" y1={y} x2="360" y2={y} />
          ))}
        </g>
        <polygon points="0,190 120,40 245,190" fill={`url(#${gid})`} opacity="0.85" />
        <polygon points="150,190 250,24 360,190" fill="#00E5FF" opacity="0.25" />
        <path
          d="M16 112 L52 112 L68 62 L84 148 L104 42 L124 156 L146 78 L168 124 L196 34 L218 150 L242 74 L268 134 L296 58 L316 112 L344 112"
          fill="none"
          stroke="#B8FF00"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <rect x="20" y="18" width="118" height="22" fill="#FF1E7A" />
        <text x="28" y="33" fill="#FFFFFF" fontFamily="monospace" fontSize="11" fontWeight="bold">
          LIVE // 148 BPM
        </text>
        <text x="22" y="172" fill="#FFFFFF" fontFamily="sans-serif" fontSize="22" fontWeight="900" letterSpacing="2">
          NEON RIOT 26
        </text>
      </svg>
    );
  }

  if (preset === 'hex-os') {
    return (
      <svg viewBox="0 0 360 190" className="w-full h-auto block bg-[#0B111C]" aria-hidden="true">
        <rect width="360" height="190" fill="#0B111C" />
        <g stroke="#00E5FF" strokeOpacity="0.16" strokeWidth="1">
          {[40, 80, 120, 160, 200, 240, 280, 320].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="190" />
          ))}
          {[38, 76, 114, 152].map((y) => (
            <line key={y} x1="0" y1={y} x2="360" y2={y} />
          ))}
        </g>
        <circle cx="112" cy="96" r="56" fill="none" stroke="#FFB800" strokeWidth="2.5" strokeDasharray="8 5" />
        <circle cx="112" cy="96" r="42" fill="none" stroke="#00E5FF" strokeWidth="2.5" />
        <polygon points="112,58 144,77 144,115 112,134 80,115 80,77" fill="#00E5FF" fillOpacity="0.14" stroke="#FFB800" strokeWidth="2" />
        <circle cx="112" cy="96" r="10" fill="#00E5FF" />
        <rect x="192" y="28" width="146" height="62" rx="6" fill="#131D2E" stroke="#00E5FF" strokeWidth="1.5" />
        <path d="M204 60 Q222 34 240 60 T276 60 T312 60 T328 60" fill="none" stroke="#00E5FF" strokeWidth="2.5" />
        <rect x="192" y="104" width="146" height="56" rx="6" fill="#131D2E" stroke="#FFB800" strokeWidth="1.5" />
        <rect x="206" y="120" width="84" height="8" rx="3" fill="#FFB800" />
        <rect x="206" y="136" width="114" height="8" rx="3" fill="#8B5CF6" />
        <text x="204" y="43" fill="#00E5FF" fontFamily="monospace" fontSize="8.5" fontWeight="bold">
          HEX.OS // CORE 0.9
        </text>
      </svg>
    );
  }

  if (preset === 'shadow-net') {
    return (
      <svg viewBox="0 0 360 190" className="w-full h-auto block bg-[#12131A]" aria-hidden="true">
        <rect width="360" height="190" fill="#12131A" />
        <rect x="18" y="18" width="324" height="154" rx="6" fill="#0A0B0F" stroke="#B8FF00" strokeWidth="2" />
        <rect x="18" y="18" width="324" height="24" fill="#B8FF00" />
        <text x="28" y="34" fill="#12131A" fontFamily="monospace" fontSize="10.5" fontWeight="bold">
          SHADOW_NET // RUNNER_ID: 77-ANARCHY
        </text>
        <text x="32" y="66" fill="#B8FF00" fontFamily="monospace" fontSize="10">
          &gt; DECRYPTING SECTOR_07... [OK]
        </text>
        <text x="32" y="86" fill="#00E5FF" fontFamily="monospace" fontSize="10">
          &gt; ICE FIREWALL BYPASSED (8.4ms)
        </text>
        <text x="32" y="106" fill="#FF1E7A" fontFamily="monospace" fontSize="10">
          &gt; AUDIO TAPE #03 READY TO PLAY
        </text>
        <rect x="32" y="126" width="120" height="10" fill="#232635" />
        <rect x="32" y="126" width="98" height="10" fill="#FF1E7A" />
        <rect x="32" y="144" width="120" height="10" fill="#232635" />
        <rect x="32" y="144" width="112" height="10" fill="#B8FF00" />
        <circle cx="276" cy="116" r="36" fill="none" stroke="#B8FF00" strokeWidth="1.5" opacity="0.6" />
        <circle cx="276" cy="116" r="20" fill="none" stroke="#B8FF00" strokeWidth="1" opacity="0.4" />
        <line x1="276" y1="116" x2="302" y2="94" stroke="#FF1E7A" strokeWidth="2.5" />
        <circle cx="294" cy="102" r="3.5" fill="#FF1E7A" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 360 190" className="w-full h-auto block bg-[#F4EFE4]" aria-hidden="true">
      <rect width="360" height="190" fill="#F4EFE4" />
      <rect x="18" y="16" width="160" height="158" fill="#13141A" transform="rotate(-2 98 95)" />
      <rect x="172" y="22" width="168" height="148" fill="#FF5E3A" transform="rotate(2 256 96)" />
      <text x="32" y="72" fill="#FFFFFF" fontFamily="sans-serif" fontSize="28" fontWeight="900">
        KINETIC
      </text>
      <text x="32" y="106" fill="#B8FF00" fontFamily="sans-serif" fontSize="28" fontWeight="900">
        ZINE #09
      </text>
      <text x="34" y="138" fill="#CBD5E1" fontFamily="monospace" fontSize="9.5">
        PRINT × MOTION × RAW TYPE
      </text>
      <circle cx="268" cy="96" r="42" fill="#F4EFE4" stroke="#13141A" strokeWidth="4" />
      <path d="M244 96 L292 96 M268 72 L268 120" stroke="#13141A" strokeWidth="5" strokeLinecap="round" />
      <rect x="196" y="34" width="76" height="18" fill="#FFB800" stroke="#13141A" strokeWidth="2" />
      <text x="204" y="47" fill="#13141A" fontFamily="monospace" fontSize="9" fontWeight="bold">
        FWA WINNER
      </text>
    </svg>
  );
}

/** Visuel principal d'un projet : image uploadée > illustration intégrée > placeholder halftone. */
export function ProjectVisual({ article }: { article: ProjectArticle }) {
  if (article.coverImage.src) {
    return (
      <img
        src={article.coverImage.src}
        alt={article.coverImage.alt}
        draggable={false}
        className="block w-full aspect-[360/190] object-cover"
      />
    );
  }
  if (article.artwork) return <ArtworkPresetSVG preset={article.artwork} />;
  return (
    <div
      className="halftone-dots flex w-full aspect-[360/190] items-center justify-center font-mono text-[10px] font-bold text-white"
      style={{ backgroundColor: article.accent }}
    >
      {article.title}
    </div>
  );
}
