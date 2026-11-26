import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode, type SyntheticEvent } from 'react';
import { Plus, Star, X } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

/* ------------------------------------------------------------------ */
/* Portée d'édition : seules la double-page active et la modale sont   */
/* éditables (pas les copies de l'éventail ni la feuille qui tourne).  */
/* ------------------------------------------------------------------ */
export const EditScope = createContext(true);

export function useCanEdit() {
  const { isAdmin, editMode } = useAdmin();
  const inScope = useContext(EditScope);
  return isAdmin && editMode && inScope;
}

/** Empêche le clic / le swipe d'atteindre la page (sinon elle tourne). */
const swallow = (e: SyntheticEvent) => e.stopPropagation();

/** Contour pointillé néon des zones éditables. */
export const editableOutline =
  'pointer-events-auto outline-dashed outline-1 outline-offset-2 outline-magenta/50 hover:outline-2 hover:outline-magenta cursor-text rounded-[2px]';

const editorClass =
  'pointer-events-auto block w-full bg-white text-ink [-webkit-text-fill-color:#13141A] rounded-[3px] outline-2 outline-magenta px-1 -mx-1 resize-none font-[inherit] [font-size:inherit] [line-height:inherit] [letter-spacing:inherit] [text-transform:none] shadow-[0_4px_16px_rgba(0,0,0,0.35)]';

/* ------------------------------------------------------------------ */
/* Texte éditable                                                      */
/* ------------------------------------------------------------------ */

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
}

function AutoTextarea({
  initial,
  multiline,
  onCommit,
  onCancel,
}: {
  initial: string;
  multiline: boolean;
  onCommit: (v: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  useEffect(() => {
    const el = ref.current;
    el?.focus();
    el?.select();
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    if (e.key === 'Escape') onCancel();
    // Entrée valide ; Maj+Entrée = retour à la ligne (multiligne uniquement)
    if (e.key === 'Enter' && !(multiline && e.shiftKey)) {
      e.preventDefault();
      onCommit(draft);
    }
  };

  return (
    <textarea
      ref={ref}
      rows={1}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onCommit(draft)}
      onKeyDown={onKeyDown}
      onClick={swallow}
      onPointerDown={swallow}
      className={editorClass}
    />
  );
}

export function EditableText({ value, onSave, multiline = false, placeholder = 'Texte…', className = '' }: EditableTextProps) {
  const canEdit = useCanEdit();
  const [editing, setEditing] = useState(false);

  if (!canEdit) return value ? <span className={`whitespace-pre-line ${className}`}>{value}</span> : null;

  if (editing) {
    return (
      <AutoTextarea
        initial={value}
        multiline={multiline}
        onCancel={() => setEditing(false)}
        onCommit={(v) => {
          setEditing(false);
          const next = multiline ? v.trimEnd() : v.replace(/\s*\n\s*/g, ' ').trim();
          if (next !== value) onSave(next);
        }}
      />
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      title="Cliquer pour modifier"
      onClick={(e) => {
        swallow(e);
        setEditing(true);
      }}
      onPointerDown={swallow}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.stopPropagation();
          setEditing(true);
        }
      }}
      className={`whitespace-pre-line ${editableOutline} ${value ? '' : 'italic opacity-50'} ${className}`}
    >
      {value || placeholder}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Liste éditable (un élément par ligne)                               */
/* ------------------------------------------------------------------ */

interface EditableListProps {
  items: string[];
  onSave: (items: string[]) => void;
  /** Rendu normal de la liste (visiteur et mode édition hors saisie). */
  children: ReactNode;
  className?: string;
}

export function EditableList({ items, onSave, children, className = '' }: EditableListProps) {
  const canEdit = useCanEdit();
  const [editing, setEditing] = useState(false);

  if (!canEdit) return <>{children}</>;

  if (editing) {
    return (
      <div className={className} onClick={swallow} onPointerDown={swallow}>
        <AutoTextarea
          initial={items.join('\n')}
          multiline
          onCancel={() => setEditing(false)}
          onCommit={(v) => {
            setEditing(false);
            onSave(
              v
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean),
            );
          }}
        />
        <p className="mt-0.5 font-mono text-[7px] text-magenta">1 élément par ligne · Maj+Entrée = nouvelle ligne</p>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      title="Cliquer pour modifier la liste"
      onClick={(e) => {
        swallow(e);
        setEditing(true);
      }}
      onPointerDown={swallow}
      className={`${editableOutline} ${className}`}
    >
      {items.length ? children : <span className="italic opacity-50 text-[9px]">Liste vide — cliquer pour ajouter</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Petits outils d'élément (supprimer / mettre en avant / ajouter)     */
/* ------------------------------------------------------------------ */

const toolBtn =
  'inline-flex items-center justify-center w-4 h-4 rounded-full bg-magenta text-white shadow hover:scale-110 transition-transform';

export function ItemTools({ onRemove, onToggle, toggled }: { onRemove?: () => void; onToggle?: () => void; toggled?: boolean }) {
  const canEdit = useCanEdit();
  if (!canEdit) return null;
  return (
    <span className="inline-flex gap-0.5 ml-1 align-middle" onPointerDown={swallow}>
      {onToggle && (
        <button
          type="button"
          title={toggled ? 'Retirer la mise en avant' : 'Mettre en avant'}
          onClick={(e) => {
            swallow(e);
            onToggle();
          }}
          className={`${toolBtn} ${toggled ? 'bg-hazard text-ink' : 'bg-zinc-500'}`}
        >
          <Star className="w-2.5 h-2.5" />
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          title="Supprimer"
          onClick={(e) => {
            swallow(e);
            onRemove();
          }}
          className={toolBtn}
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  );
}

export function AddItemButton({ label, onClick, className = '' }: { label: string; onClick: () => void; className?: string }) {
  const canEdit = useCanEdit();
  if (!canEdit) return null;
  return (
    <button
      type="button"
      onPointerDown={swallow}
      onClick={(e) => {
        swallow(e);
        onClick();
      }}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-dashed border-magenta text-magenta bg-white/80 font-mono text-[8px] font-bold hover:bg-magenta hover:text-white transition-colors ${className}`}
    >
      <Plus className="w-2.5 h-2.5" /> {label}
    </button>
  );
}
