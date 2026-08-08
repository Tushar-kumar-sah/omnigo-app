import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function SOSScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#1a080d', '#050810']} style={StyleSheet.absoluteFillObject} />

      <View style={[styles.headerArea, { paddingTop: Math.max(insets.top + 10, 44) }]}>
        <Text style={styles.headerTitle}>Emergency SOS Rescue</Text>
        <Text style={styles.headerSubtitle}>Priority dispatch & instant hotline</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Large Glowing Red SOS Button Container */}
        <TouchableOpacity
          style={styles.sosButtonTouch}
          onPress={() => router.push('/booking/select-vehicle')}
          activeOpacity={0.85}
        >
          <BlurView intensity={90} tint="dark" style={styles.sosCard}>
            <LinearGradient
              colors={['rgba(255, 59, 48, 0.35)', 'rgba(255, 149, 0, 0.1)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.sosCircleOuter}>
              <LinearGradient colors={['#FF3B30', '#FF2D55']} style={styles.sosCircleInner}>
                <Text style={styles.sosCircleText}>SOS</Text>
                <Text style={styles.sosSubText}>TAP TO DISPATCH</Text>
              </LinearGradient>
            </View>
          </BlurView>
        </TouchableOpacity>

        {/* Priority Emergency Services Cards */}
        <View style={styles.servicesGrid}>
          <TouchableOpacity style={styles.serviceCardTouch} activeOpacity={0.8}>
            <BlurView intensity={85} tint="dark" style={styles.serviceCard}>
              <Ionicons name="flash-outline" size={26} color="#00FF97" style={{ marginBottom: 8 }} />
              <Text style={styles.serviceTitle}>Battery Jumpstart</Text>
              <Text style={styles.serviceSub}>15 Min Arrival</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCardTouch} activeOpacity={0.8}>
            <BlurView intensity={85} tint="dark" style={styles.serviceCard}>
              <Ionicons name="construct-outline" size={26} color="#00CFFF" style={{ marginBottom: 8 }} />
              <Text style={styles.serviceTitle}>Flat Tire Change</Text>
              <Text style={styles.serviceSub}>On-site Repair</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCardTouch} activeOpacity={0.8}>
            <BlurView intensity={85} tint="dark" style={styles.serviceCard}>
              <Ionicons name="color-fill-outline" size={26} color="#FFB300" style={{ marginBottom: 8 }} />
              <Text style={styles.serviceTitle}>Fuel Delivery</Text>
              <Text style={styles.serviceSub}>5 Liters Petrol/Diesel</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCardTouch} activeOpacity={0.8}>
            <BlurView intensity={85} tint="dark" style={styles.serviceCard}>
              <Ionicons name="key-outline" size={26} color="#FF3B30" style={{ marginBottom: 8 }} />
              <Text style={styles.serviceTitle}>Lockout Support</Text>
              <Text style={styles.serviceSub}>Key Unlock Assistance</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050810' },
  headerArea: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 26, color: '#FF3B30' },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255, 255, 255, 0.65)', marginTop: 4 },
  content: { padding: 16, paddingBottom: 120, alignItems: 'center' },
  sosButtonTouch: { width: '100%', marginBottom: 24, borderRadius: 28, overflow: 'hidden' },
  sosCard: {
    padding: 32,
    borderRadius: 28,
    backgroundColor: 'rgba(42, 14, 24, 0.65)',
    borderWidth: 2,
    borderColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  sosCircleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 59, 48, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  sosCircleInner: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  sosCircleText: { fontFamily: 'Outfit_700Bold', fontSize: 32, color: '#FFFFFF', letterSpacing: 1 },
  sosSubText: { fontFamily: 'Outfit_700Bold', fontSize: 9, color: 'rgba(255, 255, 255, 0.9)', marginTop: 2, letterSpacing: 0.5 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', gap: 12 },
  serviceCardTouch: { width: '48%', borderRadius: 20, overflow: 'hidden' },
  serviceCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(14, 24, 48, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  serviceTitle: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#FFFFFF', textAlign: 'center' },
  serviceSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255, 255, 255, 0.55)', marginTop: 2, textAlign: 'center' },
});
