import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { mockEarnings, mockDriver, mockPayoutHistory, mockJobs } from '../../constants/mock-data';

export default function EarningsScreen() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [activeTab, setActiveTab] = useState<'overview' | 'wallet' | 'payouts'>('overview');

  const currentData = mockEarnings[period];

  const periods = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ] as const;

  const handleInstantPayout = () => {
    Alert.alert(
      'Instant Payout',
      `Transfer ${mockDriver.wallet.availableBalance} to ${mockDriver.bank.bankName} (${mockDriver.bank.accountNumber})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm Transfer', onPress: () => Alert.alert('Success', 'Transfer initiated! Funds will reflect in 15 minutes.') }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Earnings & Wallet</Text>
          <Text style={styles.subtitle}>Track revenue, commissions & bank payouts</Text>
        </View>
        <View style={styles.statusPill}>
          <View style={styles.greenDot} />
          <Text style={styles.statusPillText}>Payouts Active</Text>
        </View>
      </View>

      {/* Top Tab Switcher: Overview | Wallet | Payout History */}
      <View style={styles.topTabs}>
        <TouchableOpacity
          style={[styles.topTab, activeTab === 'overview' && styles.topTabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons name="stats-chart" size={15} color={activeTab === 'overview' ? '#000' : THEME.colors.textSecondary} />
          <Text style={[styles.topTabText, activeTab === 'overview' && styles.topTabTextActive]}>Overview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topTab, activeTab === 'wallet' && styles.topTabActive]}
          onPress={() => setActiveTab('wallet')}
        >
          <Ionicons name="wallet" size={15} color={activeTab === 'wallet' ? '#000' : THEME.colors.textSecondary} />
          <Text style={[styles.topTabText, activeTab === 'wallet' && styles.topTabTextActive]}>Wallet & Bank</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topTab, activeTab === 'payouts' && styles.topTabActive]}
          onPress={() => setActiveTab('payouts')}
        >
          <Ionicons name="receipt" size={15} color={activeTab === 'payouts' ? '#000' : THEME.colors.textSecondary} />
          <Text style={[styles.topTabText, activeTab === 'payouts' && styles.topTabTextActive]}>Payout Logs</Text>
        </TouchableOpacity>
      </View>

      {/* ─── SECTION 1: OVERVIEW TAB ───────────────────────── */}
      {activeTab === 'overview' && (
        <>
          {/* Period selector */}
          <View style={styles.periodSelector}>
            {periods.map((p) => {
              const isActive = period === p.id;
              return (
                <TouchableOpacity 
                  key={p.id} 
                  onPress={() => setPeriod(p.id)}
                  style={[styles.periodPill, isActive ? styles.periodPillActive : null]}
                >
                  <Text style={[styles.periodText, isActive ? styles.periodTextActive : null]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Main Net Earnings Card */}
          <BlurView intensity={20} tint="dark" style={styles.mainCard}>
            <LinearGradient
              colors={['rgba(0, 255, 151, 0.12)', 'rgba(0, 207, 255, 0.04)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={styles.periodLabel}>{periods.find(p => p.id === period)?.label} Net Earnings</Text>
            <Text style={styles.amountText}>{currentData.amount}</Text>
            
            {/* Operational Metrics Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Ionicons name="car-sport" size={18} color={THEME.colors.primary} />
                <Text style={styles.statBoxValue}>{currentData.trips}</Text>
                <Text style={styles.statBoxLabel}>Trips</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Ionicons name="time" size={18} color={THEME.colors.secondary} />
                <Text style={styles.statBoxValue}>{currentData.online}</Text>
                <Text style={styles.statBoxLabel}>Online Hrs</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Ionicons name="speedometer" size={18} color={THEME.colors.success} />
                <Text style={styles.statBoxValue}>{currentData.distance}</Text>
                <Text style={styles.statBoxLabel}>Distance</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Ionicons name="checkmark-done" size={18} color={THEME.colors.primary} />
                <Text style={styles.statBoxValue}>{mockDriver.acceptanceRate}%</Text>
                <Text style={styles.statBoxLabel}>Acceptance</Text>
              </View>
            </View>
          </BlurView>

          {/* Transparent Commission & Fare Summary Box */}
          <Text style={styles.sectionTitle}>Commission & Fare Breakdown</Text>
          <BlurView intensity={20} tint="dark" style={styles.breakdownCard}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Gross Customer Payments</Text>
              <Text style={styles.feeValue}>₹{period === 'today' ? '1,580' : period === 'week' ? '9,720' : '38,000'}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>OmniGo Platform Commission (10%)</Text>
              <Text style={[styles.feeValue, { color: THEME.colors.danger }]}>-₹{period === 'today' ? '155' : period === 'week' ? '970' : '3,800'}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Customer Tips Received (100% to Driver)</Text>
              <Text style={[styles.feeValue, { color: THEME.colors.success }]}>+₹{period === 'today' ? '100' : period === 'week' ? '450' : '1,800'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.feeRow}>
              <Text style={[styles.feeLabel, { fontFamily: THEME.fonts.outfit.bold, color: '#fff' }]}>Your Take-Home Earnings</Text>
              <Text style={[styles.feeValue, { fontFamily: THEME.fonts.outfit.bold, color: THEME.colors.success, fontSize: 16 }]}>{currentData.amount}</Text>
            </View>
          </BlurView>

          {/* Recent Trip Earnings List */}
          <Text style={styles.sectionTitle}>Recent Trip Earnings</Text>
          {mockJobs.map((job) => (
            <BlurView key={job.id} intensity={20} tint="dark" style={styles.tripCard}>
              <View style={styles.tripCardHeader}>
                <View style={styles.tripLeft}>
                  <View style={styles.towIconCircle}>
                    <MaterialCommunityIcons name="tow-truck" size={20} color={THEME.colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.tripTitle}>{job.vehicleMake} {job.vehicleModel} · {job.vehicleType}</Text>
                    <Text style={styles.tripSubtitle}>{job.date} · {job.distance}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.tripEarningsText}>{job.driverEarnings}</Text>
                  <Text style={styles.tripGrossText}>Fare: {job.price}</Text>
                </View>
              </View>

              <View style={styles.tripDetailsPill}>
                <Text style={styles.tripPillText}>Customer: {job.price}  |  OmniGo Fee: -{job.platformFee}  |  Driver Net: {job.driverEarnings}</Text>
              </View>
            </BlurView>
          ))}
        </>
      )}

      {/* ─── SECTION 2: WALLET & BANK TAB ──────────────────── */}
      {activeTab === 'wallet' && (
        <>
          <BlurView intensity={20} tint="dark" style={styles.walletCard}>
            <LinearGradient
              colors={['rgba(0, 207, 255, 0.15)', 'rgba(0, 255, 151, 0.08)', 'transparent']}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={styles.walletLabel}>Available Wallet Balance</Text>
            <Text style={styles.walletBalanceBig}>{mockDriver.wallet.availableBalance}</Text>
            
            <View style={styles.pendingRow}>
              <Ionicons name="hourglass-outline" size={15} color={THEME.colors.warning} />
              <Text style={styles.pendingText}>Pending Balance: <Text style={{ color: '#fff', fontFamily: THEME.fonts.inter.bold }}>{mockDriver.wallet.pendingBalance}</Text> (settles in 2h)</Text>
            </View>

            <TouchableOpacity style={styles.payoutBtnTouch} onPress={handleInstantPayout} activeOpacity={0.85}>
              <LinearGradient colors={[THEME.colors.primary, THEME.colors.secondary]} style={styles.payoutBtn}>
                <Ionicons name="flash" size={16} color="#000" style={{ marginRight: 6 }} />
                <Text style={styles.payoutBtnText}>INSTANT BANK PAYOUT</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.autoPayoutNote}>
              <Ionicons name="information-circle-outline" size={14} color={THEME.colors.textSecondary} />
              <Text style={styles.autoPayoutText}>Auto-transferred to your registered bank every Monday.</Text>
            </View>
          </BlurView>

          <Text style={styles.sectionTitle}>Approved Bank Account</Text>
          <BlurView intensity={20} tint="dark" style={styles.bankCard}>
            <View style={styles.bankHeader}>
              <View style={styles.bankIconCircle}>
                <Ionicons name="business" size={22} color={THEME.colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.bankName}>{mockDriver.bank.bankName}</Text>
                <Text style={styles.bankAccountNo}>{mockDriver.bank.accountNumber}</Text>
              </View>
              <View style={styles.approvedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={THEME.colors.success} />
                <Text style={styles.approvedText}>Approved</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>Account Holder</Text>
              <Text style={styles.bankInfoVal}>{mockDriver.bank.accountName}</Text>
            </View>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>IFSC Code</Text>
              <Text style={styles.bankInfoVal}>{mockDriver.bank.ifsc}</Text>
            </View>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>Branch</Text>
              <Text style={styles.bankInfoVal}>{mockDriver.bank.branch}</Text>
            </View>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>Direct UPI ID</Text>
              <Text style={[styles.bankInfoVal, { color: THEME.colors.primary }]}>{mockDriver.bank.upiId}</Text>
            </View>
          </BlurView>
        </>
      )}

      {/* ─── SECTION 3: PAYOUT LOGS TAB ─────────────────────── */}
      {activeTab === 'payouts' && (
        <>
          <Text style={styles.sectionTitle}>Completed Bank Transfers</Text>
          <Text style={styles.sectionSub}>All funds are deposited directly to your verified bank account.</Text>

          {mockPayoutHistory.map((payout) => (
            <BlurView key={payout.id} intensity={20} tint="dark" style={styles.payoutCard}>
              <View style={styles.payoutTop}>
                <View style={styles.payoutIconCircle}>
                  <Ionicons name="arrow-down-circle" size={24} color={THEME.colors.success} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.payoutAmount}>{payout.amount}</Text>
                  <Text style={styles.payoutDate}>{payout.date}</Text>
                </View>
                <View style={styles.payoutStatusBadge}>
                  <Text style={styles.payoutStatusText}>{payout.status}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.payoutMetaRow}>
                <Text style={styles.payoutMetaLabel}>Ref UTR: {payout.utr}</Text>
                <Text style={styles.payoutMetaBank}>{payout.bank}</Text>
              </View>
            </BlurView>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 54,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 26,
    color: THEME.colors.text,
  },
  subtitle: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 151, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    gap: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.success,
  },
  statusPillText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 10,
    color: THEME.colors.success,
  },
  topTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: THEME.borderRadius.full,
    padding: 3,
    marginBottom: 20,
    gap: 4,
  },
  topTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.full,
    gap: 5,
  },
  topTabActive: {
    backgroundColor: THEME.colors.primary,
  },
  topTabText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  topTabTextActive: {
    color: '#000',
    fontFamily: THEME.fonts.outfit.bold,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: THEME.borderRadius.full,
    padding: 3,
  },
  periodPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.full,
  },
  periodPillActive: {
    backgroundColor: 'rgba(0, 207, 255, 0.2)',
  },
  periodText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  periodTextActive: {
    color: THEME.colors.primary,
    fontFamily: THEME.fonts.inter.bold,
  },
  mainCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  periodLabel: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginBottom: 4,
  },
  amountText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 42,
    color: THEME.colors.success,
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statBoxValue: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 15,
    color: THEME.colors.text,
    marginTop: 4,
  },
  statBoxLabel: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.text,
    marginBottom: 10,
    marginTop: 6,
  },
  sectionSub: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 14,
    marginTop: -4,
  },
  breakdownCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  feeLabel: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 13,
    color: THEME.colors.textSecondary,
    flex: 1,
    paddingRight: 8,
  },
  feeValue: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 13,
    color: THEME.colors.text,
    textAlign: 'right',
    flexShrink: 0,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 8,
  },
  tripCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  towIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,207,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  tripTitle: {
    fontFamily: THEME.fonts.outfit.medium,
    fontSize: 14,
    color: THEME.colors.text,
    flexShrink: 1,
  },
  tripSubtitle: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    flexShrink: 1,
  },
  tripEarningsText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.success,
    textAlign: 'right',
  },
  tripGrossText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.textSecondary,
    textAlign: 'right',
  },
  tripDetailsPill: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 6,
    marginTop: 8,
  },
  tripPillText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  walletCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,207,255,0.3)',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  walletLabel: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  walletBalanceBig: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 40,
    color: THEME.colors.text,
    marginVertical: 6,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 214, 10, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 16,
    gap: 6,
  },
  pendingText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.warning,
  },
  payoutBtnTouch: {
    width: '100%',
    borderRadius: THEME.borderRadius.full,
    overflow: 'hidden',
    marginBottom: 12,
  },
  payoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  payoutBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 14,
    color: '#000',
    letterSpacing: 0.5,
  },
  autoPayoutNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  autoPayoutText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  bankCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,207,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  bankName: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.text,
  },
  bankAccountNo: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,151,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    gap: 4,
    flexShrink: 0,
    marginLeft: 8,
  },
  approvedText: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 11,
    color: THEME.colors.success,
  },
  bankInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  bankInfoLabel: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 13,
    color: THEME.colors.textSecondary,
    flex: 1,
  },
  bankInfoVal: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 13,
    color: THEME.colors.text,
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 8,
  },
  payoutCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  payoutTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payoutIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,255,151,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginRight: 12,
  },
  payoutAmount: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.success,
  },
  payoutDate: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  payoutStatusBadge: {
    backgroundColor: 'rgba(0,255,151,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(0,255,151,0.25)',
    flexShrink: 0,
    marginLeft: 8,
  },
  payoutStatusText: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 11,
    color: THEME.colors.success,
  },
  payoutMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  payoutMetaLabel: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.textSecondary,
    flexShrink: 1,
  },
  payoutMetaBank: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.textSecondary,
    flexShrink: 1,
  },
});
