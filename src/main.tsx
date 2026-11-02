import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Enregistrement du Service Worker pour la PWA
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker enregistré avec portée :', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Échec d’enregistrement du Service Worker :', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
