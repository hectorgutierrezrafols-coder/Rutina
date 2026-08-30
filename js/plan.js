// ---------------------------------------------------------------------------
// plan.js — El plan como puro dato.
//
// EXERCISES es el catálogo de movimientos. Las sesiones solo los referencian
// por `ref`, así que sustituir un ejercicio es cambiar a qué id apunta.
// El historial se guarda contra el id del ejercicio: al sustituir empieza un
// historial nuevo, que es lo correcto (no son el mismo movimiento).
// ---------------------------------------------------------------------------

// type: 'weight' (kg + repes) | 'body' (repes, kg como lastre) | 'time' (segundos)

export const EXERCISES = {
  // --- Tirón vertical -------------------------------------------------------
  dominadas:       { name: 'Dominadas',                  type: 'body',   alts: ['jalon_pecho', 'dom_asistida', 'jalon_supino'] },
  dom_supina:      { name: 'Dominada supina',            type: 'body',   alts: ['jalon_supino', 'dom_asistida', 'jalon_pecho', 'remo_polea'] },
  jalon_pecho:     { name: 'Jalón al pecho',             type: 'weight', alts: ['dominadas', 'jalon_supino', 'dom_asistida'] },
  jalon_supino:    { name: 'Jalón agarre supino',        type: 'weight', alts: ['dom_supina', 'jalon_pecho', 'remo_polea'] },
  dom_asistida:    { name: 'Dominada asistida (goma)',   type: 'body',   alts: ['jalon_pecho', 'dominadas'] },

  // --- Tirón horizontal -----------------------------------------------------
  remo_barra:      { name: 'Remo con barra',             type: 'weight', alts: ['remo_mancuerna', 'remo_polea', 'remo_maquina'] },
  remo_mancuerna:  { name: 'Remo con mancuerna',         type: 'weight', alts: ['remo_barra', 'remo_polea', 'remo_maquina'] },
  remo_polea:      { name: 'Remo en polea baja',         type: 'weight', alts: ['remo_barra', 'remo_mancuerna', 'remo_maquina'] },
  remo_maquina:    { name: 'Remo en máquina',            type: 'weight', alts: ['remo_polea', 'remo_mancuerna'] },
  remo_invertido:  { name: 'Remo invertido',             type: 'body',   alts: ['remo_polea', 'remo_mancuerna'] },
  face_pull:       { name: 'Face pull',                  type: 'weight', alts: ['pajaro_mancuerna', 'remo_polea'] },
  pajaro_mancuerna:{ name: 'Pájaro con mancuernas',      type: 'weight', alts: ['face_pull'] },

  // --- Empuje horizontal ----------------------------------------------------
  press_banca:     { name: 'Press banca',                type: 'weight', alts: ['press_mancuernas', 'press_inclinado', 'press_maquina'] },
  press_mancuernas:{ name: 'Press con mancuernas',       type: 'weight', alts: ['press_banca', 'press_inclinado', 'press_maquina'] },
  press_inclinado: { name: 'Press inclinado mancuerna',  type: 'weight', alts: ['press_banca', 'press_mancuernas', 'fondos'] },
  press_estrecho:  { name: 'Press banca agarre estrecho',type: 'weight', alts: ['fondos_lastre', 'press_inclinado', 'triceps_polea'] },
  press_maquina:   { name: 'Press pecho en máquina',     type: 'weight', alts: ['press_banca', 'press_mancuernas'] },
  fondos:          { name: 'Fondos en paralelas',        type: 'body',   alts: ['press_inclinado', 'fondos_banco', 'fondos_maquina', 'press_estrecho'] },
  fondos_lastre:   { name: 'Fondos con lastre',          type: 'body',   alts: ['press_estrecho', 'fondos_maquina', 'press_inclinado', 'fondos_banco'] },
  fondos_banco:    { name: 'Fondos en banco',            type: 'body',   alts: ['press_estrecho', 'triceps_polea'] },
  fondos_maquina:  { name: 'Fondos en máquina asistida', type: 'weight', alts: ['fondos', 'press_estrecho'] },
  flexiones:       { name: 'Flexiones',                  type: 'body',   alts: ['flex_pies_elev', 'flex_diamante', 'press_mancuernas'] },
  flex_pies_elev:  { name: 'Flexiones pies elevados',    type: 'body',   alts: ['flexiones', 'flex_diamante'] },
  flex_diamante:   { name: 'Flexiones diamante',         type: 'body',   alts: ['flexiones', 'fondos_banco'] },

  // --- Empuje vertical ------------------------------------------------------
  press_militar:      { name: 'Press militar de pie',    type: 'weight', alts: ['press_militar_sent', 'press_arnold', 'press_hombro_maq'] },
  press_militar_sent: { name: 'Press militar sentado',   type: 'weight', alts: ['press_militar', 'press_arnold'] },
  press_arnold:       { name: 'Press Arnold',            type: 'weight', alts: ['press_militar', 'press_militar_sent'] },
  press_hombro_maq:   { name: 'Press hombro en máquina', type: 'weight', alts: ['press_militar', 'press_militar_sent'] },
  flex_pike:          { name: 'Flexiones pike',          type: 'body',   alts: ['press_militar', 'flexiones'] },
  elev_lat:           { name: 'Elevaciones laterales',   type: 'weight', alts: ['elev_lat_polea', 'pajaro_mancuerna'] },
  elev_lat_polea:     { name: 'Elevación lateral en polea', type: 'weight', alts: ['elev_lat'] },

  // --- Brazo ----------------------------------------------------------------
  curl_biceps:      { name: 'Curl bíceps',               type: 'weight', alts: ['curl_martillo', 'curl_polea', 'curl_predicador'] },
  curl_martillo:    { name: 'Curl martillo',             type: 'weight', alts: ['curl_biceps', 'curl_polea'] },
  curl_polea:       { name: 'Curl en polea',             type: 'weight', alts: ['curl_biceps', 'curl_martillo'] },
  curl_predicador:  { name: 'Curl predicador',           type: 'weight', alts: ['curl_biceps', 'curl_polea'] },
  triceps_polea:    { name: 'Tríceps en polea',          type: 'weight', alts: ['press_frances', 'fondos_banco', 'triceps_mancuerna'] },
  press_frances:    { name: 'Press francés',             type: 'weight', alts: ['triceps_polea', 'triceps_mancuerna'] },
  triceps_mancuerna:{ name: 'Extensión tríceps mancuerna', type: 'weight', alts: ['triceps_polea', 'press_frances'] },

  // --- Pierna ---------------------------------------------------------------
  sentadilla:        { name: 'Sentadilla trasera',       type: 'weight', alts: ['sentadilla_frontal', 'prensa', 'hack', 'goblet'] },
  sentadilla_frontal:{ name: 'Sentadilla frontal',       type: 'weight', alts: ['sentadilla', 'goblet', 'hack'] },
  goblet:            { name: 'Sentadilla goblet',        type: 'weight', alts: ['sentadilla', 'prensa'] },
  prensa:            { name: 'Prensa de piernas',        type: 'weight', alts: ['sentadilla', 'hack', 'zancadas'] },
  hack:              { name: 'Hack squat',               type: 'weight', alts: ['sentadilla', 'prensa'] },
  peso_muerto:       { name: 'Peso muerto',              type: 'weight', alts: ['pm_rumano', 'hip_thrust', 'pm_sumo'] },
  pm_sumo:           { name: 'Peso muerto sumo',         type: 'weight', alts: ['peso_muerto', 'pm_rumano'] },
  pm_rumano:         { name: 'Peso muerto rumano',       type: 'weight', alts: ['curl_femoral', 'buenos_dias', 'hip_thrust'] },
  hip_thrust:        { name: 'Hip thrust',               type: 'weight', alts: ['peso_muerto', 'pm_rumano', 'puente_gluteo'] },
  puente_gluteo:     { name: 'Puente de glúteo',         type: 'body',   alts: ['hip_thrust'] },
  buenos_dias:       { name: 'Buenos días',              type: 'weight', alts: ['pm_rumano', 'curl_femoral'] },
  zancadas:          { name: 'Zancadas',                 type: 'weight', alts: ['bulgara', 'prensa', 'step_up'] },
  bulgara:           { name: 'Sentadilla búlgara',       type: 'weight', alts: ['zancadas', 'step_up', 'prensa'] },
  bulgara_silla:     { name: 'Búlgara con silla',        type: 'body',   alts: ['sentadilla_libre', 'zancadas'] },
  sentadilla_libre:  { name: 'Sentadilla sin peso',      type: 'body',   alts: ['bulgara_silla', 'zancadas'] },
  step_up:           { name: 'Subida al cajón',          type: 'weight', alts: ['zancadas', 'bulgara'] },
  curl_femoral:      { name: 'Curl femoral',             type: 'weight', alts: ['pm_rumano', 'buenos_dias'] },
  ext_cuadriceps:    { name: 'Extensión de cuádriceps',  type: 'weight', alts: ['prensa', 'sentadilla'] },
  gemelo_pie:        { name: 'Gemelo de pie',            type: 'weight', alts: ['gemelo_sent', 'gemelo_prensa'] },
  gemelo_sent:       { name: 'Gemelo sentado',           type: 'weight', alts: ['gemelo_pie', 'gemelo_prensa'] },
  gemelo_prensa:     { name: 'Gemelo en prensa',         type: 'weight', alts: ['gemelo_pie', 'gemelo_sent'] },

  // --- Core -----------------------------------------------------------------
  plancha:          { name: 'Plancha',                   type: 'time',   alts: ['hollow', 'rueda_abdominal'] },
  hollow:           { name: 'Hollow hold',               type: 'time',   alts: ['plancha', 'rueda_abdominal'] },
  elev_piernas:     { name: 'Elevación de piernas colgado', type: 'body', alts: ['elev_rodillas', 'crunch_polea', 'hollow'] },
  elev_rodillas:    { name: 'Elevación de rodillas',     type: 'body',   alts: ['elev_piernas', 'crunch_polea'] },
  crunch_polea:     { name: 'Crunch en polea',           type: 'weight', alts: ['elev_piernas', 'rueda_abdominal'] },
  rueda_abdominal:  { name: 'Rueda abdominal',           type: 'body',   alts: ['plancha', 'hollow'] },
};

