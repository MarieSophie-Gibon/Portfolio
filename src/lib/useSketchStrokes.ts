import { useCallback, useEffect, useState } from 'react';
import type { SketchStroke } from '@/types/portfolio';

const KEY = 'sketchbook:strokes:v1';
type StrokeMap = Record<string, SketchStroke[]>;

function load(): StrokeMap {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StrokeMap) : {};
  } catch {
    return {};
  }
}

/** Dessins Apple Pencil par double-page, persistés dans le navigateur du visiteur. */
export function useSketchStrokes() {
  const [strokes, setStrokes] = useState<StrokeMap>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(strokes));
    } catch {
      /* quota plein ou stockage bloqué : on garde en mémoire */
    }
  }, [strokes]);

  const addStroke = useCallback((spreadId: string, stroke: SketchStroke) => {
    setStrokes((prev) => ({ ...prev, [spreadId]: [...(prev[spreadId] ?? []), stroke] }));
  }, []);

  const clearStrokes = useCallback((spreadId: string) => {
    setStrokes((prev) => ({ ...prev, [spreadId]: [] }));
  }, []);

  return { strokes, addStroke, clearStrokes };
}
