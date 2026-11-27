import type { ReactNode } from 'react';
import { useCanEdit } from './EditableText';

/**
 * Affiche un bloc s'il a du contenu, ou toujours en mode édition
 * (pour pouvoir le remplir). Les pages restent neutres quand elles sont vides.
 */
export function ShowIf({ has, children }: { has: unknown; children: ReactNode }) {
  const canEdit = useCanEdit();
  return canEdit || Boolean(has) ? <>{children}</> : null;
}

/** Vrai si au moins une des valeurs est un texte non vide ou une liste non vide. */
export const filled = (...values: unknown[]) =>
  values.some((v) => (Array.isArray(v) ? v.length > 0 : typeof v === 'string' ? v.trim() !== '' : Boolean(v)));
