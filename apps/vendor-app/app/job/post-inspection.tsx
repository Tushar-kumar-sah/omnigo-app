import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { INSPECTION_STEPS } from '../../constants/app-config';

const { width } = Dimensions.get('window');

export default function PostInspectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.id as string;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [showComparison, setShowComparison] = useState(false);

  const currentStep = INSPECTION_STEPS[currentStepIndex];
  const progress = (Object.keys(completedSteps).length / INSPECTION_STEPS.length) * 100;
  const isFinished = Object.keys(completedSteps).length === INSPECTION_STEPS.length;

  const handleCapture = () => {
    const newCompleted = { ...completedSteps, [currentStep.id]: true };
    setCompletedSteps(newCompleted);

    if (Object.keys(newCompleted).length === INSPECTION_STEPS.length) {
      setShowComparison(true);
    } else if (currentStepIndex < INSPECTION_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  if (showComparison) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.comparisonScroll}>
          <Text style={styles.title}>Post-Tow Inspection</Text>
          
          <BlurView intensity={25} tint="dark" style={styles.statusBadge}>
            <View style={styles.statusIconCircle}>
              <Ionicons name="shield-checkmark" size={24} color={THEME.colors.success} />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>No New Damage Detected</Text>
              <Text style={styles.statusSubtitle}>Pre-tow vs post-tow comparison verified. 0 new scratches or dents detected.</Text>
            </View>
          </BlurView>

          <Text style={styles.comparisonTitle}>Before vs After Comparison</Text>
          
          <View style={styles.comparisonContainer}>
            <View style={[styles.comparisonCol, { borderColor: 'rgba(0, 207, 255, 0.3)' }]}>
              <Text style={[styles.colHeader, { color: THEME.colors.primary }]}>PRE-TOW</Text>
              {INSPECTION_STEPS.map(step => (
                <View key={`pre-${step.id}`} style={styles.thumbBox}>
                  <Text style={styles.thumbText} numberOfLines={1}>{step.label}</Text>
                </View>
              ))}
            </View>
            
            <View style={[styles.comparisonCol, { borderColor: 'rgba(0, 255, 151, 0.3)' }]}>
              <Text style={[styles.colHeader, { color: THEME.colors.success }]}>POST-TOW</Text>
              {INSPECTION_STEPS.map(step => (
                <View key={`post-${step.id}`} style={styles.thumbBox}>
                  <Text style={styles.thumbText} numberOfLines={1}>{step.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.push({ pathname: '/job/dropoff', params: { id: jobId } })}>
            <LinearGradient
              colors={[THEME.colors.success, '#00CC7A']}
              style={styles.btn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.btnText}>PROCEED TO DROP-OFF</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Post-Tow Inspection</Text>
        <Text style={styles.subtitle}>Step {currentStepIndex + 1} of {INSPECTION_STEPS.length}</Text>
        
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.cameraContainer}>
        {/* Fake Camera Viewport */}
        <View style={styles.cameraViewport}>
          <View style={styles.guideFrame}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
          
          <View style={styles.watermark}>
            <Text style={styles.watermarkText}>{currentStep.label}</Text>
          </View>
        </View>
      </View>

      <BlurView intensity={30} tint="dark" style={styles.bottomControls}>
        <Text style={styles.instructionTitle}>{currentStep.label}</Text>
        <Text style={styles.instructionDesc}>{currentStep.description}</Text>
        
        <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
          <View style={styles.captureInner} />
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    paddingTop: 64,
    paddingHorizontal: THEME.spacing.md,
    paddingBottom: THEME.spacing.md,
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 28,
    color: THEME.colors.text,
  },
  subtitle: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.primary,
    fontSize: 16,
    marginTop: THEME.spacing.xs,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: THEME.colors.glassBorder,
    borderRadius: 2,
    marginTop: THEME.spacing.md,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: THEME.colors.primary,
    borderRadius: 2,
  },
  cameraContainer: {
    flex: 1,
    padding: THEME.spacing.md,
    justifyContent: 'center',
  },
  cameraViewport: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: '80%',
    height: '60%',
    position: 'absolute',
  },
  cornerTopLeft: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderColor: THEME.colors.primary, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTopRight: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderColor: THEME.colors.primary, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBottomLeft: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderColor: THEME.colors.primary, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBottomRight: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderColor: THEME.colors.primary, borderBottomWidth: 3, borderRightWidth: 3 },
  watermark: {
    position: 'absolute',
    bottom: THEME.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.sm,
  },
  watermarkText: {
    color: '#fff',
    fontFamily: THEME.fonts.inter.medium,
  },
  bottomControls: {
    padding: THEME.spacing.xl,
    paddingBottom: 40,
    borderTopLeftRadius: THEME.borderRadius.xl,
    borderTopRightRadius: THEME.borderRadius.xl,
    alignItems: 'center',
  },
  instructionTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 20,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
  },
  instructionDesc: {
    fontFamily: THEME.fonts.inter.regular,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 207, 255, 0.2)',
    borderWidth: 4,
    borderColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.primary,
  },
  comparisonScroll: {
    paddingTop: 64,
    paddingHorizontal: THEME.spacing.md,
    paddingBottom: 120,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 151, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 255, 151, 0.3)',
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    marginVertical: THEME.spacing.md,
    overflow: 'hidden',
  },
  statusIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 255, 151, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.3)',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    color: THEME.colors.success,
    fontSize: 16,
    marginBottom: 2,
  },
  statusSubtitle: {
    fontFamily: THEME.fonts.inter.regular,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    lineHeight: 16,
  },
  comparisonTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.text,
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  comparisonContainer: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  comparisonCol: {
    flex: 1,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.sm,
    backgroundColor: THEME.colors.glassBg,
    overflow: 'hidden',
  },
  colHeader: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
    letterSpacing: 0.5,
  },
  thumbBox: {
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: THEME.borderRadius.sm,
    marginBottom: THEME.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  thumbText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: THEME.spacing.md,
    backgroundColor: THEME.colors.background,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.glassBorder,
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
