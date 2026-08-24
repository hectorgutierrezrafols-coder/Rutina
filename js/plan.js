// ---------------------------------------------------------------------------
// plan.js — El plan como puro dato.
// Para cambiar la rutina o la dieta solo hay que editar este archivo.
// Ningún otro módulo necesita enterarse.
// ---------------------------------------------------------------------------

// Tipos de ejercicio:
//   'weight' -> kg + repeticiones
//   'body'   -> repeticiones (kg opcional como lastre)
//   'time'   -> segundos

export const SESSIONS = {
  torsoA: {
    id: 'torsoA',
    name: 'Torso A',
    exercises: [
      { id: 'dominadas',   name: 'Dominadas',            type: 'body',   sets: 4, reps: '5-8',   rest: '2-3 min', note: 'Lastre al pasar de 10 repes' },
      { id: 'press_banca', name: 'Press banca',          type: 'weight', sets: 4, reps: '6-10',  rest: '2-3 min', note: 'Codos a 45 grados' },
      { id: 'remo_barra',  name: 'Remo con barra',       type: 'weight', sets: 3, reps: '8-12',  rest: '2 min',   note: 'Espalda neutra, sin tirones' },
      { id: 'fondos',      name: 'Fondos en paralelas',  type: 'body',   sets: 3, reps: '6-10',  rest: '2 min',   note: 'Si no llegas: fondos en banco' },
      { id: 'curl_biceps', name: 'Curl bíceps',          type: 'weight', sets: 3, reps: '10-12', rest: '60-90 s', note: 'Sin balanceo' },
      { id: 'face_pull',   name: 'Face pull',            type: 'weight', sets: 3, reps: '15',     rest: '60 s',    note: 'Salud de hombro, no fallar' },
    ],
  },

  piernaA: {
    id: 'piernaA',
    name: 'Pierna A',
    exercises: [
      { id: 'sentadilla',  name: 'Sentadilla trasera',   type: 'weight', sets: 4, reps: '6-10',  rest: '3 min',   note: 'Profundidad constante' },
      { id: 'pm_rumano',   name: 'Peso muerto rumano',   type: 'weight', sets: 3, reps: '8-10',  rest: '2-3 min', note: 'Estirón en isquios' },
      { id: 'zancadas',    name: 'Zancadas o prensa',    type: 'weight', sets: 3, reps: '10-12', rest: '2 min',   note: 'Por pierna si son zancadas' },
      { id: 'gemelo_pie',  name: 'Gemelo de pie',        type: 'weight', sets: 4, reps: '12-15', rest: '60 s',    note: 'Pausa de 1 s arriba' },
      { id: 'plancha',     name: 'Plancha / hollow',     type: 'time',   sets: 3, reps: '30-45 s', rest: '60 s',  note: 'Lumbar pegada al suelo' },
    ],
  },

  torsoB: {
    id: 'torsoB',
    name: 'Torso B',
    exercises: [
      { id: 'press_militar', name: 'Press militar de pie', type: 'weight', sets: 4, reps: '6-10',  rest: '2-3 min', note: 'Glúteo y abdomen apretados' },
      { id: 'dom_supina',    name: 'Dominada supina',      type: 'body',   sets: 4, reps: '8-12',  rest: '2 min',   note: 'Bíceps y dorsal' },
      { id: 'fondos_lastre', name: 'Fondos con lastre',    type: 'body',   sets: 4, reps: '6-10',  rest: '2-3 min', note: 'Añade peso al pasar de 12' },
      { id: 'remo_mancuerna',name: 'Remo con mancuerna',   type: 'weight', sets: 3, reps: '10-12', rest: '90 s',    note: 'Por brazo, rango completo' },
      { id: 'elev_lat',      name: 'Elevaciones laterales',type: 'weight', sets: 3, reps: '12-15', rest: '60 s',    note: 'Hombro ancho = clave estética' },
      { id: 'triceps_polea', name: 'Tríceps en polea',     type: 'weight', sets: 3, reps: '10-12', rest: '60 s',    note: 'Codos fijos' },
    ],
  },

  piernaB: {
    id: 'piernaB',
    name: 'Pierna B',
    exercises: [
      { id: 'peso_muerto',  name: 'Peso muerto',           type: 'weight', sets: 4, reps: '5-8',   rest: '3 min',  note: 'Técnica antes que peso' },
      { id: 'bulgara',      name: 'Sentadilla búlgara',    type: 'weight', sets: 3, reps: '8-10',  rest: '2 min',  note: 'Por pierna' },
      { id: 'curl_femoral', name: 'Curl femoral',          type: 'weight', sets: 3, reps: '10-12', rest: '90 s',   note: 'Control en la bajada' },
      { id: 'gemelo_sent',  name: 'Gemelo sentado',        type: 'weight', sets: 4, reps: '15',    rest: '60 s',   note: 'Rango completo' },
      { id: 'elev_piernas', name: 'Elevación de piernas',  type: 'body',   sets: 3, reps: '10-15', rest: '60 s',   note: 'Sin coger impulso' },
    ],
  },

  casa: {
    id: 'casa',
    name: 'Casa',
    optional: true,
    exercises: [
      { id: 'flexiones',     name: 'Flexiones',             type: 'body', sets: 4, reps: '12-20',  rest: '90 s', note: 'Pies elevados para subir dificultad' },
      { id: 'flex_pike',     name: 'Flexiones pike',        type: 'body', sets: 3, reps: '8-12',   rest: '90 s', note: 'Camino hacia el pino' },
      { id: 'remo_invertido',name: 'Remo invertido',        type: 'body', sets: 4, reps: '10-15',  rest: '90 s', note: 'Cuerpo recto como una tabla' },
      { id: 'bulgara_silla', name: 'Búlgara con silla',     type: 'body', sets: 3, reps: '12-15',  rest: '90 s', note: 'Por pierna' },
      { id: 'hollow',        name: 'Hollow + plancha lat.', type: 'time', sets: 3, reps: '30-40 s', rest: '60 s', note: 'Core duro = base calisténica' },
    ],
  },
};

