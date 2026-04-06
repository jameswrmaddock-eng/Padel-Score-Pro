/**
 * Padel Score Pro — Full Test Suite
 * Covers all scoring rules for website and React Native app.
 * Run with: npx jest --config jest.config.json
 */

const {
  createMatch, scorePoint, toggleServe,
  getPointsLabel, getStatusLabel,
} = require('./scoring.cjs');

// ── Helpers ──────────────────────────────────────────────────────────────────

// Score n points for a given team
function score(state, team, n = 1) {
  for (let i = 0; i < n; i++) state = scorePoint(state, team);
  return state;
}

// Win a full game for a team (4 points, no deuce)
function winGame(state, team) {
  return score(state, team, 4);
}

// Win a full game from deuce for a team (reaches deuce, then team wins 2)
function winGameFromDeuce(state, winner, loser) {
  // Get both to 40
  state = score(state, winner, 3);
  state = score(state, loser, 3);
  // winner scores → advantage
  state = scorePoint(state, winner);
  // winner scores again → game
  state = scorePoint(state, winner);
  return state;
}

// Win a set 6-0 for a team
function winSet6_0(state, team) {
  for (let i = 0; i < 6; i++) state = winGame(state, team);
  return state;
}

// Win a set 6-4
function winSet6_4(state, winner, loser) {
  for (let i = 0; i < 4; i++) state = winGame(state, loser);
  for (let i = 0; i < 6; i++) state = winGame(state, winner);
  return state;
}

// Win n tiebreak points for a team
function tbScore(state, team, n = 1) {
  return score(state, team, n);
}

// ── 1. Basic point scoring ───────────────────────────────────────────────────

describe('Basic point scoring', () => {
  test('starts at 0-0', () => {
    const s = createMatch(3, 'long', 'tiebreak');
    expect(s.points).toEqual([0, 0]);
    expect(getPointsLabel(s, 0)).toBe('0');
    expect(getPointsLabel(s, 1)).toBe('0');
  });

  test('scores 0 → 15 → 30 → 40', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = scorePoint(s, 0);
    expect(getPointsLabel(s, 0)).toBe('15');
    s = scorePoint(s, 0);
    expect(getPointsLabel(s, 0)).toBe('30');
    s = scorePoint(s, 0);
    expect(getPointsLabel(s, 0)).toBe('40');
  });

  test('wins game at 40-0 (4 points)', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = winGame(s, 0);
    expect(s.currentSet.t1).toBe(1);
    expect(s.currentSet.t2).toBe(0);
    expect(s.points).toEqual([0, 0]);
  });

  test('wins game at 40-30', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = score(s, 0, 3); // Team A to 40
    s = score(s, 1, 2); // Team B to 30
    s = scorePoint(s, 0); // Team A wins
    expect(s.currentSet.t1).toBe(1);
    expect(s.points).toEqual([0, 0]);
  });

  test('match is blocked after matchOver', () => {
    let s = createMatch(1, 'golden', 'tiebreak');
    s = winSet6_0(s, 0);
    const frozen = s;
    s = scorePoint(s, 1);
    expect(s).toEqual(frozen);
  });
});

// ── 2. Long deuce ───────────────────────────────────────────────────────────

