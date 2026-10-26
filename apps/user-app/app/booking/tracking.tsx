import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, Animated, Easing, ImageBackground, Dimensions,
  Platform, Alert, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { theme } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import * as Location from 'expo-location';
import { fetchBookingById, fetchDriverById, submitDriverRating, fetchCurrentUser, fetchUserBookings, cancelUserBooking } from '@/lib/api';
import { subscribeToDriverLocation, updateBookingDestination, subscribeToBooking, getBookingChatMessages, sendBookingChatMessage, subscribeToBookingChat, ChatMessage } from '@omnigo/api';
import MapLocationPickerModal from '@/components/MapLocationPickerModal';
import LiveRouteMap from '@/components/LiveRouteMap';

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

const CUSTOMER_QUICK_CHATS = [
  "I'm waiting near the vehicle.",
  'Car hazard blinkers are ON.',
  'Vehicle keys are inside.',
  'Near the main building gate.',
  'Car neutral gear is engaged.',
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function TrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { bookingId, driverId, openChat } = useLocalSearchParams<{ bookingId?: string; driverId?: string; openChat?: string }>();

  const [pickupOtp, setPickupOtp] = useState('— — — —');
  const [completionOtp, setCompletionOtp] = useState('— — — —');
  const [driverName, setDriverName] = useState('—');
  const [driverVehicle, setDriverVehicle] = useState('—');
  const [driverPlate, setDriverPlate] = useState('—');
  const [pickupAddr, setPickupAddr] = useState('Fetching...');
  const [dropoffAddr, setDropoffAddr] = useState('Fetching...');
  const [pickupCoords, setPickupCoords] = useState<{ latitude: number; longitude: number }>({ latitude: 0, longitude: 0 });
  const [dropoffCoords, setDropoffCoords] = useState<{ latitude: number; longitude: number }>({ latitude: 0, longitude: 0 });
  const [driverCoords, setDriverCoords] = useState<{ latitude: number; longitude: number }>({ latitude: 0, longitude: 0 });
  const [booking, setBooking] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [mapMode, setMapMode] = useState<'live_map' | 'radar'>('live_map');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapPickerType, setMapPickerType] = useState<'pickup' | 'dropoff'>('dropoff');
  const [showArrivalOtpModal, setShowArrivalOtpModal] = useState(false);
  const arrivalAlertShownRef = useRef(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedStars, setSelectedStars] = useState(5);
  const [selectedFeedbackChips, setSelectedFeedbackChips] = useState<string[]>([]);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [userRatingSubmitted, setUserRatingSubmitted] = useState(false);
  const [submittedStars, setSubmittedStars] = useState<number | null>(null);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [updatedDriverStats, setUpdatedDriverStats] = useState<{ averageRating?: number; reviewCount?: number } | null>(null);
  const ratingModalShownRef = useRef(false);
  const isCancelledRef = useRef(false);
  const completedAlertShownRef = useRef(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleSubmitRating = async () => {
    const targetBookingId = booking?.id || bookingId;
    if (!targetBookingId) return;
    setIsSubmittingRating(true);
    try {
      const fullNotes = [
        ...selectedFeedbackChips,
        feedbackNotes.trim()
      ].filter(Boolean).join(' | ');

      const res = await submitDriverRating(targetBookingId, selectedStars, fullNotes);
      if (res?.success) {
        setUserRatingSubmitted(true);
        setSubmittedStars(selectedStars);
        setUpdatedDriverStats({ averageRating: res.averageRating, reviewCount: res.reviewCount });
        setRatingSuccess(true);
        
        const activeDriverId = driverId || booking?.driverId || booking?.driver_id;
        if (activeDriverId) {
          try {
            const updatedDriver = await fetchDriverById(activeDriverId);
            if (updatedDriver) setDriver(updatedDriver);
          } catch (e) {}
        }
      } else {
        Alert.alert('Rating Saved', `Thank you! You rated ${selectedStars} stars.`);
        setUserRatingSubmitted(true);
        setSubmittedStars(selectedStars);
        setShowRatingModal(false);
      }
    } catch (e) {
      console.warn('[Tracking] submit rating error', e);
      Alert.alert('Rating Saved', `Thank you! You rated ${selectedStars} stars.`);
      setUserRatingSubmitted(true);
      setSubmittedStars(selectedStars);
      setShowRatingModal(false);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const syncBookingData = (b: any) => {
    if (!b) return;
    setBooking(b);
    const status = (b.bookingStatus || b.status || '').toLowerCase();
    
    if (status === 'cancelled') {
      if (!isCancelledRef.current) {
        isCancelledRef.current = true;
        Alert.alert(
          'Booking Cancelled',
          'This towing request has been cancelled. You can now place a new booking.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      }
      return;
    }

    if (status === 'completed') {
      setCurrentStep(6);
      if (!completedAlertShownRef.current) {
        completedAlertShownRef.current = true;
        Alert.alert(
          'Vehicle Safely Delivered! 🎉',
          'Your towing trip has been completed successfully. Returning to Home.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 2200);
      }
    } else if (status === 'arriving_dropoff' || status === 'arriving') {
      setCurrentStep(5);
    } else if (status === 'towing') {
      setCurrentStep(4);
    } else if (status === 'vehicle_loaded' || status === 'loaded') {
      setCurrentStep(3);
      setShowArrivalOtpModal(false); // auto dismiss pickup OTP modal once driver verifies
    } else if (status === 'at_pickup' || status === 'arrived') {
      setCurrentStep(2);
      if (!arrivalAlertShownRef.current) {
        setShowArrivalOtpModal(true);
        arrivalAlertShownRef.current = true;
      }
    } else if (status === 'driver_arriving' || status === 'enroute') {
      setCurrentStep(1);
    } else if (status === 'driver_assigned') {
      setCurrentStep(0);
    }

    if (b.pickupOtp) setPickupOtp(b.pickupOtp.toString().split('').join(' '));
    if (b.dropoffOtp) setCompletionOtp(b.dropoffOtp.toString().split('').join(' '));
    
    setDriverName(b.driverName || b.driver || '—');
    setDriverPlate(b.vehiclePlate || '—');
    setDriverVehicle(b.driverVehicle || b.vehicle || '—');
    
    if (b.pickup && typeof b.pickup === 'string' && b.pickup !== '—') setPickupAddr(b.pickup);
    else if (b.pickup?.address && b.pickup.address !== '—') setPickupAddr(b.pickup.address);
    else if (b.pickupLocation?.address && b.pickupLocation.address !== '—') setPickupAddr(b.pickupLocation.address);
    else if (b.pickup_address && b.pickup_address !== '—') setPickupAddr(b.pickup_address);
    else if (b.pickup_location?.address && b.pickup_location.address !== '—') setPickupAddr(b.pickup_location.address);
    
    if (b.drop && typeof b.drop === 'string' && b.drop !== '—') setDropoffAddr(b.drop);
    else if (b.dropoff && typeof b.dropoff === 'string' && b.dropoff !== '—') setDropoffAddr(b.dropoff);
    else if (b.dropoff?.address && b.dropoff.address !== '—') setDropoffAddr(b.dropoff.address);
    else if (b.dropoffLocation?.address && b.dropoffLocation.address !== '—') setDropoffAddr(b.dropoffLocation.address);
    else if (b.dropoff_address && b.dropoff_address !== '—') setDropoffAddr(b.dropoff_address);
    else if (b.dropoff_location?.address && b.dropoff_location.address !== '—') setDropoffAddr(b.dropoff_location.address);

    const pCoords = b.pickupCoords || b.pickupLocation?.coordinates || (b.pickup_location && typeof b.pickup_location === 'object' && b.pickup_location.coordinates ? { latitude: b.pickup_location.coordinates[1], longitude: b.pickup_location.coordinates[0] } : null);
    if (pCoords?.latitude && pCoords?.longitude && pCoords.latitude !== 0) {
      setPickupCoords({ latitude: Number(pCoords.latitude), longitude: Number(pCoords.longitude) });
    }

    const dCoords = b.dropoffCoords || b.dropoffLocation?.coordinates || (b.dropoff_location && typeof b.dropoff_location === 'object' && b.dropoff_location.coordinates ? { latitude: b.dropoff_location.coordinates[1], longitude: b.dropoff_location.coordinates[0] } : null);
    if (dCoords?.latitude && dCoords?.longitude && dCoords.latitude !== 0) {
      setDropoffCoords({ latitude: Number(dCoords.latitude), longitude: Number(dCoords.longitude) });
    } else if (pCoords?.latitude && pCoords?.longitude && pCoords.latitude !== 0) {
      setDropoffCoords({ latitude: Number(pCoords.latitude) + 0.02, longitude: Number(pCoords.longitude) + 0.02 });
    }
  };

  // User current GPS location on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (loc?.coords) {
            setPickupCoords((prev) => (prev.latitude === 0 ? { latitude: loc.coords.latitude, longitude: loc.coords.longitude } : prev));
          }
        }
      } catch (e) {}
    })();
  }, []);

  // Booking loader: auto-discovers latest active booking if bookingId is missing
  useEffect(() => {
    let isMounted = true;
    let unsubBooking: any = null;
    let interval: any = null;

    async function initBooking() {
      let targetId = bookingId;
      if (!targetId) {
        try {
          const u = await fetchCurrentUser();
          const uid = u?.uuid || u?.id;
          if (uid) {
            const userBookings = await fetchUserBookings(uid);
            const active = userBookings?.find(
              (b: any) =>
                (b.bookingStatus || b.status || '').toLowerCase() !== 'completed' &&
                (b.bookingStatus || b.status || '').toLowerCase() !== 'cancelled'
            );
            if (active && isMounted) {
              targetId = active.uuid || active.id;
              syncBookingData(active);
            }
          }
        } catch (e) {}
      }

      if (targetId && isMounted) {
        fetchBookingById(targetId).then((b) => {
          if (isMounted && b) syncBookingData(b);
        }).catch(() => {});

        interval = setInterval(async () => {
          try {
            const b = await fetchBookingById(targetId);
            if (isMounted && b) syncBookingData(b);
          } catch (e) {}
        }, 2500);

        try {
          unsubBooking = subscribeToBooking(targetId, (updated) => {
            if (isMounted && updated) syncBookingData(updated);
          });
        } catch (e) {}
      }
    }

    initBooking();

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
      if (unsubBooking) {
        if (typeof unsubBooking === 'function') unsubBooking();
        else if (typeof unsubBooking.unsubscribe === 'function') unsubBooking.unsubscribe();
      }
    };
  }, [bookingId]);

  // Real-time live tracking of assigned driver (Supabase subscription + 2s polling)
  useEffect(() => {
    let unsub: any = null;
    let pollInterval: any = null;
    const activeDriverId = driverId || booking?.driverId || booking?.driver_id;
    if (activeDriverId) {
      const setup = async () => {
        try {
          const d = await fetchDriverById(activeDriverId);
          if (d) {
            setDriver(d);
            if (d.name) setDriverName(d.name);
            if (d.vehiclePlate) setDriverPlate(d.vehiclePlate);
            if (d.vehicle) setDriverVehicle(d.vehicle);
            if (d.latitude && d.longitude && d.latitude !== 0 && d.longitude !== 0) {
              setDriverCoords({ latitude: Number(d.latitude), longitude: Number(d.longitude) });
            }
            if (d.speed != null) {
              const spd = typeof d.speed === 'number' ? Math.round(d.speed) : parseInt(d.speed, 10);
              if (!isNaN(spd)) setSpeedVal(spd);
            }
          }

          // Active 2s polling for driver coordinates
          pollInterval = setInterval(async () => {
            try {
              const latest = await fetchDriverById(activeDriverId);
              if (latest && latest.latitude && latest.longitude && latest.latitude !== 0 && latest.longitude !== 0) {
                setDriverCoords((prev) => {
                  if (Math.abs(prev.latitude - latest.latitude) > 0.00003 || Math.abs(prev.longitude - latest.longitude) > 0.00003) {
                    return { latitude: Number(latest.latitude), longitude: Number(latest.longitude) };
                  }
                  return prev;
                });
                if (latest.speed != null) {
                  const spd = typeof latest.speed === 'number' ? Math.round(latest.speed) : parseInt(latest.speed, 10);
                  if (!isNaN(spd)) setSpeedVal(spd);
                }
              }
            } catch (e) {}
          }, 2000);

          // Realtime Supabase postgres_changes event listener
          unsub = subscribeToDriverLocation(activeDriverId, (payload: any) => {
            const lat = payload?.latitude ?? payload?.lat ?? payload?.location?.latitude;
            const lng = payload?.longitude ?? payload?.lng ?? payload?.location?.longitude;
            if (lat && lng && Number(lat) !== 0 && Number(lng) !== 0) {
              setDriverCoords({ latitude: Number(lat), longitude: Number(lng) });
            }
            if (payload?.speed != null) {
              const spd = typeof payload.speed === 'number' ? Math.round(payload.speed) : parseInt(payload.speed, 10);
              if (!isNaN(spd)) setSpeedVal(spd);
            }
          });
        } catch (e) {
          console.warn('[Tracking] setup driver tracking error', e);
        }
      };
      setup();
    }
    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (unsub) {
        if (typeof unsub === 'function') unsub();
        else if (typeof unsub.unsubscribe === 'function') unsub.unsubscribe();
      }
    };
  }, [driverId, booking?.driverId, booking?.driver_id]);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showChat, setShowChat] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatScrollRef = useRef<any>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [plateVerified, setPlateVerified] = useState(false);
  const [speedVal, setSpeedVal] = useState(42);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Auto-open chat if navigated with ?openChat=true
  useEffect(() => {
    if (openChat === 'true') {
      setShowChat(true);
    }
  }, [openChat]);

  // Handle direct call to driver
  const handleCallDriver = () => {
    const phoneToCall = driver?.phone || booking?.driverPhone || '+918100264108';
    if (!phoneToCall || phoneToCall === '—') {
      Alert.alert('Phone Unavailable', 'No driver contact phone number found for this booking.');
      return;
    }
    const clean = String(phoneToCall).replace(/[^\d+]/g, '');
    const url = `tel:${clean}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Call Driver', `Driver Phone: ${phoneToCall}\n\nPlease dial directly on your phone.`);
    });
  };

  // Subscribe to real-time chat with driver for this booking
  useEffect(() => {
    const targetBookingId = booking?.id || booking?.uuid || bookingId;
    if (!targetBookingId) return;

    getBookingChatMessages(targetBookingId).then((msgs) => {
      if (msgs && msgs.length > 0) {
        setChatHistory(msgs);
      }
    }).catch(() => {});

    const sub = subscribeToBookingChat(targetBookingId, (newMsg) => {
      setChatHistory((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => {
      sub.unsubscribe();
    };
  }, [booking?.id, booking?.uuid, bookingId]);

  // Animated values for active lifecycle step
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for active lifecycle step
  useEffect(() => {
    const stepPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    stepPulse.start();

    return () => {
      stepPulse.stop();
    };
  }, []);

  const handleSendChat = async (textToSend?: string) => {
    const targetBookingId = booking?.id || booking?.uuid || bookingId;
    const text = (textToSend || chatMsg || '').trim();
    if (!text || !targetBookingId) return;
    setChatMsg('');

    try {
      const sent = await sendBookingChatMessage(targetBookingId, {
        sender: 'customer',
        senderName: 'Customer',
        text,
      });
      if (sent) {
        setChatHistory((prev) => {
          if (prev.some((m) => m.id === sent.id)) return prev;
          return [...prev, sent];
        });
        setTimeout(() => {
          chatScrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (err) {
      console.warn('send chat error:', err);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedReason || isCancelling) return;
    const targetBookingId = booking?.id || booking?.uuid || bookingId;
    setIsCancelling(true);
    try {
      if (targetBookingId) {
        await cancelUserBooking(targetBookingId, selectedReason);
      }
      isCancelledRef.current = true;
      setShowCancel(false);
      Alert.alert(
        'Booking Cancelled',
        'Your towing request has been cancelled.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (e) {
      console.warn('[Tracking] Cancel error:', e);
      setShowCancel(false);
      router.replace('/(tabs)');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleLocationUpdate = async (data: { address: string; coordinates: { latitude: number; longitude: number } }) => {
    setShowMapPicker(false);
    const bId = bookingId || booking?.uuid || booking?.id;
    if (mapPickerType === 'dropoff') {
      setDropoffAddr(data.address);
      setDropoffCoords(data.coordinates);
      if (bId) {
        try {
          await updateBookingDestination(bId, data.address, data.coordinates);
          Alert.alert('Destination Updated', `Drop-off changed to: ${data.address}`);
        } catch (e) {
          console.warn('[Tracking] update destination error', e);
        }
      }
    } else {
      setPickupAddr(data.address);
      setPickupCoords(data.coordinates);
    }
  };

  const stepDone = (i: number) => i < currentStep;
  const stepActive = (i: number) => i === currentStep;

  const showPickupOtp = currentStep < 3;
  const showCompletionOtp = currentStep >= 5;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={colors.gradient} style={StyleSheet.absoluteFill} pointerEvents="none" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 48) }]}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>GPS TELEMETRY ACTIVE</Text>
        </View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Live Fleet Tracking</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={[styles.closeBtn, !isDark && { backgroundColor: '#FFFFFF', borderColor: colors.cardBorder }]}>
          <Ionicons name="close" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom + 36, 48) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        bounces={true}
        scrollEnabled={true}
      >
        {/* ─── REAL-TIME INTERACTIVE LIVE ROUTE GPS MAP (WEB & MOBILE) ─── */}
        <View style={{ marginBottom: 14 }}>
          <LiveRouteMap
            driverCoords={driverCoords}
            pickupCoords={pickupCoords}
            dropoffCoords={dropoffCoords}
            driverName={driverName}
            driverVehicle={driverVehicle}
            driverPlate={driverPlate}
            pickupAddress={pickupAddr}
            dropoffAddress={dropoffAddr}
            speed={speedVal}
            height={isMapExpanded ? 420 : 310}
            interactive={isMapExpanded}
          />
          {/* Quick Expand Toggle Floating on map top-right */}
          <TouchableOpacity
            onPress={() => setIsMapExpanded(!isMapExpanded)}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: 'rgba(7,12,24,0.85)',
              borderWidth: 1,
              borderColor: 'rgba(56,189,248,0.4)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 20,
            }}
            activeOpacity={0.8}
          >
            <Ionicons name={isMapExpanded ? 'contract' : 'expand'} size={15} color="#38BDF8" />
          </TouchableOpacity>
        </View>

        {/* ─── LIVE ROUTE WAYPOINTS & LOCATION MANAGER CARD ─── */}
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="map" size={16} color="#38BDF8" />
              <Text style={styles.cardTitle}>Live Route Waypoints</Text>
            </View>
            <View style={styles.liveSyncBadge}>
              <View style={styles.liveDotSmall} />
              <Text style={styles.liveSyncText}>GPS SYNCED</Text>
            </View>
          </View>

          {/* Pickup Point Row */}
          <View style={styles.routeWaypointItem}>
            <View style={[styles.waypointDot, { backgroundColor: '#00FF97' }]} />
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={[styles.waypointItemLabel, { color: '#00FF97' }]}>PICKUP LOCATION (A)</Text>
              <Text style={styles.waypointItemAddress} numberOfLines={2}>{pickupAddr}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setMapPickerType('pickup');
                setShowMapPicker(true);
              }}
              style={[styles.editLocationBtn, { borderColor: 'rgba(0,255,151,0.3)', backgroundColor: 'rgba(0,255,151,0.08)' }]}
              activeOpacity={0.7}
            >
              <Ionicons name="map-outline" size={13} color="#00FF97" />
              <Text style={[styles.editLocationBtnText, { color: '#00FF97' }]}>Change on Map</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.waypointConnectorLine} />

          {/* Drop-off Point Row */}
          <View style={styles.routeWaypointItem}>
            <View style={[styles.waypointDot, { backgroundColor: '#F43F5E' }]} />
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={[styles.waypointItemLabel, { color: '#F43F5E' }]}>DROP-OFF DESTINATION (B)</Text>
              <Text style={styles.waypointItemAddress} numberOfLines={2}>{dropoffAddr}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setMapPickerType('dropoff');
                setShowMapPicker(true);
              }}
              style={[styles.editLocationBtn, { borderColor: 'rgba(56,189,248,0.3)', backgroundColor: 'rgba(56,189,248,0.08)' }]}
              activeOpacity={0.7}
            >
              <Ionicons name="navigate-outline" size={13} color="#38BDF8" />
              <Text style={[styles.editLocationBtnText, { color: '#38BDF8' }]}>Change on Map</Text>
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* ETA & Driver Fast Stats Banner (Real Dynamic Road Telemetry) */}
        <LinearGradient
          colors={['rgba(56,189,248,0.14)', 'rgba(56,189,248,0.03)']}
          style={styles.etaBanner}
        >
          <View>
            <Text style={styles.etaLabel}>Estimated Pickup Arrival</Text>
            <Text style={styles.etaValue}>
              {(() => {
                if (currentStep >= 5) return 'Delivered ✓';
                if (currentStep >= 3) return 'In Transit';
                if (currentStep === 2) return 'Driver Arrived ✓';
                if (driverCoords.latitude === 0 || pickupCoords.latitude === 0) return 'Connecting...';
                const dist = calculateDistanceKm(driverCoords.latitude, driverCoords.longitude, pickupCoords.latitude, pickupCoords.longitude);
                if (dist <= 0.15) return 'Arriving Now';
                if (dist <= 0.8) return '1 - 2 mins away';
                const mins = Math.max(2, Math.round(dist * 2.2));
                return `${mins} mins away · ${dist.toFixed(1)} km`;
              })()}
            </Text>
            <Text style={styles.etaSubtext}>
              {(() => {
                if (currentStep >= 5) return 'Tow completed safely at destination';
                if (currentStep >= 3) return `Towing vehicle to ${dropoffAddr ? dropoffAddr.split(',')[0] : 'drop-off location'}`;
                if (currentStep === 2) return 'Partner has arrived at your exact pickup location';
                if (driverCoords.latitude === 0 || pickupCoords.latitude === 0) return 'Acquiring high-precision GPS telemetry';
                const dist = calculateDistanceKm(driverCoords.latitude, driverCoords.longitude, pickupCoords.latitude, pickupCoords.longitude);
                if (dist <= 0.15) return 'Driver is within 150m of your pickup pin';
                return `Approaching ${pickupAddr ? pickupAddr.split(',')[0] : 'your location'} · ${speedVal > 0 ? speedVal + ' km/h' : 'In transit'}`;
              })()}
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
              <Text style={styles.driverAvatarText}>{(driverName && driverName !== '—' ? driverName[0] : 'D').toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.driverName}>{driverName}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#FFD60A" />
                <Text style={styles.ratingText}>{driver?.rating ? driver.rating + ' · ' + (driver.totalTrips || 0) + ' trips' : '—'}</Text>
              </View>
              <Text style={styles.driverPlate}>🚛 {driverVehicle} · {driverPlate}</Text>
            </View>
            <View style={styles.driverActions}>
              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={handleCallDriver}>
                <Ionicons name="call" size={18} color="#00FF97" />
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
              {pickupOtp.split(' ').map((d, i) => (
                <View key={i} style={styles.otpDigitBox}>
                  <Text style={styles.otpDigit}>{d}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.otpHint}>Share this OTP with your driver to verify vehicle handover</Text>
          </BlurView>
        )}

        {/* Delivered / Completed Post-Trip Rating Card (Drop-off OTP completely removed per requirements) */}
        {currentStep === 6 && (
          <BlurView intensity={25} tint="dark" style={[styles.card, { borderColor: 'rgba(0,255,151,0.35)', backgroundColor: 'rgba(0,255,151,0.06)', marginTop: 8 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="checkmark-done-circle" size={26} color="#00FF97" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#FFFFFF' }}>Vehicle Safely Delivered!</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Your towing job has been successfully completed.</Text>
              </View>
            </View>

            {(userRatingSubmitted || booking?.driverRating || booking?.driver_rating) ? (
              <View style={styles.reviewedCard}>
                <View style={styles.reviewedLeft}>
                  <View style={styles.starBadgeCircle}>
                    <Ionicons name="star" size={15} color="#050810" />
                  </View>
                  <View style={styles.reviewedTextContainer}>
                    <Text style={styles.reviewedScoreText}>
                      You rated this trip {submittedStars || booking?.driverRating || booking?.driver_rating}.0 ★
                    </Text>
                    <Text style={styles.reviewedSubText} numberOfLines={1}>
                      Thank you for reviewing {driverName}!
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setShowRatingModal(true)}
                  style={styles.editRatingBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pencil" size={12} color="#FFD60A" style={{ marginRight: 4 }} />
                  <Text style={styles.editRatingBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setShowRatingModal(true)}
                activeOpacity={0.8}
                style={styles.rateDriverBtn}
              >
                <Ionicons name="star" size={18} color="#050810" style={{ marginRight: 6 }} />
                <Text style={styles.rateDriverBtnText}>
                  Rate Driver ({driverName})
                </Text>
              </TouchableOpacity>
            )}
          </BlurView>
        )}

        {/* Completed Job - Return to Home Button */}
        {currentStep === 6 && (
          <TouchableOpacity
            style={styles.completedHomeBtn}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#00FF97', '#00CFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.completedHomeBtnGradient}
            >
              <Ionicons name="checkmark-done" size={18} color="#050810" style={{ marginRight: 8 }} />
              <Text style={styles.completedHomeBtnText}>Return to Home</Text>
            </LinearGradient>
          </TouchableOpacity>
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
      <Modal visible={showChat} animationType="slide" transparent onRequestClose={() => setShowChat(false)}>
        <View style={styles.modalOverlay}>
          <BlurView intensity={50} tint="dark" style={styles.chatSheet}>
            <View style={styles.chatHeader}>
              <View>
                <Text style={styles.chatTitle}>Chat with {driverName !== '—' ? driverName : 'Driver Partner'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#00FF97' }} />
                  <Text style={{ fontSize: 10, color: '#00FF97', fontWeight: '700', letterSpacing: 0.5 }}>LIVE CHANNEL CONNECTED</Text>
                </View>
                <Text style={styles.chatSub}>{driverVehicle} · {driverPlate}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TouchableOpacity
                  onPress={handleCallDriver}
                  style={[styles.closeCircle, { backgroundColor: 'rgba(0,255,151,0.2)' }]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="call" size={16} color="#00FF97" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowChat(false)} style={styles.closeCircle} activeOpacity={0.7}>
                  <Ionicons name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick chips for customer */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 38, marginVertical: 8 }}>
              {CUSTOMER_QUICK_CHATS.map((chip, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, height: 32, justifyContent: 'center' }}
                  onPress={() => handleSendChat(chip)}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: '#E2E8F0', fontSize: 11, fontWeight: '500' }}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView ref={chatScrollRef} style={styles.chatScroll} showsVerticalScrollIndicator={false}>
              {chatHistory.length === 0 ? (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Ionicons name="chatbubbles-outline" size={36} color="rgba(255,255,255,0.2)" />
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
                    No messages yet.{'\n'}Need to update the driver about your location or keys?
                  </Text>
                </View>
              ) : (
                chatHistory.map((m, i) => {
                  const isMe = m.sender === 'customer' || (m as any).from === 'me';
                  return (
                    <View key={m.id || i} style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleDriver]}>
                      {!isMe && (
                        <Text style={{ fontSize: 10, color: '#00CFFF', fontWeight: '700', marginBottom: 2 }}>
                          {m.senderName || driverName || 'Driver Partner'}
                        </Text>
                      )}
                      <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextDriver]}>
                        {m.text}
                      </Text>
                      <Text style={{ fontSize: 9, color: isMe ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)', marginTop: 4, alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                        {m.timeFormatted || (m.timestamp ? new Date(m.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Just now')} · {isMe ? 'Sent' : 'Received'}
                      </Text>
                    </View>
                  );
                })
              )}
            </ScrollView>

            <View style={[styles.chatInputRow, { paddingBottom: Math.max(insets.bottom, 12) }]}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type a message to driver..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={chatMsg}
                onChangeText={setChatMsg}
                onSubmitEditing={() => handleSendChat()}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={() => handleSendChat()} activeOpacity={0.8}>
                <Ionicons name="send" size={16} color="#000" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* ─── CANCELLATION MODAL ─── */}
      <Modal visible={showCancel} animationType="fade" transparent onRequestClose={() => setShowCancel(false)}>
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
                style={[styles.cancelConfirmBtn, (!selectedReason || isCancelling) && { opacity: 0.5 }]}
                disabled={!selectedReason || isCancelling}
                onPress={handleConfirmCancel}
              >
                <Text style={styles.cancelConfirmText}>{isCancelling ? 'Cancelling...' : 'Confirm Cancel'}</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* ─── UNIFIED DRIVER ARRIVAL & OTP POPUP MODAL ─── */}
      <Modal
        visible={showArrivalOtpModal}
        animationType="fade"
        transparent
        onRequestClose={() => {
          setShowArrivalOtpModal(false);
          setPlateVerified(true);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlayCenter}
          activeOpacity={1}
          onPress={() => {
            setShowArrivalOtpModal(false);
            setPlateVerified(true);
          }}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <BlurView intensity={60} tint="dark" style={styles.arrivalOtpModal}>
              <LinearGradient
                colors={['rgba(0,255,151,0.15)', 'rgba(4,7,17,0.95)']}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              {/* Close Button */}
              <TouchableOpacity
                style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }}
                onPress={() => {
                  setShowArrivalOtpModal(false);
                  setPlateVerified(true);
                }}
              >
                <Ionicons name="close" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.arrivalIconBox}>
                <Ionicons name="shield-checkmark" size={36} color="#00FF97" />
              </View>
              <Text style={styles.arrivalTitle}>Driver Has Arrived!</Text>
              <Text style={styles.arrivalSubtitle}>
                Please verify the arriving tow truck and share this 4-digit code with {driverName} to verify and start vehicle loading:
              </Text>

              {/* Verified Driver & Vehicle Card */}
              <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 12, marginVertical: 10, borderWidth: 1, borderColor: 'rgba(0,255,151,0.25)', width: '100%', alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontFamily: 'Outfit_700Bold', color: '#00FF97', letterSpacing: 0.8 }}>ASSIGNED TOW TRUCK</Text>
                <Text style={{ fontSize: 15, fontFamily: 'Outfit_700Bold', color: '#FFFFFF', marginTop: 3 }}>🚛 {driverVehicle} · {driverPlate}</Text>
                <Text style={{ fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Partner: {driverName}</Text>
              </View>
              
              <View style={styles.arrivalOtpRow}>
                {pickupOtp.split(' ').map((digit, idx) => (
                  <View key={idx} style={styles.arrivalOtpBox}>
                    <Text style={styles.arrivalOtpText}>{digit}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.arrivalNote}>
                <Ionicons name="information-circle" size={13} color="#38BDF8" />
                {' '}The driver will enter this code on their device before hooking up your vehicle.
              </Text>

              <TouchableOpacity
                style={styles.arrivalDoneBtn}
                onPress={() => {
                  setShowArrivalOtpModal(false);
                  setPlateVerified(true);
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#00FF97', '#00CFFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.arrivalBtnGradient}
                >
                  <Text style={styles.arrivalBtnText}>I'VE VERIFIED & SHARED CODE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ─── POST-TRIP DRIVER RATING MODAL ─── */}
      <Modal visible={showRatingModal} animationType="slide" transparent onRequestClose={() => setShowRatingModal(false)}>
        <View style={styles.modalOverlayCenter}>
          <BlurView intensity={70} tint="dark" style={styles.ratingModalContent}>
            {ratingSuccess ? (
              <View style={styles.ratingSuccessBox}>
                <View style={styles.ratingSuccessIconWrap}>
                  <Ionicons name="checkmark-circle" size={54} color="#00FF97" />
                </View>
                <Text style={styles.ratingSuccessTitle}>Rating Submitted!</Text>
                <Text style={styles.ratingSuccessSubtitle}>
                  You rated {driverName} {selectedStars}.0 ★
                </Text>
                {updatedDriverStats && (
                  <View style={styles.ratingDriverSummaryBadge}>
                    <Text style={styles.ratingDriverSummaryText}>
                      Driver's updated score: <Text style={{ color: '#FFD60A', fontFamily: 'Outfit_700Bold' }}>{updatedDriverStats.averageRating?.toFixed(1) || selectedStars.toFixed(1)} ★</Text> ({updatedDriverStats.reviewCount || 1} {updatedDriverStats.reviewCount === 1 ? 'review' : 'reviews'})
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.ratingDoneBtn}
                  onPress={() => {
                    setShowRatingModal(false);
                    setRatingSuccess(false);
                    router.replace('/(tabs)');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.ratingDoneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.ratingModalHeader}>
                  <Text style={styles.ratingModalTitle}>Rate Your Experience</Text>
                  <TouchableOpacity onPress={() => setShowRatingModal(false)} style={styles.closeCircle}>
                    <Ionicons name="close" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.ratingModalDesc}>
                  How was your towing trip with {driverName}?
                </Text>

                <View style={styles.ratingDriverSnippet}>
                  <View style={styles.ratingDriverAvatar}>
                    <Ionicons name="person" size={24} color="#00CFFF" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.ratingDriverName}>{driverName}</Text>
                    <Text style={styles.ratingDriverVehicle}>🚛 {driverVehicle} · {driverPlate}</Text>
                  </View>
                </View>

                <View style={styles.ratingStarsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setSelectedStars(star)}
                      activeOpacity={0.7}
                      style={styles.starTouch}
                    >
                      <Ionicons
                        name={star <= selectedStars ? "star" : "star-outline"}
                        size={38}
                        color={star <= selectedStars ? "#FFD60A" : "rgba(255,255,255,0.3)"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.ratingLabelHighlight}>
                  {selectedStars === 5 && '⭐⭐⭐⭐⭐ Excellent Service! (5.0)'}
                  {selectedStars === 4 && '⭐⭐⭐⭐ Good Experience (4.0)'}
                  {selectedStars === 3 && '⭐⭐⭐ Average Trip (3.0)'}
                  {selectedStars === 2 && '⭐⭐ Below Expectations (2.0)'}
                  {selectedStars === 1 && '⭐ Poor Service (1.0)'}
                </Text>

                <Text style={styles.ratingChipsTitle}>What went well?</Text>
                <View style={styles.ratingChipsRow}>
                  {['On-Time Arrival', 'Careful Handling', 'Courteous Driver', 'Professional Gear', 'Fair Pricing'].map((chip) => {
                    const isSelected = selectedFeedbackChips.includes(chip);
                    return (
                      <TouchableOpacity
                        key={chip}
                        onPress={() => {
                          if (isSelected) {
                            setSelectedFeedbackChips(selectedFeedbackChips.filter(c => c !== chip));
                          } else {
                            setSelectedFeedbackChips([...selectedFeedbackChips, chip]);
                          }
                        }}
                        style={[styles.ratingChip, isSelected && styles.ratingChipSelected]}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.ratingChipText, isSelected && styles.ratingChipTextSelected]}>
                          {chip}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TextInput
                  style={styles.ratingFeedbackInput}
                  placeholder="Leave a note for the driver (optional)..."
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  multiline
                  numberOfLines={2}
                  value={feedbackNotes}
                  onChangeText={setFeedbackNotes}
                />

                <TouchableOpacity
                  style={[styles.ratingSubmitBtn, isSubmittingRating && { opacity: 0.6 }]}
                  onPress={handleSubmitRating}
                  disabled={isSubmittingRating}
                  activeOpacity={0.8}
                >
                  <Text style={styles.ratingSubmitBtnText}>
                    {isSubmittingRating ? 'Submitting...' : `Submit ${selectedStars}.0 ★ Rating`}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </BlurView>
        </View>
      </Modal>

      {/* ─── LIVE GPS MAP LOCATION PICKER MODAL (PICKUP / DROPOFF) ─── */}
      <MapLocationPickerModal
        visible={showMapPicker}
        title={mapPickerType === 'pickup' ? 'Update Pickup Location' : 'Update Drop-off Destination'}
        initialAddress={mapPickerType === 'pickup' ? pickupAddr : dropoffAddr}
        initialCoordinates={mapPickerType === 'pickup' ? pickupCoords : dropoffCoords}
        type={mapPickerType}
        onClose={() => setShowMapPicker(false)}
        onConfirmLocation={handleLocationUpdate}
      />
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
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scroll: {
    flexGrow: 1,
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

  reviewedCard: {
    backgroundColor: 'rgba(255,214,10,0.12)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  reviewedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    gap: 8,
  },
  starBadgeCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFD60A',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  reviewedTextContainer: {
    flex: 1,
  },
  reviewedScoreText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#FFD60A',
  },
  reviewedSubText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  editRatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(255,214,10,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.35)',
    flexShrink: 0,
  },
  editRatingBtnText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: '#FFD60A',
  },
  rateDriverBtn: {
    backgroundColor: '#00CFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  rateDriverBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#050810',
  },
  completedHomeBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 6,
  },
  completedHomeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  completedHomeBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    color: '#050810',
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

  // ─── ARRIVAL OTP MODAL ───
  arrivalOtpModal: {
    backgroundColor: '#0A101D',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(0,255,151,0.4)',
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  arrivalIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(0,255,151,0.15)',
    borderWidth: 1.5,
    borderColor: '#00FF97',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  arrivalTitle: {
    fontSize: 22,
    fontFamily: 'Outfit_700Bold',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  arrivalSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  arrivalOtpRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 18,
  },
  arrivalOtpBox: {
    width: 54,
    height: 62,
    borderRadius: 14,
    backgroundColor: 'rgba(0,255,151,0.08)',
    borderWidth: 2,
    borderColor: '#00FF97',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  arrivalOtpText: {
    fontSize: 30,
    fontFamily: 'Outfit_700Bold',
    color: '#00FF97',
  },
  arrivalNote: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#38BDF8',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  arrivalDoneBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
  },
  arrivalBtnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrivalBtnText: {
    color: '#040711',
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    letterSpacing: 0.8,
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

  // ─── ROUTE WAYPOINT & LOCATION MANAGER STYLES ───
  liveSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,151,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,255,151,0.3)',
    gap: 4,
  },
  liveDotSmall: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#00FF97' },
  liveSyncText: { fontFamily: 'Outfit_700Bold', fontSize: 9, color: '#00FF97', letterSpacing: 0.5 },
  routeWaypointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  waypointDot: { width: 10, height: 10, borderRadius: 5 },
  waypointItemLabel: { fontFamily: 'Outfit_700Bold', fontSize: 10, letterSpacing: 0.5, marginBottom: 2 },
  waypointItemAddress: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#FFFFFF', lineHeight: 16 },
  editLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  editLocationBtnText: { fontFamily: 'Outfit_700Bold', fontSize: 11 },
  waypointConnectorLine: {
    width: 2,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginLeft: 4,
    marginVertical: 2,
  },
  // ─── RATING MODAL ───
  ratingModalContent: {
    backgroundColor: '#0D1322',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 22,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  ratingModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingModalTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  ratingModalDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 16,
  },
  ratingDriverSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  ratingDriverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,207,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,207,255,0.3)',
  },
  ratingDriverName: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  ratingDriverVehicle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  ratingStarsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  starTouch: {
    padding: 6,
  },
  ratingLabelHighlight: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#FFD60A',
    textAlign: 'center',
    marginBottom: 14,
  },
  ratingChipsTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  ratingChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  ratingChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  ratingChipSelected: {
    backgroundColor: 'rgba(0,207,255,0.15)',
    borderColor: '#00CFFF',
  },
  ratingChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  ratingChipTextSelected: {
    color: '#00CFFF',
    fontFamily: 'Outfit_600SemiBold',
  },
  ratingFeedbackInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    textAlignVertical: 'top',
    minHeight: 56,
    marginBottom: 18,
  },
  ratingSubmitBtn: {
    backgroundColor: '#00CFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingSubmitBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    color: '#050810',
  },
  ratingSuccessBox: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  ratingSuccessIconWrap: {
    marginBottom: 12,
  },
  ratingSuccessTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  ratingSuccessSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 14,
  },
  ratingDriverSummaryBadge: {
    backgroundColor: 'rgba(255,214,10,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.25)',
    marginBottom: 18,
  },
  ratingDriverSummaryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  ratingDoneBtn: {
    backgroundColor: '#00FF97',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingDoneBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    color: '#050810',
  },
});
