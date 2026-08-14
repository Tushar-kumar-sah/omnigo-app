import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { theme } from '../../constants/theme';

// ─── Status Steps ────────────────────────────────────────────
const STEPS = [
  { id: 'assigned',  label: 'Driver Assigned',  icon: 'person-circle-outline' },
  { id: 'enroute',   label: 'Driver En Route',  icon: 'navigate-outline' },
  { id: 'arrived',   label: 'Driver Arrived',   icon: 'location-outline' },
  { id: 'loaded',    label: 'Vehicle Loaded',   icon: 'car-outline' },
  { id: 'towing',    label: 'Towing Started',   icon: 'git-commit-outline' },
  { id: 'arriving',  label: 'Arriving',         icon: 'flag-outline' },
  { id: 'delivered', label: 'Delivered',        icon: 'checkmark-circle-outline' },
] as const;

type StepId = typeof STEPS[number]['id'];
const STEP_IDS = STEPS.map(s => s.id);

const CANCEL_REASONS = [
  'Wait time too long',
  'Changed my plans',
  'Found another service',
  'Price too high',
  'Entered wrong location',
  'Other',
];

// ─── Component ──────────────────────────────────────────────
export default function TrackingScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState<number>(1); // 0-indexed
  const [showChat,    setShowChat]     = useState(false);
  const [showCancel,  setShowCancel]   = useState(false);
  const [chatMsg,     setChatMsg]      = useState('');
  const [chatHistory, setChatHistory]  = useState([
    { from: 'driver', text: 'On my way! Will be there in about 12 minutes.' },
  ]);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [showPlateVerify, setShowPlateVerify] = useState(false);
  const [plateInput, setPlateInput]           = useState('');
  const [plateVerified, setPlateVerified]     = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pickup OTP — shown until vehicle loaded
  const PICKUP_OTP      = '7 4 2 9';
  const COMPLETION_OTP  = '3 8 5 1';
  const DRIVER_PLATE    = 'MH 02 AB 1234';

  // Pulsing animation on the active step
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Demo: advance step every 5s
  useEffect(() => {
    if (currentStep < STEPS.length - 1) {
      const t = setTimeout(() => setCurrentStep(s => s + 1), 5000);
      return () => clearTimeout(t);
    }
  }, [currentStep]);

  // Show plate verification when driver arrives
  useEffect(() => {
    if (currentStep === 2 && !plateVerified) setShowPlateVerify(true);
  }, [currentStep]);

  const handleSendChat = () => {
    if (!chatMsg.trim()) return;
    setChatHistory(h => [...h, { from: 'me', text: chatMsg.trim() }]);
    setChatMsg('');
    setTimeout(() => {
      setChatHistory(h => [...h, { from: 'driver', text: 'Got it, noted! 👍' }]);
    }, 1200);
  };

  const handleConfirmCancel = () => {
    setShowCancel(false);
    router.replace('/(tabs)');
  };

  const handleVerifyPlate = () => {
    if (plateInput.replace(/\s/g, '').toUpperCase() === DRIVER_PLATE.replace(/\s/g, '').toUpperCase()) {
      setPlateVerified(true);
      setShowPlateVerify(false);
    }
  };

  const stepDone  = (i: number) => i < currentStep;
  const stepActive = (i: number) => i === currentStep;

  // Which OTP to show
  const showPickupOtp     = currentStep < 3;
  const showCompletionOtp = currentStep >= 5;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 48) }]}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom + 120, 130) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ETA Banner */}
        <LinearGradient
          colors={['rgba(0,207,255,0.12)', 'rgba(0,207,255,0.04)']}
          style={styles.etaBanner}
        >
          <View>
            <Text style={styles.etaLabel}>Estimated Time of Arrival</Text>
            <Text style={styles.etaValue}>
              {currentStep < 4 ? '12 min' : currentStep < 6 ? '5 min' : 'Arrived ✓'}
            </Text>
          </View>
          <View style={styles.etaIconBox}>
            <Ionicons name="time-outline" size={28} color={theme.colors.primary} />
          </View>
        </LinearGradient>

        {/* 7-Step Status Tracker */}
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <Text style={styles.cardTitle}>Trip Status</Text>
          <Text style={styles.stepStatus}>{STEPS[currentStep].label}</Text>
          {STEPS.map((step, i) => (
            <View key={step.id} style={styles.stepRow}>
              {/* Icon */}
              <View style={styles.stepIconCol}>
                <Animated.View style={[
                  styles.stepIcon,
                  stepDone(i)   && styles.stepIconDone,
                  stepActive(i) && styles.stepIconActive,
                  stepActive(i) && { transform: [{ scale: pulseAnim }] },
                ]}>
                  <Ionicons
                    name={stepDone(i) ? 'checkmark' : step.icon as any}
                    size={16}
                    color={stepDone(i) ? '#000' : stepActive(i) ? '#000' : 'rgba(255,255,255,0.3)'}
                  />
                </Animated.View>
                {i < STEPS.length - 1 && (
                  <View style={[styles.stepLine, stepDone(i) && styles.stepLineDone]} />
                )}
              </View>
              {/* Label */}
              <Text style={[
                styles.stepLabel,
                stepDone(i)   && styles.stepLabelDone,
                stepActive(i) && styles.stepLabelActive,
              ]}>
                {step.label}
              </Text>
            </View>
          ))}
        </BlurView>

        {/* Driver Info */}
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <View style={styles.driverRow}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>R</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.driverName}>Rajesh Kumar</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#FFD60A" />
                <Text style={styles.ratingText}>4.8 · 1,240 trips</Text>
              </View>
              <Text style={styles.driverPlate}>🚛 Mahindra Bolero · {DRIVER_PLATE}</Text>
            </View>
            {/* Action Buttons */}
            <View style={styles.driverActions}>
              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                <Ionicons name="call-outline" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { marginTop: 8 }]} onPress={() => setShowChat(true)} activeOpacity={0.7}>
                <Ionicons name="chatbubble-outline" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.maskedNote}>
            <Ionicons name="shield-checkmark-outline" size={13} color="rgba(255,255,255,0.4)" />
            <Text style={styles.maskedNoteText}>Your number is masked — calls go through OmniGo</Text>
          </View>
        </BlurView>

        {/* Pickup OTP */}
        {showPickupOtp && (
          <BlurView intensity={20} tint="dark" style={[styles.card, styles.otpCard]}>
            <View style={styles.otpHeader}>
              <Ionicons name="lock-closed-outline" size={18} color="#FFD60A" />
              <Text style={styles.otpTitle}>Pickup OTP</Text>
            </View>
            <View style={styles.otpDigits}>
              {PICKUP_OTP.split(' ').map((d, i) => (
                <View key={i} style={styles.otpDigitBox}>
                  <Text style={styles.otpDigit}>{d}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.otpHint}>Share this code with the driver to confirm pickup</Text>
          </BlurView>
        )}

        {/* Plate Verified Badge */}
        {plateVerified && (
          <BlurView intensity={20} tint="dark" style={[styles.card, { backgroundColor: 'rgba(0,255,151,0.05)', borderColor: 'rgba(0,255,151,0.2)' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="shield-checkmark" size={18} color="#00FF97" />
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#00FF97' }}>
                Plate Verified: {DRIVER_PLATE}
              </Text>
            </View>
          </BlurView>
        )}

        {/* Completion OTP */}
        {showCompletionOtp && (
          <BlurView intensity={20} tint="dark" style={[styles.card, styles.otpCard, { borderColor: 'rgba(0,255,151,0.25)' }]}>
            <View style={styles.otpHeader}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#00FF97" />
              <Text style={[styles.otpTitle, { color: '#00FF97' }]}>Completion OTP</Text>
            </View>
            <View style={styles.otpDigits}>
              {COMPLETION_OTP.split(' ').map((d, i) => (
                <View key={i} style={[styles.otpDigitBox, { borderColor: 'rgba(0,255,151,0.4)' }]}>
                  <Text style={[styles.otpDigit, { color: '#00FF97' }]}>{d}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.otpHint}>Driver enters this OTP to mark delivery complete</Text>
          </BlurView>
        )}

        {/* Trip Details */}
        <BlurView intensity={15} tint="dark" style={styles.card}>
          <View style={styles.routeBlock}>
            <View style={styles.routeDots}>
              <View style={styles.greenDot} />
              <View style={styles.dashedLine} />
              <View style={styles.redDot} />
            </View>
            <View style={{ flex: 1, gap: 10 }}>
              <View>
                <Text style={styles.routeLabel}>PICKUP</Text>
                <Text style={styles.routeAddr}>MG Road, Near Brigade Gateway, Bangalore</Text>
              </View>
              <View>
                <Text style={styles.routeLabel}>DROP-OFF</Text>
                <Text style={styles.routeAddr}>AutoFix Garage, Whitefield, Bangalore</Text>
              </View>
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaChip}><Ionicons name="navigate-outline" size={12} color={theme.colors.primary} /><Text style={styles.metaText}>8.5 km</Text></View>
            <View style={styles.metaChip}><Ionicons name="wallet-outline" size={12} color={theme.colors.primary} /><Text style={styles.metaText}>₹770</Text></View>
          </View>
        </BlurView>

        {/* OmniGo Payment Gateway & Escrow Audit */}
        <BlurView intensity={15} tint="dark" style={[styles.card, { borderColor: 'rgba(0,255,151,0.2)' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="shield-checkmark" size={16} color="#00FF97" />
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 13, color: '#fff' }}>OmniGo Payment Gateway</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(0,255,151,0.12)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#00FF97' }}>ESCROW SECURED</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Payment ID</Text>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: '#00CFFF' }}>PAY-OMNI-7821</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Booking Reference</Text>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: '#fff' }}>JOB-7821</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Settlement Rule</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#00FF97' }}>Automated Payout on Safe Delivery</Text>
          </View>
        </BlurView>
      </ScrollView>

      {/* Cancel Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 10, 20) }]}>
        {currentStep < 3 ? (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCancel(true)} activeOpacity={0.8}>
            <Ionicons name="close-circle-outline" size={18} color="#FF4D4D" />
            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.noCancelNote}>
            <Ionicons name="information-circle-outline" size={14} color="rgba(255,255,255,0.35)" />
            <Text style={styles.noCancelText}>Cancellation unavailable — vehicle already loaded</Text>
          </View>
        )}
      </View>

      {/* ─── Chat Modal ─── */}
      <Modal visible={showChat} animationType="slide" transparent statusBarTranslucent>
        <View style={modal.overlay}>
          <View style={modal.container}>
            <View style={modal.chatHeader}>
              <View>
                <Text style={modal.chatTitle}>Rajesh Kumar</Text>
                <Text style={modal.chatSub}>Via OmniGo masked call</Text>
              </View>
              <TouchableOpacity onPress={() => setShowChat(false)} style={modal.closeBtn}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={modal.chatBody} contentContainerStyle={{ padding: 16, gap: 10 }}>
              {chatHistory.map((msg, i) => (
                <View key={i} style={[modal.bubble, msg.from === 'me' && modal.bubbleMe]}>
                  <Text style={[modal.bubbleText, msg.from === 'me' && modal.bubbleTextMe]}>{msg.text}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={modal.chatInput}>
              <TextInput
                style={modal.input}
                placeholder="Type a message..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={chatMsg}
                onChangeText={setChatMsg}
              />
              <TouchableOpacity onPress={handleSendChat} style={modal.sendBtn} activeOpacity={0.8}>
                <Ionicons name="send" size={18} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── Cancel Modal ─── */}
      <Modal visible={showCancel} animationType="slide" transparent statusBarTranslucent>
        <View style={modal.overlay}>
          <BlurView intensity={30} tint="dark" style={modal.cancelContainer}>
            <Text style={modal.cancelTitle}>Cancel Booking?</Text>

            <View style={modal.feeBox}>
              <Ionicons name="alert-circle-outline" size={18} color="#FF4D4D" />
              <Text style={modal.feeText}>
                {currentStep === 0
                  ? 'No cancellation fee — driver not yet assigned'
                  : `Cancellation fee: ₹${currentStep === 1 ? 50 : 150} will be charged`}
              </Text>
            </View>

            <Text style={modal.cancelSubtitle}>Select a reason</Text>
            {CANCEL_REASONS.map(reason => (
              <TouchableOpacity
                key={reason}
                style={[modal.reasonRow, selectedReason === reason && modal.reasonRowActive]}
                onPress={() => setSelectedReason(reason)}
                activeOpacity={0.8}
              >
                <View style={[modal.radioOuter, selectedReason === reason && modal.radioOuterActive]}>
                  {selectedReason === reason && <View style={modal.radioInner} />}
                </View>
                <Text style={modal.reasonText}>{reason}</Text>
              </TouchableOpacity>
            ))}

            <View style={modal.cancelBtns}>
              <TouchableOpacity style={modal.goBackBtn} onPress={() => setShowCancel(false)} activeOpacity={0.8}>
                <Text style={modal.goBackText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modal.confirmCancelBtn, !selectedReason && { opacity: 0.4 }]}
                onPress={handleConfirmCancel}
                disabled={!selectedReason}
                activeOpacity={0.8}
              >
                <Text style={modal.confirmCancelText}>Cancel Booking</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* ─── Plate Verification Modal ─── */}
      <Modal visible={showPlateVerify} animationType="fade" transparent statusBarTranslucent>
        <View style={modal.overlay}>
          <BlurView intensity={30} tint="dark" style={modal.plateContainer}>
            <Ionicons name="car-outline" size={36} color={theme.colors.primary} style={{ marginBottom: 12 }} />
            <Text style={modal.plateTitle}>Verify Tow Truck</Text>
            <Text style={modal.plateSub}>
              Confirm the driver's truck plate matches before handing over your vehicle.
            </Text>
            <View style={modal.plateBadge}>
              <Text style={modal.plateBadgeText}>{DRIVER_PLATE}</Text>
            </View>
            <TextInput
              style={modal.plateInput}
              placeholder="Enter plate number you see"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={plateInput}
              onChangeText={setPlateInput}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[modal.plateBtn, plateInput.length < 4 && { opacity: 0.4 }]}
              onPress={handleVerifyPlate}
              disabled={plateInput.length < 4}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#00FF97', '#00CC7A']} style={modal.plateBtnGrad}>
                <Text style={modal.plateBtnText}>Verify & Proceed</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowPlateVerify(false)} style={{ marginTop: 10 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                Skip for now
              </Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#050810' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  liveBadge:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,77,77,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,77,77,0.3)' },
  liveDot:      { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF4D4D' },
  liveText:     { fontFamily: 'Outfit_700Bold', fontSize: 11, color: '#FF4D4D', letterSpacing: 1 },
  headerTitle:  { fontFamily: 'Outfit_700Bold', fontSize: 18, color: '#fff' },
  closeBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  scroll:       { paddingHorizontal: 20, paddingTop: 4, gap: 14 },

  etaBanner:    { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(0,207,255,0.2)', padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' },
  etaLabel:     { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
  etaValue:     { fontFamily: 'Outfit_700Bold', fontSize: 26, color: theme.colors.primary },
  etaIconBox:   { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(0,207,255,0.1)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  card:         { borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', padding: 16, backgroundColor: 'rgba(13,20,32,0.5)' },
  cardTitle:    { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#fff', marginBottom: 4 },
  stepStatus:   { fontFamily: 'Inter_400Regular', fontSize: 12, color: theme.colors.primary, marginBottom: 14 },

  stepRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepIconCol:  { alignItems: 'center', width: 28 },
  stepIcon:     { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  stepIconDone: { backgroundColor: '#00FF97', borderColor: '#00FF97' },
  stepIconActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  stepLine:     { width: 2, height: 22, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 2 },
  stepLineDone: { backgroundColor: '#00FF97' },
  stepLabel:    { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.35)', paddingTop: 6, flex: 1 },
  stepLabelDone: { color: '#00FF97' },
  stepLabelActive: { color: '#fff', fontFamily: 'Outfit_700Bold' },

  driverRow:        { flexDirection: 'row', alignItems: 'center' },
  driverAvatar:     { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0,207,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,207,255,0.3)', flexShrink: 0 },
  driverAvatarText: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: theme.colors.primary },
  driverName:       { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#fff' },
  ratingRow:        { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText:       { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  driverPlate:      { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2, flexShrink: 1 },
  driverActions:    { marginLeft: 8, flexShrink: 0 },
  actionBtn:        { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,207,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,207,255,0.25)' },
  maskedNote:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)' },
  maskedNoteText:   { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.4)', flex: 1 },

  otpCard:      { borderColor: 'rgba(255,214,10,0.25)', backgroundColor: 'rgba(255,214,10,0.04)', alignItems: 'center', gap: 10, overflow: 'hidden' },
  otpHeader:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  otpTitle:     { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#FFD60A' },
  otpDigits:    { flexDirection: 'row', gap: 10 },
  otpDigitBox:  { width: 52, height: 60, borderRadius: 14, backgroundColor: 'rgba(255,214,10,0.08)', borderWidth: 1.5, borderColor: 'rgba(255,214,10,0.3)', alignItems: 'center', justifyContent: 'center' },
  otpDigit:     { fontFamily: 'Outfit_700Bold', fontSize: 28, color: '#FFD60A' },
  otpHint:      { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },

  routeBlock:   { flexDirection: 'row', gap: 12 },
  routeDots:    { alignItems: 'center', paddingTop: 4 },
  greenDot:     { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00FF97' },
  dashedLine:   { width: 2, height: 24, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 3 },
  redDot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF4D4D' },
  routeLabel:   { fontFamily: 'Outfit_700Bold', fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, marginBottom: 2 },
  routeAddr:    { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.85)', flexShrink: 1 },
  metaRow:      { flexDirection: 'row', gap: 8, marginTop: 12 },
  metaChip:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,207,255,0.06)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(0,207,255,0.15)' },
  metaText:     { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.6)' },

  bottomBar:    { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, backgroundColor: 'rgba(5,8,16,0.95)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  cancelBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 100, borderWidth: 1.5, borderColor: 'rgba(255,77,77,0.3)', backgroundColor: 'rgba(255,77,77,0.06)' },
  cancelBtnText:{ fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#FF4D4D' },
  noCancelNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 },
  noCancelText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.3)' },
});

const modal = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  // Chat
  container:      { backgroundColor: '#0D1420', borderTopLeftRadius: 28, borderTopRightRadius: 28, height: '60%', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,207,255,0.2)', borderBottomWidth: 0 },
  chatHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  chatTitle:      { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#fff' },
  chatSub:        { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  closeBtn:       { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  chatBody:       { flex: 1 },
  bubble:         { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, borderBottomLeftRadius: 4, padding: 12, maxWidth: '80%' },
  bubbleMe:       { alignSelf: 'flex-end', backgroundColor: 'rgba(0,207,255,0.15)', borderRadius: 14, borderBottomRightRadius: 4 },
  bubbleText:     { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  bubbleTextMe:   { color: '#fff' },
  chatInput:      { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', gap: 10 },
  input:          { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 100, paddingHorizontal: 16, paddingVertical: 10, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sendBtn:        { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  // Cancel
  cancelContainer:{ borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, overflow: 'hidden', backgroundColor: 'rgba(13,20,32,0.95)', borderWidth: 1, borderColor: 'rgba(255,77,77,0.2)', borderBottomWidth: 0 },
  cancelTitle:    { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#fff', marginBottom: 14 },
  feeBox:         { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(255,77,77,0.06)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,77,77,0.2)', marginBottom: 16 },
  feeText:        { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 18 },
  cancelSubtitle: { fontFamily: 'Outfit_700Bold', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 10 },
  reasonRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  reasonRowActive:{ backgroundColor: 'rgba(0,207,255,0.06)', borderRadius: 10, paddingHorizontal: 8 },
  radioOuter:     { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  radioOuterActive:{ borderColor: theme.colors.primary },
  radioInner:     { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary },
  reasonText:     { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  cancelBtns:     { flexDirection: 'row', gap: 10, marginTop: 20 },
  goBackBtn:      { flex: 1, paddingVertical: 14, borderRadius: 100, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  goBackText:     { fontFamily: 'Outfit_700Bold', fontSize: 15, color: 'rgba(255,255,255,0.7)' },
  confirmCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 100, backgroundColor: 'rgba(255,77,77,0.15)', borderWidth: 1.5, borderColor: 'rgba(255,77,77,0.4)', alignItems: 'center' },
  confirmCancelText: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#FF4D4D' },
  // Plate verify
  plateContainer: { margin: 24, borderRadius: 24, padding: 24, alignItems: 'center', overflow: 'hidden', backgroundColor: 'rgba(13,20,32,0.95)', borderWidth: 1, borderColor: 'rgba(0,207,255,0.2)' },
  plateTitle:     { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#fff', marginBottom: 8 },
  plateSub:       { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  plateBadge:     { backgroundColor: 'rgba(0,207,255,0.1)', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(0,207,255,0.3)', marginBottom: 16 },
  plateBadgeText: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: theme.colors.primary, letterSpacing: 4 },
  plateInput:     { width: '100%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontFamily: 'Inter_500Medium', fontSize: 16, color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', textAlign: 'center', letterSpacing: 3, marginBottom: 14 },
  plateBtn:       { width: '100%', borderRadius: 100, overflow: 'hidden' },
  plateBtnGrad:   { paddingVertical: 14, alignItems: 'center' },
  plateBtnText:   { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000' },
});
