import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
const WebViewComponent = WebView as any;
import { fetchDrivingRoute, RouteResult } from '@/lib/googleMaps';

export interface LiveRouteMapProps {
  driverCoords: { latitude: number; longitude: number };
  pickupCoords: { latitude: number; longitude: number };
  dropoffCoords: { latitude: number; longitude: number };
  driverName?: string;
  driverVehicle?: string;
  driverPlate?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  speed?: number;
  height?: number;
  interactive?: boolean;
}

export default function LiveRouteMap({
  driverCoords,
  pickupCoords,
  dropoffCoords,
  driverName = 'Assigned Partner',
  driverVehicle = 'Tow Truck',
  driverPlate = '—',
  pickupAddress = 'Pickup Location (GPS)',
  dropoffAddress = 'Destination',
  speed = 42,
  height = 340,
  interactive = false,
}: LiveRouteMapProps) {
  const [isInteractive, setIsInteractive] = useState(Boolean(interactive));

  useEffect(() => {
    if (interactive !== undefined) {
      setIsInteractive(interactive);
    }
  }, [interactive]);
  const pLat = pickupCoords?.latitude || 22.5726;
  const pLng = pickupCoords?.longitude || 88.3639;
  const dLat = driverCoords?.latitude || (pLat + 0.015);
  const dLng = driverCoords?.longitude || (pLng + 0.015);
  const dropLat = dropoffCoords?.latitude || (pLat + 0.035);
  const dropLng = dropoffCoords?.longitude || (pLng + 0.035);

  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const lastDCoordsRef = useRef({ lat: dLat, lng: dLng });

  useEffect(() => {
    if (dLat && dLng) {
      if (
        Math.abs(lastDCoordsRef.current.lat - dLat) > 0.00001 ||
        Math.abs(lastDCoordsRef.current.lng - dLng) > 0.00001
      ) {
        lastDCoordsRef.current = { lat: dLat, lng: dLng };
        webViewRef.current?.injectJavaScript(`
          if (window.updateDriverPosition) {
            window.updateDriverPosition(${dLat}, ${dLng}, ${speed});
          }
          true;
        `);
      }
    }
  }, [dLat, dLng, speed]);

  // Fetch real Google Routes road navigation polyline
  useEffect(() => {
    let isMounted = true;
    async function loadRoute() {
      setLoadingRoute(true);
      try {
        const route = await fetchDrivingRoute(
          { latitude: dLat, longitude: dLng },
          { latitude: pLat, longitude: pLng }
        );
        if (isMounted && route) {
          setRouteData(route);
        }
      } catch (e) {
        console.warn('[LiveRouteMap] Error fetching route:', e);
      } finally {
        if (isMounted) setLoadingRoute(false);
      }
    }
    loadRoute();
    return () => {
      isMounted = false;
    };
  }, [dLat, dLng, pLat, pLng]);

  // Dynamically update route line without reloading HTML
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

  const htmlContent = useMemo(() => {
    // Road coordinates array
    const roadPoints = routeData?.coordinates && routeData.coordinates.length > 0
      ? routeData.coordinates.map((c) => [c.latitude, c.longitude])
      : [
          [dLat, dLng],
          [pLat, pLng],
          [dropLat, dropLng],
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
      background: #070c18;
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
      width: 44px;
      height: 44px;
      border-radius: 22px;
      background: linear-gradient(135deg, #00CFFF, #0077FF);
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 18px rgba(0,207,255,0.9), 0 4px 8px rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 20px;
      position: relative;
    }
    .pulse-ring {
      position: absolute;
      width: 62px;
      height: 62px;
      border-radius: 31px;
      border: 2.5px solid #00CFFF;
      top: -12px;
      left: -12px;
      animation: pulsate 2s infinite ease-out;
      pointer-events: none;
    }
    @keyframes pulsate {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    .pickup-pin {
      width: 36px;
      height: 36px;
      border-radius: 18px;
      background: #00FF97;
      border: 3px solid #000000;
      box-shadow: 0 0 16px rgba(0,255,151,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000000;
      font-weight: 900;
      font-size: 15px;
    }
    .dropoff-pin {
      width: 36px;
      height: 36px;
      border-radius: 18px;
      background: #FF3B30;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 16px rgba(255,59,48,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-weight: 900;
      font-size: 15px;
    }
    .leaflet-popup-content-wrapper {
      background: #0D1420;
      color: #FFFFFF;
      border-radius: 12px;
      border: 1px solid rgba(0,207,255,0.4);
      box-shadow: 0 8px 24px rgba(0,0,0,0.7);
      font-size: 12px;
      padding: 4px;
    }
    .leaflet-popup-tip {
      background: #0D1420;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const dLat = ${dLat};
    const dLng = ${dLng};
    const pLat = ${pLat};
    const pLng = ${pLng};
    const dropLat = ${dropLat};
    const dropLng = ${dropLng};
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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    // Driver Marker (Uber-style pulsing truck)
    const driverIcon = L.divIcon({
      className: 'custom-div-icon',
      html: '<div class="driver-pin"><div class="pulse-ring"></div>🚚</div>',
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });
    const driverMarker = L.marker([dLat, dLng], { icon: driverIcon }).addTo(map)
      .bindPopup('<b>${driverName}</b><br/>${driverVehicle} · ${driverPlate}<br/><span style="color:#00FF97">${speed} km/h En Route</span>');

    // Pickup Marker (A)
    const pickupIcon = L.divIcon({
      className: 'custom-div-icon',
      html: '<div class="pickup-pin">A</div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    const pickupMarker = L.marker([pLat, pLng], { icon: pickupIcon }).addTo(map)
      .bindPopup('<b>PICKUP (A)</b><br/>${pickupAddress.replace(/'/g, "\\'")}');

    // Drop-off Marker (B)
    const dropoffIcon = L.divIcon({
      className: 'custom-div-icon',
      html: '<div class="dropoff-pin">B</div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    const dropoffMarker = L.marker([dropLat, dropLng], { icon: dropoffIcon }).addTo(map)
      .bindPopup('<b>DROP-OFF (B)</b><br/>${dropoffAddress.replace(/'/g, "\\'")}');

    // Real Google Routes Road Path Polyline
    window.routePolyline = L.polyline(roadCoords, { color: '#00CFFF', weight: 5, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }).addTo(map);
    L.polyline(roadCoords, { color: '#0077FF', weight: 8, opacity: 0.40, lineCap: 'round', lineJoin: 'round' }).addTo(map);

    window.updateRoutePolyline = function(newPoints) {
      if (window.routePolyline && newPoints && newPoints.length > 0) {
        window.routePolyline.setLatLngs(newPoints);
        const newBounds = L.latLngBounds(newPoints);
        map.fitBounds(newBounds, { padding: [45, 45] });
      }
    };

    // Fit map bounds
    const bounds = L.latLngBounds(roadCoords);
    map.fitBounds(bounds, { padding: [45, 45] });

    window.recenterDriver = function() {
      map.setView([dLat, dLng], 16);
      driverMarker.openPopup();
    };

    window.fitRoute = function() {
      map.fitBounds(bounds, { padding: [45, 45] });
    };

    window.updateDriverPosition = function(newLat, newLng, newSpeed) {
      if (driverMarker) {
        driverMarker.setLatLng([newLat, newLng]);
        if (map && pLat && pLng) {
          const currentBounds = L.latLngBounds([[newLat, newLng], [pLat, pLng]]);
          map.fitBounds(currentBounds, { padding: [45, 45], maxZoom: 17 });
        }
      }
    };

    window.zoomIn = function() { map.zoomIn(); };
    window.zoomOut = function() { map.zoomOut(); };
  </script>
</body>
</html>
    `;
  }, [dLat, dLng, pLat, pLng, dropLat, dropLng, driverName, driverVehicle, driverPlate, pickupAddress, dropoffAddress]);

  return (
    <View style={[styles.container, { height }]}>
      {/* Top Floating ETA Pill (Uber/Rapido style) */}
      <View style={styles.topEtaPill}>
        <View style={styles.etaDot} />
        {loadingRoute ? (
          <ActivityIndicator size="small" color="#00CFFF" style={{ marginRight: 6 }} />
        ) : (
          <Ionicons name="navigate" size={14} color="#00CFFF" style={{ marginRight: 6 }} />
        )}
        <Text style={styles.etaPillText} numberOfLines={1}>
          {routeData
            ? `${routeData.durationMinutes} mins away · ${routeData.distanceKm} km`
            : `Driver En Route · ${speed} km/h`}
        </Text>
      </View>

      {/* Map Canvas */}
      <View style={styles.webviewContainer} pointerEvents={isInteractive ? 'auto' : 'none'}>
      {Platform.OS === 'web' ? (
        React.createElement('iframe', {
          srcDoc: htmlContent,
          style: { width: '100%', height: '100%', border: 'none', borderRadius: 20 },
        })
      ) : (
        <WebViewComponent
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={styles.webview}
          scrollEnabled={isInteractive}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      )}
      </View>

      {/* Floating Map Interaction Indicator when unlocked */}
      {isInteractive && (
        <TouchableOpacity
          style={styles.interactiveIndicator}
          onPress={() => setIsInteractive(false)}
          activeOpacity={0.8}
        >
          <Ionicons name="lock-open" size={12} color="#00FF97" />
          <Text style={styles.interactiveIndicatorText}>Map Pan Active · Tap to Lock</Text>
        </TouchableOpacity>
      )}

      {/* Floating Map Controls */}
      <View style={styles.mapControls} pointerEvents="box-none">
        <TouchableOpacity
          style={[styles.controlBtn, isInteractive && styles.controlBtnActive]}
          activeOpacity={0.8}
          onPress={() => setIsInteractive(!isInteractive)}
        >
          <Ionicons
            name={isInteractive ? 'lock-open' : 'hand-left-outline'}
            size={18}
            color={isInteractive ? '#00FF97' : '#38BDF8'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlBtn}
          activeOpacity={0.8}
          onPress={() => {
            if (webViewRef.current) {
              webViewRef.current.injectJavaScript('if (window.recenterDriver) window.recenterDriver(); true;');
            }
          }}
        >
          <Ionicons name="locate" size={18} color="#00FF97" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlBtn}
          activeOpacity={0.8}
          onPress={() => {
            if (webViewRef.current) {
              webViewRef.current.injectJavaScript('if (window.fitRoute) window.fitRoute(); true;');
            }
          }}
        >
          <Ionicons name="expand" size={18} color="#00CFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#070c18',
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.25)',
    position: 'relative',
  },
  webviewContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webview: {
    flex: 1,
    backgroundColor: '#070c18',
  },
  controlBtnActive: {
    backgroundColor: 'rgba(0, 255, 151, 0.22)',
    borderColor: '#00FF97',
  },
  interactiveIndicator: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    zIndex: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(7, 12, 24, 0.94)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 255, 151, 0.5)',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  interactiveIndicatorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00FF97',
  },
  topEtaPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    maxWidth: '82%',
    zIndex: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 12, 24, 0.92)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.4)',
    elevation: 6,
  },
  etaDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#00FF97',
    marginRight: 6,
  },
  etaPillText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
    flexShrink: 1,
  },
  mapControls: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    zIndex: 15,
    gap: 8,
  },
  controlBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(13, 20, 32, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});
