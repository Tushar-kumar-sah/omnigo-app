import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme, glassStyle } from '../../constants/theme';
import { vehicleTypes } from '../../constants/mock-data';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SelectVehicleScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState(vehicleTypes[0].id);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color={theme.colors.text} /></TouchableOpacity>
      <Text style={styles.title}>Select Tow Type</Text>
      
      <View style={styles.imageArea}>
        <Ionicons name="car" size={100} color={theme.colors.primary} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
        {vehicleTypes.map(v => {
          const isSelected = selected === v.id;
          return (
            <TouchableOpacity key={v.id} onPress={() => setSelected(v.id)} style={[styles.card, isSelected && styles.cardSelected]}>
              <Ionicons name={v.icon as any} size={40} color={isSelected ? theme.colors.primary : theme.colors.textSecondary} />
              <Text style={[styles.name, isSelected && { color: theme.colors.primary }]}>{v.name}</Text>
              <Text style={styles.price}>₹{v.price}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity onPress={() => router.push('/booking/vehicle-details')} style={styles.nextBtnContainer}>
        <LinearGradient colors={['#00FF97', '#0CF2FF']} style={styles.nextBtn}>
          <Text style={styles.nextBtnText}>NEXT</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 60 },
  backBtn: { paddingHorizontal: 20, marginBottom: 10 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: theme.colors.text, paddingHorizontal: 20 },
  imageArea: { height: 200, justifyContent: 'center', alignItems: 'center', marginVertical: 20 },
  carousel: { paddingHorizontal: 20 },
  card: { ...glassStyle, padding: 20, width: 140, height: 160, marginRight: 16, alignItems: 'center', justifyContent: 'center' },
  cardSelected: { borderColor: theme.colors.primary, backgroundColor: 'rgba(0, 207, 255, 0.1)' },
  name: { fontFamily: 'Inter_500Medium', color: theme.colors.text, marginTop: 12, textAlign: 'center' },
  price: { fontFamily: 'Outfit_600SemiBold', color: theme.colors.text, marginTop: 8 },
  nextBtnContainer: { position: 'absolute', bottom: 40, alignSelf: 'center', width: '80%', shadowColor: theme.colors.secondary, shadowOpacity: 0.8, shadowRadius: 10 },
  nextBtn: { borderRadius: theme.borderRadius.full, paddingVertical: 15, alignItems: 'center' },
  nextBtnText: { color: '#000', fontFamily: 'Outfit_600SemiBold', fontSize: 18 },
});
