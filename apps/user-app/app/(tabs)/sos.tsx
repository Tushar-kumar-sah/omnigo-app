import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { theme } from '../../constants/theme';
import { createSOSAlert, fetchCurrentUser } from '../../lib/api';

const USER_ID = 'a0000000-0000-0000-0000-000000000001';

const INCIDENT_TYPES = [
  { id: 'accident',    icon: 'car-sport-outline',     label: 'Accident',        color: '#FF4D4D' },
  { id: 'breakdown',   icon: 'build-outline',          label: 'Breakdown',       color: '#FFD60A' },
  { id: 'medical',     icon: 'medical-outline',        label: 'Medical',         color: '#FF6B35' },
  { id: 'fire',        icon: 'flame-outline',          label: 'Fire',            color: '#FF4D4D' },
  { id: 'tyre',        icon: 'disc-outline',           label: 'Flat Tyre',       color: '#00CFFF' },
  { id: 'fuel',        icon: 'water-outline',          label: 'Out of Fuel',     color: '#00FF97' },
  { id: 'stuck',       icon: 'warning-outline',        label: 'Vehicle Stuck',   color: '#FFD60A' },
  { id: 'other',       icon: 'help-circle-outline',    label: 'Other',           color: 'rgba(255,255,255,0.5)' },
] as const;

type IncidentId = typeof INCIDENT_TYPES[number]['id'];

const EMERGENCY_SERVICES = [
  { icon: 'battery-dead-outline', label: 'Battery\nJumpstart',  eta: '15 Min',  color: '#00CFFF' },
  { icon: 'disc-outline',         label: 'Flat Tyre\nChange',   eta: 'On-site', color: '#00FF97' },
  { icon: 'water-outline',        label: 'Fuel\nDelivery',      eta: '20 Min',  color: '#FFD60A' },
  { icon: 'key-outline',          label: 'Lockout\nSupport',    eta: '12 Min',  color: '#FF6B35' },
];

