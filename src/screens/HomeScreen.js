import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Linking, SafeAreaView, StatusBar,
} from 'react-native';
import { colors } from '../theme';

const ADS = [
  {
    emoji: '📦',
    title: 'Amazon — Padel',
    subtitle: 'Huge range of padel gear with fast Prime delivery',
    tag: 'Shop',
    url: 'https://www.amazon.co.uk/s?k=padel&tag=jmadd1791-21',
    tagColor: colors.clay,
  },
  {
    emoji: '📍',
    title: 'Padel4All',
    subtitle: 'Find and book padel courts across the UK',
    tag: 'Courts',
    url: 'https://padel4all.com/',
    tagColor: colors.courtGreen,
  },
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.sand} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🎾</Text>
          </View>
          <Text style={styles.title}>PADEL SCORE PRO</Text>
          <Text style={styles.subtitle}>SCORE TRACKER & GUIDE</Text>
        </View>

        {/* Menu cards */}
        <TouchableOpacity
          style={styles.menuCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Setup')}
        >
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(45,106,79,0.12)' }]}>
            <Text style={styles.menuEmoji}>🏓</Text>
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>NEW MATCH</Text>
            <Text style={styles.menuSubtitle}>Start tracking a live padel match</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Rules')}
        >
          <View style={[styles.menuIcon, { backgroundColor: 'rgba(196,96,26,0.12)' }]}>
            <Text style={styles.menuEmoji}>📖</Text>
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>PADEL RULES</Text>
            <Text style={styles.menuSubtitle}>How to serve, score and play</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {/* Ads */}
        <Text style={styles.adsLabel}>FEATURED PARTNERS</Text>
        {ADS.map((ad, i) => (
          <TouchableOpacity
            key={i}
            style={styles.adCard}
            activeOpacity={0.8}
            onPress={() => Linking.openURL(ad.url)}
          >
            <View style={styles.adEmoji}>
              <Text style={styles.adEmojiText}>{ad.emoji}</Text>
            </View>
            <View style={styles.adText}>
              <Text style={styles.adTitle}>{ad.title}</Text>
              <Text style={styles.adSubtitle}>{ad.subtitle}</Text>
            </View>
            <View style={[styles.adTag, { backgroundColor: ad.tagColor + '18' }]}>
              <Text style={[styles.adTagText, { color: ad.tagColor }]}>{ad.tag}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.disclosure}>
          As an Amazon Associate I earn from qualifying purchases.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.sand,
  },
  scroll: {
    padding: 20,
    paddingBottom: 48,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  logoCircle: {
    width: 60, height: 60,
    borderRadius: 30,
    backgroundColor: colors.clay,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: colors.clay,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  logoEmoji: { fontSize: 30 },
  title: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 4,
    color: colors.clayDark,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: colors.clay,
    marginTop: 4,
  },

  // Menu cards
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(196,96,26,0.12)',
  },
  menuIcon: {
    width: 52, height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuEmoji: { fontSize: 26 },
  menuText: { flex: 1 },
  menuTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: colors.ink,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.grey,
    lineHeight: 18,
  },
  menuArrow: {
    fontSize: 24,
    color: colors.clayLight,
    marginLeft: 8,
  },

  // Ads
  adsLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.greyLight,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  adCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.sandDark,
  },
  adEmoji: {
    width: 42, height: 42,
    borderRadius: 10,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  adEmojiText: { fontSize: 22 },
  adText: { flex: 1 },
  adTitle: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 2 },
  adSubtitle: { fontSize: 12, color: colors.grey, lineHeight: 16 },
  adTag: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20, marginLeft: 8,
  },
  adTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  disclosure: {
    fontSize: 10,
    color: colors.greyLight,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
});
