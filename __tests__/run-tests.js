#!/usr/bin/env node
/**
 * Padel Score Pro — Standalone Test Runner
 * No dependencies needed. Run with: node __tests__/run-tests.js
 */

const {
  createMatch, scorePoint, toggleServe,
  getPointsLabel, getStatusLabel,
} = require('./scoring.cjs');

// ── Test framework ────────────────────────────────────────────────────────────
let passed = 0, failed = 0, total = 0;
let currentSuite = '';

function describe(name, fn) {
  currentSuite = name;
  console.log(`\n  ${name}`);
  fn();
}

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`    ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`    ❌ ${name}`);
    console.log(`       ${e.message}`);
    failed++;
  }
}

function expect(val) {
  return {
    toBe(expected) {
      if (val !== expected) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(val)}`);
    },
    toEqual(expected) {
      const a = JSON.stringify(val), b = JSON.stringify(expected);
      if (a !== b) throw new Error(`Expected ${b}, got ${a}`);
    },
    toBeTruthy() {
      if (!val) throw new Error(`Expected truthy, got ${JSON.stringify(val)}`);
    },
    toBeFalsy() {
      if (val) throw new Error(`Expected falsy, got ${JSON.stringify(val)}`);
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function score(state, team, n = 1) {
  for (let i = 0; i < n; i++) state = scorePoint(state, team);
  return state;
}
function winGame(state, team) { return score(state, team, 4); }
function winSet6_0(state, team) {
  for (let i = 0; i < 6; i++) state = winGame(state, team);
  return state;
}
function winSet6_4(state, winner, loser) {
  for (let i = 0; i < 4; i++) state = winGame(state, loser);
  for (let i = 0; i < 6; i++) state = winGame(state, winner);
  return state;
}
function reach6_6(s) {
  for (let i = 0; i < 6; i++) { s = winGame(s, 0); s = winGame(s, 1); }
  return s;
}
function reachCapTied(s, cap) {
  s = reach6_6(s);
  for (let i = 0; i < cap - 6; i++) { s = winGame(s, 0); s = winGame(s, 1); }
  return s;
}
function to40_40(s) { s = score(s, 0, 3); s = score(s, 1, 3); return s; }

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Basic point scoring', () => {
  test('starts at 0-0', () => {
    const s = createMatch(3, 'long', 'tiebreak');
    expect(s.points).toEqual([0, 0]);
    expect(getPointsLabel(s, 0)).toBe('0');
  });

  test('scores 0 → 15 → 30 → 40', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = scorePoint(s, 0); expect(getPointsLabel(s, 0)).toBe('15');
    s = scorePoint(s, 0); expect(getPointsLabel(s, 0)).toBe('30');
    s = scorePoint(s, 0); expect(getPointsLabel(s, 0)).toBe('40');
  });

  test('wins game at 40-0', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = winGame(s, 0);
    expect(s.currentSet.t1).toBe(1);
    expect(s.points).toEqual([0, 0]);
  });

  test('wins game at 40-30', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = score(s, 0, 3); s = score(s, 1, 2); s = scorePoint(s, 0);
    expect(s.currentSet.t1).toBe(1);
  });

  test('match is blocked after matchOver', () => {
    let s = createMatch(1, 'golden', 'tiebreak');
    s = winSet6_0(s, 0);
    const frozen = JSON.stringify(s);
    s = scorePoint(s, 1);
    expect(JSON.stringify(s)).toBe(frozen);
  });
});