describe('Long deuce', () => {
  function toDeuce(s) {
    s = score(s, 0, 3);
    s = score(s, 1, 3);
    return s;
  }

  test('reaches deuce at 40-40', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = toDeuce(s);
    expect(getStatusLabel(s)).toBe('DEUCE');
    expect(s.points).toEqual([3, 3]);
  });

  test('team A gets advantage after deuce', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = toDeuce(s);
    s = scorePoint(s, 0);
    expect(getStatusLabel(s)).toBe('ADVANTAGE TEAM A');
    expect(getPointsLabel(s, 0)).toBe('AD');
  });

  test('team B gets advantage after deuce', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = toDeuce(s);
    s = scorePoint(s, 1);
    expect(getStatusLabel(s)).toBe('ADVANTAGE TEAM B');
    expect(getPointsLabel(s, 1)).toBe('AD');
  });

  test('wins game from advantage', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = toDeuce(s);
    s = scorePoint(s, 0); // advantage A
    s = scorePoint(s, 0); // A wins game
    expect(s.currentSet.t1).toBe(1);
    expect(s.points).toEqual([0, 0]);
  });

  test('goes back to deuce when advantage is lost', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = toDeuce(s);
    s = scorePoint(s, 0); // advantage A
    s = scorePoint(s, 1); // B breaks → back to deuce
    expect(getStatusLabel(s)).toBe('DEUCE');
    expect(s.points).toEqual([3, 3]);
    expect(s.isDeuce).toBe(false); // isDeuce cleared for fresh advantage
  });

  test('advantage swings correctly: A adv → B scores → deuce → B adv → B wins', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = toDeuce(s);
    s = scorePoint(s, 0); // adv A
    expect(getStatusLabel(s)).toBe('ADVANTAGE TEAM A');
    s = scorePoint(s, 1); // deuce
    expect(getStatusLabel(s)).toBe('DEUCE');
    s = scorePoint(s, 1); // adv B
    expect(getStatusLabel(s)).toBe('ADVANTAGE TEAM B');
    s = scorePoint(s, 1); // B wins
    expect(s.currentSet.t2).toBe(1);
  });

  test('deuce can repeat multiple times', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = toDeuce(s);
    // 5 rounds of deuce before A wins
    for (let i = 0; i < 5; i++) {
      s = scorePoint(s, 0); // adv A
      s = scorePoint(s, 1); // back to deuce
    }
    s = scorePoint(s, 0); // adv A
    s = scorePoint(s, 0); // A wins
    expect(s.currentSet.t1).toBe(1);
    expect(s.points).toEqual([0, 0]);
  });
});

// ── 3. Golden point ──────────────────────────────────────────────────────────

describe('Golden point', () => {
  function to40_40(s) {
    s = score(s, 0, 3);
    s = score(s, 1, 3);
    return s;
  }

  test('team A wins immediately at 40-40', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = to40_40(s);
    s = scorePoint(s, 0);
    expect(s.currentSet.t1).toBe(1);
    expect(s.points).toEqual([0, 0]);
  });

  test('team B wins immediately at 40-40', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = to40_40(s);
    s = scorePoint(s, 1);
    expect(s.currentSet.t2).toBe(1);
  });

  test('no deuce flag is set — game resolves in one click', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = to40_40(s);
    expect(s.isDeuce).toBe(false);
    expect(s.isGoldenPoint).toBe(false);
    // Next point just wins — no intermediate state
    s = scorePoint(s, 0);
    expect(s.currentSet.t1).toBe(1);
  });
});

// ── 4. Silver point ──────────────────────────────────────────────────────────

describe('Silver point', () => {
  function to40_40(s) {
    s = score(s, 0, 3);
    s = score(s, 1, 3);
    return s;
  }

  test('first 40-40 gives advantage to scorer', () => {
    let s = createMatch(3, 'silver', 'tiebreak');
    s = to40_40(s);
    s = scorePoint(s, 0);
    expect(getStatusLabel(s)).toBe('ADVANTAGE TEAM A');
    expect(s.isDeuce).toBe(true);
  });

  test('winning from advantage closes game', () => {
    let s = createMatch(3, 'silver', 'tiebreak');
    s = to40_40(s);
    s = scorePoint(s, 0); // adv A
    s = scorePoint(s, 0); // A wins
    expect(s.currentSet.t1).toBe(1);
  });

  test('losing advantage triggers golden point', () => {
    let s = createMatch(3, 'silver', 'tiebreak');
    s = to40_40(s);
    s = scorePoint(s, 0); // adv A
    s = scorePoint(s, 1); // B breaks → golden point
    expect(s.isGoldenPoint).toBe(true);
    expect(getStatusLabel(s)).toBe('GOLDEN POINT');
  });

  test('golden point: whoever scores next wins the game', () => {
    let s = createMatch(3, 'silver', 'tiebreak');
    s = to40_40(s);
    s = scorePoint(s, 0); // adv A
    s = scorePoint(s, 1); // golden point
    s = scorePoint(s, 1); // B wins
    expect(s.currentSet.t2).toBe(1);
    expect(s.isGoldenPoint).toBe(false);
  });

  test('golden point can be won by either team', () => {
    let s = createMatch(3, 'silver', 'tiebreak');
    s = to40_40(s);
    s = scorePoint(s, 1); // adv B
    s = scorePoint(s, 0); // A breaks → golden point
    s = scorePoint(s, 0); // A wins golden point
    expect(s.currentSet.t1).toBe(1);
  });
});

// ── 5. Set scoring ───────────────────────────────────────────────────────────

