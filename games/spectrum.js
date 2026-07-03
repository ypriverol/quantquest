// "Identify the MS2 peptide" — a random peptide's b/y fragment ions form the observed
// spectrum; the player picks which of two candidate sequences explains it. Clicking a
// candidate overlays ITS predicted b/y ions so the match (or mismatch) is visible.
//
// Pure, testable core: ionSeries / observedMz / matchIons (no DOM, no randomness).

const TEAL = '#00979D', ORANGE = '#E86A1C', DARK = '#0A3D52', SLATE = '#5b6b73', GREY = '#9aa6ac';

// Monoisotopic residue masses (Da). Alphabet chosen to avoid near-isobaric confusions
// (no I/K/Q); L stands in for Leu/Ile.
const RES = {
  G:57.02146, A:71.03711, S:87.03203, P:97.05276, V:99.06841, T:101.04768,
  L:113.08406, N:114.04293, D:115.02694, E:129.04259, F:147.06841, R:156.10111,
  Y:163.06333, W:186.07931,
};
const ALPHABET = Object.keys(RES);
const PROTON = 1.007276, WATER = 18.010565;
const r3 = (x) => Math.round(x * 1000) / 1000;

// b-ions (N-terminal, b1..b_{n-1}) and y-ions (C-terminal, y1..y_{n-1}), singly charged.
export function ionSeries(peptide) {
  const m = peptide.split('').map((c) => RES[c]);
  const n = m.length;
  const b = [], y = [];
  let acc = 0;
  // b_i = the first i residues (N-terminal fragment)
  for (let i = 0; i < n - 1; i++) { acc += m[i]; b.push({ ion: `b${i + 1}`, mz: r3(acc + PROTON), frag: peptide.slice(0, i + 1), cut: i + 1 }); }
  acc = 0;
  // y_j = the last j residues (C-terminal fragment)
  for (let j = 0; j < n - 1; j++) { acc += m[n - 1 - j]; y.push({ ion: `y${j + 1}`, mz: r3(acc + WATER + PROTON), frag: peptide.slice(n - (j + 1)), cut: n - (j + 1) }); }
  return { b, y };
}

export function allIons(peptide) {
  const { b, y } = ionSeries(peptide);
  return [...b, ...y];
}

// The observed spectrum m/z list = the target peptide's b/y ions (clean, sorted).
export function observedMz(peptide) {
  return [...new Set(allIons(peptide).map((i) => i.mz))].sort((a, b) => a - b);
}

// How well does `peptide` explain `observedList`? Returns matched count, total predicted,
// and per-ion marks (hit = a peak exists within tol).
export function matchIons(observedList, peptide, tol = 0.3) {
  const marks = allIons(peptide).map((p) => ({
    ion: p.ion, mz: p.mz, frag: p.frag, cut: p.cut,
    hit: observedList.some((o) => Math.abs(o - p.mz) <= tol),
  }));
  return { matched: marks.filter((m) => m.hit).length, total: marks.length, marks };
}

function randPeptide(len) {
  let s = '';
  for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
}

// Build one puzzle: a target and a clearly-different decoy of the same length.
export function makePuzzle(len) {
  const target = randPeptide(len);
  let decoy = randPeptide(len), guard = 0;
  const obs = observedMz(target);
  // keep decoys that are different AND explain fewer than half the peaks
  while ((decoy === target || matchIons(obs, decoy).matched > Math.floor((len - 1)))
         && guard++ < 40) decoy = randPeptide(len);
  return { target, decoy, observed: obs, len };
}

// ---------- spectrum drawing (pure, previewable) ----------

const stableHeight = (mz) => 0.55 + 0.4 * ((Math.sin(mz * 12.9898) + 1) / 2); // stable per peak

