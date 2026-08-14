import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { theme } from '../../constants/theme';

// ─── Mock Data ───────────────────────────────────────────────
const BOOKINGS = [
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
    refundStatus: 'Refund Processed · ₹1,539 in 3–5 days',
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
];

type Tab = 'All' | 'Active' | 'Completed' | 'Cancelled';
const TABS: Tab[] = ['All', 'Active', 'Completed', 'Cancelled'];

const STATUS_COLOR: Record<string, string> = {
  Completed: '#00FF97',
  Cancelled:  '#FF4D4D',
  Active:     '#FFD60A',
};

// ─── Component ───────────────────────────────────────────────
export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [invoice, setInvoice]     = useState<typeof BOOKINGS[0] | null>(null);

  const filtered = BOOKINGS.filter(b => {
    if (activeTab === 'All') return true;
    return b.status === activeTab;
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 12, 54) }]}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSub}>Track rides & view receipts</Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
        style={styles.tabScroll}
      >
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom + 90, 100) }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} bookings</Text>
          </View>
        )}

        {filtered.map(booking => (
          <BlurView key={booking.id} intensity={20} tint="dark" style={styles.card}>
            {/* Top Row */}
            <View style={styles.cardTop}>
              <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLOR[booking.status]}18`, borderColor: `${STATUS_COLOR[booking.status]}35` }]}>
                <Text style={[styles.statusText, { color: STATUS_COLOR[booking.status] }]}>{booking.status}</Text>
              </View>
              <Text style={styles.bookingId}>{booking.id}</Text>
            </View>

            <Text style={styles.dateText}>{booking.date}</Text>

            {/* Service & Vehicle */}
            <View style={styles.serviceRow}>
              <MaterialCommunityIcons name="tow-truck" size={20} color={theme.colors.primary} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.serviceTitle}>{booking.service}</Text>
                <Text style={styles.vehicleText}>{booking.vehicle}</Text>
              </View>
              <Text style={styles.totalText}>₹{booking.fare.total}</Text>
            </View>

            <View style={styles.divider} />

            {/* Route */}
            <View style={styles.routeBlock}>
              <View style={styles.routeDots}>
                <View style={styles.greenDot} />
                <View style={styles.dashedLine} />
                <View style={styles.redDot} />
              </View>
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={styles.routeText} numberOfLines={1}>{booking.pickup}</Text>
                <Text style={styles.routeText} numberOfLines={1}>{booking.drop}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Meta */}
            <View style={styles.metaRow}>
              <View style={styles.metaChip}><Ionicons name="navigate-outline" size={12} color={theme.colors.primary} /><Text style={styles.metaText}>{booking.distance}</Text></View>
              <View style={styles.metaChip}><Ionicons name="time-outline" size={12} color={theme.colors.primary} /><Text style={styles.metaText}>{booking.duration}</Text></View>
              <View style={styles.metaChip}><MaterialCommunityIcons name="contactless-payment" size={13} color={theme.colors.primary} /><Text style={styles.metaText}>{booking.payment}</Text></View>
            </View>

            {/* Refund Status */}
            {booking.refundStatus && (
              <View style={styles.refundBadge}>
                <Ionicons name="refresh-circle-outline" size={14} color="#00FF97" />
                <Text style={styles.refundText}>{booking.refundStatus}</Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.invoiceBtn} onPress={() => setInvoice(booking)} activeOpacity={0.8}>
                <Ionicons name="document-text-outline" size={15} color={theme.colors.primary} />
                <Text style={styles.invoiceBtnText}>View Invoice</Text>
              </TouchableOpacity>
              {booking.status === 'Completed' && (
                <TouchableOpacity style={styles.rebookBtn} activeOpacity={0.8}>
                  <Ionicons name="refresh-outline" size={15} color="#000" />
                  <Text style={styles.rebookBtnText}>Rebook</Text>
                </TouchableOpacity>
              )}
            </View>
          </BlurView>
        ))}
      </ScrollView>

      {/* ─── Invoice Modal ─── */}
      <Modal visible={!!invoice} animationType="slide" transparent statusBarTranslucent>
        <View style={modal.overlay}>
          <BlurView intensity={30} tint="dark" style={modal.container}>
            {/* Header */}
            <View style={modal.header}>
              <View>
                <Text style={modal.title}>Payment Receipt</Text>
                <Text style={modal.sub}>{invoice?.id} · {invoice?.date}</Text>
              </View>
              <TouchableOpacity onPress={() => setInvoice(null)} style={modal.closeBtn}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* OmniGo Branding */}
              <View style={modal.brand}>
                <Text style={modal.brandName}>OmniGo</Text>
                <Text style={modal.brandSub}>Official Trip Receipt</Text>
              </View>

              {/* Service */}
              <View style={modal.section}>
                <Text style={modal.sectionTitle}>Service Details</Text>
                <View style={modal.row}><Text style={modal.label}>Service</Text><Text style={modal.value}>{invoice?.service}</Text></View>
                <View style={modal.row}><Text style={modal.label}>Vehicle</Text><Text style={modal.value}>{invoice?.vehicle}</Text></View>
                <View style={modal.row}><Text style={modal.label}>Driver</Text><Text style={modal.value}>{invoice?.driver} · ⭐ {invoice?.driverRating}</Text></View>
                <View style={modal.row}><Text style={modal.label}>Truck Plate</Text><Text style={modal.value}>{invoice?.driverPlate}</Text></View>
                <View style={modal.row}><Text style={modal.label}>Distance</Text><Text style={modal.value}>{invoice?.distance}</Text></View>
                <View style={modal.row}><Text style={modal.label}>Duration</Text><Text style={modal.value}>{invoice?.duration}</Text></View>
              </View>

              <View style={modal.divider} />

              {/* Fare Breakdown */}
              <View style={modal.section}>
                <Text style={modal.sectionTitle}>Fare Breakdown</Text>
                <View style={modal.row}><Text style={modal.label}>Base Fare</Text><Text style={modal.value}>₹{invoice?.fare.base}</Text></View>
                <View style={modal.row}><Text style={modal.label}>Distance Fee</Text><Text style={modal.value}>₹{invoice?.fare.distance}</Text></View>
                <View style={modal.row}><Text style={modal.label}>Platform Fee</Text><Text style={modal.value}>₹{invoice?.fare.platform}</Text></View>
                <View style={modal.row}><Text style={modal.label}>GST (18%)</Text><Text style={modal.value}>₹{invoice?.fare.gst}</Text></View>
                {(invoice?.fare.discount ?? 0) > 0 && (
                  <View style={modal.row}><Text style={[modal.label, { color: '#00FF97' }]}>Promo Discount</Text><Text style={[modal.value, { color: '#00FF97' }]}>−₹{invoice?.fare.discount}</Text></View>
                )}
                <View style={modal.divider} />
                <View style={modal.row}>
                  <Text style={modal.totalLabel}>Total Paid</Text>
                  <Text style={modal.totalValue}>₹{invoice?.fare.total}</Text>
                </View>
                <View style={modal.row}><Text style={modal.label}>Payment Method</Text><Text style={modal.value}>{invoice?.payment}</Text></View>
              </View>

              {/* Refund if any */}
              {invoice?.refundStatus && (
                <View style={modal.refundBox}>
                  <Ionicons name="refresh-circle" size={16} color="#00FF97" />
                  <Text style={modal.refundBoxText}>{invoice.refundStatus}</Text>
                </View>
              )}

              {/* No hidden charges */}
              <View style={modal.noBadge}>
                <Ionicons name="shield-checkmark" size={13} color="#00FF97" />
                <Text style={modal.noBadgeText}>No hidden charges · All amounts are GST-inclusive</Text>
              </View>
            </ScrollView>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#050810' },
  header:       { paddingHorizontal: 20, paddingBottom: 14 },
  headerTitle:  { fontFamily: 'Outfit_700Bold', fontSize: 24, color: '#fff' },
  headerSub:    { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 3 },
  tabScroll:    { flexGrow: 0, marginBottom: 16 },
  tabRow:       { paddingHorizontal: 20, gap: 8 },
  tab:          { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tabActive:    { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  tabText:      { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  tabTextActive:{ color: '#000', fontFamily: 'Outfit_700Bold' },
  scroll:       { paddingHorizontal: 20, gap: 14 },
  emptyState:   { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText:    { fontFamily: 'Inter_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.3)' },
  card:         { borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', padding: 16, backgroundColor: 'rgba(13,20,32,0.5)', marginBottom: 2 },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  statusBadge:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
  statusText:   { fontFamily: 'Outfit_700Bold', fontSize: 11, letterSpacing: 0.5 },
  bookingId:    { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  dateText:     { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12 },
  serviceRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  serviceTitle: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#fff' },
  vehicleText:  { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  totalText:    { fontFamily: 'Outfit_700Bold', fontSize: 18, color: '#00FF97' },
  divider:      { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 10 },
  routeBlock:   { flexDirection: 'row', gap: 10, marginBottom: 4 },
  routeDots:    { alignItems: 'center', paddingTop: 3 },
  greenDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00FF97' },
  dashedLine:   { width: 2, height: 18, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 2 },
  redDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4D4D' },
  routeText:    { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  metaRow:      { flexDirection: 'row', gap: 8 },
  metaChip:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,207,255,0.06)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(0,207,255,0.15)' },
  metaText:     { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  refundBadge:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,255,151,0.06)', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0,255,151,0.15)', marginTop: 10 },
  refundText:   { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#00FF97', flex: 1 },
  actionRow:    { flexDirection: 'row', gap: 10, marginTop: 12 },
  invoiceBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(0,207,255,0.3)', backgroundColor: 'rgba(0,207,255,0.06)' },
  invoiceBtnText: { fontFamily: 'Outfit_700Bold', fontSize: 13, color: theme.colors.primary },
  rebookBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 100, backgroundColor: theme.colors.primary },
  rebookBtnText:{ fontFamily: 'Outfit_700Bold', fontSize: 13, color: '#000' },
});

const modal = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  container:    { maxHeight: '88%', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', padding: 24, backgroundColor: 'rgba(10,16,28,0.98)', borderWidth: 1, borderColor: 'rgba(0,207,255,0.15)', borderBottomWidth: 0 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title:        { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#fff' },
  sub:          { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 },
  closeBtn:     { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  brand:        { alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  brandName:    { fontFamily: 'Outfit_700Bold', fontSize: 28, color: theme.colors.primary },
  brandSub:     { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  section:      { marginBottom: 14 },
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.8, marginBottom: 10 },
  row:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label:        { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  value:        { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#fff', textAlign: 'right', flex: 1, marginLeft: 10 },
  divider:      { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 10 },
  totalLabel:   { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#fff' },
  totalValue:   { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#00FF97' },
  refundBox:    { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(0,255,151,0.06)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,255,151,0.15)', marginBottom: 14 },
  refundBoxText:{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#00FF97', flex: 1, lineHeight: 18 },
  noBadge:      { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,255,151,0.04)', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0,255,151,0.12)', marginBottom: 10 },
  noBadgeText:  { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#00FF97' },
});
