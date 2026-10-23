import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { THEME } from '@/constants/theme';
import { BlurView } from 'expo-blur';
import { getDriverById, getDriverDocuments, Driver } from '@omnigo/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAuthenticatedDriverId, logoutDriver } from '@/lib/auth';

const formatPercent = (val: any) => {
  if (val == null || val === '—' || val === '') return '—';
  const s = String(val).replace(/%/g, '').trim();
  if (!s || s === '—') return '—';
  return `${s}%`;
};

const formatPhone = (phoneStr: any) => {
  if (!phoneStr) return '—';
  const clean = String(phoneStr).trim();
  if (clean.startsWith('+91') && clean.length === 13) {
    return `+91 ${clean.slice(3, 8)} ${clean.slice(8)}`;
  }
  return clean;
};

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const DRIVER_ID = getAuthenticatedDriverId();

  useEffect(() => {
    async function loadData() {
      try {
        const d = await getDriverById(DRIVER_ID);
        setDriver(d);
        const docs = await getDriverDocuments(DRIVER_ID);
        setDocuments(docs || []);
      } catch (err) {
        console.error('[Profile] loadData error:', err);
      }
    }
    loadData();
  }, [DRIVER_ID]);

  const displayDriver = (driver || {}) as any;

  const handleLogout = () => {
    logoutDriver();
    router.replace('/(auth)/login');
  };

  const shortId = displayDriver.id
    ? (displayDriver.id.length > 10 ? displayDriver.id.substring(0, 8).toUpperCase() : displayDriver.id)
    : '0000';

  const vehicleMakeModel = (() => {
    const make = displayDriver.vehicle?.make || displayDriver.vehicleDetails?.make;
    const model = displayDriver.vehicle?.model || displayDriver.vehicleDetails?.model;
    const year = displayDriver.vehicle?.year || displayDriver.vehicleDetails?.year;
    const combined = [make, model].filter(Boolean).join(' ').trim();
    if (!combined && !year) return '—';
    return year ? `${combined || 'Vehicle'} (${year})` : combined;
  })();

  const CardWrapper = ({ children, style }: { children: React.ReactNode; style: any }) => {
    if (Platform.OS === 'android') {
      return <View style={[style, styles.cardAndroid]}>{children}</View>;
    }
    return (
      <BlurView intensity={20} tint="dark" style={style}>
        {children}
      </BlurView>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Math.max(insets.top + 10, 50),
          paddingBottom: Math.max(insets.bottom + 140, 160),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Main Profile Card */}
      <CardWrapper style={styles.headerCard}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={THEME.colors.primary} />
          <View style={styles.onlineDot} />
        </View>

        {/* Driver Name */}
        <Text style={styles.name} numberOfLines={1}>
          {displayDriver.name || displayDriver.user?.name || 'Driver Partner'}
        </Text>

        {/* Phone & ID Pills (Clean, no UUID word break) */}
        <View style={styles.phoneIdRow}>
          <View style={styles.infoPill}>
            <Ionicons name="call-outline" size={12} color={THEME.colors.primary} />
            <Text style={styles.infoPillText}>
              {formatPhone(displayDriver.phone || displayDriver.user?.phone)}
            </Text>
          </View>
          <View style={styles.infoPill}>
            <Ionicons name="id-card-outline" size={12} color={THEME.colors.primary} />
            <Text style={styles.infoPillText}>ID: #{shortId}</Text>
          </View>
        </View>

        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color={displayDriver.hasRatings ? '#FFD700' : 'rgba(255,255,255,0.4)'} />
          <Text style={styles.ratingText}>
            {displayDriver.hasRatings && displayDriver.rating
              ? `${Number(displayDriver.rating).toFixed(1)} Rating (${displayDriver.reviewCount || 1} ${displayDriver.reviewCount === 1 ? 'review' : 'reviews'})`
              : 'New Partner · No ratings yet'}
          </Text>
        </View>

        {/* Performance & Operations Metrics Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCell}>
            <Text style={styles.statValue} numberOfLines={1}>
              {displayDriver.totalTrips || displayDriver.performance?.totalTrips || 0}
            </Text>
            <Text style={styles.statLabel} numberOfLines={1}>Trips</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: THEME.colors.primary }]} numberOfLines={1}>
              {formatPercent(displayDriver.acceptanceRate || displayDriver.performance?.acceptanceRate || 100)}
            </Text>
            <Text style={styles.statLabel} numberOfLines={1}>Accepted</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: THEME.colors.success }]} numberOfLines={1}>
              {formatPercent(displayDriver.completionRate != null ? displayDriver.completionRate : '—')}
            </Text>
            <Text style={styles.statLabel} numberOfLines={1}>Completed</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: THEME.colors.danger }]} numberOfLines={1}>
              {formatPercent(displayDriver.cancellationRate != null ? displayDriver.cancellationRate : '—')}
            </Text>
            <Text style={styles.statLabel} numberOfLines={1}>Cancelled</Text>
          </View>
        </View>

        {/* Online Hours Pill */}
        <View style={styles.onlineHoursRow}>
          <Ionicons name="timer-outline" size={14} color={THEME.colors.primary} />
          <Text style={styles.onlineHoursText}>
            Total Online Hours:{' '}
            <Text style={{ color: '#fff', fontFamily: THEME.fonts.inter.bold }}>
              {displayDriver.onlineHours || '0 hrs'}
            </Text>
          </Text>
        </View>

        <Text style={styles.memberSince}>
          Partner since {displayDriver.memberSince || '—'}
        </Text>
      </CardWrapper>

      {/* Vehicle Verification Details */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vehicle & Equipment Status</Text>
        <View style={styles.verifiedPill}>
          <Ionicons name="checkmark-circle" size={13} color={THEME.colors.success} />
          <Text style={styles.verifiedPillText}>
            {displayDriver.vehicle?.verificationStatus || displayDriver.verificationStatus || 'Verified'}
          </Text>
        </View>
      </View>

      <CardWrapper style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Vehicle Type</Text>
          <Text style={styles.infoValue}>
            {displayDriver.vehicle?.type || displayDriver.vehicleDetails?.type || 'Tow Truck'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Make & Model</Text>
          <Text style={styles.infoValue}>{vehicleMakeModel}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Plate Number</Text>
          <Text style={[styles.infoValue, { color: THEME.colors.primary, fontFamily: THEME.fonts.outfit.bold }]}>
            {displayDriver.vehicle?.number || displayDriver.vehicleDetails?.plateNumber || '—'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Field Inspection</Text>
          <Text style={styles.infoValue}>
            {displayDriver.vehicle?.inspectionDate || '—'}
          </Text>
        </View>
      </CardWrapper>

      {/* Document Verification & Expiry Alerts */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Verification & Compliance Documents</Text>
      </View>

      <CardWrapper style={styles.infoCard}>
        {documents.length === 0 ? (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontFamily: THEME.fonts.inter.regular, fontSize: 13 }}>
              No documents found
            </Text>
          </View>
        ) : (
          documents.map((doc, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <View style={styles.divider} />}
              <View style={styles.docRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.docName}>{doc.type || 'Document'}</Text>
                  <View style={styles.docMetaRow}>
                    <Text style={[styles.verifiedText, doc.status !== 'verified' && { color: THEME.colors.warning }]}>
                      {doc.status} {doc.status === 'verified' ? '✓' : '⚠️'}
                    </Text>
                    {doc.expiryDate && (
                      <Text style={styles.docExpiryText}>
                        {' '}· Exp: {new Date(doc.expiryDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity style={styles.updateBtn} activeOpacity={0.7}>
                  <Text style={styles.updateBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            </React.Fragment>
          ))
        )}
      </CardWrapper>

      {/* Bank Account */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Payout Bank Account</Text>
        <View style={styles.verifiedPill}>
          <Ionicons name="shield-checkmark" size={13} color={THEME.colors.success} />
          <Text style={styles.verifiedPillText}>Approved</Text>
        </View>
      </View>

      <CardWrapper style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Account Holder</Text>
          <Text style={styles.infoValue}>
            {displayDriver.bank?.accountName || displayDriver.bankDetails?.accountName || '—'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bank Name</Text>
          <Text style={styles.infoValue}>
            {displayDriver.bank?.bankName || displayDriver.bankDetails?.bankName || '—'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Account Number</Text>
          <Text style={styles.infoValue}>
            {displayDriver.bank?.accountNumber || displayDriver.bankDetails?.accountNumber || '—'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Branch & IFSC</Text>
          <Text style={styles.infoValue}>
            {displayDriver.bank?.ifsc || displayDriver.bankDetails?.ifscCode || '—'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Direct UPI ID</Text>
          <Text style={[styles.infoValue, { color: THEME.colors.primary }]}>
            {displayDriver.bank?.upiId || displayDriver.bankDetails?.upiId || '—'}
          </Text>
        </View>
      </CardWrapper>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color={THEME.colors.danger} style={{ marginRight: 8 }} />
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
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 28,
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
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  cardAndroid: {
    backgroundColor: '#0d1428',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: THEME.colors.success,
    borderWidth: 2,
    borderColor: '#0d1428',
  },
  name: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 22,
    color: THEME.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  phoneIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoPillText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  ratingText: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 12,
    color: '#FFD700',
    marginLeft: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
  },
  statCell: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  statValue: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.text,
  },
  statLabel: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  onlineHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.18)',
    marginTop: 2,
    marginBottom: 8,
  },
  onlineHoursText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.primary,
  },
  memberSince: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.text,
    flex: 1,
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
  infoCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  infoLabel: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  infoValue: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 13,
    color: THEME.colors.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
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
  },
  verifiedText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: THEME.colors.success,
    textTransform: 'capitalize',
  },
  updateBtn: {
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
  },
  updateBtnText: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 12,
    color: THEME.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 4,
  },
  logoutBtn: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 24,
    padding: 16,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 102, 0.4)',
    backgroundColor: 'rgba(255, 51, 102, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 15,
    color: THEME.colors.danger,
    letterSpacing: 1,
  },
});