export const SESSIONS = {
  torsoA: {
    id: 'torsoA', name: 'Torso A',
    exercises: [
      { ref: 'dominadas',   sets: 4, reps: '5-8',   rest: '2-3 min', note: 'Lastre al pasar de 10 repes' },
      { ref: 'press_banca', sets: 4, reps: '6-10',  rest: '2-3 min', note: 'Codos a 45 grados' },
      { ref: 'remo_barra',  sets: 3, reps: '8-12',  rest: '2 min',   note: 'Espalda neutra, sin tirones' },
      { ref: 'fondos',      sets: 3, reps: '6-10',  rest: '2 min',   note: 'Empuje horizontal de apoyo' },
      { ref: 'curl_biceps', sets: 3, reps: '10-12', rest: '60-90 s', note: 'Sin balanceo' },
      { ref: 'face_pull',   sets: 3, reps: '15',    rest: '60 s',    note: 'Salud de hombro, no fallar' },
    ],
  },
  piernaA: {
    id: 'piernaA', name: 'Pierna A',
    exercises: [
      { ref: 'sentadilla', sets: 4, reps: '6-10',    rest: '3 min',   note: 'Profundidad constante' },
      { ref: 'pm_rumano',  sets: 3, reps: '8-10',    rest: '2-3 min', note: 'Estirón en isquios' },
      { ref: 'zancadas',   sets: 3, reps: '10-12',   rest: '2 min',   note: 'Por pierna' },
      { ref: 'gemelo_pie', sets: 4, reps: '12-15',   rest: '60 s',    note: 'Pausa de 1 s arriba' },
      { ref: 'plancha',    sets: 3, reps: '30-45 s', rest: '60 s',    note: 'Lumbar pegada al suelo' },
    ],
  },
  torsoB: {
    id: 'torsoB', name: 'Torso B',
    exercises: [
      { ref: 'press_militar',  sets: 4, reps: '6-10',  rest: '2-3 min', note: 'Glúteo y abdomen apretados' },
      { ref: 'dom_supina',     sets: 4, reps: '8-12',  rest: '2 min',   note: 'Bíceps y dorsal' },
      { ref: 'fondos_lastre',  sets: 4, reps: '6-10',  rest: '2-3 min', note: 'Empuje pesado de pecho y tríceps' },
      { ref: 'remo_mancuerna', sets: 3, reps: '10-12', rest: '90 s',    note: 'Por brazo, rango completo' },
      { ref: 'elev_lat',       sets: 3, reps: '12-15', rest: '60 s',    note: 'Hombro ancho = clave estética' },
      { ref: 'triceps_polea',  sets: 3, reps: '10-12', rest: '60 s',    note: 'Codos fijos' },
    ],
  },
  piernaB: {
    id: 'piernaB', name: 'Pierna B',
    exercises: [
      { ref: 'peso_muerto',  sets: 4, reps: '5-8',   rest: '3 min', note: 'Técnica antes que peso' },
      { ref: 'bulgara',      sets: 3, reps: '8-10',  rest: '2 min', note: 'Por pierna' },
      { ref: 'curl_femoral', sets: 3, reps: '10-12', rest: '90 s',  note: 'Control en la bajada' },
      { ref: 'gemelo_sent',  sets: 4, reps: '15',    rest: '60 s',  note: 'Rango completo' },
      { ref: 'elev_piernas', sets: 3, reps: '10-15', rest: '60 s',  note: 'Sin coger impulso' },
    ],
  },
  casa: {
    id: 'casa', name: 'Casa', optional: true,
    exercises: [
      { ref: 'flexiones',      sets: 4, reps: '12-20',   rest: '90 s', note: 'Pies elevados para subir dificultad' },
      { ref: 'flex_pike',      sets: 3, reps: '8-12',    rest: '90 s', note: 'Camino hacia el pino' },
      { ref: 'remo_invertido', sets: 4, reps: '10-15',   rest: '90 s', note: 'Cuerpo recto como una tabla' },
      { ref: 'bulgara_silla',  sets: 3, reps: '12-15',   rest: '90 s', note: 'Por pierna' },
      { ref: 'hollow',         sets: 3, reps: '30-40 s', rest: '60 s', note: 'Core duro = base calisténica' },
    ],
  },
};

