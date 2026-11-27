import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

/**
 * Filet de sécurité : si un composant plante, on affiche une note
 * « recharge la page » au lieu d'un écran vide.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Sketchbook] Erreur d’affichage :', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div role="alert" className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <div
          className="relative w-full max-w-sm -rotate-1 rounded-[4px] bg-[#FBF8F1] px-7 pt-8 pb-6 text-ink shadow-[0_24px_50px_-18px_rgba(20,60,80,0.55)]"
          style={{ backgroundImage: 'repeating-linear-gradient(transparent 0 27px, rgba(120,150,180,0.25) 27px 28px)' }}
        >
          {/* Morceau de washi tape */}
          <span className="absolute -top-3 left-1/2 h-6 w-28 -translate-x-1/2 rotate-2 bg-butter/90 shadow-sm" />

          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-magenta">Oups !</p>
          <h1 className="mt-2 font-syne text-2xl font-extrabold leading-tight">La page s’est froissée.</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/75">
            Quelque chose s’est mal passé à l’affichage. Recharger la page suffit en général.
          </p>

          {import.meta.env.DEV && (
            <pre className="mt-4 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-ink/5 p-2 font-mono text-[11px] text-ink/70">
              {error.message}
            </pre>
          )}

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 -rotate-1 rounded-[3px] bg-butter px-4 py-1.5 font-hand text-lg font-bold text-ink shadow-[0_4px_8px_-3px_rgba(20,60,80,0.4)] transition-transform hover:-translate-y-0.5 hover:rotate-0"
          >
            Recharger la page ↻
          </button>
        </div>
      </div>
    );
  }
}
