import React, { useState, useEffect, useMemo } from 'react';
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
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import MapLocationPickerModal from '@/components/MapLocationPickerModal';
import { reverseGeocodeGoogle } from '@/lib/googleMaps';

const VEHICLE_IMAGES = {
  sedan: require('@/assets/vehicles/sedan.jpg'),
  suv: require('@/assets/vehicles/suv.jpg'),
  hatchback: require('@/assets/vehicles/hatchback.jpg'),
  bike: require('@/assets/vehicles/bike.jpg'),
  truck: require('@/assets/vehicles/truck.jpg'),
  bus: require('@/assets/vehicles/bus.jpg'),
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

  // Map & Coordinates State
  const [pickupCoords, setPickupCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapPickerType, setMapPickerType] = useState<'pickup' | 'dropoff'>('pickup');
  const [locatingGps, setLocatingGps] = useState(false);

  // Auto-detect current GPS location on initial load if pickup is empty
  useEffect(() => {
    if (!pickup) {
      detectCurrentLocation();
    }
  }, []);

  const detectCurrentLocation = async () => {
    try {
      setLocatingGps(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const cached = await Location.getLastKnownPositionAsync();
          if (cached?.coords) {
            setPickupCoords({ latitude: cached.coords.latitude, longitude: cached.coords.longitude });
          }
        } catch {}

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setPickupCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        try {
          const res = await reverseGeocodeGoogle(loc.coords.latitude, loc.coords.longitude);
          if (res?.address) {
            setPickup(res.address);
          }
        } catch {}
      }
    } catch (e) {
      console.warn('[ScheduleTow GPS]', e);
    } finally {
      setLocatingGps(false);
    }
  };

  // Approximate distance calculation in km
  const calculatedDistance = useMemo(() => {
    if (pickupCoords && dropoffCoords && dropoffCoords.latitude !== 0) {
      const R = 6371;
      const dLat = ((dropoffCoords.latitude - pickupCoords.latitude) * Math.PI) / 180;
      const dLon = ((dropoffCoords.longitude - pickupCoords.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((pickupCoords.latitude * Math.PI) / 180) *
          Math.cos((dropoffCoords.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.max(1, Math.round(R * c * 10) / 10);
    }
    return 10;
  }, [pickupCoords, dropoffCoords]);

  // Leaflet map preview HTML
  const mapHtml = useMemo(() => {
    const pLat = pickupCoords?.latitude || 22.5726;
    const pLng = pickupCoords?.longitude || 88.3639;
    const hasDrop = Boolean(dropoffCoords && dropoffCoords.latitude !== 0);
    const dLat = dropoffCoords?.latitude || 0;
    const dLng = dropoffCoords?.longitude || 0;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: #070c18;
      overflow: hidden;
    }
    .leaflet-tile-pane {
      filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(110%);
    }
    .custom-div-icon {
      background: transparent;
      border: none;
    }
    .pin-pickup {
      width: 28px;
      height: 28px;
      border-radius: 14px;
      background: #00FF97;
      border: 3px solid #000;
      box-shadow: 0 0 12px rgba(0,255,151,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000;
      font-weight: 900;
      font-size: 13px;
    }
    .pin-dropoff {
      width: 28px;
      height: 28px;
      border-radius: 14px;
      background: #FF3B30;
      border: 3px solid #fff;
      box-shadow: 0 0 12px rgba(255,59,48,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 900;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    try {
      const pLat = ${pLat};
      const pLng = ${pLng};
      const hasDrop = ${hasDrop};
      const dLat = ${dLat};
      const dLng = ${dLng};

      const map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        scrollWheelZoom: false,
        tap: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      // Pickup Marker
      const pickupIcon = L.divIcon({
        className: 'custom-div-icon',
        html: '<div class="pin-pickup">P</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      L.marker([pLat, pLng], { icon: pickupIcon }).addTo(map);

      if (hasDrop && dLat !== 0) {
        // Dropoff Marker
        const dropIcon = L.divIcon({
          className: 'custom-div-icon',
          html: '<div class="pin-dropoff">D</div>',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        L.marker([dLat, dLng], { icon: dropIcon }).addTo(map);

        // Polyline connecting them
        L.polyline([[pLat, pLng], [dLat, dLng]], {
          color: '#00CFFF',
          weight: 3.5,
          opacity: 0.85,
          dashArray: '6, 8'
        }).addTo(map);

        map.fitBounds([[pLat, pLng], [dLat, dLng]], { padding: [25, 25] });
      } else {
        map.setView([pLat, pLng], 14);
      }
    } catch(e) {
      console.error(e);
    }
  </script>
</body>
</html>
    `;
  }, [pickupCoords, dropoffCoords]);

  const canContinue = pickup.trim().length > 0 && dropoff.trim().length > 0;

  const selectedDateObj = DATES.find((d) => d.full === selectedDate);
  const summaryText = selectedDateObj
    ? `${selectedDateObj.day}, ${selectedDateObj.date} ${selectedDateObj.month} at ${selectedTime}`
    : '';

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFill} />

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
            style={StyleSheet.absoluteFill}
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
                    style={StyleSheet.absoluteFill}
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
                    style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
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
                    style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
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

        {/* SECTION: Pickup & Drop-off Route with Map Integration */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Pickup & Drop-off</Text>
          <View style={styles.sectionHeaderActions}>
            <TouchableOpacity
              onPress={() => {
                setMapPickerType('pickup');
                setShowMapPicker(true);
              }}
              style={styles.headerActionBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="map" size={12} color="#00CFFF" />
              <Text style={styles.headerActionText}>Choose on Map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={detectCurrentLocation}
              style={[styles.headerActionBtn, styles.headerActionBtnGps]}
              activeOpacity={0.7}
            >
              <Ionicons name="navigate" size={12} color="#00FF97" />
              <Text style={[styles.headerActionText, { color: '#00FF97' }]}>
                {locatingGps ? 'Locating...' : 'GPS'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.locationContainer}>
          {/* Pickup Input */}
          <View style={styles.locationRow}>
            <View style={[styles.locationDot, { backgroundColor: '#00FF97', shadowColor: '#00FF97' }]} />
            <View style={[styles.inputWrapper, pickupFocused && styles.locationInputFocused]}>
              <TextInput
                style={styles.locationInput}
                placeholder="Enter pickup location"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={pickup}
                onChangeText={setPickup}
                onFocus={() => setPickupFocused(true)}
                onBlur={() => setPickupFocused(false)}
              />
              <TouchableOpacity
                onPress={() => {
                  setMapPickerType('pickup');
                  setShowMapPicker(true);
                }}
                style={styles.inlineMapBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="map" size={13} color="#00CFFF" />
                <Text style={styles.inlineMapBtnText}>Map</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Connector dots */}
          <View style={styles.connectorDots}>
            <View style={styles.dotSmall} />
            <View style={styles.dotSmall} />
            <View style={styles.dotSmall} />
          </View>

          {/* Drop-off Input */}
          <View style={styles.locationRow}>
            <View style={[styles.locationDot, { backgroundColor: '#FF3B30', shadowColor: '#FF3B30' }]} />
            <View style={[styles.inputWrapper, dropoffFocused && styles.locationInputFocused]}>
              <TextInput
                style={styles.locationInput}
                placeholder="Enter drop-off location"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={dropoff}
                onChangeText={setDropoff}
                onFocus={() => setDropoffFocused(true)}
                onBlur={() => setDropoffFocused(false)}
              />
              <TouchableOpacity
                onPress={() => {
                  setMapPickerType('dropoff');
                  setShowMapPicker(true);
                }}
                style={[styles.inlineMapBtn, { borderColor: 'rgba(255,59,48,0.35)', backgroundColor: 'rgba(255,59,48,0.1)' }]}
                activeOpacity={0.7}
              >
                <Ionicons name="map" size={13} color="#FF3B30" />
                <Text style={[styles.inlineMapBtnText, { color: '#FF3B30' }]}>Map</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Destination Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickChipsRow}
          >
            {[
              { label: '🏢 Nearest Workshop', value: 'Nearest Authorized Service Center' },
              { label: '🏠 Home / Residence', value: 'Home Address' },
              { label: '🚗 Dealership Center', value: 'Authorized Dealership Center' },
            ].map((chip) => (
              <TouchableOpacity
                key={chip.label}
                onPress={() => setDropoff(chip.value)}
                style={styles.quickChip}
                activeOpacity={0.7}
              >
                <Text style={styles.quickChipText}>{chip.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Interactive Map Preview Card */}
        <View style={styles.mapCard}>
          <View style={styles.mapCardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="navigate-circle" size={16} color="#00CFFF" />
              <Text style={styles.mapCardTitle}>Interactive Route Map</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setMapPickerType(pickup ? 'dropoff' : 'pickup');
                setShowMapPicker(true);
              }}
              style={styles.mapCardExpandBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="scan-outline" size={13} color="#00CFFF" />
              <Text style={styles.mapCardExpandText}>Full Screen Map</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            <WebView
              originWhitelist={['*']}
              source={{ html: mapHtml }}
              style={styles.mapWebview}
              scrollEnabled={false}
              bounces={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            />
            {/* Overlay buttons to tap map & choose location */}
            <View style={styles.mapOverlayControls}>
              <TouchableOpacity
                onPress={() => {
                  setMapPickerType('pickup');
                  setShowMapPicker(true);
                }}
                style={[styles.mapOverlayChip, { borderColor: 'rgba(0,255,151,0.5)', backgroundColor: 'rgba(10,24,36,0.92)' }]}
                activeOpacity={0.8}
              >
                <View style={[styles.mapOverlayDot, { backgroundColor: '#00FF97' }]} />
                <Text style={[styles.mapOverlayChipText, { color: '#00FF97' }]}>
                  {pickup ? 'Edit Pickup' : 'Pick on Map'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMapPickerType('dropoff');
                  setShowMapPicker(true);
                }}
                style={[styles.mapOverlayChip, { borderColor: 'rgba(255,59,48,0.5)', backgroundColor: 'rgba(32,12,18,0.92)' }]}
                activeOpacity={0.8}
              >
                <View style={[styles.mapOverlayDot, { backgroundColor: '#FF3B30' }]} />
                <Text style={[styles.mapOverlayChipText, { color: '#FF3B30' }]}>
                  {dropoff ? 'Edit Drop-off' : 'Set Drop-off'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['rgba(0, 255, 151, 0.08)', 'rgba(0, 207, 255, 0.05)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
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

          {dropoff.trim().length > 0 && (
            <>
              <View style={[styles.summaryRow, { marginTop: 14 }]}>
                <Ionicons name="flag" size={18} color="#FF3B30" />
                <Text style={styles.summaryLabel}>Drop-off</Text>
              </View>
              <Text style={styles.summaryValue}>{dropoff}</Text>

              <View style={[styles.summaryRow, { marginTop: 14 }]}>
                <Ionicons name="navigate-outline" size={18} color="#00CFFF" />
                <Text style={styles.summaryLabel}>Est. Distance</Text>
              </View>
              <Text style={styles.summaryValue}>{calculatedDistance} km</Text>
            </>
          )}
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmBtn, !canContinue && styles.confirmBtnDisabled]}
          onPress={() => {
            if (canContinue) {
              router.push({
                pathname: '/booking/confirm',
                params: {
                  vehicleType: selectedVehicle,
                  vehicleName: `${selectedVehicle.toUpperCase()} Tow`,
                  pickup: pickup.trim(),
                  dropoff: dropoff.trim(),
                  pickupLat: pickupCoords?.latitude?.toString() || '',
                  pickupLng: pickupCoords?.longitude?.toString() || '',
                  dropoffLat: dropoffCoords?.latitude?.toString() || '',
                  dropoffLng: dropoffCoords?.longitude?.toString() || '',
                  distance: calculatedDistance.toString(),
                  baseFare: '1200',
                  distanceFee: `${Math.round(calculatedDistance * 20)}`,
                  serviceIssue: 'Scheduled Pickup',
                  scheduledDate: selectedDate,
                  scheduledTime: selectedTime,
                  scheduledDateTime: summaryText,
                },
              });
            }
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

      {/* Interactive Map Location Picker Modal */}
      <MapLocationPickerModal
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        type={mapPickerType}
        title={mapPickerType === 'pickup' ? 'Select Pickup on Map' : 'Select Drop-off on Map'}
        initialAddress={mapPickerType === 'pickup' ? pickup : dropoff}
        initialCoordinates={
          mapPickerType === 'pickup'
            ? pickupCoords || undefined
            : dropoffCoords || pickupCoords || undefined
        }
        onSelectLocation={({ address, coordinates }) => {
          if (mapPickerType === 'pickup') {
            setPickup(address);
            if (coordinates && coordinates.latitude !== 0) {
              setPickupCoords(coordinates);
            }
          } else {
            setDropoff(address);
            if (coordinates && coordinates.latitude !== 0) {
              setDropoffCoords(coordinates);
            }
          }
        }}
      />
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
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
  },
  headerActionBtnGps: {
    backgroundColor: 'rgba(0, 255, 151, 0.12)',
    borderColor: 'rgba(0, 255, 151, 0.3)',
  },
  headerActionText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 11,
    color: '#00CFFF',
  },
  dateRow: {
    marginBottom: 24,
    marginTop: 12,
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
    marginTop: 12,
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
    marginTop: 12,
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
    marginBottom: 16,
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
  inputWrapper: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(13, 20, 32, 0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  locationInput: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    paddingRight: 8,
  },
  locationInputFocused: {
    borderColor: '#00CFFF',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  inlineMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.35)',
  },
  inlineMapBtnText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 11,
    color: '#00CFFF',
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingLeft: 24,
  },
  quickChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  quickChipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  mapCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  mapCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mapCardTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  mapCardExpandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
  },
  mapCardExpandText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#00CFFF',
  },
  mapContainer: {
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  mapWebview: {
    flex: 1,
    backgroundColor: '#070c18',
  },
  mapOverlayControls: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  mapOverlayChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  mapOverlayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mapOverlayChipText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 11,
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
