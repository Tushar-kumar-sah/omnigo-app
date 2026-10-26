import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { fetchCurrentUser, fetchUserBookings, fetchActiveBooking, cancelUserBooking } from '@/lib/api';

const AI_CAPTIONS = [
  "How can I help you?",
  "Need a quick tow?",
  "Engine issue? Ask me!",
  "Battery dead? Tap here!",
  "Emergency assist 24/7",
  "Instant rescue active!",
];

const BOOK_TOW_TRUCK_IMG = require('@/assets/book_tow_truck.png');

const CardWrapper = React.memo(({ style, children }: { style: any; children: React.ReactNode }) => {
  return <View style={[style, Platform.OS !== 'ios' && { backgroundColor: 'rgba(13, 20, 40, 0.92)' }]}>{children}</View>;
});

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [captionIndex, setCaptionIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  const [user, setUser] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [activeBooking, setActiveBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      if (currentUser?.id || currentUser?.uuid) {
        const uid = currentUser.uuid || currentUser.id;
        const [bookingsData, active] = await Promise.all([
          fetchUserBookings(uid),
          fetchActiveBooking(uid),
        ]);
        setRecentBookings(bookingsData.slice(0, 3));
        const activeStatus = (active?.status || active?.bookingStatus || '').toLowerCase();
        if (active && activeStatus !== 'cancelled' && activeStatus !== 'completed') {
          setActiveBooking(active);
        } else {
          setActiveBooking(null);
        }
      }
    } catch (e) {
      console.warn('[Home] data fetch error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCancelActiveBooking = () => {
    if (!activeBooking) return;
    const targetId = activeBooking.uuid || activeBooking.id;
    Alert.alert(
      'Cancel Towing Booking?',
      'Are you sure you want to cancel this booking? This will immediately dismiss the active ride and release the driver.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel Ride',
          style: 'destructive',
          onPress: async () => {
            try {
              setActiveBooking(null);
              await cancelUserBooking(targetId, 'Cancelled by user from home');
              if (user) {
                const uid = user.uuid || user.id;
                if (uid) {
                  const bList = await fetchUserBookings(uid);
                  setRecentBookings(bList.slice(0, 3));
                }
              }
              Alert.alert('Booking Cancelled', 'Your towing request has been cancelled.');
            } catch (e) {
              console.warn('[Home] cancel booking error', e);
            }
          },
        },
      ]
    );
  };

  // Real-time synchronization of active booking: automatically clears card when cancelled or completed
  useEffect(() => {
    if (!user) return;
    const uid = user.uuid || user.id;
    if (!uid) return;

    let isMounted = true;

    // Fast 2.5s polling loop to immediately detect when a driver or customer cancels/completes the ride
    const interval = setInterval(async () => {
      try {
        const latestActive = await fetchActiveBooking(uid);
        if (isMounted) {
          const status = (latestActive?.status || latestActive?.bookingStatus || '').toLowerCase();
          if (!latestActive || status === 'cancelled' || status === 'completed') {
            setActiveBooking((prev: any) => {
              if (prev) {
                fetchUserBookings(uid).then((bList) => {
                  if (isMounted) setRecentBookings(bList.slice(0, 3));
                }).catch(() => {});
              }
              return null;
            });
          } else {
            setActiveBooking(latestActive);
          }
        }
      } catch (_) {}
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  const handleStartBooking = (targetRoute: string) => {
    if (activeBooking) {
      Alert.alert(
        'Active Tow in Progress',
        'You already have an active tow truck in progress. A new booking can only be placed once your current vehicle has been dropped off at the destination.',
        [
          {
            text: 'Track Current Tow',
            style: 'default',
            onPress: () => {
              router.push({
                pathname: '/booking/tracking',
                params: {
                  bookingId: activeBooking.uuid || activeBooking.id,
                  driverId: activeBooking.driverId || activeBooking.driver_id,
                },
              });
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    router.push(targetRoute as any);
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: -1, duration: 350, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(1500),
      ])
    ).start();

    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setCaptionIndex((prev) => (prev + 1) % AI_CAPTIONS.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const waveRotate = waveAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-12deg', '0deg', '12deg'],
  });

  const waveScale = waveAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0.96, 1.0, 1.08],
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFill} />
        <Text style={{ color: '#00CFFF', fontFamily: 'Outfit_600SemiBold' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top + 10, 44), paddingBottom: Math.max(insets.bottom + 110, 120) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBadge}>
              <Image source={require('@/assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.greetingText}>Good Morning</Text>
              <Text style={styles.welcomeText} numberOfLines={1} ellipsizeMode="tail">
                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileAvatarBtn} onPress={() => router.push('/(tabs)/profile')}>
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.profileAvatarImg}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient colors={['#00FF97', '#00CFFF']} style={styles.profileAvatarGradient}>
                  <Ionicons name="person" size={18} color="#000000" />
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Search Box + AI Avatar */}
        <View style={styles.searchSectionContainer}>
          <View style={styles.searchRowWithExternalAi}>
            <View style={styles.searchBoxLeft}>
              <Ionicons name="search" size={18} color="rgba(255, 255, 255, 0.4)" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search services, towing..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
              />
            </View>

            {/* AI Avatar - no shadow on Android to avoid blob effect */}
            <TouchableOpacity
              style={styles.aiAvatarExternalBtn}
              onPress={() => router.push('/ai-assistant')}
              activeOpacity={0.8}
            >
              <Animated.View style={[styles.aiAvatarInner, { transform: [{ rotate: waveRotate }, { scale: waveScale }] }]}>
                <Image source={require('@/assets/ai_mascot.png')} style={styles.aiAvatarImg} resizeMode="contain" />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2.5 Active Tow in Progress Banner (Strict 1 Active Booking Policy) */}
        {activeBooking && (
          <View style={styles.activeTowCardContainer}>
            <LinearGradient
              colors={['rgba(0, 255, 151, 0.18)', 'rgba(0, 207, 255, 0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.activeTowGradient}
            >
              <View style={styles.activeTowHeader}>
                <View style={styles.activeTowPill}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.activeTowPillText}>ACTIVE TOW IN PROGRESS</Text>
                </View>
                <Text style={styles.activeTowBookingNumber}>
                  {(activeBooking as any)?.bookingNumber || (activeBooking as any)?.displayId || 'JOB-ACTIVE'}
                </Text>
              </View>

              <View style={styles.activeTowBody}>
                <View style={styles.activeTowIconWrap}>
                  <MaterialCommunityIcons name="tow-truck" size={26} color="#00FF97" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.activeTowStatusText}>
                    Status: {activeBooking.status || 'En Route'}
                  </Text>
                  <Text style={styles.activeTowVehicleText} numberOfLines={1}>
                    {activeBooking.vehicle || activeBooking.customerVehicle?.model || 'Vehicle Tow'}
                  </Text>
                  <Text style={styles.activeTowRouteText} numberOfLines={1}>
                    {activeBooking.pickup || 'Pickup Location'} → {activeBooking.drop || 'Drop Location'}
                  </Text>
                </View>
              </View>

              <View style={styles.activeTowActionsRow}>
                <TouchableOpacity
                  style={[styles.activeTowTrackBtn, { flex: 1 }]}
                  onPress={() =>
                    router.push({
                      pathname: '/booking/tracking',
                      params: {
                        bookingId: activeBooking.uuid || activeBooking.id,
                        driverId: activeBooking.driverId || activeBooking.driver_id,
                      },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Ionicons name="navigate" size={16} color="#050810" />
                  <Text style={styles.activeTowTrackBtnText}>Track Live Booking</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.activeTowCancelBtn}
                  onPress={handleCancelActiveBooking}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle-outline" size={16} color="#F43F5E" />
                  <Text style={styles.activeTowCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* 3. Quick Actions + AI Callout Pill on Same Compact Row */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.aiCalloutBelowContainer}
            onPress={() => router.push('/ai-assistant')}
            activeOpacity={0.8}
          >
            <View style={styles.aiSpeechBubbleCalloutBelow}>
              <Ionicons name="sparkles" size={12} color="#00CFFF" style={{ marginRight: 4 }} />
              <Animated.View style={{ opacity: fadeAnim }}>
                <Text style={styles.aiSpeechTextCallout}>{AI_CAPTIONS[captionIndex]}</Text>
              </Animated.View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Card 1: Book Tow */}
        <TouchableOpacity
          style={styles.actionCardTouch}
          onPress={() => handleStartBooking('/booking/select-vehicle')}
          activeOpacity={0.85}
        >
          <CardWrapper style={[styles.actionCard, styles.bookTowBorder]}>
            <LinearGradient
              colors={['rgba(0, 207, 255, 0.38)', 'rgba(0, 255, 151, 0.12)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Book Tow</Text>
              <Text style={styles.cardSubtitle}>Instant dispatch to your location</Text>
            </View>
            <View style={styles.cardRightGraphic}>
              <Image source={BOOK_TOW_TRUCK_IMG} style={styles.towTruckThumb} resizeMode="contain" fadeDuration={0} />
            </View>
          </CardWrapper>
        </TouchableOpacity>

        {/* Card 2: Schedule Tow */}
        <TouchableOpacity
          style={styles.actionCardTouch}
          onPress={() => handleStartBooking('/booking/schedule-tow')}
          activeOpacity={0.85}
        >
          <CardWrapper style={[styles.actionCard, styles.scheduleTowBorder]}>
            <LinearGradient
              colors={['rgba(0, 255, 151, 0.38)', 'rgba(0, 207, 255, 0.12)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Schedule Tow</Text>
              <Text style={styles.cardSubtitle}>Plan a pickup for later</Text>
            </View>
            <View style={styles.scheduleIconBadge}>
              <Ionicons name="calendar-outline" size={24} color="#00FF97" />
            </View>
          </CardWrapper>
        </TouchableOpacity>

        {/* Card 3: Emergency SOS */}
        <TouchableOpacity
          style={styles.actionCardTouch}
          onPress={() => router.push('/(tabs)/sos')}
          activeOpacity={0.85}
        >
          <CardWrapper style={[styles.actionCard, styles.emergencySosBorder]}>
            <LinearGradient
              colors={['rgba(255, 59, 48, 0.40)', 'rgba(255, 149, 0, 0.12)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Emergency SOS</Text>
              <Text style={styles.cardSubtitle}>Immediate roadside assistance</Text>
            </View>
            <View style={styles.sosBadge}>
              <Text style={styles.sosText}>SOS</Text>
            </View>
          </CardWrapper>
        </TouchableOpacity>

        {/* 4. Recent Activity */}
        <View style={styles.recentSectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/wallet')}>
            <Text style={styles.viewAllText}>View All &gt;</Text>
          </TouchableOpacity>
        </View>

        {recentBookings.length === 0 && (
          <View style={styles.emptyActivity}>
            <Ionicons name="car-sport-outline" size={36} color="rgba(255,255,255,0.12)" />
            <Text style={styles.emptyActivityText}>No recent bookings</Text>
          </View>
        )}

        {recentBookings.map((booking, idx) => {
          const rawStatus = (booking.status || booking.bookingStatus || '').toLowerCase();
          const isActive = rawStatus !== 'completed' && rawStatus !== 'cancelled';
          return (
            <TouchableOpacity
              key={booking.id || booking.uuid || idx}
              style={styles.activityItemTouch}
              activeOpacity={0.8}
              onPress={() => {
                if (isActive) {
                  router.push({
                    pathname: '/booking/tracking',
                    params: { bookingId: booking.uuid || booking.id || booking.booking_number, driverId: booking.driver_id || booking.driverId },
                  });
                } else {
                  router.push('/(tabs)/bookings');
                }
              }}
            >
              <View style={styles.activityItem}>
                <View style={[styles.activityIconBadge, { backgroundColor: isActive ? 'rgba(0, 255, 151, 0.18)' : 'rgba(0, 207, 255, 0.15)' }]}>
                  <Ionicons name={isActive ? 'navigate' : 'car-sport'} size={20} color={isActive ? '#00FF97' : '#00CFFF'} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{booking.service_type || booking.service || 'Tow Service'}</Text>
                  <Text style={styles.activitySubtitle} numberOfLines={1}>
                    {booking.pickup ||
                      (typeof booking.pickup_location === 'object' ? booking.pickup_location?.address : null) ||
                      'Unknown Location'}
                  </Text>
                </View>
                <View style={styles.activityRight}>
                  <Text style={styles.activityAmount}>₹{booking.price || booking.estimatedPrice || booking.fare || 0}</Text>
                  <Text style={[styles.activityTime, isActive && { color: '#00FF97', fontFamily: 'Outfit_700Bold' }]}>
                    {isActive ? '● Live Track' : booking.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  androidCard: {
    backgroundColor: 'rgba(13, 20, 40, 0.92)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  headerTextWrap: {
    flex: 1,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 207, 255, 0.4)',
    marginRight: 10,
  },
  logoImg: {
    width: 30,
    height: 30,
  },
  greetingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  welcomeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#00FF97',
  },
  profileAvatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#00FF97',
  },
  profileAvatarImg: {
    width: '100%',
    height: '100%',
  },
  profileAvatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSectionContainer: {
    marginBottom: 8,
  },
  searchRowWithExternalAi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBoxLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 20, 32, 0.65)',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  aiAvatarExternalBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#00CFFF',
    backgroundColor: '#0A1222',
    overflow: 'hidden',
    // No shadow/elevation to prevent cyan blob on Android
  },
  aiAvatarInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarImg: {
    width: '120%',
    height: '135%',
    top: 2,
    alignSelf: 'center',
  },
  aiCalloutBelowContainer: {
    marginRight: 2,
  },
  aiSpeechBubbleCalloutBelow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#00CFFF',
  },
  aiSpeechTextCallout: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    color: '#00CFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  actionCardTouch: {
    marginBottom: 14,
    borderRadius: 22,
    overflow: 'hidden',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  bookTowBorder: {
    backgroundColor: 'rgba(10, 28, 60, 0.65)',
    borderColor: '#00CFFF',
    elevation: 4,
  },
  scheduleTowBorder: {
    backgroundColor: 'rgba(8, 38, 42, 0.65)',
    borderColor: '#00FF97',
    elevation: 4,
  },
  emergencySosBorder: {
    backgroundColor: 'rgba(42, 14, 24, 0.65)',
    borderColor: '#FF3B30',
    elevation: 4,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 4,
  },
  cardRightGraphic: {
    width: 115,
    height: 64,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: -14,
    marginVertical: -6,
  },
  towTruckThumb: {
    width: '100%',
    height: '100%',
  },
  scheduleIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 255, 151, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.3)',
  },
  sosBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF3B30',
  },
  sosText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: '#FF3B30',
    letterSpacing: 0.5,
  },
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  viewAllText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    color: '#00CFFF',
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 10,
  },
  emptyActivityText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
  },
  activityItemTouch: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(14, 24, 48, 0.92)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  activityIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  activitySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.55)',
    marginTop: 2,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#00FF97',
  },
  activityTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 2,
  },
  activeTowCardContainer: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#00FF97',
  },
  activeTowGradient: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(5, 24, 20, 0.95)',
  },
  activeTowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeTowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 151, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.3)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF97',
    marginRight: 6,
  },
  activeTowPillText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    color: '#00FF97',
    letterSpacing: 0.5,
  },
  activeTowBookingNumber: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activeTowBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  activeTowIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 255, 151, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.3)',
  },
  activeTowStatusText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#00FF97',
    marginBottom: 2,
  },
  activeTowVehicleText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  activeTowRouteText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 2,
  },
  activeTowTrackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FF97',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  activeTowTrackBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: '#050810',
  },
  activeTowActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  activeTowCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 5,
  },
  activeTowCancelBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: '#F43F5E',
  },
});
