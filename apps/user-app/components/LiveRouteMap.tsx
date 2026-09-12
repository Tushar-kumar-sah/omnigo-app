import React, { useMemo } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

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
  driverName = 'Rajesh Kumar',
  driverVehicle = 'Tata 407 Flatbed',
  driverPlate = 'WB-02-AK-9821',
  pickupAddress = 'Breakdown Location',
  dropoffAddress = 'Authorized Workshop',
  speed = 42,
  height = 320,
  interactive = true,
}: LiveRouteMapProps) {
  const dLat = driverCoords.latitude || 22.5726;
  const dLng = driverCoords.longitude || 88.3639;
  const pLat = pickupCoords.latitude || 22.5515;
  const pLng = pickupCoords.longitude || 88.3524;
  const dropLat = dropoffCoords.latitude || 22.5735;
  const dropLng = dropoffCoords.longitude || 88.4331;

  const htmlContent = useMemo(() => {
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
    .leaflet-tile {
      filter: brightness(0.85) contrast(1.15) saturate(1.1);
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
      box-shadow: 0 0 16px rgba(0,207,255,0.8), 0 4px 8px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 20px;
      position: relative;
    }
    .pulse-ring {
      position: absolute;
      width: 60px;
      height: 60px;
      border-radius: 30px;
      border: 2px solid #00CFFF;
      top: -11px;
      left: -11px;
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
      box-shadow: 0 0 14px rgba(0,255,151,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000000;
      font-weight: 900;
      font-size: 14px;
    }
    .dropoff-pin {
      width: 36px;
      height: 36px;
      border-radius: 18px;
      background: #FF3B30;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 14px rgba(255,59,48,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-weight: 900;
      font-size: 14px;
    }
    .leaflet-popup-content-wrapper {
      background: #0D1420;
      color: #FFFFFF;
      border-radius: 12px;
      border: 1px solid rgba(0,207,255,0.3);
      box-shadow: 0 8px 24px rgba(0,0,0,0.6);
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

    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      tap: true
    });

    // High-reliability OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    // Driver Marker
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
      .bindPopup('<b>PICKUP LOCATION (A)</b><br/>${pickupAddress.replace(/'/g, "\\'")}');

    // Drop-off Marker (B)
    const dropoffIcon = L.divIcon({
      className: 'custom-div-icon',
      html: '<div class="dropoff-pin">B</div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    const dropoffMarker = L.marker([dropLat, dropLng], { icon: dropoffIcon }).addTo(map)
      .bindPopup('<b>DROP-OFF DESTINATION (B)</b><br/>${dropoffAddress.replace(/'/g, "\\'")}');

    // Route Polyline connecting Driver -> Pickup -> Dropoff
    const routeCoords = [
      [dLat, dLng],
      [pLat, pLng],
      [dropLat, dropLng]
    ];

    // Neon Route Outline & Main Line
    L.polyline(routeCoords, { color: '#0077FF', weight: 8, opacity: 0.4, lineCap: 'round' }).addTo(map);
    L.polyline(routeCoords, { color: '#00CFFF', weight: 4, opacity: 0.9, dashArray: '8, 8', lineCap: 'round' }).addTo(map);

    // Fit map bounds to show all markers with comfortable padding
    const bounds = L.latLngBounds([
      [dLat, dLng],
      [pLat, pLng],
      [dropLat, dropLng]
    ]);
    map.fitBounds(bounds, { padding: [40, 40] });

    window.recenterDriver = function() {
      map.setView([dLat, dLng], 15);
      driverMarker.openPopup();
    };

    window.fitRoute = function() {
      map.fitBounds(bounds, { padding: [40, 40] });
    };

    window.zoomIn = function() {
      map.zoomIn();
    };

    window.zoomOut = function() {
      map.zoomOut();
    };
  </script>
</body>
</html>
    `;
  }, [dLat, dLng, pLat, pLng, dropLat, dropLng, driverName, driverVehicle, driverPlate, pickupAddress, dropoffAddress, speed]);

  return (
    <View style={[styles.container, { height }]}>
      {Platform.OS === 'web' ? (
        React.createElement('iframe', {
          srcDoc: htmlContent,
          style: { width: '100%', height: '100%', border: 'none', borderRadius: 16 },
        })
      ) : (
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={styles.webview}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      )}

      {/* Floating Map Controls HUD */}
      {interactive && (
        <View style={styles.hudOverlay}>
          <View style={styles.telemetryTag}>
            <Ionicons name="radio" size={13} color="#00FF97" />
            <Text style={styles.telemetryTagText}>LIVE GPS · {speed} km/h</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#070C18',
    borderWidth: 1,
    borderColor: 'rgba(0,207,255,0.3)',
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#070C18',
  },
  hudOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  telemetryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7,12,24,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,151,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  telemetryTagText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#00FF97',
    letterSpacing: 0.5,
  },
});
