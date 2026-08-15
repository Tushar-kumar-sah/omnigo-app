import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, Animated, Easing, ImageBackground, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { theme } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Status Steps ────────────────────────────────────────────
const STEPS = [
  { id: 'assigned',  label: 'Driver Assigned',  icon: 'person-circle-outline' },
  { id: 'enroute',   label: 'Driver En Route',  icon: 'navigate-outline' },
  { id: 'arrived',   label: 'Driver Arrived',   icon: 'location-outline' },
  { id: 'loaded',    label: 'Vehicle Loaded',   icon: 'car-outline' },
  { id: 'towing',    label: 'Towing to Garage', icon: 'git-commit-outline' },
  { id: 'arriving',  label: 'Arriving at Drop', icon: 'flag-outline' },
  { id: 'delivered', label: 'Safely Delivered', icon: 'checkmark-circle-outline' },
] as const;

const CANCEL_REASONS = [
  'Wait time too long',
  'Changed my plans',
  'Found another service',
  'Price too high',
  'Entered wrong location',
  'Other',
];

export default function TrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showChat, setShowChat] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { from: 'driver', text: 'On my way! Following the GPS navigation route.' },
  ]);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [showPlateVerify, setShowPlateVerify] = useState(false);
  const [plateInput, setPlateInput] = useState('');
  const [plateVerified, setPlateVerified] = useState(false);
  const [speedVal, setSpeedVal] = useState(42);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Animated values for GPS movement and pulses
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radarAnim = useRef(new Animated.Value(0)).current;
  const beaconAnim = useRef(new Animated.Value(0)).current;

  // Pickup and Completion OTPs
  const PICKUP_OTP = '7 4 2 9';
  const COMPLETION_OTP = '3 8 5 1';
  const DRIVER_PLATE = 'MH 02 AB 1234';

  // Continuous loop animation of the Tow Truck gliding along the GPS route line
  useEffect(() => {
    const truckMovement = Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 18000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.delay(1200),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
    truckMovement.start();

    // Radar & Beacon pulses
    const radarLoop = Animated.loop(
      Animated.timing(radarAnim, {
        toValue: 1,
        duration: 2400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );
    radarLoop.start();

    const beaconLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(beaconAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(beaconAnim, { toValue: 0.2, duration: 350, useNativeDriver: true }),
      ])
    );
    beaconLoop.start();

    const stepPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    stepPulse.start();

    return () => {
      truckMovement.stop();
      radarLoop.stop();
      beaconLoop.stop();
      stepPulse.stop();
    };
  }, []);

  // Update real-time speed simulation
  useEffect(() => {
    const speedInterval = setInterval(() => {
      setSpeedVal(Math.floor(38 + Math.random() * 12));
    }, 2000);
    return () => clearInterval(speedInterval);
  }, []);

  // Dynamic step auto-progression for demonstration
  useEffect(() => {
    if (currentStep < STEPS.length - 1) {
      const t = setTimeout(() => setCurrentStep(s => s + 1), 7000);
      return () => clearTimeout(t);
    }
  }, [currentStep]);

  // Show plate verification when driver arrives
  useEffect(() => {
    if (currentStep === 2 && !plateVerified) setShowPlateVerify(true);
  }, [currentStep, plateVerified]);

  const handleSendChat = () => {
    if (!chatMsg.trim()) return;
    setChatHistory(h => [...h, { from: 'me', text: chatMsg.trim() }]);
    setChatMsg('');
    setTimeout(() => {
      setChatHistory(h => [...h, { from: 'driver', text: 'Got it, noting location details! 👍' }]);
    }, 1000);
  };

  const handleVerifyPlate = () => {
    if (plateInput.replace(/\s/g, '').toUpperCase() === DRIVER_PLATE.replace(/\s/g, '').toUpperCase()) {
      setPlateVerified(true);
      setShowPlateVerify(false);
    }
  };

  // Interpolated GPS Coordinates along the map route
  // Starting at Pickup (18%, 82%) -> traveling through highway corridors -> ending at Drop-off (83%, 18%)
  const truckLeft = progressAnim.interpolate({
    inputRange: [0, 0.12, 0.25, 0.38, 0.48, 0.60, 0.72, 0.85, 1],
    outputRange: ['18%', '24%', '33%', '38%', '46%', '60%', '70%', '79%', '83%'],
  });

  const truckTop = progressAnim.interpolate({
    inputRange: [0, 0.12, 0.25, 0.38, 0.48, 0.60, 0.72, 0.85, 1],
    outputRange: ['82%', '76%', '68%', '50%', '30%', '28%', '38%', '24%', '18%'],
  });

  const truckRotation = progressAnim.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: ['-45deg', '-35deg', '-80deg', '25deg', '-40deg', '-30deg'],
  });

  const radarScale = radarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.8],
  });

  const radarOpacity = radarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 0],
  });

  const stepDone = (i: number) => i < currentStep;
  const stepActive = (i: number) => i === currentStep;

  const showPickupOtp = currentStep < 3;
  const showCompletionOtp = currentStep >= 5;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#040711', '#09101E', '#040711']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 48) }]}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>GPS TELEMETRY ACTIVE</Text>
        </View>
        <Text style={styles.headerTitle}>Live Fleet Tracking</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom + 120, 130) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── REAL-TIME GPS MAP WITH MOVING TOW TRUCK ─── */}
        <View style={[styles.mapContainer, isMapExpanded && { height: 420 }]}>
          <ImageBackground
            source={require('../../assets/gps_live_map_bg.jpg')}
            style={styles.mapImage}
            resizeMode="cover"
          >
            {/* Subtle Gradient Overlays for High-Tech HUD look */}
            <LinearGradient
              colors={['rgba(4,7,17,0.7)', 'transparent', 'rgba(4,7,17,0.85)']}
              style={StyleSheet.absoluteFillObject}
            />

            {/* Top Map HUD Telemetry Badges */}
            <View style={styles.mapHudTop}>
              <View style={styles.telemetryPill}>
                <Ionicons name="speedometer-outline" size={14} color="#00FF97" />
                <Text style={styles.telemetryText}>{speedVal} km/h · Smooth Traffic</Text>
              </View>

              <TouchableOpacity
                onPress={() => setIsMapExpanded(!isMapExpanded)}
                style={styles.mapExpandBtn}
                activeOpacity={0.8}
              >
                <Ionicons name={isMapExpanded ? 'contract' : 'expand'} size={15} color="#38BDF8" />
              </TouchableOpacity>
            </View>

            {/* 🟢 PICKUP LOCATION MARKER (MG Road) */}
            <View style={[styles.waypointMarker, { left: '15%', top: '80%' }]}>
              <Animated.View
                style={[
                  styles.radarRing,
                  { borderColor: '#00FF97', transform: [{ scale: radarScale }], opacity: radarOpacity },
                ]}
              />
              <View style={[styles.waypointPin, { backgroundColor: '#00FF97', shadowColor: '#00FF97' }]}>
                <Ionicons name="pin" size={14} color="#000" />
              </View>
              <View style={styles.waypointLabelCard}>
                <View style={styles.waypointLabelRow}>
                  <View style={[styles.dotSmall, { backgroundColor: '#00FF97' }]} />
                  <Text style={styles.waypointTitle}>PICKUP (A)</Text>
                </View>
                <Text style={styles.waypointAddress} numberOfLines={1}>MG Road, Andheri W.</Text>
              </View>
            </View>

            {/* 🔴 DROP-OFF DESTINATION MARKER (AutoFix Garage) */}
            <View style={[styles.waypointMarker, { left: '80%', top: '16%' }]}>
              <View style={[styles.waypointPin, { backgroundColor: '#F43F5E', shadowColor: '#F43F5E' }]}>
                <Ionicons name="flag" size={13} color="#FFF" />
              </View>
              <View style={[styles.waypointLabelCard, { right: 0, left: undefined, transform: [{ translateX: -60 }] }]}>
                <View style={styles.waypointLabelRow}>
                  <View style={[styles.dotSmall, { backgroundColor: '#F43F5E' }]} />
                  <Text style={[styles.waypointTitle, { color: '#F43F5E' }]}>DROP-OFF (B)</Text>
                </View>
                <Text style={styles.waypointAddress} numberOfLines={1}>AutoFix Garage, Bandra</Text>
              </View>
            </View>

            {/* 🚚 LIVE ANIMATED TOW TRUCK GLIDING ALONG THE GPS ROUTE */}
            <Animated.View
              style={[
                styles.truckMarkerContainer,
                {
                  left: truckLeft,
                  top: truckTop,
                  transform: [{ rotate: truckRotation }],
                },
              ]}
            >
              {/* Pulsing Radar Ring Behind Truck */}
              <Animated.View
                style={[
                  styles.truckHalo,
                  {
                    transform: [{ scale: radarScale }],
                    opacity: radarOpacity,
                  },
                ]}
              />

              {/* Tow Truck Vehicle Avatar */}
              <View style={styles.truckAvatarBox}>
                {/* Flashing Emergency Beacon Light */}
                <Animated.View style={[styles.beaconLight, { opacity: beaconAnim }]} />
                <MaterialCommunityIcons name="tow-truck" size={26} color="#38BDF8" />
              </View>

              {/* Live Driver Tag on Truck */}
              <View style={styles.truckFloatingTag}>
                <Text style={styles.truckTagText}>Rajesh · Bolero Tow</Text>
              </View>
            </Animated.View>

            {/* Bottom Floating Map Summary Bar */}
            <View style={styles.mapBottomBar}>
              <View style={styles.mapEtaPill}>
                <Ionicons name="navigate" size={14} color="#38BDF8" />
                <Text style={styles.mapEtaText}>
                  {currentStep < 3 ? '2.4 km to Pickup' : '6.8 km to Garage'}
                </Text>
              </View>
              <View style={styles.mapEtaTimePill}>
                <Text style={styles.mapEtaTimeText}>
                  ETA: {currentStep < 4 ? '12 min' : currentStep < 6 ? '5 min' : 'Arrived'}
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* ETA & Driver Fast Stats Banner */}
        <LinearGradient
          colors={['rgba(56,189,248,0.14)', 'rgba(56,189,248,0.03)']}
          style={styles.etaBanner}
        >
          <View>
            <Text style={styles.etaLabel}>Estimated Pickup Arrival</Text>
            <Text style={styles.etaValue}>
              {currentStep < 3 ? '12 mins' : currentStep < 5 ? '4 mins' : 'Driver Arrived ✓'}
            </Text>
            <Text style={styles.etaSubtext}>
              {currentStep < 3 ? 'Navigating SV Road highway corridor' : 'Driver approaching exact pin'}
            </Text>
          </View>
          <View style={styles.etaIconBox}>
            <Ionicons name="time-outline" size={26} color="#38BDF8" />
          </View>
        </LinearGradient>

        {/* 7-Step Trip Status Stepper */}
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.cardTitle}>Live Trip Lifecycle</Text>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>Step {currentStep + 1} of 7</Text>
            </View>
          </View>
          <Text style={styles.stepStatus}>{STEPS[currentStep].label}</Text>

          {STEPS.map((step, i) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepIconCol}>
                <Animated.View style={[
                  styles.stepIcon,
                  stepDone(i) && styles.stepIconDone,
                  stepActive(i) && styles.stepIconActive,
                  stepActive(i) && { transform: [{ scale: pulseAnim }] },
                ]}>
                  <Ionicons
                    name={stepDone(i) ? 'checkmark' : step.icon as any}
                    size={15}
                    color={stepDone(i) ? '#000' : stepActive(i) ? '#000' : 'rgba(255,255,255,0.3)'}
                  />
                </Animated.View>
                {i < STEPS.length - 1 && (
                  <View style={[styles.stepLine, stepDone(i) && styles.stepLineDone]} />
                )}
              </View>
              <Text style={[
                styles.stepLabel,
                stepDone(i) && styles.stepLabelDone,
                stepActive(i) && styles.stepLabelActive,
              ]}>
                {step.label}
              </Text>
            </View>
          ))}
        </BlurView>

        {/* Assigned Driver Profile */}
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <View style={styles.driverRow}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>R</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.driverName}>Rajesh Kumar</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#FFD60A" />
                <Text style={styles.ratingText}>4.9 · 1,420 completed tows</Text>
              </View>
              <Text style={styles.driverPlate}>🚛 Mahindra Bolero · {DRIVER_PLATE}</Text>
            </View>
            <View style={styles.driverActions}>
              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                <Ionicons name="call-outline" size={18} color="#38BDF8" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { marginTop: 8 }]} onPress={() => setShowChat(true)} activeOpacity={0.7}>
                <Ionicons name="chatbubble-outline" size={18} color="#38BDF8" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.maskedNote}>
            <Ionicons name="shield-checkmark-outline" size={13} color="rgba(255,255,255,0.4)" />
            <Text style={styles.maskedNoteText}>Masked Direct Call Gateway · Powered by OmniGo Telecom</Text>
          </View>
        </BlurView>

        {/* Pickup Security OTP */}
        {showPickupOtp && (
          <BlurView intensity={20} tint="dark" style={[styles.card, styles.otpCard]}>
            <View style={styles.otpHeader}>
              <Ionicons name="lock-closed-outline" size={18} color="#FFD60A" />
              <Text style={styles.otpTitle}>Pickup Verification OTP</Text>
            </View>
            <View style={styles.otpDigits}>
              {PICKUP_OTP.split(' ').map((d, i) => (
                <View key={i} style={styles.otpDigitBox}>
                  <Text style={styles.otpDigit}>{d}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.otpHint}>Share this secret OTP with driver Rajesh to verify vehicle handover</Text>
          </BlurView>
        )}

        {/* Completion OTP */}
        {showCompletionOtp && (
          <BlurView intensity={20} tint="dark" style={[styles.card, styles.otpCard, { borderColor: 'rgba(0,255,151,0.25)' }]}>
            <View style={styles.otpHeader}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#00FF97" />
              <Text style={[styles.otpTitle, { color: '#00FF97' }]}>Drop-off Delivery OTP</Text>
            </View>
            <View style={styles.otpDigits}>
              {COMPLETION_OTP.split(' ').map((d, i) => (
                <View key={i} style={[styles.otpDigitBox, { borderColor: '#00FF97' }]}>
                  <Text style={[styles.otpDigit, { color: '#00FF97' }]}>{d}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.otpHint}>Provide this PIN to the garage mechanic to release the vehicle</Text>
          </BlurView>
        )}

        {/* Cancel Button */}
        {currentStep < 3 && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setShowCancel(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle-outline" size={16} color="#F43F5E" />
            <Text style={styles.cancelBtnText}>Cancel Towing Request</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* ─── LIVE IN-APP CHAT MODAL ─── */}
      <Modal visible={showChat} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.chatSheet}>
            <View style={styles.chatHeader}>
              <View>
                <Text style={styles.chatTitle}>Chat with Rajesh Kumar</Text>
                <Text style={styles.chatSub}>Mahindra Bolero Tow Truck · {DRIVER_PLATE}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowChat(false)} style={styles.closeCircle}>
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatScroll} showsVerticalScrollIndicator={false}>
              {chatHistory.map((m, i) => (
                <View key={i} style={[styles.bubble, m.from === 'me' ? styles.bubbleMe : styles.bubbleDriver]}>
                  <Text style={[styles.bubbleText, m.from === 'me' ? styles.bubbleTextMe : styles.bubbleTextDriver]}>
                    {m.text}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={[styles.chatInputRow, { paddingBottom: Math.max(insets.bottom, 12) }]}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type a message to driver..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={chatMsg}
                onChangeText={setChatMsg}
                onSubmitEditing={handleSendChat}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSendChat} activeOpacity={0.8}>
                <Ionicons name="send" size={16} color="#000" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* ─── CANCELLATION MODAL ─── */}
      <Modal visible={showCancel} animationType="fade" transparent>
        <View style={styles.modalOverlayCenter}>
          <BlurView intensity={50} tint="dark" style={styles.cancelModal}>
            <Text style={styles.cancelTitle}>Cancel Booking?</Text>
            <Text style={styles.cancelDesc}>Please select a reason for cancellation:</Text>
            {CANCEL_REASONS.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.reasonRow, selectedReason === r && styles.reasonRowSelected]}
                onPress={() => setSelectedReason(r)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={selectedReason === r ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={selectedReason === r ? '#38BDF8' : 'rgba(255,255,255,0.4)'}
                />
                <Text style={[styles.reasonText, selectedReason === r && styles.reasonTextSelected]}>{r}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.cancelActions}>
              <TouchableOpacity style={styles.cancelKeepBtn} onPress={() => setShowCancel(false)}>
                <Text style={styles.cancelKeepText}>Keep Booking</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelConfirmBtn, !selectedReason && { opacity: 0.5 }]}
                disabled={!selectedReason}
                onPress={() => {
                  setShowCancel(false);
                  router.replace('/(tabs)');
                }}
              >
                <Text style={styles.cancelConfirmText}>Confirm Cancel</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* ─── PLATE VERIFICATION MODAL ─── */}
      <Modal visible={showPlateVerify} animationType="fade" transparent>
        <View style={styles.modalOverlayCenter}>
          <BlurView intensity={50} tint="dark" style={styles.plateModal}>
            <View style={styles.plateIconBox}>
              <Ionicons name="shield-checkmark" size={32} color="#00FF97" />
            </View>
            <Text style={styles.plateTitle}>Driver Has Arrived</Text>
            <Text style={styles.plateDesc}>
              Before handing over your vehicle, verify the tow truck number plate ({DRIVER_PLATE}).
            </Text>
            <TextInput
              style={styles.plateInput}
              placeholder="Enter plate number"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={plateInput}
              onChangeText={setPlateInput}
              autoCapitalize="characters"
            />
            <View style={styles.plateActions}>
              <TouchableOpacity
                style={styles.plateCancelBtn}
                onPress={() => setShowPlateVerify(false)}
              >
                <Text style={styles.plateCancelText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.plateConfirmBtn}
                onPress={handleVerifyPlate}
              >
                <Text style={styles.plateConfirmText}>Verify Plate</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040711',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56,189,248,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.3)',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: 16,
    gap: 14,
  },

  // ─── GPS MAP STYLES ───
  mapContainer: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.3)',
    backgroundColor: '#070C18',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  mapImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mapHudTop: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  telemetryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(8,12,20,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  telemetryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  mapExpandBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(8,12,20,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waypointMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    zIndex: 8,
  },
  radarRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
  },
  waypointPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  waypointLabelCard: {
    position: 'absolute',
    top: 28,
    left: -40,
    backgroundColor: 'rgba(8,12,20,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 110,
  },
  waypointLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  waypointTitle: {
    color: '#00FF97',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  waypointAddress: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },

  // ─── LIVE TRUCK MARKER ───
  truckMarkerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    zIndex: 20,
  },
  truckHalo: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(56,189,248,0.25)',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  truckAvatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D1726',
    borderWidth: 2,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  beaconLight: {
    position: 'absolute',
    top: 4,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  truckFloatingTag: {
    position: 'absolute',
    bottom: -18,
    backgroundColor: 'rgba(8,12,20,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.4)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  truckTagText: {
    color: '#38BDF8',
    fontSize: 8,
    fontWeight: '700',
  },
  mapBottomBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  mapEtaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(8,12,20,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  mapEtaText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  mapEtaTimePill: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  mapEtaTimeText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
  },

  // ─── ETA BANNER ───
  etaBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.25)',
  },
  etaLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  etaValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#38BDF8',
    marginTop: 2,
  },
  etaSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  etaIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(56,189,248,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── CARDS ───
  card: {
    backgroundColor: 'rgba(13,19,34,0.85)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stepBadgeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  stepStatus: {
    fontSize: 18,
    fontWeight: '800',
    color: '#38BDF8',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIconCol: {
    alignItems: 'center',
    width: 32,
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconDone: {
    backgroundColor: '#00FF97',
    borderColor: '#00FF97',
  },
  stepIconActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  stepLine: {
    width: 2,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 2,
  },
  stepLineDone: {
    backgroundColor: '#00FF97',
  },
  stepLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginLeft: 12,
    marginTop: 3,
    fontWeight: '500',
  },
  stepLabelDone: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },

  // ─── DRIVER ROW ───
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(56,189,248,0.15)',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#38BDF8',
  },
  driverName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  driverPlate: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '600',
    marginTop: 2,
  },
  driverActions: {
    alignItems: 'center',
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  maskedNoteText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
  },

  // ─── OTP CARD ───
  otpCard: {
    borderColor: 'rgba(245,158,11,0.25)',
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  otpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD60A',
  },
  otpDigits: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  otpDigitBox: {
    width: 44,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigit: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFD60A',
  },
  otpHint: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },

  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(244,63,94,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.25)',
  },
  cancelBtnText: {
    color: '#F43F5E',
    fontWeight: '600',
    fontSize: 13,
  },

  // ─── MODALS ───
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 24,
  },
  chatSheet: {
    backgroundColor: '#0D1322',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    height: '70%',
    padding: 16,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatScroll: {
    flex: 1,
    paddingVertical: 12,
  },
  bubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: '#38BDF8',
  },
  bubbleDriver: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bubbleText: {
    fontSize: 13,
  },
  bubbleTextMe: {
    color: '#000',
    fontWeight: '600',
  },
  bubbleTextDriver: {
    color: '#FFF',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  chatInput: {
    flex: 1,
    height: 42,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 21,
    paddingHorizontal: 16,
    color: '#FFF',
    fontSize: 13,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── CANCEL MODAL ───
  cancelModal: {
    backgroundColor: '#0D1322',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.3)',
  },
  cancelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
  },
  cancelDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 14,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  reasonRowSelected: {
    backgroundColor: 'rgba(56,189,248,0.05)',
  },
  reasonText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  reasonTextSelected: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  cancelActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelKeepBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  cancelKeepText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  cancelConfirmBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F43F5E',
    alignItems: 'center',
  },
  cancelConfirmText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },

  // ─── PLATE MODAL ───
  plateModal: {
    backgroundColor: '#0D1322',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,255,151,0.3)',
    alignItems: 'center',
  },
  plateIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,255,151,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  plateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  plateDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  plateInput: {
    width: '100%',
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: '#00FF97',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 2,
    marginBottom: 14,
  },
  plateActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  plateCancelBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  plateCancelText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 12,
  },
  plateConfirmBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#00FF97',
    alignItems: 'center',
  },
  plateConfirmText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 12,
  },
});
