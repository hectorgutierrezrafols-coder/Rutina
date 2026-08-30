// ---------------------------------------------------------------------------
// store.js — La ÚNICA capa que habla con el almacenamiento.
//
// Esquema v2. La dieta pasa de "checklist del plan" a un registro de lo que
// realmente has comido: una lista de entradas por día. La plantilla del plan
// se sigue usando, pero solo como atajo para añadir varias entradas de golpe.
// ---------------------------------------------------------------------------

import { DEFAULT_TARGETS, DEFAULT_SWAPS, MEALS } from './plan.js';
import { FOOD_INDEX } from './foods.js';

const KEY = 'entreno.v1'; // misma clave: migramos el contenido, no lo perdemos

const EMPTY = {
  version: 2,
  workouts: {},     // fecha -> { sessionId, sets: { exId: [{kg, reps, done}] }, note }
  diet: {},         // fecha -> { entries: [{uid, foodId, name, qty, unit, per, kcal, prot, carb, fat, mealId}] }
  bodyweight: {},   // fecha -> kg
  targets: { ...DEFAULT_TARGETS },
  swaps: {},        // refEjercicio -> idSustituto
  customFoods: [],  // alimentos añadidos a mano
  recent: [],       // ids de alimentos usados hace poco
};

// Declarado antes de `state` a propósito: migrate() genera uids al cargar.
let uidCounter = 0;

let state = migrate(load());
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(EMPTY);
    return { ...structuredClone(EMPTY), ...JSON.parse(raw) };
  } catch (err) {
    console.error('No se pudo leer el almacenamiento:', err);
    return structuredClone(EMPTY);
  }
}

/**
 * v1 guardaba la dieta como { fecha: { itemId: true } } contra los ítems del
 * plan. Lo convertimos en entradas reales para no perder el historial.
 */
function migrate(s) {
  if (s.version === 2) return s;

  const itemIndex = Object.fromEntries(
    MEALS.flatMap(m => m.items.map(it => [it.id, { ...it, mealId: m.id }]))
  );
  const oldQty = s.qty || {};
  const diet = {};

  for (const [date, day] of Object.entries(s.diet || {})) {
    if (day && Array.isArray(day.entries)) { diet[date] = day; continue; }
    const entries = [];
    for (const itemId of Object.keys(day || {})) {
      const item = itemIndex[itemId];
      if (!item) continue;
      const food = FOOD_INDEX[item.food];
      if (!food) continue;
      const qty = oldQty[itemId] !== undefined ? Number(oldQty[itemId]) : item.qty;
      entries.push(makeEntry(food, qty, item.mealId));
    }
    diet[date] = { entries };
  }

  return { ...s, version: 2, diet, qty: undefined };
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    console.error('No se pudo guardar:', err);
    alert('No se ha podido guardar. Puede que el almacenamiento esté lleno.');
  }
  listeners.forEach(fn => fn(state));
}

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function getState() { return state; }

// --- Fechas -----------------------------------------------------------------

