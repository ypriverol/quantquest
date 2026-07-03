# Be the Algorithm — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, client-side quiz + game ("Be the Algorithm") that teaches computational proteomics quantification concepts, playable in a browser from GitHub Pages.

**Architecture:** Zero-build vanilla JS (ES modules) + inline SVG. A single in-memory state machine (`main.js`) walks a shuffled array of "rounds"; each round is either an MCQ or a mini-game, and both share one `onDone(result)` contract so they're interchangeable. All content (cards, questions) is data in `content.js`. Pure logic (scoring, validation, storage, per-game correctness, SVG string builders) is unit-tested with Node's built-in test runner; screens and rendering are verified manually in a browser.

**Tech Stack:** HTML5, CSS3 (custom properties), vanilla JavaScript ES modules, inline SVG. Node.js (built-in `node --test`) for logic tests only — **not** a runtime dependency. No framework, no bundler, no npm dependencies.

## Global Constraints

- **No build step, no runtime dependencies.** Must run on GitHub Pages served over http with no compilation.
- **ES modules everywhere.** `package.json` contains exactly `{"type":"module","private":true}` so Node and the browser both treat `.js` as ESM. GitHub Pages ignores it. No other package.json fields.
- **Local dev / tests need a static server or Node** — ES modules do not load over `file://`. Local preview: `python3 -m http.server`. Tests: `node --test`.
- **No browser globals at module top level** in testable modules (`score.js`, `content.js`, `storage.js`, `games/svg.js`, per-game logic). Access `globalThis.localStorage` defensively so Node can import them.
- **Palette (verbatim):** deep teal `#0A3D52`, teal `#00979D`, orange `#E86A1C`, light teal `#D5ECED`, grey `#404A4F`, red `#C0392B`, white `#FFFFFF`.
- **Topics (verbatim ids):** `scan-levels`, `feature`, `acquisition`, `methods`, `mbr`, `normalization`, `rollup`, `missing`.
- **Round contract (verbatim):** a round is `{ type:'mcq'|'game', topic, ... }`. A round reports completion via `onDone(result)` where `result = { correct:boolean, penalty?:boolean, topic:string, explain:string }`. The engine — never the round — computes the score delta and updates streak/score/per-topic.
- **Scoring contract (verbatim):** `computeDelta({correct, penalty=false, timeFrac=0, streak})` returns a number; `streakMultiplier(streak)`; `tierFor(pct)`; `badgeFor(perTopic)`. Defined in Task 2, consumed everywhere.

---

## File Structure

```
index.html            # single page, mounts <main id="app">, loads main.js as module
style.css             # palette tokens + all screen/HUD/game styles
package.json          # {"type":"module","private":true}
main.js               # state machine, screens, round loop, HUD, MCQ rendering
content.js            # trainingCards[], mcqPool[], topics{}, validateContent()
score.js              # computeDelta, streakMultiplier, tierFor, badgeFor, blankPerTopic, recordTopic
storage.js            # getName/setName, getBest/setBest, submitScore() stub
games/
  registry.js         # games map { id: { render } } + gameIds[]
  svg.js              # svgEl(), stems(), blobs(), axisBox() — return SVG markup strings
  envelope.js         # Read the envelope
  feature.js          # Pick the real feature
  method.js           # Guess the method
  detective.js        # Quant detective
  mbr.js              # Match between runs (drag)
tests/
  score.test.js
  content.test.js
  storage.test.js
  svg.test.js
  games.test.js
README.md
```

---

## Task 1: Project scaffold

**Files:**
- Create: `index.html`, `style.css`, `package.json`, `README.md`

**Interfaces:**
- Consumes: nothing.
- Produces: a page with `<main id="app"></main>` and `<script type="module" src="main.js">`; CSS custom properties `--teal`, `--teal-d`, `--orange`, `--teal-l`, `--grey`, `--red`, `--white` on `:root`.

- [ ] **Step 1: Create `package.json`**

```json
{ "type": "module", "private": true }
```

- [ ] **Step 2: Create `index.html`**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Be the Algorithm</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <main id="app"></main>
  <script type="module" src="main.js"></script>
