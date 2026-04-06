import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import { colors } from '../theme';

const RULES = [
  {
    icon: '🏟️',
    title: 'The Court',
    body: [
      'Padel is played on an enclosed court measuring 20 metres long by 10 metres wide — roughly a third of the size of a tennis court. The court is surrounded by glass walls and metal mesh fencing, all of which are in play.',
      'A net divides the court in the centre. Service lines on each half create two service boxes per side. The walls are a tactical part of the game — the ball may rebound off them and still be played.',
    ],
  },
  {
    icon: '👥',
    title: 'Players & Format',
    body: [
      'Padel is always played as doubles — two players per side, four players in total. Singles padel is not a standard competitive format.',
      'Matches are typically best of three sets. The first team to win the required number of sets wins the match.',
    ],
  },
  {
    icon: '🎯',
    title: 'Serving',
    body: [
      'The serve must always be underarm — overarm serves are strictly prohibited. The server stands behind the service line, bounces the ball, and strikes it at or below waist height. The serve is delivered diagonally into the opponent\'s service box.',
      'Two attempts are allowed per point. After each game, the serve passes to the opposing team. Within a partnership, players alternate who serves each game.',
    ],
    highlight: '⚠️ A serve that strikes the wire fence before bouncing in the correct service box is a fault.\n✅ A serve that bounces correctly then hits the wall is valid.\n🔄 In a tiebreak, the serve alternates every two points.',
  },
  {
    icon: '🟡',
    title: 'Scoring',
    body: [
      'Padel uses the same scoring as tennis: 15 → 30 → 40 → game. When both teams reach 40, deuce is called (or golden/silver point rules apply depending on your agreed format).',
      'A set is won by the first team to reach 6 games with at least a 2-game lead. If the set reaches 6–6, a tiebreak is played to 7 points (win by 2).',
    ],
  },
  {
    icon: '✅',
    title: 'Ball In Play — Walls',
    body: [
      'The ball may bounce once before being returned. After bouncing on your side, the ball may hit your own walls and still be played.',
    ],
    highlight: '✅ Bounces on your side, hits your wall — still in play.\n✅ Your return hits the opponent\'s back wall — point won.\n❌ Ball bounces twice — point lost.\n❌ Your shot hits the opponent\'s fence before bouncing — out.',
  },
  {
    icon: '❌',
    title: 'Losing a Point',
    body: [
      '• Ball bounces twice before being returned.\n• Ball hit into the net.\n• Player or racket touches the net.\n• Player struck by the ball — their team loses the point.\n• Shot hits opponent\'s fence before bouncing on their court.',
    ],
  },
  {
    icon: '🚪',
    title: 'Playing Through the Gate',
    body: [
      'If the ball exits through the back gate, a player may legally leave the court and play the shot from outside. The ball may be returned back over the net. This spectacular play is entirely within the rules.',
    ],
  },
  {
    icon: '🥇',
    title: 'Deuce Rules Explained',
    body: [
      'Long Deuce: Classic advantage system. Repeats until one team wins two consecutive points from deuce.',
      'Silver Point: First team to score at 40–40 gains advantage. If advantage is lost, a sudden-death golden point decides the game.',
      'Golden Point: No deuce — whichever team scores first at 40–40 wins the game immediately.',
    ],
  },
];

export default function RulesScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.sand} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.heading}>🎾 HOW TO PLAY PADEL</Text>

        {RULES.map((rule, i) => (
          <View key={i} style={styles.ruleCard}>
            <View style={styles.ruleHeading}>
              <View style={styles.ruleIcon}>
                <Text style={styles.ruleIconText}>{rule.icon}</Text>
              </View>
              <Text style={styles.ruleTitle}>{rule.title}</Text>
            </View>
            {rule.body.map((para, j) => (
              <Text key={j} style={styles.ruleBody}>{para}</Text>
            ))}
            {rule.highlight && (
              <View style={styles.highlight}>
                <Text style={styles.highlightText}>{rule.highlight}</Text>
              </View>
            )}
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  scroll: { padding: 16, paddingBottom: 48 },

  heading: {
    fontSize: 24, fontWeight: '900', letterSpacing: 2,
    color: colors.clayDark, marginBottom: 16, marginTop: 8,
  },

  ruleCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(196,96,26,0.08)',
  },
  ruleHeading: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10,
  },
  ruleIcon: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: 'rgba(196,96,26,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  ruleIconText: { fontSize: 18 },
  ruleTitle: { fontSize: 17, fontWeight: '800', letterSpacing: 1, color: colors.ink },

  ruleBody: {
    fontSize: 14, lineHeight: 22, color: '#444',
    marginBottom: 8,
  },

  highlight: {
    backgroundColor: 'rgba(196,96,26,0.07)',
    borderLeftWidth: 3, borderLeftColor: colors.clay,
    borderRadius: 0,
    borderTopRightRadius: 8, borderBottomRightRadius: 8,
    padding: 12, marginTop: 6,
  },
  highlightText: { fontSize: 13, lineHeight: 21, color: colors.ink },
});
