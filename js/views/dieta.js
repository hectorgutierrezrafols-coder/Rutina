import { MEALS, TOLERANCE } from '../plan.js';
import { FOOD_INDEX, searchFoods, lookupBarcode } from '../foods.js';
import * as store from '../store.js';

let viewDate = store.todayKey();
let sheet = null; // null | {mode:'search'|'custom', mealId, query, results, pending}

// --- Vista principal --------------------------------------------------------

export function render(root) {
  const date = viewDate;
  const isToday = date === store.todayKey();
  const d = new Date(date + 'T12:00:00');
  const t = store.dayTotals(date);
  const targets = store.getTargets();
  const bw = store.getBodyweight(date);
  const entries = store.getEntries(date);

  root.innerHTML = `
    <header class="view-head">
      <div class="datenav">
        <button class="ghost" data-nav="-1" aria-label="Día anterior">‹</button>
        <div class="datenav-label">
          <span class="eyebrow">${isToday ? 'Hoy' : d.toLocaleDateString('es-ES', { weekday: 'long' })}</span>
          <strong>${d.getDate()} ${d.toLocaleDateString('es-ES', { month: 'long' })}</strong>
        </div>
        <button class="ghost" data-nav="1" aria-label="Día siguiente" ${isToday ? 'disabled' : ''}>›</button>
      </div>
    </header>

    ${renderTotals(t, targets)}

    <div class="rowline">
      <label class="bw">
        <span class="eyebrow">Peso corporal</span>
        <span class="bw-input">
          <input type="number" inputmode="decimal" step="0.1" data-bw
                 value="${bw ?? ''}" placeholder="—"> <span class="unit">kg</span>
        </span>
      </label>
      ${entries.length ? '<button class="chip subtle" data-clear-day>Vaciar día</button>' : ''}
    </div>

    ${MEALS.map(m => renderMeal(m, date, entries)).join('')}

    ${renderLoose(entries)}

    <p class="hint">
      Toca el nombre de una comida para añadirla entera. El botón + busca cualquier
      alimento. Las cantidades se editan tocando el número.
    </p>

    ${sheet ? renderSheet() : ''}
  `;

  bind(root, date);
  if (sheet) {
    const input = root.querySelector('[data-q]');
    if (input && sheet.mode === 'search') { input.focus(); input.select(); }
  }
}

// --- Resumen de macros ------------------------------------------------------

function status(value, target) {
  const lo = target * (1 - TOLERANCE);
  const hi = target * (1 + TOLERANCE);
  if (value < lo) return { cls: 'under', diff: Math.round(target - value), label: 'faltan' };
  if (value > hi) return { cls: 'over', diff: Math.round(value - target), label: 'de más' };
  return { cls: 'ok', diff: 0, label: 'en objetivo' };
}

function renderTotals(t, targets) {
  const k = status(t.kcal, targets.kcal);
  const p = status(t.prot, targets.prot);

  const card = (num, target, unit, st, extra) => `
    <div class="total is-${st.cls}">
      <span class="total-num">${num}</span>
      <span class="total-den">/ ${target}</span>
      <span class="eyebrow">${unit}</span>
      <div class="progress-bar slim"><span style="width:${Math.min(100, (num / target) * 100)}%"></span></div>
      <span class="total-status">${st.diff ? `${st.diff} ${st.label}` : st.label}</span>
      ${extra || ''}
    </div>`;

  return `
    <div class="totals">
      ${card(t.kcal, targets.kcal, 'kcal', k)}
      ${card(t.prot, targets.prot, 'g proteína', p)}
    </div>
    <div class="macro-line">
      <span><b>${t.carb}</b> g hidratos</span>
      <span><b>${t.fat}</b> g grasas</span>
      <span>${t.count} registro${t.count === 1 ? '' : 's'}</span>
    </div>`;
}

// --- Comidas de la plantilla ------------------------------------------------

