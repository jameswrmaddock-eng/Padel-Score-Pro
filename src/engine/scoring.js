// ── Padel Scoring Engine ──────────────────────────────────────────────────
// Pure logic module — no UI dependencies. Used by all screens.

export const POINTS_LABEL = ['0', '15', '30', '40'];

export function createMatch(maxSets, deuceMode, tiebreakMode, playonCap) {
  return {
    maxSets,
    deuceMode,
    tiebreakMode,
    playonCap: playonCap || null,  // null | 8 | 9 | 10
    setsWon: [0, 0],
    setScores: [],
    currentSet: { t1: 0, t2: 0 },
    points: [0, 0],
    serving: 0,
    tbServeCount: 0,
    tbFirstServer: 0,
    isTiebreak: false,
    isDeuce: false,
    isGoldenPoint: false,
    matchOver: false,
    winner: null,
    log: [],
  };
}

export function scorePoint(state, team) {
  if (state.matchOver) return state;
  const s = deepClone(state);
  const t = team;
  const opp = 1 - t;

  if (s.isTiebreak) {
    scoreTiebreak(s, t, opp);
  } else {
    scoreRegular(s, t, opp);
  }

  s.log = [{ team, gamesA: s.currentSet.t1, gamesB: s.currentSet.t2 }, ...s.log];
  return s;
}

function scoreRegular(s, t, opp) {
  const pts = s.points;

  if (s.isGoldenPoint) {
    winGame(s, t);
    return;
  }

  if (s.isDeuce) {
    if (pts[t] === 4) {
      winGame(s, t);
    } else {
      if (s.deuceMode === 'silver') {
        pts[0] = 3; pts[1] = 3;
        s.isDeuce = false;
        s.isGoldenPoint = true;
      } else {
        // long deuce: back to 40-40, clear isDeuce so next point gives advantage fresh
        s.points[0] = 3; s.points[1] = 3;
        s.isDeuce = false;
      }
    }
    return;
  }

  if (pts[t] < 3) { pts[t]++; return; }
  if (pts[opp] < 3) { winGame(s, t); return; }

  // Both at 40
  if (s.deuceMode === 'golden') {
    winGame(s, t);
  } else {
    s.isDeuce = true;
    pts[t] = 4;
  }
}

function scoreTiebreak(s, t, opp) {
  s.points[t]++;
  s.tbServeCount++;

  // Serve rotation: 1 point for first server, then alternate every 2
  const n = s.tbServeCount;
  if (n === 1) {
    s.serving = s.serving === 0 ? 1 : 0;
  } else if (n > 1 && (n - 1) % 2 === 0) {
    s.serving = s.serving === 0 ? 1 : 0;
  }

  if (s.points[t] >= 7 && s.points[t] - s.points[opp] >= 2) {
    winGame(s, t);
  }
}

function winGame(s, t) {
  const wasTiebreak = s.isTiebreak;
  s.points = [0, 0];
  s.isDeuce = false;
  s.isGoldenPoint = false;
  // Only swap serve on game win — tiebreak handles its own rotation
  if (!s.isTiebreak) {
    s.serving = s.serving === 0 ? 1 : 0;
  }
  s.isTiebreak = false;
  s.tbServeCount = 0;
  s.currentSet[t === 0 ? 't1' : 't2']++;

  if (wasTiebreak) {
    // Tiebreak win always ends the set immediately
    const g1 = s.currentSet.t1;
    const g2 = s.currentSet.t2;
    s.setScores = [...s.setScores, { t1: g1, t2: g2 }];
    s.setsWon = [...s.setsWon];
    s.setsWon[t]++;
    s.currentSet = { t1: 0, t2: 0 };
    if (s.setsWon[t] >= Math.ceil(s.maxSets / 2)) {
      s.matchOver = true;
      s.winner = t;
    }
  } else {
    checkSetWin(s, t);
  }
}

function checkSetWin(s, t) {
  const g1 = s.currentSet.t1;
  const g2 = s.currentSet.t2;

  if (g1 === 6 && g2 === 6) {
    if (s.tiebreakMode === 'tiebreak') {
      s.isTiebreak = true;
      s.points = [0, 0];
      s.tbServeCount = 0;
      s.tbFirstServer = s.serving;
    }
    // if 'playon', just continue — 2-game lead condition handles the rest
    return;
  }

  // Play On cap: if both teams reach the cap score, trigger a tiebreak
  if (s.tiebreakMode === 'playon' && s.playonCap !== null) {
    if (g1 === s.playonCap && g2 === s.playonCap) {
      s.isTiebreak = true;
      s.points = [0, 0];
      s.tbServeCount = 0;
      s.tbFirstServer = s.serving;
      return;
    }
  }

  let setWon = false;
  if (t === 0 && g1 >= 6 && g1 - g2 >= 2) setWon = true;
  if (t === 1 && g2 >= 6 && g2 - g1 >= 2) setWon = true;

  if (setWon) {
    s.setScores = [...s.setScores, { t1: g1, t2: g2 }];
    s.setsWon = [...s.setsWon];
    s.setsWon[t]++;
    s.currentSet = { t1: 0, t2: 0 };
    if (s.setsWon[t] >= Math.ceil(s.maxSets / 2)) {
      s.matchOver = true;
      s.winner = t;
    }
  }
}

export function toggleServe(state) {
  const s = deepClone(state);
  s.serving = s.serving === 0 ? 1 : 0;
  return s;
}

export function getPointsLabel(state, team) {
  if (state.isTiebreak) return String(state.points[team]);
  if (state.isGoldenPoint) return '40';
  if (state.points[team] === 4) return 'AD';
  return POINTS_LABEL[state.points[team]];
}

export function getStatusLabel(state) {
  if (state.isGoldenPoint) return 'GOLDEN POINT';
  if (state.isTiebreak) return 'TIEBREAK';
  if (state.isDeuce && state.points[0] === 4) return 'ADVANTAGE TEAM A';
  if (state.isDeuce && state.points[1] === 4) return 'ADVANTAGE TEAM B';
  if (state.points[0] === 3 && state.points[1] === 3 && state.deuceMode === 'long') return 'DEUCE';
  return null;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
