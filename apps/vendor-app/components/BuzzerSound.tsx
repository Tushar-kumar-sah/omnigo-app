import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, StyleSheet, Vibration, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
const WebViewComponent = WebView as any;

export interface BuzzerSoundHandle {
  startBuzz: () => void;
  stopBuzz: () => void;
}

const BUZZER_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OmniGo Alarm Buzzer</title>
</head>
<body style="background:transparent; margin:0; padding:0;">
<script>
  var audioCtx = null;
  var timer = null;
  var isPlaying = false;

  function getAudioContext() {
    if (!audioCtx) {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playAlertPulse() {
    try {
      var ctx = getAudioContext();
      if (!ctx) return;

      var now = ctx.currentTime;
      var osc1 = ctx.createOscillator();
      var osc2 = ctx.createOscillator();
      var gain = ctx.createGain();

      // Sharp dual-tone siren/buzz
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.linearRampToValueAtTime(740, now + 0.18);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.linearRampToValueAtTime(370, now + 0.18);

      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  function start() {
    if (isPlaying) return;
    isPlaying = true;
    playAlertPulse();
    if (timer) clearInterval(timer);
    timer = setInterval(function() {
      playAlertPulse();
    }, 450);
  }

  function stop() {
    isPlaying = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function handleMessage(event) {
    try {
      var data = typeof event.data === 'string' ? event.data : (event.data && event.data.action);
      if (data === 'START') start();
      if (data === 'STOP') stop();
    } catch(e) {}
  }

  window.addEventListener('message', handleMessage);
  document.addEventListener('message', handleMessage);
</script>
</body>
</html>
`;

export const BuzzerSound = forwardRef<BuzzerSoundHandle, {}>((_props, ref) => {
  const webViewRef = useRef<WebView>(null);
  const isBuzzingRef = useRef(false);

  const startBuzz = () => {
    isBuzzingRef.current = true;
    try {
      webViewRef.current?.postMessage('START');
      Vibration.vibrate([0, 350, 150, 350], true);
    } catch (e) {
      console.warn('[BuzzerSound] start error', e);
    }
  };

  const stopBuzz = () => {
    isBuzzingRef.current = false;
    try {
      webViewRef.current?.postMessage('STOP');
      Vibration.cancel();
    } catch (e) {
      console.warn('[BuzzerSound] stop error', e);
    }
  };

  useImperativeHandle(ref, () => ({
    startBuzz,
    stopBuzz,
  }));

  useEffect(() => {
    return () => {
      stopBuzz();
    };
  }, []);

  return (
    <View style={styles.hiddenContainer} pointerEvents="none">
      <WebViewComponent
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: BUZZER_HTML }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        style={styles.hiddenWebView}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  hiddenContainer: {
    width: 0,
    height: 0,
    position: 'absolute',
    top: -100,
    left: -100,
    opacity: 0,
  },
  hiddenWebView: {
    width: 1,
    height: 1,
  },
});
