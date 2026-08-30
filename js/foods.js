// ---------------------------------------------------------------------------
// foods.js — Base de datos local de alimentos.
// Valores por 100 g / 100 ml salvo los marcados con unit:'ud', que van por pieza.
// Fuentes: BEDCA y tablas de composición estándar. Son valores medios: sirven
// para seguir una tendencia, no para precisión de laboratorio.
//
// Para añadir alimentos fijos, escríbelos aquí. Los que añadas desde la app
// se guardan aparte, en tu propio almacenamiento.
// ---------------------------------------------------------------------------

const g = (id, name, cat, kcal, prot, carb, fat) =>
  ({ id, name, cat, unit: 'g', per: 100, kcal, prot, carb, fat });
const ml = (id, name, cat, kcal, prot, carb, fat) =>
  ({ id, name, cat, unit: 'ml', per: 100, kcal, prot, carb, fat });
const ud = (id, name, cat, kcal, prot, carb, fat, hint) =>
  ({ id, name, cat, unit: 'ud', per: 1, kcal, prot, carb, fat, hint });

export const FOODS = [
  // --- Carnes ---------------------------------------------------------------
  g('pechuga_pollo',   'Pechuga de pollo',          'Carne', 110, 23,   0,   2),
  g('muslo_pollo',     'Muslo de pollo sin piel',   'Carne', 145, 20,   0,   7),
  g('pavo_pechuga',    'Pechuga de pavo',           'Carne', 105, 24,   0,   1),
  g('fiambre_pavo',    'Fiambre de pavo',           'Carne',  95, 17,   2,   2),
  g('ternera_magra',   'Ternera magra',             'Carne', 135, 21,   0,   5),
  g('solomillo_cerdo', 'Solomillo de cerdo',        'Carne', 120, 22,   0,   3),
  g('lomo_cerdo',      'Lomo de cerdo',             'Carne', 145, 21,   0,   6),
  g('carne_picada_5',  'Carne picada 5 % grasa',    'Carne', 130, 21,   0,   5),
  g('carne_picada_15', 'Carne picada 15 % grasa',   'Carne', 220, 18,   0,  16),
  g('jamon_serrano',   'Jamón serrano',             'Carne', 240, 31,   0,  13),
  g('jamon_cocido',    'Jamón cocido',              'Carne', 110, 18,   1,   4),
  g('chorizo',         'Chorizo',                   'Carne', 455, 24,   2,  38),
  g('bacon',           'Bacon',                     'Carne', 400, 20,   0,  35),
  g('conejo',          'Conejo',                    'Carne', 130, 22,   0,   5),
  g('cordero',         'Cordero',                   'Carne', 230, 20,   0,  17),

  // --- Pescados y mariscos --------------------------------------------------
  g('merluza',         'Merluza',                   'Pescado',  70, 16,  0,  1),
  g('bacalao',         'Bacalao fresco',            'Pescado',  80, 18,  0,  1),
  g('salmon',          'Salmón',                    'Pescado', 200, 20,  0, 13),
  g('atun_fresco',     'Atún fresco',               'Pescado', 145, 23,  0,  5),
  g('atun_lata_nat',   'Atún en lata al natural',   'Pescado', 110, 25,  0,  1),
  g('atun_lata_aceite','Atún en lata en aceite',    'Pescado', 190, 24,  0, 10),
  g('sardinas_lata',   'Sardinas en lata',          'Pescado', 210, 22,  0, 13),
  g('caballa',         'Caballa',                   'Pescado', 180, 19,  0, 11),
  g('boqueron',        'Boquerón',                  'Pescado', 130, 20,  0,  5),
  g('dorada',          'Dorada',                    'Pescado', 105, 20,  0,  3),
  g('lubina',          'Lubina',                    'Pescado', 100, 19,  0,  2),
  g('gambas',          'Gambas',                    'Pescado',  90, 20,  0,  1),
  g('mejillones',      'Mejillones',                'Pescado',  85, 12,  4,  2),
  g('calamar',         'Calamar',                   'Pescado',  80, 16,  1,  1),
  g('pulpo',           'Pulpo',                     'Pescado',  82, 15,  2,  1),
  g('surimi',          'Palitos de cangrejo',       'Pescado',  95,  9, 12,  1),

  // --- Huevos y lácteos -----------------------------------------------------
  ud('huevo_m',        'Huevo M',                   'Huevos y lácteos', 72, 6.3, 0.4, 5,   'unos 55 g'),
  ud('huevo_l',        'Huevo L',                   'Huevos y lácteos', 85, 7.5, 0.5, 6,   'unos 65 g'),
  ud('clara_huevo',    'Clara de huevo',            'Huevos y lácteos', 17, 3.6, 0.2, 0),
  ml('leche_entera',   'Leche entera',              'Huevos y lácteos', 65, 3.2, 4.7, 3.6),
  ml('leche_semi',     'Leche semidesnatada',       'Huevos y lácteos', 47, 3.2, 4.8, 1.6),
  ml('leche_desnatada','Leche desnatada',           'Huevos y lácteos', 35, 3.4, 4.9, 0.2),
  ml('bebida_soja',    'Bebida de soja',            'Huevos y lácteos', 40, 3.3, 2.5, 1.8),
  ml('bebida_avena',   'Bebida de avena',           'Huevos y lácteos', 47, 0.8, 7.5, 1.3),
  g('yogur_natural',   'Yogur natural',             'Huevos y lácteos',  60, 3.5, 4.7, 3),
  g('yogur_griego',    'Yogur griego',              'Huevos y lácteos', 100, 9,   4,   5),
  g('skyr',            'Skyr / yogur proteico',     'Huevos y lácteos',  60, 11,  4,   0.2),
  g('queso_batido',    'Queso fresco batido 0 %',   'Huevos y lácteos',  47, 8,   4,   0.2),
  g('requeson',        'Requesón',                  'Huevos y lácteos',  95, 11,  3,   4),
  g('queso_fresco',    'Queso fresco de Burgos',    'Huevos y lácteos', 175, 13,  3,  12),
  g('mozzarella',      'Mozzarella',                'Huevos y lácteos', 250, 18,  2,  19),
  g('queso_curado',    'Queso curado',              'Huevos y lácteos', 390, 26,  1,  32),
  g('queso_lonchas',   'Queso en lonchas',          'Huevos y lácteos', 300, 20,  2,  24),
  g('parmesano',       'Parmesano',                 'Huevos y lácteos', 400, 33,  0,  29),

  // --- Legumbres y proteína vegetal ----------------------------------------
  g('lentejas_crudas', 'Lentejas (crudas)',         'Legumbres', 340, 24, 52, 1.5),
  g('lentejas_cocidas','Lentejas cocidas o de bote','Legumbres', 115,  9, 16, 0.5),
  g('garbanzos_crudos','Garbanzos (crudos)',        'Legumbres', 360, 19, 55, 6),
  g('garbanzos_cocidos','Garbanzos cocidos',        'Legumbres', 130,  8, 18, 3),
  g('alubias_cocidas', 'Alubias cocidas',           'Legumbres', 120,  8, 17, 0.6),
  g('guisantes',       'Guisantes',                 'Legumbres',  81,  5, 11, 0.4),
  g('tofu',            'Tofu firme',                'Legumbres', 145, 16,  3,  8),
  g('tempeh',          'Tempeh',                    'Legumbres', 190, 19,  9,  11),
  g('soja_texturizada','Soja texturizada (seca)',   'Legumbres', 340, 50, 30,  1),
  g('hummus',          'Hummus',                    'Legumbres', 240,  8, 15, 17),

  // --- Cereales, pan y tubérculos ------------------------------------------
  g('arroz_crudo',     'Arroz (crudo)',             'Cereales', 360,  7, 78, 1),
  g('arroz_cocido',    'Arroz cocido',              'Cereales', 125,  2.5, 28, 0.3),
  g('pasta_cruda',     'Pasta (cruda)',             'Cereales', 355, 12, 71, 1.5),
  g('pasta_cocida',    'Pasta cocida',              'Cereales', 130,  5, 25, 0.6),
  g('cuscus_crudo',    'Cuscús (crudo)',            'Cereales', 375, 13, 72, 1),
  g('quinoa_cruda',    'Quinoa (cruda)',            'Cereales', 370, 14, 64, 6),
  g('avena',           'Copos de avena',            'Cereales', 380, 13, 60, 7),
  g('pan_blanco',      'Pan blanco',                'Cereales', 265,  8, 50, 3),
  g('pan_integral',    'Pan integral',              'Cereales', 250,  9, 42, 3.5),
  ud('pan_molde_int',  'Rebanada pan de molde int.','Cereales',  75,  3, 12, 1,  'unos 30 g'),
  ud('tortilla_trigo', 'Tortilla de trigo',         'Cereales', 145,  4, 24, 3.5),
  g('picos_regaros',   'Picos / regañás',           'Cereales', 420, 11, 68, 11),
  g('cereales_fitness','Cereales tipo fitness',     'Cereales', 375,  8, 75, 4),
  g('patata',          'Patata',                    'Cereales',  77,  2, 17, 0.1),
  g('boniato',         'Boniato',                   'Cereales',  86,  1.6, 20, 0.1),
  g('patata_frita',    'Patatas fritas caseras',    'Cereales', 280,  3.5, 36, 14),
  g('harina_avena',    'Harina de avena',           'Cereales', 380, 13, 60, 7),
  g('pan_rallado',     'Pan rallado',               'Cereales', 350, 12, 70, 3),

  // --- Frutas ---------------------------------------------------------------
  ud('platano',        'Plátano',                   'Fruta', 105, 1.3, 27, 0.3, 'unos 120 g'),
  ud('manzana',        'Manzana',                   'Fruta',  80, 0.4, 21, 0.2),
  ud('naranja',        'Naranja',                   'Fruta',  70, 1.3, 17, 0.2),
  ud('pera',           'Pera',                      'Fruta',  95, 0.6, 25, 0.2),
  ud('kiwi',           'Kiwi',                      'Fruta',  45, 0.8, 11, 0.4),
  ud('mandarina',      'Mandarina',                 'Fruta',  45, 0.7, 11, 0.2),
  g('fresas',          'Fresas',                    'Fruta',  33, 0.7,  7, 0.3),
  g('sandia',          'Sandía',                    'Fruta',  30, 0.6,  8, 0.2),
  g('melon',           'Melón',                     'Fruta',  34, 0.8,  8, 0.2),
  g('uvas',            'Uvas',                      'Fruta',  69, 0.7, 18, 0.2),
  g('arandanos',       'Arándanos',                 'Fruta',  57, 0.7, 14, 0.3),
  g('aguacate',        'Aguacate',                  'Fruta', 160, 2,    9,  15),
  g('datiles',         'Dátiles',                   'Fruta', 280, 2,   75, 0.4),
  g('pasas',           'Pasas',                     'Fruta', 300, 3,   79, 0.5),
  g('orejones',        'Orejones de albaricoque',   'Fruta', 240, 3,   63, 0.5),

  // --- Verduras -------------------------------------------------------------
  g('brocoli',         'Brócoli',                   'Verdura',  34, 2.8,  7, 0.4),
  g('espinacas',       'Espinacas',                 'Verdura',  23, 2.9,  4, 0.4),
  g('lechuga',         'Lechuga',                   'Verdura',  15, 1.4,  3, 0.2),
  g('tomate',          'Tomate',                    'Verdura',  18, 0.9,  4, 0.2),
  g('pimiento',        'Pimiento',                  'Verdura',  26, 1,    6, 0.3),
  g('cebolla',         'Cebolla',                   'Verdura',  40, 1.1,  9, 0.1),
  g('zanahoria',       'Zanahoria',                 'Verdura',  41, 0.9, 10, 0.2),
  g('calabacin',       'Calabacín',                 'Verdura',  17, 1.2,  3, 0.3),
  g('berenjena',       'Berenjena',                 'Verdura',  25, 1,    6, 0.2),
  g('champinones',     'Champiñones',               'Verdura',  22, 3.1,  3, 0.3),
  g('judias_verdes',   'Judías verdes',             'Verdura',  31, 1.8,  7, 0.1),
  g('pepino',          'Pepino',                    'Verdura',  15, 0.7,  3, 0.1),
  g('esparragos',      'Espárragos',                'Verdura',  20, 2.2,  4, 0.1),
  g('menestra',        'Menestra de verduras',      'Verdura',  45, 3,    7, 0.4),

  // --- Frutos secos y grasas -----------------------------------------------
  g('almendras',       'Almendras',                 'Grasas', 580, 21, 22, 50),
  g('nueces',          'Nueces',                    'Grasas', 650, 15, 14, 65),
  g('anacardos',       'Anacardos',                 'Grasas', 555, 18, 30, 44),
  g('cacahuetes',      'Cacahuetes',                'Grasas', 570, 26, 16, 48),
  g('pistachos',       'Pistachos',                 'Grasas', 560, 20, 28, 45),
  g('avellanas',       'Avellanas',                 'Grasas', 630, 15, 17, 61),
  g('crema_cacahuete', 'Crema de cacahuete',        'Grasas', 600, 25, 20, 50),
  g('semillas_chia',   'Semillas de chía',          'Grasas', 490, 17, 42, 31),
  ml('aove',           'Aceite de oliva',           'Grasas', 884,  0,  0, 100),
  ml('aceite_girasol', 'Aceite de girasol',         'Grasas', 884,  0,  0, 100),
  g('mantequilla',     'Mantequilla',               'Grasas', 745,  0.6, 0.6, 82),
  g('aceitunas',       'Aceitunas',                 'Grasas', 145,  1,   3,  15),
  g('chocolate_85',    'Chocolate 85 %',            'Grasas', 590,  10, 20,  50),

  // --- Suplementos ----------------------------------------------------------
  ud('whey_scoop',     'Proteína whey (scoop)',     'Suplementos', 120, 24, 3, 1.5, 'unos 30 g'),
  g('whey_100',        'Proteína whey (a peso)',    'Suplementos', 400, 80, 8, 6),
  g('creatina',        'Creatina monohidrato',      'Suplementos',   0,  0, 0, 0),
  g('proteina_vegana', 'Proteína vegetal',          'Suplementos', 380, 75, 8, 5),

  // --- Bebidas --------------------------------------------------------------
  ml('cafe_solo',      'Café solo',                 'Bebidas',   2, 0.2, 0,  0),
  ml('cerveza',        'Cerveza',                   'Bebidas',  43, 0.5, 3.6, 0),
  ml('vino_tinto',     'Vino tinto',                'Bebidas',  85, 0.1, 2.6, 0),
  ml('refresco',       'Refresco azucarado',        'Bebidas',  42, 0,   10.6, 0),
  ml('refresco_zero',  'Refresco zero',             'Bebidas',   1, 0,   0,  0),
  ml('zumo_naranja',   'Zumo de naranja',           'Bebidas',  45, 0.7, 10, 0.2),

  // --- Platos y procesados comunes -----------------------------------------
  g('tortilla_patata', 'Tortilla de patata',        'Platos', 220, 6,  15, 15),
  g('pizza',           'Pizza',                     'Platos', 265, 11, 30, 10),
  g('paella',          'Paella',                    'Platos', 160, 9,  20,  5),
  g('lasana',          'Lasaña',                    'Platos', 180, 9,  17,  8),
  g('croquetas',       'Croquetas',                 'Platos', 245, 8,  22, 14),
  g('empanadilla',     'Empanadilla',               'Platos', 290, 8,  30, 15),
  g('sushi',           'Sushi',                     'Platos', 145, 6,  25,  2),
  g('hamburguesa',     'Hamburguesa completa',      'Platos', 250, 13, 21, 12),
  g('bocadillo_jamon', 'Bocadillo de jamón',        'Platos', 250, 13, 34,  7),
  g('gazpacho',        'Gazpacho',                  'Platos',  50, 1,   5,  3),
  g('salmorejo',       'Salmorejo',                 'Platos', 105, 2,   9,  7),

  // --- Dulces y snacks ------------------------------------------------------
  g('galletas',        'Galletas tipo María',       'Dulces', 450, 7,  73, 14),
  g('helado',          'Helado',                    'Dulces', 200, 3.5, 24, 10),
  g('miel',            'Miel',                      'Dulces', 305, 0.4, 76,  0),
  g('mermelada',       'Mermelada',                 'Dulces', 250, 0.5, 60,  0),
  g('cacao_polvo',     'Cacao en polvo sin azúcar', 'Dulces', 350, 20,  15, 12),
  g('patatas_bolsa',   'Patatas fritas de bolsa',   'Dulces', 540, 6,   50, 34),
  g('azucar',          'Azúcar',                    'Dulces', 400, 0,  100,  0),
  g('bizcocho',        'Bizcocho',                  'Dulces', 380, 6,   50, 17),
];

