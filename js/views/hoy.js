import { SESSIONS, SCHEDULE, EXERCISES } from '../plan.js';
import * as store from '../store.js';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

let viewDate = store.todayKey();
let override = null;   // sesión elegida a mano en un día de descanso
let swapFor = null;    // ref del ejercicio cuyo selector está abierto

function sessionFor(date) {
  if (override) return SESSIONS[override];
  const saved = store.getWorkout(date);
  if (saved && saved.sessionId) return SESSIONS[saved.sessionId];
  const d = new Date(date + 'T12:00:00');
  const id = SCHEDULE[d.getDay()];
  return id ? SESSIONS[id] : null;
}

function fmtLast(last, type) {
  if (!last) return 'Primera vez';
  const best = last.sets.reduce((b, s) => (Number(s.kg) || 0) > (Number(b.kg) || 0) ? s : b, last.sets[0]);
  const kg = Number(best.kg) || 0;
  const reps = Number(best.reps) || 0;
  return `Última: ${type === 'weight' || kg > 0 ? `${kg} kg × ${reps}` : `${reps} repes`}`;
}

export function render(root) {
  const date = viewDate;
  const isToday = date === store.todayKey();
  const d = new Date(date + 'T12:00:00');
  const session = sessionFor(date);
  const workout = store.getWorkout(date);

  root.innerHTML = `
    <header class="view-head">
      <div class="datenav">
        <button class="ghost" data-nav="-1" aria-label="Día anterior">‹</button>
        <div class="datenav-label">
          <span class="eyebrow">${isToday ? 'Hoy' : DAYS[d.getDay()]}</span>
          <strong>${d.getDate()} ${d.toLocaleDateString('es-ES', { month: 'long' })}</strong>
        </div>
        <button class="ghost" data-nav="1" aria-label="Día siguiente" ${isToday ? 'disabled' : ''}>›</button>
      </div>
      ${session ? `<div class="session-tag">${session.name}</div>` : ''}
    </header>

    ${session ? renderSession(session, date, workout) : renderRest()}
    ${swapFor ? renderSwapSheet(swapFor) : ''}
  `;

  bind(root, session, date);
}

function renderRest() {
  return `
    <div class="rest">
      <p class="rest-title">Día de descanso</p>
      <p class="rest-sub">El músculo se construye hoy, no ayer.</p>
      <div class="rest-actions">
        ${Object.values(SESSIONS).map(s => `<button class="chip" data-session="${s.id}">${s.name}</button>`).join('')}
      </div>
      <p class="hint">Si quieres entrenar igualmente, elige sesión.</p>
    </div>`;
}

function renderSession(session, date, workout) {
  const sets = (workout && workout.sets) || {};
  const total = session.exercises.reduce((n, e) => n + e.sets, 0);
  const done = Object.values(sets).flat().filter(s => s && s.done).length;

  return `
    <div class="progress-strip">
      <div class="progress-bar"><span style="width:${Math.round((done / total) * 100)}%"></span></div>
      <span class="progress-num">${done}/${total}</span>
    </div>

    ${session.exercises.map(slot => {
      const exId = store.swapOf(slot.ref);
      return renderExercise(slot, exId, sets[exId] || [], date);
    }).join('')}

    <label class="note-block">
      <span class="eyebrow">Notas de la sesión</span>
      <textarea data-note rows="2" placeholder="Sensaciones, molestias, lo que sea">${(workout && workout.note) || ''}</textarea>
    </label>

    <button class="danger-ghost" data-clear>Borrar el registro de este día</button>
  `;
}

function renderExercise(slot, exId, saved, date) {
  const ex = EXERCISES[exId];
  const swapped = store.isSwapped(slot.ref);
  const last = store.lastSession(exId, date);
  const isTime = ex.type === 'time';
  const kgLabel = ex.type === 'body' ? 'lastre' : 'kg';

  const rows = Array.from({ length: slot.sets }, (_, i) => {
    const s = saved[i] || {};
    return `
      <div class="setrow ${s.done ? 'is-done' : ''}" data-ex="${exId}" data-i="${i}">
        <span class="setnum">${i + 1}</span>
        ${isTime ? `
          <input class="num" type="number" inputmode="numeric" data-f="reps"
                 value="${s.reps ?? ''}" placeholder="seg" aria-label="Segundos">
          <span class="unit">s</span><span class="spacer"></span>
        ` : `
          <input class="num" type="number" inputmode="decimal" step="0.5" data-f="kg"
                 value="${s.kg ?? ''}" placeholder="0" aria-label="Peso en kilos">
          <span class="unit">${kgLabel}</span>
          <input class="num" type="number" inputmode="numeric" data-f="reps"
                 value="${s.reps ?? ''}" placeholder="0" aria-label="Repeticiones">
          <span class="unit">reps</span>
        `}
        <button class="check" data-check aria-label="Marcar serie ${i + 1}">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9"/></svg>
        </button>
      </div>`;
  }).join('');

  return `
    <section class="ex-card">
      <div class="ex-head">
        <h2>${ex.name}${swapped ? '<span class="swap-flag" title="Sustituido">↺</span>' : ''}</h2>
        <div class="ex-right">
          <span class="ex-scheme">${slot.sets} × ${slot.reps}</span>
          <button class="ex-menu" data-swap="${slot.ref}" aria-label="Cambiar ejercicio">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="4" cy="10" r="1.6"/><circle cx="10" cy="10" r="1.6"/><circle cx="16" cy="10" r="1.6"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="ex-meta">
        <span>${fmtLast(last, ex.type)}</span>
        <span class="dot-sep">·</span>
        <span>${slot.rest}</span>
      </div>
      <div class="setlist">${rows}</div>
      <p class="ex-note">${slot.note}</p>
    </section>`;
}

