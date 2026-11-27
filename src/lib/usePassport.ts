import { useCallback, useRef, useState } from 'react';

/* ==================================================================
 * Passeport de voyage : pages visitées (id de page → date ISO),
 * mémorisées dans le navigateur du visiteur.
 * ================================================================== */

const KEY = 'sketchbook:passport:v1';

function load(): Record<string, string> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function save(v: Record<string, string>) {
  try {
    if (Object.keys(v).length) localStorage.setItem(KEY, JSON.stringify(v));
    else localStorage.removeItem(KEY);
  } catch {
    /* stockage bloqué : le passeport reste en mémoire pour la visite */
  }
}

export function usePassport() {
  const [visited, setVisited] = useState<Record<string, string>>(load);
  const visitedRef = useRef(visited);
  visitedRef.current = visited;
  /** Dernier tampon obtenu (sert à l'animation « nouveau tampon »). */
  const [fresh, setFresh] = useState<string | null>(null);
  const freshTimer = useRef<number | undefined>(undefined);

  const stamp = useCallback((id: string) => {
    if (visitedRef.current[id]) return;
    const next = { ...visitedRef.current, [id]: new Date().toISOString() };
    visitedRef.current = next;
    setVisited(next);
    save(next);
    setFresh(id);
    window.clearTimeout(freshTimer.current);
    freshTimer.current = window.setTimeout(() => setFresh(null), 2600);
  }, []);

  const reset = useCallback(() => {
    visitedRef.current = {};
    setVisited({});
    save({});
  }, []);

  return { visited, fresh, stamp, reset };
}
