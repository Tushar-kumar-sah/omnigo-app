import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme, glassStyle } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function VehicleDetailsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color={theme.colors.text} /></TouchableOpacity>
      <Text style={styles.title}>Vehicle Details</Text>
      
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput placeholder="Make (e.g. Toyota)" placeholderTextColor={theme.colors.textSecondary} style={styles.input} />
        </View>
        <View style={styles.inputContainer}>
          <TextInput placeholder="Model (e.g. Camry)" placeholderTextColor={theme.colors.textSecondary} style={styles.input} />
        </View>
        <View style={styles.inputContainer}>
          <TextInput placeholder="License Plate" placeholderTextColor={theme.colors.textSecondary} style={styles.input} />
        </View>
      </View>

      <TouchableOpacity onPress={() => router.push('/booking/confirm')} style={styles.nextBtnContainer}>
        <LinearGradient colors={['#00CFFF', '#0CF2FF']} style={styles.nextBtn}>
          <Text style={styles.nextBtnText}>CONTINUE</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 60, paddingHorizontal: 20 },
  backBtn: { marginBottom: 10 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: theme.colors.text, marginBottom: 24 },
  form: { gap: 16 },
  inputContainer: { ...glassStyle, paddingHorizontal: 16 },
  input: { color: theme.colors.text, height: 55, fontFamily: 'Inter_400Regular' },
  nextBtnContainer: { position: 'absolute', bottom: 40, alignSelf: 'center', width: '100%', shadowColor: theme.colors.primary, shadowOpacity: 0.8, shadowRadius: 10 },
  nextBtn: { borderRadius: theme.borderRadius.full, paddingVertical: 15, alignItems: 'center' },
  nextBtnText: { color: '#000', fontFamily: 'Outfit_600SemiBold', fontSize: 18 },
});
