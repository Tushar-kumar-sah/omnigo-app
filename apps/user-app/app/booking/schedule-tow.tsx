import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

const VEHICLE_IMAGES = {
  sedan: require('../../assets/vehicles/sedan.jpg'),
  suv: require('../../assets/vehicles/suv.jpg'),
  hatchback: require('../../assets/vehicles/hatchback.jpg'),
  bike: require('../../assets/vehicles/bike.jpg'),
  truck: require('../../assets/vehicles/truck.jpg'),
  bus: require('../../assets/vehicles/bus.jpg'),
};

const VEHICLE_TYPES = [
  { id: 'sedan', label: 'Sedan', desc: 'Compact & mid-size', price: '₹1,200' },
  { id: 'suv', label: 'SUV', desc: 'Large vehicles', price: '₹1,500' },
  { id: 'hatchback', label: 'Hatchback', desc: 'Small cars', price: '₹1,000' },
  { id: 'bike', label: 'Bike', desc: 'Two wheelers', price: '₹800' },
  { id: 'truck', label: 'Truck', desc: 'Commercial', price: '₹2,500' },
  { id: 'bus', label: 'Bus / Van', desc: 'Large transport', price: '₹3,500' },
];

const DATES: { day: string; date: number; month: string; full: string }[] = [];
const now = new Date();
for (let i = 0; i < 7; i++) {
  const d = new Date(now.getTime() + i * 86400000);
  DATES.push({
    day: d.toLocaleDateString('en-US', { weekday: 'short' }),
    date: d.getDate(),
    month: d.toLocaleDateString('en-US', { month: 'short' }),
    full: d.toISOString().split('T')[0],
  });
}

const TIME_SLOTS = [
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM',
];