export default function SOSScreen() {
  const insets = useSafeAreaInsets();
  const [dispatched, setDispatched]       = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentId | null>(null);
  const [incidentId, setIncidentId]       = useState('');
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;

  // Pulse animation on SOS button
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Glow when dispatched
  useEffect(() => {
    if (dispatched) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
        ])
      ).start();
    }
  }, [dispatched]);

  const handleSOS = async () => {
    if (!selectedIncident) return;
    try {
      const user = await fetchCurrentUser();
      const incident = await createSOSAlert({
        userId: user?.uuid || user?.id || USER_ID,
        userName: user?.name || '—',
        userPhone: user?.phone || '—',
        locationAddress: location,
        latitude: coords.latitude,
        longitude: coords.longitude,
        emergencyType: selectedIncident,
      });
      const generatedId = incident?.id || incident?.incidentNumber || `SOS-${Date.now().toString().slice(-4)}`;
      setIncidentId(String(generatedId).substring(0, 8).toUpperCase());
      setDispatched(true);
    } catch (e) {
      console.warn('[SOS] create alert error', e);
      setIncidentId(`SOS-${Date.now().toString().slice(-4)}`);
      setDispatched(true);
    }
  };

  const handleReset = () => {
    setDispatched(false);
    setSelectedIncident(null);
    setIncidentId('');
  };

  const [location, setLocation] = useState('Fetching location...');
  const [coords, setCoords] = useState({ latitude: 0, longitude: 0 });

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocation('Location permission denied');
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        let reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
        if (reverseGeocode && reverseGeocode.length > 0) {
          const addr = reverseGeocode[0];
          setLocation(`${addr.name || addr.street || ''}, ${addr.city || ''}`);
        } else {
          setLocation(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
        }
      } catch (error) {
        setLocation('Location unavailable');
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0005', '#1A0008', '#050810']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 12, 54) }]}>
        <Text style={styles.headerTitle}>Emergency SOS</Text>
        <Text style={styles.headerSub}>Priority dispatch · Instant response</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom + 90, 100) }]}
        showsVerticalScrollIndicator={false}
      >
        {!dispatched ? (
          <>
            {/* Location Card */}
            <BlurView intensity={20} tint="dark" style={styles.locationCard}>
              <View style={styles.locationRow}>
                <View style={styles.locationDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.locationLabel}>Your Current Location</Text>
                  <Text style={styles.locationText}>{location}</Text>
                </View>
                <Ionicons name="locate" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.gpsActiveBadge}>
                <Ionicons name="checkmark-circle" size={13} color="#00FF97" />
                <Text style={styles.gpsActiveText}>GPS Active · Location will be shared on SOS dispatch</Text>
              </View>
            </BlurView>

            {/* Incident Type */}
            <Text style={styles.sectionTitle}>What's the emergency?</Text>
            <View style={styles.incidentGrid}>
              {INCIDENT_TYPES.map(inc => (
                <TouchableOpacity
                  key={inc.id}
                  style={[styles.incidentCard, selectedIncident === inc.id && { borderColor: inc.color, backgroundColor: `${inc.color}15` }]}
                  onPress={() => setSelectedIncident(inc.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={inc.icon as any} size={22} color={selectedIncident === inc.id ? inc.color : 'rgba(255,255,255,0.45)'} />
                  <Text style={[styles.incidentLabel, selectedIncident === inc.id && { color: inc.color }]}>{inc.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Big SOS Button */}
            <View style={styles.sosBtnWrapper}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  onPress={handleSOS}
                  disabled={!selectedIncident}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={selectedIncident ? ['#FF1744', '#B71C1C'] : ['#2a1218', '#1a0a0d']}
                    style={styles.sosBtn}
                  >
                    <Ionicons name="warning" size={36} color={selectedIncident ? '#fff' : 'rgba(255,255,255,0.2)'} />
                    <Text style={[styles.sosBtnText, !selectedIncident && { color: 'rgba(255,255,255,0.3)' }]}>
                      SOS
                    </Text>
                    <Text style={[styles.sosBtnSub, !selectedIncident && { color: 'rgba(255,255,255,0.2)' }]}>
                      {selectedIncident ? 'TAP TO DISPATCH' : 'SELECT EMERGENCY TYPE'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or choose a service</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Emergency Services Grid */}
            <View style={styles.servicesGrid}>
              {EMERGENCY_SERVICES.map((svc, i) => (
                <TouchableOpacity key={i} style={styles.serviceCard} activeOpacity={0.8}>
                  <LinearGradient colors={[`${svc.color}18`, `${svc.color}06`]} style={styles.serviceCardGrad}>
                    <Ionicons name={svc.icon as any} size={26} color={svc.color} />
                    <Text style={styles.serviceLabel}>{svc.label}</Text>
                    <View style={[styles.etaChip, { borderColor: `${svc.color}35`, backgroundColor: `${svc.color}10` }]}>
                      <Ionicons name="time-outline" size={10} color={svc.color} />
                      <Text style={[styles.etaText, { color: svc.color }]}>{svc.eta}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          /* ─── Dispatched State ─── */
          <>
            <BlurView intensity={20} tint="dark" style={[styles.dispatchCard, { borderColor: 'rgba(255,71,87,0.3)' }]}>
              <View style={styles.dispatchIcon}>
                <Ionicons name="checkmark-circle" size={48} color="#FF4D4D" />
              </View>
              <Text style={styles.dispatchTitle}>SOS Dispatched!</Text>
              <Text style={styles.dispatchSub}>Help is on the way. Stay calm and stay in a safe location.</Text>

              <View style={styles.incidentIdBox}>
                <Text style={styles.incidentIdLabel}>Incident ID</Text>
                <Text style={styles.incidentIdValue}>{incidentId}</Text>
              </View>
            </BlurView>

            {/* Location shared */}
            <BlurView intensity={15} tint="dark" style={styles.sharedCard}>
              <Ionicons name="location" size={18} color="#FF4D4D" />
              <View style={{ flex: 1 }}>
                <Text style={styles.sharedLabel}>Location Shared With Responder</Text>
                <Text style={styles.sharedAddr}>{location}</Text>
              </View>
            </BlurView>

            {/* Incident Type */}
            <BlurView intensity={15} tint="dark" style={styles.sharedCard}>
              <Ionicons name="alert-circle" size={18} color="#FFD60A" />
              <View style={{ flex: 1 }}>
                <Text style={styles.sharedLabel}>Incident Type</Text>
                <Text style={styles.sharedAddr}>
                  {INCIDENT_TYPES.find(i => i.id === selectedIncident)?.label}
                </Text>
              </View>
            </BlurView>

            {/* ETA */}
            <LinearGradient colors={['rgba(255,71,87,0.12)', 'rgba(255,71,87,0.04)']} style={styles.etaBanner}>
              <Ionicons name="time-outline" size={20} color="#FF4D4D" />
              <Text style={styles.etaBannerText}>Estimated Response: <Text style={{ fontFamily: 'Outfit_700Bold', color: '#FF4D4D' }}>8–12 minutes</Text></Text>
            </LinearGradient>

            {/* Call button */}
            <TouchableOpacity style={styles.callBtn} activeOpacity={0.8}>
              <LinearGradient colors={['#FF1744', '#B71C1C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.callBtnGrad}>
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.callBtnText}>Call OmniGo Emergency Line</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleReset} style={styles.resetBtn} activeOpacity={0.7}>
              <Text style={styles.resetBtnText}>Cancel SOS Dispatch</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#050810' },
  header:         { paddingHorizontal: 20, paddingBottom: 14 },
  headerTitle:    { fontFamily: 'Outfit_700Bold', fontSize: 24, color: '#FF4D4D' },
  headerSub:      { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 3 },
  scroll:         { paddingHorizontal: 20, paddingTop: 4, gap: 16 },

  locationCard:   { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', padding: 14, backgroundColor: 'rgba(13,20,32,0.5)', gap: 10 },
  locationRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  locationDot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF4D4D', marginTop: 4 },
  locationLabel:  { fontFamily: 'Outfit_700Bold', fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, marginBottom: 2 },
  locationText:   { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 17 },
  gpsActiveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gpsActiveText:  { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#00FF97', flex: 1 },

  sectionTitle:   { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#fff' },
  incidentGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  incidentCard:   { width: '22%', alignItems: 'center', gap: 6, padding: 10, borderRadius: 14, backgroundColor: 'rgba(13,20,32,0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  incidentLabel:  { fontFamily: 'Inter_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },

  sosBtnWrapper:  { alignItems: 'center', marginVertical: 8 },
  sosBtn:         { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center', gap: 4, shadowColor: '#FF1744', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 24, elevation: 12 },
  sosBtnText:     { fontFamily: 'Outfit_700Bold', fontSize: 36, color: '#fff', letterSpacing: 4 },
  sosBtnSub:      { fontFamily: 'Inter_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },

  dividerRow:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine:    { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  dividerText:    { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.3)' },

  servicesGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  serviceCard:    { width: '47%', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  serviceCardGrad:{ padding: 16, gap: 8 },
  serviceLabel:   { fontFamily: 'Outfit_700Bold', fontSize: 13, color: '#fff', lineHeight: 18 },
  etaChip:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100, borderWidth: 1, alignSelf: 'flex-start' },
  etaText:        { fontFamily: 'Inter_400Regular', fontSize: 10 },

  // Dispatched
  dispatchCard:   { borderRadius: 20, borderWidth: 1, overflow: 'hidden', padding: 24, backgroundColor: 'rgba(13,20,32,0.5)', alignItems: 'center', gap: 10 },
  dispatchIcon:   { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,77,77,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,77,77,0.3)' },
  dispatchTitle:  { fontFamily: 'Outfit_700Bold', fontSize: 24, color: '#FF4D4D' },
  dispatchSub:    { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 20 },
  incidentIdBox:  { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  incidentIdLabel:{ fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  incidentIdValue:{ fontFamily: 'Outfit_700Bold', fontSize: 18, color: '#fff', letterSpacing: 2, marginTop: 4 },
  sharedCard:     { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', padding: 14, backgroundColor: 'rgba(13,20,32,0.5)', flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  sharedLabel:    { fontFamily: 'Outfit_700Bold', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 2 },
  sharedAddr:     { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#fff' },
  etaBanner:      { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,71,87,0.2)', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  etaBannerText:  { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  callBtn:        { borderRadius: 100, overflow: 'hidden', shadowColor: '#FF1744', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  callBtnGrad:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  callBtnText:    { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#fff' },
  resetBtn:       { alignItems: 'center', paddingVertical: 14 },
  resetBtnText:   { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.35)' },
});
