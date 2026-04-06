import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import { colors } from '../theme';

const DEUCE_OPTIONS = [
  { key: 'long',   label: 'Long Deuce',   desc: 'Classic — repeats until one team leads by 2 points' },
  { key: 'silver', label: 'Silver Point', desc: 'One deuce with advantage, then sudden-death decides' },
  { key: 'golden', label: 'Golden Point', desc: 'No deuce — first to score at 40–40 wins the game' },
];

const TIEBREAK_OPTIONS = [
  { key: 'tiebreak', label: 'Tiebreak',  desc: 'Play a tiebreak to 7 points at 6–6 (win by 2)' },
  { key: 'playon',   label: 'Play On',   desc: 'Continue until one team leads by 2 games' },
];

const CAP_OPTIONS = [
  { key: null,  label: 'No cap' },
  { key: 8,     label: '8–8' },
  { key: 9,     label: '9–9' },
  { key: 10,    label: '10–10' },
];

export default function SetupScreen({ navigation }) {
  const [maxSets, setMaxSets] = useState(3);
  const [deuceMode, setDeuceMode] = useState('long');
  const [tiebreakMode, setTiebreakMode] = useState('tiebreak');
  const [playonCap, setPlayonCap] = useState(null);

  function startMatch() {
    navigation.navigate('Game', { maxSets, deuceMode, tiebreakMode, playonCap });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.sand} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.heading}>MATCH SETTINGS</Text>

        {/* Format toggle */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Match Format</Text>
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, maxSets === 1 && styles.toggleBtnActive]}
              onPress={() => setMaxSets(1)}
            >
              <Text style={[styles.toggleText, maxSets === 1 && styles.toggleTextActive]}>
                1 Set
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, maxSets === 3 && styles.toggleBtnActive]}
              onPress={() => setMaxSets(3)}
            >
              <Text style={[styles.toggleText, maxSets === 3 && styles.toggleTextActive]}>
                Best of 3
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Deuce rule */}
        <View style={styles.deuceSection}>
          <Text style={styles.deuceLabel}>Deuce Rule</Text>
          {DEUCE_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.deuceOption, deuceMode === opt.key && styles.deuceOptionActive]}
              activeOpacity={0.8}
              onPress={() => setDeuceMode(opt.key)}
            >
              <View style={[styles.radio, deuceMode === opt.key && styles.radioActive]} />
              <View style={styles.deuceText}>
                <Text style={styles.deuceTitle}>{opt.label}</Text>
                <Text style={styles.deuceDesc}>{opt.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tiebreak rule */}
        <View style={styles.deuceSection}>
          <Text style={styles.deuceLabel}>At 6–6 in a Set</Text>
          {TIEBREAK_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.deuceOption, tiebreakMode === opt.key && styles.deuceOptionActive]}
              activeOpacity={0.8}
              onPress={() => setTiebreakMode(opt.key)}
            >
              <View style={[styles.radio, tiebreakMode === opt.key && styles.radioActive]} />
              <View style={styles.deuceText}>
                <Text style={styles.deuceTitle}>{opt.label}</Text>
                <Text style={styles.deuceDesc}>{opt.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Cap picker — only shown when Play On is selected */}
          {tiebreakMode === 'playon' && (
            <View style={styles.capSection}>
              <Text style={styles.capLabel}>Tiebreak cap (optional)</Text>
              <View style={styles.capRow}>
                {CAP_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={String(opt.key)}
                    style={[styles.capBtn, playonCap === opt.key && styles.capBtnActive]}
                    onPress={() => setPlayonCap(opt.key)}
                  >
                    <Text style={[styles.capBtnText, playonCap === opt.key && styles.capBtnTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.capHint}>
                If set, a tiebreak is played when both teams reach this score.
              </Text>
            </View>
          )}
        </View>

        {/* Start button */}
        <TouchableOpacity style={styles.startBtn} activeOpacity={0.85} onPress={startMatch}>
          <Text style={styles.startBtnText}>START MATCH</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  scroll: { padding: 20, paddingBottom: 48 },

  heading: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
    color: colors.clayDark,
    marginBottom: 24,
    marginTop: 8,
  },

  // Format row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sandDark,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.ink },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.sand,
    borderRadius: 8,
    padding: 3,
    gap: 3,
  },
  toggleBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleText: { fontSize: 13, fontWeight: '600', color: colors.grey },
  toggleTextActive: { color: colors.clayDark },

  // Deuce
  deuceSection: {
    backgroundColor: colors.sandDark,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  deuceLabel: { fontSize: 14, fontWeight: '500', color: colors.ink, marginBottom: 10 },
  deuceOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: colors.sandDark,
  },
  deuceOptionActive: {
    borderColor: colors.clay,
    backgroundColor: 'rgba(196,96,26,0.05)',
  },
  radio: {
    width: 18, height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.sandDark,
    marginRight: 10,
    marginTop: 2,
  },
  radioActive: {
    borderColor: colors.clay,
    backgroundColor: colors.clay,
    shadowColor: colors.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  deuceText: { flex: 1 },
  deuceTitle: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 2 },
  deuceDesc: { fontSize: 12, color: colors.grey, lineHeight: 17 },

  // Start
  capSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.sandDark,
  },
  capLabel: { fontSize: 13, fontWeight: '600', color: colors.ink, marginBottom: 8 },
  capRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  capBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: colors.sandDark,
    backgroundColor: colors.white,
  },
  capBtnActive: { backgroundColor: colors.clay, borderColor: colors.clay },
  capBtnText: { fontSize: 13, fontWeight: '600', color: colors.grey },
  capBtnTextActive: { color: colors.white },
  capHint: { fontSize: 11, color: colors.grey, lineHeight: 16 },
    backgroundColor: colors.clay,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    shadowColor: colors.clay,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  startBtnText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
    color: colors.white,
  },
});
