import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { THEME } from '../../constants/theme';
import { INSPECTION_STEPS, mockIncomingJob } from '../../constants/mock-data';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function PreInspectionScreen() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [captures, setCaptures] = useState<Record<number, any>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);

  const step = INSPECTION_STEPS[currentStepIndex];
  const isCaptured = !!captures[step.id];

  const now = new Date();
  const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  const watermarkText = `GPS: 18.5204°N, 73.8567°E | ${timestamp} | DRV-2024-0847 | ${mockIncomingJob.id}`;

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

  const handleCapture = () => {
    setCaptures(prev => ({
      ...prev,
      [step.id]: { type: 'photo', uri: 'mock_photo_uri' }
    }));
  };

  const handleStartRecording = () => {
    setRecordTimer(0);
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setCaptures(prev => ({
      ...prev,
      [step.id]: { type: 'video', uri: 'mock_video_uri', duration: recordTimer }
    }));
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

  const handleNext = () => {
    if (currentStepIndex < INSPECTION_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      router.push('/job/condition-report');
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const canProceed = isCaptured || (!step.required);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pre-Tow Inspection</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {INSPECTION_STEPS.map((s, idx) => {
            const status = captures[s.id] ? 'completed' : (idx === currentStepIndex ? 'current' : 'pending');
            return (
              <View 
                key={s.id} 
                style={[
                  styles.progressSegment,
                  status === 'completed' && { backgroundColor: THEME.colors.success },
                  status === 'current' && { backgroundColor: THEME.colors.primary },
                ]} 
              />
            );
          })}
        </View>
        <Text style={styles.progressText}>
          Step {currentStepIndex + 1} of {INSPECTION_STEPS.length} — {step.label}
        </Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentScroll}>
        <Text style={styles.stepDescription}>{step.description}</Text>

        {step.type === 'photo' || step.type === 'video' ? (
          <View style={styles.captureArea}>
            {isCaptured ? (
              <View style={styles.capturedView}>
                <Ionicons name="checkmark-circle" size={64} color={THEME.colors.success} />
                <Text style={styles.capturedText}>Captured Successfully</Text>
              </View>
            ) : (
              <>
                <View style={styles.frameGuideContainer}>
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
            <Text style={styles.damageInstruction}>Tap areas to mark damage</Text>
            <View style={styles.carOutlineContainer}>
              <View style={styles.carOutline}>
                {['Front', 'Left', 'Roof', 'Right', 'Rear'].map((zone) => {
                  const isSelected = captures[step.id]?.zones?.includes(zone);
                  return (
                    <TouchableOpacity 
                      key={zone}
                      style={[styles.carZone, styles[`zone${zone}` as keyof typeof styles], isSelected && styles.zoneSelected]}
                      onPress={() => handleMarkDamage(zone)}
                    >
                      <Text style={[styles.zoneText, isSelected && styles.zoneTextSelected]}>{zone}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            {captures[step.id]?.zones?.length > 0 && (
              <TouchableOpacity style={styles.addDamagePhotoBtn}>
                <Ionicons name="camera" size={20} color={THEME.colors.text} />
                <Text style={styles.addDamagePhotoText}>Add Close-up Photos</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.controlsArea}>
          {step.type === 'photo' && !isCaptured && (
            <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
              <View style={styles.captureBtnInner} />
            </TouchableOpacity>
          )}

          {step.type === 'video' && !isCaptured && (
            <TouchableOpacity 
              style={[styles.captureBtn, isRecording && styles.recordingBtn]} 
              onPress={isRecording ? handleStopRecording : handleStartRecording}
            >
              <View style={[styles.captureBtnInner, isRecording && styles.recordingBtnInner]} />
            </TouchableOpacity>
          )}

          {isRecording && (
            <Text style={styles.recordingTimer}>00:{recordTimer < 10 ? `0${recordTimer}` : recordTimer} / 00:20</Text>
          )}

          {isCaptured && (
            <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
              <Ionicons name="refresh" size={20} color={THEME.colors.text} />
              <Text style={styles.retakeBtnText}>RETAKE</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footerActions}>
          {!step.required && !isCaptured && (
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipBtnText}>SKIP</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled, (!step.required && !isCaptured) ? { flex: 1, marginLeft: 12 } : {}]} 
            onPress={handleNext}
            disabled={!canProceed}
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: THEME.colors.glassBg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.glassBorder,
  },
  headerTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 20,
    color: THEME.colors.text,
    textAlign: 'center',
  },
  progressContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  progressBar: {
    flexDirection: 'row',
    height: 6,
    marginBottom: 12,
  },
  progressSegment: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 2,
    borderRadius: 3,
  },
  progressText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentScroll: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  stepDescription: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 22,
    color: THEME.colors.text,
    marginBottom: 24,
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
    marginBottom: 32,
  },
  frameGuideContainer: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: THEME.borderRadius.md,
  },
  frameGuideText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  watermarkContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 4,
  },
  watermarkText: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  capturedView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturedText: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 18,
    color: THEME.colors.success,
    marginTop: 16,
  },
  damageArea: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  damageInstruction: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginBottom: 20,
  },
  carOutlineContainer: {
    width: 240,
    height: 480,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
    marginBottom: 24,
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
  zoneFront: { top: 10, left: 40, right: 40, height: 80, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  zoneRear: { bottom: 10, left: 40, right: 40, height: 80, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  zoneRoof: { top: 100, bottom: 100, left: 60, right: 60, borderRadius: 10 },
  zoneLeft: { top: 100, bottom: 100, left: 10, width: 40, borderRadius: 10 },
  zoneRight: { top: 100, bottom: 100, right: 10, width: 40, borderRadius: 10 },
  addDamagePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.full,
  },
  addDamagePhotoText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.text,
    marginLeft: 8,
  },
  controlsArea: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
  },
  recordingBtn: {
    backgroundColor: 'rgba(255, 51, 102, 0.3)',
  },
  recordingBtnInner: {
    backgroundColor: THEME.colors.danger,
    borderRadius: 8,
    width: 32,
    height: 32,
  },
  recordingTimer: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 16,
    color: THEME.colors.danger,
    marginTop: 12,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  retakeBtnText: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 14,
    color: THEME.colors.text,
    marginLeft: 8,
  },
  footerActions: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 10,
  },
  skipBtn: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginRight: 12,
  },
  skipBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.textSecondary,
    letterSpacing: 1,
  },
  nextBtn: {
    flex: 2,
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  btnGradient: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtnText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: '#000',
    letterSpacing: 1,
  },
  nextBtnTextDisabled: {
    color: THEME.colors.textSecondary,
  },
});