export function todayKey(d = new Date()) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function shiftDate(key, days) {
  const d = new Date(key + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return todayKey(d);
}

// --- Sustitución de ejercicios ----------------------------------------------

/** Qué ejercicio se hace realmente en el hueco de `ref`. */
export function swapOf(ref) {
  return state.swaps[ref] ?? DEFAULT_SWAPS[ref] ?? ref;
}

export function setSwap(ref, exerciseId) {
  if (exerciseId === ref && !DEFAULT_SWAPS[ref]) delete state.swaps[ref];
  else state.swaps[ref] = exerciseId;
  persist();
}

export function resetSwaps() { state.swaps = {}; persist(); }

export function isSwapped(ref) {
  return swapOf(ref) !== ref;
}

// --- Entrenamiento ----------------------------------------------------------

export function getWorkout(date) { return state.workouts[date] || null; }

export function setSet(date, sessionId, exId, index, patch) {
  const w = state.workouts[date] || { sessionId, sets: {}, note: '' };
  w.sessionId = sessionId;
  w.sets[exId] = w.sets[exId] || [];
  w.sets[exId][index] = { ...(w.sets[exId][index] || {}), ...patch };
  state.workouts[date] = w;
  persist();
}

export function setWorkoutNote(date, sessionId, note) {
  const w = state.workouts[date] || { sessionId, sets: {}, note: '' };
  w.note = note;
  state.workouts[date] = w;
  persist();
}

export function deleteWorkout(date) { delete state.workouts[date]; persist(); }

export function exerciseHistory(exId) {
  return Object.entries(state.workouts)
    .filter(([, w]) => w.sets && w.sets[exId] && w.sets[exId].some(s => s && s.done))
    .map(([date, w]) => {
      const done = w.sets[exId].filter(s => s && s.done);
      const top = done.reduce((best, s) => {
        const kg = Number(s.kg) || 0;
        const reps = Number(s.reps) || 0;
        const score = kg > 0 ? kg * (1 + reps / 30) : reps; // Epley, o repes si es peso corporal
        return score > best.score ? { kg, reps, score } : best;
      }, { kg: 0, reps: 0, score: 0 });
      const volume = done.reduce((sum, s) =>
        sum + (Number(s.kg) || 0) * (Number(s.reps) || 0), 0);
      return { date, top, volume, sets: done.length };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function lastSession(exId, beforeDate) {
  const hist = Object.entries(state.workouts)
    .filter(([date, w]) => date < beforeDate && w.sets && w.sets[exId]
      && w.sets[exId].some(s => s && s.done))
    .sort((a, b) => b[0].localeCompare(a[0]));
  if (!hist.length) return null;
  const [date, w] = hist[0];
  return { date, sets: w.sets[exId].filter(s => s && s.done) };
}

// --- Dieta ------------------------------------------------------------------

function uid() {
  return `${Date.now().toString(36)}${(uidCounter++).toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

/** Construye una entrada de comida a partir de un alimento y una cantidad. */
export function makeEntry(food, qty, mealId = null) {
  const f = Number(qty) / food.per;
  return {
    uid: uid(),
    foodId: food.id,
    name: food.name,
    qty: Number(qty),
    unit: food.unit,
    per: food.per,
    kcal: food.kcal * f,
    prot: food.prot * f,
    carb: (food.carb || 0) * f,
    fat: (food.fat || 0) * f,
    mealId,
  };
}

export function getEntries(date) {
  const day = state.diet[date];
  return (day && day.entries) || [];
}

export function addEntry(date, food, qty, mealId = null) {
  const day = state.diet[date] || { entries: [] };
  day.entries = [...day.entries, makeEntry(food, qty, mealId)];
  state.diet[date] = day;
  rememberFood(food.id);
  persist();
}

/** `list` son objetos {food, qty, mealId}, no entradas ya construidas. */
export function addEntries(date, list) {
  const day = state.diet[date] || { entries: [] };
  const built = list
    .filter(x => x && x.food)
    .map(x => makeEntry(x.food, x.qty, x.mealId ?? null));
  day.entries = [...day.entries, ...built];
  state.diet[date] = day;
  built.forEach(e => rememberFood(e.foodId));
  persist();
}

export function updateEntryQty(date, entryUid, qty) {
  const day = state.diet[date];
  if (!day) return;
  day.entries = day.entries.map(e => {
    if (e.uid !== entryUid) return e;
    const ratio = Number(qty) / e.qty;
    if (!Number.isFinite(ratio)) return e;
    return {
      ...e, qty: Number(qty),
      kcal: e.kcal * ratio, prot: e.prot * ratio,
      carb: e.carb * ratio, fat: e.fat * ratio,
    };
  });
  persist();
}

export function removeEntry(date, entryUid) {
  const day = state.diet[date];
  if (!day) return;
  day.entries = day.entries.filter(e => e.uid !== entryUid);
  persist();
}

export function clearDay(date) { delete state.diet[date]; persist(); }

export function dayTotals(date) {
  const entries = getEntries(date);
  const raw = entries.reduce((t, e) => ({
    kcal: t.kcal + e.kcal, prot: t.prot + e.prot,
    carb: t.carb + e.carb, fat: t.fat + e.fat,
  }), { kcal: 0, prot: 0, carb: 0, fat: 0 });
  return {
    kcal: Math.round(raw.kcal),
    prot: Math.round(raw.prot),
    carb: Math.round(raw.carb),
    fat: Math.round(raw.fat),
    count: entries.length,
  };
}

// --- Alimentos propios ------------------------------------------------------

export function getCustomFoods() { return state.customFoods; }

export function addCustomFood(food) {
  const id = food.id || 'mio_' + uid();
  const clean = {
    id, name: food.name, cat: food.cat || 'Míos',
    unit: food.unit || 'g', per: Number(food.per) || 100,
    kcal: Number(food.kcal) || 0, prot: Number(food.prot) || 0,
    carb: Number(food.carb) || 0, fat: Number(food.fat) || 0,
    custom: true, source: food.source,
  };
  state.customFoods = [clean, ...state.customFoods.filter(f => f.id !== id)];
  persist();
  return clean;
}

export function removeCustomFood(id) {
  state.customFoods = state.customFoods.filter(f => f.id !== id);
  persist();
}

function rememberFood(id) {
  state.recent = [id, ...state.recent.filter(x => x !== id)].slice(0, 20);
}

export function getRecentFoods() {
  const custom = Object.fromEntries(state.customFoods.map(f => [f.id, f]));
  return state.recent.map(id => custom[id] || FOOD_INDEX[id]).filter(Boolean);
}

// --- Peso corporal ----------------------------------------------------------

export function getBodyweight(date) { return state.bodyweight[date] ?? null; }

export function setBodyweight(date, kg) {
  if (kg === null || kg === '' || Number.isNaN(Number(kg))) delete state.bodyweight[date];
  else state.bodyweight[date] = Number(kg);
  persist();
}

export function bodyweightSeries() {
  return Object.entries(state.bodyweight)
    .map(([date, kg]) => ({ date, kg }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// --- Objetivos --------------------------------------------------------------

export function getTargets() { return state.targets; }
export function setTargets(patch) { state.targets = { ...state.targets, ...patch }; persist(); }

// --- Copia de seguridad -----------------------------------------------------

export function exportJSON() {
  return JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
}

export function importJSON(text) {
  const parsed = JSON.parse(text);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('El archivo no contiene datos válidos.');
  }
  state = migrate({ ...structuredClone(EMPTY), ...parsed });
  persist();
}

export function wipe() { state = structuredClone(EMPTY); persist(); }
