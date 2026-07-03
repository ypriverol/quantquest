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
