import { useCallback, useEffect, useRef, type PointerEvent } from 'react';
import type { SketchPoint, SketchStroke } from '@/types/portfolio';
import { BOOK_W } from './SpreadBase';

interface Props {
  strokes: SketchStroke[];
  /** true = on peut dessiner (spread active + mode Pencil). */
  enabled: boolean;
  color: string;
  eraser: boolean;
  onAddStroke: (stroke: SketchStroke) => void;
}

const PEN_WIDTH = 3.2; // en px de conception
const ERASER_WIDTH = 18;

/**
 * Calque Apple Pencil d'une double-page. Coordonnées normalisées 0..1
 * pour rester aligné quelle que soit l'échelle d'affichage.
 */
export function SpreadSketchCanvas({ strokes, enabled, color, eraser, onAddStroke }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef<SketchStroke | null>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    const k = rect.width / BOOK_W; // épaisseur proportionnelle à l'échelle

    const all = drawingRef.current ? [...strokes, drawingRef.current] : strokes;
    for (const s of all) {
      if (!s.points.length) continue;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = s.eraser ? 'destination-out' : 'source-over';
      ctx.strokeStyle = s.color;
      ctx.lineWidth = (s.eraser ? ERASER_WIDTH : PEN_WIDTH) * k;
      ctx.beginPath();
      const [first, ...rest] = s.points;
      ctx.moveTo(first.x * rect.width, first.y * rect.height);
      if (!rest.length) ctx.lineTo(first.x * rect.width + 0.5, first.y * rect.height + 0.5);
      for (const p of rest) ctx.lineTo(p.x * rect.width, p.y * rect.height);
      ctx.stroke();
      ctx.restore();
    }
  }, [strokes]);

  useEffect(() => {
    redraw();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => redraw());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [redraw]);

  const toPoint = (e: PointerEvent<HTMLCanvasElement>): SketchPoint => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width))),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / Math.max(1, rect.height))),
    };
  };

  const onDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!enabled) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = { color, eraser, points: [toPoint(e)] };
    redraw();
  };

  const onMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!enabled || !drawingRef.current) return;
    e.stopPropagation();
    drawingRef.current.points.push(toPoint(e));
    redraw();
  };

  const onUp = (e: PointerEvent<HTMLCanvasElement>) => {
    const stroke = drawingRef.current;
    if (!stroke) return;
    e.stopPropagation();
    drawingRef.current = null;
    onAddStroke(stroke);
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className={`absolute inset-0 w-full h-full z-30 rounded-[10px] ${
        enabled ? 'pointer-events-auto touch-none cursor-crosshair' : 'pointer-events-none'
      }`}
    />
  );
}