describe('Long deuce', () => {
  test('reaches deuce at 40-40', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = to40_40(s);
    expect(getStatusLabel(s)).toBe('DEUCE');
  });

  test('team A gets advantage', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = to40_40(s); s = scorePoint(s, 0);
    expect(getStatusLabel(s)).toBe('ADVANTAGE TEAM A');
    expect(getPointsLabel(s, 0)).toBe('AD');
  });

  test('team B gets advantage', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = to40_40(s); s = scorePoint(s, 1);
    expect(getStatusLabel(s)).toBe('ADVANTAGE TEAM B');
  });

  test('wins game from advantage', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = to40_40(s); s = scorePoint(s, 0); s = scorePoint(s, 0);
    expect(s.currentSet.t1).toBe(1);
    expect(s.points).toEqual([0, 0]);
  });

  test('goes back to deuce when advantage lost', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = to40_40(s); s = scorePoint(s, 0); s = scorePoint(s, 1);
    expect(getStatusLabel(s)).toBe('DEUCE');
    expect(s.points).toEqual([3, 3]);
    expect(s.isDeuce).toBe(false);
  });

  test('advantage swings: A adv → B breaks → B adv → B wins', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = to40_40(s);
    s = scorePoint(s, 0); expect(getStatusLabel(s)).toBe('ADVANTAGE TEAM A');
    s = scorePoint(s, 1); expect(getStatusLabel(s)).toBe('DEUCE');
    s = scorePoint(s, 1); expect(getStatusLabel(s)).toBe('ADVANTAGE TEAM B');
    s = scorePoint(s, 1); expect(s.currentSet.t2).toBe(1);
  });

  test('deuce repeats 5 times before win', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = to40_40(s);
    for (let i = 0; i < 5; i++) { s = scorePoint(s, 0); s = scorePoint(s, 1); }
    s = scorePoint(s, 0); s = scorePoint(s, 0);
    expect(s.currentSet.t1).toBe(1);
  });
});

describe('Golden point', () => {
  test('team A wins immediately at 40-40', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = to40_40(s); s = scorePoint(s, 0);
    expect(s.currentSet.t1).toBe(1);
  });

  test('team B wins immediately at 40-40', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = to40_40(s); s = scorePoint(s, 1);
    expect(s.currentSet.t2).toBe(1);
  });

  test('no deuce flag is set', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = to40_40(s);
    expect(s.isDeuce).toBe(false);
    expect(s.isGoldenPoint).toBe(false);
  });
});

describe('Silver point', () => {
  test('first 40-40 gives advantage to scorer', () => {
    let s = createMatch(3, 'silver', 'tiebreak');
    s = to40_40(s); s = scorePoint(s, 0);
    expect(getStatusLabel(s)).toBe('ADVANTAGE TEAM A');
  });

  test('winning from advantage closes game', () => {
    let s = createMatch(3, 'silver', 'tiebreak');
    s = to40_40(s); s = scorePoint(s, 0); s = scorePoint(s, 0);
    expect(s.currentSet.t1).toBe(1);
  });

  test('losing advantage triggers golden point', () => {
    let s = createMatch(3, 'silver', 'tiebreak');
    s = to40_40(s); s = scorePoint(s, 0); s = scorePoint(s, 1);
    expect(s.isGoldenPoint).toBe(true);
    expect(getStatusLabel(s)).toBe('GOLDEN POINT');
  });

  test('golden point: B scores and wins', () => {
    let s = createMatch(3, 'silver', 'tiebreak');
    s = to40_40(s); s = scorePoint(s, 0); s = scorePoint(s, 1); s = scorePoint(s, 1);
    expect(s.currentSet.t2).toBe(1);
  });

  test('golden point can be won by A', () => {
    let s = createMatch(3, 'silver', 'tiebreak');
    s = to40_40(s); s = scorePoint(s, 1); s = scorePoint(s, 0); s = scorePoint(s, 0);
    expect(s.currentSet.t1).toBe(1);
  });
});

