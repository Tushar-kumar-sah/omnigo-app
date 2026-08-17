import type { PaymentMethod } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// FARE & COMMISSION SPLIT ENGINE
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
  commissionRate: number = 0.10
): FareSplitResult {
  const commission = Math.round(customerFare * commissionRate);
  const gst = Math.round(commission * 0.18);
  const partnerFareShare = customerFare - commission;
  const partnerNet = partnerFareShare + tip;

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
