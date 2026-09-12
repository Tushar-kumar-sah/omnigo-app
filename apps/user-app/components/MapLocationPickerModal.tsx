import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  Animated,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface MapLocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  type: 'pickup' | 'dropoff';
  initialAddress?: string;
  initialCoordinates?: { latitude: number; longitude: number };
  onSelectLocation?: (data: { address: string; coordinates: { latitude: number; longitude: number } }) => void;
  onConfirmLocation?: (data: { address: string; coordinates: { latitude: number; longitude: number } }) => void;
}

const POPULAR_LANDMARKS = [
  { name: 'Park Street', desc: 'Central Kolkata', lat: 22.5515, lng: 88.3524 },
  { name: 'Salt Lake Sector V', desc: 'IT Hub, Bidhannagar', lat: 22.5735, lng: 88.4331 },
  { name: 'New Town Action Area 1', desc: 'Major Arterial Road', lat: 22.5898, lng: 88.4722 },
  { name: 'Howrah Railway Station', desc: 'Station Approach Road', lat: 22.5855, lng: 88.3426 },
  { name: 'Kolkata Airport (CCU)', desc: 'Dum Dum Airport Area', lat: 22.6547, lng: 88.4467 },
  { name: 'Authorized Hyundai & Tata Service Center', desc: 'EM Bypass Workshop Zone', lat: 22.5186, lng: 88.3976 },
  { name: 'Multi-Brand Garage & Tow Hub', desc: 'VIP Road, Kankurgachi', lat: 22.5830, lng: 88.3912 },
  { name: 'South City Mall', desc: 'Prince Anwar Shah Road', lat: 22.5020, lng: 88.3615 },
  { name: 'Gariahat Market', desc: 'Ballygunge, South Kolkata', lat: 22.5170, lng: 88.3668 },
];