// Índices de JS: 0 = domingo … 6 = sábado
export const SCHEDULE = [null, 'torsoA', 'piernaA', null, 'torsoB', 'piernaB', 'casa'];

// ---------------------------------------------------------------------------
// Dieta. `per` es la cantidad base a la que corresponden kcal y prot.
// Editar `qty` desde la app crea un override; esto son solo los valores base.
// ---------------------------------------------------------------------------

export const MEALS = [
  {
    id: 'cafe', time: '7:30', name: 'Al levantarse',
    items: [
      { id: 'cafe_solo', name: 'Café solo', qty: 1, unit: 'taza', per: 1, kcal: 5, prot: 0 },
    ],
  },
  {
    id: 'm1', time: '10:30', name: '1ª comida',
    items: [
      { id: 'avena',      name: 'Avena',              qty: 80,  unit: 'g',  per: 100, kcal: 380, prot: 13 },
      { id: 'leche_1',    name: 'Leche entera',       qty: 300, unit: 'ml', per: 100, kcal: 65,  prot: 3.2 },
      { id: 'platano_1',  name: 'Plátano',            qty: 1,   unit: 'ud', per: 1,   kcal: 105, prot: 1.3 },
      { id: 'cacahuete',  name: 'Crema de cacahuete', qty: 20,  unit: 'g',  per: 100, kcal: 600, prot: 25 },
      { id: 'whey_1',     name: 'Proteína en polvo',  qty: 1,   unit: 'scoop', per: 1, kcal: 120, prot: 24 },
    ],
  },
  {
    id: 'm2', time: '14:00', name: 'Comida',
    items: [
      { id: 'arroz',   name: 'Arroz o pasta (crudo)', qty: 100, unit: 'g',  per: 100, kcal: 360, prot: 7 },
      { id: 'pollo',   name: 'Pollo, ternera o pescado', qty: 180, unit: 'g', per: 100, kcal: 110, prot: 23 },
      { id: 'verdura', name: 'Verdura',               qty: 200, unit: 'g',  per: 100, kcal: 30,  prot: 1.5 },
      { id: 'aove_1',  name: 'Aceite de oliva',       qty: 15,  unit: 'ml', per: 100, kcal: 884, prot: 0 },
    ],
  },
  {
    id: 'm3', time: '17:30', name: 'Pre-entreno',
    items: [
      { id: 'pan',       name: 'Pan integral', qty: 60, unit: 'g',  per: 100, kcal: 250, prot: 8 },
      { id: 'fruta',     name: 'Fruta',        qty: 1,  unit: 'ud', per: 1,   kcal: 80,  prot: 1 },
      { id: 'nueces',    name: 'Nueces',       qty: 20, unit: 'g',  per: 100, kcal: 650, prot: 15 },
    ],
  },
  {
    id: 'm4', time: '19:30', name: 'Post-entreno',
    items: [
      { id: 'whey_2',    name: 'Proteína en polvo', qty: 1,   unit: 'scoop', per: 1, kcal: 120, prot: 24 },
      { id: 'leche_2',   name: 'Leche entera',      qty: 300, unit: 'ml', per: 100, kcal: 65, prot: 3.2 },
      { id: 'creatina',  name: 'Creatina',          qty: 5,   unit: 'g',  per: 5,   kcal: 0,  prot: 0 },
    ],
  },
  {
    id: 'm5', time: '21:30', name: 'Cena',
    items: [
      { id: 'huevos',   name: 'Huevos o pescado', qty: 3,   unit: 'ud', per: 1,   kcal: 78, prot: 6.3 },
      { id: 'patata',   name: 'Patata o boniato', qty: 250, unit: 'g',  per: 100, kcal: 77, prot: 2 },
      { id: 'ensalada', name: 'Ensalada',         qty: 150, unit: 'g',  per: 100, kcal: 25, prot: 1.5 },
      { id: 'aove_2',   name: 'Aceite de oliva',  qty: 10,  unit: 'ml', per: 100, kcal: 884, prot: 0 },
    ],
  },
];

export const DEFAULT_TARGETS = { kcal: 2860, prot: 170 };

// Índice plano de todos los ítems, por comodidad
export const ITEM_INDEX = Object.fromEntries(
  MEALS.flatMap(m => m.items.map(it => [it.id, { ...it, mealId: m.id }]))
);

export const EXERCISE_INDEX = Object.fromEntries(
  Object.values(SESSIONS).flatMap(s =>
    s.exercises.map(e => [e.id, { ...e, sessionId: s.id, sessionName: s.name }])
  )
);
