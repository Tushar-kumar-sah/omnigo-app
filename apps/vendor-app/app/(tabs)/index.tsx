import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { mockIncomingJob } from '../../constants/mock-data';

export default function HomeScreen() {
  const [isOnline, setIsOnline] = useState(false);
  const router = useRouter();

  // Simulate an incoming job after 3 seconds of going online
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOnline) {
      timeout = setTimeout(() => {
        router.push('/job/incoming');
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [isOnline, router]);

  return (
    <View style={styles.container}>
      {/* Fake Map Background */}
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.mapBg}>
          {[
            { top: '15%', left: '20%' }, { top: '25%', left: '60%' }, { top: '35%', left: '40%' },
            { top: '45%', left: '75%' }, { top: '55%', left: '30%' }, { top: '65%', left: '55%' },
            { top: '75%', left: '15%' }, { top: '80%', left: '70%' }, { top: '40%', left: '10%' },
            { top: '60%', left: '85%' }, { top: '20%', left: '45%' }, { top: '70%', left: '50%' },
          ].map((pos, i) => (
            <View key={i} style={[styles.mapDot, { top: pos.top as any, left: pos.left as any }]} />
          ))}
        </View>
      </View>

      <View style={styles.topContainer}>
        <BlurView intensity={30} tint="dark" style={styles.statusCard}>
          <View style={styles.statusInfo}>
            <View style={[styles.statusIndicator, { backgroundColor: isOnline ? THEME.colors.success : THEME.colors.danger }]} />
            <Text style={styles.statusText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: '#333', true: 'rgba(0,255,151,0.3)' }}
            thumbColor={isOnline ? THEME.colors.success : '#f4f3f4'}
          />
        </BlurView>
        
        {isOnline && (
          <BlurView intensity={30} tint="dark" style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>$142.50</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.8 ★</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </BlurView>
        )}
      </View>

      {!isOnline && (
        <View style={styles.offlineOverlay}>
          <Ionicons name="power" size={64} color="rgba(255,255,255,0.2)" />
          <Text style={styles.offlineText}>Go online to start receiving jobs</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070A',
  },
  mapBg: {
    flex: 1,
  },
  mapDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
  },
  topContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    marginBottom: 16,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    shadowColor: THEME.colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  statusText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.text,
    letterSpacing: 1,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 20,
    color: THEME.colors.text,
  },
  statLabel: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  offlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 1,
  },
  offlineText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 16,
    color: THEME.colors.textSecondary,
    marginTop: 16,
  }
});
