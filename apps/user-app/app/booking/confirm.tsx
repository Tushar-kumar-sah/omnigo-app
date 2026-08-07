import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme, glassStyle } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ConfirmScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color={theme.colors.text} /></TouchableOpacity>
      <Text style={styles.title}>Confirm Booking</Text>
      
      <View style={styles.card}>
        <View style={styles.row}><Text style={styles.label}>Service:</Text><Text style={styles.value}>Flatbed Tow</Text></View>
        <View style={styles.row}><Text style={styles.label}>Pickup:</Text><Text style={styles.value}>Downtown 5th Ave</Text></View>
        <View style={styles.row}><Text style={styles.label}>Dropoff:</Text><Text style={styles.value}>Auto Shop North</Text></View>
        <View style={styles.divider} />
        <View style={styles.row}><Text style={styles.totalLabel}>Total:</Text><Text style={styles.totalValue}>₹2500</Text></View>
      </View>

      <TouchableOpacity onPress={() => router.push('/booking/searching')} style={styles.nextBtnContainer}>
        <LinearGradient colors={['#00FF97', '#0CF2FF']} style={styles.nextBtn}>
          <Text style={styles.nextBtnText}>CONFIRM & FIND DRIVER</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 60, paddingHorizontal: 20 },
  backBtn: { marginBottom: 10 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: theme.colors.text, marginBottom: 24 },
  card: { ...glassStyle, padding: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { color: theme.colors.textSecondary, fontFamily: 'Inter_400Regular' },
  value: { color: theme.colors.text, fontFamily: 'Inter_500Medium' },
  divider: { height: 1, backgroundColor: theme.colors.glassBorder, marginVertical: 12 },
  totalLabel: { color: theme.colors.text, fontFamily: 'Outfit_600SemiBold', fontSize: 18 },
  totalValue: { color: theme.colors.primary, fontFamily: 'Outfit_700Bold', fontSize: 24 },
  nextBtnContainer: { position: 'absolute', bottom: 40, alignSelf: 'center', width: '100%', shadowColor: theme.colors.secondary, shadowOpacity: 0.8, shadowRadius: 10 },
  nextBtn: { borderRadius: theme.borderRadius.full, paddingVertical: 15, alignItems: 'center' },
  nextBtnText: { color: '#000', fontFamily: 'Outfit_600SemiBold', fontSize: 18 },
});
