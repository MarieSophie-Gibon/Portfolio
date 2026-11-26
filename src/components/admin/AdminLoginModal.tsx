import { useState, type FormEvent } from 'react';
import { Loader2, Lock, X } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

export function AdminLoginModal() {
  const { loginOpen, closeLogin, login } = useAdmin();
  const [password, setPassword] = useState('');
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
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#121624]/80 backdrop-blur-md p-4"
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
        className="relative w-full max-w-sm rounded-3xl bg-[#171A24] text-zinc-100 border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.75)] p-6"
      >
        <button
          type="button"
          onClick={closeLogin}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-11 h-11 rounded-full bg-magenta flex items-center justify-center mb-4">
          <Lock className="w-5 h-5" />
        </div>
        <h2 id="admin-login-title" className="font-syne text-xl font-extrabold">
          Espace admin
        </h2>
        <p className="text-sm text-zinc-400 mt-1">Connecte-toi pour modifier le carnet directement dans les pages.</p>

        <label className="block mt-5 text-xs text-zinc-400">
          Mot de passe
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2.5 text-white outline-none focus:border-magenta"
          />
        </label>

        {error && <p className="mt-3 text-sm text-magenta">{error}</p>}

        <button
          type="submit"
          disabled={busy || !password}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-magenta py-2.5 font-semibold hover:brightness-110 disabled:opacity-50 transition"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} Se connecter
        </button>

        {import.meta.env.DEV && (
          <p className="mt-4 font-mono text-[10px] text-zinc-500 leading-relaxed">
            Dev sans backend : mot de passe <span className="text-zinc-300">admin</span> (modifiable via VITE_DEV_ADMIN_PASSWORD dans .env.local).
          </p>
        )}
      </form>
    </div>
  );
}
