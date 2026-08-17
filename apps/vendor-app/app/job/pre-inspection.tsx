import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { THEME } from '../../constants/theme';
import { INSPECTION_STEPS } from '../../constants/app-config';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function PreInspectionScreen() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [captures, setCaptures] = useState<Record<number, any>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const flashAnim = useRef(new Animated.Value(0)).current;

  const step = INSPECTION_STEPS[currentStepIndex];
  const isCaptured = !!captures[step.id];

  const params = useLocalSearchParams();
  const jobId = params.id as string || '';

  const now = new Date();
  const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  const watermarkText = `GPS: ... | ${timestamp} | Driver | ${jobId}`;

  // Recording timer effect
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordTimer(t => {
          if (t >= 20) {
            handleStopRecording();
            return 20;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const triggerFlash = (callback?: () => void) => {
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  const handleCapture = () => {
    const updated = {
      ...captures,
      [step.id]: { type: 'photo', uri: 'mock_photo_uri', time: timestamp }
    };
    setCaptures(updated);

    triggerFlash(() => {
      // Automatically advance to the next step
      setTimeout(() => {
        if (currentStepIndex < INSPECTION_STEPS.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          router.push({ pathname: '/job/condition-report', params: { id: jobId } });
        }
      }, 350);
    });
  };

  const handleStartRecording = () => {
    setRecordTimer(0);
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    const updated = {
      ...captures,
      [step.id]: { type: 'video', uri: 'mock_video_uri', duration: recordTimer, time: timestamp }
    };
    setCaptures(updated);

    triggerFlash(() => {
      setTimeout(() => {
        if (currentStepIndex < INSPECTION_STEPS.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          router.push({ pathname: '/job/condition-report', params: { id: jobId } });
        }
      }, 350);
    });
  };

  const handleMarkDamage = (zone: string) => {
    const existing = captures[step.id]?.zones || [];
    const newZones = existing.includes(zone) 
      ? existing.filter((z: string) => z !== zone)
      : [...existing, zone];
    
    setCaptures(prev => ({
      ...prev,
      [step.id]: { type: 'damage', zones: newZones }
    }));
  };

  const handleRetake = () => {
    const newCaptures = { ...captures };
    delete newCaptures[step.id];
    setCaptures(newCaptures);
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
      router.back();
    }
  };

  const handleNext = () => {
    if (currentStepIndex < INSPECTION_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      router.push({ pathname: '/job/condition-report', params: { id: jobId } });
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const canProceed = isCaptured || (!step.required);

  return (
    <View style={styles.container}>
      {/* Header with Back navigation */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Pre-Tow Inspection</Text>
          <Text style={styles.headerSub}>Step {currentStepIndex + 1} of {INSPECTION_STEPS.length}: {step.label}</Text>
        </View>
        <TouchableOpacity 
          style={styles.stepIndicatorBtn} 
          onPress={() => currentStepIndex < INSPECTION_STEPS.length - 1 && handleNext()}
        >
          <Text style={styles.stepIndicatorText}>{currentStepIndex + 1}/{INSPECTION_STEPS.length}</Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {INSPECTION_STEPS.map((s, idx) => {
            const isDone = !!captures[s.id];
            const isCur = idx === currentStepIndex;
            return (
              <TouchableOpacity 
                key={s.id} 
                style={[
                  styles.progressSegment,
                  isDone && { backgroundColor: THEME.colors.success },
                  isCur && { backgroundColor: THEME.colors.primary, transform: [{ scaleY: 1.3 }] },
                ]} 
                onPress={() => setCurrentStepIndex(idx)}
                activeOpacity={0.7}
              />
            );
          })}
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepDescription}>{step.description}</Text>

        {step.type === 'photo' || step.type === 'video' ? (
          <View style={styles.captureArea}>
            {/* White Flash overlay on capture */}
            <Animated.View style={[styles.flashOverlay, { opacity: flashAnim }]} pointerEvents="none" />

            {isCaptured ? (
              <View style={styles.capturedView}>
                <View style={styles.capturedBadge}>
                  <Ionicons name="checkmark-circle" size={48} color={THEME.colors.success} />
                  <Text style={styles.capturedText}>{step.label} Photo Captured ✓</Text>
                  <Text style={styles.capturedSub}>{captures[step.id]?.time || timestamp}</Text>
                </View>

                {/* Auto-advance hint */}
                <Text style={styles.autoAdvanceHint}>Photo recorded with secure timestamp & GPS watermark.</Text>

                <TouchableOpacity style={styles.retakeInlineBtn} onPress={handleRetake} activeOpacity={0.8}>
                  <Ionicons name="camera-reverse" size={18} color={THEME.colors.primary} />
                  <Text style={styles.retakeInlineText}>RETAKE PHOTO</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Viewfinder Grid Overlay */}
                <View style={styles.viewfinderGrid} pointerEvents="none">
                  <View style={styles.gridLineH} />
                  <View style={styles.gridLineV} />
                  <View style={[styles.targetCorner, styles.cornerTL]} />
                  <View style={[styles.targetCorner, styles.cornerTR]} />
                  <View style={[styles.targetCorner, styles.cornerBL]} />
                  <View style={[styles.targetCorner, styles.cornerBR]} />
                </View>

                <View style={styles.frameGuideContainer}>
                  <Ionicons name={step.type === 'video' ? 'videocam' : 'camera'} size={20} color={THEME.colors.primary} style={{ marginBottom: 4 }} />
                  <Text style={styles.frameGuideText}>{step.frameGuide}</Text>
                </View>
                
                <View style={styles.watermarkContainer}>
                  <Text style={styles.watermarkText}>{watermarkText}</Text>
                </View>
              </>
            )}
          </View>
        ) : (
          <View style={styles.damageArea}>
            <Text style={styles.damageInstruction}>Tap damaged areas on the vehicle to record prior dents / scratches</Text>
            <View style={styles.carOutlineContainer}>
              <View style={styles.carOutline}>
                {['Front', 'Left', 'Roof', 'Right', 'Rear'].map((zone) => {
                  const isSelected = captures[step.id]?.zones?.includes(zone);
                  return (
                    <TouchableOpacity 
                      key={zone}
                      style={[styles.carZone, styles[`zone${zone}` as keyof typeof styles], isSelected && styles.zoneSelected]}
                      onPress={() => handleMarkDamage(zone)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.zoneText, isSelected && styles.zoneTextSelected]}>{zone}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.damageSummaryBox}>
              <Text style={styles.damageSummaryTitle}>
                Marked Zones: {captures[step.id]?.zones?.length ? captures[step.id].zones.join(', ') : 'No damage marked (Clean)'}
              </Text>
            </View>
          </View>
        )}

        {/* Shutter / Capture Controls Area */}
        <View style={styles.controlsArea}>
          {step.type === 'photo' && !isCaptured && (
            <View style={styles.shutterContainer}>
              <TouchableOpacity style={styles.captureBtn} onPress={handleCapture} activeOpacity={0.6}>
                <View style={styles.captureBtnInner} />
              </TouchableOpacity>
              <Text style={styles.shutterHint}>Tap to snap & auto-advance</Text>
            </View>
          )}

          {step.type === 'video' && !isCaptured && (
            <View style={styles.shutterContainer}>
              <TouchableOpacity 
                style={[styles.captureBtn, isRecording && styles.recordingBtn]} 
                onPress={isRecording ? handleStopRecording : handleStartRecording}
                activeOpacity={0.7}
              >
                <View style={[styles.captureBtnInner, isRecording && styles.recordingBtnInner]} />
              </TouchableOpacity>
              <Text style={styles.shutterHint}>
                {isRecording ? 'Tap to finish recording' : 'Tap to start 360° walkaround'}
              </Text>
            </View>
          )}

          {isRecording && (
            <Text style={styles.recordingTimer}>Recording: 00:{recordTimer < 10 ? `0${recordTimer}` : recordTimer} / 00:20</Text>
          )}
        </View>

        {/* Footer Navigation Actions */}
        <View style={styles.footerActions}>
          <TouchableOpacity style={styles.prevBtn} onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={18} color={THEME.colors.text} />
            <Text style={styles.prevBtnText}>BACK</Text>
          </TouchableOpacity>

          {!step.required && !isCaptured && (
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
              <Text style={styles.skipBtnText}>SKIP</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]} 
            onPress={handleNext}
            disabled={!canProceed}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={canProceed ? [THEME.colors.primary, THEME.colors.secondary] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Text style={[styles.nextBtnText, !canProceed && styles.nextBtnTextDisabled]}>
                {currentStepIndex === INSPECTION_STEPS.length - 1 ? 'FINISH' : 'NEXT'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={canProceed ? "#000" : THEME.colors.textSecondary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: THEME.colors.glassBg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.glassBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  headerTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.text,
  },
  headerSub: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  stepIndicatorBtn: {
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.3)',
  },
  stepIndicatorText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 12,
    color: THEME.colors.primary,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  progressBar: {
    flexDirection: 'row',
    height: 8,
    alignItems: 'center',
  },
  progressSegment: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 2,
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  contentScroll: {
    padding: 16,
    paddingBottom: 30,
    alignItems: 'center',
  },
  stepDescription: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 20,
    color: THEME.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  captureArea: {
    width: '100%',
    aspectRatio: 3/4,
    backgroundColor: '#0A0E17',
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    zIndex: 20,
  },
  viewfinderGrid: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLineH: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
  },
  gridLineV: {
    position: 'absolute',
    top: 20,
    bottom: 20,
    width: 1,
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
  },
  targetCorner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: THEME.colors.primary,
  },
  cornerTL: { top: 16, left: 16, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 16, right: 16, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 16, left: 16, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 16, right: 16, borderBottomWidth: 2, borderRightWidth: 2 },
  frameGuideContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  frameGuideText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  watermarkContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  watermarkText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  capturedView: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  capturedBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 151, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.3)',
    borderRadius: THEME.borderRadius.md,
    padding: 16,
    width: '100%',
  },
  capturedText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.success,
    marginTop: 8,
  },
  capturedSub: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  autoAdvanceHint: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 14,
    textAlign: 'center',
  },
  retakeInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    marginTop: 14,
    gap: 6,
  },
  retakeInlineText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 12,
    color: THEME.colors.primary,
  },
  damageArea: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  damageInstruction: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  carOutlineContainer: {
    width: 220,
    height: 420,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
    marginBottom: 16,
  },
  carOutline: {
    flex: 1,
    position: 'relative',
  },
  carZone: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneSelected: {
    backgroundColor: 'rgba(255, 51, 102, 0.3)',
    borderColor: THEME.colors.danger,
  },
  zoneText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  zoneTextSelected: {
    color: THEME.colors.danger,
    fontFamily: THEME.fonts.inter.bold,
  },
  zoneFront: { top: 10, left: 35, right: 35, height: 70, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  zoneRear: { bottom: 10, left: 35, right: 35, height: 70, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  zoneRoof: { top: 90, bottom: 90, left: 55, right: 55, borderRadius: 10 },
  zoneLeft: { top: 90, bottom: 90, left: 10, width: 36, borderRadius: 10 },
  zoneRight: { top: 90, bottom: 90, right: 10, width: 36, borderRadius: 10 },
  damageSummaryBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: THEME.borderRadius.sm,
    padding: 12,
    width: '100%',
  },
  damageSummaryTitle: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  controlsArea: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  shutterContainer: {
    alignItems: 'center',
  },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
  },
  recordingBtn: {
    backgroundColor: 'rgba(255, 51, 102, 0.3)',
  },
  recordingBtnInner: {
    backgroundColor: THEME.colors.danger,
    borderRadius: 8,
    width: 28,
    height: 28,
  },
  shutterHint: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 8,
  },
  recordingTimer: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 14,
    color: THEME.colors.danger,
    marginTop: 8,
  },
  footerActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    paddingHorizontal: 16,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 4,
  },
  prevBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 14,
    color: THEME.colors.text,
    letterSpacing: 0.5,
  },
  skipBtn: {
    height: 52,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  skipBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    letterSpacing: 0.5,
  },
  nextBtn: {
    flex: 1,
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  btnGradient: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  nextBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: '#000',
    letterSpacing: 0.5,
  },
  nextBtnTextDisabled: {
    color: THEME.colors.textSecondary,
  },
});
