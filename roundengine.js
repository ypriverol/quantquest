import { computeDelta, recordTopic } from './score.js';

// One round of play, guarded so it can be completed EXACTLY once.
// Pure (no DOM) so it is unit-testable; main.js wires the DOM feedback around it.
export function createRound() {
  let locked = false;
  return {
    isLocked: () => locked,
    // Applies the result to `state` the first time only.
    // Returns { applied:boolean, delta:number }. On a repeat call: { applied:false, delta:0 }.
    complete(state, result, timeFrac = 0) {
      if (locked) return { applied: false, delta: 0 };
      locked = true;
      const delta = computeDelta({
        correct: result.correct, penalty: result.penalty, timeFrac, streak: state.streak,
      });
      state.score += delta;
      state.streak = result.correct ? state.streak + 1 : 0;
      recordTopic(state.perTopic, result.topic, result.correct);
      return { applied: true, delta };
    },
  };
}
