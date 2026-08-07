import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, glassStyle } from '../constants/theme';

export default function MembershipScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Membership Tiers</Text>
      <View style={styles.card}>
        <Text style={styles.tierName}>OmniGo Pro</Text>
        <Text style={styles.desc}>Free priority towing, 24/7 priority support, zero surge pricing.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 60, paddingHorizontal: 20 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 28, color: theme.colors.text, marginBottom: 20 },
  card: { ...glassStyle, padding: 20 },
  tierName: { fontFamily: 'Outfit_600SemiBold', fontSize: 24, color: theme.colors.primary, marginBottom: 10 },
  desc: { fontFamily: 'Inter_400Regular', color: theme.colors.textSecondary, fontSize: 16 },
});
