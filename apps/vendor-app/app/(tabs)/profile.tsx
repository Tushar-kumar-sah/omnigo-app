import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { THEME } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { BlurView } from 'expo-blur';
import { getDriverById, getDriverDocuments, Driver } from '@omnigo/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
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
  const { isDark, colors } = useTheme();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const DRIVER_ID = getAuthenticatedDriverId();

  const loadData = useCallback(async () => {
    try {
      const d = await getDriverById(DRIVER_ID);
      setDriver(d);
      const docs = await getDriverDocuments(DRIVER_ID);
      setDocuments(docs || []);
    } catch (err) {
      console.error('[Profile] loadData error:', err);
    }
  }, [DRIVER_ID]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const displayDriver = (driver || {}) as any;

  const handleLogout = () => {
    logoutDriver();
    router.replace('/(auth)/login');
  };

  const shortId = displayDriver.id
    ? (displayDriver.id.length > 10 ? displayDriver.id.substring(0, 8).toUpperCase() : displayDriver.id)
    : '0000';

  const vehicleMakeModel = (() => {
    const make = displayDriver.vehicleDetails?.make || (typeof displayDriver.vehicle === 'object' ? displayDriver.vehicle?.make : null) || displayDriver.vehicleMake || 'Tata';
    const model = displayDriver.vehicleDetails?.model || (typeof displayDriver.vehicle === 'object' ? displayDriver.vehicle?.model : null) || displayDriver.vehicleModel || '407 Heavy Flatbed';
    const year = displayDriver.vehicleDetails?.year || (typeof displayDriver.vehicle === 'object' ? displayDriver.vehicle?.year : null) || displayDriver.vehicleModelYear || '2024';
    const combined = [make, model].filter(Boolean).join(' ').trim();
    if (!combined && !year) return 'Tata 407 Heavy Flatbed';
    return year ? `${combined || 'Tata 407 Heavy Flatbed'} (${year})` : (combined || 'Tata 407 Heavy Flatbed');
  })();

  const CardWrapper = ({ children, style }: { children: React.ReactNode; style: any }) => {
    if (Platform.OS === 'android') {
      return <View style={[style, { backgroundColor: colors.cardAndroid, borderColor: colors.cardBorder }]}>{children}</View>;
    }
    return (
      <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={style}>
        {children}
      </BlurView>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
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
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerSettingsBtn, { backgroundColor: colors.pillBg, borderColor: colors.cardBorder }]}
            activeOpacity={0.7}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-sharp" size={15} color={colors.primary} />
            <Text style={[styles.headerSettingsText, { color: colors.primary }]}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={[styles.editText, { color: colors.primary }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Profile Card */}
      <CardWrapper style={[styles.headerCard, { backgroundColor: colors.glassBg, borderColor: colors.cardBorder }]}>
        {/* Avatar */}
        <View style={[styles.avatar, { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(0, 207, 255, 0.1)' : 'rgba(0, 149, 217, 0.1)' }]}>
          <Ionicons name="person" size={40} color={colors.primary} />
          <View style={styles.onlineDot} />
        </View>

        {/* Driver Name */}
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {displayDriver.name || displayDriver.user?.name || 'Driver Partner'}
        </Text>

        {/* Phone & ID Pills (Clean, no UUID word break) */}
        <View style={styles.phoneIdRow}>
          <View style={[styles.infoPill, { backgroundColor: colors.pillBg, borderColor: colors.divider }]}>
            <Ionicons name="call-outline" size={12} color={colors.primary} />
            <Text style={[styles.infoPillText, { color: colors.textSecondary }]}>
              {formatPhone(displayDriver.phone || displayDriver.user?.phone)}
            </Text>
          </View>
          <View style={[styles.infoPill, { backgroundColor: colors.pillBg, borderColor: colors.divider }]}>
            <Ionicons name="id-card-outline" size={12} color={colors.primary} />
            <Text style={[styles.infoPillText, { color: colors.textSecondary }]}>ID: #{shortId}</Text>
          </View>
        </View>

        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Ionicons
            name="star"
            size={14}
            color={(displayDriver.hasRatings || (displayDriver.rating && Number(displayDriver.rating) > 0)) ? '#FFD700' : 'rgba(255,255,255,0.4)'}
          />
          <Text style={styles.ratingText}>
            {(displayDriver.hasRatings || (displayDriver.rating && Number(displayDriver.rating) > 0)) && Number(displayDriver.rating || 0) > 0
              ? `${Number(displayDriver.rating).toFixed(1)} Rating (${displayDriver.reviewCount || 1} ${displayDriver.reviewCount === 1 ? 'review' : 'reviews'})`
              : 'New Partner · No ratings yet'}
          </Text>
        </View>

        {/* Performance & Operations Metrics Grid */}
        <View style={[styles.statsGrid, { borderTopColor: colors.divider }]}>
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>
              {displayDriver.totalTrips != null ? displayDriver.totalTrips : (displayDriver.performance?.totalTrips ?? 1)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1}>Trips</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />

          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: colors.primary }]} numberOfLines={1}>
              {formatPercent(displayDriver.acceptanceRate || displayDriver.performance?.acceptanceRate || 100)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1}>Accepted</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />

          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: colors.success }]} numberOfLines={1}>
              {formatPercent(displayDriver.completionRate != null ? displayDriver.completionRate : 100)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1}>Completed</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />

          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: colors.danger }]} numberOfLines={1}>
              {formatPercent(displayDriver.cancellationRate != null ? displayDriver.cancellationRate : 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1}>Cancelled</Text>
          </View>
        </View>

        {/* Online Hours Pill */}
        <View style={[styles.onlineHoursRow, { backgroundColor: isDark ? 'rgba(0, 207, 255, 0.08)' : 'rgba(0, 149, 217, 0.08)', borderColor: colors.glassBorder }]}>
          <Ionicons name="timer-outline" size={14} color={colors.primary} />
          <Text style={[styles.onlineHoursText, { color: colors.primary }]}>
            Total Online Hours:{' '}
            <Text style={{ color: colors.text, fontFamily: THEME.fonts.inter.bold }}>
              {displayDriver.onlineHours && displayDriver.onlineHours !== '0 hrs' ? displayDriver.onlineHours : '14.5 hrs'}
            </Text>
          </Text>
        </View>

        <Text style={[styles.memberSince, { color: colors.textSecondary }]}>
          Partner since {displayDriver.memberSince || (displayDriver.createdAt ? new Date(displayDriver.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Oct 2026')}
        </Text>
      </CardWrapper>

      {/* Vehicle Verification Details */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle & Equipment Status</Text>
        <View style={styles.verifiedPill}>
          <Ionicons name="checkmark-circle" size={13} color={THEME.colors.success} />
          <Text style={styles.verifiedPillText}>
            {displayDriver.vehicleDetails?.verificationStatus || displayDriver.vehicle?.verificationStatus || displayDriver.verificationStatus || 'Verified'}
          </Text>
        </View>
      </View>

      <CardWrapper style={[styles.infoCard, { backgroundColor: colors.glassBg, borderColor: colors.cardBorder }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Vehicle Type</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {displayDriver.vehicleDetails?.type || (typeof displayDriver.vehicle === 'object' ? displayDriver.vehicle?.type : null) || displayDriver.vehicleType || 'Flatbed Tow Truck'}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Make & Model</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{vehicleMakeModel}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Plate Number</Text>
          <Text style={[styles.infoValue, { color: colors.primary, fontFamily: THEME.fonts.outfit.bold }]}>
            {displayDriver.vehicleNumber || displayDriver.vehiclePlate || displayDriver.vehicleDetails?.plateNumber || (typeof displayDriver.vehicle === 'object' ? displayDriver.vehicle?.number : null) || 'MH 12 AB 1234'}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Last Field Inspection</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {displayDriver.vehicleDetails?.inspectionDate || (typeof displayDriver.vehicle === 'object' ? displayDriver.vehicle?.inspectionDate : null) || displayDriver.inspectionDate || '15 Oct 2026'}
          </Text>
        </View>
      </CardWrapper>

      {/* Document Verification & Expiry Alerts */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Verification & Compliance Documents</Text>
      </View>

      <CardWrapper style={[styles.infoCard, { backgroundColor: colors.glassBg, borderColor: colors.cardBorder }]}>
        {documents.length === 0 ? (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontFamily: THEME.fonts.inter.regular, fontSize: 13 }}>
              No documents found
            </Text>
          </View>
        ) : (
          documents.map((doc, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
              <View style={styles.docRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.docName, { color: colors.text }]}>{doc.name || doc.type || doc.doc_name || 'Document'}</Text>
                  <View style={styles.docMetaRow}>
                    <Text style={[styles.verifiedText, (doc.status || 'verified').toLowerCase() !== 'verified' && { color: THEME.colors.warning }]}>
                      {(doc.status ? doc.status.charAt(0).toUpperCase() + doc.status.slice(1) : 'Verified')} {(doc.status || 'verified').toLowerCase() === 'verified' ? '✓' : '⚠️'}
                    </Text>
                    {(doc.expiryDate || doc.expiry_date) && (
                      <Text style={[styles.docExpiryText, { color: colors.textSecondary }]}>
                        {' '}· Exp: {new Date(doc.expiryDate || doc.expiry_date).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity style={[styles.updateBtn, { backgroundColor: isDark ? 'rgba(0, 207, 255, 0.15)' : 'rgba(0, 149, 217, 0.15)', borderColor: colors.glassBorder }]} activeOpacity={0.7}>
                  <Text style={[styles.updateBtnText, { color: colors.primary }]}>View</Text>
                </TouchableOpacity>
              </View>
            </React.Fragment>
          ))
        )}
      </CardWrapper>

      {/* Bank Account */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payout Bank Account</Text>
        <View style={styles.verifiedPill}>
          <Ionicons name="shield-checkmark" size={13} color={THEME.colors.success} />
          <Text style={styles.verifiedPillText}>Approved</Text>
        </View>
      </View>

      <CardWrapper style={[styles.infoCard, { backgroundColor: colors.glassBg, borderColor: colors.cardBorder }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Account Holder</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {displayDriver.bank?.accountName || displayDriver.bankDetails?.accountName || displayDriver.bankAccountHolder || displayDriver.name || 'Tushar'}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Bank Name</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {displayDriver.bank?.bankName || displayDriver.bankDetails?.bankName || displayDriver.bankName || 'HDFC Bank'}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Account Number</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {displayDriver.bank?.accountNumber || displayDriver.bankDetails?.accountNumber || displayDriver.bankAccount || '•••• •••• 4108'}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Branch & IFSC</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {displayDriver.bank?.ifsc || displayDriver.bankDetails?.ifscCode || displayDriver.ifsc || 'HDFC0002410'}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Direct UPI ID</Text>
          <Text style={[styles.infoValue, { color: colors.primary }]}>
            {displayDriver.bank?.upiId || displayDriver.bankDetails?.upiId || displayDriver.bankUpi || '8100264108@paytm'}
          </Text>
        </View>
      </CardWrapper>

      {/* Settings & Preferences */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings & Preferences</Text>
      </View>

      <CardWrapper style={[styles.infoCard, { backgroundColor: colors.glassBg, borderColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={styles.settingsLinkRow}
          activeOpacity={0.7}
          onPress={() => router.push('/settings')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="settings-outline" size={18} color={colors.primary} />
            <Text style={[styles.settingsLinkText, { color: colors.text }]}>Preferences, Sound & Language</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  headerSettingsText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 13,
  },
  openSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  openSettingsText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
  },
  themeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  themeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeTitleText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 15,
  },
  themeSubtitleText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    marginTop: 2,
  },
  themeSelectorContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    gap: 4,
  },
  themeOptionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
  },
  themeOptionPillActive: {
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  themeOptionLabel: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 13,
  },
  themeOptionLabelActive: {
    fontFamily: THEME.fonts.inter.bold,
  },
  settingsLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  settingsLinkText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 13,
  },
});
