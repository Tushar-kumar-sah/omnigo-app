import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { mockIncomingJob } from '../../constants/mock-data';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

type JobState = 'LOADING' | 'IN_TRANSIT' | 'ARRIVED';

export default function TowingScreen() {
  const router = useRouter();
  const [jobState, setJobState] = useState<JobState>('LOADING');
  
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedDotStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
      opacity: 1.5 - pulse.value
    };
  });

  const handleNextState = () => {
    if (jobState === 'LOADING') setJobState('IN_TRANSIT');
    else if (jobState === 'IN_TRANSIT') setJobState('ARRIVED');
    else if (jobState === 'ARRIVED') router.push('/job/post-inspection');
  };

  const getStateConfig = () => {
    switch (jobState) {
      case 'LOADING':
        return {
          bannerMsg: 'Loading Vehicle onto Tow Truck',
          bannerColors: [THEME.colors.warning, '#FF8C00'] as const,
          btnMsg: 'VEHICLE LOADED',
          btnColors: [THEME.colors.warning, '#FF8C00'] as const,
          icon: 'car-sport',
        };
      case 'IN_TRANSIT':
        return {
          bannerMsg: 'En Route to Destination',
          bannerColors: [THEME.colors.primary, THEME.colors.secondary] as const,
          btnMsg: 'ARRIVED AT DESTINATION',
          btnColors: [THEME.colors.primary, THEME.colors.secondary] as const,
          icon: 'navigate',
        };
      case 'ARRIVED':
        return {
          bannerMsg: 'Arrived at Destination',
          bannerColors: [THEME.colors.success, '#00CC7A'] as const,
          btnMsg: 'PROCEED TO UNLOADING',
          btnColors: [THEME.colors.success, '#00CC7A'] as const,
          icon: 'checkmark-circle',
        };
    }
  };

  const config = getStateConfig();

  return (
    <View style={styles.container}>
      {/* Fake Map Background */}
      <View style={styles.mapBackground}>
        {Array.from({ length: 150 }).map((_, i) => (
          <View key={i} style={styles.gridDot} />
        ))}
        {/* Pulsing Dot */}
        {jobState === 'IN_TRANSIT' && (
          <View style={styles.trackerContainer}>
            <Animated.View style={[styles.pulseRing, animatedDotStyle]} />
            <View style={styles.trackerDot} />
          </View>
        )}
      </View>

      {/* Top Banner */}
      <LinearGradient colors={config.bannerColors} style={styles.topBanner}>
        <Ionicons name={config.icon as any} size={24} color="#000" />
        <Text style={styles.bannerText}>{config.bannerMsg}</Text>
      </LinearGradient>

      {/* Bottom Card */}
      <View style={styles.bottomSection}>
        <BlurView intensity={30} tint="dark" style={styles.bottomCard}>
          <Text style={styles.cardTitle}>Destination</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color={THEME.colors.danger} />
            <Text style={styles.locationText}>{mockIncomingJob.drop}</Text>
          </View>

          {jobState === 'IN_TRANSIT' && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>ETA</Text>
                <Text style={styles.statValue}>14 mins</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Distance</Text>
                <Text style={styles.statValue}>{mockIncomingJob.distance} km</Text>
              </View>
            </View>
          )}

          <View style={styles.progressRow}>
            <View style={[styles.progressDot, jobState === 'LOADING' && styles.progressDotActive]} />
            <View style={[styles.progressLine, (jobState === 'IN_TRANSIT' || jobState === 'ARRIVED') && styles.progressLineActive]} />
            <View style={[styles.progressDot, jobState === 'IN_TRANSIT' && styles.progressDotActive]} />
            <View style={[styles.progressLine, jobState === 'ARRIVED' && styles.progressLineActive]} />
            <View style={[styles.progressDot, jobState === 'ARRIVED' && styles.progressDotActive]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Loading</Text>
            <Text style={styles.progressLabel}>Transit</Text>
            <Text style={styles.progressLabel}>Arrived</Text>
          </View>

          <TouchableOpacity onPress={handleNextState} style={styles.btnWrapper}>
            <LinearGradient
              colors={config.btnColors}
              style={styles.btn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.btnText}>{config.btnMsg}</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    gap: 20,
    backgroundColor: THEME.colors.background,
  },
  gridDot: {
    width: 3,
    height: 3,
    backgroundColor: THEME.colors.glassBorder,
    borderRadius: 1.5,
  },
  trackerContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackerDot: {
    width: 16,
    height: 16,
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
    position: 'absolute',
  },
  pulseRing: {
    width: 48,
    height: 48,
    backgroundColor: THEME.colors.primary,
    borderRadius: 24,
    position: 'absolute',
  },
  topBanner: {
    position: 'absolute',
    top: 60,
    left: THEME.spacing.md,
    right: THEME.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    gap: THEME.spacing.sm,
    zIndex: 10,
  },
  bannerText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: '#000',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: THEME.spacing.md,
    paddingBottom: THEME.spacing.xl,
  },
  bottomCard: {
    backgroundColor: THEME.colors.glassBg,
    borderColor: THEME.colors.glassBorder,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    overflow: 'hidden',
  },
  cardTitle: {
    fontFamily: THEME.fonts.inter.regular,
    color: THEME.colors.textSecondary,
    fontSize: 14,
    marginBottom: THEME.spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.lg,
  },
  locationText: {
    fontFamily: THEME.fonts.outfit.medium,
    color: THEME.colors.text,
    fontSize: 18,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: THEME.fonts.inter.regular,
    color: THEME.colors.textSecondary,
    fontSize: 12,
  },
  statValue: {
    fontFamily: THEME.fonts.outfit.bold,
    color: THEME.colors.primary,
    fontSize: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.sm,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  progressDotActive: {
    backgroundColor: THEME.colors.primary,
    shadowColor: THEME.colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: THEME.colors.primary,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.lg,
  },
  progressLabel: {
    fontFamily: THEME.fonts.inter.regular,
    color: THEME.colors.textSecondary,
    fontSize: 12,
    width: 50,
    textAlign: 'center',
  },
  btnWrapper: {
    marginTop: THEME.spacing.sm,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    gap: THEME.spacing.sm,
  },
  btnText: {
    color: '#000',
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
  }
});
