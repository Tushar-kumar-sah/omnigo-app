import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bookings } from '../../constants/mock-data';
import { theme } from '../../constants/theme';

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />

      <View style={[styles.headerArea, { paddingTop: Math.max(insets.top + 10, 44) }]}>
        <Text style={styles.headerTitle}>Live Tracking & Bookings</Text>
        <Text style={styles.headerSubtitle}>Monitor active dispatch & historical rides</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {bookings.map((booking) => (
          <TouchableOpacity key={booking.id} style={styles.cardTouch} activeOpacity={0.85}>
            <BlurView intensity={85} tint="dark" style={styles.card}>
              <LinearGradient
                colors={['rgba(0, 207, 255, 0.18)', 'rgba(255, 255, 255, 0.04)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.row}>
                <View style={styles.typeBadge}>
                  <Ionicons name="car-sport" size={16} color="#00CFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.typeText}>{booking.type}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        booking.status === 'Completed'
                          ? 'rgba(0, 255, 151, 0.15)'
                          : 'rgba(255, 59, 48, 0.15)',
                      borderColor:
                        booking.status === 'Completed' ? '#00FF97' : '#FF3B30',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: booking.status === 'Completed' ? '#00FF97' : '#FF3B30' },
                    ]}
                  >
                    {booking.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.dateText}>{booking.date}</Text>

              <View style={styles.routeBox}>
                <View style={styles.routeLine}>
                  <View style={[styles.dot, { backgroundColor: '#00CFFF' }]} />
                  <View style={styles.dashedLine} />
                  <View style={[styles.dot, { backgroundColor: '#00FF97' }]} />
                </View>
                <View style={styles.routeLabels}>
                  <Text style={styles.routeText}>From: {booking.pickup}</Text>
                  <Text style={styles.routeText}>To: {booking.drop}</Text>
                </View>
              </View>

              <View style={[styles.row, { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.08)' }]}>
                <Text style={styles.price}>₹{booking.price}</Text>
                <TouchableOpacity style={styles.rebookBtnTouch} activeOpacity={0.8}>
                  <LinearGradient colors={['#00CFFF', '#00FF97']} style={styles.rebookBtn}>
                    <Text style={styles.rebookText}>Rebook Tow</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050810' },
  headerArea: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 26, color: '#FFFFFF' },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255, 255, 255, 0.65)', marginTop: 4 },
  list: { padding: 16, paddingBottom: 120 },
  cardTouch: { marginBottom: 16, borderRadius: 22, overflow: 'hidden' },
  card: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(10, 28, 60, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: { flexDirection: 'row', alignItems: 'center' },
  typeText: { fontFamily: 'Outfit_700Bold', fontSize: 17, color: '#00CFFF' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  statusText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12 },
  dateText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255, 255, 255, 0.55)', marginTop: 4 },
  routeBox: { flexDirection: 'row', marginTop: 12 },
  routeLine: { alignItems: 'center', width: 16, marginRight: 10, paddingTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dashedLine: { flex: 1, width: 1, backgroundColor: 'rgba(255, 255, 255, 0.3)', marginVertical: 4 },
  routeLabels: { flex: 1, gap: 8 },
  routeText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255, 255, 255, 0.85)' },
  price: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#00FF97' },
  rebookBtnTouch: { borderRadius: 14, overflow: 'hidden' },
  rebookBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14 },
  rebookText: { fontFamily: 'Outfit_700Bold', fontSize: 13, color: '#000000' },
});
