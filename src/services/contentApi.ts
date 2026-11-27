import { DEFAULT_CONTENT } from '@/data/defaultData';
import { migrateToV2 } from '@/lib/migrate';
import type { PortfolioContent } from '@/types/portfolio';

/* ==================================================================
 * Couche d'accès au contenu.
 * 1) Essaie toujours les routes Vercel `/api/*`.
 * 2) Si elles n'existent pas (dev local sans backend), bascule en
 *    « mode local » : localStorage + mot de passe de dev + DataURL.
 *    Ce fallback n'est actif qu'en développement (import.meta.env.DEV).
 * ================================================================== */

export type Backend = 'api' | 'local';

const CONTENT_KEY = 'sketchbook:content:v1';
const DEV_SESSION_KEY = 'sketchbook:dev-admin';
const DEV_PASSWORD = import.meta.env.VITE_DEV_ADMIN_PASSWORD || 'admin';
const LOCAL_ALLOWED = import.meta.env.DEV;

let backend: Backend = 'api';
export const getBackend = () => backend;

class BackendUnavailable extends Error {}

/** fetch JSON ; lève BackendUnavailable si la route n'existe pas (404 / HTML / réseau). */
async function apiJson<T>(url: string, init?: RequestInit): Promise<{ status: number; data: T }> {
  let res: Response;
  try {
    res = await fetch(url, { credentials: 'include', ...init });
  } catch {
    throw new BackendUnavailable();
  }
  const isJson = res.headers.get('content-type')?.includes('application/json');
  if (res.status === 404 || res.status === 405 || !isJson) throw new BackendUnavailable();
  return { status: res.status, data: (await res.json()) as T };
}

function switchToLocal(): true {
  if (!LOCAL_ALLOWED) throw new Error('Backend indisponible. Réessaie plus tard.');
  backend = 'local';
  return true;
}

/* ------------------------------------------------------------------ */
/* Normalisation : complète un contenu sauvegardé avec les champs      */
/* ajoutés depuis (objets fusionnés, tableaux conservés tels quels).   */
/* ------------------------------------------------------------------ */
type Plain = Record<string, unknown>;
const isPlain = (v: unknown): v is Plain => typeof v === 'object' && v !== null && !Array.isArray(v);

function mergeDefaults<T>(defaults: T, value: unknown): T {
  if (!isPlain(defaults) || !isPlain(value)) return (value === undefined ? defaults : value) as T;
  const out: Plain = { ...defaults };
  for (const [k, v] of Object.entries(value)) out[k] = k in defaults ? mergeDefaults((defaults as Plain)[k], v) : v;
  return out as T;
}

export function normalizeContent(raw: unknown): PortfolioContent {
  if (!isPlain(raw) || !Array.isArray(raw.spreads)) return structuredClone(DEFAULT_CONTENT);
  // Un contenu sans version est un contenu v1 (avant la nouvelle suite de pages).
  const merged = mergeDefaults(structuredClone(DEFAULT_CONTENT), { schemaVersion: 1, ...raw });
  return migrateToV2(merged);
}

/* ------------------------------------------------------------------ */
/* Contenu                                                             */
/* ------------------------------------------------------------------ */

function loadLocal(): PortfolioContent {
  try {
    const raw = localStorage.getItem(CONTENT_KEY);
    if (raw) return normalizeContent(JSON.parse(raw));
  } catch {
    /* JSON corrompu ou stockage bloqué */
  }
  return structuredClone(DEFAULT_CONTENT);
}

export async function loadContent(): Promise<PortfolioContent> {
  try {
    const { status, data } = await apiJson<unknown>('/api/content');
    if (status === 200 && data) {
      backend = 'api';
      return normalizeContent(data);
    }
    // 204 / contenu vide : base pas encore initialisée -> contenu par défaut
    backend = 'api';
    return structuredClone(DEFAULT_CONTENT);
  } catch (e) {
    if (!(e instanceof BackendUnavailable) || !LOCAL_ALLOWED) return structuredClone(DEFAULT_CONTENT);
    backend = 'local';
    return loadLocal();
  }
}

export async function saveContent(content: PortfolioContent): Promise<PortfolioContent> {
  const toSave = { ...content, updatedAt: new Date().toISOString() };
  if (backend === 'api') {
    try {
      const { status, data } = await apiJson<{ error?: string }>('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSave),
      });
      if (status === 401) throw new Error('Session expirée : reconnecte-toi.');
      if (status >= 400) throw new Error(data.error || `Erreur serveur (${status})`);
      return toSave;
    } catch (e) {
      if (!(e instanceof BackendUnavailable)) throw e;
      switchToLocal();
    }
  }
  try {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(toSave));
  } catch {
    throw new Error('Stockage local plein : les images importées sont probablement trop lourdes.');
  }
  return toSave;
}

