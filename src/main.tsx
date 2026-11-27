import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { LEATHER_GRAIN, LEATHER_WEAR, PAPER_FIBERS } from './lib/textures';

// Textures partagées, utilisables dans le CSS via var(--tex-*).
const root = document.documentElement.style;
root.setProperty('--tex-paper', PAPER_FIBERS);
root.setProperty('--tex-leather', LEATHER_GRAIN);
root.setProperty('--tex-leather-wear', LEATHER_WEAR);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
