import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
const WebViewComponent = WebView as any;
import {
  fetchPlacePredictions,
  fetchPlaceDetails,
  reverseGeocodeGoogle,
  PlacePrediction,
} from '@/lib/googleMaps';

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
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>(
    initialCoordinates && initialCoordinates.latitude !== 0
      ? initialCoordinates
      : { latitude: 22.5726, longitude: 88.3639 }
  );
  const [zoomLevel, setZoomLevel] = useState(16);
  const [locating, setLocating] = useState(false);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);

  const webViewRef = useRef<WebView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pinBobAnim = useRef(new Animated.Value(0)).current;
  const searchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      if (initialAddress) setSelectedAddress(initialAddress);
      if (initialCoordinates && initialCoordinates.latitude !== 0) {
        setCoords(initialCoordinates);
      } else {
        handleGetCurrentLocation();
      }

      Animated.loop(
        Animated.sequence([
          Animated.timing(pinBobAnim, { toValue: -8, duration: 600, useNativeDriver: true }),
          Animated.timing(pinBobAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [visible]);

  // Live Google Places Autocomplete search (debounced 350ms)
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (text.trim().length < 2) {
      setPredictions([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await fetchPlacePredictions(text, coords);
        setPredictions(results);
      } catch (e) {
        console.warn('[MapPicker] Autocomplete search error:', e);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  // Select place prediction from Google Places
  const handleSelectPrediction = async (prediction: PlacePrediction) => {
    setSearching(true);
    try {
      const details = await fetchPlaceDetails(prediction.placeId);
      if (details) {
        setCoords(details.coordinates);
        setSelectedAddress(details.address);
        setSearchQuery('');
        setPredictions([]);

        // Move WebView map camera to new location
        const js = `if (window.setMapLocation) { window.setMapLocation(${details.coordinates.latitude}, ${details.coordinates.longitude}, 16); } true;`;
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(js);
        }
      }
    } catch (e) {
      console.warn('[MapPicker] Place details selection error:', e);
    } finally {
      setSearching(false);
    }
  };

  // Handle map pan/drag end -> Google Reverse Geocoding
  const handleMapMoveEnd = useCallback(async (lat: number, lng: number) => {
    setCoords({ latitude: lat, longitude: lng });
    setReverseGeocoding(true);
    try {
      const geo = await reverseGeocodeGoogle(lat, lng);
      setSelectedAddress(geo.address);
    } catch (e) {
      console.warn('[MapPicker] Reverse geocode error:', e);
    } finally {
      setReverseGeocoding(false);
    }
  }, []);

  // GPS current location (instant cached + accurate live)
  const handleGetCurrentLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const cached = await Location.getLastKnownPositionAsync();
          if (cached?.coords) {
            setCoords({ latitude: cached.coords.latitude, longitude: cached.coords.longitude });
            if (webViewRef.current) {
              webViewRef.current.injectJavaScript(`if (window.setMapLocation) { window.setMapLocation(${cached.coords.latitude}, ${cached.coords.longitude}, 16); } true;`);
            }
          }
        } catch {}

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const { latitude, longitude } = loc.coords;
        setCoords({ latitude, longitude });

        const js = `if (window.setMapLocation) { window.setMapLocation(${latitude}, ${longitude}, 16); } true;`;
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(js);
        }

        const geo = await reverseGeocodeGoogle(latitude, longitude);
        setSelectedAddress(geo.address);
      }
    } catch (e) {
      console.warn('[MapPicker] GPS error:', e);
    } finally {
      setLocating(false);
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

  const isPickup = type === 'pickup';
  const themeColor = isPickup ? '#00FF97' : '#00CFFF';

  // Real-time Leaflet Map with Google Maps-style styling
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
      filter: brightness(0.88) contrast(1.15) saturate(1.1);
    }
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

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      let isMoving = false;

      map.on('movestart', function() {
        isMoving = true;
      });

      map.on('moveend', function() {
        isMoving = false;
        const center = map.getCenter();
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ 
            type: 'moveend',
            lat: center.lat, 
            lng: center.lng 
          }));
        }
      });

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
  }, []);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header */}
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

        {/* Floating Google Places Autocomplete Search Bar */}
        <View style={[styles.searchBarFloating, { top: Math.max(insets.top + 68, 104) }]}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" style={{ marginLeft: 12 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={isPickup ? 'Search pickup street or landmark...' : 'Search drop-off destination or workshop...'}
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchQuery}
            onChangeText={handleSearchChange}
            returnKeyType="search"
          />
          {searching ? (
            <ActivityIndicator size="small" color={themeColor} style={{ marginRight: 10 }} />
          ) : searchQuery ? (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setPredictions([]); }} style={{ padding: 8 }}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Live Google Places Predictions Dropdown */}
        {predictions.length > 0 && (
          <View style={[styles.predictionsDropdown, { top: Math.max(insets.top + 120, 156) }]}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {predictions.map((item) => (
                <TouchableOpacity
                  key={item.placeId}
                  style={styles.predictionItem}
                  onPress={() => handleSelectPrediction(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.predictionIconWrap, { backgroundColor: isPickup ? 'rgba(0,255,151,0.12)' : 'rgba(0,207,255,0.12)' }]}>
                    <Ionicons name="location-sharp" size={16} color={themeColor} />
                  </View>
                  <View style={styles.predictionTextWrap}>
                    <Text style={styles.predictionPrimaryText} numberOfLines={1}>
                      {item.primaryText}
                    </Text>
                    <Text style={styles.predictionSecondaryText} numberOfLines={1}>
                      {item.secondaryText}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Map Canvas */}
        <View style={styles.mapViewerContainer}>
          {Platform.OS === 'web' ? (
            React.createElement('iframe', {
              title: 'Live Map',
              srcDoc: mapHtml,
              style: { width: '100%', height: '100%', border: 'none' },
            })
          ) : (
            <WebViewComponent
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: mapHtml }}
              style={styles.webview}
              scrollEnabled={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              onMessage={(event: any) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.type === 'moveend' && data.lat && data.lng) {
                    handleMapMoveEnd(data.lat, data.lng);
                  }
                } catch (e) {}
              }}
            />
          )}
        </View>

        {/* Center Pin Indicator (Uber/Rapido style) */}
        <View pointerEvents="none" style={styles.centerTargetContainer}>
          <Animated.View style={[styles.targetRingOuter, { borderColor: themeColor, transform: [{ scale: pulseAnim }] }]} />
          <View style={[styles.targetRingInner, { borderColor: themeColor }]} />
          <Animated.View style={{ transform: [{ translateY: pinBobAnim }], alignItems: 'center' }}>
            <View style={[styles.pinHead, { backgroundColor: themeColor }]}>
              <Ionicons name={isPickup ? 'pin' : 'flag'} size={18} color="#000000" />
            </View>
            <View style={[styles.pinStem, { backgroundColor: themeColor }]} />
            <View style={styles.pinShadow} />
          </Animated.View>
        </View>

        {/* Map Controls */}
        <View style={styles.mapControlsFloating}>
          <TouchableOpacity
            style={styles.mapFab}
            activeOpacity={0.8}
            onPress={() => {
              if (webViewRef.current) {
                webViewRef.current.injectJavaScript(`if (window.setMapLocation) { window.setMapLocation(${coords.latitude}, ${coords.longitude}, 18); } true;`);
              }
            }}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mapFab}
            activeOpacity={0.8}
            onPress={() => {
              if (webViewRef.current) {
                webViewRef.current.injectJavaScript(`if (window.setMapLocation) { window.setMapLocation(${coords.latitude}, ${coords.longitude}, 14); } true;`);
              }
            }}
          >
            <Ionicons name="remove" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Bottom Sheet - Selected Address Card */}
        <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
          <View style={styles.selectedAddressCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={[styles.typeBadge, { backgroundColor: isPickup ? 'rgba(0,255,151,0.15)' : 'rgba(0,207,255,0.15)' }]}>
                <Text style={[styles.typeBadgeText, { color: themeColor }]}>
                  {isPickup ? '📍 PICKUP LOCATION' : '🏁 DROP-OFF DESTINATION'}
                </Text>
              </View>
              {reverseGeocoding && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <ActivityIndicator size="small" color={themeColor} />
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_400Regular' }}>Updating...</Text>
                </View>
              )}
            </View>
            <TextInput
              style={styles.addressEditableInput}
              value={selectedAddress}
              onChangeText={setSelectedAddress}
              multiline
              numberOfLines={2}
            />
          </View>

          <TouchableOpacity style={styles.confirmBtnTouch} activeOpacity={0.85} onPress={handleConfirm}>
            <LinearGradient
              colors={isPickup ? ['#00FF97', '#00CFFF'] : ['#00CFFF', '#0077FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmBtn}
            >
              <Text style={styles.confirmBtnText}>
                {isPickup ? 'CONFIRM PICKUP LOCATION' : 'CONFIRM DESTINATION'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#000000" style={{ marginLeft: 6 }} />
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
    backgroundColor: '#050810',
  },
  headerFloating: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(5,8,16,0.92)',
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
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 1,
  },
  gpsPulseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,255,151,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,151,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarFloating: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13,20,32,0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,207,255,0.3)',
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
  predictionsDropdown: {
    position: 'absolute',
    left: 16,
    right: 16,
    maxHeight: 220,
    zIndex: 40,
    backgroundColor: '#0A1222',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,207,255,0.4)',
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 12,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  predictionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  predictionTextWrap: {
    flex: 1,
  },
  predictionPrimaryText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  predictionSecondaryText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  mapViewerContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#070c18',
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
    bottom: 210,
    zIndex: 15,
    gap: 8,
  },
  mapFab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(13,20,32,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
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
    elevation: 12,
  },
  selectedAddressCard: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
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
