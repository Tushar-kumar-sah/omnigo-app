import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

export default function CompleteScreen() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');

  const getRatingLabel = (val: number) => {
    switch(val) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Great';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.successArea}>
          <View style={styles.glowCircle}>
            <Ionicons name="checkmark" size={64} color={THEME.colors.success} />
          </View>
          <Text style={styles.title}>Job Completed!</Text>
        </View>

        <BlurView intensity={20} tint="dark" style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Your Earnings</Text>
          <Text style={styles.earningsAmount}>₹495</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Base Fare</Text>
            <Text style={styles.breakdownValue}>₹250</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Distance (3.1 km)</Text>
            <Text style={styles.breakdownValue}>₹200</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Tip</Text>
            <Text style={styles.breakdownValue}>₹100</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Platform Fee</Text>
            <Text style={[styles.breakdownValue, { color: THEME.colors.danger }]}>-₹55</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={THEME.colors.primary} />
              <Text style={styles.statText}>14 min</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="swap-horizontal-outline" size={16} color={THEME.colors.primary} />
              <Text style={styles.statText}>3.1 km</Text>
            </View>
          </View>
        </BlurView>

        <BlurView intensity={20} tint="dark" style={styles.sectionCard}>
          <View style={styles.inspectionSummary}>
            <Ionicons name="shield-checkmark" size={24} color={THEME.colors.success} />
            <Text style={styles.inspectionText}>Pre-Tow vs Post-Tow — No Issues</Text>
          </View>
        </BlurView>

        <BlurView intensity={20} tint="dark" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Rate Customer</Text>
          <Text style={styles.subtitle}>How was your experience with this customer?</Text>
          
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons 
                  name={star <= rating ? "star" : "star-outline"} 
                  size={36} 
                  color={star <= rating ? THEME.colors.warning : THEME.colors.textMuted} 
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && <Text style={styles.ratingLabel}>{getRatingLabel(rating)}</Text>}
        </BlurView>

        <BlurView intensity={20} tint="dark" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Incident Notes (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Any issues to report?"
            placeholderTextColor={THEME.colors.textMuted}
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />
        </BlurView>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <LinearGradient
            colors={[THEME.colors.primary, THEME.colors.secondary]}
            style={styles.btn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>DONE</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: THEME.spacing.md,
    paddingTop: 64,
  },
  successArea: {
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
  },
  glowCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 255, 151, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.success,
    shadowColor: THEME.colors.success,
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 28,
    color: THEME.colors.success,
  },
  earningsCard: {
    backgroundColor: THEME.colors.glassBg,
    borderColor: THEME.colors.glassBorder,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    alignItems: 'center',
  },
  earningsLabel: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.textSecondary,
    fontSize: 16,
  },
  earningsAmount: {
    fontFamily: THEME.fonts.outfit.bold,
    color: THEME.colors.success,
    fontSize: 48,
    marginVertical: THEME.spacing.xs,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: THEME.colors.glassBorder,
    marginVertical: THEME.spacing.md,
  },
  breakdownRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.xs,
  },
  breakdownLabel: {
    fontFamily: THEME.fonts.inter.regular,
    color: THEME.colors.textSecondary,
    fontSize: 14,
  },
  breakdownValue: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.text,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: THEME.spacing.xl,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  statText: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.primary,
    fontSize: 14,
  },
  sectionCard: {
    backgroundColor: THEME.colors.glassBg,
    borderColor: THEME.colors.glassBorder,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  inspectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
  },
  inspectionText: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.success,
    fontSize: 14,
  },
  sectionTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
  },
  subtitle: {
    fontFamily: THEME.fonts.inter.regular,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.md,
    fontSize: 14,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.xs,
  },
  ratingLabel: {
    fontFamily: THEME.fonts.outfit.medium,
    color: THEME.colors.warning,
    fontSize: 16,
    textAlign: 'center',
    marginTop: THEME.spacing.sm,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    borderRadius: THEME.borderRadius.sm,
    color: THEME.colors.text,
    padding: THEME.spacing.sm,
    fontFamily: THEME.fonts.inter.regular,
    textAlignVertical: 'top',
    height: 80,
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: THEME.spacing.md,
    backgroundColor: THEME.colors.background,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.glassBorder,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
  },
  btnText: {
    color: '#000',
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
  }
});