</body>
</html>
```

- [ ] **Step 3: Create `style.css` (tokens + base)**

```css
:root{
  --teal-d:#0A3D52; --teal:#00979D; --orange:#E86A1C; --teal-l:#D5ECED;
  --grey:#404A4F; --red:#C0392B; --white:#FFFFFF;
  --radius:12px; --gap:16px;
}
*{box-sizing:border-box}
html,body{margin:0;font-family:system-ui,Arial,sans-serif;color:var(--grey);background:var(--teal-l)}
#app{max-width:820px;margin:0 auto;padding:20px;min-height:100vh}
h1,h2{color:var(--teal-d)}
button{font:inherit;cursor:pointer;border:none;border-radius:var(--radius);padding:12px 16px}
.btn-primary{background:var(--orange);color:#fff;font-weight:700}
.btn-ghost{background:#fff;color:var(--teal-d);border:2px solid var(--teal)}
.card{background:#fff;border-radius:var(--radius);padding:20px;box-shadow:0 2px 8px rgba(10,61,82,.08)}
.center{display:flex;flex-direction:column;align-items:center;gap:var(--gap);text-align:center}
```

- [ ] **Step 4: Create a temporary `main.js` so the page renders**

```js
document.getElementById('app').innerHTML =
  '<div class="card center"><h1>Be the Algorithm</h1><p>Scaffold OK.</p></div>';
```

- [ ] **Step 5: Create `README.md` (run instructions)**

````markdown
# Be the Algorithm

Interactive quiz + game for computational proteomics quantification. Static, no build.

## Play locally
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Run logic tests
```bash
node --test
```

## Deploy
Push to `main` on `ypriverol/be-the-algorithm` and enable GitHub Pages (root). Static — no Action needed.
````

- [ ] **Step 6: Verify the page loads**

Run: `python3 -m http.server 8000` then open `http://localhost:8000`.
Expected: a white card showing "Be the Algorithm" and "Scaffold OK." Stop the server (Ctrl-C).

- [ ] **Step 7: Commit**

```bash
git add index.html style.css package.json README.md main.js
git commit -m "chore: project scaffold"
```

---

## Task 2: Scoring engine (`score.js`)

**Files:**
- Create: `score.js`
- Test: `tests/score.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `streakMultiplier(streak:number):number` → `min(1 + 0.1*streak, 1.5)`.
  - `computeDelta({correct:boolean, penalty?:boolean, timeFrac?:number, streak:number}):number`.
  - `tierFor(pct:number):{name,cls}` → Gold≥85, Silver≥65, Bronze≥40, else "Keep training".
  - `blankPerTopic(topics:string[]):Record<string,{correct:number,seen:number}>`.
  - `recordTopic(perTopic, topic, correct)` → mutates & returns perTopic.
  - `badgeFor(perTopic):string`.

- [ ] **Step 1: Write the failing tests**

```js
// tests/score.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { streakMultiplier, computeDelta, tierFor, blankPerTopic, recordTopic, badgeFor } from '../score.js';

test('streakMultiplier caps at 1.5', () => {
  assert.equal(streakMultiplier(0), 1);
  assert.equal(streakMultiplier(3), 1.3);
  assert.equal(streakMultiplier(10), 1.5);
});

test('computeDelta: wrong answer scores 0', () => {
  assert.equal(computeDelta({correct:false, streak:2}), 0);
});

test('computeDelta: penalty is -50 regardless', () => {
  assert.equal(computeDelta({correct:false, penalty:true, streak:0}), -50);
});

test('computeDelta: correct base 100 * streak mult, plus speed bonus', () => {
  // streak 0 -> mult 1; timeFrac 0 -> no bonus
  assert.equal(computeDelta({correct:true, streak:0, timeFrac:0}), 100);
  // streak 2 -> mult 1.2; timeFrac 1 -> +50 -> (100+50)*1.2 = 180
  assert.equal(computeDelta({correct:true, streak:2, timeFrac:1}), 180);
});

test('tierFor thresholds', () => {
  assert.equal(tierFor(90).name, 'Gold');
  assert.equal(tierFor(70).name, 'Silver');
  assert.equal(tierFor(50).name, 'Bronze');
  assert.equal(tierFor(10).name, 'Keep training');
});

test('perTopic record + badge picks best-accuracy topic', () => {
  let pt = blankPerTopic(['feature','missing']);
  recordTopic(pt, 'feature', true);
  recordTopic(pt, 'feature', true);
  recordTopic(pt, 'missing', false);
  assert.deepEqual(pt.feature, {correct:2, seen:2});
  assert.equal(badgeFor(pt), 'Feature Hunter');
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/score.test.js`
Expected: FAIL (cannot find module `../score.js`).

- [ ] **Step 3: Implement `score.js`**

```js
export const streakMultiplier = (streak) => Math.min(1 + 0.1 * streak, 1.5);

export function computeDelta({ correct, penalty = false, timeFrac = 0, streak = 0 }) {
  if (penalty) return -50;
  if (!correct) return 0;
  const base = 100 + Math.round(50 * Math.max(0, Math.min(1, timeFrac)));
  return Math.round(base * streakMultiplier(streak));
}

export function tierFor(pct) {
  if (pct >= 85) return { name: 'Gold', cls: 'gold' };
  if (pct >= 65) return { name: 'Silver', cls: 'silver' };
  if (pct >= 40) return { name: 'Bronze', cls: 'bronze' };
  return { name: 'Keep training', cls: 'none' };
}

export const blankPerTopic = (topics) =>
  Object.fromEntries(topics.map((t) => [t, { correct: 0, seen: 0 }]));

export function recordTopic(perTopic, topic, correct) {
  if (!perTopic[topic]) perTopic[topic] = { correct: 0, seen: 0 };
  perTopic[topic].seen += 1;
  if (correct) perTopic[topic].correct += 1;
  return perTopic;
}

const BADGES = {
  'feature': 'Feature Hunter', 'scan-levels': 'Scan-Level Sage',
  'missing': 'Batch-effect Buster', 'normalization': 'Batch-effect Buster',
  'methods': 'Method Maven', 'mbr': 'Run Matcher',
  'rollup': 'Protein Wrangler', 'acquisition': 'Acquisition Ace',
};

export function badgeFor(perTopic) {
  let best = null, bestAcc = -1;
  for (const [topic, { correct, seen }] of Object.entries(perTopic)) {
    if (!seen) continue;
    const acc = correct / seen;
    if (acc > bestAcc) { bestAcc = acc; best = topic; }
  }
  return best ? (BADGES[best] || 'Quant Explorer') : 'Quant Explorer';
}
```

- [ ] **Step 4: Run to verify pass**

Run: `node --test tests/score.test.js`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add score.js tests/score.test.js
git commit -m "feat: scoring engine with tests"
```

---

## Task 3: Content data + validator (`content.js`)

**Files:**
- Create: `content.js`
- Test: `tests/content.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `TOPICS: Record<string,{label,review}>` keyed by the 8 topic ids.
  - `trainingCards: {id, topic, front, back}[]` (≥8).
  - `mcqPool: {id, topic, q, choices:string[], answer:number, trap?:number, explain:string}[]` (≥18).
  - `validateContent():string[]` → array of error strings (empty = valid).

- [ ] **Step 1: Write the failing tests**

```js
// tests/content.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOPICS, trainingCards, mcqPool, validateContent } from '../content.js';

const IDS = ['scan-levels','feature','acquisition','methods','mbr','normalization','rollup','missing'];

test('all 8 topics present with review text', () => {
  for (const id of IDS) { assert.ok(TOPICS[id], `missing ${id}`); assert.ok(TOPICS[id].review); }
});
test('>=8 training cards, valid topics', () => {
  assert.ok(trainingCards.length >= 8);
  for (const c of trainingCards) assert.ok(IDS.includes(c.topic), `bad topic ${c.topic}`);
});
test('>=18 MCQ, each internally valid', () => {
  assert.ok(mcqPool.length >= 18);
});
test('validateContent returns no errors', () => {
  assert.deepEqual(validateContent(), []);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/content.test.js`
Expected: FAIL (cannot find `../content.js`).

- [ ] **Step 3: Implement `content.js`**

Write real content. Provide the TOPICS map and validator exactly as below; author ≥8 cards and ≥18 MCQs across topics (examples given — extend to the counts, drawing facts from the two lectures: scan levels, feature/precursor intensity, DDA/DIA, methods, MBR, normalization, roll-up/protein groups, imputation).

```js
export const TOPICS = {
  'scan-levels':  { label:'Scan levels',     review:'MS1=survey, MS2=fragments, MS3=cleaner reporters; ID is MS2, quant varies.' },
  'feature':      { label:'Features',        review:'A feature = isotopes × charge × elution; precursor intensity = XIC area.' },
  'acquisition':  { label:'DDA vs DIA',      review:'DDA picks top-N precursors; DIA fragments everything in wide windows.' },
  'methods':      { label:'Quant methods',   review:'LFQ/SILAC read MS1; DIA reads MS2 fragments; TMT reads reporter ions.' },
  'mbr':          { label:'Match btwn runs', review:'MBR transfers IDs via aligned RT+m/z; same mass+wrong RT = false transfer.' },
  'normalization':{ label:'Normalization',   review:'Removes technical shifts in log2; assumes most proteins do not change.' },
  'rollup':       { label:'Protein roll-up', review:'Many peptides → one protein value; shared peptides → protein groups.' },
  'missing':      { label:'Missing values',  review:'MNAR (low) vs MCAR (random); constant-low imputation fakes on/off hits.' },
};

export const trainingCards = [
  { id:'c1', topic:'scan-levels', front:'What is an MS1 scan?', back:'A survey of the whole, intact peptides (precursors) — gives m/z + intensity.' },
  { id:'c2', topic:'scan-levels', front:'Where does peptide IDENTITY come from?', back:'MS2 fragments (b/y ions) — MS1 alone gives only mass+charge.' },
  { id:'c3', topic:'feature', front:'What is "precursor intensity"?', back:'The integrated AREA of a peptide feature over its elution — not one scan.' },
  { id:'c4', topic:'feature', front:'Why does one peptide make several peaks?', back:'Carbon-13 isotopes → an envelope; the monoisotopic (lightest) peak is the reference.' },
  { id:'c5', topic:'acquisition', front:'DDA vs DIA in one line?', back:'DDA fragments the top-N precursors; DIA fragments EVERYTHING in wide m/z windows.' },
  { id:'c6', topic:'methods', front:'Where is TMT quantity read?', back:'Reporter ions in MS2 (or MS3) — one reporter per sample.' },
  { id:'c7', topic:'mbr', front:'What is match-between-runs?', back:'Transferring an MS2-derived ID to a run lacking its own MS2, via aligned RT + accurate m/z.' },
  { id:'c8', topic:'normalization', front:'What assumption does normalization make?', back:'That MOST proteins do not change — false for IP/secretome/huge perturbations.' },
  { id:'c9', topic:'rollup', front:'Why "protein groups"?', back:'Peptides shared by several proteins can’t tell them apart → reported as one group.' },
  { id:'c10', topic:'missing', front:'Why is imputation dangerous?', back:'Filling every gap with a low constant makes on/off proteins look hugely (falsely) significant.' },
];

export const mcqPool = [
  { id:'q1', topic:'scan-levels', q:'Peptide sequence identity is read from…', choices:['MS1 precursor','MS2 fragments','The LC column','Reporter ions'], answer:1, trap:0, explain:'Sequence comes from MS2 fragments; MS1 gives only mass+charge.' },
  { id:'q2', topic:'scan-levels', q:'TMT reporter-ion quantity can be read at…', choices:['MS1 only','MS2 or MS3','The LC column','MS1 or MS2'], answer:1, explain:'Reporter ions appear in MS2, or MS3 with SPS-MS3 for cleaner ratios.' },
  { id:'q3', topic:'feature', q:'The precursor intensity of a peptide is…', choices:['The tallest single peak','The area under its elution (XIC)','The number of scans','The charge state'], answer:1, trap:0, explain:'It is the integrated XIC area, not one peak height.' },
  { id:'q4', topic:'feature', q:'Peak spacing of 0.5 m/z in an isotope envelope means charge…', choices:['1+','2+','3+','4+'], answer:1, explain:'Spacing = 1/z, so 0.5 → z = 2.' },
  { id:'q5', topic:'acquisition', q:'DIA differs from DDA because it…', choices:['Skips MS2','Fragments everything in wide windows','Has no MS1','Only works for TMT'], answer:1, explain:'DIA co-fragments many precursors in wide windows; quant uses fragments.' },
  { id:'q6', topic:'methods', q:'Label-free (LFQ) reads quantity from…', choices:['MS2 reporter ions','MS1 precursor intensity','MS3','The database'], answer:1, explain:'LFQ quantifies the MS1 precursor feature across runs.' },
  { id:'q7', topic:'methods', q:'Which method gives the FEWEST missing values within one run?', choices:['LFQ','DIA','TMT (isobaric)','SILAC'], answer:2, explain:'TMT multiplexes samples in one run → few missing values within a plex.' },
  { id:'q8', topic:'mbr', q:'A Run-2 signal has P2’s m/z but RT off by +3.5 min (drift is ~+1). You should…', choices:['Transfer P2’s ID','Not transfer — likely a different peptide','Delete P2','Always trust same m/z'], answer:1, trap:0, explain:'Same mass + wrong RT = a false transfer; MBR needs consistent RT.' },
  { id:'q9', topic:'normalization', q:'Global normalization can LIE when…', choices:['Samples are identical','Most proteins really change (e.g. IP)','You use log2','You have replicates'], answer:1, explain:'It assumes most proteins are unchanged; IP/secretome break that.' },
  { id:'q10', topic:'rollup', q:'A row in a protein table is best described as…', choices:['Exactly one gene','A protein GROUP of indistinguishable proteins','A single peptide','A raw scan'], answer:1, trap:0, explain:'Shared peptides force indistinguishable proteins into one group.' },
  { id:'q11', topic:'missing', q:'Missing-not-at-random (MNAR) values are usually…', choices:['Random dropouts','Genuinely low / below detection','Duplicates','Calibration errors'], answer:1, explain:'MNAR gaps track abundance — the peptide is truly low.' },
  { id:'q12', topic:'missing', q:'Filling all gaps with the same low value tends to…', choices:['Fix everything','Manufacture fake on/off hits','Remove batch effects','Improve identity'], answer:1, trap:0, explain:'Constant-low imputation invents huge fold-changes.' },
  { id:'q13', topic:'feature', q:'One peptide can appear as several features because of…', choices:['Different charge states','Different databases','Different lab','Different colour'], answer:0, explain:'The same peptide shows up at 2+, 3+ … (and isotopes).' },
  { id:'q14', topic:'scan-levels', q:'In DDA, after an MS1 survey the instrument…', choices:['Fragments all ions','Picks a subset (top-N) to fragment','Stops','Skips MS2'], answer:1, explain:'DDA selects the most intense precursors for MS2.' },
  { id:'q15', topic:'methods', q:'iBAQ divides summed intensity by…', choices:['Sample count','Number of observable tryptic peptides','Charge','Retention time'], answer:1, explain:'Dividing by observable peptides removes the protein-size bias.' },
  { id:'q16', topic:'normalization', q:'We work in log2 mainly because…', choices:['It looks nicer','Intensities span orders of magnitude; ratios become differences','It removes IDs','It adds charge'], answer:1, explain:'Log2 compresses dynamic range and turns fold-changes into differences.' },
  { id:'q17', topic:'acquisition', q:'DIA typically quantifies on…', choices:['MS1 only','Fragment ions','Reporter ions','The FASTA'], answer:1, explain:'Wide windows co-isolate precursors, so fragments give specificity.' },
  { id:'q18', topic:'mbr', q:'The upside of match-between-runs is…', choices:['Fewer missing values','No FDR needed','Faster gradients','More charge'], answer:0, explain:'MBR fills gaps across runs — but needs its own error control.' },
];

export function validateContent() {
  const errs = [];
  const IDS = Object.keys(TOPICS);
  for (const id of IDS) if (!TOPICS[id].review) errs.push(`topic ${id} missing review`);
  for (const c of trainingCards) {
    if (!IDS.includes(c.topic)) errs.push(`card ${c.id} bad topic ${c.topic}`);
    if (!c.front || !c.back) errs.push(`card ${c.id} missing front/back`);
  }
  for (const q of mcqPool) {
    if (!IDS.includes(q.topic)) errs.push(`mcq ${q.id} bad topic ${q.topic}`);
    if (!Array.isArray(q.choices) || q.choices.length < 2) errs.push(`mcq ${q.id} needs >=2 choices`);
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.choices.length) errs.push(`mcq ${q.id} bad answer index`);
    if (q.trap !== undefined && (q.trap < 0 || q.trap >= q.choices.length)) errs.push(`mcq ${q.id} bad trap index`);
    if (!q.explain) errs.push(`mcq ${q.id} missing explain`);
  }
  return errs;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `node --test tests/content.test.js`
Expected: PASS (4 tests). If "≥18 MCQ" fails, add more questions to reach 18.

- [ ] **Step 5: Commit**

```bash
git add content.js tests/content.test.js
git commit -m "feat: content data + validator with tests"
```

---

## Task 4: Storage module (`storage.js`)

**Files:**
- Create: `storage.js`
- Test: `tests/storage.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `getName()`, `setName(s)`, `getBest()`, `setBest(n)`, `submitScore({name,score,tier,perTopic}):{ok,mode}`. All guard `globalThis.localStorage` (return defaults when absent).

- [ ] **Step 1: Write the failing tests**

```js
// tests/storage.test.js
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// minimal localStorage shim
beforeEach(() => {
  const m = new Map();
  globalThis.localStorage = {
    getItem:(k)=> (m.has(k)?m.get(k):null), setItem:(k,v)=>m.set(k,String(v)),
    removeItem:(k)=>m.delete(k), clear:()=>m.clear(),
  };
});

const load = async () => await import('../storage.js?' + Math.random());

test('name round-trips', async () => {
  const s = await load(); s.setName('Ada'); assert.equal(s.getName(), 'Ada');
});
test('best keeps the max', async () => {
  const s = await load(); s.setBest(100); s.setBest(80); assert.equal(s.getBest(), 100);
});
test('submitScore stores best and reports local mode', async () => {
  const s = await load(); const r = s.submitScore({name:'Ada',score:300,tier:'Gold',perTopic:{}});
  assert.equal(r.mode, 'local'); assert.equal(s.getBest(), 300);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/storage.test.js`
Expected: FAIL (cannot find `../storage.js`).

- [ ] **Step 3: Implement `storage.js`**

```js
const LS = () => globalThis.localStorage || null;
const K_NAME = 'bta.name', K_BEST = 'bta.best';

export const getName = () => LS()?.getItem(K_NAME) || '';
export const setName = (s) => LS()?.setItem(K_NAME, s);
export const getBest = () => Number(LS()?.getItem(K_BEST) || 0);
export const setBest = (n) => { if (n > getBest()) LS()?.setItem(K_BEST, n); };

// Leaderboard seam: today writes locally. Later, swap the body to POST to a backend.
export function submitScore({ name, score, tier, perTopic }) {
  setBest(score);
  return { ok: true, mode: 'local' };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `node --test tests/storage.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add storage.js tests/storage.test.js
git commit -m "feat: storage module + leaderboard seam with tests"
```

---

## Task 5: SVG helpers (`games/svg.js`)

**Files:**
- Create: `games/svg.js`
- Test: `tests/svg.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces (all return **SVG markup strings**, so they are Node-testable):
  - `openSvg(w,h)` / `closeSvg()` → `<svg …>` / `</svg>`.
  - `stem(x, y0, y1, {color, w, id})` → a `<line>`.
  - `blob(cx, cy, r, {color, id, opacity})` → a `<circle>`.
  - `bar(x, y, w, h, {color, id})` → a `<rect>`.
  - `label(x, y, text, {color, size, anchor})` → a `<text>`.

- [ ] **Step 1: Write the failing tests**

```js
// tests/svg.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openSvg, closeSvg, stem, blob, bar, label } from '../games/svg.js';

test('openSvg has viewBox and closeSvg closes', () => {
  assert.match(openSvg(100,50), /viewBox="0 0 100 50"/);
  assert.equal(closeSvg(), '</svg>');
});
test('stem/blob/bar/label carry id and color', () => {
  assert.match(stem(10,0,40,{color:'#00979D',id:'s1'}), /id="s1"/);
  assert.match(blob(5,5,3,{color:'#E86A1C',id:'b1'}), /<circle[^>]*id="b1"/);
  assert.match(bar(1,2,3,4,{color:'#0A3D52',id:'r1'}), /<rect[^>]*id="r1"/);
  assert.match(label(1,2,'hi',{}), />hi</);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/svg.test.js`
Expected: FAIL (cannot find `../games/svg.js`).

- [ ] **Step 3: Implement `games/svg.js`**

```js
export const openSvg = (w, h) =>
  `<svg viewBox="0 0 ${w} ${h}" width="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">`;
export const closeSvg = () => `</svg>`;

export const stem = (x, y0, y1, { color = '#00979D', w = 6, id = '' } = {}) =>
  `<line ${id ? `id="${id}"` : ''} x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;

export const blob = (cx, cy, r, { color = '#00979D', id = '', opacity = 1 } = {}) =>
  `<circle ${id ? `id="${id}"` : ''} cx="${cx}" cy="${cy}" r="${r}" fill="${color}" fill-opacity="${opacity}"/>`;

export const bar = (x, y, w, h, { color = '#00979D', id = '' } = {}) =>
  `<rect ${id ? `id="${id}"` : ''} x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${color}"/>`;

export const label = (x, y, text, { color = '#404A4F', size = 13, anchor = 'middle' } = {}) =>
  `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}" font-family="system-ui,Arial">${text}</text>`;
```

- [ ] **Step 4: Run to verify pass**

Run: `node --test tests/svg.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add games/svg.js tests/svg.test.js
git commit -m "feat: SVG string helpers with tests"
```

---

## Task 6: Engine core + Welcome + Training screens (`main.js`)

**Files:**
- Modify: `main.js` (replace the scaffold)
- Modify: `style.css` (append screen styles)

**Interfaces:**
- Consumes: `content.js` (`trainingCards`, `TOPICS`), `storage.js` (`getName`,`setName`,`getBest`).
- Produces: a `state` object `{ name, screen, roundIndex, rounds, score, streak, perTopic }`; `render()` dispatcher; `mount(html)` helper; `go(screen)`; `showWelcome()`, `showTraining()`. Play/Results added in Tasks 7–9.

- [ ] **Step 1: Replace `main.js` with the engine core + Welcome + Training**

```js
import { trainingCards, TOPICS } from './content.js';
import { getName, setName, getBest } from './storage.js';

const app = document.getElementById('app');
const mount = (html) => { app.innerHTML = html; };
const $ = (sel) => app.querySelector(sel);

export const state = {
  name: getName(), screen: 'welcome',
  rounds: [], roundIndex: 0, score: 0, streak: 0, perTopic: {},
};

function go(screen) { state.screen = screen; render(); }

function showWelcome() {
  const best = getBest();
  mount(`
    <div class="card center">
      <h1>Be the Algorithm</h1>
      <p>Learn how software turns mass-spec signal into a quantitative matrix — then play.</p>
      <input id="name" class="name" placeholder="Your name" value="${state.name || ''}" maxlength="24" />
      ${best ? `<p class="muted">Your best: ${best}</p>` : ''}
      <button id="start" class="btn-primary">Start training ➔</button>
    </div>`);
  $('#start').onclick = () => {
    const v = $('#name').value.trim();
    if (!v) { $('#name').focus(); return; }
    state.name = v; setName(v); go('training');
  };
}

let cardIdx = 0;
function showTraining() {
  const c = trainingCards[cardIdx];
  const dots = trainingCards.map((_, i) => `<span class="dot ${i===cardIdx?'on':''}"></span>`).join('');
  mount(`
    <div class="hud"><span>Training</span><a id="skip" class="link">Skip to game ➔</a></div>
    <div class="card center flip" id="flip">
      <span class="chip">${TOPICS[c.topic].label}</span>
      <h2 id="face">${c.front}</h2>
      <p class="muted">tap the card to reveal</p>
    </div>
    <div class="dots">${dots}</div>
    <div class="center"><button id="next" class="btn-primary">Got it ➔</button></div>`);
  let flipped = false;
  $('#flip').onclick = () => { flipped = !flipped; $('#face').textContent = flipped ? c.back : c.front; };
  $('#skip').onclick = () => go('play');
  $('#next').onclick = () => {
    if (cardIdx < trainingCards.length - 1) { cardIdx++; showTraining(); }
    else go('play');
  };
}

function render() {
  if (state.screen === 'welcome') return showWelcome();
  if (state.screen === 'training') return showTraining();
  if (state.screen === 'play') return mount('<div class="card center"><p>Play screen — Task 7.</p></div>');
  if (state.screen === 'results') return mount('<div class="card center"><p>Results — Task 9.</p></div>');
}

render();
```

- [ ] **Step 2: Append screen styles to `style.css`**

```css
.name{font-size:18px;padding:12px;border:2px solid var(--teal);border-radius:10px;width:min(320px,90%)}
.muted{color:#7a8890}.link{color:var(--orange);cursor:pointer;text-decoration:underline}
.hud{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;font-weight:700;color:var(--teal-d)}
.chip{background:var(--teal-l);color:var(--teal-d);border-radius:999px;padding:4px 12px;font-size:13px;font-weight:700}
.flip{cursor:pointer;min-height:180px;justify-content:center}
.dots{display:flex;gap:8px;justify-content:center;margin:14px 0}
.dot{width:10px;height:10px;border-radius:50%;background:#c7d3d6}.dot.on{background:var(--orange)}
```

- [ ] **Step 3: Verify in browser**

Run: `python3 -m http.server 8000` → open `http://localhost:8000`.
Expected: Welcome asks for a name (Start disabled-effect until typed); Start → Training shows a card, tapping flips front/back, "Got it →" advances through all cards and dots track; last card → "Play screen — Task 7." Stop server.

- [ ] **Step 4: Commit**

```bash
git add main.js style.css
git commit -m "feat: engine core + welcome + training screens"
```

---

## Task 7: Play screen — round loop, MCQ, HUD (`main.js`)

**Files:**
- Modify: `main.js` (build rounds; play loop; MCQ render; HUD; feedback)
- Modify: `style.css` (append play styles)

**Interfaces:**
- Consumes: `content.js` (`mcqPool`,`TOPICS`), `score.js` (`computeDelta`,`blankPerTopic`,`recordTopic`), the **round contract** and **onDone(result)** from Global Constraints.
- Produces: `buildRounds()` (shuffled MCQ subset now; games added Task 15); `startPlay()`; `runRound()`; `finishRound(result, timeFrac)`; `nextRound()`. A round MCQ renders choices and calls `finishRound` with `{correct,penalty,topic,explain}` + measured `timeFrac`.

- [ ] **Step 1: Add imports and helpers at top of `main.js`**

Add to the imports:
```js
import { mcqPool } from './content.js';
import { computeDelta, blankPerTopic, recordTopic } from './score.js';
```
Add a shuffle helper near the top (after `$`):
```js
const shuffle = (a) => { a = a.slice(); for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const ROUND_TIME = 20; // seconds per MCQ
```

- [ ] **Step 2: Implement play loop + MCQ (add to `main.js`, before `render()`)**

```js
function buildRounds() {
  const mcq = shuffle(mcqPool).slice(0, 10).map((m) => ({ type:'mcq', ...m }));
  return mcq; // Task 15 interleaves game rounds here
}

function startPlay() {
  state.rounds = buildRounds();
  state.roundIndex = 0; state.score = 0; state.streak = 0;
  state.perTopic = blankPerTopic(Object.keys(TOPICS));
  runRound();
}

let timer = null, timeLeft = 0;
function hud() {
  return `<div class="hud">
    <span>Q ${state.roundIndex+1}/${state.rounds.length}</span>
    <span id="clock">⏱ ${timeLeft}s</span>
    <span>Score ${state.score} · 🔥${state.streak}</span></div>`;
}

function runRound() {
  const r = state.rounds[state.roundIndex];
  if (r.type === 'mcq') return renderMcq(r);
  // r.type === 'game' handled in Task 15
}

function renderMcq(r) {
  timeLeft = ROUND_TIME;
  const started = Date.now();
  mount(`${hud()}
    <div class="card">
      <span class="chip">${TOPICS[r.topic].label}</span>
      <h2>${r.q}</h2>
      <div class="choices">${r.choices.map((c,i)=>`<button class="choice" data-i="${i}">${c}</button>`).join('')}</div>
    </div>`);
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft -= 1; const el = $('#clock'); if (el) el.textContent = `⏱ ${Math.max(0,timeLeft)}s`;
    if (timeLeft <= 0) { clearInterval(timer); answerMcq(r, -1, started); }
  }, 1000);
  app.querySelectorAll('.choice').forEach((b) =>
    b.onclick = () => answerMcq(r, Number(b.dataset.i), started));
}

function answerMcq(r, idx, started) {
  clearInterval(timer);
  const correct = idx === r.answer;
  const penalty = r.trap !== undefined && idx === r.trap;
  const timeFrac = Math.max(0, (ROUND_TIME - (Date.now()-started)/1000) / ROUND_TIME);
  // mark chosen + correct
  app.querySelectorAll('.choice').forEach((b) => {
    const i = Number(b.dataset.i);
    if (i === r.answer) b.classList.add('good');
    else if (i === idx) b.classList.add('bad');
    b.disabled = true;
  });
  finishRound({ correct, penalty, topic:r.topic, explain:r.explain }, timeFrac);
}

function finishRound(result, timeFrac = 0) {
  const delta = computeDelta({ correct:result.correct, penalty:result.penalty, timeFrac, streak:state.streak });
  state.score += delta;
  state.streak = result.correct ? state.streak + 1 : 0;
  recordTopic(state.perTopic, result.topic, result.correct);
  const sign = delta >= 0 ? `+${delta}` : `${delta}`;
  const bar = document.createElement('div');
  bar.className = `feedback ${result.correct ? 'ok' : 'no'}`;
  bar.innerHTML = `<b>${result.correct ? 'Correct' : (result.penalty ? 'Trap!' : 'Not quite')} ${sign}</b>
    <span>${result.explain}</span>
    <button id="next" class="btn-ghost">${state.roundIndex < state.rounds.length-1 ? 'Next ➔' : 'See results ➔'}</button>`;
  app.appendChild(bar);
  $('#next').onclick = nextRound;
}

function nextRound() {
  if (state.roundIndex < state.rounds.length - 1) { state.roundIndex++; runRound(); }
  else go('results');
}
```

- [ ] **Step 3: Wire `render()` play branch + Training→Play entry**

Replace the play line in `render()` with `if (state.screen === 'play') return startPlay();`
(Training's "Got it →"/"Skip" already call `go('play')`.)

- [ ] **Step 4: Append play styles to `style.css`**

```css
.choices{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
.choice{background:#fff;border:2px solid var(--teal);color:var(--teal-d);text-align:left}
.choice.good{background:#e7f6ec;border-color:#2e7d32}.choice.bad{background:#fbe9e7;border-color:var(--red)}
.feedback{margin-top:14px;padding:14px;border-radius:12px;display:flex;flex-direction:column;gap:8px}
.feedback.ok{background:#e7f6ec}.feedback.no{background:#fbe9e7}
@media(max-width:520px){.choices{grid-template-columns:1fr}}
```

- [ ] **Step 5: Verify in browser**

Run server → play through Training into Play.
Expected: 10 MCQs; clicking marks correct/incorrect (green/red), the timer counts down (auto-answers at 0), score + streak update, a feedback bar explains and advances; last question → "See results →" → the Task 9 placeholder. Trap answers show "Trap! -50". Stop server.

- [ ] **Step 6: Commit**

```bash
git add main.js style.css
git commit -m "feat: play loop, MCQ rounds, HUD, scoring feedback"
```

---

## Task 8: Results screen (`main.js`)

**Files:**
- Modify: `main.js` (add `showResults`)
- Modify: `style.css` (append results styles)

**Interfaces:**
- Consumes: `score.js` (`tierFor`,`badgeFor`), `content.js` (`TOPICS`), `storage.js` (`submitScore`), `state`.
- Produces: `showResults()`; a max-score estimate `maxScore()` for the percentage.

- [ ] **Step 1: Add imports**

Add to imports in `main.js`:
```js
import { tierFor, badgeFor } from './score.js';
import { submitScore } from './storage.js';
```

- [ ] **Step 2: Implement `showResults()` (add before `render()`)**

```js
function maxScore() { return state.rounds.length * 150; } // 100 base + 50 speed, mult ignored for a stable %

function showResults() {
  const pct = Math.round(100 * state.score / Math.max(1, maxScore()));
  const tier = tierFor(pct); const badge = badgeFor(state.perTopic);
  const bars = Object.entries(state.perTopic).filter(([,v])=>v.seen).map(([t,v])=>{
    const a = Math.round(100*v.correct/v.seen);
    return `<div class="trow"><span>${TOPICS[t].label}</span>
      <span class="track"><span class="fill" style="width:${a}%"></span></span><span>${a}%</span></div>`;
  }).join('');
  const review = Object.entries(state.perTopic).filter(([,v])=>v.seen && v.correct/v.seen < 0.6)
    .map(([t])=>`<li>${TOPICS[t].label}: ${TOPICS[t].review}</li>`).join('') || '<li>Nice — nothing flagged to review!</li>';
  mount(`
    <div class="card center">
      <span class="chip">${state.name}</span>
      <h1>${state.score} pts</h1>
      <div class="tier ${tier.cls}">${tier.name}</div>
      <p>Badge: <b>${badge}</b></p>
      <div class="bars">${bars}</div>
      <details><summary>What to review</summary><ul>${review}</ul></details>
      <div class="center" style="gap:10px">
        <button id="again" class="btn-primary">Play again ➔</button>
        <button id="share" class="btn-ghost">Copy my score</button>
      </div>
      <p id="msg" class="muted"></p>
    </div>`);
  submitScore({ name:state.name, score:state.score, tier:tier.name, perTopic:state.perTopic });
  $('#again').onclick = () => go('play');
  $('#share').onclick = async () => {
    const txt = `I scored ${state.score} (${tier.name}, ${badge}) on Be the Algorithm!`;
    try { await navigator.clipboard.writeText(txt); $('#msg').textContent = 'Copied!'; }
    catch { $('#msg').textContent = txt; }
  };
}
```

- [ ] **Step 3: Wire `render()` results branch**

Replace the results line with `if (state.screen === 'results') return showResults();`

- [ ] **Step 4: Append results styles to `style.css`**

```css
.tier{font-size:20px;font-weight:800;padding:6px 16px;border-radius:999px;background:var(--teal-l);color:var(--teal-d)}
.tier.gold{background:#fff4cf;color:#8a6d00}.tier.silver{background:#eceff1;color:#5b6b73}.tier.bronze{background:#f4e0d0;color:#8a4b1e}
.bars{width:100%;max-width:520px;margin:10px 0;display:flex;flex-direction:column;gap:6px}
.trow{display:grid;grid-template-columns:130px 1fr 44px;align-items:center;gap:8px;font-size:14px}
.track{background:#e3e9ea;border-radius:999px;height:12px;overflow:hidden}
.fill{display:block;height:100%;background:var(--teal)}
details{width:100%;max-width:520px;text-align:left}
```

- [ ] **Step 5: Verify in browser**

Play a full round to the end.
Expected: Results shows name chip, total, tier chip (colour by %), a badge, per-topic bars, a "What to review" disclosure listing weak topics, "Play again" restarts play, "Copy my score" copies a string (shows "Copied!"). Stop server.

- [ ] **Step 6: Commit**

```bash
git add main.js style.css
git commit -m "feat: results screen with tier, badge, per-topic, share stub"
```

---

## Task 9: Mini-game registry + contract + Envelope game (`games/envelope.js`, `games/registry.js`)

**Files:**
- Create: `games/envelope.js`, `games/registry.js`
- Test: `tests/games.test.js`

**Interfaces:**
- Consumes: `games/svg.js`.
- Produces:
  - Pure logic (testable): `envelopeData()` → `{peaks:[{mz,h}], monoIndex:0, charge:2}`; `checkEnvelope(clickIndex, chargeChoice, data)` → `{correct:boolean}`.
  - `render(container, {onDone})` per the **round contract**: draws the envelope, lets the user click a peak + choose charge, then calls `onDone({correct, penalty:false, topic:'feature', explain})`.
  - `registry.js`: `games = { envelope: {render} }`, `gameIds = ['envelope']` (extended in later tasks).

- [ ] **Step 1: Write the failing logic test**

```js
// tests/games.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { envelopeData, checkEnvelope } from '../games/envelope.js';

test('envelope: monoisotopic is index 0 and charge from spacing', () => {
  const d = envelopeData();
  assert.equal(d.monoIndex, 0);
  assert.equal(checkEnvelope(0, d.charge, d).correct, true);
  assert.equal(checkEnvelope(1, d.charge, d).correct, false);   // wrong peak
  assert.equal(checkEnvelope(0, d.charge+1, d).correct, false); // wrong charge
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/games.test.js`
Expected: FAIL (cannot find `../games/envelope.js`).

- [ ] **Step 3: Implement `games/envelope.js`**

```js
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
```

- [ ] **Step 4: Create `games/registry.js`**

```js
import * as envelope from './envelope.js';
export const games = { envelope: { render: envelope.render } };
export const gameIds = ['envelope'];
```

- [ ] **Step 5: Run logic test to verify pass**

Run: `node --test tests/games.test.js`
Expected: PASS (1 test).

- [ ] **Step 6: Commit**

```bash
git add games/envelope.js games/registry.js tests/games.test.js
git commit -m "feat: mini-game registry + envelope game with logic test"
```

---

## Task 10: Pick the real feature (`games/feature.js`)

**Files:**
- Create: `games/feature.js`
- Modify: `games/registry.js` (register `feature`)
- Modify: `tests/games.test.js` (append feature test)

**Interfaces:**
- Consumes: `games/svg.js`.
- Produces: `featureData()` → `{blobs:[{id,x,y,r,kind}], targetId, trapId}` where `kind∈{'target','trap','other'}`; `checkFeature(clickId, data)` → `{correct, penalty}` (penalty when clickId===trapId); `render(container,{onDone})` → `onDone({correct, penalty, topic:'feature', explain})`.

- [ ] **Step 1: Append failing test to `tests/games.test.js`**

```js
import { featureData, checkFeature } from '../games/feature.js';
test('feature: target correct, trap penalised', () => {
  const d = featureData();
  assert.equal(checkFeature(d.targetId, d).correct, true);
  assert.equal(checkFeature(d.trapId, d).penalty, true);
  assert.equal(checkFeature(d.trapId, d).correct, false);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/games.test.js`
Expected: FAIL (cannot find `../games/feature.js`).

- [ ] **Step 3: Implement `games/feature.js`**

```js
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
```

- [ ] **Step 4: Register in `games/registry.js`**

```js
import * as envelope from './envelope.js';
import * as feature from './feature.js';
export const games = {
  envelope: { render: envelope.render },
  feature:  { render: feature.render },
};
export const gameIds = ['envelope','feature'];
```

- [ ] **Step 5: Run test to verify pass**

Run: `node --test tests/games.test.js`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add games/feature.js games/registry.js tests/games.test.js
git commit -m "feat: pick-the-feature game with interference trap"
```

---

## Task 11: Guess the method (`games/method.js`)

**Files:**
- Create: `games/method.js`
- Modify: `games/registry.js` (register `method`)
- Modify: `tests/games.test.js` (append)

**Interfaces:**
- Consumes: `games/svg.js`.
- Produces: `methodData(seed?)` → `{answer:'LFQ'|'SILAC'|'TMT'|'DIA', prompt, choices:string[]}`; `checkMethod(choice, data)` → `{correct}`; `render(container,{onDone})` → `onDone({correct, penalty:false, topic:'methods', explain})`.

- [ ] **Step 1: Append failing test**

```js
import { methodData, checkMethod } from '../games/method.js';
test('method: correct choice matches answer', () => {
  const d = methodData(0);
  assert.ok(d.choices.includes(d.answer));
  assert.equal(checkMethod(d.answer, d).correct, true);
  assert.equal(checkMethod(d.choices.find(c=>c!==d.answer), d).correct, false);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/games.test.js`
Expected: FAIL (cannot find `../games/method.js`).

- [ ] **Step 3: Implement `games/method.js`**

```js
import { openSvg, closeSvg, bar, label } from './svg.js';

const CASES = [
  { answer:'TMT',   prompt:'One run; each sample gets a tag; quantity read from reporter ions in MS2.' },
  { answer:'LFQ',   prompt:'Separate runs; no labels; quantity from the MS1 precursor across runs.' },
  { answer:'SILAC', prompt:'Light/heavy versions of the same peptide in ONE spectrum; ratio from MS1.' },
  { answer:'DIA',   prompt:'Separate runs; wide isolation windows; quantity from fragment ions.' },
];
const ALL = ['LFQ','SILAC','TMT','DIA'];

export function methodData(seed = Math.floor(Math.random()*CASES.length)) {
  const c = CASES[seed % CASES.length];
  return { answer:c.answer, prompt:c.prompt, choices:ALL };
}
export function checkMethod(choice, data) { return { correct: choice === data.answer }; }

export function render(container, { onDone }) {
  const d = methodData();
  // simple schematic: bars whose colours hint mixing (decorative)
  const bars = [0,1,2].map(i => bar(60+i*40, 60, 26, 80, { color:['#00979D','#E86A1C','#7A5195'][i] })).join('');
  container.innerHTML = `
    <div class="card">
      <span class="chip">Quant methods</span>
      <h2>Which quantification method is this?</h2>
      ${openSvg(300,170)}${bars}${label(150,160,'samples → run(s)',{size:12})}${closeSvg()}
      <p>${d.prompt}</p>
      <div class="choices">${d.choices.map(c=>`<button class="choice mc" data-c="${c}">${c}</button>`).join('')}</div>
    </div>`;
  container.querySelectorAll('.mc').forEach(b => b.onclick = () => {
    const { correct } = checkMethod(b.dataset.c, d);
    onDone({ correct, penalty:false, topic:'methods',
      explain: `This describes ${d.answer}.` });
  });
}
```

- [ ] **Step 4: Register in `games/registry.js`**

Add `import * as method from './method.js';`, add `method: { render: method.render }` to `games`, and `'method'` to `gameIds`.

- [ ] **Step 5: Run test to verify pass**

Run: `node --test tests/games.test.js`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add games/method.js games/registry.js tests/games.test.js
git commit -m "feat: guess-the-method game"
```

---

## Task 12: Quant detective (`games/detective.js`)

**Files:**
- Create: `games/detective.js`
- Modify: `games/registry.js` (register `detective`)
- Modify: `tests/games.test.js` (append)

**Interfaces:**
- Consumes: nothing (HTML table, no SVG needed).
- Produces: `detectiveData()` → `{rows:[{name, ctrl:[...], trt:[...], real:boolean}], trustworthyName, artifactName}`; `checkDetective(pickName, data)` → `{correct, penalty}` (penalty when picking the artifact); `render(container,{onDone})` → `onDone({correct, penalty, topic:'missing', explain})`.

- [ ] **Step 1: Append failing test**

```js
import { detectiveData, checkDetective } from '../games/detective.js';
test('detective: trust the measured hit, artifact penalised', () => {
  const d = detectiveData();
  assert.equal(checkDetective(d.trustworthyName, d).correct, true);
  assert.equal(checkDetective(d.artifactName, d).penalty, true);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/games.test.js`
Expected: FAIL (cannot find `../games/detective.js`).

- [ ] **Step 3: Implement `games/detective.js`**

```js
export function detectiveData() {
  const rows = [
    { name:'ON-OFF-1', ctrl:['NA','NA','NA'], trt:['22.1','22.3','21.9'], real:false }, // imputed → fake 16x
    { name:'STEADY-2', ctrl:['24.0','24.2','23.9'], trt:['25.1','25.0','25.2'], real:true }, // measured 2x
  ];
  return { rows, trustworthyName:'STEADY-2', artifactName:'ON-OFF-1' };
}
export function checkDetective(pickName, data) {
  return { correct: pickName === data.trustworthyName, penalty: pickName === data.artifactName };
}
export function render(container, { onDone }) {
  const d = detectiveData();
  const head = `<tr><th>Protein</th><th>Ctrl</th><th>Ctrl</th><th>Ctrl</th><th>Trt</th><th>Trt</th><th>Trt</th></tr>`;
  const body = d.rows.map(r =>
    `<tr><td><button class="choice pick" data-n="${r.name}">${r.name}</button></td>
     ${r.ctrl.map(v=>`<td class="${v==='NA'?'na':''}">${v}</td>`).join('')}
     ${r.trt.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('');
  container.innerHTML = `
    <div class="card">
      <span class="chip">Missing values</span>
      <h2>Both look "up" in Treated. Which up-regulation do you TRUST?</h2>
      <table class="matrix">${head}${body}</table>
      <p class="muted">NA = missing (was imputed to a low value).</p>
    </div>`;
  container.querySelectorAll('.pick').forEach(b => b.onclick = () => {
    const { correct, penalty } = checkDetective(b.dataset.n, d);
    onDone({ correct, penalty, topic:'missing',
      explain: 'STEADY-2 is measured everywhere (real ~2×). ON-OFF-1’s "16×" is manufactured by imputing the NA controls.' });
  });
}
```

- [ ] **Step 4: Register + add table styles**

In `games/registry.js`: import `detective`, add `detective:{render:detective.render}` to `games`, `'detective'` to `gameIds`.
Append to `style.css`:
```css
.matrix{border-collapse:collapse;margin:12px 0;width:100%}
.matrix th,.matrix td{border:1px solid #cfd8dc;padding:6px 10px;text-align:center;font-size:14px}
.matrix td.na{color:var(--red);font-weight:700}
```

- [ ] **Step 5: Run test to verify pass**

Run: `node --test tests/games.test.js`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add games/detective.js games/registry.js style.css tests/games.test.js
git commit -m "feat: quant-detective game with imputation-artifact trap"
```

---

## Task 13: Match between runs (`games/mbr.js`)

**Files:**
- Create: `games/mbr.js`
- Modify: `games/registry.js` (register `mbr`)
- Modify: `tests/games.test.js` (append)

**Interfaces:**
- Consumes: nothing (positioned HTML dots, pointer drag).
- Produces: `mbrData()` → `{run1:[{id,mz}], run2:[{id,mz,match|null}], decoyId}`; `evaluateMbr(assignments)` where `assignments` is `{run2Id: run1Id|null}` → `{correct:boolean, penalty:boolean}` (correct = both true pairs matched AND decoy left unmatched; penalty = decoy matched); `render(container,{onDone})` → `onDone({correct, penalty, topic:'mbr', explain})`.

- [ ] **Step 1: Append failing test**

```js
import { mbrData, evaluateMbr } from '../games/mbr.js';
test('mbr: correct pairing, decoy must stay unmatched', () => {
  const d = mbrData();
  const good = {}; d.run2.forEach(r => { good[r.id] = r.match; }); // includes decoy -> null
  assert.equal(evaluateMbr(good, d).correct, true);
  const bad = { ...good, [d.decoyId]: d.run1[1].id };
  assert.equal(evaluateMbr(bad, d).penalty, true);
  assert.equal(evaluateMbr(bad, d).correct, false);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/games.test.js`
Expected: FAIL (cannot find `../games/mbr.js`).

- [ ] **Step 3: Implement `games/mbr.js`**

```js
export function mbrData() {
  // Run1 P1,P2,P3. Run2 has P1',P2' (true matches) + a decoy at P2's m/z but wrong RT.
  const run1 = [{ id:'P1', mz:650.3 }, { id:'P2', mz:742.9 }, { id:'P3', mz:588.4 }];
  const run2 = [
    { id:'r1', mz:650.3, match:'P1' },
    { id:'r2', mz:742.9, match:'P2' },
    { id:'d',  mz:742.8, match:null },   // decoy: same-ish m/z as P2, wrong RT
  ];
  return { run1, run2, decoyId:'d' };
}

export function evaluateMbr(assignments, data = mbrData()) {
  let penalty = false, allTrue = true;
  for (const r of data.run2) {
    const got = assignments[r.id] ?? null;
    if (r.id === data.decoyId && got !== null) penalty = true;
    if (r.match !== null && got !== r.match) allTrue = false;
    if (r.match === null && got !== null) allTrue = false;
  }
  return { correct: allTrue && !penalty, penalty };
}

export function render(container, { onDone }) {
  const d = mbrData();
  const assignments = {}; // run2Id -> run1Id | null
  container.innerHTML = `
    <div class="card">
      <span class="chip">Match between runs</span>
      <h2>Drag each Run-2 dot onto its Run-1 match. RT drifted ~+1 min.</h2>
      <div class="mbr">
        <div class="lane" id="run1"><b>Run 1</b>
          ${d.run1.map(p=>`<span class="slot" data-p="${p.id}">${p.id}<br><small>${p.mz}</small></span>`).join('')}
        </div>
        <div class="lane" id="run2"><b>Run 2 (drag these)</b>
          ${d.run2.map(r=>`<span class="dot" draggable="true" data-r="${r.id}">?<br><small>${r.mz}</small></span>`).join('')}
        </div>
      </div>
      <p class="muted">Leave a dot unmatched if nothing fits. One is a trap (same mass, wrong RT).</p>
      <button id="mbrDone" class="btn-primary">Submit matches</button>
    </div>`;
  let dragged = null;
  container.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('dragstart', () => { dragged = dot.dataset.r; });
  });
  container.querySelectorAll('.slot').forEach(slot => {
    slot.addEventListener('dragover', (e) => e.preventDefault());
    slot.addEventListener('drop', () => {
      if (!dragged) return;
      assignments[dragged] = slot.dataset.p;
      slot.classList.add('filled'); slot.dataset.got = dragged;
      const dot = container.querySelector(`.dot[data-r="${dragged}"]`);
      if (dot) dot.classList.add('used');
      dragged = null;
    });
  });
  container.querySelector('#mbrDone').onclick = () => {
    for (const r of d.run2) if (!(r.id in assignments)) assignments[r.id] = null;
    const { correct, penalty } = evaluateMbr(assignments, d);
    onDone({ correct, penalty, topic:'mbr',
      explain: 'P1↔P1 and P2↔P2 match (consistent ~+1 min drift). The decoy has P2’s mass but wrong RT — a false transfer.' });
  };
}
```

- [ ] **Step 4: Register + styles**

`games/registry.js`: import `mbr`, add `mbr:{render:mbr.render}`, `'mbr'` to `gameIds`.
Append to `style.css`:
```css
.mbr{display:flex;gap:20px;justify-content:space-between;margin:12px 0;flex-wrap:wrap}
.lane{flex:1;min-width:180px}
.slot,.dot{display:inline-block;min-width:64px;text-align:center;margin:6px;padding:8px;border-radius:10px;border:2px dashed var(--teal)}
.dot{cursor:grab;background:var(--teal-l);border-style:solid}
.slot.filled{background:#e7f6ec;border-style:solid}
.dot.used{opacity:.4}
```

- [ ] **Step 5: Run test to verify pass**

Run: `node --test tests/games.test.js`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add games/mbr.js games/registry.js style.css tests/games.test.js
git commit -m "feat: match-between-runs drag game with decoy trap"
```

---

## Task 14: Integrate mini-games into the play loop (`main.js`)

**Files:**
- Modify: `main.js` (import registry; interleave game rounds; render `game` round type)

**Interfaces:**
- Consumes: `games/registry.js` (`games`,`gameIds`), the round contract, `finishRound`.
- Produces: `buildRounds()` now interleaves one round per game id among the MCQs; `runRound()` dispatches `type:'game'` to `games[gameId].render(container, { onDone })`.

- [ ] **Step 1: Import the registry in `main.js`**

```js
import { games, gameIds } from './games/registry.js';
```

- [ ] **Step 2: Replace `buildRounds()` to interleave games**

```js
function buildRounds() {
  const mcq = shuffle(mcqPool).slice(0, 8).map((m) => ({ type:'mcq', ...m }));
  const gameRounds = shuffle(gameIds).map((id) => ({ type:'game', gameId:id,
    topic: ({envelope:'feature',feature:'feature',method:'methods',detective:'missing',mbr:'mbr'})[id] }));
  // interleave: game, then ~2 mcq, repeat
  const rounds = []; let gi = 0, mi = 0;
  while (gi < gameRounds.length || mi < mcq.length) {
    if (gi < gameRounds.length) rounds.push(gameRounds[gi++]);
    for (let k=0;k<2 && mi<mcq.length;k++) rounds.push(mcq[mi++]);
  }
  return rounds;
}
```

- [ ] **Step 3: Render the `game` round type in `runRound()`**

Replace `runRound()` with:
```js
function runRound() {
  const r = state.rounds[state.roundIndex];
  if (r.type === 'mcq') return renderMcq(r);
  // game round
  mount(`${hud()}<div id="gameHost"></div>`);
  const host = $('#gameHost');
  games[r.gameId].render(host, { onDone: (result) => finishRound(result, 0) });
}
```

- [ ] **Step 4: Verify full playthrough in browser**

Run server → play a full session.
Expected: rounds now mix MCQs and all 5 mini-games; each game reports back (correct/penalty), the feedback bar + scoring work identically to MCQs, HUD counts include game rounds, and the run ends on Results with per-topic bars covering feature/methods/missing/mbr. Try the traps (interference blob, artifact row, decoy dot) → "Trap! -50". Stop server.

- [ ] **Step 5: Commit**

```bash
git add main.js
git commit -m "feat: interleave 5 mini-games into the scored round loop"
```

---

## Task 15: Final polish — full test run, content count, README, deploy notes

**Files:**
- Modify: `content.js` (ensure ≥18 MCQ; fix any validator errors)
- Modify: `README.md` (add "how to extend" + manual QA checklist)

**Interfaces:**
- Consumes: everything.
- Produces: a green `node --test` across all suites; a documented manual QA checklist; deploy steps.

- [ ] **Step 1: Run the whole test suite**

Run: `node --test`
Expected: PASS across `score`, `content`, `storage`, `svg`, `games` (all suites green). Fix any failures before continuing.

- [ ] **Step 2: Extend `README.md`**

````markdown
## How to extend
- **Add a question/card:** edit `content.js` (`mcqPool` / `trainingCards`). Run `node --test` — the validator checks it.
- **Add a mini-game:** create `games/<id>.js` exporting `render(container,{onDone})`; register it in `games/registry.js`; add its `topic` mapping in `buildRounds()` (main.js).
- **Add a leaderboard later:** replace the body of `submitScore()` in `storage.js` with a `fetch(POST …)`. No other file changes.

## Manual QA checklist
- [ ] Welcome requires a name; Start advances to Training.
- [ ] Training cards flip on tap; dots track; "Skip to game" works.
- [ ] MCQs: timer counts down and auto-answers at 0; correct=green, wrong=red; trap shows "Trap! -50".
- [ ] All 5 mini-games render, are solvable, and their traps apply a penalty.
- [ ] Score, streak (🔥), and per-topic bars update correctly.
- [ ] Results shows tier colour by %, a badge, review list, Play again, Copy score.
- [ ] Works at a narrow (phone) width — choices stack, SVGs scale.
````

- [ ] **Step 3: Final browser QA (desktop + narrow width)**

Run: `python3 -m http.server 8000`. Walk the README checklist on a normal window, then with the browser narrowed to ~380px.
Expected: every checkbox passes. Stop server.

- [ ] **Step 4: Commit**

```bash
git add content.js README.md
git commit -m "chore: final polish, extension docs, QA checklist"
```

- [ ] **Step 5: Push & enable Pages (manual, by repo owner)**

```bash
# once the ypriverol/be-the-algorithm remote exists:
git branch -M main
git remote add origin git@github.com:ypriverol/be-the-algorithm.git
git push -u origin main
# Then: GitHub → Settings → Pages → Deploy from branch → main / root.
```
Expected: the game is live at `https://ypriverol.github.io/be-the-algorithm/`.

---

## Self-Review

**Spec coverage:** Welcome/name (T6) · Training cards (T6) · Play loop + MCQ + HUD (T7) · Results tier/badge/per-topic/share (T8) · scoring incl. traps/streak/speed (T2, used T7–T14) · content data + validator across all 8 topics (T3) · storage + leaderboard seam (T4) · all 5 mini-games (T9–T13) + integration (T14) · SVG language (T5) · palette/zero-build/module constraints (Global + T1) · testing (node suites per task + manual checklist T15) · hosting (T1, T15). All spec sections map to a task.

**Placeholder scan:** No "TBD"/"add error handling" placeholders; every code step is complete and runnable. Content Task 3 ships real cards/MCQs and requires reaching ≥18 (validated) before its commit.

**Type consistency:** The round contract `{type,topic,...}` and `onDone({correct,penalty?,topic,explain})` are defined in Global Constraints and used identically in T7 (`finishRound`), T9–T13 (each game's `onDone`), and T14 (dispatch). Scoring names (`computeDelta`,`streakMultiplier`,`tierFor`,`badgeFor`,`blankPerTopic`,`recordTopic`) are defined in T2 and consumed with the same signatures in T7/T8. Registry exports (`games`,`gameIds`) defined T9, extended T10–T13, consumed T14.