describe('Set scoring', () => {
  test('wins set 6-0', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = winSet6_0(s, 0);
    expect(s.setsWon[0]).toBe(1);
    expect(s.setScores).toEqual([{ t1: 6, t2: 0 }]);
    expect(s.currentSet).toEqual({ t1: 0, t2: 0 });
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
    for (let i = 0; i < 5; i++) s = winGame(s, 0);
    // 5-5 — both need to reach 6
    s = winGame(s, 0); // 6-5
    s = winGame(s, 0); // 7-5 — set won
    expect(s.setsWon[0]).toBe(1);
    expect(s.setScores[0]).toEqual({ t1: 7, t2: 5 });
  });

  test('does not win set at 6-5 (needs 2 clear)', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    for (let i = 0; i < 5; i++) s = winGame(s, 1);
    for (let i = 0; i < 6; i++) s = winGame(s, 0);
    // 6-5 — not enough
    expect(s.setsWon[0]).toBe(0);
    expect(s.currentSet).toEqual({ t1: 6, t2: 5 });
  });

  test('wins match best of 3 — 2-0', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = winSet6_0(s, 0);
    s = winSet6_0(s, 0);
    expect(s.matchOver).toBe(true);
    expect(s.winner).toBe(0);
    expect(s.setsWon).toEqual([2, 0]);
  });

  test('wins match best of 3 — 2-1', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = winSet6_0(s, 0);
    s = winSet6_0(s, 1);
    s = winSet6_0(s, 0);
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

// ── 6. Tiebreak (standard at 6-6) ───────────────────────────────────────────

describe('Tiebreak at 6-6', () => {
  function reach6_6(s) {
    for (let i = 0; i < 6; i++) {
      s = winGame(s, 0);
      s = winGame(s, 1);
    }
    return s;
  }

  test('triggers tiebreak at 6-6', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s);
    expect(s.isTiebreak).toBe(true);
    expect(s.points).toEqual([0, 0]);
  });

  test('tiebreak points display as numbers', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s);
    s = tbScore(s, 0, 3);
    expect(getPointsLabel(s, 0)).toBe('3');
    expect(getPointsLabel(s, 1)).toBe('0');
  });

  test('wins tiebreak 7-0', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s);
    s = tbScore(s, 0, 7);
    expect(s.isTiebreak).toBe(false);
    expect(s.setsWon[0]).toBe(1);
    expect(s.setScores[0]).toEqual({ t1: 7, t2: 6 });
  });

  test('tiebreak continues past 7 if not 2-point lead', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s);
    s = tbScore(s, 0, 6);
    s = tbScore(s, 1, 6); // 6-6
    s = scorePoint(s, 0); // 7-6 — not enough
    expect(s.isTiebreak).toBe(true);
    s = scorePoint(s, 0); // 8-6 — win
    expect(s.isTiebreak).toBe(false);
    expect(s.setsWon[0]).toBe(1);
  });

  test('tiebreak win ends set immediately — no extra game needed', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s);
    s = tbScore(s, 0, 7);
    // Set should be over — currentSet resets
    expect(s.currentSet).toEqual({ t1: 0, t2: 0 });
  });
});

// ── 7. Tiebreak serve rotation ───────────────────────────────────────────────

describe('Tiebreak serve rotation (1, 2, 2, 2...)', () => {
  function reach6_6(s) {
    for (let i = 0; i < 6; i++) {
      s = winGame(s, 0);
      s = winGame(s, 1);
    }
    return s;
  }

  test('first server (team 0) serves point 1 only', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s);
    const firstServer = s.serving; // should be 0 (Team A)
    expect(firstServer).toBe(0);
    s = scorePoint(s, 0); // point 1
    // After point 1: serve rotates to opponents
    expect(s.serving).toBe(1);
  });

  test('second server serves points 2 and 3', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s);
    s = scorePoint(s, 0); // point 1 → serve swaps to 1
    expect(s.serving).toBe(1);
    s = scorePoint(s, 0); // point 2 → still 1
    expect(s.serving).toBe(1);
    s = scorePoint(s, 0); // point 3 → swaps back to 0
    expect(s.serving).toBe(0);
  });

  test('serve rotates every 2 points after first', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = reach6_6(s);

    const expectedServers = [
      0, // point 1: first server (then swap)
      1, 1, // points 2-3: opponents (then swap)
      0, 0, // points 4-5: back (then swap)
      1, 1, // points 6-7: opponents
    ];

    let prevServing = s.serving; // 0
    for (let i = 0; i < 7; i++) {
      expect(s.serving).toBe(expectedServers[i]);
      s = scorePoint(s, 0);
    }
  });
});