export default function MapLocationPickerModal({
  visible,
  onClose,
  title,
  type,
  initialAddress = '',
  initialCoordinates,
  onSelectLocation,
  onConfirmLocation,
}: MapLocationPickerModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>(
    initialCoordinates || { latitude: 22.5726, longitude: 88.3639 }
  );
  const [zoomLevel, setZoomLevel] = useState(15);
  const [locating, setLocating] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pinBobAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (initialAddress) setSelectedAddress(initialAddress);
      if (initialCoordinates) setCoords(initialCoordinates);

      Animated.loop(
        Animated.sequence([
          Animated.timing(pinBobAnim, { toValue: -6, duration: 700, useNativeDriver: true }),
          Animated.timing(pinBobAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [visible, initialAddress, initialCoordinates]);

  const isPickup = type === 'pickup';
  const themeColor = isPickup ? '#00FF97' : '#00CFFF';

  const handleGetCurrentLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = loc.coords;
        setCoords({ latitude, longitude });

        try {
          const geocodes = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (geocodes && geocodes.length > 0) {
            const g = geocodes[0];
            const parts = [g.name, g.street, g.subregion || g.district, g.city].filter(Boolean);
            const addr = parts.join(', ') || `GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
            setSelectedAddress(addr);
          } else {
            setSelectedAddress(`GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          }
        } catch {
          setSelectedAddress(`GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        }
      }
    } catch (e) {
      console.warn('Map picker GPS error', e);
    } finally {
      setLocating(false);
    }
  };

  const handleSelectLandmark = (item: typeof POPULAR_LANDMARKS[0]) => {
    setCoords({ latitude: item.lat, longitude: item.lng });
    setSelectedAddress(`${item.name}, ${item.desc}`);
  };

  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        setCoords({ latitude, longitude });
        setSelectedAddress(searchQuery.trim());
      } else {
        const match = POPULAR_LANDMARKS.find(l => 
          l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          l.desc.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (match) {
          handleSelectLandmark(match);
        } else {
          setSelectedAddress(searchQuery.trim());
        }
      }
    } catch (e) {
      console.warn('Search geocode error', e);
      setSelectedAddress(searchQuery.trim());
    }
  };

  const handleConfirm = () => {
    const data = {
      address: selectedAddress || (isPickup ? 'Selected Pickup Point' : 'Selected Drop-off Destination'),
      coordinates: coords,
    };
    if (onConfirmLocation) {
      onConfirmLocation(data);
    } else if (onSelectLocation) {
      onSelectLocation(data);
    }
    onClose();
  };

  const filteredLandmarks = useMemo(() => {
    if (!searchQuery.trim()) return POPULAR_LANDMARKS;
    return POPULAR_LANDMARKS.filter(
      item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // High-performance Leaflet real map HTML for mobile WebView & Web
  const mapHtml = useMemo(() => {
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
    .leaflet-tile {
      filter: brightness(0.85) contrast(1.15) saturate(1.1);
    }
    .leaflet-control-container .leaflet-routing-container-hide { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    try {
      const map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        tap: true
      }).setView([${coords.latitude}, ${coords.longitude}], ${zoomLevel});

      // Primary OSM tile layer
      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      // Listen to map drag/pan
      map.on('moveend', function() {
        const center = map.getCenter();
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ 
            type: 'moveend',
            lat: center.lat, 
            lng: center.lng 
          }));
        }
      });

      // Support direct click to center
      map.on('click', function(e) {
        map.panTo(e.latlng);
      });

      window.setMapLocation = function(lat, lng, zoom) {
        map.setView([lat, lng], zoom || 16);
      };
    } catch (e) {
      console.error(e);
    }
  </script>
</body>
</html>
    `;
  }, [coords.latitude, coords.longitude, zoomLevel]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Floating Glass Header */}
        <View style={[styles.headerFloating, { paddingTop: Math.max(insets.top + 8, 44) }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeCircleBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{title || (isPickup ? 'Choose Pickup Point' : 'Choose Drop-off Point')}</Text>
            <Text style={styles.headerSubtitle}>Drag map to place pin accurately</Text>
          </View>

          <TouchableOpacity onPress={handleGetCurrentLocation} style={styles.gpsPulseBtn} activeOpacity={0.8}>
            {locating ? (
              <ActivityIndicator size="small" color="#00FF97" />
            ) : (
              <Ionicons name="locate" size={20} color="#00FF97" />
            )}
          </TouchableOpacity>
        </View>

        {/* Floating Search Bar */}
        <View style={[styles.searchBarFloating, { top: Math.max(insets.top + 68, 104) }]}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" style={{ marginLeft: 12 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={isPickup ? 'Search pickup street or area...' : 'Search destination garage or area...'}
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* 🗺️ REAL LIVE INTERACTIVE MAP CANVAS (MOBILE WEBVIEW & WEB IFRAME) */}
        <View style={styles.mapViewerContainer}>
          {Platform.OS === 'web' ? (
            React.createElement('iframe', {
              title: 'Live Map',
              srcDoc: mapHtml,
              style: {
                width: '100%',
                height: '100%',
                border: 'none',
              },
            })
          ) : (
            <WebView
              originWhitelist={['*']}
              source={{ html: mapHtml }}
              style={styles.webview}
              scrollEnabled={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.lat && data.lng) {
                    setCoords({ latitude: data.lat, longitude: data.lng });
                  }
                } catch (e) {}
              }}
            />
          )}

          {/* Center Target & Animated Crosshair Pin */}
          <View style={styles.centerTargetContainer} pointerEvents="none">
            <Animated.View style={[styles.targetRingOuter, { transform: [{ scale: pulseAnim }], borderColor: themeColor }]} />
            <View style={[styles.targetRingInner, { borderColor: themeColor }]} />
            
            <Animated.View style={{ transform: [{ translateY: pinBobAnim }], alignItems: 'center' }}>
              <View style={[styles.pinHead, { backgroundColor: themeColor, shadowColor: themeColor }]}>
                <Ionicons name={isPickup ? 'pin' : 'flag'} size={18} color="#000000" />
              </View>
              <View style={[styles.pinStem, { backgroundColor: themeColor }]} />
              <View style={styles.pinShadow} />
            </Animated.View>
          </View>

          {/* Floating Zoom Map Controls */}
          <View style={styles.mapControlsFloating}>
            <TouchableOpacity 
              style={styles.mapFab} 
              onPress={() => setZoomLevel(prev => Math.min(prev + 1, 19))}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.mapFab} 
              onPress={() => setZoomLevel(prev => Math.max(prev - 1, 10))}
              activeOpacity={0.8}
            >
              <Ionicons name="remove" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.mapFab, { backgroundColor: 'rgba(0,255,151,0.2)', borderColor: '#00FF97' }]} 
              onPress={handleGetCurrentLocation}
              activeOpacity={0.8}
            >
              <Ionicons name="locate" size={18} color="#00FF97" />
            </TouchableOpacity>
          </View>

          {/* Map Status Pill */}
          <View style={styles.mapHintPill}>
            <View style={[styles.liveDot, { backgroundColor: themeColor }]} />
            <Text style={styles.mapHintText}>
              Live GPS: {coords.latitude.toFixed(4)}° N, {coords.longitude.toFixed(4)}° E
            </Text>
          </View>
        </View>

        {/* Bottom Location Confirmation Sheet */}
        <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom + 16, 28) }]}>
          {/* Popular Landmark Suggestions */}
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.suggestionsLabel}>SELECT KNOWN WORKSHOP OR LANDMARK</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
            >
              {filteredLandmarks.map((item) => {
                const isSelected = selectedAddress.includes(item.name);
                return (
                  <TouchableOpacity
                    key={item.name}
                    onPress={() => handleSelectLandmark(item)}
                    style={[
                      styles.landmarkChip,
                      isSelected && { borderColor: themeColor, backgroundColor: isPickup ? 'rgba(0,255,151,0.15)' : 'rgba(0,207,255,0.15)' },
                    ]}
                  >
                    <Ionicons
                      name={item.name.includes('Service') || item.name.includes('Garage') ? 'construct' : 'location'}
                      size={12}
                      color={isSelected ? themeColor : 'rgba(255,255,255,0.6)'}
                    />
                    <Text style={[styles.landmarkChipText, isSelected && { color: themeColor, fontFamily: 'Outfit_600SemiBold' }]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Selected Address Card */}
          <BlurView intensity={35} tint="dark" style={styles.selectedAddressCard}>
            <View style={[styles.typeBadge, { backgroundColor: isPickup ? 'rgba(0,255,151,0.15)' : 'rgba(0,207,255,0.15)' }]}>
              <Text style={[styles.typeBadgeText, { color: themeColor }]}>
                {isPickup ? '📍 SELECTED PICKUP SPOT' : '🏁 SELECTED DROP-OFF DESTINATION'}
              </Text>
            </View>
            <TextInput
              style={styles.addressEditableInput}
              value={selectedAddress}
              onChangeText={setSelectedAddress}
              placeholder={isPickup ? 'Enter pickup landmark...' : 'Enter drop-off destination...'}
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
            />
          </BlurView>

          {/* Confirm Button */}
          <TouchableOpacity onPress={handleConfirm} activeOpacity={0.85} style={styles.confirmBtnTouch}>
            <LinearGradient
              colors={isPickup ? ['#00FF97', '#00CC7A'] : ['#00CFFF', '#0099FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmBtn}
            >
              <Ionicons name="checkmark-circle" size={18} color="#000000" style={{ marginRight: 6 }} />
              <Text style={styles.confirmBtnText}>
                {isPickup ? 'CONFIRM PICKUP SPOT' : 'CONFIRM DROP-OFF DESTINATION'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040711',
  },
  headerFloating: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(4,7,17,0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  closeCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: { flex: 1, marginLeft: 12 },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#FFFFFF' },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  gpsPulseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,255,151,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,151,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchBarFloating: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13,20,32,0.92)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,207,255,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },

  mapViewerContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#070c18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#070c18',
  },

  centerTargetContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    marginLeft: -30,
    marginTop: -30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  targetRingOuter: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    opacity: 0.7,
  },
  targetRingInner: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  pinHead: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  pinStem: { width: 3, height: 8, marginTop: -2 },
  pinShadow: { width: 12, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.5)', marginTop: 2 },

  mapControlsFloating: {
    position: 'absolute',
    right: 16,
    bottom: 230,
    zIndex: 15,
    gap: 8,
  },
  mapFab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(13,20,32,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  mapHintPill: {
    position: 'absolute',
    left: 16,
    bottom: 230,
    zIndex: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7,12,24,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 6,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  mapHintText: { fontFamily: 'Outfit_600SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.8)' },

  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    backgroundColor: '#09101E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,207,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  suggestionsLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    marginBottom: 6,
  },
  landmarkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  landmarkChipText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#FFFFFF' },

  selectedAddressCard: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
    overflow: 'hidden',
  },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 6 },
  typeBadgeText: { fontFamily: 'Outfit_700Bold', fontSize: 10, letterSpacing: 0.5 },
  addressEditableInput: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#FFFFFF',
    padding: 0,
    lineHeight: 18,
  },

  confirmBtnTouch: { borderRadius: 14, overflow: 'hidden' },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  confirmBtnText: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#000000', letterSpacing: 0.5 },
});
