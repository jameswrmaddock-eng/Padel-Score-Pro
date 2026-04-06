import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, StatusBar, Alert, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';
import {
  createMatch, scorePoint, toggleServe,
  getPointsLabel, getStatusLabel,
} from '../engine/scoring';

export default function GameScreen({ route, navigation }) {
  const { maxSets, deuceMode, tiebreakMode, playonCap } = route.params;
  const [match, setMatch] = useState(() => createMatch(maxSets, deuceMode, tiebreakMode, playonCap));
  const [history, setHistory] = useState([]);

  // ── Score a point ────────────────────────────────────────────────────
  const handleScore = useCallback((team) => {
    if (match.matchOver) return;

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setHistory(h => [match, ...h]);
    const next = scorePoint(match, team);

    // Stronger haptic on game won (points reset to 0)
    if (next.currentSet.t1 !== match.currentSet.t1 ||
        next.currentSet.t2 !== match.currentSet.t2) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setMatch(next);

    if (next.matchOver) {
      // Small delay so score renders before modal
      setTimeout(() => {
        navigation.navigate('Winner', {
          winner: next.winner,
          setScores: next.setScores,
          maxSets: next.maxSets,
          deuceMode: next.deuceMode,
          tiebreakMode: next.tiebreakMode,
          playonCap: next.playonCap,
        });
      }, 400);
    }
  }, [match, navigation]);

  // ── Undo ─────────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMatch(history[0]);
    setHistory(h => h.slice(1));
  }, [history]);

  // ── Swap serve ───────────────────────────────────────────────────────
  const handleSwapServe = useCallback(() => {
    setMatch(m => toggleServe(m));
  }, []);

  // ── End match ────────────────────────────────────────────────────────
  const handleEnd = useCallback(() => {
    Alert.alert('End Match', 'Are you sure you want to end the current match?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End Match', style: 'destructive', onPress: () => navigation.navigate('Home') },
    ]);
  }, [navigation]);

  const statusLabel = getStatusLabel(match);
  const isGolden = match.isGoldenPoint;
  const isTiebreak = match.isTiebreak;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.sand} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >

        {/* Sets bar */}
        <View style={styles.setsBar}>
          {Array.from({ length: match.maxSets }).map((_, i) => {
            const s = match.setScores[i];
            const isCurrent = i === match.setScores.length;
            return (
              <View
                key={i}
                style={[
                  styles.setPip,
                  s && (s.t1 > s.t2 ? styles.setPipWonA : styles.setPipWonB),
                  isCurrent && styles.setPipActive,
                ]}
              >
                <Text style={[
                  styles.setPipText,
                  (s || isCurrent) && styles.setPipTextLight,
                ]}>
                  {s ? `${s.t1}–${s.t2}` : `Set ${i + 1}`}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Score card */}
        <View style={styles.scoreCard}>

          {/* Header bar */}
          <View style={styles.scoreHeader}>
            <Text style={[styles.teamName, styles.teamNameA]}>TEAM A</Text>
            <Text style={styles.vs}>VS</Text>
            <Text style={[styles.teamName, styles.teamNameB]}>TEAM B</Text>
          </View>

          {/* Sets won row */}
          <View style={styles.setsWonRow}>
            <Text style={[styles.setsWon, { color: colors.clay }]}>
              {match.setsWon[0]} {match.setsWon[0] === 1 ? 'Set' : 'Sets'}
            </Text>
            <Text style={styles.setsWonLabel}>Sets</Text>
            <Text style={[styles.setsWon, { color: colors.courtGreen, textAlign: 'right' }]}>
              {match.setsWon[1]} {match.setsWon[1] === 1 ? 'Set' : 'Sets'}
            </Text>
          </View>

          {/* Banners */}
          {isTiebreak && !isGolden && (
            <View style={styles.tiebreakBanner}>
              <Text style={styles.bannerText}>⚡ TIEBREAK</Text>
            </View>
          )}
          {isGolden && (
            <View style={styles.goldenBanner}>
              <Text style={styles.bannerText}>✦ GOLDEN POINT</Text>
            </View>
          )}
          {statusLabel && !isGolden && (
            <View style={styles.statusBar}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          )}

          {/* Score panels */}
          <View style={styles.scorePanels}>

            {/* Team A */}
            <TouchableOpacity
              style={styles.scorePanel}
              activeOpacity={0.85}
              onPress={() => handleScore(0)}
            >
              <View style={styles.serveRow}>
                {match.serving === 0 && <View style={styles.serveDot} />}
              </View>
              <Text style={styles.pointsDisplay}>
                {getPointsLabel(match, 0)}
              </Text>
              <GamesRow setScores={match.setScores} currentGames={match.currentSet.t1} oppGames={match.currentSet.t2} team={0} />
              <Text style={styles.tapHint}>TAP TO SCORE</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Team B */}
            <TouchableOpacity
              style={styles.scorePanel}
              activeOpacity={0.85}
              onPress={() => handleScore(1)}
            >
              <View style={[styles.serveRow, { justifyContent: 'flex-end' }]}>
                {match.serving === 1 && <View style={styles.serveDot} />}
              </View>
              <Text style={styles.pointsDisplay}>
                {getPointsLabel(match, 1)}
              </Text>
              <GamesRow setScores={match.setScores} currentGames={match.currentSet.t2} oppGames={match.currentSet.t1} team={1} />
              <Text style={styles.tapHint}>TAP TO SCORE</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, history.length === 0 && styles.actionBtnDisabled]}
            onPress={handleUndo}
            disabled={history.length === 0}
          >
            <Text style={styles.actionBtnText}>↩ Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleSwapServe}>
            <Text style={styles.actionBtnText}>🎯 Serve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={handleEnd}>
            <Text style={[styles.actionBtnText, styles.actionBtnDangerText]}>✕ End</Text>
          </TouchableOpacity>
        </View>

        {/* Match log */}
        <View style={styles.logCard}>
          <Text style={styles.logTitle}>📋  MATCH LOG</Text>
          {match.log.length === 0 ? (
            <Text style={styles.logEmpty}>No points yet — start playing!</Text>
          ) : (
            match.log.slice(0, 20).map((entry, i) => (
              <View key={i} style={styles.logItem}>
                <View style={[styles.logDot, { backgroundColor: entry.team === 0 ? colors.clay : colors.courtGreen }]} />
                <Text style={styles.logText}>
                  Point → <Text style={{ fontWeight: '700' }}>Team {entry.team === 0 ? 'A' : 'B'}</Text>
                </Text>
                <Text style={styles.logScore}>Games {entry.gamesA}–{entry.gamesB}</Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Games bubble row component
function GamesRow({ setScores, currentGames, oppGames, team }) {
  return (
    <View style={styles.gamesRow}>
      {setScores.map((s, i) => {
        const score = team === 0 ? s.t1 : s.t2;
        const oppScore = team === 0 ? s.t2 : s.t1;
        const won = score > oppScore;
        return (
          <View key={i} style={[styles.gameBubble, won ? (team === 0 ? styles.bubbleA : styles.bubbleB) : styles.bubbleLost]}>
            <Text style={[styles.gameBubbleText, (won || true) && { color: won ? '#fff' : '#999' }]}>{score}</Text>
          </View>
        );
      })}
      <View style={[styles.gameBubble, currentGames > oppGames ? (team === 0 ? styles.bubbleA : styles.bubbleB) : styles.bubbleNeutral]}>
        <Text style={[styles.gameBubbleText, { color: currentGames > oppGames ? '#fff' : '#777' }]}>{currentGames}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  scroll: { padding: 16, paddingBottom: 40 },

  // Sets bar
  setsBar: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 14 },
  setPip: {
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20, backgroundColor: colors.sandDark,
  },
  setPipActive: { backgroundColor: colors.clay },
  setPipWonA: { backgroundColor: colors.clay },
  setPipWonB: { backgroundColor: colors.courtGreen },
  setPipText: { fontSize: 12, fontWeight: '700', color: colors.ink },
  setPipTextLight: { color: '#fff' },

  // Score card
  scoreCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 14,
  },
  scoreHeader: {
    flexDirection: 'row',
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  teamName: { flex: 1, fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  teamNameA: { color: colors.clayLight, textAlign: 'left' },
  teamNameB: { color: colors.courtGreenLight, textAlign: 'right' },
  vs: { fontSize: 13, fontWeight: '700', letterSpacing: 2, color: 'rgba(255,255,255,0.3)' },

  setsWonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: 'rgba(26,18,8,0.04)',
    borderBottomWidth: 1,
    borderBottomColor: colors.sandDark,
  },
  setsWon: { flex: 1, fontSize: 13, fontWeight: '700' },
  setsWonLabel: { fontSize: 10, letterSpacing: 2, color: colors.grey, textTransform: 'uppercase' },

  // Banners
  tiebreakBanner: {
    backgroundColor: colors.clay,
    paddingVertical: 8,
    alignItems: 'center',
  },
  goldenBanner: {
    backgroundColor: colors.gold,
    paddingVertical: 8,
    alignItems: 'center',
  },
  bannerText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 3 },

  statusBar: {
    backgroundColor: 'rgba(196,96,26,0.08)',
    paddingVertical: 7,
    alignItems: 'center',
  },
  statusText: { fontSize: 12, fontWeight: '700', letterSpacing: 2, color: colors.clay },

  // Score panels
  scorePanels: { flexDirection: 'row' },
  scorePanel: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 12,
    gap: 12,
  },
  serveRow: { flexDirection: 'row', height: 12, width: '100%' },
  serveDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
  },
  divider: {
    width: 1,
    backgroundColor: colors.sandDark,
    marginVertical: 20,
  },
  pointsDisplay: {
    fontSize: 80,
    fontWeight: '900',
    color: colors.ink,
    lineHeight: 88,
  },
  tapHint: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.greyLight,
    marginTop: 4,
  },

  // Games row
  gamesRow: { flexDirection: 'row', gap: 5 },
  gameBubble: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  gameBubbleText: { fontSize: 12, fontWeight: '700' },
  bubbleA: { backgroundColor: colors.clay },
  bubbleB: { backgroundColor: colors.courtGreen },
  bubbleLost: { backgroundColor: colors.courtGreen },
  bubbleNeutral: { backgroundColor: colors.sandDark },

  // Actions
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  actionBtn: {
    flex: 1, paddingVertical: 13,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.sandDark,
    alignItems: 'center',
  },
  actionBtnDisabled: { opacity: 0.4 },
  actionBtnDanger: { borderColor: 'rgba(231,76,60,0.3)' },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: colors.ink },
  actionBtnDangerText: { color: '#e74c3c' },

  // Log
  logCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  logTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: colors.clay, marginBottom: 12 },
  logEmpty: { fontSize: 13, color: colors.greyLight, textAlign: 'center', paddingVertical: 8 },
  logItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 5, gap: 8,
  },
  logDot: { width: 6, height: 6, borderRadius: 3 },
  logText: { flex: 1, fontSize: 13, color: colors.ink },
  logScore: { fontSize: 11, fontWeight: '700', color: colors.grey },
});
