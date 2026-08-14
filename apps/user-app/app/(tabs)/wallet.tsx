import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

// ─── Mock Ride Data ──────────────────────────────────────────
const PAST_RIDES = [
  {
    id: 'OMG-7821',
    status: 'Completed',
    date: '12 Aug 2026, 10:45 AM',
    service: 'Flatbed Tow',
    vehicle: 'Maruti Swift · KA 01 MH 4521',
    pickup: 'MG Road, Bangalore',
    drop: 'AutoFix Garage, Whitefield',
    driver: 'Rajesh Kumar',
    driverRating: '4.8',
    driverPlate: 'MH 02 AB 1234',
    distance: '8.5 km',
    duration: '32 min',
    fare: { base: 500, distance: 128, platform: 25, gst: 117, discount: 50, total: 720 },
    payment: 'UPI',
    refundStatus: null,
  },
  {
    id: 'OMG-7654',
    status: 'Cancelled',
    date: '9 Aug 2026, 3:20 PM',
    service: 'Wheel Lift Tow',
    vehicle: 'Honda City · KA 05 AB 8923',
    pickup: 'Koramangala, Bangalore',
    drop: 'Honda Service, Indiranagar',
    driver: 'Anil Patil',
    driverRating: '4.6',
    driverPlate: 'KA 01 XY 7890',
    distance: '5.2 km',
    duration: '—',
    fare: { base: 1200, distance: 78, platform: 25, gst: 236, discount: 0, total: 1539 },
    payment: 'Card',
    refundStatus: 'Refund Processed · ₹1,539 credited back',
  },
  {
    id: 'OMG-7510',
    status: 'Completed',
    date: '5 Aug 2026, 8:15 AM',
    service: 'Battery Jumpstart',
    vehicle: 'Hyundai Creta · DL 10 CR 3344',
    pickup: 'Connaught Place, Delhi',
    drop: 'On-site (No tow)',
    driver: 'Suresh Nair',
    driverRating: '4.9',
    driverPlate: 'DL 01 AB 5544',
    distance: '3.1 km',
    duration: '18 min',
    fare: { base: 350, distance: 47, platform: 25, gst: 76, discount: 0, total: 498 },
    payment: 'Cash',
    refundStatus: null,
  },
  {
    id: 'OMG-7402',
    status: 'Completed',
    date: '28 Jul 2026, 6:30 PM',
    service: 'Flatbed Tow',
    vehicle: 'Kia Seltos · MH 12 AB 6789',
    pickup: 'Kothrud, Pune',
    drop: 'Kia Service Center, Baner',
    driver: 'Mahesh Joshi',
    driverRating: '4.7',
    driverPlate: 'MH 12 CD 4567',
    distance: '12.4 km',
    duration: '45 min',
    fare: { base: 600, distance: 186, platform: 25, gst: 146, discount: 100, total: 857 },
    payment: 'UPI',
    refundStatus: null,
  },
];

