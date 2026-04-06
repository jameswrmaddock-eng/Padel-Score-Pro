import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar,
} from 'react-native';
import { colors } from '../theme';

export default function WinnerScreen({ route, navigation }) {
  const { winner, setScores, maxSets, deuceMode, tiebreakMode, playonCap } = route.params;
  const winnerName = winner === 0 ? 'Team A' : 'Team B';
  const winnerColor = winner === 0 ? colors.clay : colors.courtGreen;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.ink} />
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.trophy}>🏆</Text>
          <Text style={styles.label}>MATCH WINNER</Text>
          <Text style={[styles.winnerName, { color: winnerColor }]}>{winnerName.toUpperCase()}</Text>

          {/* Set scores */}
          <View style={styles.scores}>
            {setScores.map((s, i) => {
              const t1won = s.t1 > s.t2;
              return (
                <View
                  key={i}
                  style={[
                    styles.setChip,
                    { backgroundColor: t1won ? 'rgba(196,96,26,0.12)' : 'rgba(45,106,79,0.12)' },
                  ]}
                >
                  <Text style={[styles.setChipText, { color: t1won ? colors.clayDark : colors.courtGreen }]}>
                    {s.t1}–{s.t2}
                  </Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.homeBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.homeBtnText}>HOME</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.againBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Game', { maxSets, deuceMode, tiebreakMode, playonCap })}
          >
            <Text style={styles.againBtnText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'rgba(26,18,8,0.92)' },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 20,
  },
  trophy: { fontSize: 64, marginBottom: 14 },
  label: {
    fontSize: 11, fontWeight: '700', letterSpacing: 3,
    color: colors.clay, marginBottom: 8,
  },
  winnerName: {
    fontSize: 38, fontWeight: '900', letterSpacing: 2,
    marginBottom: 20, textAlign: 'center',
  },
  scores: {
    flexDirection: 'row', gap: 8, flexWrap: 'wrap',
    justifyContent: 'center', marginBottom: 28,
  },
  setChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  setChipText: { fontSize: 16, fontWeight: '800' },

  homeBtn: {
    width: '100%', backgroundColor: colors.clay,
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 10,
    shadowColor: colors.clay,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  homeBtnText: { fontSize: 20, fontWeight: '900', letterSpacing: 3, color: colors.white },

  againBtn: {
    width: '100%', borderRadius: 14, paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.clayLight,
  },
  againBtnText: { fontSize: 15, fontWeight: '700', color: colors.clay },
});