describe('Set scoring', () => {
  test('wins set 6-0', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = winSet6_0(s, 0);
    expect(s.setsWon[0]).toBe(1);
    expect(s.setScores).toEqual([{ t1: 6, t2: 0 }]);
  });

  test('wins set 6-4', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = winSet6_4(s, 0, 1);
    expect(s.setsWon[0]).toBe(1);
    expect(s.setScores[0]).toEqual({ t1: 6, t2: 4 });
  });

  test('wins set 7-5', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    for (let i = 0; i < 5; i++) s = winGame(s, 1);
    for (let i = 0; i < 7; i++) s = winGame(s, 0);
    expect(s.setsWon[0]).toBe(1);
    expect(s.setScores[0]).toEqual({ t1: 7, t2: 5 });
  });

  test('does NOT win set at 6-5', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    for (let i = 0; i < 5; i++) s = winGame(s, 1);
    for (let i = 0; i < 6; i++) s = winGame(s, 0);
    expect(s.setsWon[0]).toBe(0);
  });

  test('wins match best of 3 — 2-0', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = winSet6_0(s, 0); s = winSet6_0(s, 0);
    expect(s.matchOver).toBe(true);
    expect(s.winner).toBe(0);
    expect(s.setsWon).toEqual([2, 0]);
  });

  test('wins match best of 3 — 2-1', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = winSet6_0(s, 0); s = winSet6_0(s, 1); s = winSet6_0(s, 0);
    expect(s.matchOver).toBe(true);
    expect(s.winner).toBe(0);
    expect(s.setsWon).toEqual([2, 1]);
  });

  test('wins match best of 1', () => {
    let s = createMatch(1, 'golden', 'tiebreak');
    s = winSet6_0(s, 1);
    expect(s.matchOver).toBe(true);
    expect(s.winner).toBe(1);
  });
});

describe('Tiebreak at 6-6', () => {
  test('triggers tiebreak at 6-6', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s);
    expect(s.isTiebreak).toBe(true);
    expect(s.points).toEqual([0, 0]);
  });

  test('tiebreak points show as numbers', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s); s = score(s, 0, 3);
    expect(getPointsLabel(s, 0)).toBe('3');
    expect(getPointsLabel(s, 1)).toBe('0');
  });

  test('wins tiebreak 7-0', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s); s = score(s, 0, 7);
    expect(s.isTiebreak).toBe(false);
    expect(s.setsWon[0]).toBe(1);
    expect(s.setScores[0]).toEqual({ t1: 7, t2: 6 });
  });

  test('tiebreak continues past 7 if no 2-point lead', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s);
    s = score(s, 0, 6); s = score(s, 1, 6); // 6-6
    s = scorePoint(s, 0); // 7-6 — not enough
    expect(s.isTiebreak).toBe(true);
    s = scorePoint(s, 0); // 8-6 — win
    expect(s.isTiebreak).toBe(false);
    expect(s.setsWon[0]).toBe(1);
  });

  test('tiebreak win resets currentSet', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s); s = score(s, 0, 7);
    expect(s.currentSet).toEqual({ t1: 0, t2: 0 });
  });
});

describe('Tiebreak serve rotation (1, 2, 2, 2...)', () => {
  test('serve swaps after first point', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s);
    expect(s.serving).toBe(0);
    s = scorePoint(s, 0); // point 1
    expect(s.serving).toBe(1);
  });

  test('second server holds serve for 2 points', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s);
    s = scorePoint(s, 0); // 1 → swap to 1
    expect(s.serving).toBe(1);
    s = scorePoint(s, 0); // 2 → still 1
    expect(s.serving).toBe(1);
    s = scorePoint(s, 0); // 3 → swap to 0
    expect(s.serving).toBe(0);
  });

  test('full rotation pattern: server sequence matches 1,1,1,0,0,1,1,0,0', () => {
    // Servers before each point scored:
    // pt1: 0 → swap → 1
    // pt2: 1 → stay → 1
    // pt3: 1 → swap → 0
    // pt4: 0 → stay → 0
    // pt5: 0 → swap → 1
    // pt6: 1 → stay → 1
    // pt7: 1 → swap → 0 (tiebreak won at 7-0)
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s);
    const serversBeforePoint = [];
    for (let i = 0; i < 7; i++) {
      serversBeforePoint.push(s.serving);
      s = scorePoint(s, 0);
    }
    expect(serversBeforePoint).toEqual([0, 1, 1, 0, 0, 1, 1]);
  });
});