function renderSwapSheet(ref) {
  const original = EXERCISES[ref];
  const current = store.swapOf(ref);
  const options = [ref, ...(original.alts || [])];
  // Añade las alternativas del sustituto actual si aporta opciones nuevas
  if (current !== ref) {
    (EXERCISES[current].alts || []).forEach(a => { if (!options.includes(a)) options.push(a); });
    if (!options.includes(current)) options.splice(1, 0, current);
  }

  return `
    <div class="sheet-backdrop" data-close></div>
    <div class="sheet" role="dialog" aria-label="Cambiar ejercicio">
      <div class="sheet-grip"></div>
      <p class="sheet-label">En lugar de ${original.name}</p>
      <div class="sheet-list">
        ${options.map(id => {
          const e = EXERCISES[id];
          if (!e) return '';
          return `
            <button class="food ${id === current ? 'is-on' : ''}" data-pick="${id}">
              <span class="food-name">${e.name}${id === ref ? ' <em>(original)</em>' : ''}</span>
              <span class="food-macros">${e.type === 'body' ? 'peso corporal' : e.type === 'time' ? 'por tiempo' : 'con peso'}</span>
            </button>`;
        }).join('')}
      </div>
      <p class="hint" style="padding:0 16px 4px">
        Cada ejercicio guarda su propio historial. Al cambiar, el nuevo empieza de cero.
      </p>
      <div class="sheet-foot"><button class="btn" data-close>Cerrar</button></div>
    </div>`;
}

function bind(root, session, date) {
  root.querySelectorAll('[data-nav]').forEach(b => {
    b.addEventListener('click', () => {
      const next = store.shiftDate(viewDate, Number(b.dataset.nav));
      if (next > store.todayKey()) return;
      viewDate = next; override = null; render(root);
    });
  });

  root.querySelectorAll('[data-session]').forEach(b => {
    b.addEventListener('click', () => { override = b.dataset.session; render(root); });
  });

  root.querySelectorAll('[data-swap]').forEach(b => {
    b.addEventListener('click', () => { swapFor = b.dataset.swap; render(root); });
  });

  root.querySelectorAll('[data-close]').forEach(b => {
    b.addEventListener('click', () => { swapFor = null; render(root); });
  });

  root.querySelectorAll('[data-pick]').forEach(b => {
    b.addEventListener('click', () => {
      store.setSwap(swapFor, b.dataset.pick);
      swapFor = null;
      if (navigator.vibrate) navigator.vibrate(8);
      render(root);
    });
  });

  if (!session) return;

  root.querySelectorAll('.setrow').forEach(row => {
    const exId = row.dataset.ex;
    const i = Number(row.dataset.i);

    row.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', () => {
        const val = input.value === '' ? null : Number(input.value);
        store.setSet(date, session.id, exId, i, { [input.dataset.f]: val });
      });
    });

    row.querySelector('[data-check]').addEventListener('click', () => {
      const done = !row.classList.contains('is-done');
      const patch = { done };
      if (done) {
        const kgInput = row.querySelector('[data-f="kg"]');
        const repsInput = row.querySelector('[data-f="reps"]');
        const prev = row.previousElementSibling;
        if (prev && prev.classList.contains('setrow')) {
          if (kgInput && !kgInput.value) {
            const p = prev.querySelector('[data-f="kg"]');
            if (p && p.value) { kgInput.value = p.value; patch.kg = Number(p.value); }
          }
          if (repsInput && !repsInput.value) {
            const p = prev.querySelector('[data-f="reps"]');
            if (p && p.value) { repsInput.value = p.value; patch.reps = Number(p.value); }
          }
        }
        if (kgInput && kgInput.value && patch.kg === undefined) patch.kg = Number(kgInput.value);
        if (repsInput && repsInput.value && patch.reps === undefined) patch.reps = Number(repsInput.value);
      }
      store.setSet(date, session.id, exId, i, patch);
      row.classList.toggle('is-done', done);
      if (done && navigator.vibrate) navigator.vibrate(8);
      updateStrip(root, session, date);
    });
  });

  const note = root.querySelector('[data-note]');
  if (note) note.addEventListener('change', () => store.setWorkoutNote(date, session.id, note.value));

  const clear = root.querySelector('[data-clear]');
  if (clear) clear.addEventListener('click', () => {
    if (confirm('¿Borrar todas las series registradas de este día?')) {
      store.deleteWorkout(date); override = null; render(root);
    }
  });
}

function updateStrip(root, session, date) {
  const w = store.getWorkout(date);
  const sets = (w && w.sets) || {};
  const total = session.exercises.reduce((n, e) => n + e.sets, 0);
  const done = Object.values(sets).flat().filter(s => s && s.done).length;
  const bar = root.querySelector('.progress-bar span');
  const num = root.querySelector('.progress-num');
  if (bar) bar.style.width = `${Math.round((done / total) * 100)}%`;
  if (num) num.textContent = `${done}/${total}`;
}

export function reset() { viewDate = store.todayKey(); override = null; swapFor = null; }
