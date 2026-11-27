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
        className="relative w-full max-w-sm rounded-3xl bg-[#171A24] text-[#3A2414] border border-[#8E6A3E]/35 shadow-[0_30px_90px_rgba(0,0,0,0.75)] p-6"
      >
        <button
          type="button"
          onClick={closeLogin}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#5A3520]/10 hover:bg-[#5A3520]/20 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-11 h-11 rounded-full bg-[#8E2F2A] flex items-center justify-center mb-4">
          <Lock className="w-5 h-5" />
        </div>
        <h2 id="admin-login-title" className="t-fantasy text-xl font-extrabold">
          Espace admin
        </h2>
        <p className="text-sm text-[#6B4A2B] mt-1">Connecte-toi pour modifier le carnet directement dans les pages.</p>

        <label className="block mt-5 text-xs text-[#6B4A2B]">
          Mot de passe
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl bg-[#FBF5E6] border border-[#8E6A3E]/35 px-3 py-2.5 text-[#3A2414] outline-none focus:border-[#B8893A]"
          />
        </label>

        {error && <p className="mt-3 text-sm text-[#8E2F2A]">{error}</p>}

        <button
          type="submit"
          disabled={busy || !password}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#8E2F2A] py-2.5 font-semibold hover:brightness-110 disabled:opacity-50 transition"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} Se connecter
        </button>

        {import.meta.env.DEV && (
          <p className="mt-4 font-mono text-[10px] text-[#8A6A48] leading-relaxed">
            Dev sans backend : mot de passe <span className="text-[#4A2E18]">admin</span> (modifiable via VITE_DEV_ADMIN_PASSWORD dans .env.local).
          </p>
        )}
      </form>
    </div>
  );
}
