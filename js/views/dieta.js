import { MEALS } from '../plan.js';
import * as store from '../store.js';

let viewDate = store.todayKey();
let editing = false;

function itemKcal(item) {
  const q = store.qtyOf(item);
  return { kcal: (item.kcal * q) / item.per, prot: (item.prot * q) / item.per };
}

function totals(date) {
  const day = store.getDiet(date);
  let kcal = 0, prot = 0, planKcal = 0, planProt = 0;
  MEALS.forEach(m => m.items.forEach(it => {
    const v = itemKcal(it);
    planKcal += v.kcal; planProt += v.prot;
    if (day[it.id]) { kcal += v.kcal; prot += v.prot; }
  }));
  return {
    kcal: Math.round(kcal), prot: Math.round(prot),
    planKcal: Math.round(planKcal), planProt: Math.round(planProt),
  };
}

export function render(root) {
  const date = viewDate;
  const isToday = date === store.todayKey();
  const d = new Date(date + 'T12:00:00');
  const t = totals(date);
  const targets = store.getTargets();
  const bw = store.getBodyweight(date);

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

    <div class="totals">
      <div class="total">
        <span class="total-num">${t.kcal}</span>
        <span class="total-den">/ ${targets.kcal}</span>
        <span class="eyebrow">kcal</span>
        <div class="progress-bar slim"><span style="width:${Math.min(100, (t.kcal / targets.kcal) * 100)}%"></span></div>
      </div>
      <div class="total">
        <span class="total-num">${t.prot}</span>
        <span class="total-den">/ ${targets.prot}</span>
        <span class="eyebrow">g proteína</span>
        <div class="progress-bar slim"><span style="width:${Math.min(100, (t.prot / targets.prot) * 100)}%"></span></div>
      </div>
    </div>

    <div class="rowline">
      <label class="bw">
        <span class="eyebrow">Peso corporal</span>
        <span class="bw-input">
          <input type="number" inputmode="decimal" step="0.1" data-bw
                 value="${bw ?? ''}" placeholder="—"> <span class="unit">kg</span>
        </span>
      </label>
      <button class="chip ${editing ? 'is-on' : ''}" data-edit>
        ${editing ? 'Listo' : 'Editar cantidades'}
      </button>
    </div>

    ${MEALS.map(m => renderMeal(m, date)).join('')}

    <p class="hint">El plan completo suma ${t.planKcal} kcal y ${t.planProt} g de proteína.</p>
  `;

  bind(root, date);
}

function renderMeal(meal, date) {
  const day = store.getDiet(date);
  const all = meal.items.every(it => day[it.id]);
  const some = meal.items.some(it => day[it.id]);
  const mk = meal.items.reduce((s, it) => s + itemKcal(it).kcal, 0);
  const mp = meal.items.reduce((s, it) => s + itemKcal(it).prot, 0);

  return `
    <section class="meal ${all ? 'is-done' : some ? 'is-partial' : ''}">
      <button class="meal-head" data-meal="${meal.id}" data-all="${all}">
        <span class="meal-time">${meal.time}</span>
        <span class="meal-name">${meal.name}</span>
        <span class="meal-macros">${Math.round(mk)} kcal · ${Math.round(mp)} g</span>
        <span class="check ${all ? 'on' : ''}" aria-hidden="true">
          <svg viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9"/></svg>
        </span>
      </button>
      <div class="items">
        ${meal.items.map(it => renderItem(it, day)).join('')}
      </div>
    </section>`;
}

function renderItem(item, day) {
  const q = store.qtyOf(item);
  const v = itemKcal(item);
  const custom = store.getState().qty[item.id] !== undefined;
  return `
    <div class="item ${day[item.id] ? 'is-done' : ''}" data-item="${item.id}">
      <button class="item-check" data-toggle aria-label="Marcar ${item.name}">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9"/></svg>
      </button>
      <span class="item-name">${item.name}</span>
      ${editing
        ? `<input class="num qty ${custom ? 'is-custom' : ''}" type="number" inputmode="decimal"
                  step="any" data-qty value="${q}" aria-label="Cantidad de ${item.name}">
           <span class="unit">${item.unit}</span>`
        : `<span class="item-qty ${custom ? 'is-custom' : ''}">${q} ${item.unit}</span>`}
      <span class="item-kcal">${Math.round(v.kcal)}</span>
    </div>`;
}

function bind(root, date) {
  root.querySelectorAll('[data-nav]').forEach(b => {
    b.addEventListener('click', () => {
      const next = store.shiftDate(viewDate, Number(b.dataset.nav));
      if (next > store.todayKey()) return;
      viewDate = next;
      render(root);
    });
  });

  root.querySelector('[data-edit]').addEventListener('click', () => {
    editing = !editing;
    render(root);
  });

  root.querySelector('[data-bw]').addEventListener('change', e => {
    store.setBodyweight(date, e.target.value);
  });

  root.querySelectorAll('.meal-head').forEach(head => {
    head.addEventListener('click', () => {
      const meal = MEALS.find(m => m.id === head.dataset.meal);
      const all = head.dataset.all === 'true';
      store.setMealDone(date, meal.items.map(i => i.id), !all);
      if (navigator.vibrate) navigator.vibrate(8);
      render(root);
    });
  });

  root.querySelectorAll('.item').forEach(el => {
    const id = el.dataset.item;
    el.querySelector('[data-toggle]').addEventListener('click', () => {
      const done = !el.classList.contains('is-done');
      store.toggleItem(date, id, done);
      render(root);
    });
    const qty = el.querySelector('[data-qty]');
    if (qty) {
      qty.addEventListener('change', () => {
        store.setQty(id, qty.value === '' ? null : qty.value);
        render(root);
      });
    }
  });
}

export function reset() { viewDate = store.todayKey(); editing = false; }