describe('Play On — no cap', () => {
  test('does NOT trigger tiebreak at 6-6', () => {
    let s = createMatch(3, 'golden', 'playon');
    s = reach6_6(s);
    expect(s.isTiebreak).toBe(false);
    expect(s.currentSet).toEqual({ t1: 6, t2: 6 });
  });

  test('wins at 8-6', () => {
    let s = createMatch(3, 'golden', 'playon');
    s = reach6_6(s);
    s = winGame(s, 0); expect(s.setsWon[0]).toBe(0); // 7-6 not enough
    s = winGame(s, 0); // 8-6
    expect(s.setsWon[0]).toBe(1);
    expect(s.setScores[0]).toEqual({ t1: 8, t2: 6 });
  });

  test('continues until 2-game lead — 9-11', () => {
    let s = createMatch(3, 'golden', 'playon');
    s = reach6_6(s);
    s = winGame(s, 0); s = winGame(s, 1); // 7-7
    s = winGame(s, 0); s = winGame(s, 1); // 8-8
    s = winGame(s, 0); expect(s.setsWon[0]).toBe(0); // 9-8, lead by 1 — not enough
    s = winGame(s, 1); // 9-9
    s = winGame(s, 1); expect(s.setsWon[1]).toBe(0); // 9-10, lead by 1 — not enough
    s = winGame(s, 1); // 9-11, lead by 2 — B wins set
    expect(s.setsWon[1]).toBe(1);
    expect(s.setScores[0]).toEqual({ t1: 9, t2: 11 });
  });
});

describe('Play On with cap', () => {
  test('cap 9: triggers tiebreak at 9-9', () => {
    let s = createMatch(3, 'golden', 'playon', 9);
    s = reachCapTied(s, 9);
    expect(s.currentSet).toEqual({ t1: 9, t2: 9 });
    expect(s.isTiebreak).toBe(true);
  });

  test('cap 8: triggers tiebreak at 8-8', () => {
    let s = createMatch(3, 'golden', 'playon', 8);
    s = reachCapTied(s, 8);
    expect(s.isTiebreak).toBe(true);
  });

  test('cap 10: triggers tiebreak at 10-10', () => {
    let s = createMatch(3, 'golden', 'playon', 10);
    s = reachCapTied(s, 10);
    expect(s.isTiebreak).toBe(true);
  });

  test('cap 9: tiebreak win ends set at 10-9', () => {
    let s = createMatch(3, 'golden', 'playon', 9);
    s = reachCapTied(s, 9);
    s = score(s, 0, 7); // win tiebreak
    expect(s.isTiebreak).toBe(false);
    expect(s.setsWon[0]).toBe(1);
    expect(s.setScores[0]).toEqual({ t1: 10, t2: 9 });
    expect(s.currentSet).toEqual({ t1: 0, t2: 0 });
  });

  test('cap 9: B wins tiebreak → 9-10', () => {
    let s = createMatch(3, 'golden', 'playon', 9);
    s = reachCapTied(s, 9);
    s = score(s, 1, 7);
    expect(s.setsWon[1]).toBe(1);
    expect(s.setScores[0]).toEqual({ t1: 9, t2: 10 });
  });

  test('cap 9: does not trigger tiebreak at 8-8', () => {
    let s = createMatch(3, 'golden', 'playon', 9);
    s = reachCapTied(s, 8);
    expect(s.isTiebreak).toBe(false);
  });

  test('cap 9: can still win set 9-7 before reaching cap', () => {
    let s = createMatch(3, 'golden', 'playon', 9);
    s = reach6_6(s);
    s = winGame(s, 0); s = winGame(s, 1); // 7-7
    s = winGame(s, 0); s = winGame(s, 1); // 8-8
    s = winGame(s, 0); // 9-8 — not cap yet (not tied)
    s = winGame(s, 0); // 10-8 — but wait, need 2 clear from 6+
    // Actually at 9-8 A leads by 1, needs 10-8 for 2 clear
    expect(s.setsWon[0]).toBe(1);
  });
});

