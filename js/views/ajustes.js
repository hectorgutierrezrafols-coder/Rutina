import * as store from '../store.js';

export function render(root) {
  const t = store.getTargets();
  const s = store.getState();
  const nWorkouts = Object.keys(s.workouts).length;
  const nDiet = Object.keys(s.diet).length;
  const nCustom = (s.customFoods || []).length;
  const nSwaps = Object.keys(s.swaps || {}).length;
  const bytes = new Blob([store.exportJSON()]).size;

  root.innerHTML = `
    <header class="view-head">
      <span class="eyebrow">Ajustes</span>
      <strong class="view-title">Objetivos y datos</strong>
    </header>

    <section class="panel">
      <div class="panel-head"><h2>Objetivos diarios</h2></div>
      <div class="field">
        <label for="tk">Calorías</label>
        <span class="bw-input"><input id="tk" class="num" type="number" inputmode="numeric"
              data-target="kcal" value="${t.kcal}"> <span class="unit">kcal</span></span>
      </div>
      <div class="field">
        <label for="tp">Proteína</label>
        <span class="bw-input"><input id="tp" class="num" type="number" inputmode="numeric"
              data-target="prot" value="${t.prot}"> <span class="unit">g</span></span>
      </div>
      <p class="panel-foot">Sube las calorías si el peso lleva 2-3 semanas parado.</p>
    </section>

    <section class="panel">
      <div class="panel-head"><h2>Copia de seguridad</h2></div>
      <p class="panel-foot" style="margin-top:0">
        ${nWorkouts} días de entreno · ${nDiet} días de dieta · ${nCustom} alimentos propios
        · ${nSwaps} sustituciones · ${(bytes / 1024).toFixed(1)} KB
      </p>
      <div class="btn-row">
        <button class="btn" data-export>Exportar a archivo</button>
        <button class="btn" data-import>Importar archivo</button>
      </div>
      <input type="file" accept="application/json,.json" hidden data-file>
      <p class="panel-foot">
        Los datos viven solo en este móvil. Exporta de vez en cuando: es lo único
        que te separa de perder el histórico si reinstalas o cambias de teléfono.
      </p>
    </section>

    ${nCustom ? `
    <section class="panel">
      <div class="panel-head"><h2>Mis alimentos</h2></div>
      <div class="items">
        ${s.customFoods.map(f => `
          <div class="item">
            <span class="item-name">${f.name}</span>
            <span class="item-kcal">${f.kcal}</span>
            <button class="item-del" data-delfood="${f.id}" aria-label="Borrar ${f.name}">×</button>
          </div>`).join('')}
      </div>
      <p class="panel-foot">Los que creas o traigas por código de barras se guardan aquí.</p>
    </section>` : ''}

    <section class="panel">
      <div class="panel-head"><h2>Restablecer</h2></div>
      <div class="btn-row">
        <button class="btn subtle" data-reset-swaps>Restaurar ejercicios originales</button>
      </div>
      <button class="danger-ghost" data-wipe>Borrar todos los datos</button>
    </section>

    <p class="hint version">Entreno · v1 · ${nWorkouts ? 'datos locales' : 'sin datos aún'}</p>
  `;

  bind(root);
}

function bind(root) {
  root.querySelectorAll('[data-target]').forEach(input => {
    input.addEventListener('change', () => {
      store.setTargets({ [input.dataset.target]: Number(input.value) });
    });
  });

  root.querySelector('[data-export]').addEventListener('click', () => {
    const blob = new Blob([store.exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `entreno-${store.todayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });

  const file = root.querySelector('[data-file]');
  root.querySelector('[data-import]').addEventListener('click', () => file.click());
  file.addEventListener('change', async () => {
    const f = file.files[0];
    if (!f) return;
    try {
      store.importJSON(await f.text());
      alert('Datos importados.');
      render(root);
    } catch (err) {
      alert('No se ha podido leer el archivo: ' + err.message);
    }
  });

  root.querySelector('[data-reset-swaps]').addEventListener('click', () => {
    if (confirm('¿Volver a los ejercicios del plan de fábrica?')) {
      store.resetSwaps();
      render(root);
    }
  });

  root.querySelectorAll('[data-delfood]').forEach(b => {
    b.addEventListener('click', () => {
      store.removeCustomFood(b.dataset.delfood);
      render(root);
    });
  });

  root.querySelector('[data-wipe]').addEventListener('click', () => {
    if (confirm('Esto borra el histórico completo y no se puede deshacer. ¿Seguro?')
        && confirm('Última confirmación: se pierde todo.')) {
      store.wipe();
      render(root);
    }
  });
}

export function reset() {}
