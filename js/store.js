// ---------------------------------------------------------------------------
// store.js — La ÚNICA capa que habla con el almacenamiento.
// Si algún día migramos a IndexedDB o a un backend, se cambia este archivo
// y el resto de la app no se entera.
// ---------------------------------------------------------------------------

import { DEFAULT_TARGETS } from './plan.js';

const KEY = 'entreno.v1';

const EMPTY = {
  version: 1,
  workouts: {},   // '2026-08-24': { sessionId, sets: { exId: [{kg, reps, done}] }, note }
  diet: {},       // '2026-08-24': { itemId: true }
  bodyweight: {}, // '2026-08-24': 70.4
  qty: {},        // itemId: cantidad personalizada (override global)
  targets: { ...DEFAULT_TARGETS },
};

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(EMPTY);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(EMPTY), ...parsed };
  } catch (err) {
    console.error('No se pudo leer el almacenamiento:', err);
    return structuredClone(EMPTY);
  }
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

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getState() {
  return state;
}

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

// --- Entrenamiento ----------------------------------------------------------

export function getWorkout(date) {
  return state.workouts[date] || null;
}

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

export function deleteWorkout(date) {
  delete state.workouts[date];
  persist();
}

/** Historial de un ejercicio, ordenado de más antiguo a más reciente. */
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

/** ¿Cuándo se hizo por última vez este ejercicio, antes de `beforeDate`? */
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

export function getDiet(date) {
  return state.diet[date] || {};
}

export function toggleItem(date, itemId, value) {
  const day = { ...(state.diet[date] || {}) };
  if (value) day[itemId] = true;
  else delete day[itemId];
  state.diet[date] = day;
  persist();
}

export function setMealDone(date, itemIds, value) {
  const day = { ...(state.diet[date] || {}) };
  itemIds.forEach(id => { if (value) day[id] = true; else delete day[id]; });
  state.diet[date] = day;
  persist();
}

/** Cantidad efectiva de un ítem: la personalizada si existe, si no la del plan. */
export function qtyOf(item) {
  const custom = state.qty[item.id];
  return custom === undefined || custom === null ? item.qty : custom;
}

export function setQty(itemId, qty) {
  if (qty === null || qty === undefined || qty === '') delete state.qty[itemId];
  else state.qty[itemId] = Number(qty);
  persist();
}

export function resetQuantities() {
  state.qty = {};
  persist();
}

// --- Peso corporal ----------------------------------------------------------

export function getBodyweight(date) {
  return state.bodyweight[date] ?? null;
}

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

export function getTargets() {
  return state.targets;
}

export function setTargets(patch) {
  state.targets = { ...state.targets, ...patch };
  persist();
}

// --- Copia de seguridad -----------------------------------------------------

export function exportJSON() {
  return JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
}

export function importJSON(text) {
  const parsed = JSON.parse(text);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('El archivo no contiene datos válidos.');
  }
  state = { ...structuredClone(EMPTY), ...parsed };
  persist();
}

export function wipe() {
  state = structuredClone(EMPTY);
  persist();
}