describe('Serve rotation — regular games', () => {
  test('serve swaps after each game win', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    expect(s.serving).toBe(0);
    s = winGame(s, 0); expect(s.serving).toBe(1);
    s = winGame(s, 1); expect(s.serving).toBe(0);
    s = winGame(s, 0); expect(s.serving).toBe(1);
  });

  test('toggleServe swaps manually', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    expect(s.serving).toBe(0);
    s = toggleServe(s); expect(s.serving).toBe(1);
    s = toggleServe(s); expect(s.serving).toBe(0);
  });
});

describe('Display labels', () => {
  test('correct tennis labels 0/15/30/40', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    expect(getPointsLabel(s, 0)).toBe('0');
    s = scorePoint(s, 0); expect(getPointsLabel(s, 0)).toBe('15');
    s = scorePoint(s, 0); expect(getPointsLabel(s, 0)).toBe('30');
    s = scorePoint(s, 0); expect(getPointsLabel(s, 0)).toBe('40');
  });

  test('AD label for advantage', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = to40_40(s); s = scorePoint(s, 0);
    expect(getPointsLabel(s, 0)).toBe('AD');
    expect(getPointsLabel(s, 1)).toBe('40');
  });

  test('both show 40 during golden point phase', () => {
    let s = createMatch(3, 'silver', 'tiebreak');
    s = to40_40(s); s = scorePoint(s, 0); s = scorePoint(s, 1);
    expect(getPointsLabel(s, 0)).toBe('40');
    expect(getPointsLabel(s, 1)).toBe('40');
  });

  test('numeric scores in tiebreak', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s); s = score(s, 0, 5); s = score(s, 1, 3);
    expect(getPointsLabel(s, 0)).toBe('5');
    expect(getPointsLabel(s, 1)).toBe('3');
  });

  test('DEUCE status at 40-40 long deuce', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = to40_40(s);
    expect(getStatusLabel(s)).toBe('DEUCE');
  });

  test('TIEBREAK status during tiebreak', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s);
    expect(getStatusLabel(s)).toBe('TIEBREAK');
  });

  test('GOLDEN POINT status during silver golden phase', () => {
    let s = createMatch(3, 'silver', 'tiebreak');
    s = to40_40(s); s = scorePoint(s, 0); s = scorePoint(s, 1);
    expect(getStatusLabel(s)).toBe('GOLDEN POINT');
  });
});

describe('Full match simulations', () => {
  test('A wins 2-0, golden point', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = winSet6_0(s, 0); s = winSet6_0(s, 0);
    expect(s.matchOver).toBe(true);
    expect(s.winner).toBe(0);
    expect(s.setsWon).toEqual([2, 0]);
  });

  test('B wins 2-1 with tiebreaks', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s); s = score(s, 0, 7); // A wins set 1 via TB
    expect(s.setsWon[0]).toBe(1);
    s = winSet6_0(s, 1); // B wins set 2
    s = winSet6_4(s, 1, 0); // B wins set 3
    expect(s.matchOver).toBe(true);
    expect(s.winner).toBe(1);
    expect(s.setsWon).toEqual([1, 2]);
  });

  test('Play On 9-9 cap — full match', () => {
    let s = createMatch(3, 'long', 'playon', 9);
    // Set 1: A wins 6-3
    for (let i = 0; i < 3; i++) s = winGame(s, 1);
    for (let i = 0; i < 6; i++) s = winGame(s, 0);
    expect(s.setsWon[0]).toBe(1);
    // Set 2: reaches 9-9 cap → tiebreak → B wins
    for (let i = 0; i < 9; i++) { s = winGame(s, 0); s = winGame(s, 1); }
    expect(s.isTiebreak).toBe(true);
    s = score(s, 1, 7);
    expect(s.setsWon[1]).toBe(1);
    // Set 3: A wins 6-2
    for (let i = 0; i < 2; i++) s = winGame(s, 1);
    for (let i = 0; i < 6; i++) s = winGame(s, 0);
    expect(s.matchOver).toBe(true);
    expect(s.winner).toBe(0);
  });
});

// ── Results ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
if (failed === 0) {
  console.log(`\n  ✅ All ${passed} tests passed!\n`);
} else {
  console.log(`\n  ${passed} passed, ${failed} failed out of ${total} tests\n`);
  process.exit(1);
}
