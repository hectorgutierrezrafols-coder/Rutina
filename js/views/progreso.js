import { EXERCISE_INDEX, SESSIONS, MEALS } from '../plan.js';
import * as store from '../store.js';
import { lineChart, barChart, shortDate } from '../charts.js';

let selectedEx = 'press_banca';
let metric = 'top'; // 'top' | 'volume'

function weekKey(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - day);
  return store.todayKey(d);
}

function lastWeeks(n) {
  const weeks = [];
  let cur = weekKey(store.todayKey());
  for (let i = 0; i < n; i++) {
    weeks.unshift(cur);
    cur = store.shiftDate(cur, -7);
  }
  return weeks;
}

export function render(root) {
  const hist = store.exerciseHistory(selectedEx);
  const ex = EXERCISE_INDEX[selectedEx];
  const bw = store.bodyweightSeries();

  const strengthPoints = hist.map(h => ({
    label: shortDate(h.date),
    value: metric === 'top'
      ? (h.top.kg > 0 ? Math.round(h.top.kg * 10) / 10 : h.top.reps)
      : Math.round(h.volume),
  }));

  const bwPoints = bw.map(p => ({ label: shortDate(p.date), value: p.kg }));

  const weeks = lastWeeks(6);
  const sessionBars = weeks.map(w => {
    const count = Object.keys(store.getState().workouts).filter(d => {
      if (weekKey(d) !== w) return false;
      const sets = store.getWorkout(d).sets || {};
      return Object.values(sets).flat().some(s => s && s.done);
    }).length;
    return { label: shortDate(w), value: count, max: 5 };
  });

  const totalItems = MEALS.reduce((n, m) => n + m.items.length, 0);
  const dietBars = weeks.map(w => {
    let done = 0, days = 0;
    for (let i = 0; i < 7; i++) {
      const d = store.shiftDate(w, i);
      if (d > store.todayKey()) break;
      days++;
      done += Object.keys(store.getDiet(d)).length;
    }
    const pct = days ? Math.round((done / (days * totalItems)) * 100) : 0;
    return { label: shortDate(w), value: pct, max: 100 };
  });

  const delta = bw.length > 1
    ? Math.round((bw[bw.length - 1].kg - bw[0].kg) * 10) / 10
    : null;

  root.innerHTML = `
    <header class="view-head">
      <span class="eyebrow">Progreso</span>
      <strong class="view-title">Los números suben o no suben</strong>
    </header>

    <section class="panel">
      <div class="panel-head">
        <h2>Fuerza</h2>
        <div class="seg">
          <button data-metric="top" class="${metric === 'top' ? 'is-on' : ''}">Serie top</button>
          <button data-metric="volume" class="${metric === 'volume' ? 'is-on' : ''}">Volumen</button>
        </div>
      </div>
      <select class="select" data-ex>
        ${Object.values(SESSIONS).map(s => `
          <optgroup label="${s.name}">
            ${s.exercises.map(e => `
              <option value="${e.id}" ${e.id === selectedEx ? 'selected' : ''}>${e.name}</option>
            `).join('')}
          </optgroup>`).join('')}
      </select>
      ${lineChart(strengthPoints, { unit: metric === 'top' ? 'kg' : 'kg totales' })}
      <p class="panel-foot">
        ${hist.length
          ? `${hist.length} sesiones registradas · ${ex.sessionName}`
          : `Aún no has registrado ${ex.name.toLowerCase()}.`}
      </p>
    </section>

    <section class="panel">
      <div class="panel-head">
        <h2>Peso corporal</h2>
        ${delta !== null
          ? `<span class="delta ${delta >= 0 ? 'up' : 'down'}">${delta >= 0 ? '+' : ''}${delta} kg</span>`
          : ''}
      </div>
      ${lineChart(bwPoints, { unit: 'kg' })}
      <p class="panel-foot">Se registra desde la pestaña Dieta.</p>
    </section>

    <section class="panel">
      <div class="panel-head"><h2>Sesiones por semana</h2></div>
      ${barChart(sessionBars, { unit: 'sesiones' })}
      <p class="panel-foot">Objetivo: 4 de gimnasio, la de casa es extra.</p>
    </section>

    <section class="panel">
      <div class="panel-head"><h2>Adherencia a la dieta</h2></div>
      ${barChart(dietBars, { unit: '%' })}
      <p class="panel-foot">Porcentaje de tomas marcadas cada semana.</p>
    </section>
  `;

  root.querySelector('[data-ex]').addEventListener('change', e => {
    selectedEx = e.target.value;
    render(root);
  });
  root.querySelectorAll('[data-metric]').forEach(b => {
    b.addEventListener('click', () => { metric = b.dataset.metric; render(root); });
  });
}

export function reset() {}
