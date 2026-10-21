/**
 * OmniGo Driver App — Google Maps & Routing Utility
 */

const GOOGLE_MAPS_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.GOOGLE_MAPS_API_KEY ||
  'AIzaSyCmqFiReImo33lXPqskdY3_zg3SopOvbnA';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RouteResult {
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationMinutes: number;
  encodedPolyline: string;
  coordinates: Coordinates[];
}

export async function fetchDrivingRoute(
  origin: Coordinates,
  destination: Coordinates
): Promise<RouteResult | null> {
  try {
    const response = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_KEY,
          'X-Goog-FieldMask':
            'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: origin.latitude,
                longitude: origin.longitude,
              },
            },
          },
          destination: {
            location: {
              latLng: {
                latitude: destination.latitude,
                longitude: destination.longitude,
              },
            },
          },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
        }),
      }
    );

    const data = await response.json();
    if (!data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    const distanceMeters = route.distanceMeters || 0;
    const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
    const durationSeconds = parseInt(route.duration?.replace('s', '') || '0', 10);
    const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));
    const encodedPolyline = route.polyline?.encodedPolyline || '';
    const coordinates = decodePolyline(encodedPolyline);

    return {
      distanceMeters,
      distanceKm,
      durationSeconds,
      durationMinutes,
      encodedPolyline,
      coordinates,
    };
  } catch (error) {
    console.warn('[GoogleMaps] Route compute error:', error);
    return null;
  }
}

export function decodePolyline(encoded: string): Coordinates[] {
  if (!encoded) return [];

  const points: Coordinates[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
}
