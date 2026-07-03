import { openSvg, closeSvg, blob, label } from './svg.js';

export function featureData() {
  // target near (RT 30, m/z 900) mapped to canvas; trap is a near-m/z co-eluter
  const blobs = [
    { id:'t',  x:250, y:120, r:26, kind:'target' },
    { id:'x',  x:300, y:110, r:20, kind:'trap' },   // interference: close in x/y
    { id:'o1', x:120, y:80,  r:16, kind:'other' },
    { id:'o2', x:420, y:170, r:18, kind:'other' },
    { id:'o3', x:180, y:210, r:14, kind:'other' },
  ];
  return { blobs, targetId:'t', trapId:'x' };
}

export function checkFeature(clickId, data) {
  return { correct: clickId === data.targetId, penalty: clickId === data.trapId };
}

export function render(container, { onDone }) {
  const d = featureData();
  const W = 520, H = 260;
  const shapes = d.blobs.map(b =>
    blob(b.x, b.y, b.r, { color:'#00979D', id:`bl_${b.id}`, opacity:0.55 })).join('');
  container.innerHTML = `
    <div class="card">
      <span class="chip">Feature detection</span>
      <h2>Your peptide is at m/z 900, RT 30 s. Click YOUR feature.</h2>
      ${openSvg(W,H)}
        ${label(250, 250, 'retention time →', { size:12 })}
        ${shapes}
      ${closeSvg()}
      <p class="muted">Beware a near-identical neighbour (interference).</p>
    </div>`;
  d.blobs.forEach(b => {
    const el = container.querySelector(`#bl_${b.id}`);
    el.style.cursor = 'pointer';
    el.onclick = () => {
      const { correct, penalty } = checkFeature(b.id, d);
      onDone({ correct, penalty, topic:'feature',
        explain: 'The target matches BOTH m/z and RT; the close neighbour is interference.' });
    };
  });
}
