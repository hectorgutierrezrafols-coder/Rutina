import { EXERCISES, SESSIONS, MEALS } from '../plan.js';
import * as store from '../store.js';
import { lineChart, barChart, shortDate } from '../charts.js';

let selectedEx = null;
let metric = 'top';   // 'top' | 'volume'
let macro = 'kcal';   // 'kcal' | 'prot'

function weekKey(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // lunes
  return store.todayKey(d);
}

function lastWeeks(n) {
  const weeks = [];
  let cur = weekKey(store.todayKey());
  for (let i = 0; i < n; i++) { weeks.unshift(cur); cur = store.shiftDate(cur, -7); }
  return weeks;
}

/** Ejercicios que están activos ahora mismo en el plan, con sustituciones aplicadas. */
function activeExercises() {
  return Object.values(SESSIONS).map(s => ({
    session: s.name,
    ids: s.exercises.map(slot => store.swapOf(slot.ref)),
  }));
}

export function render(root) {
  const groups = activeExercises();
  if (!selectedEx) selectedEx = groups[0].ids[1] || groups[0].ids[0];

  const hist = store.exerciseHistory(selectedEx);
  const ex = EXERCISES[selectedEx];
  const bw = store.bodyweightSeries();
  const targets = store.getTargets();

  const strengthPoints = hist.map(h => ({
    label: shortDate(h.date),
    value: metric === 'top'
      ? (h.top.kg > 0 ? Math.round(h.top.kg * 10) / 10 : h.top.reps)
      : Math.round(h.volume),
  }));

  const bwPoints = bw.map(p => ({ label: shortDate(p.date), value: p.kg }));

  // Últimos 14 días de dieta
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = store.shiftDate(store.todayKey(), -i);
    const t = store.dayTotals(d);
    days.push({ label: shortDate(d), value: t[macro], max: targets[macro] * 1.3 });
  }
  const logged = days.filter(d => d.value > 0);
  const avg = logged.length ? Math.round(logged.reduce((s, d) => s + d.value, 0) / logged.length) : 0;

  const weeks = lastWeeks(6);
  const sessionBars = weeks.map(w => {
    const count = Object.keys(store.getState().workouts).filter(d => {
      if (weekKey(d) !== w) return false;
      const sets = store.getWorkout(d).sets || {};
      return Object.values(sets).flat().some(s => s && s.done);
    }).length;
    return { label: shortDate(w), value: count, max: 5 };
  });

  const delta = bw.length > 1 ? Math.round((bw[bw.length - 1].kg - bw[0].kg) * 10) / 10 : null;

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
        ${groups.map(gr => `
          <optgroup label="${gr.session}">
            ${gr.ids.map(id => `
              <option value="${id}" ${id === selectedEx ? 'selected' : ''}>${EXERCISES[id].name}</option>
            `).join('')}
          </optgroup>`).join('')}
      </select>
      ${lineChart(strengthPoints, { unit: metric === 'top' ? 'kg' : 'kg totales' })}
      <p class="panel-foot">
        ${hist.length ? `${hist.length} sesiones registradas de ${ex.name.toLowerCase()}.`
                      : `Aún no has registrado ${ex.name.toLowerCase()}.`}
      </p>
    </section>

    <section class="panel">
      <div class="panel-head">
        <h2>Peso corporal</h2>
        ${delta !== null ? `<span class="delta ${delta >= 0 ? 'up' : 'down'}">${delta >= 0 ? '+' : ''}${delta} kg</span>` : ''}
      </div>
      ${lineChart(bwPoints, { unit: 'kg' })}
      <p class="panel-foot">Se registra desde la pestaña Dieta.</p>
    </section>

    <section class="panel">
      <div class="panel-head">
        <h2>Dieta · 14 días</h2>
        <div class="seg">
          <button data-macro="kcal" class="${macro === 'kcal' ? 'is-on' : ''}">kcal</button>
          <button data-macro="prot" class="${macro === 'prot' ? 'is-on' : ''}">Proteína</button>
        </div>
      </div>
      ${barChart(days, { unit: macro })}
      <p class="panel-foot">
        ${logged.length
          ? `Media de los días registrados: <b>${avg}</b> frente a un objetivo de ${targets[macro]}.
             ${avg < targets[macro] * 0.95 ? 'Vas corto: por debajo del objetivo no hay ganancia.'
               : avg > targets[macro] * 1.05 ? 'Por encima del objetivo.' : 'En el rango correcto.'}`
          : 'Registra comidas para ver la tendencia.'}
      </p>
    </section>

    <section class="panel">
      <div class="panel-head"><h2>Sesiones por semana</h2></div>
      ${barChart(sessionBars, { unit: 'sesiones' })}
      <p class="panel-foot">Objetivo: 4 de gimnasio, la de casa es extra.</p>
    </section>
  `;

  root.querySelector('[data-ex]').addEventListener('change', e => {
    selectedEx = e.target.value; render(root);
  });
  root.querySelectorAll('[data-metric]').forEach(b =>
    b.addEventListener('click', () => { metric = b.dataset.metric; render(root); }));
  root.querySelectorAll('[data-macro]').forEach(b =>
    b.addEventListener('click', () => { macro = b.dataset.macro; render(root); }));
}

export function reset() {}
