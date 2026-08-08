import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Animated,
  Easing,
  Modal,
  Vibration,
} from 'react-native';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const INCOMING_JOB = {
  id: 'JOB-7821',
  customerName: 'Rahul Sharma',
  vehicleType: 'Sedan — Honda City',
  vehicleColor: 'White',
  plateNo: 'KA 01 MH 4521',
  issue: 'Flat tyre — needs towing',
  pickupAddress: 'MG Road, Near Brigade Gateway, Bangalore',
  dropAddress: 'AutoFix Garage, Whitefield, Bangalore',
  distance: '4.2 km',
  estimatedEarning: '₹475',
  estimatedTime: '15 min',
};

export default function HomeScreen() {
  const [isOnline, setIsOnline] = useState(false);
  const [showJobPopup, setShowJobPopup] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const [jobAccepted, setJobAccepted] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Animations
  const slideAnim = useRef(new Animated.Value(300)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  // Show popup 3 seconds after going online
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOnline && !jobAccepted) {
      timeout = setTimeout(() => {
        setShowJobPopup(true);
        setCountdown(20);
        Vibration.vibrate([0, 400, 200, 400]);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [isOnline, jobAccepted]);

  // Slide in animation
  useEffect(() => {
    if (showJobPopup) {
      slideAnim.setValue(300);
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Start countdown progress
      progressAnim.setValue(1);
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      // Pulse the earning
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [showJobPopup]);

  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showJobPopup && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && showJobPopup) {
      handleDecline();
    }
    return () => clearInterval(interval);
  }, [showJobPopup, countdown]);

  const handleAccept = () => {
    setShowJobPopup(false);
    setJobAccepted(true);
    router.push('/job/incoming');
  };

  const handleDecline = () => {
    setShowJobPopup(false);
    setCountdown(20);
  };

  const handleToggleOnline = (value: boolean) => {
    setIsOnline(value);
    if (!value) {
      setShowJobPopup(false);
      setJobAccepted(false);
      setCountdown(20);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top + 10, 50) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>Hello, Driver 👋</Text>
            <Text style={styles.greetingSub}>Ready to hit the road?</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Go Online / Offline Card */}
        <BlurView intensity={25} tint="dark" style={styles.onlineCard}>
          <View style={styles.onlineLeft}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#00FF97' : '#FF4D4D' }]} />
            <View>
              <Text style={styles.onlineStatus}>{isOnline ? 'You are Online' : 'You are Offline'}</Text>
              <Text style={styles.onlineHint}>
                {isOnline ? 'Waiting for new jobs...' : 'Go online to receive jobs'}
              </Text>
            </View>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: '#333', true: 'rgba(0,255,151,0.3)' }}
            thumbColor={isOnline ? '#00FF97' : '#ccc'}
          />
        </BlurView>

        {/* Today's Summary */}
        <BlurView intensity={20} tint="dark" style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="wallet-outline" size={22} color="#00FF97" />
              <Text style={styles.statValue}>₹1,425</Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Ionicons name="car-outline" size={22} color={THEME.colors.primary} />
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Ionicons name="star-outline" size={22} color="#FFD60A" />
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </BlurView>

        {/* Quick Actions */}
        <Text style={styles.sectionTitleStandalone}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8} onPress={() => router.push('/job/incoming')}>
            <LinearGradient colors={['rgba(0,207,255,0.12)', 'rgba(0,207,255,0.04)']} style={styles.actionGradient}>
              <View style={styles.actionIcon}><Ionicons name="flash" size={24} color={THEME.colors.primary} /></View>
              <Text style={styles.actionText}>New Job</Text>
              <Text style={styles.actionHint}>Demo request</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8} onPress={() => router.push('/(tabs)/earnings')}>
            <LinearGradient colors={['rgba(0,255,151,0.12)', 'rgba(0,255,151,0.04)']} style={styles.actionGradient}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(0,255,151,0.12)' }]}><Ionicons name="trending-up" size={24} color="#00FF97" /></View>
              <Text style={styles.actionText}>Earnings</Text>
              <Text style={styles.actionHint}>View details</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8} onPress={() => router.push('/(tabs)/history')}>
            <LinearGradient colors={['rgba(255,214,10,0.12)', 'rgba(255,214,10,0.04)']} style={styles.actionGradient}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(255,214,10,0.12)' }]}><Ionicons name="time" size={24} color="#FFD60A" /></View>
              <Text style={styles.actionText}>History</Text>
              <Text style={styles.actionHint}>Past jobs</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8} onPress={() => router.push('/(tabs)/profile')}>
            <LinearGradient colors={['rgba(168,85,247,0.12)', 'rgba(168,85,247,0.04)']} style={styles.actionGradient}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(168,85,247,0.12)' }]}><Ionicons name="person" size={24} color="#A855F7" /></View>
              <Text style={styles.actionText}>Profile</Text>
              <Text style={styles.actionHint}>Your info</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Job */}
        <Text style={styles.sectionTitleStandalone}>Recent Job</Text>
        <BlurView intensity={20} tint="dark" style={styles.recentCard}>
          <View style={styles.recentTop}>
            <View style={styles.recentBadge}><Text style={styles.recentBadgeText}>COMPLETED</Text></View>
            <Text style={styles.recentEarning}>+₹475</Text>
          </View>
          <View style={styles.recentRoute}>
            <View style={styles.routeDots}>
              <View style={styles.greenDot} />
              <View style={styles.dashedLine} />
              <View style={styles.redDot} />
            </View>
            <View style={styles.routeTexts}>
              <Text style={styles.routeText}>MG Road, Bangalore</Text>
              <Text style={[styles.routeText, { marginTop: 18 }]}>Whitefield, Bangalore</Text>
            </View>
          </View>
          <View style={styles.recentMeta}>
            <View style={styles.metaItem}><Ionicons name="navigate-outline" size={14} color={THEME.colors.textSecondary} /><Text style={styles.metaText}>12.5 km</Text></View>
            <View style={styles.metaItem}><Ionicons name="time-outline" size={14} color={THEME.colors.textSecondary} /><Text style={styles.metaText}>35 min</Text></View>
            <View style={styles.metaItem}><Ionicons name="star" size={14} color="#FFD60A" /><Text style={styles.metaText}>5.0</Text></View>
          </View>
        </BlurView>

        {/* Tip */}
        <BlurView intensity={15} tint="dark" style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={20} color="#FFD60A" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>💡 Tip</Text>
            <Text style={styles.tipText}>Stay online during peak hours (8-10 AM, 5-8 PM) to get more jobs and earn extra!</Text>
          </View>
        </BlurView>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ========== INCOMING JOB POPUP ========== */}
      <Modal visible={showJobPopup} transparent animationType="none" statusBarTranslucent>
        <View style={popup.overlay}>
          <Animated.View style={[popup.container, { transform: [{ translateY: slideAnim }] }]}>
            {/* Countdown Progress Bar */}
            <Animated.View
              style={[
                popup.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />

            {/* Header */}
            <View style={popup.header}>
              <View style={popup.headerLeft}>
                <View style={popup.flashIcon}>
                  <Ionicons name="flash" size={20} color="#FFD60A" />
                </View>
                <View>
                  <Text style={popup.headerTitle}>New Job Request!</Text>
                  <Text style={popup.headerId}>{INCOMING_JOB.id}</Text>
                </View>
              </View>
              <View style={popup.timerBox}>
                <Text style={popup.timerText}>{countdown}s</Text>
              </View>
            </View>

            {/* Earning */}
            <Animated.View style={[popup.earningRow, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={popup.earningLabel}>Estimated Earning</Text>
              <Text style={popup.earningValue}>{INCOMING_JOB.estimatedEarning}</Text>
            </Animated.View>

            {/* Job Details */}
            <View style={popup.detailsCard}>
              {/* Customer */}
              <View style={popup.detailRow}>
                <Ionicons name="person-outline" size={16} color={THEME.colors.primary} />
                <Text style={popup.detailLabel}>Customer</Text>
                <Text style={popup.detailValue}>{INCOMING_JOB.customerName}</Text>
              </View>

              {/* Vehicle */}
              <View style={popup.detailRow}>
                <Ionicons name="car-outline" size={16} color={THEME.colors.primary} />
                <Text style={popup.detailLabel}>Vehicle</Text>
                <Text style={popup.detailValue}>{INCOMING_JOB.vehicleType}</Text>
              </View>

              {/* Issue */}
              <View style={popup.detailRow}>
                <Ionicons name="warning-outline" size={16} color="#FFD60A" />
                <Text style={popup.detailLabel}>Issue</Text>
                <Text style={popup.detailValue}>{INCOMING_JOB.issue}</Text>
              </View>

              {/* Pickup */}
              <View style={popup.routeRow}>
                <View style={popup.routeIcon}><View style={popup.greenDotSmall} /></View>
                <View style={popup.routeContent}>
                  <Text style={popup.routeLabel}>PICKUP</Text>
                  <Text style={popup.routeAddress}>{INCOMING_JOB.pickupAddress}</Text>
                </View>
              </View>

              {/* Drop */}
              <View style={popup.routeRow}>
                <View style={popup.routeIcon}><View style={popup.redDotSmall} /></View>
                <View style={popup.routeContent}>
                  <Text style={popup.routeLabel}>DROP</Text>
                  <Text style={popup.routeAddress}>{INCOMING_JOB.dropAddress}</Text>
                </View>
              </View>
            </View>

            {/* Distance & Time Tags */}
            <View style={popup.tagsRow}>
              <View style={popup.tag}>
                <Ionicons name="navigate-outline" size={14} color={THEME.colors.primary} />
                <Text style={popup.tagText}>{INCOMING_JOB.distance} away</Text>
              </View>
              <View style={popup.tag}>
                <Ionicons name="time-outline" size={14} color={THEME.colors.primary} />
                <Text style={popup.tagText}>~{INCOMING_JOB.estimatedTime}</Text>
              </View>
              <View style={popup.tag}>
                <Ionicons name="car-sport-outline" size={14} color={THEME.colors.primary} />
                <Text style={popup.tagText}>{INCOMING_JOB.vehicleColor}</Text>
              </View>
            </View>

            {/* Accept / Decline Buttons */}
            <View style={popup.buttonsRow}>
              <TouchableOpacity style={popup.declineBtn} onPress={handleDecline} activeOpacity={0.8}>
                <Ionicons name="close" size={22} color="#FF4D4D" />
                <Text style={popup.declineBtnText}>Decline</Text>
              </TouchableOpacity>

              <TouchableOpacity style={popup.acceptBtnTouch} onPress={handleAccept} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#00FF97', '#00CC7A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={popup.acceptBtn}
                >
                  <Ionicons name="checkmark" size={22} color="#000" />
                  <Text style={popup.acceptBtnText}>Accept</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050810' },
  scrollContent: { paddingHorizontal: 20 },
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontFamily: 'Outfit_700Bold', fontSize: 26, color: '#fff' },
  greetingSub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  notifDot: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4D4D' },
  onlineCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(13,20,32,0.5)', marginBottom: 18, overflow: 'hidden' },
  onlineLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: { width: 14, height: 14, borderRadius: 7, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8 },
  onlineStatus: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#fff' },
  onlineHint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  summaryCard: { borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(13,20,32,0.5)', marginBottom: 24, overflow: 'hidden' },
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#fff', marginBottom: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontFamily: 'Outfit_700Bold', fontSize: 22, color: '#fff', marginTop: 6 },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.08)' },
  sectionTitleStandalone: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#fff', marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  actionCard: { width: '47%', borderRadius: 16, overflow: 'hidden' },
  actionGradient: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  actionIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(0,207,255,0.12)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionText: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#fff' },
  actionHint: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  recentCard: { borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(13,20,32,0.5)', marginBottom: 18, overflow: 'hidden' },
  recentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  recentBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, backgroundColor: 'rgba(0,255,151,0.12)', borderWidth: 1, borderColor: 'rgba(0,255,151,0.25)' },
  recentBadgeText: { fontFamily: 'Outfit_700Bold', fontSize: 10, color: '#00FF97', letterSpacing: 1 },
  recentEarning: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: '#00FF97' },
  recentRoute: { flexDirection: 'row', marginBottom: 14 },
  routeDots: { alignItems: 'center', marginRight: 12, paddingTop: 4 },
  greenDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00FF97' },
  dashedLine: { width: 2, height: 20, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 2 },
  redDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF4D4D' },
  routeTexts: { flex: 1 },
  routeText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  recentMeta: { flexDirection: 'row', gap: 18 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  tipCard: { flexDirection: 'row', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,214,10,0.15)', backgroundColor: 'rgba(255,214,10,0.04)', gap: 12, alignItems: 'flex-start', marginBottom: 10, overflow: 'hidden' },
  tipContent: { flex: 1 },
  tipTitle: { fontFamily: 'Outfit_700Bold', fontSize: 13, color: '#FFD60A', marginBottom: 2 },
  tipText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 17 },
});

// ==================== POPUP STYLES ====================

const popup = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0D1420',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 34,
    borderWidth: 1,
    borderColor: 'rgba(0,207,255,0.2)',
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#00FF97',
    borderRadius: 2,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flashIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,214,10,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 17,
    color: '#fff',
  },
  headerId: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 1,
  },
  timerBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,77,77,0.12)',
    borderWidth: 2,
    borderColor: '#FF4D4D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    color: '#FF4D4D',
  },
  earningRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,151,0.06)',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,255,151,0.2)',
    marginBottom: 14,
  },
  earningLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  earningValue: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 32,
    color: '#00FF97',
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: 'rgba(13,20,32,0.6)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    width: 65,
  },
  detailValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#fff',
    flex: 1,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 4,
  },
  routeIcon: {
    width: 20,
    alignItems: 'center',
    paddingTop: 2,
  },
  greenDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF97',
  },
  redDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4D4D',
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1,
    marginBottom: 2,
  },
  routeAddress: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: 'rgba(0,207,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,207,255,0.15)',
  },
  tagText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(255,77,77,0.35)',
    backgroundColor: 'rgba(255,77,77,0.08)',
  },
  declineBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#FF4D4D',
  },
  acceptBtnTouch: {
    flex: 2,
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 100,
  },
  acceptBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#000',
  },
});
