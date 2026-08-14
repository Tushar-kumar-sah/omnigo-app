import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import { mockDriver } from '../../constants/mock-data';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity>
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <BlurView intensity={20} tint="dark" style={styles.headerCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={THEME.colors.primary} />
          <View style={styles.onlineDot} />
        </View>
        <Text style={styles.name}>{mockDriver.name}</Text>
        <Text style={styles.phone}>{mockDriver.phone} · ID: {mockDriver.id}</Text>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{mockDriver.rating} Rating</Text>
        </View>
        
        {/* Performance & Operations Metrics */}
        <View style={styles.statsGrid}>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{mockDriver.totalTrips}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: THEME.colors.primary }]}>{mockDriver.acceptanceRate}%</Text>
            <Text style={styles.statLabel}>Acceptance</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: THEME.colors.success }]}>{mockDriver.completionRate}%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: THEME.colors.danger }]}>{mockDriver.cancellationRate}%</Text>
            <Text style={styles.statLabel}>Cancelled</Text>
          </View>
        </View>

        <View style={styles.onlineHoursRow}>
          <Ionicons name="timer-outline" size={15} color={THEME.colors.primary} />
          <Text style={styles.onlineHoursText}>Total Online Hours: <Text style={{ color: '#fff', fontFamily: THEME.fonts.inter.bold }}>{mockDriver.onlineHours}</Text></Text>
        </View>

        <Text style={styles.memberSince}>Partner since {mockDriver.memberSince}</Text>
      </BlurView>

      {/* Vehicle Verification Details */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vehicle & Equipment Status</Text>
        <View style={styles.verifiedPill}>
          <Ionicons name="checkmark-circle" size={14} color={THEME.colors.success} />
          <Text style={styles.verifiedPillText}>{mockDriver.vehicle.verificationStatus}</Text>
        </View>
      </View>

      <BlurView intensity={20} tint="dark" style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Vehicle Type</Text>
          <Text style={styles.infoValue}>{mockDriver.vehicle.type}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Make & Model</Text>
          <Text style={styles.infoValue}>{mockDriver.vehicle.make} {mockDriver.vehicle.model} ({mockDriver.vehicle.year})</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Plate Number</Text>
          <Text style={[styles.infoValue, { color: THEME.colors.primary, fontFamily: THEME.fonts.outfit.bold }]}>{mockDriver.vehicle.number}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Field Inspection</Text>
          <Text style={styles.infoValue}>{mockDriver.vehicle.inspectionDate}</Text>
        </View>
      </BlurView>

      {/* Document Verification & Expiry Alerts */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Verification & Compliance Documents</Text>
      </View>

      <BlurView intensity={20} tint="dark" style={styles.infoCard}>
        {Object.entries(mockDriver.documents).map(([key, doc], idx) => (
          <React.Fragment key={key}>
            {idx > 0 && <View style={styles.divider} />}
            <View style={styles.docRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.docName}>{doc.name}</Text>
                <View style={styles.docMetaRow}>
                  <Text style={[styles.verifiedText, doc.expiresSoon && { color: THEME.colors.warning }]}>
                    {doc.status} {doc.status === 'Verified' ? '✓' : '⚠️'}
                  </Text>
                  <Text style={styles.docExpiryText}> · Exp: {doc.expiry}</Text>
                </View>
                {doc.expiresSoon && 'daysLeft' in doc && (
                  <View style={styles.expiryAlertBox}>
                    <Ionicons name="warning" size={13} color={THEME.colors.warning} />
                    <Text style={styles.expiryAlertText}>Expiring in {(doc as any).daysLeft} days. Tap update to renew.</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity style={[styles.updateBtn, doc.expiresSoon && { borderColor: THEME.colors.warning, backgroundColor: 'rgba(255, 214, 10, 0.1)' }]}>
                <Text style={[styles.updateBtnText, doc.expiresSoon && { color: THEME.colors.warning }]}>
                  {doc.expiresSoon ? 'Renew' : 'View'}
                </Text>
              </TouchableOpacity>
            </View>
          </React.Fragment>
        ))}
      </BlurView>

      {/* Bank Account */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Payout Bank Account</Text>
        <View style={styles.verifiedPill}>
          <Ionicons name="shield-checkmark" size={14} color={THEME.colors.success} />
          <Text style={styles.verifiedPillText}>Approved</Text>
        </View>
      </View>

      <BlurView intensity={20} tint="dark" style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Account Holder</Text>
          <Text style={styles.infoValue}>{mockDriver.bank.accountName}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bank Name</Text>
          <Text style={styles.infoValue}>{mockDriver.bank.bankName}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Account Number</Text>
          <Text style={styles.infoValue}>{mockDriver.bank.accountNumber}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Branch & IFSC</Text>
          <Text style={styles.infoValue}>{mockDriver.bank.ifsc}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Direct UPI ID</Text>
          <Text style={[styles.infoValue, { color: THEME.colors.primary }]}>{mockDriver.bank.upiId}</Text>
        </View>
      </BlurView>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>LOGOUT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 64,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 32,
    color: THEME.colors.text,
  },
  editText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.primary,
  },
  headerCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: THEME.colors.success,
    borderWidth: 2,
    borderColor: THEME.colors.glassBg,
  },
  name: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 24,
    color: THEME.colors.text,
    marginBottom: 4,
  },
  phone: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 15,
    color: THEME.colors.textSecondary,
    marginBottom: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  ratingText: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 14,
    color: '#FFD700',
    marginLeft: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
  },
  statCell: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statValue: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 17,
    color: THEME.colors.text,
  },
  statLabel: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  memberSince: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.text,
    marginBottom: 12,
    flex: 1,
  },
  infoCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 13,
    color: THEME.colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 13,
    color: THEME.colors.text,
    textAlign: 'right',
    maxWidth: '65%',
    flexShrink: 1,
    marginLeft: 8,
  },
  verifiedText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: THEME.colors.success,
    marginTop: 4,
  },
  updateBtn: {
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    flexShrink: 0,
    marginLeft: 8,
  },
  updateBtnText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: THEME.colors.primary,
  },
  onlineHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
    gap: 6,
  },
  onlineHoursText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 151, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.3)',
    gap: 4,
    flexShrink: 0,
    marginLeft: 8,
  },
  verifiedPillText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 11,
    color: THEME.colors.success,
  },
  docName: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 14,
    color: THEME.colors.text,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  docExpiryText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  expiryAlertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 214, 10, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 6,
    gap: 6,
  },
  expiryAlertText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 11,
    color: THEME.colors.warning,
    flex: 1,
    flexWrap: 'wrap',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 4,
  },
  logoutBtn: {
    marginTop: 8,
    padding: 16,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.danger,
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.danger,
    letterSpacing: 1,
  }
});
