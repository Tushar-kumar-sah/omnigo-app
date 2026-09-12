'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { subscribeToAllDrivers } from '@omnigo/api';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCNEIOTc6guKsRAOFKIvtYzWbIVptKbbGE';

// Dark Mode Map Styles for OmniGo Operations Command Center
const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0d1322' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#080c14' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#131d31' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2563eb' }, { lightness: -40 }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1d4ed8' }, { lightness: -60 }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#18233c' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#060a12' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }, { lightness: -20 }],
  },
];

interface LiveDriverPin {
  id: string;
  name: string;
  status: 'available' | 'en_route' | 'arrived' | 'towing' | 'sos' | 'offline' | string;
  vehicleType: string;
  vehiclePlate: string;
  speed: string;
  heading?: number;
  lat: number;
  lng: number;
}

interface LiveFleetMapProps {
  drivers: any[];
  selectedDriver: any | null;
  onSelectDriver: (driver: any) => void;
}

export default function LiveFleetMap({ drivers, selectedDriver, onSelectDriver }: LiveFleetMapProps) {
  const [liveDrivers, setLiveDrivers] = useState<LiveDriverPin[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 22.5726, lng: 88.3639 }); // Default Kolkata

  // Auto-detect browser geolocation
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapCenter({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Map drivers to map pins
  useEffect(() => {
    if (drivers && drivers.length > 0) {
      const mapped = drivers.map((d: any, idx: number) => {
        let lat = d.location?.lat || d.location?.latitude || d.latitude;
        let lng = d.location?.lng || d.location?.longitude || d.longitude;

        if (!lat || !lng) {
          const offsets = [
            { dLat: 0.015, dLng: -0.012 },
            { dLat: -0.018, dLng: 0.022 },
            { dLat: 0.025, dLng: 0.018 },
            { dLat: -0.022, dLng: -0.019 },
          ];
          const offset = offsets[idx % offsets.length];
          lat = 22.5726 + offset.dLat;
          lng = 88.3639 + offset.dLng;
        }

        return {
          id: d.id,
          name: d.name,
          status: d.status,
          vehicleType: d.vehicleType || 'Flatbed Tow',
          vehiclePlate: d.vehiclePlate || d.vehicleNumber || 'WB-01-TOW',
          speed: d.speed || '0 km/h',
          heading: d.heading || 0,
          lat: Number(lat),
          lng: Number(lng),
        };
      });
      setLiveDrivers(mapped);

      // If drivers exist and have valid coords, center to the first driver
      if (mapped.length > 0 && mapped[0].lat && mapped[0].lng) {
        setMapCenter({ lat: mapped[0].lat, lng: mapped[0].lng });
      }
    }
  }, [drivers]);

  // Subscribe to real-time live GPS broadcast from Supabase
  useEffect(() => {
    const sub = subscribeToAllDrivers((payload) => {
      if (payload.new && payload.new.id) {
        const updated = payload.new;
        let lat = updated.latitude;
        let lng = updated.longitude;

        if (updated.location && typeof updated.location === 'object' && Array.isArray(updated.location.coordinates)) {
          lng = updated.location.coordinates[0];
          lat = updated.location.coordinates[1];
        } else if (typeof updated.location === 'string') {
          const match = updated.location.match(/POINT\(([^ ]+)\s+([^)]+)\)/i);
          if (match) {
            lng = parseFloat(match[1]);
            lat = parseFloat(match[2]);
          }
        }

        if (lat && lng) {
          setLiveDrivers((prev) =>
            prev.map((d) =>
              d.id === updated.id
                ? {
                    ...d,
                    lat: Number(lat),
                    lng: Number(lng),
                    speed: typeof updated.speed === 'number' ? `${Math.round(updated.speed)} km/h` : (updated.speed || d.speed),
                    heading: updated.heading ?? d.heading,
                    status: updated.is_online ? 'available' : 'offline',
                  }
                : d
            )
          );
        }
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  const activeCenter = useMemo(() => {
    if (selectedDriver && (selectedDriver.location?.lat || selectedDriver.latitude)) {
      return {
        lat: Number(selectedDriver.location?.lat || selectedDriver.latitude),
        lng: Number(selectedDriver.location?.lng || selectedDriver.longitude),
      };
    }
    return mapCenter;
  }, [selectedDriver, mapCenter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'en_route': return '#38BDF8';
      case 'arrived': return '#F59E0B';
      case 'towing': return '#A855F7';
      case 'sos': return '#F43F5E';
      case 'offline': return '#64748B';
      default: return '#38BDF8';
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '480px', position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          center={activeCenter}
          defaultCenter={activeCenter}
          defaultZoom={12}
          mapId="DEMO_MAP_ID"
          styles={DARK_MAP_STYLE}
          style={{ width: '100%', height: '100%' }}
          internalUsageAttributionIds={['gmp_git_agentskills_v1']}
          disableDefaultUI={false}
          zoomControl={true}
          fullscreenControl={true}
        >
          {liveDrivers.map((driver) => {
            const isSelected = selectedDriver?.id === driver.id;
            const color = getStatusColor(driver.status);

            return (
              <AdvancedMarker
                key={driver.id}
                position={{ lat: driver.lat, lng: driver.lng }}
                onClick={() => onSelectDriver(driver)}
                title={`${driver.name} - ${driver.status} (${driver.speed})`}
              >
                <div
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Glowing Radar Pulse Pin */}
                  <div
                    style={{
                      width: isSelected ? '38px' : '30px',
                      height: isSelected ? '38px' : '30px',
                      borderRadius: '50%',
                      background: '#0D1322',
                      border: `2px solid ${color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 0 16px ${color}99`,
                      position: 'relative',
                    }}
                  >
                    <span style={{ fontSize: isSelected ? '16px' : '13px' }}>🚛</span>
                    {driver.status === 'sos' && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: '#F43F5E',
                          boxShadow: '0 0 8px #F43F5E',
                        }}
                      />
                    )}
                  </div>

                  {/* Vehicle Plate & Speed Pill */}
                  <div
                    style={{
                      marginTop: '4px',
                      padding: '2px 6px',
                      background: 'rgba(8, 12, 20, 0.92)',
                      border: `1px solid ${isSelected ? color : 'rgba(255,255,255,0.15)'}`,
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#F8FAFC',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    }}
                  >
                    <span style={{ width: '5px', height: '5px', borderRadius: '3px', background: color }} />
                    <span>{driver.name.split(' ')[0]}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>{driver.speed}</span>
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}
        </Map>
      </APIProvider>
    </div>
  );
}
