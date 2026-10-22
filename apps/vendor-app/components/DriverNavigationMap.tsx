import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { fetchDrivingRoute, RouteResult } from '@/lib/googleMaps';

export interface DriverNavigationMapProps {
  driverCoords: { latitude: number; longitude: number };
  userCoords: { latitude: number; longitude: number };
  customerName?: string;
  customerVehicle?: string;
  pickupAddress?: string;
  driverSpeed?: number;
  driverHeading?: number;
  onRouteCalculated?: (route: RouteResult) => void;
  isSimulating?: boolean;
  onToggleSimulate?: () => void;
}

export default function DriverNavigationMap({
  driverCoords,
  userCoords,
  customerName = 'Customer',
  customerVehicle = 'Vehicle',
  pickupAddress = 'Breakdown Location',
  driverSpeed = 0,
  driverHeading = 0,
  onRouteCalculated,
  isSimulating = false,
  onToggleSimulate,
}: DriverNavigationMapProps) {
  const uLat = userCoords?.latitude || 22.5515;
  const uLng = userCoords?.longitude || 88.3524;
  const dLat = driverCoords?.latitude || uLat;
  const dLng = driverCoords?.longitude || uLng;

  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const lastCoordsRef = useRef({ lat: dLat, lng: dLng });

  // Fetch real Google Routes driving polyline
  useEffect(() => {
    let isMounted = true;
    async function loadRoute() {
      if (!dLat || !dLng || !uLat || !uLng) return;
      setLoadingRoute(true);
      try {
        const route = await fetchDrivingRoute(
          { latitude: dLat, longitude: dLng },
          { latitude: uLat, longitude: uLng }
        );
        if (isMounted && route) {
          setRouteData(route);
          onRouteCalculated?.(route);
        }
      } catch (e) {
        console.warn('[DriverNavigationMap] Route fetch error:', e);
      } finally {
        if (isMounted) setLoadingRoute(false);
      }
    }
    loadRoute();
    return () => {
      isMounted = false;
    };
  }, [uLat, uLng]);

  // Dynamically update road route polyline without reloading HTML
  useEffect(() => {
    if (routeData?.coordinates && routeData.coordinates.length > 0) {
      const pts = routeData.coordinates.map(c => [c.latitude, c.longitude]);
      webViewRef.current?.injectJavaScript(`
        if (window.updateRoutePolyline) {
          window.updateRoutePolyline(${JSON.stringify(pts)});
        }
        true;
      `);
    }
  }, [routeData]);

  // Smoothly update driver marker position without reloading HTML
  useEffect(() => {
    if (dLat && dLng) {
      if (
        Math.abs(lastCoordsRef.current.lat - dLat) > 0.00001 ||
        Math.abs(lastCoordsRef.current.lng - dLng) > 0.00001
      ) {
        lastCoordsRef.current = { lat: dLat, lng: dLng };
        webViewRef.current?.injectJavaScript(`
          if (window.updateDriverPosition) {
            window.updateDriverPosition(${dLat}, ${dLng}, ${driverSpeed || 0});
          }
          true;
        `);
      }
    }
  }, [dLat, dLng, driverSpeed]);

  const openTurnByTurnGPS = () => {
    const label = encodeURIComponent(`OmniGo Customer - ${customerName}`);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${uLat},${uLng}`,
      android: `google.navigation:q=${uLat},${uLng}&mode=d`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${uLat},${uLng}&travelmode=driving`,
    });
    Linking.openURL(url!).catch(() => {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${uLat},${uLng}&travelmode=driving`);
    });
  };

  const htmlContent = useMemo(() => {
    const roadPoints =
      routeData?.coordinates && routeData.coordinates.length > 0
        ? routeData.coordinates.map((c) => [c.latitude, c.longitude])
        : [
            [dLat, dLng],
            [uLat, uLng],
          ];

    const roadPointsJson = JSON.stringify(roadPoints);

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
      background: #050810;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .leaflet-tile-pane {
      filter: invert(100%) hue-rotate(180deg) brightness(88%) contrast(105%);
    }
    .custom-div-icon {
      background: transparent;
      border: none;
    }
    .driver-pin {
      width: 48px;
      height: 48px;
      border-radius: 24px;
      background: linear-gradient(135deg, #00CFFF, #0077FF);
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 20px rgba(0, 207, 255, 0.9), 0 4px 10px rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 22px;
      position: relative;
    }
    .pulse-ring-driver {
      position: absolute;
      width: 72px;
      height: 72px;
      border-radius: 36px;
      border: 2px solid #00CFFF;
      top: -15px;
      left: -15px;
      animation: pulsate 2s infinite ease-out;
      pointer-events: none;
    }
    .customer-pin {
      width: 44px;
      height: 44px;
      border-radius: 22px;
      background: linear-gradient(135deg, #00FF97, #00CC7A);
      border: 3px solid #000000;
      box-shadow: 0 0 20px rgba(0, 255, 151, 0.9), 0 4px 10px rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000000;
      font-size: 20px;
      position: relative;
    }
    .pulse-ring-customer {
      position: absolute;
      width: 66px;
      height: 66px;
      border-radius: 33px;
      border: 2px solid #00FF97;
      top: -14px;
      left: -14px;
      animation: pulsate 2.4s infinite ease-out;
      pointer-events: none;
    }
    @keyframes pulsate {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    .leaflet-popup-content-wrapper {
      background: #0A1222;
      color: #FFFFFF;
      border-radius: 12px;
      border: 1px solid rgba(0,255,151,0.4);
      box-shadow: 0 8px 24px rgba(0,0,0,0.8);
      font-size: 13px;
      padding: 6px;
    }
    .leaflet-popup-tip {
      background: #0A1222;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const dLat = ${dLat};
    const dLng = ${dLng};
    const uLat = ${uLat};
    const uLng = ${uLng};
    const roadCoords = ${roadPointsJson};

    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      tap: true
    });

    // High performance dark tiles (no watermark, zero API key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    // Driver Marker (Pulsing Tow Truck)
    const driverIcon = L.divIcon({
      className: 'custom-div-icon',
      html: '<div class="driver-pin"><div class="pulse-ring-driver"></div>🛻</div>',
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });
    const driverMarker = L.marker([dLat, dLng], { icon: driverIcon }).addTo(map)
      .bindPopup('<b>Your Tow Truck (Live GPS)</b><br/><span style="color:#00CFFF">En Route to Customer</span>');

    // Customer Pickup Marker
    const customerIcon = L.divIcon({
      className: 'custom-div-icon',
      html: '<div class="customer-pin"><div class="pulse-ring-customer"></div>📍</div>',
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });
    const customerMarker = L.marker([uLat, uLng], { icon: customerIcon }).addTo(map)
      .bindPopup('<b>${customerName.replace(/'/g, "\\'")}</b><br/>${customerVehicle.replace(/'/g, "\\'")}<br/><span style="color:#00FF97">${pickupAddress.replace(/'/g, "\\'")}</span>');

    // Real road route polyline
    window.routePolyline = L.polyline(roadCoords, { color: '#00FF97', weight: 5, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }).addTo(map);
    L.polyline(roadCoords, { color: '#0077FF', weight: 9, opacity: 0.40, lineCap: 'round', lineJoin: 'round' }).addTo(map);

    window.updateRoutePolyline = function(newPoints) {
      if (window.routePolyline && newPoints && newPoints.length > 0) {
        window.routePolyline.setLatLngs(newPoints);
        const newBounds = L.latLngBounds(newPoints);
        map.fitBounds(newBounds, { padding: [120, 50] });
      }
    };

    // Fit route bounds with padding for HUD cards
    const bounds = L.latLngBounds(roadCoords);
    map.fitBounds(bounds, { padding: [120, 50] });

    window.updateDriverPosition = function(newLat, newLng, speed) {
      if (driverMarker) {
        driverMarker.setLatLng([newLat, newLng]);
      }
    };

    window.recenterDriver = function() {
      map.setView(driverMarker.getLatLng(), 16);
      driverMarker.openPopup();
    };

    window.fitRoute = function() {
      map.fitBounds(bounds, { padding: [120, 50] });
    };
  </script>
</body>
</html>
    `;
  }, [uLat, uLng, customerName, customerVehicle, pickupAddress]);

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Real Map View */}
      {Platform.OS === 'web' ? (
        React.createElement('iframe', {
          srcDoc: htmlContent,
          style: { width: '100%', height: '100%', border: 'none' },
        })
      ) : (
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={StyleSheet.absoluteFill}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      )}

      {/* Floating HUD Controls */}
      <View style={styles.floatingControls}>
        <TouchableOpacity
          style={styles.actionPill}
          onPress={openTurnByTurnGPS}
          activeOpacity={0.85}
        >
          <Ionicons name="navigate" size={16} color="#000" style={{ marginRight: 6 }} />
          <Text style={styles.actionPillText}>Turn-by-Turn GPS</Text>
        </TouchableOpacity>

        {onToggleSimulate && (
          <TouchableOpacity
            style={[styles.actionPill, { backgroundColor: isSimulating ? '#FF9500' : 'rgba(0, 207, 255, 0.95)' }]}
            onPress={onToggleSimulate}
            activeOpacity={0.85}
          >
            <Ionicons name={isSimulating ? "pause" : "play"} size={14} color="#000" style={{ marginRight: 6 }} />
            <Text style={styles.actionPillText}>{isSimulating ? "Pause Sim" : "Simulate Drive"}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.iconCircle}
          onPress={() => {
            webViewRef.current?.injectJavaScript('if (window.recenterDriver) window.recenterDriver(); true;');
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={20} color="#00FF97" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconCircle}
          onPress={() => {
            webViewRef.current?.injectJavaScript('if (window.fitRoute) window.fitRoute(); true;');
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="expand" size={18} color="#00CFFF" />
        </TouchableOpacity>
      </View>

      {/* ETA HUD Pill on Top Left */}
      <View style={styles.etaPill}>
        <View style={styles.liveDot} />
        {loadingRoute ? (
          <ActivityIndicator size="small" color="#00FF97" style={{ marginRight: 6 }} />
        ) : (
          <Ionicons name="speedometer-outline" size={14} color="#00FF97" style={{ marginRight: 6 }} />
        )}
        <Text style={styles.etaText}>
          {routeData
            ? `${routeData.durationMinutes} mins · ${routeData.distanceKm} km to Customer`
            : `Live Route to Customer`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingControls: {
    position: 'absolute',
    right: 16,
    top: 140,
    zIndex: 30,
    alignItems: 'flex-end',
    gap: 10,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00FF97',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 4,
  },
  actionPillText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: '#000000',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(10, 18, 34, 0.92)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  etaPill: {
    position: 'absolute',
    top: 140,
    left: 16,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 18, 34, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 255, 151, 0.35)',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF97',
    marginRight: 8,
  },
  etaText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
});
