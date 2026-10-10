/**
 * OmniGo Google Maps Platform Integration
 * Powers Uber/Rapido-grade Location Autocomplete, Reverse Geocoding, and Turn-by-Turn Driving Routes
 */

const GOOGLE_MAPS_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.GOOGLE_MAPS_API_KEY ||
  'AIzaSyCmqFiReImo33lXPqskdY3_zg3SopOvbnA';

export interface PlacePrediction {
  placeId: string;
  primaryText: string;
  secondaryText: string;
  fullText: string;
}

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

/**
 * Live Places Autocomplete (New Google Places API)
 * Instant search suggestions as the user types
 */
export async function fetchPlacePredictions(
  input: string,
  locationBias?: Coordinates
): Promise<PlacePrediction[]> {
  if (!input || input.trim().length < 2) return [];

  try {
    const payload: any = {
      input: input.trim(),
      includedRegionCodes: ['IN'],
    };

    if (locationBias) {
      payload.locationBias = {
        circle: {
          center: {
            latitude: locationBias.latitude,
            longitude: locationBias.longitude,
          },
          radius: 50000.0, // 50km bias
        },
      };
    }

    const response = await fetch(
      'https://places.googleapis.com/v1/places:autocomplete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_KEY,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    if (!data.suggestions || !Array.isArray(data.suggestions)) return [];

    return data.suggestions
      .filter((s: any) => s.placePrediction)
      .map((s: any) => {
        const p = s.placePrediction;
        return {
          placeId: p.placeId,
          primaryText: p.structuredFormat?.mainText?.text || p.text?.text?.split(',')[0] || p.text?.text,
          secondaryText: p.structuredFormat?.secondaryText?.text || p.text?.text?.split(',').slice(1).join(',').trim() || '',
          fullText: p.text?.text || '',
        };
      });
  } catch (error) {
    console.warn('[GoogleMaps] Autocomplete error:', error);
    return [];
  }
}

/**
 * Fetch Place Details (New Google Places API)
 * Resolves a Place ID to exact latitude and longitude
 */
export async function fetchPlaceDetails(
  placeId: string
): Promise<{ address: string; coordinates: Coordinates } | null> {
  if (!placeId) return null;

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_KEY,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location',
        },
      }
    );

    const data = await response.json();
    if (!data.location) return null;

    return {
      address: data.formattedAddress || data.displayName?.text || '',
      coordinates: {
        latitude: data.location.latitude,
        longitude: data.location.longitude,
      },
    };
  } catch (error) {
    console.warn('[GoogleMaps] Place details error:', error);
    return null;
  }
}

/**
 * Reverse Geocoding (Google Geocoding API)
 * Converts GPS coordinates under the pin into a human-readable street address & landmark
 */
export async function reverseGeocodeGoogle(
  latitude: number,
  longitude: number
): Promise<{ address: string; landmark: string }> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_KEY}`
    );

    const data = await response.json();
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const topResult = data.results[0];
      const address = topResult.formatted_address;

      // Extract landmark / locality
      let landmark = '';
      for (const comp of topResult.address_components || []) {
        if (
          comp.types.includes('point_of_interest') ||
          comp.types.includes('establishment') ||
          comp.types.includes('sublocality_level_1') ||
          comp.types.includes('sublocality')
        ) {
          landmark = comp.long_name;
          break;
        }
      }

      return {
        address,
        landmark: landmark || address.split(',')[0],
      };
    }

    return {
      address: `GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      landmark: 'Current Location',
    };
  } catch (error) {
    console.warn('[GoogleMaps] Reverse geocode error:', error);
    return {
      address: `GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      landmark: 'Current Location',
    };
  }
}

/**
 * Driving Route & Turn-by-Turn Path (Google Routes API)
 * Real-time road navigation route connecting Pickup and Dropoff
 */
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

/**
 * Decodes Google Encoded Polyline into LatLng points
 */
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