// Sustituciones activas de fábrica: fondos y dominada supina, que no puedes hacer.
// Cambiables desde la app; lo que elijas allí manda sobre esto.
export const DEFAULT_SWAPS = {
  fondos: 'press_inclinado',
  fondos_lastre: 'press_estrecho',
  dom_supina: 'jalon_supino',
};

// Índices de JS: 0 = domingo … 6 = sábado
export const SCHEDULE = [null, 'torsoA', 'piernaA', null, 'torsoB', 'piernaB', 'casa'];

// ---------------------------------------------------------------------------
// Dieta. Es la plantilla de referencia: sirve para rellenar el día de un toque.
// Cada ítem apunta a un alimento de foods.js.
// ---------------------------------------------------------------------------

export const MEALS = [
  {
    id: 'cafe', time: '7:30', name: 'Al levantarse',
    items: [{ id: 'cafe_solo', food: 'cafe_solo', qty: 200 }],
  },
  {
    id: 'm1', time: '10:30', name: '1ª comida',
    items: [
      { id: 'avena',     food: 'avena',           qty: 80 },
      { id: 'leche_1',   food: 'leche_entera',    qty: 300 },
      { id: 'platano_1', food: 'platano',         qty: 1 },
      { id: 'cacahuete', food: 'crema_cacahuete', qty: 20 },
      { id: 'whey_1',    food: 'whey_scoop',      qty: 1 },
    ],
  },
  {
    id: 'm2', time: '14:00', name: 'Comida',
    items: [
      { id: 'arroz',   food: 'arroz_crudo',   qty: 100 },
      { id: 'pollo',   food: 'pechuga_pollo', qty: 180 },
      { id: 'verdura', food: 'menestra',      qty: 200 },
      { id: 'aove_1',  food: 'aove',          qty: 15 },
    ],
  },
  {
    id: 'm3', time: '17:30', name: 'Pre-entreno',
    items: [
      { id: 'pan',    food: 'pan_integral', qty: 60 },
      { id: 'fruta',  food: 'manzana',      qty: 1 },
      { id: 'nueces', food: 'nueces',       qty: 20 },
    ],
  },
  {
    id: 'm4', time: '19:30', name: 'Post-entreno',
    items: [
      { id: 'whey_2',   food: 'whey_scoop',   qty: 1 },
      { id: 'leche_2',  food: 'leche_entera', qty: 300 },
      { id: 'creatina', food: 'creatina',     qty: 5 },
    ],
  },
  {
    id: 'm5', time: '21:30', name: 'Cena',
    items: [
      { id: 'huevos',   food: 'huevo_l', qty: 3 },
      { id: 'patata',   food: 'patata',  qty: 250 },
      { id: 'ensalada', food: 'lechuga', qty: 150 },
      { id: 'aove_2',   food: 'aove',    qty: 10 },
    ],
  },
];

export const DEFAULT_TARGETS = { kcal: 2860, prot: 170 };

// Margen dentro del cual se da el objetivo por cumplido (±5 %)
export const TOLERANCE = 0.05;
