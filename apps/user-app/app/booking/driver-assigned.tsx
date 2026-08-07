import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme, glassStyle } from '../../constants/theme';
import { drivers } from '../../constants/mock-data';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function DriverAssignedScreen() {
  const router = useRouter();
  const driver = drivers[0];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a101d', '#050810']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Driver Assigned!</Text>
          <View style={styles.driverInfo}>
            <View style={styles.avatar}><Ionicons name="person" size={30} color="#fff" /></View>
            <View style={styles.details}>
              <Text style={styles.name}>{driver.name}</Text>
              <Text style={styles.rating}><Ionicons name="star" size={14} color="#FFD700" /> {driver.rating}</Text>
            </View>
            <View style={styles.etaBox}><Text style={styles.etaLabel}>ETA</Text><Text style={styles.etaValue}>{driver.eta}</Text></View>
          </View>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleText}>{driver.vehicle}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn}><Ionicons name="call" size={20} color={theme.colors.primary} /></TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}><Ionicons name="chatbubble" size={20} color={theme.colors.primary} /></TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity onPress={() => router.push('/booking/tracking')} style={styles.nextBtnContainer}>
          <LinearGradient colors={['#00CFFF', '#0CF2FF']} style={styles.nextBtn}>
            <Text style={styles.nextBtnText}>TRACK LIVE</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  overlay: { flex: 1, justifyContent: 'flex-end', padding: 20 },
  card: { ...glassStyle, padding: 20, marginBottom: 20 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 22, color: theme.colors.secondary, marginBottom: 20, textAlign: 'center' },
  driverInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  details: { flex: 1 },
  name: { fontFamily: 'Outfit_600SemiBold', fontSize: 18, color: theme.colors.text },
  rating: { fontFamily: 'Inter_400Regular', color: theme.colors.textSecondary, marginTop: 4 },
  etaBox: { alignItems: 'center', backgroundColor: 'rgba(0, 207, 255, 0.1)', padding: 8, borderRadius: 12 },
  etaLabel: { color: theme.colors.textSecondary, fontSize: 12, fontFamily: 'Inter_400Regular' },
  etaValue: { color: theme.colors.primary, fontFamily: 'Outfit_700Bold', fontSize: 16 },
  vehicleInfo: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, marginBottom: 16 },
  vehicleText: { color: theme.colors.textSecondary, textAlign: 'center', fontFamily: 'Inter_500Medium' },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  actionBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0, 207, 255, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.glassBorder },
  nextBtnContainer: { shadowColor: theme.colors.primary, shadowOpacity: 0.8, shadowRadius: 10, marginBottom: 20 },
  nextBtn: { borderRadius: theme.borderRadius.full, paddingVertical: 15, alignItems: 'center' },
  nextBtnText: { color: '#000', fontFamily: 'Outfit_600SemiBold', fontSize: 18 },
});
