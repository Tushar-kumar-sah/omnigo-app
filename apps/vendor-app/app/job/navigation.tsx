import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { updateBookingStatus, updateDriverLocation, getBookingById, Booking, createSOSIncident } from '@omnigo/api';

type NavState = 'EN_ROUTE_PICKUP' | 'AT_PICKUP';

const QUICK_CHATS = [
  'I have arrived at your pickup location.',
  'Stuck in heavy traffic · Arriving in 3-5 mins.',
  'Please turn on your vehicle hazard blinkers.',
  'Finding a safe parking spot to hook up.',
  'Please ensure vehicle neutral gear & handbrake off.',
];

export default function NavigationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = (params.id as string);
  const DRIVER_ID = 'b0000000-0000-0000-0000-000000000001'; // TODO: Replace with authenticated driver ID
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!jobId) return;
      try {
        const b = await getBookingById(jobId);
        setBooking(b);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [jobId]);

  const CANCEL_REASONS = [
    'Customer no-show',
    'Customer requested cancellation',
    'Vehicle issue',
    'Safety concern',
    'Other'
  ];

  const [navState, setNavState] = useState<NavState>('EN_ROUTE_PICKUP');
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [sosModalVisible, setSosModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([
    'Hello, this is Rajesh Kumar from OmniGo Towing. I am on my way.',
  ]);
  const [chatInput, setChatInput] = useState('');

  // Waiting timer state (when at pickup)
  const [waitSeconds, setWaitSeconds] = useState(0);

  useEffect(() => {
    let interval: any;
    if (navState === 'AT_PICKUP') {
      interval = setInterval(() => {
        setWaitSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [navState]);

  useEffect(() => {
    let locationSub: Location.LocationSubscription | null = null;
    let isMounted = true;

    async function startNavigationGPS() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        locationSub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 4000,
            distanceInterval: 5,
          },
          (loc) => {
            if (!isMounted) return;
            const { latitude, longitude, heading, speed } = loc.coords;
            updateDriverLocation(
              DRIVER_ID,
              latitude,
              longitude,
              heading || 0,
              speed ? Math.max(0, Math.round(speed * 3.6)) : 0
            ).catch(console.warn);
          }
        );
      } catch (err) {
        console.warn('[Navigation GPS]', err);
      }
    }

    startNavigationGPS();

    return () => {
      isMounted = false;
      if (locationSub) locationSub.remove();
    };
  }, [DRIVER_ID]);

  // Mark driver arriving when screen mounts
  useEffect(() => {
    updateBookingStatus(jobId, 'driver_arriving').catch(console.error);
  }, [jobId]);

  const handleMainAction = async () => {
    if (navState === 'EN_ROUTE_PICKUP') {
      try {
        await updateBookingStatus(jobId, 'at_pickup');
      } catch (e) { console.error(e); }
      setNavState('AT_PICKUP');
      setWaitSeconds(0);
    } else {
      router.push({ pathname: '/job/arrival-verify', params: { id: jobId } });
    }
  };

  const handleMaskedCall = () => {
    Alert.alert(
      'Masked Call Connected',
      `Connecting to customer via OmniGo Privacy Proxy...\n\nYour actual phone number remains hidden.`,
      [{ text: 'End Call' }]
    );
  };

  const handleSOS = async () => {
    setSosModalVisible(true);
    try {
      await createSOSIncident({
        incidentNumber: 'SOS-' + Date.now(),
        customerId: '',
        customerName: 'Driver SOS',
        locationAddress: 'En Route',
        hazardType: 'driver_sos',
        status: 'active'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendChat = (textToSend?: string) => {
    const msg = textToSend || chatInput;
    if (!msg.trim()) return;
    setChatMessages(prev => [...prev, msg]);
    setChatInput('');
  };

  const handleCustomerNoShow = () => {
    Alert.alert(
      'Customer No-Show Confirmation',
      'You have waited over 5 minutes. Cancelling now will credit a ₹150 No-Show compensation to your wallet with ZERO penalty.',
      [
        { text: 'Keep Waiting', style: 'cancel' },
        {
          text: 'Confirm No-Show & Claim ₹150',
          onPress: async () => {
            try {
              await updateBookingStatus(jobId, 'cancelled');
            } catch (e) {}
            Alert.alert('No-Show Recorded', '₹150 has been added to your pending earnings.');
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  const handleCancelReason = async (reason: string) => {
    setCancelModalVisible(false);
    try {
      await updateBookingStatus(jobId, 'cancelled');
    } catch(e) {}
    Alert.alert('Job Cancelled', `Reason recorded: ${reason}`);
    router.replace('/(tabs)');
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const waitingMinutesOver = Math.max(0, Math.floor((waitSeconds - 300) / 60));
  const waitingCharge = waitingMinutesOver * 10;

  return (
    <View style={styles.container}>
      {/* Fake Map Background Grid */}
      <View style={styles.fakeMapGrid}>
        {Array.from({ length: 400 }).map((_, i) => (
          <View key={i} style={styles.mapDot} />
        ))}
      </View>

      {/* Top Banner & SOS Bar */}
      <LinearGradient
        colors={[THEME.colors.background, 'transparent']}
        style={styles.topBannerContainer}
      >
        <View style={styles.topBannerRow}>
          <View style={styles.topBanner}>
            <Ionicons 
              name={navState === 'EN_ROUTE_PICKUP' ? 'navigate-circle' : 'location'} 
              size={24} 
              color={THEME.colors.primary} 
            />
            <View style={styles.topBannerTextContainer}>
              <Text style={styles.topBannerTitle}>
                {navState === 'EN_ROUTE_PICKUP' ? 'En Route to Pickup' : 'Arrived at Pickup Spot'}
              </Text>
              <Text style={styles.topBannerSub} numberOfLines={1}>
                {navState === 'EN_ROUTE_PICKUP' ? `Head to ${booking?.pickup?.address || 'Pickup'}` : 'Wait for customer or complete OTP verification'}
              </Text>
            </View>
          </View>

          {/* SOS Emergency Trigger */}
          <TouchableOpacity style={styles.sosTopBtn} onPress={handleSOS} activeOpacity={0.8}>
            <LinearGradient colors={['#FF3366', '#CC0033']} style={styles.sosGradient}>
              <Ionicons name="warning" size={16} color="#fff" />
              <Text style={styles.sosText}>SOS</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Bottom Floating Control Card */}
      <View style={styles.bottomContainer}>
        <BlurView intensity={80} tint="dark" style={styles.card}>
          <View style={styles.customerHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName}>Customer</Text>
              <Text style={styles.customerPhone}>Masked: Connected</Text>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity style={[styles.circleBtn, { backgroundColor: 'rgba(0, 207, 255, 0.15)' }]} onPress={() => setChatModalVisible(true)}>
                <Ionicons name="chatbubble-ellipses" size={20} color={THEME.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.circleBtn, { backgroundColor: 'rgba(0, 255, 151, 0.15)' }]} onPress={handleMaskedCall}>
                <Ionicons name="call" size={20} color={THEME.colors.success} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.vehicleChipsContainer}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{booking?.customerVehicle?.brand || ''} {booking?.customerVehicle?.model || ''}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>White</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Text style={[styles.chipText, { fontFamily: THEME.fonts.inter.bold }]}>
                {booking?.customerVehicle?.number || '—'}
              </Text>
            </View>
          </View>

          {/* ETA or Waiting Timer */}
          {navState === 'EN_ROUTE_PICKUP' ? (
            <View style={styles.etaRow}>
              <Ionicons name="time-outline" size={18} color={THEME.colors.primary} />
              <Text style={styles.etaText}>
                {booking?.estimatedETA ? `Arriving in ${booking.estimatedETA} mins` : '—'} {booking?.distance ? `(${booking.distance} km)` : ''}
              </Text>
            </View>
          ) : (
            <View style={styles.waitingRow}>
              <View style={styles.waitingLeft}>
                <Ionicons name="stopwatch" size={20} color={waitSeconds >= 300 ? THEME.colors.warning : THEME.colors.primary} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.waitingTimerText}>{formatTimer(waitSeconds)}</Text>
                  <Text style={styles.waitingSubText}>
                    {waitSeconds < 300 
                      ? `Free waiting time (${Math.max(0, 5 - Math.floor(waitSeconds / 60))}m remaining)` 
                      : `Surcharge: +₹${waitingCharge} (₹10/min)`}
                  </Text>
                </View>
              </View>

              {waitSeconds >= 300 && (
                <TouchableOpacity style={styles.noShowBtn} onPress={handleCustomerNoShow}>
                  <Text style={styles.noShowBtnText}>NO-SHOW (₹150)</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.mainActionBtn} onPress={handleMainAction}>
            <LinearGradient
              colors={navState === 'EN_ROUTE_PICKUP' 
                ? [THEME.colors.primary, THEME.colors.secondary] 
                : [THEME.colors.success, '#00CC7A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Text style={styles.mainActionBtnText}>
                {navState === 'EN_ROUTE_PICKUP' ? 'I HAVE ARRIVED AT PICKUP' : 'VERIFY CUSTOMER & PRE-INSPECT'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={() => setCancelModalVisible(true)}
          >
            <Text style={styles.cancelBtnText}>Cancel Job / Report Issue</Text>
          </TouchableOpacity>
        </BlurView>
      </View>

      {/* ─── MODAL 1: SOS EMERGENCY ASSISTANCE ───────────── */}
      <Modal visible={sosModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalContent}>
            <View style={styles.sosHeader}>
              <Ionicons name="warning" size={28} color={THEME.colors.danger} />
              <Text style={styles.sosModalTitle}>Driver Emergency Assistance</Text>
            </View>
            <Text style={styles.sosModalSub}>Broadcast live location to safety team or call emergency authorities:</Text>
            
            <TouchableOpacity style={styles.emergencyRow} onPress={() => Alert.alert('Police Contacted', 'Dialing Emergency 112...')}>
              <View style={[styles.emergencyIconCircle, { backgroundColor: 'rgba(255, 51, 102, 0.2)' }]}>
                <Ionicons name="shield" size={20} color={THEME.colors.danger} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.emergencyTitle}>Police Emergency (112)</Text>
                <Text style={styles.emergencySub}>Threat, assault, or road obstruction</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.emergencyRow} onPress={() => Alert.alert('Highway Patrol', 'Connecting to 24/7 OmniGo Rapid Support...')}>
              <View style={[styles.emergencyIconCircle, { backgroundColor: 'rgba(0, 207, 255, 0.2)' }]}>
                <MaterialCommunityIcons name="tow-truck" size={20} color={THEME.colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.emergencyTitle}>OmniGo Highway Dispatch</Text>
                <Text style={styles.emergencySub}>Vehicle breakdown backup or equipment aid</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.emergencyRow} onPress={() => Alert.alert('Medical Aid', 'Calling Ambulance 108...')}>
              <View style={[styles.emergencyIconCircle, { backgroundColor: 'rgba(0, 255, 151, 0.2)' }]}>
                <Ionicons name="medkit" size={20} color={THEME.colors.success} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.emergencyTitle}>Medical Ambulance (108)</Text>
                <Text style={styles.emergencySub}>Accident injury or health issue</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setSosModalVisible(false)}>
              <Text style={styles.closeModalText}>Close Emergency Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── MODAL 2: IN-APP CHAT ─────────────────────────── */}
      <Modal visible={chatModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.chatHeader}>
              <View>
                <Text style={styles.modalTitle}>In-App Customer Chat</Text>
                <Text style={styles.modalSub}>Customer · Masked Channel</Text>
              </View>
              <TouchableOpacity onPress={() => setChatModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Message Thread */}
            <ScrollView style={styles.chatThread} showsVerticalScrollIndicator={false}>
              {chatMessages.map((msg, idx) => (
                <View key={idx} style={styles.driverBubble}>
                  <Text style={styles.driverBubbleText}>{msg}</Text>
                  <Text style={styles.bubbleTime}>Just now · Sent</Text>
                </View>
              ))}
            </ScrollView>

            {/* Quick Template Chips */}
            <Text style={styles.quickChipsTitle}>QUICK MESSAGES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickChipsScroll}>
              {QUICK_CHATS.map((chip, idx) => (
                <TouchableOpacity key={idx} style={styles.quickChip} onPress={() => handleSendChat(chip)}>
                  <Text style={styles.quickChipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Custom Input */}
            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type a custom message..."
                placeholderTextColor={THEME.colors.textMuted}
                value={chatInput}
                onChangeText={setChatInput}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={() => handleSendChat()}>
                <Ionicons name="send" size={18} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── MODAL 3: CANCEL REASONS & PENALTIES ─────────── */}
      <Modal visible={cancelModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel Current Job</Text>
            <Text style={styles.modalSub}>Select verified cancellation reason. Legitimate reasons (e.g. unsafe vehicle / customer no-show) incur 0 penalty.</Text>
            
            {CANCEL_REASONS.map((reason, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.reasonRow}
                onPress={() => handleCancelReason(reason)}
              >
                <Text style={styles.reasonText}>{reason}</Text>
                <Ionicons name="chevron-forward" size={18} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              style={styles.closeModalBtn} 
              onPress={() => setCancelModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Back to Job</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
  },
  fakeMapGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapDot: {
    width: 2,
    height: 2,
    backgroundColor: THEME.colors.primary,
    margin: 15,
    borderRadius: 1,
  },
  topBannerContainer: {
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  topBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
  },
  topBannerTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  topBannerTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.text,
  },
  topBannerSub: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  sosTopBtn: {
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
  },
  sosGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 4,
  },
  sosText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 14,
    color: '#fff',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    overflow: 'hidden',
    padding: 20,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  customerName: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 20,
    color: THEME.colors.text,
  },
  customerPhone: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  vehicleChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: THEME.colors.text,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.05)',
    padding: 10,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.15)',
  },
  etaText: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 14,
    color: THEME.colors.text,
    marginLeft: 6,
  },
  waitingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 214, 10, 0.08)',
    padding: 10,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 10, 0.25)',
  },
  waitingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 6,
  },
  waitingTimerText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 15,
    color: THEME.colors.text,
  },
  waitingSubText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.warning,
    flexShrink: 1,
  },
  noShowBtn: {
    backgroundColor: THEME.colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    flexShrink: 0,
  },
  noShowBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 10,
    color: '#fff',
  },
  mainActionBtn: {
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    marginBottom: 12,
  },
  btnGradient: {
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainActionBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: '#000',
    letterSpacing: 0.5,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.danger,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: THEME.colors.surfaceDark,
    borderRadius: THEME.borderRadius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  modalTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 20,
    color: THEME.colors.text,
  },
  modalSub: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginBottom: 16,
    marginTop: 2,
  },
  sosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sosModalTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 20,
    color: THEME.colors.danger,
  },
  sosModalSub: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginBottom: 16,
  },
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  emergencyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 15,
    color: THEME.colors.text,
  },
  emergencySub: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chatThread: {
    maxHeight: 180,
    marginBottom: 12,
  },
  driverBubble: {
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
    borderRadius: 12,
    padding: 10,
    alignSelf: 'flex-end',
    marginBottom: 8,
    maxWidth: '85%',
  },
  driverBubbleText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 13,
    color: '#fff',
  },
  bubbleTime: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 9,
    color: THEME.colors.textSecondary,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  quickChipsTitle: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  quickChipsScroll: {
    marginBottom: 12,
  },
  quickChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    marginRight: 8,
  },
  quickChipText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: THEME.colors.text,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 13,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  reasonText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.text,
    flex: 1,
    paddingRight: 8,
  },
  closeModalBtn: {
    marginTop: 18,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: THEME.borderRadius.md,
  },
  closeModalText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 15,
    color: THEME.colors.text,
  },
});