/** Mode local uniquement : efface la sauvegarde du navigateur. */
export function clearLocalContent() {
  try {
    localStorage.removeItem(CONTENT_KEY);
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/* Authentification                                                    */
/* ------------------------------------------------------------------ */

export async function checkSession(): Promise<boolean> {
  try {
    const { data } = await apiJson<{ admin?: boolean }>('/api/auth/me');
    return Boolean(data.admin);
  } catch (e) {
    if (!(e instanceof BackendUnavailable) || !LOCAL_ALLOWED) return false;
    try {
      return sessionStorage.getItem(DEV_SESSION_KEY) === '1';
    } catch {
      return false;
    }
  }
}

export async function login(password: string): Promise<void> {
  try {
    const { status, data } = await apiJson<{ error?: string }>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (status === 429) throw new Error('Trop de tentatives, patiente une minute.');
    if (status >= 400) throw new Error(data.error || 'Mot de passe incorrect.');
    backend = 'api';
  } catch (e) {
    if (!(e instanceof BackendUnavailable)) throw e;
    switchToLocal();
    if (password !== DEV_PASSWORD) throw new Error('Mot de passe incorrect.');
    try {
      sessionStorage.setItem(DEV_SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
  }
}

export async function logout(): Promise<void> {
  try {
    sessionStorage.removeItem(DEV_SESSION_KEY);
  } catch {
    /* ignore */
  }
  try {
    await apiJson('/api/auth/logout', { method: 'POST' });
  } catch {
    /* pas de backend : rien à faire */
  }
}

/* ------------------------------------------------------------------ */
/* Upload d'images                                                     */
/* ------------------------------------------------------------------ */

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** Mode local : réduit l'image (max 1600px, JPEG) pour ménager localStorage. */
async function fileToDataUrl(file: File): Promise<string> {
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error('Lecture du fichier impossible.'));
      r.readAsDataURL(file);
    });
  }
  const bitmap = await createImageBitmap(file);
  const max = 1600;
  const k = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * k);
  canvas.height = Math.round(bitmap.height * k);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  // Le JPEG ne gère pas la transparence (fond noir) : seules les sources JPEG restent en JPEG.
  // Les autres (PNG, WebP, AVIF…) passent en WebP, qui garde l'alpha ; si le navigateur ne sait
  // pas encoder le WebP, toDataURL renvoie automatiquement du PNG (transparence conservée aussi).
  return /jpe?g/i.test(file.type) ? canvas.toDataURL('image/jpeg', 0.82) : canvas.toDataURL('image/webp', 0.9);
}

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_LOCAL_VIDEO_BYTES = 3 * 1024 * 1024;

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    r.readAsDataURL(file);
  });

/** Image OU vidéo (mp4/webm). Les vidéos ne sont pas recompressées. */
export async function uploadMedia(file: File): Promise<{ url: string; type: 'image' | 'video' }> {
  if (!file.type.startsWith('video/')) return { url: await uploadImage(file), type: 'image' };
  if (file.size > MAX_VIDEO_BYTES) throw new Error('Vidéo trop lourde (50 Mo max).');
  if (backend === 'api') {
    try {
      const { status, data } = await apiJson<{ url?: string; error?: string }>('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': file.type, 'x-filename': encodeURIComponent(file.name) },
        body: file,
      });
      if (status === 401) throw new Error('Session expirée : reconnecte-toi.');
      if (status >= 400 || !data.url) throw new Error(data.error || 'Échec de l’upload.');
      return { url: data.url, type: 'video' };
    } catch (e) {
      if (!(e instanceof BackendUnavailable)) throw e;
      switchToLocal();
    }
  }
  if (file.size > MAX_LOCAL_VIDEO_BYTES) {
    throw new Error('En mode local, les vidéos de plus de 3 Mo ne tiennent pas : colle plutôt l’URL de la vidéo (ou attends le backend).');
  }
  return { url: await readAsDataUrl(file), type: 'video' };
}

/** Devine si une URL pointe vers une vidéo. */
export const isVideoUrl = (src: string) => /^data:video\/|\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src);

export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Ce fichier n’est pas une image.');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('Image trop lourde (8 Mo max).');

  if (backend === 'api') {
    try {
      const { status, data } = await apiJson<{ url?: string; error?: string }>('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': file.type, 'x-filename': encodeURIComponent(file.name) },
        body: file,
      });
      if (status === 401) throw new Error('Session expirée : reconnecte-toi.');
      if (status >= 400 || !data.url) throw new Error(data.error || 'Échec de l’upload.');
      return data.url;
    } catch (e) {
      if (!(e instanceof BackendUnavailable)) throw e;
      switchToLocal();
    }
  }
  return fileToDataUrl(file);
}