function renderMeal(meal, date, entries) {
  const mine = entries.filter(e => e.mealId === meal.id);
  const plan = meal.items.map(it => ({ food: FOOD_INDEX[it.food], qty: it.qty }))
    .filter(x => x.food);
  const planKcal = Math.round(plan.reduce((s, x) => s + x.food.kcal * x.qty / x.food.per, 0));
  const eaten = Math.round(mine.reduce((s, e) => s + e.kcal, 0));

  return `
    <section class="meal ${mine.length ? 'is-done' : ''}">
      <div class="meal-head">
        <button class="meal-fill" data-fill="${meal.id}">
          <span class="meal-time">${meal.time}</span>
          <span class="meal-name">${meal.name}</span>
          <span class="meal-macros">${mine.length ? `${eaten} kcal` : `plan: ${planKcal} kcal`}</span>
        </button>
        <button class="meal-add" data-add="${meal.id}" aria-label="Añadir alimento a ${meal.name}">+</button>
      </div>
      ${mine.length ? `<div class="items">${mine.map(renderEntry).join('')}</div>` : ''}
    </section>`;
}

function renderLoose(entries) {
  const loose = entries.filter(e => !e.mealId);
  return `
    <section class="meal ${loose.length ? 'is-done' : ''}">
      <div class="meal-head">
        <button class="meal-fill" data-noop>
          <span class="meal-time">—</span>
          <span class="meal-name">Fuera de plan</span>
          <span class="meal-macros">${loose.length ? `${Math.round(loose.reduce((s, e) => s + e.kcal, 0))} kcal` : 'picoteo, extras'}</span>
        </button>
        <button class="meal-add" data-add="" aria-label="Añadir alimento suelto">+</button>
      </div>
      ${loose.length ? `<div class="items">${loose.map(renderEntry).join('')}</div>` : ''}
    </section>`;
}

function renderEntry(e) {
  return `
    <div class="item entry" data-uid="${e.uid}">
      <span class="item-name">${e.name}</span>
      <input class="num qty" type="number" inputmode="decimal" step="any"
             data-qty value="${e.qty}" aria-label="Cantidad de ${e.name}">
      <span class="unit">${e.unit}</span>
      <span class="item-kcal">${Math.round(e.kcal)}</span>
      <button class="item-del" data-del aria-label="Quitar ${e.name}">×</button>
    </div>`;
}

// --- Buscador ---------------------------------------------------------------

function renderSheet() {
  if (sheet.mode === 'custom') return renderCustomForm();

  const results = sheet.results || [];
  const recent = store.getRecentFoods();
  // Sin búsqueda solo se muestran los recientes: nada de volcar el catálogo entero.
  const list = sheet.query ? results : recent;

  return `
    <div class="sheet-backdrop" data-close></div>
    <div class="sheet" role="dialog" aria-label="Buscar alimento">
      <div class="sheet-grip"></div>
      <div class="sheet-search">
        <input type="search" data-q value="${sheet.query || ''}" enterkeyhint="search"
               placeholder="Buscar alimento…" autocomplete="off" autocorrect="off">
        <button class="ghost" data-close aria-label="Cerrar">×</button>
      </div>

      ${sheet.pending ? '<p class="sheet-msg">Consultando…</p>' : ''}
      ${sheet.error ? `<p class="sheet-msg is-error">${sheet.error}</p>` : ''}
      ${!sheet.query && recent.length ? '<p class="sheet-label">Recientes</p>' : ''}

      <div class="sheet-list">
        ${list.length ? list.map(foodRow).join('')
          : sheet.query
            ? `<p class="sheet-msg">Sin resultados para “${sheet.query}”.<br>Puedes crearlo tú abajo.</p>`
            : '<p class="sheet-msg">Escribe para buscar,<br>o crea un alimento.</p>'}
      </div>

      <div class="sheet-foot">
        <button class="btn" data-custom>Crear alimento</button>
        <button class="btn" data-barcode>Código de barras</button>
      </div>
    </div>`;
}

function foodRow(f) {
  return `
    <button class="food" data-food="${f.id}">
      <span class="food-name">${f.name}${f.hint ? ` <em>(${f.hint})</em>` : ''}</span>
      <span class="food-macros">${f.kcal} kcal · ${f.prot} g P${f.unit === 'ud' ? ' / ud' : ' / 100' + f.unit}</span>
    </button>`;
}

