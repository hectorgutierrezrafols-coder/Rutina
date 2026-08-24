// ---------------------------------------------------------------------------
// charts.js — SVG a mano. Sin librerías: cuatro gráficas de línea no justifican
// 200 KB de dependencia en una app que tiene que arrancar offline.
// ---------------------------------------------------------------------------

const PAD = { top: 14, right: 12, bottom: 22, left: 34 };

function niceTicks(min, max, count = 4) {
  if (min === max) return [min];
  const span = max - min;
  const step = Math.pow(10, Math.floor(Math.log10(span / count)));
  const err = (span / count) / step;
  const mult = err >= 7.5 ? 10 : err >= 3 ? 5 : err >= 1.5 ? 2 : 1;
  const s = step * mult;
  const ticks = [];
  for (let v = Math.ceil(min / s) * s; v <= max + 1e-9; v += s) {
    ticks.push(Math.round(v * 100) / 100);
  }
  return ticks;
}

function shortDate(key) {
  const [, m, d] = key.split('-');
  return `${Number(d)}/${Number(m)}`;
}

/**
 * Gráfica de línea.
 * @param {{label:string, value:number}[]} points
 */
export function lineChart(points, { height = 170, unit = '', fill = true } = {}) {
  if (!points || points.length === 0) return emptyChart('Sin datos todavía');

  const W = 320, H = height;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const values = points.map(p => p.value);
  let min = Math.min(...values), max = Math.max(...values);
  if (min === max) { min -= 1; max += 1; }
  const span = max - min;
  min -= span * 0.12; max += span * 0.12;

  const x = i => points.length === 1
    ? PAD.left + innerW / 2
    : PAD.left + (i / (points.length - 1)) * innerW;
  const y = v => PAD.top + innerH - ((v - min) / (max - min)) * innerH;

  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${path} L${x(points.length - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${x(0).toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`;

  const ticks = niceTicks(min, max, 4);
  const grid = ticks.map(t => `
    <line x1="${PAD.left}" y1="${y(t).toFixed(1)}" x2="${W - PAD.right}" y2="${y(t).toFixed(1)}"
          class="grid"/>
    <text x="${PAD.left - 6}" y="${(y(t) + 3.5).toFixed(1)}" class="axis" text-anchor="end">${t}</text>
  `).join('');

  // Como mucho 4 etiquetas en el eje X para que no se amontonen
  const step = Math.max(1, Math.ceil(points.length / 4));
  const xLabels = points.map((p, i) =>
    (i % step === 0 || i === points.length - 1)
      ? `<text x="${x(i).toFixed(1)}" y="${H - 6}" class="axis" text-anchor="middle">${p.label}</text>`
      : ''
  ).join('');

  const dots = points.map((p, i) =>
    `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="2.6" class="dot"/>`
  ).join('');

  const last = points[points.length - 1];

  return `
  <svg viewBox="0 0 ${W} ${H}" class="chart" role="img"
       aria-label="Evolución: último valor ${last.value} ${unit}">
    <defs>
      <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--brass)" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="var(--brass)" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${grid}
    ${fill ? `<path d="${area}" fill="url(#fillGrad)"/>` : ''}
    <path d="${path}" class="line"/>
    ${dots}
    ${xLabels}
  </svg>`;
}

/**
 * Gráfica de barras.
 * @param {{label:string, value:number, max?:number}[]} bars
 */
export function barChart(bars, { height = 150, unit = '' } = {}) {
  if (!bars || bars.length === 0) return emptyChart('Sin datos todavía');

  const W = 320, H = height;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const max = Math.max(...bars.map(b => b.max ?? b.value), 1);

  const slot = innerW / bars.length;
  const bw = Math.min(slot * 0.6, 26);

  const rects = bars.map((b, i) => {
    const h = (b.value / max) * innerH;
    const bx = PAD.left + slot * i + (slot - bw) / 2;
    const by = PAD.top + innerH - h;
    return `
      <rect x="${bx.toFixed(1)}" y="${(PAD.top + innerH - innerH).toFixed(1)}"
            width="${bw.toFixed(1)}" height="${innerH.toFixed(1)}" rx="3" class="bar-track"/>
      <rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}"
            width="${bw.toFixed(1)}" height="${Math.max(h, 1.5).toFixed(1)}" rx="3" class="bar"/>
      <text x="${(bx + bw / 2).toFixed(1)}" y="${H - 6}" class="axis" text-anchor="middle">${b.label}</text>`;
  }).join('');

  const ticks = niceTicks(0, max, 3);
  const grid = ticks.map(t => {
    const yy = PAD.top + innerH - (t / max) * innerH;
    return `<line x1="${PAD.left}" y1="${yy.toFixed(1)}" x2="${W - PAD.right}" y2="${yy.toFixed(1)}" class="grid"/>
            <text x="${PAD.left - 6}" y="${(yy + 3.5).toFixed(1)}" class="axis" text-anchor="end">${t}</text>`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Barras en ${unit}">
    ${grid}${rects}
  </svg>`;
}

function emptyChart(msg) {
  return `<div class="chart-empty">${msg}</div>`;
}

export { shortDate };
