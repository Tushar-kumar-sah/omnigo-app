import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme, glassStyle } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function TrackingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a101d', '#050810']} style={StyleSheet.absoluteFill} />
      <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backBtn}><Ionicons name="close" size={30} color={theme.colors.text} /></TouchableOpacity>
      
      {/* Mock Map Markers */}
      <View style={[styles.dot, { top: '40%', left: '30%', backgroundColor: theme.colors.text }]} />
      <View style={[styles.dot, { top: '55%', left: '60%', backgroundColor: theme.colors.primary, width: 16, height: 16, borderRadius: 8 }]} />

      <View style={styles.panel}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.status}>Driver arriving in</Text>
              <Text style={styles.eta}>3 mins</Text>
            </View>
            <View style={styles.progressCircle}><Ionicons name="car" size={20} color={theme.colors.primary} /></View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  backBtn: { position: 'absolute', top: 60, left: 20, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  dot: { position: 'absolute', width: 12, height: 12, borderRadius: 6, shadowColor: theme.colors.primary, shadowOpacity: 1, shadowRadius: 10 },
  panel: { position: 'absolute', bottom: 40, left: 20, right: 20 },
  card: { ...glassStyle, padding: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  status: { color: theme.colors.textSecondary, fontFamily: 'Inter_400Regular' },
  eta: { color: theme.colors.primary, fontFamily: 'Outfit_700Bold', fontSize: 32 },
  progressCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
});
