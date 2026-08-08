import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

export default function TrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.container}>
      {/* Simulated Map Area */}
      <View style={styles.mapArea}>
        <LinearGradient colors={['#050810', '#101c36', '#050810']} style={StyleSheet.absoluteFillObject} />
        
        {/* Grid pattern overlay (simulated) */}
        <View style={styles.gridOverlay}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLineHorizontal, { top: `${i * 10}%` }]} />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={`v-${i}`} style={[styles.gridLineVertical, { left: `${i * 10}%` }]} />
          ))}
        </View>

        {/* Route Line & Dots */}
        <View style={styles.routeLayer}>
          <View style={styles.pickupMarker}>
            <View style={styles.pickupDot} />
            <View style={styles.pickupPulse} />
          </View>
          
          <View style={styles.routePathContainer}>
            <View style={styles.routePath} />
          </View>
          
          <View style={styles.dropoffMarker}>
            <View style={styles.dropoffDot} />
          </View>
        </View>
      </View>

      {/* Top Header / Stepper Overlay */}
      <View style={[styles.topOverlay, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerBar}>
          <Text style={styles.trackingTitle}>Live Tracking</Text>
          <TouchableOpacity 
            style={styles.closeBtn}
            onPress={() => router.push('/(tabs)')}
          >
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.stepperContainer}>
          <View style={styles.stepBox}>
            <View style={[styles.stepDot, styles.stepCompleted]} />
            <Text style={styles.stepTextCompleted}>Assigned</Text>
          </View>
          <View style={[styles.stepLine, styles.lineCompleted]} />
          
          <View style={styles.stepBox}>
            <View style={[styles.stepDot, styles.stepActive]}>
              <View style={styles.stepDotInner} />
            </View>
            <Text style={styles.stepTextActive}>En Route</Text>
          </View>
          <View style={[styles.stepLine, styles.linePending]} />
          
          <View style={styles.stepBox}>
            <View style={[styles.stepDot, styles.stepPending]} />
            <Text style={styles.stepTextPending}>Arrived</Text>
          </View>
          <View style={[styles.stepLine, styles.linePending]} />
          
          <View style={styles.stepBox}>
            <View style={[styles.stepDot, styles.stepPending]} />
            <Text style={styles.stepTextPending}>Towing</Text>
          </View>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.sheetHandle} />
        
        <View style={styles.driverInfoCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>R</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>4.8 ★</Text>
            </View>
          </View>

          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>Rajesh Kumar</Text>
            <Text style={styles.driverVehicle}>MH02 AB 1234 • Bolero</Text>
          </View>

          <View style={styles.etaContainer}>
            <Text style={styles.etaLabel}>ETA</Text>
            <Text style={styles.etaValue}>3 min</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="call" size={24} color="#00CFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="chatbubble" size={24} color="#00CFFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Cancel Booking</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
  },
  mapArea: {
    flex: 1,
    position: 'relative',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#00CFFF',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#00CFFF',
  },
  routeLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupMarker: {
    position: 'absolute',
    top: '40%',
    left: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00FF97',
    borderWidth: 3,
    borderColor: '#FFF',
    zIndex: 2,
  },
  pickupPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 151, 0.3)',
    zIndex: 1,
  },
  dropoffMarker: {
    position: 'absolute',
    top: '60%',
    left: '70%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropoffDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  routePathContainer: {
    position: 'absolute',
    top: '42%',
    left: '32%',
    width: '40%',
    height: '18%',
  },
  routePath: {
    width: '100%',
    height: '100%',
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#00CFFF',
    borderStyle: 'dashed',
    borderBottomRightRadius: 20,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  trackingTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: '#FFF',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(13, 20, 32, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(13, 20, 32, 0.85)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepBox: {
    alignItems: 'center',
    width: 60,
  },
  stepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCompleted: {
    backgroundColor: '#00FF97',
  },
  stepActive: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#00CFFF',
  },
  stepDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00CFFF',
  },
  stepPending: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepTextCompleted: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#00FF97',
    textAlign: 'center',
  },
  stepTextActive: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#00CFFF',
    textAlign: 'center',
  },
  stepTextPending: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginTop: 7,
  },
  lineCompleted: {
    backgroundColor: '#00FF97',
  },
  linePending: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(13, 20, 32, 0.95)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomWidth: 0,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  driverInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginRight: 16,
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2A3650',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: '#FFF',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -5,
    alignSelf: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#050810',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 18,
    color: '#FFF',
    marginBottom: 4,
  },
  driverVehicle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  etaContainer: {
    alignItems: 'flex-end',
  },
  etaLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  etaValue: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: '#00CFFF',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 207, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FF3B30',
  },
});