// ── 8. Play On mode ──────────────────────────────────────────────────────────

describe('Play On mode — no cap', () => {
  function reach6_6(s) {
    for (let i = 0; i < 6; i++) {
      s = winGame(s, 0);
      s = winGame(s, 1);
    }
    return s;
  }

  test('does NOT trigger tiebreak at 6-6', () => {
    let s = createMatch(3, 'golden', 'playon');
    s = reach6_6(s);
    expect(s.isTiebreak).toBe(false);
    expect(s.currentSet).toEqual({ t1: 6, t2: 6 });
  });

  test('continues until 2-game lead — wins at 8-6', () => {
    let s = createMatch(3, 'golden', 'playon');
    s = reach6_6(s);
    s = winGame(s, 0); // 7-6
    expect(s.setsWon[0]).toBe(0); // not yet
    s = winGame(s, 0); // 8-6
    expect(s.setsWon[0]).toBe(1);
    expect(s.setScores[0]).toEqual({ t1: 8, t2: 6 });
  });

  test('continues until 9-7', () => {
    let s = createMatch(3, 'golden', 'playon');
    s = reach6_6(s);
    s = winGame(s, 0); // 7-6
    s = winGame(s, 1); // 7-7
    s = winGame(s, 0); // 8-7
    s = winGame(s, 1); // 8-8
    s = winGame(s, 0); // 9-8
    s = winGame(s, 1); // 9-9 — no cap, continues
    expect(s.setsWon[0]).toBe(0);
    s = winGame(s, 1); // 9-10
    expect(s.setsWon[1]).toBe(1);
    expect(s.setScores[0]).toEqual({ t1: 9, t2: 10 });
  });
});

// ── 9. Play On with cap ──────────────────────────────────────────────────────

describe('Play On with cap', () => {
  function reach6_6(s) {
    for (let i = 0; i < 6; i++) {
      s = winGame(s, 0);
      s = winGame(s, 1);
    }
    return s;
  }

  function reachCapTied(s, cap) {
    s = reach6_6(s);
    const extra = cap - 6;
    for (let i = 0; i < extra; i++) {
      s = winGame(s, 0);
      s = winGame(s, 1);
    }
    return s;
  }

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

  test('cap 9: tiebreak win ends set at 10-9, not continuing', () => {
    let s = createMatch(3, 'golden', 'playon', 9);
    s = reachCapTied(s, 9); // 9-9 → tiebreak starts
    // Win tiebreak 7-0
    s = tbScore(s, 0, 7);
    expect(s.isTiebreak).toBe(false);
    expect(s.setsWon[0]).toBe(1);
    expect(s.setScores[0]).toEqual({ t1: 10, t2: 9 });
    // No extra game needed
    expect(s.currentSet).toEqual({ t1: 0, t2: 0 });
  });

  test('cap 9: set winner is correct for both teams', () => {
    let s = createMatch(3, 'golden', 'playon', 9);
    s = reachCapTied(s, 9);
    s = tbScore(s, 1, 7); // Team B wins tiebreak
    expect(s.setsWon[1]).toBe(1);
    expect(s.setScores[0]).toEqual({ t1: 9, t2: 10 });
  });

  test('cap 9: does not trigger tiebreak before 9-9 (e.g. at 8-8)', () => {
    let s = createMatch(3, 'golden', 'playon', 9);
    s = reachCapTied(s, 8); // reach 8-8
    expect(s.isTiebreak).toBe(false);
  });
});

// ── 10. Serve rotation (regular games) ───────────────────────────────────────

describe('Serve rotation — regular games', () => {
  test('serve swaps after each game win', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    expect(s.serving).toBe(0);
    s = winGame(s, 0);
    expect(s.serving).toBe(1);
    s = winGame(s, 1);
    expect(s.serving).toBe(0);
    s = winGame(s, 0);
    expect(s.serving).toBe(1);
  });

  test('toggleServe swaps independently', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    expect(s.serving).toBe(0);
    s = toggleServe(s);
    expect(s.serving).toBe(1);
    s = toggleServe(s);
    expect(s.serving).toBe(0);
  });
});

// ── 11. Labels and display ───────────────────────────────────────────────────