export default function ScheduleTowScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState(DATES[1].full);
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [selectedVehicle, setSelectedVehicle] = useState('sedan');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupFocused, setPickupFocused] = useState(false);
  const [dropoffFocused, setDropoffFocused] = useState(false);

  const canContinue = pickup.trim().length > 0 && dropoff.trim().length > 0;

  const selectedDateObj = DATES.find((d) => d.full === selectedDate);
  const summaryText = selectedDateObj
    ? `${selectedDateObj.day}, ${selectedDateObj.date} ${selectedDateObj.month} at ${selectedTime}`
    : '';

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 48) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Tow</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 24, 40) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Schedule Badge */}
        <View style={styles.scheduleBadge}>
          <LinearGradient
            colors={['rgba(0, 255, 151, 0.15)', 'rgba(0, 207, 255, 0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Ionicons name="calendar" size={14} color="#00FF97" />
          <Text style={styles.scheduleBadgeText}>Advance Booking Schedule</Text>
        </View>

        {/* Date Picker Section */}
        <Text style={styles.sectionLabel}>Select Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateRow}
          contentContainerStyle={{ gap: 10 }}
        >
          {DATES.map((d) => {
            const isSelected = d.full === selectedDate;
            const isToday = d.full === now.toISOString().split('T')[0];
            return (
              <TouchableOpacity
                key={d.full}
                onPress={() => setSelectedDate(d.full)}
                style={[
                  styles.dateCard,
                  isSelected && styles.dateCardSelected,
                ]}
                activeOpacity={0.7}
              >
                {isSelected && (
                  <LinearGradient
                    colors={['rgba(0, 255, 151, 0.25)', 'rgba(0, 207, 255, 0.15)']}
                    style={StyleSheet.absoluteFillObject}
                  />
                )}
                <Text style={[styles.dateDayText, isSelected && styles.dateDayTextSelected]}>
                  {isToday ? 'Today' : d.day}
                </Text>
                <Text style={[styles.dateNumText, isSelected && styles.dateNumTextSelected]}>
                  {d.date}
                </Text>
                <Text style={[styles.dateMonthText, isSelected && styles.dateMonthTextSelected]}>
                  {d.month}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time Picker Section */}
        <Text style={styles.sectionLabel}>Select Time</Text>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.map((t) => {
            const isSelected = t === selectedTime;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setSelectedTime(t)}
                style={[styles.timeChip, isSelected && styles.timeChipSelected]}
                activeOpacity={0.7}
              >
                {isSelected && (
                  <LinearGradient
                    colors={['rgba(0, 207, 255, 0.25)', 'rgba(0, 255, 151, 0.15)']}
                    style={[StyleSheet.absoluteFillObject, { borderRadius: 12 }]}
                  />
                )}
                <Text style={[styles.timeChipText, isSelected && styles.timeChipTextSelected]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Vehicle Type Section */}
        <Text style={styles.sectionLabel}>Vehicle Type</Text>
        <View style={styles.typeGrid}>
          {VEHICLE_TYPES.map((v) => {
            const isSelected = v.id === selectedVehicle;
            return (
              <TouchableOpacity
                key={v.id}
                onPress={() => setSelectedVehicle(v.id)}
                style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                activeOpacity={0.7}
              >
                {isSelected && (
                  <LinearGradient
                    colors={['rgba(0, 207, 255, 0.2)', 'rgba(0, 255, 151, 0.08)']}
                    style={[StyleSheet.absoluteFillObject, { borderRadius: 16 }]}
                  />
                )}
                <View style={[styles.typeIcon, isSelected && styles.typeIconSelected]}>
                  <Image
                    source={VEHICLE_IMAGES[v.id as keyof typeof VEHICLE_IMAGES]}
                    style={styles.typeVehicleImg}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.typeLabel, isSelected && styles.typeLabelSelected]}>{v.label}</Text>
                <Text style={[styles.typeDesc, isSelected && styles.typeDescSelected]}>{v.desc}</Text>
                <Text style={[styles.typePrice, isSelected && styles.typePriceSelected]}>{v.price}</Text>
                {isSelected && (
                  <View style={styles.typeCheckBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#00FF97" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Location Inputs */}
        <Text style={styles.sectionLabel}>Pickup & Drop-off</Text>
        <View style={styles.locationContainer}>
          {/* Pickup */}
          <View style={styles.locationRow}>
            <View style={[styles.locationDot, { backgroundColor: '#00FF97', shadowColor: '#00FF97' }]} />
            <TextInput
              style={[styles.locationInput, pickupFocused && styles.locationInputFocused]}
              placeholder="Enter pickup location"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={pickup}
              onChangeText={setPickup}
              onFocus={() => setPickupFocused(true)}
              onBlur={() => setPickupFocused(false)}
            />
          </View>

          {/* Connector dots */}
          <View style={styles.connectorDots}>
            <View style={styles.dotSmall} />
            <View style={styles.dotSmall} />
            <View style={styles.dotSmall} />
          </View>

          {/* Drop-off */}
          <View style={styles.locationRow}>
            <View style={[styles.locationDot, { backgroundColor: '#FF3B30', shadowColor: '#FF3B30' }]} />
            <TextInput
              style={[styles.locationInput, dropoffFocused && styles.locationInputFocused]}
              placeholder="Enter drop-off location"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={dropoff}
              onChangeText={setDropoff}
              onFocus={() => setDropoffFocused(true)}
              onBlur={() => setDropoffFocused(false)}
            />
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['rgba(0, 255, 151, 0.08)', 'rgba(0, 207, 255, 0.05)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Ionicons name="calendar-outline" size={18} color="#00FF97" />
            <Text style={styles.summaryLabel}>Scheduled For</Text>
          </View>
          <Text style={styles.summaryValue}>{summaryText}</Text>

          <View style={[styles.summaryRow, { marginTop: 14 }]}>
            <MaterialCommunityIcons name="tow-truck" size={18} color="#00CFFF" />
            <Text style={styles.summaryLabel}>Service</Text>
          </View>
          <Text style={styles.summaryValue}>
            {VEHICLE_TYPES.find((v) => v.id === selectedVehicle)?.label} — {VEHICLE_TYPES.find((v) => v.id === selectedVehicle)?.price}
          </Text>

          {pickup.trim().length > 0 && (
            <>
              <View style={[styles.summaryRow, { marginTop: 14 }]}>
                <Ionicons name="location" size={18} color="#00FF97" />
                <Text style={styles.summaryLabel}>Pickup</Text>
              </View>
              <Text style={styles.summaryValue}>{pickup}</Text>
            </>
          )}
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmBtn, !canContinue && styles.confirmBtnDisabled]}
          onPress={() => {
            if (canContinue) router.push('/booking/vehicle-details');
          }}
          activeOpacity={canContinue ? 0.85 : 1}
        >
          <LinearGradient
            colors={canContinue ? ['#00FF97', '#00CFFF'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmBtnGradient}
          >
            <Ionicons name="calendar-outline" size={20} color={canContinue ? '#000' : 'rgba(255,255,255,0.3)'} />
            <Text style={[styles.confirmBtnText, !canContinue && styles.confirmBtnTextDisabled]}>
              SCHEDULE TOW
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  scheduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.3)',
    overflow: 'hidden',
    marginBottom: 24,
    gap: 8,
  },
  scheduleBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#00FF97',
  },
  sectionLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  dateRow: {
    marginBottom: 24,
  },
  dateCard: {
    width: 72,
    height: 90,
    borderRadius: 16,
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 2,
  },
  dateCardSelected: {
    borderColor: '#00FF97',
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  dateDayText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  dateDayTextSelected: {
    color: '#00FF97',
  },
  dateNumText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 22,
    color: 'rgba(255,255,255,0.7)',
  },
  dateNumTextSelected: {
    color: '#FFFFFF',
  },
  dateMonthText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  dateMonthTextSelected: {
    color: 'rgba(0, 255, 151, 0.8)',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  timeChipSelected: {
    borderColor: '#00CFFF',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  timeChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  timeChipTextSelected: {
    color: '#00CFFF',
    fontFamily: 'Outfit_600SemiBold',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
    marginBottom: 20,
  },
  typeCard: {
    width: '31%',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    overflow: 'hidden',
    gap: 2,
  },
  typeCardSelected: {
    borderColor: '#00CFFF',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  typeIcon: {
    width: 64,
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    overflow: 'hidden',
  },
  typeIconSelected: {
    backgroundColor: 'transparent',
  },
  typeVehicleImg: {
    width: '100%',
    height: '100%',
  },
  typeLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  typeLabelSelected: {
    color: '#FFFFFF',
  },
  typeDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 8,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
  typeDescSelected: {
    color: 'rgba(0, 207, 255, 0.7)',
  },
  typePrice: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  typePriceSelected: {
    color: '#00FF97',
  },
  typeCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  locationContainer: {
    marginBottom: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  connectorDots: {
    marginLeft: 4,
    gap: 3,
    paddingVertical: 4,
    alignItems: 'center',
    width: 12,
  },
  dotSmall: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  locationInput: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(13, 20, 32, 0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  locationInputFocused: {
    borderColor: '#00CFFF',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  summaryCard: {
    borderRadius: 20,
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 18,
    marginBottom: 24,
    overflow: 'hidden',
  },
  summaryTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  summaryValue: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 4,
    marginLeft: 26,
  },
  confirmBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
    borderRadius: 16,
  },
  confirmBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#000000',
    letterSpacing: 1,
  },
  confirmBtnTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
});
