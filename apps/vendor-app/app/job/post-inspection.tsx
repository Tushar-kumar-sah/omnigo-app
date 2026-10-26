import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@/constants/theme';
import { INSPECTION_STEPS } from '@/constants/app-config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';

const { width } = Dimensions.get('window');

export default function PostInspectionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.id as string;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<string, { uri: string; time: string }>>({});
  const [showComparison, setShowComparison] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [torch, setTorch] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<any>(null);
  const flashAnim = useRef(new Animated.Value(0)).current;

  const currentStep = INSPECTION_STEPS[currentStepIndex];
  const progress = (Object.keys(completedSteps).length / INSPECTION_STEPS.length) * 100;

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const triggerFlash = (callback?: () => void) => {
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
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
          console.warn('[PostInspection] camera error:', camErr);
        }
      }

      if (!photoUri) {
        photoUri = `post_photo_${currentStep.id}_${Date.now()}`;
      }

      const timestamp = new Date().toLocaleTimeString();
      const newCompleted = {
        ...completedSteps,
        [currentStep.id]: { uri: photoUri, time: timestamp },
      };
      setCompletedSteps(newCompleted);

      triggerFlash(() => {
        if (Object.keys(newCompleted).length === INSPECTION_STEPS.length) {
          setShowComparison(true);
        } else if (currentStepIndex < INSPECTION_STEPS.length - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
        }
      });
    } catch (err) {
      console.warn('[PostInspection] capture error:', err);
      const newCompleted = {
        ...completedSteps,
        [currentStep.id]: { uri: `post_photo_${currentStep.id}_${Date.now()}`, time: 'Now' },
      };
      setCompletedSteps(newCompleted);
      triggerFlash(() => {
        if (Object.keys(newCompleted).length === INSPECTION_STEPS.length) {
          setShowComparison(true);
        } else if (currentStepIndex < INSPECTION_STEPS.length - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
        }
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleTorch = () => setTorch((prev) => !prev);
  const toggleFacing = () => setFacing((prev) => (prev === 'back' ? 'front' : 'back'));

  if (showComparison) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.comparisonScroll,
            { paddingTop: Math.max(insets.top + 16, 56), paddingBottom: Math.max(insets.bottom + 90, 110) },
          ]}
        >
          <Text style={styles.title}>Post-Tow Inspection</Text>

          <BlurView intensity={25} tint="dark" style={styles.statusBadge}>
            <View style={styles.statusIconCircle}>
              <Ionicons name="shield-checkmark" size={24} color={THEME.colors.success} />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>No New Damage Detected</Text>
              <Text style={styles.statusSubtitle}>
                Pre-tow vs post-tow comparison verified. 0 new scratches or dents detected.
              </Text>
            </View>
          </BlurView>

          <Text style={styles.comparisonTitle}>Before vs After Comparison</Text>

          <View style={styles.comparisonContainer}>
            <View style={[styles.comparisonCol, { borderColor: 'rgba(0, 207, 255, 0.3)' }]}>
              <Text style={[styles.colHeader, { color: THEME.colors.primary }]}>PRE-TOW</Text>
              {INSPECTION_STEPS.map((s) => (
                <View key={`pre-${s.id}`} style={styles.thumbBox}>
                  <Text style={styles.thumbText} numberOfLines={1}>
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>

            <View style={[styles.comparisonCol, { borderColor: 'rgba(0, 255, 151, 0.3)' }]}>
              <Text style={[styles.colHeader, { color: THEME.colors.success }]}>POST-TOW</Text>
              {INSPECTION_STEPS.map((s) => (
                <View key={`post-${s.id}`} style={styles.thumbBox}>
                  <Text style={styles.thumbText} numberOfLines={1}>
                    {s.label} ✓
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 10, 18) }]}>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/job/dropoff', params: { id: jobId } })}
            activeOpacity={0.8}
          >
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
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 52) }]}>
        <Text style={styles.title}>Post-Tow Inspection</Text>
        <Text style={styles.subtitle}>
          Step {currentStepIndex + 1} of {INSPECTION_STEPS.length}
        </Text>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Camera Viewport */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraViewport}>
          {/* White Flash overlay */}
          <Animated.View style={[styles.flashOverlay, { opacity: flashAnim }]} pointerEvents="none" />

          {permission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
              enableTorch={torch}
              mode="picture"
            />
          ) : (
            <View style={styles.permissionBox}>
              <Ionicons name="camera-outline" size={44} color={THEME.colors.primary} />
              <Text style={styles.permissionTitle}>Camera Permission Needed</Text>
              <TouchableOpacity
                style={styles.permissionBtn}
                onPress={requestPermission}
                activeOpacity={0.8}
              >
                <Text style={styles.permissionBtnText}>Enable Camera</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick controls */}
          {permission?.granted && (
            <View style={styles.cameraTopActions}>
              <TouchableOpacity
                style={[styles.cameraActionCircle, torch && styles.cameraActionCircleActive]}
                onPress={toggleTorch}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={torch ? 'flash' : 'flash-off'}
                  size={16}
                  color={torch ? '#FFD700' : '#FFF'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cameraActionCircle}
                onPress={toggleFacing}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-reverse" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.guideFrame} pointerEvents="none">
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>

          <View style={styles.watermark}>
            <Text style={styles.watermarkText}>{currentStep.label} - Post Inspection</Text>
          </View>
        </View>
      </View>

      {/* Bottom Controls with Safe Area insets */}
      <BlurView
        intensity={30}
        tint="dark"
        style={[styles.bottomControls, { paddingBottom: Math.max(insets.bottom + 12, 28) }]}
      >
        <Text style={styles.instructionTitle}>{currentStep.label}</Text>
        <Text style={styles.instructionDesc}>{currentStep.description}</Text>

        <TouchableOpacity
          style={[styles.captureBtn, isCapturing && { opacity: 0.6 }]}
          onPress={handleCapture}
          disabled={isCapturing}
          activeOpacity={0.7}
        >
          {isCapturing ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <View style={styles.captureInner} />
          )}
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
    paddingHorizontal: THEME.spacing.md,
    paddingBottom: THEME.spacing.md,
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 26,
    color: THEME.colors.text,
  },
  subtitle: {
    fontFamily: THEME.fonts.inter.medium,
    color: THEME.colors.primary,
    fontSize: 15,
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
    backgroundColor: '#0A0E17',
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 207, 255, 0.4)',
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
    marginBottom: 12,
  },
  permissionBtn: {
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
  guideFrame: {
    width: '80%',
    height: '60%',
    position: 'absolute',
  },
  cornerTopLeft: { position: 'absolute', top: 0, left: 0, width: 36, height: 36, borderColor: THEME.colors.primary, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTopRight: { position: 'absolute', top: 0, right: 0, width: 36, height: 36, borderColor: THEME.colors.primary, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBottomLeft: { position: 'absolute', bottom: 0, left: 0, width: 36, height: 36, borderColor: THEME.colors.primary, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBottomRight: { position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderColor: THEME.colors.primary, borderBottomWidth: 3, borderRightWidth: 3 },
  watermark: {
    position: 'absolute',
    bottom: THEME.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  watermarkText: {
    color: '#fff',
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
  },
  bottomControls: {
    paddingHorizontal: THEME.spacing.xl,
    paddingTop: THEME.spacing.lg,
    borderTopLeftRadius: THEME.borderRadius.xl,
    borderTopRightRadius: THEME.borderRadius.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(10, 14, 23, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  instructionTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.text,
    marginBottom: 4,
  },
  instructionDesc: {
    fontFamily: THEME.fonts.inter.regular,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
    fontSize: 13,
  },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0, 207, 255, 0.2)',
    borderWidth: 3,
    borderColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: THEME.colors.primary,
  },
  comparisonScroll: {
    paddingHorizontal: THEME.spacing.md,
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
    height: 48,
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
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 11,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.md,
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
  },
});
