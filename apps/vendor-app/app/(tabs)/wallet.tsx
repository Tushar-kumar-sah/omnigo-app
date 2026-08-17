import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getDriverById, getDriverLedger, createSettlement, Driver } from '@omnigo/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TransactionFilter = 'all' | 'credits' | 'withdrawals';

interface WalletTransaction {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  isCredit: boolean;
  date: string;
  type: 'payout' | 'trip' | 'tip' | 'bonus';
  status: 'Completed' | 'Processing';
  refNo?: string;
}

const WALLET_TRANSACTIONS: WalletTransaction[] = [];

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedAuditTx, setSelectedAuditTx] = useState<WalletTransaction | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('0');

  const [driver, setDriver] = useState<Driver | null>(null);
  const [apiTransactions, setApiTransactions] = useState<any[]>([]);
  // Use mock for audit since we just want to show UI for now
  
  const DRIVER_ID = 'b0000000-0000-0000-0000-000000000001'; // TODO: Replace with authenticated driver ID
  
  useEffect(() => {
    async function loadData() {
      try {
        const d = await getDriverById(DRIVER_ID);
        setDriver(d);
        const txs = await getDriverLedger(DRIVER_ID);
        setApiTransactions(txs);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [DRIVER_ID]);

  const driverAny = driver as any;
  const availableBalance = driverAny?.wallet?.balance ?? driverAny?.earnings?.total ?? 0;
  const pendingBalance = driverAny?.wallet?.pendingBalance ?? 0;
  
  const displayTransactions = apiTransactions.map(tx => ({
    id: tx.id,
    title: tx.type === 'commission' ? 'Platform Fee' : (tx.type === 'payout' ? 'Payout' : 'Trip Payment'),
    subtitle: tx.booking_id ? `Booking ${tx.booking_id.slice(0,8)}` : tx.type,
    amount: tx.type === 'commission' || tx.type === 'payout' ? `-₹${Math.round(tx.amount || tx.commission_amount || 0)}` : `+₹${Math.round(tx.amount || tx.fare_amount || 0)}`,
    isCredit: tx.type !== 'commission' && tx.type !== 'payout',
    date: new Date(tx.created_at || tx.createdAt).toLocaleDateString(),
    type: tx.type as any,
    status: 'Completed' as any,
    refNo: tx.reference || ''
  }));

  const filteredTransactions = displayTransactions.filter(tx => {
    if (filter === 'credits') return tx.isCredit;
    if (filter === 'withdrawals') return !tx.isCredit;
    return true;
  });

  const handleConfirmWithdraw = async () => {
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid transfer amount.');
      return;
    }
    if (amountNum > availableBalance) {
      Alert.alert('Insufficient Balance', 'Requested amount exceeds your available balance.');
      return;
    }

    try {
      await createSettlement({
        driverId: DRIVER_ID,
        driverName: driver?.name || 'Rajesh Kumar',
        bookingIds: [],
        grossAmount: amountNum,
        totalCommissionDeducted: 0,
        netPayable: amountNum
      });
      setShowWithdrawModal(false);
      Alert.alert(
        'Transfer Initiated! ⚡',
        `₹${amountNum.toLocaleString('en-IN')} has been sent to your ${driverAny?.bank_name || driverAny?.bankName || 'Bank'} account (••${(driverAny?.bank_account_number || driverAny?.bankAccountNumber || '0000').slice(-4)}). Funds will reflect within 15 minutes.`,
        [{ text: 'Great' }]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to initiate transfer.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top + 10, 50), paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Driver Wallet</Text>
            <Text style={styles.subtitle}>Payouts, Instant Withdrawals & Bank</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.greenDot} />
            <Text style={styles.statusPillText}>IMPS Instant</Text>
          </View>
        </View>

        {/* Main Wallet Balance Card */}
        <BlurView intensity={25} tint="dark" style={styles.walletCard}>
          <LinearGradient
            colors={['rgba(0, 255, 151, 0.12)', 'rgba(0, 207, 255, 0.05)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          <Text style={styles.walletLabel}>Available Balance</Text>
          <Text style={styles.walletBalanceBig}>
            ₹{availableBalance.toLocaleString('en-IN')}
          </Text>

          {/* Pending Balance Pill */}
          <View style={styles.pendingRow}>
            <Ionicons name="time-outline" size={14} color={THEME.colors.warning} />
            <Text style={styles.pendingText}>
              Pending Clearance: ₹{pendingBalance.toLocaleString('en-IN')} (Trip Verification)
            </Text>
          </View>

          {/* Instant Payout Button */}
          <TouchableOpacity
            style={styles.payoutBtnTouch}
            onPress={() => setShowWithdrawModal(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[THEME.colors.primary, THEME.colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.payoutBtn}
            >
              <Ionicons name="flash" size={16} color="#000" style={{ marginRight: 6 }} />
              <Text style={styles.payoutBtnText}>INSTANT BANK WITHDRAWAL</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Auto-Payout Note */}
          <View style={styles.autoPayoutNote}>
            <Ionicons name="calendar-outline" size={12} color={THEME.colors.textSecondary} />
            <Text style={styles.autoPayoutText}>
              Auto-payout every Tuesday to registered bank (Zero fee)
            </Text>
          </View>
        </BlurView>

        {/* Approved Bank Account Card */}
        <Text style={styles.sectionHeading}>Linked Bank Account</Text>
        <BlurView intensity={20} tint="dark" style={styles.bankCard}>
          <View style={styles.bankHeader}>
            <View style={styles.bankIconCircle}>
              <Ionicons name="business" size={22} color={THEME.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.bankName}>{driverAny?.bank_name || driverAny?.bankName || 'Your Bank'}</Text>
                <View style={styles.approvedBadge}>
                  <Ionicons name="shield-checkmark" size={10} color={THEME.colors.success} />
                  <Text style={styles.approvedText}>Approved</Text>
                </View>
              </View>
              <Text style={styles.bankAccountNo}>
                •••• •••• {(driverAny?.bank_account_number || driverAny?.bankAccountNumber || '0000').slice(-4)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.bankInfoRow}>
            <Text style={styles.bankInfoLabel}>Account Holder</Text>
            <Text style={styles.bankInfoVal}>{driverAny?.name || 'Driver Name'}</Text>
          </View>
          <View style={styles.bankInfoRow}>
            <Text style={styles.bankInfoLabel}>IFSC Code</Text>
            <Text style={styles.bankInfoVal}>{driverAny?.bank_ifsc || driverAny?.bankIfsc || 'IFSC000'}</Text>
          </View>
          <View style={styles.bankInfoRow}>
            <Text style={styles.bankInfoLabel}>Payout Method</Text>
            <Text style={[styles.bankInfoVal, { color: THEME.colors.success }]}>IMPS / Direct NEFT</Text>
          </View>
        </BlurView>

        {/* Transaction History Section */}
        <View style={styles.historyHeaderRow}>
          <View>
            <Text style={styles.sectionHeading}>Transaction History</Text>
            <Text style={{ fontFamily: THEME.fonts.inter.regular, fontSize: 11, color: THEME.colors.textSecondary }}>
              Tap any transaction to view full 7-step audit trail
            </Text>
          </View>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'credits' && styles.filterChipActive]}
              onPress={() => setFilter('credits')}
            >
              <Text style={[styles.filterText, filter === 'credits' && styles.filterTextActive]}>Credits</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'withdrawals' && styles.filterChipActive]}
              onPress={() => setFilter('withdrawals')}
            >
              <Text style={[styles.filterText, filter === 'withdrawals' && styles.filterTextActive]}>Payouts</Text>
            </TouchableOpacity>
          </View>
        </View>

        {filteredTransactions.map(tx => (
          <TouchableOpacity
            key={tx.id}
            activeOpacity={0.8}
            onPress={() => setSelectedAuditTx(tx)}
          >
            <BlurView intensity={20} tint="dark" style={styles.txCard}>
              <View style={styles.txInner}>
                <View
                  style={[
                    styles.txIconCircle,
                    {
                      backgroundColor: tx.isCredit
                        ? 'rgba(0,255,151,0.1)'
                        : 'rgba(0,207,255,0.1)',
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      tx.type === 'payout'
                        ? 'arrow-up-circle'
                        : tx.type === 'tip'
                        ? 'gift'
                        : tx.type === 'bonus'
                        ? 'trophy'
                        : 'car'
                    }
                    size={20}
                    color={tx.isCredit ? THEME.colors.success : THEME.colors.primary}
                  />
                </View>

                <View style={styles.txDetails}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.txTitle} numberOfLines={1}>{tx.title}</Text>
                    <Ionicons name="information-circle-outline" size={13} color={THEME.colors.primary} />
                  </View>
                  <Text style={styles.txSubtitle} numberOfLines={1}>{tx.subtitle}</Text>
                  {tx.refNo && <Text style={styles.txRef}>{tx.refNo}</Text>}
                </View>

                <View style={styles.txAmountCol}>
                  <Text
                    style={[
                      styles.txAmount,
                      { color: tx.isCredit ? THEME.colors.success : THEME.colors.text },
                    ]}
                  >
                    {tx.amount}
                  </Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ─── 7-STEP AUDIT TRAIL MODAL ─── */}
      <Modal
        visible={!!selectedAuditTx}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAuditTx(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedAuditTx(null)} />
          <BlurView intensity={45} tint="dark" style={styles.auditModalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="git-network-outline" size={20} color={THEME.colors.primary} />
                <Text style={styles.modalTitle}>Payment & Settlement Audit</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedAuditTx(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.auditModalSub}>
              End-to-end trace from Customer Payment ➔ OmniGo Gateway ➔ Ledger ➔ Settlement ➔ Bank Payout.
            </Text>

            <ScrollView style={{ maxHeight: 380, paddingVertical: 20 }} showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="document-text-outline" size={32} color="rgba(255,255,255,0.2)" />
                <Text style={{ fontFamily: THEME.fonts.inter.medium, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
                  No audit details available for this transaction.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeAuditBtn}
              onPress={() => setSelectedAuditTx(null)}
            >
              <Text style={styles.closeAuditBtnText}>CLOSE AUDIT LOG</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>

      {/* Instant Withdrawal Modal */}
      <Modal
        visible={showWithdrawModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowWithdrawModal(false)} />
          <BlurView intensity={40} tint="dark" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Instant Bank Transfer</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Transfer funds instantly to your linked bank account via IMPS.
            </Text>

            <View style={styles.amountInputBox}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>

            <Text style={styles.modalBalanceHint}>
              Max available: ₹{availableBalance.toLocaleString('en-IN')}
            </Text>

            {/* Destination Bank Preview */}
            <View style={styles.targetBankRow}>
              <Ionicons name="business-outline" size={16} color={THEME.colors.primary} />
              <Text style={styles.targetBankText}>
                Destination: {driverAny?.bank_name || driverAny?.bankName || 'Your Bank'} (••{(driverAny?.bank_account_number || driverAny?.bankAccountNumber || '0000').slice(-4)})
              </Text>
            </View>

            <TouchableOpacity
              style={styles.confirmWithdrawBtn}
              onPress={handleConfirmWithdraw}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[THEME.colors.success, '#00CC7A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmGradient}
              >
                <Text style={styles.confirmBtnText}>CONFIRM TRANSFER</Text>
                <Ionicons name="checkmark-done" size={18} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>
    </View>
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
    fontSize: 24,
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
    backgroundColor: 'rgba(0, 255, 151, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.25)',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.success,
  },
  statusPillText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 11,
    color: THEME.colors.success,
  },
  walletCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  walletLabel: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  walletBalanceBig: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 38,
    color: THEME.colors.text,
    marginVertical: 6,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 214, 10, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 16,
    gap: 6,
  },
  pendingText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
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
    fontSize: 13,
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
  sectionHeading: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.text,
    marginBottom: 10,
  },
  bankCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  bankName: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 15,
    color: THEME.colors.text,
  },
  bankAccountNo: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 151, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 100,
    gap: 3,
    marginLeft: 6,
  },
  approvedText: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 10,
    color: THEME.colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 10,
  },
  bankInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  bankInfoLabel: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    flex: 1,
  },
  bankInfoVal: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: THEME.colors.text,
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 8,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
  },
  filterText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  filterTextActive: {
    color: THEME.colors.primary,
    fontFamily: THEME.fonts.inter.bold,
  },
  txCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    marginBottom: 8,
    overflow: 'hidden',
  },
  txInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  txIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  txDetails: {
    flex: 1,
    paddingRight: 8,
  },
  txTitle: {
    fontFamily: THEME.fonts.outfit.medium,
    fontSize: 14,
    color: THEME.colors.text,
  },
  txSubtitle: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  txRef: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 2,
  },
  txAmountCol: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  txAmount: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 15,
  },
  txDate: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'rgba(13, 20, 32, 0.95)',
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSub: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 16,
  },
  amountInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 6,
  },
  currencyPrefix: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 24,
    color: THEME.colors.primary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 24,
    color: '#fff',
  },
  modalBalanceHint: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 16,
  },
  targetBankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 207, 255, 0.08)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  targetBankText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: THEME.colors.primary,
    flex: 1,
  },
  confirmWithdrawBtn: {
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
  },
  confirmGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  confirmBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 14,
    color: '#000',
    letterSpacing: 0.5,
  },
  auditModalContent: {
    backgroundColor: 'rgba(13, 20, 32, 0.96)',
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
    padding: 20,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  auditModalSub: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 16,
  },
  pipelineStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: 10,
  },
  pipelineIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  pipelineLabel: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 2,
  },
  pipelineVal: {
    fontFamily: THEME.fonts.outfit.medium,
    fontSize: 13,
    color: THEME.colors.text,
  },
  closeAuditBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
  },
  closeAuditBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 12,
    color: THEME.colors.text,
    letterSpacing: 0.5,
  },
});
