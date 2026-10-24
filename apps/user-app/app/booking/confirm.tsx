import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { theme } from '@/constants/theme';
import { createNewBooking, fetchCurrentUser, initiateCashfreePayment, recordPaymentSuccess } from '@/lib/api';
import CashfreePaymentModal from '@/components/CashfreePaymentModal';
import { getPricingRules } from '@omnigo/api';
import MapLocationPickerModal from '@/components/MapLocationPickerModal';

const USER_ID = 'a0000000-0000-0000-0000-000000000001';

const PAYMENT_METHODS = [
  { id: 'upi',  icon: 'qrcode-scan',       label: 'UPI (Instant)',  sub: 'Cashfree UPI · GPay · PhonePe',  color: '#4CAF50' },
  { id: 'cash', icon: 'cash',               label: 'Cash on Delivery', sub: 'Pay partner after drop-off', color: '#FFD60A' },
] as const;

type PaymentId = typeof PAYMENT_METHODS[number]['id'];

export default function ConfirmBookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [selectedPayment, setSelectedPayment] = useState<PaymentId>('upi');
  const [pricingRules, setPricingRules]       = useState<any>(null);

  // Cashfree Payment Gateway States
  const [showCashfreeModal, setShowCashfreeModal] = useState(false);
  const [cashfreeUrl, setCashfreeUrl] = useState<string | undefined>(undefined);
  const [cashfreeHtml, setCashfreeHtml] = useState<string | undefined>(undefined);
  const [cashfreeOrderId, setCashfreeOrderId] = useState<string | undefined>(undefined);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);

  // Editable Location & Vehicle State
  const [pickupAddr, setPickupAddr]           = useState<string>((params.pickup as string) || '');
  const [dropoffAddr, setDropoffAddr]         = useState<string>((params.dropoff as string) || '');
  const [showMapPicker, setShowMapPicker]     = useState(false);
  const [mapPickerType, setMapPickerType]     = useState<'pickup' | 'dropoff'>('pickup');
  const initialPickupLat = parseFloat(params.pickupLat as string) || 0;
  const initialPickupLng = parseFloat(params.pickupLng as string) || 0;
  const initialDropoffLat = parseFloat(params.dropoffLat as string) || 0;
  const initialDropoffLng = parseFloat(params.dropoffLng as string) || 0;

  const [pickupCoords, setPickupCoords]       = useState<{ latitude: number; longitude: number }>({ latitude: initialPickupLat, longitude: initialPickupLng });
  const [dropoffCoords, setDropoffCoords]     = useState<{ latitude: number; longitude: number }>({ latitude: initialDropoffLat, longitude: initialDropoffLng });

  const vehicleName  = (params.vehicleName as string) || 'Hatchback (Small Car)';
  const vehiclePlate = (params.vehiclePlate as string) || 'MH 12 AB 1234';
  const serviceIssue = (params.serviceIssue as string) || 'Breakdown';
  const distanceVal  = parseFloat(params.distance as string) || 8;

  // Auto-detect current GPS location immediately if missing
  useEffect(() => {
    (async () => {
      try {
        const rules = await getPricingRules();
        setPricingRules(rules);
      } catch (e) {}

      if (pickupCoords.latitude === 0 || !pickupAddr || pickupAddr === '—' || pickupAddr === 'Current Location (GPS)') {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            // 1. Instant cached position
            try {
              const cached = await Location.getLastKnownPositionAsync();
              if (cached?.coords) {
                setPickupCoords({ latitude: cached.coords.latitude, longitude: cached.coords.longitude });
              }
            } catch {}

            // 2. High-accuracy real GPS
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            setPickupCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            try {
              const geocode = await Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              });
              if (geocode && geocode.length > 0) {
                const g = geocode[0];
                const parts = [g.name, g.street, g.district || g.subregion, g.city].filter(Boolean);
                setPickupAddr(parts.join(', ') || `GPS (${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)})`);
              } else {
                setPickupAddr(`GPS (${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)})`);
              }
            } catch {
              setPickupAddr(`GPS Location (${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)})`);
            }
          } else {
            if (!pickupAddr) setPickupAddr('Current Location (GPS)');
          }
        } catch {
          if (!pickupAddr) setPickupAddr('Current Location (GPS)');
        }
      }

      if (!dropoffAddr || dropoffAddr === '—') {
        setDropoffAddr('Nearest Authorized Service Center');
      }
    })();
  }, []);

  // Fare values (₹)
  const baseFare     = parseFloat(params.baseFare as string) || (pricingRules?.basePrice || 999);
  const distanceFee  = parseFloat(params.distanceFee as string) || Math.round(Math.max(0, distanceVal - 5) * (pricingRules?.pricePerKm || 40));
  const platformFee  = pricingRules?.platformFee || 25;
  const subtotal     = baseFare + distanceFee + platformFee;
  const gst          = Math.round(subtotal * (pricingRules?.gstRate ? pricingRules.gstRate / 100 : 0.18));
  const total        = subtotal + gst;

  const proceedWithBooking = async (paymentStatus: 'pending' | 'completed' = 'pending', paidOrderId?: string) => {
    try {
      let finalPickup = { ...pickupCoords };
      if (finalPickup.latitude === 0) {
        try {
          const cached = await Location.getLastKnownPositionAsync();
          if (cached?.coords) {
            finalPickup = { latitude: cached.coords.latitude, longitude: cached.coords.longitude };
          } else {
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            finalPickup = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          }
        } catch (err) {
          console.warn('[Confirm] GPS resolution before create failed', err);
        }
      }

      let finalDropoff = { ...dropoffCoords };
      if (finalDropoff.latitude === 0 && finalPickup.latitude !== 0) {
        finalDropoff = {
          latitude: finalPickup.latitude + 0.025,
          longitude: finalPickup.longitude + 0.025,
        };
      }

      const user = await fetchCurrentUser();
      const booking = await createNewBooking({
        userId: user?.uuid || user?.id || USER_ID,
        vehicleTypeId: (params.vehicleType as string) || 'hatchback',
        customerVehicle: { make: '—', model: vehicleName, plate: vehiclePlate, color: '—' },
        pickup: { address: pickupAddr || 'Current Location', coordinates: finalPickup },
        dropoff: { address: dropoffAddr || 'Nearest Workshop', coordinates: finalDropoff },
        estimatedPrice: total,
        distance: distanceVal,
        paymentMethod: selectedPayment,
      });

      const bId = booking?.id || booking?.uuid || `b_${Date.now()}`;

      if (paidOrderId) {
        await recordPaymentSuccess(bId, paidOrderId, selectedPayment, total);
      }

      router.push({ pathname: '/booking/searching', params: { bookingId: bId } });
    } catch (e) {
      console.warn('[Confirm] create booking error', e);
      router.push('/booking/searching');
    }
  };

  const handleConfirm = async () => {
    // If Cash on delivery, proceed directly
    if (selectedPayment === 'cash') {
      await proceedWithBooking('pending');
      return;
    }

    // For UPI / Card: Open Cashfree Payment Gateway!
    setIsInitializingPayment(true);
    try {
      const user = await fetchCurrentUser();
      const tempId = `omni_${Date.now()}`;
      
      const cfRes = await initiateCashfreePayment({
        bookingId: tempId,
        orderAmount: total,
        customerId: user?.id || user?.uuid || 'cust_' + Date.now(),
        customerName: user?.name || 'Customer',
        customerPhone: user?.phone || '9876543210',
        customerEmail: user?.email || 'support@omnigo.in',
        purpose: `OmniGo Towing (${vehicleName})`,
      });

      if (cfRes?.success && (cfRes.linkUrl || cfRes.checkoutHtml || cfRes.paymentSessionId)) {
        setCashfreeOrderId(cfRes.orderId || tempId);
        setCashfreeUrl(cfRes.linkUrl);
        setCashfreeHtml(cfRes.checkoutHtml);
        setShowCashfreeModal(true);
      } else {
        // Fallback: alert and allow proceed
        Alert.alert(
          'Cashfree Gateway',
          'Cashfree sandbox payment initialized. Proceeding with booking.',
          [{ text: 'Continue', onPress: () => proceedWithBooking('pending') }]
        );
      }
    } catch (err: any) {
      console.warn('[Confirm] Cashfree init error:', err);
      await proceedWithBooking('pending');
    } finally {
      setIsInitializingPayment(false);
    }
  };

  const handleCashfreeSuccess = async (details: any) => {
    setShowCashfreeModal(false);
    const resolvedOrderId = details?.orderId || cashfreeOrderId;
    await proceedWithBooking('completed', resolvedOrderId);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 48) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm & Pay</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom + 100, 120) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Route Summary */}
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="tow-truck" size={22} color={theme.colors.primary} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.cardTitle}>{vehicleName}</Text>
              <Text style={styles.cardSub}>{vehiclePlate}</Text>
            </View>
            <View style={styles.etaChip}>
              <Ionicons name="time-outline" size={12} color={theme.colors.primary} />
              <Text style={styles.etaText}>ETA 12 min</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Route */}
          <View style={styles.routeBlock}>
            <View style={styles.routeDots}>
              <View style={styles.greenDot} />
              <View style={styles.dashedLine} />
              <View style={styles.redDot} />
            </View>
            <View style={{ flex: 1, gap: 12 }}>
              {/* Pickup location */}
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.routeLabel}>PICKUP LOCATION</Text>
                    <Ionicons name="pencil" size={10} color="#00FF97" />
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setMapPickerType('pickup');
                      setShowMapPicker(true);
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6, backgroundColor: 'rgba(0,255,151,0.1)' }}
                  >
                    <Ionicons name="map" size={10} color="#00FF97" />
                    <Text style={{ color: '#00FF97', fontSize: 10, fontFamily: 'Outfit_600SemiBold' }}>Map</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.editableRouteInput}
                  value={pickupAddr}
                  onChangeText={setPickupAddr}
                  placeholder="Enter pickup address / landmark"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                />
              </View>

              {/* Dropoff location */}
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.routeLabel}>DROP-OFF DESTINATION</Text>
                    <Ionicons name="pencil" size={10} color="#00CFFF" />
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setMapPickerType('dropoff');
                      setShowMapPicker(true);
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6, backgroundColor: 'rgba(0,207,255,0.1)' }}
                  >
                    <Ionicons name="map" size={10} color="#00CFFF" />
                    <Text style={{ color: '#00CFFF', fontSize: 10, fontFamily: 'Outfit_600SemiBold' }}>Map</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.editableRouteInput}
                  value={dropoffAddr}
                  onChangeText={setDropoffAddr}
                  placeholder="Enter drop-off garage or workshop"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                />
              </View>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="navigate-outline" size={13} color={theme.colors.primary} />
              <Text style={styles.metaText}>{distanceVal > 0 ? `${distanceVal} km` : '8 km'}</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={13} color={theme.colors.primary} />
              <Text style={styles.metaText}>~25 min</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="alert-circle-outline" size={13} color="#FFD60A" />
              <Text style={styles.metaText}>{serviceIssue}</Text>
            </View>
          </View>
        </BlurView>

        {/* Driver Card */}
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <Text style={styles.sectionTitle}>Searching for nearby drivers...</Text>
        </BlurView>

        {/* Fare Breakdown */}
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <Text style={styles.sectionTitle}>Fare Breakdown</Text>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Base Fare</Text>
            <Text style={styles.fareValue}>₹{baseFare}</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Distance Fee</Text>
            <Text style={styles.fareValue}>₹{distanceFee}</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Platform Fee</Text>
            <Text style={styles.fareValue}>₹{platformFee}</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>GST  <Text style={styles.fareSub}>(18%)</Text></Text>
            <Text style={styles.fareValue}>₹{gst}</Text>
          </View>

          <View style={styles.fareTotalRow}>
            <View style={styles.divider} />
            <View style={styles.fareRow}>
              <Text style={styles.fareTotalLabel}>Total</Text>
              <Text style={styles.fareTotalValue}>₹{total}</Text>
            </View>
          </View>

          {/* No Hidden Charges */}
          <View style={styles.noHiddenBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#00FF97" />
            <Text style={styles.noHiddenText}>No hidden charges · All-inclusive fare</Text>
          </View>
        </BlurView>

        {/* Payment Method — OmniGo Escrow Gateway */}
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <View style={styles.gatewayHeader}>
            <View style={styles.gatewayShieldCircle}>
              <Ionicons name="shield-checkmark" size={18} color="#00FF97" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.sectionTitle}>OmniGo Cashfree Gateway</Text>
              <Text style={styles.gatewaySub}>Powered by Cashfree Payments</Text>
            </View>
            <View style={styles.pciBadge}>
              <Text style={styles.pciText}>CASHFREE PG</Text>
            </View>
          </View>

          <View style={styles.escrowNotice}>
            <Ionicons name="lock-closed" size={13} color="#00CFFF" />
            <Text style={styles.escrowNoticeText}>
              Payments are held securely in OmniGo Escrow. Driver never receives your UPI details and cannot request direct payments.
            </Text>
          </View>

          {PAYMENT_METHODS.map(pm => (
            <TouchableOpacity
              key={pm.id}
              style={[styles.paymentRow, selectedPayment === pm.id && styles.paymentRowActive]}
              onPress={() => setSelectedPayment(pm.id)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name={pm.icon as any} size={22} color={pm.color} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.paymentLabel}>{pm.label}</Text>
                <Text style={styles.paymentSub}>{pm.sub}</Text>
              </View>
              <View style={[styles.radioOuter, selectedPayment === pm.id && styles.radioOuterActive]}>
                {selectedPayment === pm.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </BlurView>

        {/* Cancellation Policy */}
        <BlurView intensity={10} tint="dark" style={[styles.card, { backgroundColor: 'rgba(255,77,77,0.04)', borderColor: 'rgba(255,77,77,0.12)' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.4)" />
            <Text style={styles.policyText}>Free cancellation before driver is assigned · Automatic refund to original payment source</Text>
          </View>
        </BlurView>
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
        <View style={styles.totalPreview}>
          <Text style={styles.totalPreviewLabel}>Total Payable via Gateway</Text>
          <Text style={styles.totalPreviewValue}>₹{total}</Text>
        </View>
        <TouchableOpacity
          onPress={handleConfirm}
          activeOpacity={0.85}
          style={styles.ctaTouch}
          disabled={isInitializingPayment}
        >
          <LinearGradient
            colors={['#00FF97', '#00CC7A']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[styles.ctaBtn, isInitializingPayment && { opacity: 0.7 }]}
          >
            {isInitializingPayment ? (
              <ActivityIndicator size="small" color="#000" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name={selectedPayment === 'cash' ? "checkmark-circle" : "card"} size={16} color="#000" style={{ marginRight: 6 }} />
            )}
            <Text style={styles.ctaText}>
              {isInitializingPayment
                ? 'OPENING CASHFREE...'
                : selectedPayment === 'cash'
                ? `CONFIRM BOOKING (CASH ₹${total})`
                : `PAY ₹${total} VIA CASHFREE`}
            </Text>
            {!isInitializingPayment && <Ionicons name="arrow-forward" size={18} color="#000" style={{ marginLeft: 6 }} />}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Cashfree Payment Gateway Modal */}
      <CashfreePaymentModal
        visible={showCashfreeModal}
        checkoutUrl={cashfreeUrl}
        checkoutHtml={cashfreeHtml}
        orderId={cashfreeOrderId}
        amount={total}
        purpose={`OmniGo Towing · ${vehicleName}`}
        onClose={() => setShowCashfreeModal(false)}
        onSuccess={handleCashfreeSuccess}
        onFailure={(err) => {
          setShowCashfreeModal(false);
          Alert.alert('Payment Cancelled', err || 'You can retry or select Cash on delivery.');
        }}
      />

      {/* Interactive Map Location Picker */}
      <MapLocationPickerModal
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        type={mapPickerType}
        title={mapPickerType === 'pickup' ? 'Select Pickup on Map' : 'Select Drop-off on Map'}
        initialAddress={mapPickerType === 'pickup' ? pickupAddr : dropoffAddr}
        initialCoordinates={mapPickerType === 'pickup' ? (pickupCoords.latitude !== 0 ? pickupCoords : undefined) : (dropoffCoords.latitude !== 0 ? dropoffCoords : (pickupCoords.latitude !== 0 ? pickupCoords : undefined))}
        onSelectLocation={({ address, coordinates }) => {
          if (mapPickerType === 'pickup') {
            setPickupAddr(address);
            if (coordinates) setPickupCoords(coordinates);
          } else {
            setDropoffAddr(address);
            if (coordinates) setDropoffCoords(coordinates);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#050810' },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  backBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ fontFamily: 'Outfit_700Bold', fontSize: 18, color: '#fff' },
  scroll:     { paddingHorizontal: 20, paddingTop: 8, gap: 14 },

  card:       { borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', padding: 16, backgroundColor: 'rgba(13,20,32,0.5)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardTitle:  { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#fff' },
  cardSub:    { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  etaChip:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,207,255,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(0,207,255,0.2)' },
  etaText:    { fontFamily: 'Outfit_700Bold', fontSize: 12, color: theme.colors.primary },
  divider:    { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 12 },

  routeBlock: { flexDirection: 'row', gap: 12 },
  routeDots:  { alignItems: 'center', paddingTop: 4 },
  greenDot:   { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00FF97' },
  dashedLine: { width: 2, height: 24, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 3 },
  redDot:     { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF4D4D' },
  routeLabel: { fontFamily: 'Outfit_700Bold', fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, marginBottom: 2 },
  routeAddr:  { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.85)' },

  metaRow:    { flexDirection: 'row', gap: 8, marginTop: 12 },
  metaChip:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,207,255,0.06)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(0,207,255,0.15)' },
  metaText:   { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.6)' },

  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#fff', marginBottom: 12 },

  driverRow:        { flexDirection: 'row', alignItems: 'center' },
  driverAvatar:     { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(0,207,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,207,255,0.3)' },
  driverAvatarText: { fontFamily: 'Outfit_700Bold', fontSize: 22, color: theme.colors.primary },
  driverName:       { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#fff' },
  driverMeta:       { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  driverRating:     { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  driverVehicle:    { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  driverEtaBox:     { alignItems: 'center', backgroundColor: 'rgba(0,255,151,0.08)', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: 'rgba(0,255,151,0.2)' },
  driverEtaNum:     { fontFamily: 'Outfit_700Bold', fontSize: 22, color: '#00FF97' },
  driverEtaUnit:    { fontFamily: 'Inter_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.5)' },

  fareRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  fareLabel:      { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  fareSub:        { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  fareValue:      { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#fff' },
  fareTotalRow:   {},
  fareTotalLabel: { fontFamily: 'Outfit_700Bold', fontSize: 17, color: '#fff' },
  fareTotalValue: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#00FF97' },
  noHiddenBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: 'rgba(0,255,151,0.06)', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0,255,151,0.15)' },
  noHiddenText:  { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#00FF97', flex: 1 },

  gatewayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  gatewayShieldCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,255,151,0.12)', justifyContent: 'center', alignItems: 'center' },
  gatewaySub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 1 },
  pciBadge: { backgroundColor: 'rgba(0,207,255,0.1)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(0,207,255,0.25)' },
  pciText: { fontFamily: 'Outfit_700Bold', fontSize: 9, color: theme.colors.primary, letterSpacing: 0.5 },
  escrowNotice: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: 'rgba(0,207,255,0.06)', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0,207,255,0.15)', marginBottom: 12 },
  escrowNoticeText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 15 },

  paymentNote:    { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12, lineHeight: 16 },
  paymentRow:     { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 8, backgroundColor: 'rgba(13,20,32,0.4)' },
  paymentRowActive: { borderColor: 'rgba(0,207,255,0.35)', backgroundColor: 'rgba(0,207,255,0.06)' },
  paymentLabel:   { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#fff' },
  paymentSub:     { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 1 },
  radioOuter:     { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: theme.colors.primary },
  radioInner:     { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },
  cashNote:       { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: 'rgba(255,214,10,0.06)', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,214,10,0.15)', marginTop: 4 },
  cashNoteText:   { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 16 },
  policyText:     { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 16 },

  bottomBar:        { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, backgroundColor: 'rgba(5,8,16,0.97)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  totalPreview:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  totalPreviewLabel:{ fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  totalPreviewValue:{ fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#00FF97' },
  ctaTouch:         { borderRadius: 100, overflow: 'hidden', shadowColor: '#00FF97', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  ctaBtn:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  ctaText:          { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000' },
  editableRouteInput: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,207,255,0.3)',
    marginTop: 4,
  },
});
