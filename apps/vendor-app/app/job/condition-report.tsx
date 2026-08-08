import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { CONDITION_CHECKLIST } from '../../constants/mock-data';

export default function ConditionReportScreen() {
  const router = useRouter();
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [fuelLevel, setFuelLevel] = useState<string>('Quarter');
  const [hasSigned, setHasSigned] = useState(false);

  const fuelOptions = ['Empty', 'Low', 'Quarter', 'Half', 'Full'];

  const handleToggle = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSign = () => {
    setHasSigned(true);
  };

  const handleClear = () => {
    setHasSigned(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Vehicle Condition Report</Text>
        
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <Text style={styles.sectionTitle}>Checklist</Text>
          {CONDITION_CHECKLIST.filter(i => i.type === 'toggle').map((item) => (
            <View key={item.id} style={styles.checklistItem}>
              <Text style={styles.checklistLabel}>{item.label}</Text>
              <Switch
                value={checklist[item.id] || false}
                onValueChange={() => handleToggle(item.id)}
                trackColor={{ false: '#3e3e3e', true: THEME.colors.success }}
                thumbColor={'#fff'}
              />
            </View>
          ))}

          <View style={styles.divider} />
          
          <Text style={styles.checklistLabel}>Fuel Level</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fuelOptions}>
            {fuelOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.fuelButton,
                  fuelLevel === option && styles.fuelButtonActive
                ]}
                onPress={() => setFuelLevel(option)}
              >
                <Text style={[
                  styles.fuelButtonText,
                  fuelLevel === option && styles.fuelButtonTextActive
                ]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </BlurView>

        <BlurView intensity={20} tint="dark" style={[styles.card, { marginTop: THEME.spacing.md }]}>
          <View style={styles.damageHeader}>
            <Ionicons name="warning-outline" size={20} color={THEME.colors.warning} />
            <Text style={styles.damageText}>Damage reported in pre-inspection</Text>
          </View>
        </BlurView>

        <BlurView intensity={20} tint="dark" style={styles.signatureCard}>
          <Text style={styles.sectionTitle}>Customer Signature</Text>
          <Text style={styles.subtitle}>Please ask the customer to sign below</Text>
          
          <TouchableOpacity 
            style={styles.signatureArea} 
            onPress={handleSign}
            activeOpacity={0.8}
          >
            {hasSigned ? (
              <View style={styles.signedContent}>
                <Ionicons name="checkmark-circle" size={48} color={THEME.colors.success} />
                <Text style={styles.signedText}>Signature Captured</Text>
              </View>
            ) : (
              <Text style={styles.signPrompt}>Tap to sign</Text>
            )}
          </TouchableOpacity>

          {hasSigned && (
            <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>CLEAR</Text>
            </TouchableOpacity>
          )}
        </BlurView>

        <Text style={styles.footerText}>A copy of this report will be sent to the customer's app</Text>
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.push('/job/towing')} disabled={!hasSigned}>
          <LinearGradient
            colors={hasSigned ? [THEME.colors.success, '#00CC7A'] : ['#333', '#222']}
            style={styles.btn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>CONFIRM & PROCEED</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
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
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 28,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.lg,
  },
  card: {
    backgroundColor: THEME.colors.glassBg,
    borderColor: THEME.colors.glassBorder,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  checklistLabel: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 16,
    color: THEME.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.glassBorder,
    marginVertical: THEME.spacing.md,
  },
  fuelOptions: {
    flexDirection: 'row',
    marginTop: THEME.spacing.sm,
    paddingBottom: THEME.spacing.sm,
  },
  fuelButton: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    marginRight: THEME.spacing.sm,
  },
  fuelButtonActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  fuelButtonText: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.textSecondary,
  },
  fuelButtonTextActive: {
    color: '#000',
    fontFamily: THEME.fonts.inter.bold,
  },
  damageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  damageText: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.warning,
    fontSize: 14,
  },
  signatureCard: {
    backgroundColor: THEME.colors.glassBg,
    borderColor: THEME.colors.glassBorder,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginTop: THEME.spacing.md,
    overflow: 'hidden',
  },
  subtitle: {
    fontFamily: THEME.fonts.inter.regular,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.md,
  },
  signatureArea: {
    height: 200,
    backgroundColor: '#fff',
    borderRadius: THEME.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signPrompt: {
    fontFamily: THEME.fonts.outfit.medium,
    color: '#999',
    fontSize: 18,
  },
  signedContent: {
    alignItems: 'center',
  },
  signedText: {
    fontFamily: THEME.fonts.outfit.medium,
    color: THEME.colors.success,
    marginTop: THEME.spacing.sm,
    fontSize: 16,
  },
  clearBtn: {
    marginTop: THEME.spacing.sm,
    alignSelf: 'flex-end',
  },
  clearBtnText: {
    color: THEME.colors.danger,
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 14,
  },
  footerText: {
    fontFamily: THEME.fonts.inter.regular,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginTop: THEME.spacing.lg,
    fontSize: 12,
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
    gap: THEME.spacing.sm,
  },
  btnText: {
    color: '#000',
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
  }
});
