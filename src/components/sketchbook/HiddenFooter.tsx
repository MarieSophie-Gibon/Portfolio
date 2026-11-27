import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { EditableText, useCanEdit } from '@/components/admin/EditableText';
import { leatherStyle } from './BookCover';

type LegalDoc = 'mentions' | 'cgv';
const TITLES: Record<LegalDoc, string> = { mentions: 'Mentions légales', cgv: 'Conditions générales de vente' };

/** Feuille de parchemin qui affiche (et permet d'éditer) un document légal. */
function LegalSheet({ doc, onClose }: { doc: LegalDoc; onClose: () => void }) {
  const { content, edit } = useAdmin();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1A0F08]/60 p-4 backdrop-blur-sm"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClose}
    >
      <article
        role="dialog"
        aria-modal="true"
        aria-label={TITLES[doc]}
        onClick={(e) => e.stopPropagation()}
        className="ui-scaled relative flex max-h-[86vh] w-[min(760px,94vw)] flex-col rounded-lg text-[#2E1C0E] shadow-[0_30px_80px_rgba(10,5,0,0.7)]"
        style={{
          backgroundColor: '#F3E9D2',
          backgroundImage: 'var(--tex-paper), radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(140,95,40,0.18) 100%)',
          backgroundSize: '320px 320px, 100% 100%',
        }}
      >
        <header className="flex items-center gap-3 border-b border-[#8E6A3E]/30 px-8 pb-3 pt-6">
          <h2 className="t-title t-fantasy uppercase tracking-[0.1em]">{TITLES[doc]}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-[#6B4A2B] hover:bg-[#5A3520]/10"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="t-body overflow-y-auto px-8 py-5 leading-relaxed text-[#4A2E18]">
          <EditableText
            value={content.legal[doc]}
            onSave={(v) => edit((c) => void (c.legal[doc] = v))}
            multiline
            placeholder={`Écris ici tes ${TITLES[doc].toLowerCase()}…`}
          />
        </div>
      </article>
    </div>
  );
}

/**
 * Footer caché : une petite languette de cuir en bas de l'écran ; au survol
 * (ou au toucher) elle se déplie : © année + propriétaire, mentions légales, CGV.
 * Les liens n'apparaissent que si le document est rempli (toujours en édition).
 */
export function HiddenFooter() {
  const { content } = useAdmin();
  const canEdit = useCanEdit();
  const [open, setOpen] = useState(false);
  const [doc, setDoc] = useState<LegalDoc | null>(null);
  const { owner, mentions, cgv } = content.legal;
  const year = new Date().getFullYear();
  const showMentions = canEdit || Boolean(mentions.trim());
  const showCgv = canEdit || Boolean(cgv.trim());

  return (
    <>
      <footer
        className="group fixed bottom-0 left-1/2 z-30 -translate-x-1/2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseLeave={() => setOpen(false)}
      >
        <div
          className={`flex items-center gap-3 overflow-hidden whitespace-nowrap rounded-t-lg px-4 text-[12px] text-[#F3DCA0] transition-all duration-300 ease-out group-hover:max-w-[90vw] group-hover:py-2 ${
            open ? 'max-w-[90vw] py-2' : 'max-w-10 py-1'
          }`}
          style={{ ...leatherStyle('#3B2416'), boxShadow: '0 -4px 14px rgba(10,5,0,0.4), inset 0 1px 0 rgba(233,207,142,0.3)' }}
        >
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Informations légales"
            className="t-fantasy shrink-0 text-[13px] text-[#E9CF8E]"
          >
            ©
          </button>
          <span className="t-fantasy tracking-[0.08em]">
            {year} {owner || '@marieso'} — Tous droits réservés
          </span>
          {showMentions && (
            <>
              <span className="text-[#E9CF8E]/50">·</span>
              <button type="button" onClick={() => setDoc('mentions')} className="underline decoration-[#E9CF8E]/40 underline-offset-2 hover:text-white">
                Mentions légales
              </button>
            </>
          )}
          {showCgv && (
            <>
              <span className="text-[#E9CF8E]/50">·</span>
              <button type="button" onClick={() => setDoc('cgv')} className="underline decoration-[#E9CF8E]/40 underline-offset-2 hover:text-white">
                CGV
              </button>
            </>
          )}
        </div>
      </footer>
      {doc && <LegalSheet doc={doc} onClose={() => setDoc(null)} />}
    </>
  );
}
