import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, KeyRound, Loader2, X } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { leatherStyle } from '@/components/sketchbook/BookCover';

/** Fenêtre de connexion à l'espace admin : feuille de parchemin, bandeau de cuir, bouton laiton. */
export function AdminLoginModal() {
  const { loginOpen, closeLogin, login } = useAdmin();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loginOpen) return null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(password);
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#1A0F08]/65 p-4 backdrop-blur-sm"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={closeLogin}
    >
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Escape') closeLogin();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-login-title"
        className="relative w-full max-w-sm overflow-hidden rounded-xl text-[#2E1C0E] shadow-[0_30px_80px_rgba(10,5,0,0.7)]"
        style={{
          backgroundColor: '#F6EEDB',
          backgroundImage: 'var(--tex-paper), radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(140,95,40,0.16) 100%)',
          backgroundSize: '320px 320px, 100% 100%',
        }}
      >
        {/* Bandeau de cuir */}
        <div className="relative flex items-center gap-3 px-6 py-4" style={leatherStyle('#4A2C1A')}>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#3A2414] shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
            style={{ background: 'radial-gradient(circle at 35% 30%, #FBE7B0, #C9A24E 55%, #7A5622)' }}
          >
            <KeyRound className="h-5 w-5" />
          </div>
          <h2 id="admin-login-title" className="t-fantasy text-xl uppercase tracking-[0.12em] text-[#F3DCA0]">
            Espace admin
          </h2>
          <button
            type="button"
            onClick={closeLogin}
            aria-label="Fermer"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-[#F3DCA0] hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="pointer-events-none absolute inset-x-2 bottom-1 border-b border-dashed border-[#E9CF8E]/35" />
        </div>

        <div className="px-6 pb-6 pt-5">
          <p className="text-[15px] leading-relaxed text-[#4A2E18]">Connecte-toi pour modifier le carnet directement dans les pages.</p>

          <label htmlFor="admin-password" className="mt-5 block text-sm font-semibold text-[#3A2414]">
            Mot de passe
          </label>
          <div className="relative mt-1.5">
            <input
              id="admin-password"
              type={show ? 'text' : 'password'}
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#8E6A3E]/50 bg-white px-3.5 py-2.5 pr-11 text-base text-[#2E1C0E] shadow-[inset_0_1px_2px_rgba(60,35,10,0.12)] outline-none placeholder:text-[#9A7C5C] focus:border-[#B8893A] focus:ring-2 focus:ring-[#B8893A]/30"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute inset-y-0 right-1 my-auto flex h-9 w-9 items-center justify-center rounded-md text-[#6B4A2B] hover:bg-[#5A3520]/10"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <p role="alert" className="mt-3 rounded-md border border-[#8E2F2A]/30 bg-[#8E2F2A]/8 px-3 py-2 text-sm text-[#7A2420]">
              {error}
            </p>
          )}

          {/* Bouton laiton (action positive) */}
          <button
            type="submit"
            disabled={busy || !password}
            className="t-fantasy mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[15px] uppercase tracking-[0.14em] text-[#2A1A0E] shadow-[0_3px_0_#7A5622,0_8px_16px_-8px_rgba(60,35,10,0.6)] transition hover:brightness-105 active:translate-y-px active:shadow-[0_2px_0_#7A5622] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'linear-gradient(180deg, #F2D58C 0%, #D8B36A 45%, #B8893A 100%)' }}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Se connecter
          </button>

          {import.meta.env.DEV && (
            <p className="mt-4 text-xs leading-relaxed text-[#6B4A2B]">
              Dev sans backend : mot de passe <code className="rounded bg-[#5A3520]/10 px-1 font-mono text-[#3A2414]">admin</code> (modifiable via
              VITE_DEV_ADMIN_PASSWORD dans .env.local).
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
