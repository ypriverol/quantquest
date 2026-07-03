import { openSvg, closeSvg, stem, label } from './svg.js';

export function envelopeData() {
  // 2+ ion, spacing 0.5; heights decreasing; monoisotopic = leftmost
  const base = 600.0, dm = 0.5;
  const heights = [1, 0.62, 0.27, 0.09];
  const peaks = heights.map((h, i) => ({ mz: +(base + i*dm).toFixed(1), h }));
  return { peaks, monoIndex: 0, charge: 2 };
}

export function checkEnvelope(clickIndex, chargeChoice, data) {
  return { correct: clickIndex === data.monoIndex && Number(chargeChoice) === data.charge };
}

export function render(container, { onDone }) {
  const d = envelopeData();
  const W = 520, H = 260, x0 = 60, y0 = 210, colW = 100;
  let picked = null, charge = null;
  const draw = () => {
    const stems = d.peaks.map((p, i) => {
      const x = x0 + i*colW, y1 = y0 - p.h*160;
      const color = picked === i ? '#E86A1C' : '#00979D';
      return stem(x, y0, y1, { color, w: 16, id:`pk${i}` }) + label(x, y0+22, `${p.mz}`, { size:12 });
    }).join('');
    container.innerHTML = `
      <div class="card">
        <span class="chip">Feature detection</span>
        <h2>Click the monoisotopic peak, then pick the charge</h2>
        ${openSvg(W,H)}${stems}${closeSvg()}
        <div class="choices">
          ${[1,2,3].map(z=>`<button class="choice zc ${charge===z?'good':''}" data-z="${z}">${z}+</button>`).join('')}
        </div>
        <button id="submitEnv" class="btn-primary" ${picked!==null&&charge!==null?'':'disabled'}>Submit</button>
      </div>`;
    d.peaks.forEach((_, i) => { container.querySelector(`#pk${i}`).onclick = () => { picked = i; draw(); }; });
    container.querySelectorAll('.zc').forEach(b => b.onclick = () => { charge = Number(b.dataset.z); draw(); });
    const sb = container.querySelector('#submitEnv');
    if (sb) sb.onclick = () => {
      const { correct } = checkEnvelope(picked, charge, d);
      onDone({ correct, penalty:false, topic:'feature',
        explain: 'Monoisotopic = the left-most peak; spacing 0.5 → charge 2+.' });
    };
  };
  draw();
}