describe('Display labels', () => {
  test('getPointsLabel shows correct tennis labels', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    expect(getPointsLabel(s, 0)).toBe('0');
    s = scorePoint(s, 0);
    expect(getPointsLabel(s, 0)).toBe('15');
    s = scorePoint(s, 0);
    expect(getPointsLabel(s, 0)).toBe('30');
    s = scorePoint(s, 0);
    expect(getPointsLabel(s, 0)).toBe('40');
  });

  test('getPointsLabel shows AD for advantage', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = score(s, 0, 3);
    s = score(s, 1, 3);
    s = scorePoint(s, 0); // advantage A
    expect(getPointsLabel(s, 0)).toBe('AD');
    expect(getPointsLabel(s, 1)).toBe('40');
  });

  test('getPointsLabel shows 40 for both during golden point', () => {
    let s = createMatch(3, 'silver', 'tiebreak');
    s = score(s, 0, 3);
    s = score(s, 1, 3);
    s = scorePoint(s, 0); // adv A
    s = scorePoint(s, 1); // golden point
    expect(getPointsLabel(s, 0)).toBe('40');
    expect(getPointsLabel(s, 1)).toBe('40');
  });

  test('getPointsLabel shows numeric scores in tiebreak', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    for (let i = 0; i < 12; i++) {
      s = winGame(s, i % 2 === 0 ? 0 : 1);
    }
    s = score(s, 0, 5);
    s = score(s, 1, 3);
    expect(getPointsLabel(s, 0)).toBe('5');
    expect(getPointsLabel(s, 1)).toBe('3');
  });

  test('getStatusLabel shows DEUCE at 40-40 in long deuce', () => {
    let s = createMatch(3, 'long', 'tiebreak');
    s = score(s, 0, 3);
    s = score(s, 1, 3);
    expect(getStatusLabel(s)).toBe('DEUCE');
  });

  test('getStatusLabel shows TIEBREAK during tiebreak', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    for (let i = 0; i < 12; i++) s = winGame(s, i % 2 === 0 ? 0 : 1);
    expect(getStatusLabel(s)).toBe('TIEBREAK');
  });

  test('getStatusLabel shows GOLDEN POINT during silver golden phase', () => {
    let s = createMatch(3, 'silver', 'tiebreak');
    s = score(s, 0, 3);
    s = score(s, 1, 3);
    s = scorePoint(s, 0); // adv A
    s = scorePoint(s, 1); // golden
    expect(getStatusLabel(s)).toBe('GOLDEN POINT');
  });
});

// ── 12. Full match simulations ───────────────────────────────────────────────

describe('Full match simulations', () => {
  test('Team A wins 2-0 in best of 3, golden point', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    s = winSet6_0(s, 0);
    s = winSet6_0(s, 0);
    expect(s.matchOver).toBe(true);
    expect(s.winner).toBe(0);
    expect(s.setsWon).toEqual([2, 0]);
  });

  test('Team B wins 2-1 in best of 3 with tiebreaks', () => {
    let s = createMatch(3, 'golden', 'tiebreak');
    // Set 1: A wins 7-6 via tiebreak
    for (let i = 0; i < 12; i++) s = winGame(s, i % 2 === 0 ? 0 : 1);
    s = tbScore(s, 0, 7); // A wins set 1
    expect(s.setsWon[0]).toBe(1);
    // Set 2: B wins 6-0
    s = winSet6_0(s, 1);
    expect(s.setsWon[1]).toBe(1);
    // Set 3: B wins 6-4
    s = winSet6_4(s, 1, 0);
    expect(s.matchOver).toBe(true);
    expect(s.winner).toBe(1);
    expect(s.setsWon).toEqual([1, 2]);
  });

  test('Play On match with 9-9 cap — full simulation', () => {
    let s = createMatch(3, 'long', 'playon', 9);
    // Set 1: A wins 6-3
    for (let i = 0; i < 3; i++) s = winGame(s, 1);
    for (let i = 0; i < 6; i++) s = winGame(s, 0);
    expect(s.setsWon[0]).toBe(1);
    // Set 2: goes to 9-9 cap → tiebreak → B wins
    for (let i = 0; i < 9; i++) {
      s = winGame(s, 0);
      s = winGame(s, 1);
    }
    expect(s.isTiebreak).toBe(true);
    s = tbScore(s, 1, 7);
    expect(s.setsWon[1]).toBe(1);
    // Set 3: A wins 6-2
    for (let i = 0; i < 2; i++) s = winGame(s, 1);
    for (let i = 0; i < 6; i++) s = winGame(s, 0);
    expect(s.matchOver).toBe(true);
    expect(s.winner).toBe(0);
  });
});