function renderCustomForm() {
  // `draft` guarda lo escrito para que un error de validación no lo borre
  const d = sheet.draft || {};
  const bad = sheet.invalid || [];
  const esc = v => String(v ?? '').replace(/"/g, '&quot;');
  const cls = k => bad.includes(k) ? ' class="is-invalid"' : '';
  const unit = d.unit || 'g';
  const perLabel = unit === 'ud' ? 'por unidad' : `por 100 ${unit}`;

  return `
    <div class="sheet-backdrop" data-close></div>
    <div class="sheet" role="dialog" aria-label="Crear alimento">
      <div class="sheet-grip"></div>
      <p class="sheet-label">Alimento propio · valores ${perLabel}</p>
      <div class="form">
        <label>Nombre <span class="req">*</span>
          <input type="text" data-c="name"${cls('name')} value="${esc(d.name)}"
                 placeholder="Tupper de mi madre" autocomplete="off"></label>
        <label>Unidad
          <select data-c="unit">
            <option value="g"${unit === 'g' ? ' selected' : ''}>gramos</option>
            <option value="ml"${unit === 'ml' ? ' selected' : ''}>mililitros</option>
            <option value="ud"${unit === 'ud' ? ' selected' : ''}>unidad</option>
          </select>
        </label>
        <label>Calorías <span class="req">*</span>
          <input type="number" inputmode="decimal" data-c="kcal"${cls('kcal')}
                 value="${esc(d.kcal)}" placeholder="0"></label>
        <label>Proteína <span class="req">*</span>
          <input type="number" inputmode="decimal" data-c="prot"${cls('prot')}
                 value="${esc(d.prot)}" placeholder="0"></label>
        <label>Hidratos
          <input type="number" inputmode="decimal" data-c="carb" value="${esc(d.carb)}" placeholder="0"></label>
        <label>Grasas
          <input type="number" inputmode="decimal" data-c="fat" value="${esc(d.fat)}" placeholder="0"></label>
      </div>
      ${sheet.error ? `<p class="sheet-msg is-error">${sheet.error}</p>` : ''}
      <div class="sheet-foot">
        <button class="btn" data-close>Cancelar</button>
        <button class="btn primary" data-save-custom>Guardar y añadir</button>
      </div>
    </div>`;
}

// --- Eventos ----------------------------------------------------------------

function bind(root, date) {
  root.querySelectorAll('[data-nav]').forEach(b => {
    b.addEventListener('click', () => {
      const next = store.shiftDate(viewDate, Number(b.dataset.nav));
      if (next > store.todayKey()) return;
      viewDate = next;
      render(root);
    });
  });

  const bwInput = root.querySelector('[data-bw]');
  if (bwInput) bwInput.addEventListener('change', e => store.setBodyweight(date, e.target.value));

  const clearDay = root.querySelector('[data-clear-day]');
  if (clearDay) clearDay.addEventListener('click', () => {
    if (confirm('¿Borrar todo lo registrado este día?')) { store.clearDay(date); render(root); }
  });

  root.querySelectorAll('[data-fill]').forEach(b => {
    b.addEventListener('click', () => {
      const meal = MEALS.find(m => m.id === b.dataset.fill);
      const existing = store.getEntries(date).filter(e => e.mealId === meal.id);
      if (existing.length) {
        if (!confirm(`Ya hay ${existing.length} registro(s) en ${meal.name}. ¿Añadir la plantilla igualmente?`)) return;
      }
      store.addEntries(date, meal.items
        .map(it => ({ food: FOOD_INDEX[it.food], qty: it.qty, mealId: meal.id }))
        .filter(x => x.food));
      if (navigator.vibrate) navigator.vibrate(8);
      render(root);
    });
  });

  root.querySelectorAll('[data-add]').forEach(b => {
    b.addEventListener('click', () => {
      sheet = { mode: 'search', mealId: b.dataset.add || null, query: '', results: [] };
      render(root);
    });
  });

  root.querySelectorAll('.entry').forEach(el => {
    const uid = el.dataset.uid;
    el.querySelector('[data-qty]').addEventListener('change', e => {
      store.updateEntryQty(date, uid, e.target.value);
      render(root);
    });
    el.querySelector('[data-del]').addEventListener('click', () => {
      store.removeEntry(date, uid);
      render(root);
    });
  });

  if (sheet) bindSheet(root, date);
}

function bindSheet(root, date) {
  root.querySelectorAll('[data-close]').forEach(b =>
    b.addEventListener('click', () => { sheet = null; render(root); }));

  const q = root.querySelector('[data-q]');
  if (q) {
    q.addEventListener('input', () => {
      sheet.query = q.value;
      sheet.error = null;
      sheet.results = q.value.trim() ? searchFoods(q.value, store.getCustomFoods()) : [];
      const list = root.querySelector('.sheet-list');
      const label = root.querySelector('.sheet-label');
      if (label) label.remove();
      if (list) {
        const items = q.value.trim() ? sheet.results : store.getRecentFoods();
        list.innerHTML = items.length
          ? items.map(foodRow).join('')
          : q.value.trim()
            ? `<p class="sheet-msg">Sin resultados para “${q.value}”.<br>Puedes crearlo tú abajo.</p>`
            : '<p class="sheet-msg">Escribe para buscar,<br>o crea un alimento.</p>';
        bindFoodButtons(root, date);
      }
    });
  }

  bindFoodButtons(root, date);

  const custom = root.querySelector('[data-custom]');
  if (custom) custom.addEventListener('click', () => {
    sheet = {
      mode: 'custom', mealId: sheet.mealId, error: null,
      draft: { name: (sheet.query || '').trim(), unit: 'g' },
      invalid: [],
    };
    render(root);
  });

  const barcode = root.querySelector('[data-barcode]');
  if (barcode) barcode.addEventListener('click', async () => {
    const code = prompt('Escribe el código de barras (los dígitos bajo las rayas):');
    if (!code) return;
    sheet.pending = true; sheet.error = null; render(root);
    try {
      const food = await lookupBarcode(code);
      sheet.pending = false;
      if (!food) { sheet.error = 'Ese producto no está en Open Food Facts o no tiene datos nutricionales.'; render(root); return; }
      store.addCustomFood(food);
      askQtyAndAdd(root, date, food);
    } catch (err) {
      sheet.pending = false;
      sheet.error = 'No se ha podido consultar. ¿Tienes conexión?';
      render(root);
    }
  });

  // Cada tecleo se guarda en el borrador: si la validación falla, no se pierde
  root.querySelectorAll('[data-c]').forEach(el => {
    const key = el.dataset.c;
    el.addEventListener('input', () => {
      sheet.draft = { ...(sheet.draft || {}), [key]: el.value };
      sheet.invalid = (sheet.invalid || []).filter(k => k !== key);
      el.classList.remove('is-invalid');
    });
    if (el.tagName === 'SELECT') {
      el.addEventListener('change', () => {
        sheet.draft = { ...(sheet.draft || {}), unit: el.value };
        render(root); // la etiqueta "por 100 g / por unidad" cambia
      });
    }
  });

  const save = root.querySelector('[data-save-custom]');
  if (save) save.addEventListener('click', () => {
    const d = sheet.draft || {};
    const missing = [];
    const name = String(d.name || '').trim();
    if (!name) missing.push('name');
    ['kcal', 'prot'].forEach(k => {
      const raw = String(d[k] ?? '').trim();
      if (raw === '' || Number.isNaN(Number(raw)) || Number(raw) < 0) missing.push(k);
    });

    if (missing.length) {
      const etiquetas = { name: 'el nombre', kcal: 'las calorías', prot: 'la proteína' };
      sheet.invalid = missing;
      sheet.error = 'Falta ' + missing.map(k => etiquetas[k]).join(' y ') + '.';
      render(root); // el borrador se conserva, solo se repinta con el aviso
      const first = root.querySelector('.is-invalid');
      if (first) first.focus();
      return;
    }

    const unit = d.unit || 'g';
    const num = k => Number(String(d[k] ?? '').trim()) || 0;
    const food = store.addCustomFood({
      id: 'own_' + Date.now().toString(36),
      name, cat: 'Míos', unit, per: unit === 'ud' ? 1 : 100,
      kcal: num('kcal'), prot: num('prot'), carb: num('carb'), fat: num('fat'),
    });
    askQtyAndAdd(root, date, food);
  });
}

function bindFoodButtons(root, date) {
  root.querySelectorAll('[data-food]').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.dataset.food;
      const food = FOOD_INDEX[id] || store.getCustomFoods().find(f => f.id === id);
      if (food) askQtyAndAdd(root, date, food);
    });
  });
}

function askQtyAndAdd(root, date, food) {
  const suggested = food.unit === 'ud' ? 1 : 100;
  const label = food.unit === 'ud' ? 'unidades' : food.unit;
  const raw = prompt(`${food.name}\n¿Cuánto? (${label})`, String(suggested));
  if (raw === null) return;
  const qty = Number(raw.replace(',', '.'));
  if (!qty || qty <= 0) return;
  store.addEntry(date, food, qty, sheet ? sheet.mealId : null);
  sheet = null;
  if (navigator.vibrate) navigator.vibrate(8);
  render(root);
}

export function reset() { viewDate = store.todayKey(); sheet = null; }
