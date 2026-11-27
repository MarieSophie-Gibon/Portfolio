import { useRef, useState, type DragEvent, type ReactNode, type SyntheticEvent } from 'react';
import { createPortal } from 'react-dom';
import { ImagePlus, Loader2, Upload, X } from 'lucide-react';
import { isVideoUrl, uploadImage, uploadMedia } from '@/services/contentApi';
import type { ImageAsset } from '@/types/portfolio';
import { useCanEdit } from './EditableText';
import { btnPrimary, btnSecondary } from './formFields';

const swallow = (e: SyntheticEvent) => e.stopPropagation();

interface PickerProps {
  value: ImageAsset;
  allowRemove: boolean;
  /** Accepte aussi les vidéos (mp4 / webm). */
  allowVideo?: boolean;
  onClose: () => void;
  onSave: (asset: ImageAsset) => void;
}

/** Fenêtre de choix d'image (ou de vidéo) : upload (fichier / glisser-déposer) ou URL. */
export function ImagePickerDialog({ value, allowRemove, allowVideo = false, onClose, onSave }: PickerProps) {
  const [src, setSrc] = useState(value.src);
  const [type, setType] = useState<'image' | 'video'>(value.type ?? (isVideoUrl(value.src) ? 'video' : 'image'));
  const [alt, setAlt] = useState(value.alt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      if (allowVideo) {
        const res = await uploadMedia(file);
        setSrc(res.url);
        setType(res.type);
      } else {
        setSrc(await uploadImage(file));
        setType('image');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec de l’upload.');
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    void handleFile(e.dataTransfer.files[0]);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#1A0F08]/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        swallow(e);
        onClose();
      }}
      onPointerDown={swallow}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Changer l'image"
        onClick={swallow}
        className="w-full max-w-md rounded-xl border border-[#8E6A3E]/40 p-5 text-[#2E1C0E] shadow-[0_30px_80px_rgba(10,5,0,0.7)]"
        style={{ backgroundColor: '#F6EEDB', backgroundImage: 'var(--tex-paper)', backgroundSize: '320px 320px' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="t-fantasy text-lg font-extrabold">{allowVideo ? 'Image ou vidéo' : "Changer l'image"}</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="w-8 h-8 rounded-full bg-[#5A3520]/10 hover:bg-[#5A3520]/20 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`relative rounded-xl border-2 border-dashed p-3 text-center transition-colors ${
            dragOver ? 'border-[#B8893A] bg-[#B8893A]/10' : 'border-[#8E6A3E]/40 bg-white/[0.03]'
          }`}
        >
          {src ? (
            type === 'video' ? (
              <video src={src} controls muted playsInline className="mx-auto max-h-48 rounded-lg" />
            ) : (
              <img src={src} alt="" className="mx-auto max-h-48 rounded-lg object-contain" />
            )
          ) : (
            <div className="py-6 text-sm text-[#6B4A2B]">{allowVideo ? 'Glisse une image ou une vidéo (mp4) ici' : 'Glisse une image ici'}</div>
          )}
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#3B2416]/70">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#B8893A] text-[#2A1A0E] text-sm font-semibold hover:brightness-110 transition-colors"
          >
            <Upload className="w-4 h-4" /> Choisir un fichier
          </button>
          {allowRemove && src && (
            <button type="button" onClick={() => setSrc('')} className="px-3 py-2 rounded-lg bg-[#5A3520]/10 text-sm hover:bg-[#5A3520]/20">
              Retirer l'image
            </button>
          )}
          <input ref={fileRef} type="file" accept={allowVideo ? 'image/*,video/mp4,video/webm' : 'image/*'} hidden onChange={(e) => void handleFile(e.target.files?.[0])} />
        </div>

        <label className="block mt-4 text-xs text-[#6B4A2B]">
          {allowVideo ? "… ou colle l'URL d'une image ou d'une vidéo (.mp4, .webm)" : "… ou colle l'URL d'une image"}
          <input
            type="url"
            value={src.startsWith('data:') ? '' : src}
            placeholder="https://…"
            onChange={(e) => {
              const v = e.target.value.trim();
              setSrc(v);
              setType(allowVideo && isVideoUrl(v) ? 'video' : 'image');
            }}
            className="mt-1 w-full rounded-lg bg-[#FBF5E6] border border-[#8E6A3E]/35 px-3 py-2 text-sm text-[#3A2414] outline-none focus:border-[#B8893A]"
          />
        </label>

        <label className="block mt-3 text-xs text-[#6B4A2B]">
          Texte alternatif (accessibilité)
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="mt-1 w-full rounded-lg bg-[#FBF5E6] border border-[#8E6A3E]/35 px-3 py-2 text-sm text-[#3A2414] outline-none focus:border-[#B8893A]"
          />
        </label>

        {error && <p className="mt-3 text-sm text-[#8E2F2A]">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnSecondary}>
            Annuler
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              onSave({ ...value, src, alt, type });
              onClose();
            }}
            className={btnPrimary}
          >
            Valider
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

interface EditableImageProps {
  value: ImageAsset;
  onSave: (asset: ImageAsset) => void;
  /** Le visuel affiché (image ou illustration par défaut). */
  children: ReactNode;
  className?: string;
  /** Autorise « Retirer l'image » (revient à l'illustration par défaut). */
  allowRemove?: boolean;
  /** Autorise aussi une vidéo. */
  allowVideo?: boolean;
}

/** Visuel avec bouton « Changer l'image » au survol en mode édition. */
export function EditableImage({ value, onSave, children, className = '', allowRemove = true, allowVideo = false }: EditableImageProps) {
  const canEdit = useCanEdit();
  const [open, setOpen] = useState(false);

  if (!canEdit) return <div className={className}>{children}</div>;

  return (
    <div className={`group/img relative ${className}`}>
      {children}
      <button
        type="button"
        onPointerDown={swallow}
        onClick={(e) => {
          swallow(e);
          setOpen(true);
        }}
        className="absolute inset-0 flex items-center justify-center bg-ink/0 group-hover/img:bg-[#3B2416]/55 outline-dashed outline-2 outline-offset-[-2px] outline-[#B8893A]/70 transition-colors"
      >
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#D8B36A] text-[#2A1A0E] font-mono text-[9px] font-bold opacity-0 group-hover/img:opacity-100 transition-opacity shadow-lg">
          <ImagePlus className="w-3 h-3" /> {allowVideo ? 'Changer le média' : "Changer l'image"}
        </span>
      </button>
      {open && <ImagePickerDialog value={value} allowRemove={allowRemove} allowVideo={allowVideo} onClose={() => setOpen(false)} onSave={onSave} />}
    </div>
  );
}
