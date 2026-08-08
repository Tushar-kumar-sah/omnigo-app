import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { mockIncomingJob } from '../../constants/mock-data';

export default function DropoffScreen() {
  const router = useRouter();
  const [hasSigned, setHasSigned] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  const [cashCollected, setCashCollected] = useState(false);

  const handleSign = () => setHasSigned(true);
  const handleClearSign = () => setHasSigned(false);

  const canComplete = hasSigned && (paymentMethod === 'online' || cashCollected);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Drop-off Confirmation</Text>

        <BlurView intensity={20} tint="dark" style={styles.statusBadge}>
          <Ionicons name="checkmark-done-circle" size={24} color={THEME.colors.success} />
          <Text style={styles.statusText}>Vehicle Unloaded Successfully</Text>
        </BlurView>

        <BlurView intensity={20} tint="dark" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Distance</Text>
              <Text style={styles.summaryValue}>{mockIncomingJob.distance} km</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>14 min</Text>
            </View>
          </View>
        </BlurView>

        <BlurView intensity={20} tint="dark" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Customer Signature</Text>
          <Text style={styles.subtitle}>Customer acknowledges vehicle received</Text>
          
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
            <TouchableOpacity onPress={handleClearSign} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>CLEAR</Text>
            </TouchableOpacity>
          )}
        </BlurView>

        <BlurView intensity={20} tint="dark" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payment</Text>
          
          <View style={styles.paymentTotalRow}>
            <Text style={styles.paymentTotalLabel}>Total Amount</Text>
            <Text style={styles.paymentTotalValue}>₹{mockIncomingJob.price}</Text>
          </View>

          <View style={styles.paymentMethods}>
            <TouchableOpacity 
              style={[styles.methodBtn, paymentMethod === 'online' && styles.methodBtnActive]}
              onPress={() => setPaymentMethod('online')}
            >
              <Text style={[styles.methodText, paymentMethod === 'online' && styles.methodTextActive]}>Online (UPI/Card)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.methodBtn, paymentMethod === 'cash' && styles.methodBtnActive]}
              onPress={() => setPaymentMethod('cash')}
            >
              <Text style={[styles.methodText, paymentMethod === 'cash' && styles.methodTextActive]}>Cash (COD)</Text>
            </TouchableOpacity>
          </View>

          {paymentMethod === 'online' ? (
            <View style={styles.paymentStatus}>
              <Ionicons name="checkmark-circle" size={20} color={THEME.colors.success} />
              <Text style={styles.paymentStatusText}>Payment Received ✓</Text>
            </View>
          ) : (
            <View style={styles.cashSection}>
              <Text style={styles.cashPrompt}>Collect ₹{mockIncomingJob.price} from Customer</Text>
              <TouchableOpacity 
                style={[styles.cashBtn, cashCollected && styles.cashBtnCollected]}
                onPress={() => setCashCollected(!cashCollected)}
              >
                <Text style={styles.cashBtnText}>
                  {cashCollected ? 'CASH COLLECTED' : 'CONFIRM CASH COLLECTION'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

        </BlurView>
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.push('/job/complete')} disabled={!canComplete}>
          <LinearGradient
            colors={canComplete ? [THEME.colors.success, '#00CC7A'] : ['#333', '#222']}
            style={styles.btn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>COMPLETE JOB</Text>
            <Ionicons name="checkmark-done" size={24} color="#000" />
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: 'rgba(0, 255, 151, 0.1)',
    borderWidth: 1,
    borderColor: THEME.colors.success,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  statusText: {
    fontFamily: THEME.fonts.outfit.bold,
    color: THEME.colors.success,
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: THEME.colors.glassBg,
    borderColor: THEME.colors.glassBorder,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: THEME.fonts.inter.regular,
    color: THEME.colors.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    fontFamily: THEME.fonts.outfit.bold,
    color: THEME.colors.primary,
    fontSize: 18,
    marginTop: THEME.spacing.xs,
  },
  sectionCard: {
    backgroundColor: THEME.colors.glassBg,
    borderColor: THEME.colors.glassBorder,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
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
  signatureArea: {
    height: 150,
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
  paymentTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  paymentTotalLabel: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.text,
    fontSize: 16,
  },
  paymentTotalValue: {
    fontFamily: THEME.fonts.outfit.bold,
    color: THEME.colors.success,
    fontSize: 24,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  methodBtn: {
    flex: 1,
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    alignItems: 'center',
  },
  methodBtnActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
  },
  methodText: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.textSecondary,
  },
  methodTextActive: {
    color: THEME.colors.primary,
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: 'rgba(0, 255, 151, 0.1)',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.sm,
    justifyContent: 'center',
  },
  paymentStatusText: {
    fontFamily: THEME.fonts.outfit.medium,
    color: THEME.colors.success,
    fontSize: 16,
  },
  cashSection: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.sm,
    borderColor: THEME.colors.warning,
    borderWidth: 1,
  },
  cashPrompt: {
    fontFamily: THEME.fonts.outfit.medium,
    color: THEME.colors.warning,
    fontSize: 16,
    marginBottom: THEME.spacing.md,
  },
  cashBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.colors.warning,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.full,
  },
  cashBtnCollected: {
    backgroundColor: THEME.colors.warning,
  },
  cashBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    color: THEME.colors.text,
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
