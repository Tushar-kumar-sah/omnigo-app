import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme, glassStyle } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SOSScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>EMERGENCY SOS</Text>
      <Text style={styles.desc}>Hold the button for 3 seconds to alert emergency services and your emergency contacts.</Text>

      <View style={styles.sosContainer}>
        <LinearGradient colors={['rgba(255, 51, 102, 0.2)', 'transparent']} style={styles.pulse1} />
        <LinearGradient colors={['rgba(255, 51, 102, 0.5)', 'transparent']} style={styles.pulse2} />
        <TouchableOpacity style={styles.sosButton}>
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}><Ionicons name="shield-outline" size={24} color={theme.colors.primary} /><Text style={styles.actionText}>Police</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}><Ionicons name="medkit-outline" size={24} color={theme.colors.secondary} /><Text style={styles.actionText}>Ambulance</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}><Ionicons name="flame-outline" size={24} color={theme.colors.danger} /><Text style={styles.actionText}>Fire</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 60, paddingHorizontal: 20, alignItems: 'center' },
  header: { fontFamily: 'Outfit_700Bold', fontSize: 28, color: theme.colors.danger, marginBottom: 12, textAlign: 'center' },
  desc: { fontFamily: 'Inter_400Regular', color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 40 },
  sosContainer: { justifyContent: 'center', alignItems: 'center', marginVertical: 40 },
  pulse1: { position: 'absolute', width: 250, height: 250, borderRadius: 125 },
  pulse2: { position: 'absolute', width: 200, height: 200, borderRadius: 100 },
  sosButton: { width: 150, height: 150, borderRadius: 75, backgroundColor: theme.colors.danger, justifyContent: 'center', alignItems: 'center', shadowColor: theme.colors.danger, shadowOpacity: 1, shadowRadius: 20 },
  sosText: { color: '#fff', fontFamily: 'Outfit_700Bold', fontSize: 36 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 40 },
  actionBtn: { ...glassStyle, padding: 16, alignItems: 'center', width: '30%' },
  actionText: { color: theme.colors.text, fontFamily: 'Inter_500Medium', marginTop: 8, fontSize: 12 },
});