const STATUS_COLOR: Record<string, string> = {
  Completed: '#00FF97',
  Cancelled: '#FF4D4D',
};

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const [selectedRide, setSelectedRide] = useState<typeof PAST_RIDES[0] | null>(null);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={[styles.headerArea, { paddingTop: Math.max(insets.top + 10, 44) }]}>
        <Text style={styles.headerTitle}>Trip History</Text>
        <Text style={styles.headerSubtitle}>View past request logs & download receipts</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.list, { paddingBottom: Math.max(insets.bottom + 90, 110) }]} showsVerticalScrollIndicator={false}>
        {PAST_RIDES.map((ride) => (
          <TouchableOpacity key={ride.id} onPress={() => setSelectedRide(ride)} activeOpacity={0.85} style={styles.cardTouch}>
            <BlurView intensity={85} tint="dark" style={styles.card}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.04)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              {/* Top Details */}
              <View style={styles.cardTop}>
                <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLOR[ride.status]}12`, borderColor: `${STATUS_COLOR[ride.status]}25` }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLOR[ride.status] }]}>{ride.status}</Text>
                </View>
                <Text style={styles.rideId}>{ride.id}</Text>
              </View>

              <Text style={styles.dateText}>{ride.date}</Text>

              {/* Service description */}
              <View style={styles.serviceRow}>
                <MaterialCommunityIcons name="tow-truck" size={18} color="#00CFFF" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.serviceTitle}>{ride.service}</Text>
                  <Text style={styles.vehicleText}>{ride.vehicle}</Text>
                </View>
                <Text style={styles.totalText}>₹{ride.fare.total}</Text>
              </View>

              {/* Pickup & Drop routes */}
              <View style={styles.routeContainer}>
                <View style={styles.routeDots}>
                  <View style={styles.greenDot} />
                  <View style={styles.line} />
                  <View style={styles.redDot} />
                </View>
                <View style={styles.routeTextWrapper}>
                  <Text style={styles.routeText} numberOfLines={1}>{ride.pickup}</Text>
                  <Text style={[styles.routeText, { marginTop: 10 }]} numberOfLines={1}>{ride.drop}</Text>
                </View>
              </View>

              {/* Receipt Row */}
              <View style={styles.receiptAction}>
                <Text style={styles.viewInvoiceLink}>View Receipt Details</Text>
                <Ionicons name="chevron-forward" size={16} color="#00CFFF" />
              </View>
            </BlurView>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Invoice Details Modal */}
      <Modal visible={selectedRide !== null} animationType="slide" transparent>
        {selectedRide && (
          <View style={modal.overlay}>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />
            <BlurView intensity={90} tint="dark" style={modal.container}>
              <View style={modal.header}>
                <View>
                  <Text style={modal.title}>Receipt Details</Text>
                  <Text style={modal.sub}>Booking ID: {selectedRide.id}</Text>
                </View>
                <TouchableOpacity style={modal.closeBtn} onPress={() => setSelectedRide(null)}>
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Brand Title */}
                <View style={modal.brand}>
                  <Text style={modal.brandName}>OmniGo</Text>
                  <Text style={modal.brandSub}>{selectedRide.service} · {selectedRide.date}</Text>
                </View>

                {/* Driver Meta info */}
                <View style={modal.section}>
                  <Text style={modal.sectionTitle}>SERVICE DETAILS</Text>
                  <View style={modal.row}>
                    <Text style={modal.label}>Driver Name</Text>
                    <Text style={modal.value}>{selectedRide.driver} ({selectedRide.driverRating} ★)</Text>
                  </View>
                  <View style={modal.row}>
                    <Text style={modal.label}>Vehicle</Text>
                    <Text style={modal.value}>{selectedRide.vehicle}</Text>
                  </View>
                  <View style={modal.row}>
                    <Text style={modal.label}>Route Distance</Text>
                    <Text style={modal.value}>{selectedRide.distance}</Text>
                  </View>
                  <View style={modal.row}>
                    <Text style={modal.label}>Duration</Text>
                    <Text style={modal.value}>{selectedRide.duration}</Text>
                  </View>
                </View>

                {/* Pricing summary */}
                <View style={modal.section}>
                  <Text style={modal.sectionTitle}>FARE BREAKDOWN</Text>
                  <View style={modal.row}>
                    <Text style={modal.label}>Base Fare</Text>
                    <Text style={modal.value}>₹{selectedRide.fare.base}</Text>
                  </View>
                  <View style={modal.row}>
                    <Text style={modal.label}>Distance Charges</Text>
                    <Text style={modal.value}>₹{selectedRide.fare.distance}</Text>
                  </View>
                  <View style={modal.row}>
                    <Text style={modal.label}>Platform Fee</Text>
                    <Text style={modal.value}>₹{selectedRide.fare.platform}</Text>
                  </View>
                  <View style={modal.row}>
                    <Text style={modal.label}>GST Taxes (18%)</Text>
                    <Text style={modal.value}>₹{selectedRide.fare.gst}</Text>
                  </View>
                  {selectedRide.fare.discount > 0 && (
                    <View style={modal.row}>
                      <Text style={[modal.label, { color: '#00FF97' }]}>Promo Discount</Text>
                      <Text style={[modal.value, { color: '#00FF97' }]}>-₹{selectedRide.fare.discount}</Text>
                    </View>
                  )}
                  <View style={modal.divider} />
                  <View style={modal.row}>
                    <Text style={modal.totalLabel}>Total Fare Paid</Text>
                    <Text style={modal.totalValue}>₹{selectedRide.fare.total}</Text>
                  </View>
                  <View style={modal.row}>
                    <Text style={modal.label}>Payment Mode</Text>
                    <Text style={[modal.value, { fontFamily: 'Outfit_700Bold' }]}>{selectedRide.payment}</Text>
                  </View>
                </View>

                {/* Refund box if cancelled */}
                {selectedRide.refundStatus && (
                  <View style={modal.refundBox}>
                    <Ionicons name="refresh-circle" size={16} color="#00FF97" />
                    <Text style={modal.refundBoxText}>{selectedRide.refundStatus}</Text>
                  </View>
                )}

                {/* Safe & secure badge */}
                <View style={modal.noBadge}>
                  <Ionicons name="shield-checkmark" size={13} color="#00FF97" />
                  <Text style={modal.noBadgeText}>No hidden charges · Paid securely through OmniGo</Text>
                </View>
              </ScrollView>
            </BlurView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050810' },
  headerArea: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 26, color: '#FFFFFF' },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255, 255, 255, 0.65)', marginTop: 4 },
  list: { padding: 16 },
  cardTouch: { marginBottom: 14, borderRadius: 20, overflow: 'hidden' },
  card: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(14, 24, 48, 0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
  statusText: { fontFamily: 'Outfit_700Bold', fontSize: 11, letterSpacing: 0.5 },
  rideId: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255, 255, 255, 0.4)' },
  dateText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', marginBottom: 12 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  serviceTitle: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#fff' },
  vehicleText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255, 255, 255, 0.5)', marginTop: 1 },
  totalText: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#00FF97' },
  routeContainer: { flexDirection: 'row', gap: 10, marginBottom: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 12 },
  routeDots: { alignItems: 'center', paddingTop: 4 },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00FF97' },
  line: { width: 2, height: 16, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 2 },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4D4D' },
  routeTextWrapper: { flex: 1 },
  routeText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  receiptAction: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 10 },
  viewInvoiceLink: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: '#00CFFF' },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  container: { maxHeight: '88%', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', padding: 24, backgroundColor: 'rgba(10,16,28,0.98)', borderWidth: 1, borderColor: 'rgba(0,207,255,0.15)', borderBottomWidth: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#fff' },
  sub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  brand: { alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  brandName: { fontFamily: 'Outfit_700Bold', fontSize: 28, color: '#00CFFF' },
  brandSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  section: { marginBottom: 14 },
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.8, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  value: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#fff', textAlign: 'right', flex: 1, marginLeft: 10 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 10 },
  totalLabel: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#fff' },
  totalValue: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#00FF97' },
  refundBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(0,255,151,0.06)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,255,151,0.15)', marginBottom: 14 },
  refundBoxText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#00FF97', flex: 1, lineHeight: 18 },
  noBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,255,151,0.04)', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0,255,151,0.12)', marginBottom: 10 },
  noBadgeText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#00FF97' },
});
