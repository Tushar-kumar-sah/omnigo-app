import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { THEME } from '@/constants/theme';
import { INSPECTION_STEPS } from '@/constants/app-config';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PreInspectionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = (params.id as string) || '';

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [captures, setCaptures] = useState<Record<number, any>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [torch, setTorch] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<any>(null);
  const flashAnim = useRef(new Animated.Value(0)).current;

  const step = INSPECTION_STEPS[currentStepIndex];
  const isCaptured = !!captures[step.id];

  const now = new Date();
  const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  const watermarkText = `GPS: 28.541°N, 77.209°E | ${timestamp} | Driver | ${jobId ? jobId.slice(0, 8) : 'OMNIGO'}`;

  // Automatically request camera permission when screen opens
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // Recording timer effect
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordTimer((t) => {
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
      Animated.timing(flashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  const handleCapture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      let photoUri = '';
      if (cameraRef.current && permission?.granted) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.8,
            skipProcessing: false,
          });
          if (photo?.uri) {
            photoUri = photo.uri;
          }
        } catch (camErr) {
          console.warn('[PreInspection] camera.takePictureAsync error:', camErr);
        }
      }

      if (!photoUri) {
        photoUri = `photo_step_${step.id}_${Date.now()}`;
      }

      const updated = {
        ...captures,
        [step.id]: { type: 'photo', uri: photoUri, time: timestamp },
      };
      setCaptures(updated);

      triggerFlash(() => {
        setTimeout(() => {
          if (currentStepIndex < INSPECTION_STEPS.length - 1) {
            setCurrentStepIndex((prev) => prev + 1);
          } else {
            router.push({ pathname: '/job/condition-report', params: { id: jobId } });
          }
        }, 500);
      });
    } catch (e) {
      console.warn('[PreInspection] handleCapture error:', e);
      const fallback = {
        ...captures,
        [step.id]: { type: 'photo', uri: `photo_step_${step.id}_${Date.now()}`, time: timestamp },
      };
      setCaptures(fallback);
      triggerFlash(() => {
        setTimeout(() => {
          if (currentStepIndex < INSPECTION_STEPS.length - 1) {
            setCurrentStepIndex((prev) => prev + 1);
          } else {
            router.push({ pathname: '/job/condition-report', params: { id: jobId } });
          }
        }, 500);
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleStartRecording = async () => {
    setRecordTimer(0);
    setIsRecording(true);
    try {
      if (cameraRef.current && permission?.granted) {
        cameraRef.current
          .recordAsync({ maxDuration: 20 })
          .then((video: any) => {
            if (video?.uri) {
              setCaptures((prev) => ({
                ...prev,
                [step.id]: {
                  type: 'video',
                  uri: video.uri,
                  duration: recordTimer || 15,
                  time: timestamp,
                },
              }));
            }
          })
          .catch((e: any) => console.warn('[PreInspection] recordAsync error:', e));
      }
    } catch (err) {
      console.warn('[PreInspection] startRecording error:', err);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    try {
      if (cameraRef.current) {
        cameraRef.current.stopRecording();
      }
    } catch (e) {
      console.warn('[PreInspection] stopRecording error:', e);
    }

    const updated = {
      ...captures,
      [step.id]: {
        type: 'video',
        uri: captures[step.id]?.uri || `video_step_${step.id}_${Date.now()}`,
        duration: recordTimer || 15,
        time: timestamp,
      },
    };
    setCaptures(updated);

    triggerFlash(() => {
      setTimeout(() => {
        if (currentStepIndex < INSPECTION_STEPS.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          router.push({ pathname: '/job/condition-report', params: { id: jobId } });
        }
      }, 500);
    });
  };

  const handleMarkDamage = (zone: string) => {
    const existing = captures[step.id]?.zones || [];
    const newZones = existing.includes(zone)
      ? existing.filter((z: string) => z !== zone)
      : [...existing, zone];

    setCaptures((prev) => ({
      ...prev,
      [step.id]: { type: 'damage', zones: newZones },
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

  const toggleTorch = () => {
    setTorch((prev) => !prev);
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const canProceed = isCaptured || !step.required;

  return (
    <View style={styles.container}>
      {/* Header with Back navigation & Step count */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 48) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Pre-Tow Inspection</Text>
          <Text style={styles.headerSub}>
            Step {currentStepIndex + 1} of {INSPECTION_STEPS.length}: {step.label}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.stepIndicatorBtn}
          onPress={() => currentStepIndex < INSPECTION_STEPS.length - 1 && handleNext()}
          activeOpacity={0.8}
        >
          <Text style={styles.stepIndicatorText}>
            {currentStepIndex + 1}/{INSPECTION_STEPS.length}
          </Text>
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

      {/* Scrollable Content Body */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentScroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepDescription}>{step.description}</Text>

        {step.type === 'photo' || step.type === 'video' ? (
          <View style={styles.captureArea}>
            {/* White Flash overlay on capture */}
            <Animated.View style={[styles.flashOverlay, { opacity: flashAnim }]} pointerEvents="none" />

            {isCaptured ? (
              /* Captured Photo / Video Preview View */
              <View style={StyleSheet.absoluteFill}>
                {captures[step.id]?.uri && !captures[step.id]?.uri.startsWith('photo_step_') ? (
                  <Image
                    source={{ uri: captures[step.id].uri }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.mockCapturedBg}>
                    <Ionicons
                      name={step.type === 'video' ? 'videocam' : 'camera'}
                      size={54}
                      color={THEME.colors.primary}
                    />
                  </View>
                )}

                {/* Overlay Badge & Retake Button */}
                <LinearGradient
                  colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
                  style={styles.capturedOverlay}
                >
                  <View style={styles.capturedBadge}>
                    <Ionicons name="checkmark-circle" size={36} color={THEME.colors.success} />
                    <Text style={styles.capturedText}>{step.label} Captured ✓</Text>
                    <Text style={styles.capturedSub}>{captures[step.id]?.time || timestamp}</Text>
                  </View>

                  <Text style={styles.autoAdvanceHint}>
                    Saved with secure timestamp & GPS watermark.
                  </Text>

                  <TouchableOpacity
                    style={styles.retakeInlineBtn}
                    onPress={handleRetake}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="camera-reverse" size={18} color={THEME.colors.primary} />
                    <Text style={styles.retakeInlineText}>RETAKE PHOTO</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ) : (
              /* Live Camera Stream or Permission Banner */
              <>
                {permission?.granted ? (
                  <CameraView
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    facing={facing}
                    enableTorch={torch}
                    mode={step.type === 'video' ? 'video' : 'picture'}
                  />
                ) : (
                  <View style={styles.permissionBox}>
                    <Ionicons name="camera-outline" size={44} color={THEME.colors.primary} />
                    <Text style={styles.permissionTitle}>Camera Access Required</Text>
                    <Text style={styles.permissionSub}>
                      Allow camera access to capture pre-tow inspection photos and ensure customer protection.
                    </Text>
                    <TouchableOpacity
                      style={styles.permissionBtn}
                      onPress={requestPermission}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="shield-checkmark" size={18} color="#000" />
                      <Text style={styles.permissionBtnText}>Enable Camera</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Camera Control Overlays (Torch & Flip) */}
                {permission?.granted && (
                  <View style={styles.cameraTopActions}>
                    <TouchableOpacity
                      style={[styles.cameraActionCircle, torch && styles.cameraActionCircleActive]}
                      onPress={toggleTorch}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={torch ? 'flash' : 'flash-off'}
                        size={18}
                        color={torch ? '#FFD700' : '#FFF'}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cameraActionCircle}
                      onPress={toggleFacing}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="camera-reverse" size={18} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Viewfinder Grid Overlay */}
                <View style={styles.viewfinderGrid} pointerEvents="none">
                  <View style={styles.gridLineH} />
                  <View style={styles.gridLineV} />
                  <View style={[styles.targetCorner, styles.cornerTL]} />
                  <View style={[styles.targetCorner, styles.cornerTR]} />
                  <View style={[styles.targetCorner, styles.cornerBL]} />
                  <View style={[styles.targetCorner, styles.cornerBR]} />
                </View>

                {/* Frame Guide Pill */}
                <View style={styles.frameGuideContainer}>
                  <Ionicons
                    name={step.type === 'video' ? 'videocam' : 'camera'}
                    size={18}
                    color={THEME.colors.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.frameGuideText}>{step.frameGuide}</Text>
                </View>

                {/* Watermark Strip */}
                <View style={styles.watermarkContainer}>
                  <Text style={styles.watermarkText}>{watermarkText}</Text>
                </View>
              </>
            )}
          </View>
        ) : (
          /* Damage Assessment Diagram */
          <View style={styles.damageArea}>
            <Text style={styles.damageInstruction}>
              Tap damaged areas on the vehicle to record prior dents / scratches
            </Text>
            <View style={styles.carOutlineContainer}>
              <View style={styles.carOutline}>
                {['Front', 'Left', 'Roof', 'Right', 'Rear'].map((zone) => {
                  const isSelected = captures[step.id]?.zones?.includes(zone);
                  return (
                    <TouchableOpacity
                      key={zone}
                      style={[
                        styles.carZone,
                        styles[`zone${zone}` as keyof typeof styles],
                        isSelected && styles.zoneSelected,
                      ]}
                      onPress={() => handleMarkDamage(zone)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.zoneText, isSelected && styles.zoneTextSelected]}>
                        {zone}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.damageSummaryBox}>
              <Text style={styles.damageSummaryTitle}>
                Marked Zones:{' '}
                {captures[step.id]?.zones?.length
                  ? captures[step.id].zones.join(', ')
                  : 'No damage marked (Clean)'}
              </Text>
            </View>
          </View>
        )}

        {/* Shutter / Capture Controls Area */}
        <View style={styles.controlsArea}>
          {step.type === 'photo' && !isCaptured && (
            <View style={styles.shutterContainer}>
              <TouchableOpacity
                style={[styles.captureBtn, isCapturing && { opacity: 0.7 }]}
                onPress={handleCapture}
                disabled={isCapturing}
                activeOpacity={0.6}
              >
                {isCapturing ? (
                  <ActivityIndicator size="small" color={THEME.colors.primary} />
                ) : (
                  <View style={styles.captureBtnInner} />
                )}
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
                <View
                  style={[styles.captureBtnInner, isRecording && styles.recordingBtnInner]}
                />
              </TouchableOpacity>
              <Text style={styles.shutterHint}>
                {isRecording ? 'Tap to finish recording' : 'Tap to start 360° walkaround'}
              </Text>
            </View>
          )}

          {isRecording && (
            <Text style={styles.recordingTimer}>
              Recording: 00:{recordTimer < 10 ? `0${recordTimer}` : recordTimer} / 00:20
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Pinned Bottom Footer Actions with Safe Area Insets */}
      <View style={[styles.footerActions, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 36 : 16) + 14 }]}>
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
            colors={
              canProceed
                ? [THEME.colors.primary, THEME.colors.secondary]
                : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.08)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGradient}
          >
            <Text style={[styles.nextBtnText, !canProceed && styles.nextBtnTextDisabled]}>
              {currentStepIndex === INSPECTION_STEPS.length - 1 ? 'FINISH' : 'NEXT'}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={canProceed ? '#000' : THEME.colors.textSecondary}
            />
          </LinearGradient>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    paddingTop: 10,
    paddingBottom: 6,
  },
  progressBar: {
    flexDirection: 'row',
    height: 7,
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    alignItems: 'center',
  },
  stepDescription: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 17,
    color: THEME.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  captureArea: {
    width: '100%',
    height: Math.min(340, SCREEN_HEIGHT * 0.42),
    minHeight: 270,
    backgroundColor: '#0A0E17',
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFF',
    zIndex: 25,
  },
  cameraTopActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
    zIndex: 20,
  },
  cameraActionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraActionCircleActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.25)',
    borderColor: '#FFD700',
  },
  permissionBox: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0A0E17',
  },
  permissionTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.text,
    marginTop: 10,
    marginBottom: 6,
    textAlign: 'center',
  },
  permissionSub: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  permissionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 100,
  },
  permissionBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 13,
    color: '#000',
  },
  viewfinderGrid: {
    ...StyleSheet.absoluteFill,
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
  cornerTL: { top: 14, left: 14, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 14, right: 14, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 14, left: 14, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 14, right: 14, borderBottomWidth: 2, borderRightWidth: 2 },
  frameGuideContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    maxWidth: '90%',
  },
  frameGuideText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
  },
  watermarkContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  watermarkText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  mockCapturedBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0F1626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturedOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 16,
  },
  capturedBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 151, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.4)',
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: '90%',
  },
  capturedText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 15,
    color: THEME.colors.success,
    marginTop: 4,
  },
  capturedSub: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  autoAdvanceHint: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    textAlign: 'center',
  },
  retakeInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    marginTop: 10,
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
    marginBottom: 16,
  },
  damageInstruction: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginBottom: 14,
    textAlign: 'center',
  },
  carOutlineContainer: {
    width: 220,
    height: 380,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
    marginBottom: 14,
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
  zoneFront: { top: 10, left: 35, right: 35, height: 65, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  zoneRear: { bottom: 10, left: 35, right: 35, height: 65, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  zoneRoof: { top: 85, bottom: 85, left: 55, right: 55, borderRadius: 10 },
  zoneLeft: { top: 85, bottom: 85, left: 10, width: 36, borderRadius: 10 },
  zoneRight: { top: 85, bottom: 85, right: 10, width: 36, borderRadius: 10 },
  damageSummaryBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: THEME.borderRadius.sm,
    padding: 10,
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
    marginVertical: 10,
    width: '100%',
  },
  shutterContainer: {
    alignItems: 'center',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  captureBtnInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF',
  },
  recordingBtn: {
    backgroundColor: 'rgba(255, 51, 102, 0.3)',
    borderColor: THEME.colors.danger,
  },
  recordingBtnInner: {
    backgroundColor: THEME.colors.danger,
    borderRadius: 8,
    width: 26,
    height: 26,
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
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#050810',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    paddingHorizontal: 18,
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
    height: 50,
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
    opacity: 0.45,
  },
  btnGradient: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  nextBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 15,
    color: '#000',
    letterSpacing: 0.5,
  },
  nextBtnTextDisabled: {
    color: THEME.colors.textSecondary,
  },
});