export const FOOD_INDEX = Object.fromEntries(FOODS.map(f => [f.id, f]));

/** Normaliza para buscar sin acentos ni mayúsculas. */
export function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Busca en la base incorporada y en los alimentos propios.
 * Prioriza los que empiezan por el término sobre los que solo lo contienen.
 */
export function searchFoods(query, custom = []) {
  const q = normalize(query).trim();
  const pool = [...custom, ...FOODS];
  if (!q) return pool.slice(0, 40);
  const words = q.split(/\s+/);
  const scored = [];
  for (const f of pool) {
    const n = normalize(f.name);
    if (!words.every(w => n.includes(w))) continue;
    scored.push({ f, score: n.startsWith(words[0]) ? 0 : n.indexOf(words[0]) });
  }
  scored.sort((a, b) => a.score - b.score || a.f.name.localeCompare(b.f.name));
  return scored.map(s => s.f).slice(0, 40);
}

/**
 * Consulta un código de barras en Open Food Facts.
 * Sin clave de API. Devuelve null si el producto no está o no hay red.
 */
export async function lookupBarcode(code) {
  const clean = String(code).replace(/\D/g, '');
  if (clean.length < 8) throw new Error('El código debe tener al menos 8 dígitos.');
  const url = `https://world.openfoodfacts.org/api/v2/product/${clean}.json`
    + '?fields=product_name,brands,nutriments,quantity';
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('No se ha podido consultar la base de datos.');
  const data = await res.json();
  // Open Food Facts no devuelve 404 cuando no encuentra: hay que mirar `status`
  if (!data || data.status !== 1 || !data.product) return null;

  const p = data.product;
  const n = p.nutriments || {};
  const kcal = n['energy-kcal_100g'];
  if (kcal === undefined) return null; // sin datos nutricionales, no sirve

  return {
    id: 'off_' + clean,
    name: [p.product_name, p.brands ? p.brands.split(',')[0].trim() : '']
      .filter(Boolean).join(' · ') || `Producto ${clean}`,
    cat: 'Código de barras',
    unit: 'g', per: 100,
    kcal: Math.round(kcal),
    prot: Math.round((n.proteins_100g || 0) * 10) / 10,
    carb: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
    fat: Math.round((n.fat_100g || 0) * 10) / 10,
    source: 'Open Food Facts',
  };
}
