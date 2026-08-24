// ---------------------------------------------------------------------------
// app.js — Router mínimo por hash. Añadir una pestaña nueva = añadir un módulo
// con render(root) y una entrada en TABS. Nada más.
// ---------------------------------------------------------------------------

import * as hoy from './views/hoy.js';
import * as dieta from './views/dieta.js';
import * as progreso from './views/progreso.js';
import * as ajustes from './views/ajustes.js';

const TABS = [
  { id: 'hoy',      label: 'Hoy',      view: hoy,      icon: 'M3 6h14M3 10h14M3 14h9' },
  { id: 'dieta',    label: 'Dieta',    view: dieta,    icon: 'M6 3v7a2 2 0 004 0V3M8 10v7M14 3c-1.5 1-2 3-2 5s.5 3 2 3v6' },
  { id: 'progreso', label: 'Progreso', view: progreso, icon: 'M3 15l4-5 3 3 6-8' },
  { id: 'ajustes',  label: 'Ajustes',  view: ajustes,  icon: 'M10 7a3 3 0 100 6 3 3 0 000-6zM10 2v2M10 16v2M4 4l1.5 1.5M14.5 14.5L16 16M2 10h2M16 10h2M4 16l1.5-1.5M14.5 5.5L16 4' },
];

const root = document.getElementById('view');
const nav = document.getElementById('nav');

nav.innerHTML = TABS.map(t => `
  <a href="#/${t.id}" data-tab="${t.id}">
    <svg viewBox="0 0 20 20" aria-hidden="true"><path d="${t.icon}"/></svg>
    <span>${t.label}</span>
  </a>`).join('');

function current() {
  const id = location.hash.replace('#/', '') || 'hoy';
  return TABS.find(t => t.id === id) || TABS[0];
}

function route() {
  const tab = current();
  nav.querySelectorAll('a').forEach(a =>
    a.classList.toggle('is-on', a.dataset.tab === tab.id));
  root.scrollTop = 0;
  window.scrollTo(0, 0);
  tab.view.render(root);
}

window.addEventListener('hashchange', route);

// Al volver a la app tras un rato, vuelve a "hoy" para no quedarse en días viejos
let hidden = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hidden = Date.now(); return; }
  if (Date.now() - hidden > 30 * 60 * 1000) {
    TABS.forEach(t => t.view.reset && t.view.reset());
    route();
  }
});

route();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err =>
      console.warn('Service worker no registrado:', err));
  });
}