// Draw the observed spectrum; if `picked` (a peptide) is given, overlay its b/y matches
// (coloured, labelled) and its predicted-but-absent ions (grey ticks at the baseline).
export function buildSpectrumSvg(observed, picked = null) {
  const W = 620, H = 238, x0 = 44, x1 = W - 16, base = H - 58, top = 22;
  const lo = observed[0] - 30, hi = observed[observed.length - 1] + 30;
  const X = (mz) => x0 + (x1 - x0) * (mz - lo) / (hi - lo);
  const marks = picked ? matchIons(observed, picked).marks : [];
  const hitFor = (mz) => {
    const mk = marks.find((m) => m.hit && Math.abs(m.mz - mz) <= 0.3);
    return mk ? { label: mk.ion, color: mk.ion[0] === 'b' ? TEAL : ORANGE } : null;
  };
  let s = '';
  for (const mz of observed) {
    const x = X(mz);
    const y1 = base - stableHeight(mz) * (base - top);
    const h = hitFor(mz);
    s += `<line x1="${x}" y1="${base}" x2="${x}" y2="${y1}" stroke="${h ? h.color : SLATE}" stroke-width="${h ? 3 : 2}" stroke-linecap="round"/>`;
    if (h) s += `<text x="${x}" y="${y1 - 5}" text-anchor="middle" font-size="11" font-weight="700" fill="${h.color}" font-family="system-ui,Arial">${h.label}</text>`;
    // per-peak m/z label on the x-axis (angled to avoid overlap)
    s += `<text x="${x}" y="${base + 12}" transform="rotate(-55 ${x} ${base + 12})" text-anchor="end" font-size="9.5" fill="#7a8890" font-family="system-ui,Arial">${Math.round(mz)}</text>`;
  }
  if (picked) for (const mk of marks) if (!mk.hit)
    s += `<polygon points="${X(mk.mz)},${base + 2} ${X(mk.mz) - 4},${base + 9} ${X(mk.mz) + 4},${base + 9}" fill="${GREY}"/>`;
  s += `<line x1="${x0}" y1="${base}" x2="${x1}" y2="${base}" stroke="#c7d3d6" stroke-width="1"/>`;
  s += `<text x="${(x0 + x1) / 2}" y="${H - 4}" text-anchor="middle" font-size="12" fill="${DARK}" font-weight="700" font-family="system-ui,Arial">m/z</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

// Fragment-assignment map: the peptide spelled out, and for every ASSIGNED b/y ion a
// coloured bracket spanning the exact residues that fragment covers (b from the N-terminus
// above, y from the C-terminus below) with its ion label. Shows both which fragment each
// peak is and what was assigned; a decoy lights only the few fragments it can explain.
export function fragmentLadderSvg(peptide, observed) {
  const assigned = matchIons(observed, peptide).marks.filter((m) => m.hit);
  const n = peptide.length, cell = 46, x0 = 30, lvl = 15;
  const W = x0 * 2 + n * cell;
  const bLevels = n - 1, yLevels = n - 1;
  const topPad = 18, midY = topPad + bLevels * lvl + 20;
  const H = midY + 22 + yLevels * lvl + 16;
  const cxi = (i) => x0 + i * cell + cell / 2;     // centre of residue i (0-based)
  const edge = (k) => x0 + k * cell;               // left edge of residue k (0-based)
  let s = '';
  // residues on a light backbone
  s += `<line x1="${cxi(0)}" y1="${midY}" x2="${cxi(n - 1)}" y2="${midY}" stroke="#c7d3d6" stroke-width="2"/>`;
  for (let i = 0; i < n; i++)
    s += `<text x="${cxi(i)}" y="${midY + 7}" text-anchor="middle" font-size="21" font-weight="700" fill="#0A3D52" font-family="ui-monospace,Menlo,monospace">${peptide[i]}</text>`;
  // one bracket per assigned ion, spanning its residues
  for (const m of assigned) {
    const k = parseInt(m.ion.slice(1), 10);        // b_k / y_k
    if (m.ion[0] === 'b') {                          // b_k = first k residues → [edge(0), edge(k)]
      const xL = edge(0) + 4, xR = edge(k) - 4, y = midY - 20 - (k - 1) * lvl;
      s += `<line x1="${xL}" y1="${y}" x2="${xR}" y2="${y}" stroke="${TEAL}" stroke-width="2.5"/>`
        + `<line x1="${xL}" y1="${y}" x2="${xL}" y2="${y + 5}" stroke="${TEAL}" stroke-width="2.5"/>`
        + `<line x1="${xR}" y1="${y}" x2="${xR}" y2="${y + 5}" stroke="${TEAL}" stroke-width="2.5"/>`
        + `<text x="${xR + 4}" y="${y + 4}" font-size="11" font-weight="700" fill="${TEAL}" font-family="system-ui,Arial">${m.ion}=${m.frag}</text>`;
    } else {                                         // y_k = last k residues → [edge(n-k), edge(n)]
      const xL = edge(n - k) + 4, xR = edge(n) - 4, y = midY + 22 + (k - 1) * lvl;
      s += `<line x1="${xL}" y1="${y}" x2="${xR}" y2="${y}" stroke="${ORANGE}" stroke-width="2.5"/>`
        + `<line x1="${xL}" y1="${y}" x2="${xL}" y2="${y - 5}" stroke="${ORANGE}" stroke-width="2.5"/>`
        + `<line x1="${xR}" y1="${y}" x2="${xR}" y2="${y - 5}" stroke="${ORANGE}" stroke-width="2.5"/>`
        + `<text x="${xL - 4}" y="${y + 4}" text-anchor="end" font-size="11" font-weight="700" fill="${ORANGE}" font-family="system-ui,Arial">${m.ion}=${m.frag}</text>`;
    }
  }
  s += `<text x="${x0}" y="12" font-size="10" fill="${TEAL}" font-family="system-ui,Arial">b ions (N-term) →</text>`;
  s += `<text x="${W - x0}" y="${H - 3}" text-anchor="end" font-size="10" fill="${ORANGE}" font-family="system-ui,Arial">← y ions (C-term)</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

// ---------- render ----------

export function render(container, { onDone }) {
  let strikes = 0, generated = 0, puzzle = null, order = [], picked = null, answered = false;

  const spectrumSvg = () => buildSpectrumSvg(puzzle.observed, picked);

  function verdictBar() {
    if (!picked) return '';
    const m = matchIons(puzzle.observed, picked);
    const ok = picked === puzzle.target;
    const cls = ok ? 'ok' : 'no';
    const head = ok ? '✓ Correct' : (strikes >= 3 ? '✗ Out of tries' : `✗ Not this one — strike ${strikes}/3`);
    let msg = `<b>${picked}</b> explains <b>${m.matched}/${m.total}</b> peaks. `;
    msg += ok
      ? 'Every b/y ion lines up — this sequence produced the spectrum.'
      : `The real peptide was <b>${puzzle.target}</b> (matches ${matchIons(puzzle.observed, puzzle.target).matched}/${matchIons(puzzle.observed, puzzle.target).total}). Grey ticks = ions this peptide predicts but the spectrum lacks.`;
    return `<div class="feedback ${cls}" style="margin-top:10px"><span>${head}. ${msg}</span></div>`;
  }

  function draw() {
    const dots = [0, 1, 2].map((i) => `<span class="sdot ${i < strikes ? 'miss' : ''}"></span>`).join('');
    const cands = order.map((seq) =>
      `<button class="choice cand" data-seq="${seq}" ${answered ? 'disabled' : ''}>${seq}</button>`).join('');
    const nextLabel = (answered && picked !== puzzle.target && strikes < 3) ? 'Try another spectrum ➔' : '🔄 New spectrum';
    container.innerHTML = `
      <div class="card">
        <span class="chip">Peptide ID (MS2)</span>
        <h2>Which peptide produced this MS2 spectrum?</h2>
        <div class="spectrum">${spectrumSvg()}</div>
        ${picked ? `<p class="ladder-h">Fragments of <b>${picked}</b> assigned to peaks (b = teal, y = orange):</p><div class="ladder">${fragmentLadderSvg(picked, puzzle.observed)}</div>` : ''}
        <p class="muted">Click a candidate to overlay its b/y ions and see which fragment each peak is. Miss 3 to lose.  <span class="strikes">${dots}</span></p>
        <div class="choices two">${cands}</div>
        ${verdictBar()}
        <button id="newSpec" class="btn-ghost" style="margin-top:8px">${nextLabel}</button>
      </div>`;
    container.querySelectorAll('.cand').forEach((b) => b.onclick = () => pick(b.dataset.seq));
    const ns = container.querySelector('#newSpec');
    if (ns) ns.onclick = () => { newPuzzle(); };
  }

  function pick(seq) {
    if (answered) return;
    answered = true; picked = seq;
    const correct = seq === puzzle.target;
    if (correct) { draw(); return onDone({ correct: true, penalty: false, topic: 'identification', explain: `${puzzle.target}'s b/y ions explain the spectrum — you identified it.` }); }
    strikes += 1;
    draw();
    if (strikes >= 3) onDone({ correct: false, penalty: false, topic: 'identification', explain: `The spectrum was ${puzzle.target}. A peptide is identified when its b/y fragments explain the peaks.` });
  }

  function newPuzzle() {
    if (answered && picked === puzzle?.target) return; // round already won/over
    if (strikes >= 3) return;                            // round already lost
    generated += 1;
    const len = Math.min(4 + generated, 7);              // 5 → 6 → 7 (caps)
    puzzle = makePuzzle(len);
    order = Math.random() < 0.5 ? [puzzle.target, puzzle.decoy] : [puzzle.decoy, puzzle.target];
    picked = null; answered = false;
    draw();
  }

  newPuzzle();
}
