import { LEADERBOARD_URL } from './config.js';

const LS = () => globalThis.localStorage || null;
const K_NAME = 'bta.name', K_BEST = 'bta.best';

export const getName = () => LS()?.getItem(K_NAME) || '';
export const setName = (s) => LS()?.setItem(K_NAME, s);
export const getBest = () => Number(LS()?.getItem(K_BEST) || 0);
export const setBest = (n) => { if (n > getBest()) LS()?.setItem(K_BEST, n); };

// Save the score. Always keeps a local best; when LEADERBOARD_URL is set, also fires a
// best-effort POST to the shared board (fire-and-forget, mode:'no-cors' to avoid a CORS
// preflight with Apps Script — we don't need to read the response).
export function submitScore({ name, score, tier, badge }) {
  setBest(score);
  // Only post to the shared board from a real browser session (keeps Node/tests offline).
  if (LEADERBOARD_URL && typeof window !== 'undefined') {
    try {
      fetch(LEADERBOARD_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ name, score, tier, badge }),
      }).catch(() => {});
    } catch { /* offline / unsupported — ignore, local best already saved */ }
    return { ok: true, mode: 'remote' };
  }
  return { ok: true, mode: 'local' };
}

// Fetch scores for the board + activity banner.
// Returns null if the board isn't configured, else { list, count }:
//   list  = up to `top` rows { name, score, tier, badge, time } sorted highest-first
//   count = total games ever recorded
export async function fetchLeaderboard(top = 50) {
  if (!LEADERBOARD_URL) return null;
  try {
    const res = await fetch(`${LEADERBOARD_URL}?top=${top}`);
    const data = await res.json();
    return { list: Array.isArray(data.top) ? data.top : [], count: Number(data.count) || 0 };
  } catch { return { list: [], count: 0 }; }
}
