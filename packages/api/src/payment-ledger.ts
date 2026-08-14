import {
  PaymentGatewayTransaction,
  OmniGoLedgerEntry,
  PartnerSettlement,
  PayoutRecord,
  PaymentAuditTrail,
  PaymentMethod,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// 🌟 1. FARE & COMMISSION SPLIT ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export interface FareSplitResult {
  grossCustomerFare: number;
  omniGoCommissionRate: number;
  omniGoCommissionAmount: number;
  gstOnCommission: number;
  partnerGrossEarning: number;
  customerTip: number;
  partnerNetEarning: number;
}

/**
 * Calculates double-entry split: Customer Gross -> OmniGo Commission -> Partner Net + 100% Tip
 */
export function calculateFareSplit(
  customerFare: number,
  tip: number = 0,
  commissionRate: number = 0.10 // 10% standard OmniGo commission
): FareSplitResult {
  const commission = Math.round(customerFare * commissionRate);
  const gst = Math.round(commission * 0.18); // 18% GST on platform service fee
  const partnerFareShare = customerFare - commission;
  const partnerNet = partnerFareShare + tip; // Tips are 100% passed through with zero deductions

  return {
    grossCustomerFare: customerFare,
    omniGoCommissionRate: commissionRate,
    omniGoCommissionAmount: commission,
    gstOnCommission: gst,
    partnerGrossEarning: partnerFareShare,
    customerTip: tip,
    partnerNetEarning: partnerNet,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 🌟 2. IN-MEMORY ENTERPRISE AUDIT TRAIL DATABASE
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_PAYMENT_TRANSACTIONS: PaymentGatewayTransaction[] = [
  {
    paymentId: 'PAY-OMNI-7821',
    gatewayOrderId: 'order_omni_881921',
    bookingId: 'JOB-7821',
    customerId: 'USR-101',
    customerName: 'Rahul Sharma',
    amount: 850,
    currency: 'INR',
    method: 'upi',
    gatewayName: 'OmniGo Escrow Gateway',
    gatewayRef: 'UPI-REF-9021849102',
    status: 'captured',
    paidAt: '2026-08-15 14:30:00',
  },
  {
    paymentId: 'PAY-OMNI-7802',
    gatewayOrderId: 'order_omni_881922',
    bookingId: 'JOB-7802',
    customerId: 'USR-102',
    customerName: 'Priya Sharma',
    amount: 1200,
    currency: 'INR',
    method: 'card',
    gatewayName: 'OmniGo Escrow Gateway',
    gatewayRef: 'CARD-AUTH-88219401',
    status: 'captured',
    paidAt: '2026-08-14 10:15:00',
  },
  {
    paymentId: 'PAY-OMNI-7798',
    gatewayOrderId: 'order_omni_881923',
    bookingId: 'JOB-7798',
    customerId: 'USR-103',
    customerName: 'Sneha Patil',
    amount: 950,
    currency: 'INR',
    method: 'upi',
    gatewayName: 'OmniGo Escrow Gateway',
    gatewayRef: 'UPI-REF-7718293019',
    status: 'captured',
    paidAt: '2026-08-13 16:45:00',
  },
  {
    paymentId: 'PAY-OMNI-7750',
    gatewayOrderId: 'order_omni_881924',
    bookingId: 'JOB-7750',
    customerId: 'USR-104',
    customerName: 'Amit Verma',
    amount: 2400,
    currency: 'INR',
    method: 'card',
    gatewayName: 'OmniGo Escrow Gateway',
    gatewayRef: 'CARD-AUTH-99018274',
    status: 'captured',
    paidAt: '2026-08-12 11:20:00',
  },
  {
    paymentId: 'PAY-OMNI-7710',
    gatewayOrderId: 'order_omni_881925',
    bookingId: 'JOB-7710',
    customerId: 'USR-105',
    customerName: 'Karan Mehra',
    amount: 3200,
    currency: 'INR',
    method: 'upi',
    gatewayName: 'OmniGo Escrow Gateway',
    gatewayRef: 'UPI-REF-5591827364',
    status: 'captured',
    paidAt: '2026-08-11 18:10:00',
  },
];

export const MOCK_LEDGER_ENTRIES: OmniGoLedgerEntry[] = [
  {
    ledgerId: 'LEDGER-2026-0091',
    bookingId: 'JOB-7821',
    paymentId: 'PAY-OMNI-7821',
    partnerId: 'DRV-2024-0847',
    partnerName: 'Vikram Towing Services',
    grossCustomerFare: 850,
    omniGoCommissionRate: 0.10,
    omniGoCommissionAmount: 85,
    gstOnCommission: 15,
    partnerGrossEarning: 765,
    customerTip: 150,
    partnerNetEarning: 915,
    settlementStatus: 'unsettled',
    timestamp: '2026-08-15 14:30:15',
  },
  {
    ledgerId: 'LEDGER-2026-0082',
    bookingId: 'JOB-7802',
    paymentId: 'PAY-OMNI-7802',
    partnerId: 'DRV-2024-0847',
    partnerName: 'Vikram Towing Services',
    grossCustomerFare: 1200,
    omniGoCommissionRate: 0.10,
    omniGoCommissionAmount: 120,
    gstOnCommission: 22,
    partnerGrossEarning: 1080,
    customerTip: 0,
    partnerNetEarning: 1080,
    settlementStatus: 'settled',
    timestamp: '2026-08-14 10:15:20',
  },
  {
    ledgerId: 'LEDGER-2026-0078',
    bookingId: 'JOB-7798',
    paymentId: 'PAY-OMNI-7798',
    partnerId: 'DRV-2024-0847',
    partnerName: 'Vikram Towing Services',
    grossCustomerFare: 950,
    omniGoCommissionRate: 0.10,
    omniGoCommissionAmount: 95,
    gstOnCommission: 17,
    partnerGrossEarning: 855,
    customerTip: 100,
    partnerNetEarning: 955,
    settlementStatus: 'settled',
    timestamp: '2026-08-13 16:45:10',
  },
  {
    ledgerId: 'LEDGER-2026-0065',
    bookingId: 'JOB-7750',
    paymentId: 'PAY-OMNI-7750',
    partnerId: 'DRV-2024-0847',
    partnerName: 'Vikram Towing Services',
    grossCustomerFare: 2400,
    omniGoCommissionRate: 0.10,
    omniGoCommissionAmount: 240,
    gstOnCommission: 43,
    partnerGrossEarning: 2160,
    customerTip: 200,
    partnerNetEarning: 2360,
    settlementStatus: 'settled',
    timestamp: '2026-08-12 11:20:18',
  },
  {
    ledgerId: 'LEDGER-2026-0051',
    bookingId: 'JOB-7710',
    paymentId: 'PAY-OMNI-7710',
    partnerId: 'DRV-2024-0847',
    partnerName: 'Vikram Towing Services',
    grossCustomerFare: 3200,
    omniGoCommissionRate: 0.10,
    omniGoCommissionAmount: 320,
    gstOnCommission: 58,
    partnerGrossEarning: 2880,
    customerTip: 0,
    partnerNetEarning: 2880,
    settlementStatus: 'settled',
    timestamp: '2026-08-11 18:10:05',
  },
];

export const MOCK_SETTLEMENTS: PartnerSettlement[] = [
  {
    settlementId: 'SETTLE-8821',
    partnerId: 'DRV-2024-0847',
    partnerName: 'Vikram Towing Services',
    bookingIds: ['JOB-7802', 'JOB-7798', 'JOB-7750', 'JOB-7710'],
    grossAmount: 7750,
    totalCommissionDeducted: 775,
    netPayable: 7275,
    status: 'paid_out',
    createdAt: '2026-08-10 18:00:00',
    settledAt: '2026-08-10 18:15:00',
    payoutId: 'PAYOUT-8821',
  },
  {
    settlementId: 'SETTLE-8910',
    partnerId: 'DRV-2024-0847',
    partnerName: 'Vikram Towing Services',
    bookingIds: ['JOB-7821'],
    grossAmount: 850,
    totalCommissionDeducted: 85,
    netPayable: 915,
    status: 'pending_clearance',
    createdAt: '2026-08-15 14:35:00',
  },
];

export const MOCK_PAYOUTS: PayoutRecord[] = [
  {
    payoutId: 'PAYOUT-8821',
    settlementId: 'SETTLE-8821',
    partnerId: 'DRV-2024-0847',
    partnerName: 'Vikram Towing Services',
    bankName: 'State Bank of India',
    accountNumberMasked: '•••• •••• 6789',
    ifsc: 'SBIN0001234',
    amount: 7275,
    mode: 'IMPS',
    utrNumber: 'UTR9928172648',
    status: 'success',
    disbursedAt: '2026-08-10 18:15:30',
  },
  {
    payoutId: 'PAYOUT-8714',
    settlementId: 'SETTLE-8714',
    partnerId: 'DRV-2024-0847',
    partnerName: 'Vikram Towing Services',
    bankName: 'State Bank of India',
    accountNumberMasked: '•••• •••• 6789',
    ifsc: 'SBIN0001234',
    amount: 12400,
    mode: 'NEFT',
    utrNumber: 'UTR8819201928',
    status: 'success',
    disbursedAt: '2026-08-03 18:00:00',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 🌟 3. END-TO-END AUDIT TRAIL RESOLVER
// ─────────────────────────────────────────────────────────────────────────────

export const COMPLETE_AUDIT_TRAILS: PaymentAuditTrail[] = [
  {
    bookingId: 'JOB-7821',
    customerName: 'Rahul Sharma',
    pickupLocation: 'MG Road, Near Brigade Gateway, Bangalore',
    dropLocation: 'AutoFix Garage, Whitefield, Bangalore',
    payment: MOCK_PAYMENT_TRANSACTIONS[0],
    ledger: MOCK_LEDGER_ENTRIES[0],
    settlement: MOCK_SETTLEMENTS[1],
    payout: {
      payoutId: 'PAYOUT-PENDING',
      settlementId: 'SETTLE-8910',
      partnerId: 'DRV-2024-0847',
      partnerName: 'Vikram Towing Services',
      bankName: 'State Bank of India',
      accountNumberMasked: '•••• •••• 6789',
      ifsc: 'SBIN0001234',
      amount: 915,
      mode: 'IMPS',
      utrNumber: 'Pending Next Auto-Payout (Tuesday)',
      status: 'initiated',
      disbursedAt: 'Scheduled 18 Aug 2026',
    },
  },
  {
    bookingId: 'JOB-7802',
    customerName: 'Priya Sharma',
    pickupLocation: 'NH-48, Exit 4, Pimpri, Pune',
    dropLocation: 'Toyota Service Center, Hinjawadi',
    payment: MOCK_PAYMENT_TRANSACTIONS[1],
    ledger: MOCK_LEDGER_ENTRIES[1],
    settlement: MOCK_SETTLEMENTS[0],
    payout: MOCK_PAYOUTS[0],
  },
  {
    bookingId: 'JOB-7798',
    customerName: 'Sneha Patil',
    pickupLocation: 'Koregaon Park, Pune',
    dropLocation: 'Maruti Authorized Center, Hadapsar',
    payment: MOCK_PAYMENT_TRANSACTIONS[2],
    ledger: MOCK_LEDGER_ENTRIES[2],
    settlement: MOCK_SETTLEMENTS[0],
    payout: MOCK_PAYOUTS[0],
  },
  {
    bookingId: 'JOB-7750',
    customerName: 'Amit Verma',
    pickupLocation: 'Viman Nagar, Pune',
    dropLocation: 'CarCare Center, Baner',
    payment: MOCK_PAYMENT_TRANSACTIONS[3],
    ledger: MOCK_LEDGER_ENTRIES[3],
    settlement: MOCK_SETTLEMENTS[0],
    payout: MOCK_PAYOUTS[0],
  },
  {
    bookingId: 'JOB-7710',
    customerName: 'Karan Mehra',
    pickupLocation: 'Aundh, Pune',
    dropLocation: 'Express Highway Toll, Urse',
    payment: MOCK_PAYMENT_TRANSACTIONS[4],
    ledger: MOCK_LEDGER_ENTRIES[4],
    settlement: MOCK_SETTLEMENTS[0],
    payout: MOCK_PAYOUTS[0],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 🌟 4. QUERY METHODS
// ─────────────────────────────────────────────────────────────────────────────

export function getBookingAuditTrail(bookingId: string): PaymentAuditTrail | undefined {
  return COMPLETE_AUDIT_TRAILS.find(t => t.bookingId === bookingId);
}

export function getAllAuditTrails(): PaymentAuditTrail[] {
  return COMPLETE_AUDIT_TRAILS;
}

export function getDriverLedgerEntries(partnerId: string): OmniGoLedgerEntry[] {
  return MOCK_LEDGER_ENTRIES.filter(e => e.partnerId === partnerId);
}

export function getDriverSettlements(partnerId: string): PartnerSettlement[] {
  return MOCK_SETTLEMENTS.filter(s => s.partnerId === partnerId);
}

export function getAdminRevenueSummary() {
  const totalGrossVolume = MOCK_PAYMENT_TRANSACTIONS.reduce((sum, p) => sum + p.amount, 0);
  const totalCommissionRevenue = MOCK_LEDGER_ENTRIES.reduce((sum, l) => sum + l.omniGoCommissionAmount, 0);
  const totalPartnerNetEarnings = MOCK_LEDGER_ENTRIES.reduce((sum, l) => sum + l.partnerNetEarning, 0);
  const totalPayoutsDisbursed = MOCK_PAYOUTS.reduce((sum, p) => sum + p.amount, 0);

  return {
    totalGrossVolume: totalGrossVolume + 1245000,
    totalCommissionRevenue: totalCommissionRevenue + 185000,
    totalPartnerNetEarnings: totalPartnerNetEarnings + 1060000,
    totalPayoutsDisbursed: totalPayoutsDisbursed + 998000,
    activeEscrowBalance: 84200,
  };
}
