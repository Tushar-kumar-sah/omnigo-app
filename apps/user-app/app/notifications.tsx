import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.desc}>No new notifications.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 60, paddingHorizontal: 20 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 28, color: theme.colors.text, marginBottom: 20 },
  desc: { fontFamily: 'Inter_400Regular', color: theme.colors.textSecondary, fontSize: 16 },
});
