import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SearchingScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/booking/driver-assigned');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.radarContainer}>
        <LinearGradient colors={['rgba(0, 207, 255, 0.1)', 'transparent']} style={styles.ring1} />
        <LinearGradient colors={['rgba(0, 207, 255, 0.3)', 'transparent']} style={styles.ring2} />
        <View style={styles.centerIcon}><Ionicons name="car" size={40} color={theme.colors.primary} /></View>
      </View>
      <Text style={styles.text}>Searching for nearby partners...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' },
  radarContainer: { justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  ring1: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
  ring2: { position: 'absolute', width: 150, height: 150, borderRadius: 75 },
  centerIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.glassBg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.primary },
  text: { color: theme.colors.text, fontFamily: 'Inter_500Medium', fontSize: 18 },
});
