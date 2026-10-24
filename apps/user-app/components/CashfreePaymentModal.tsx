import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { checkCashfreePaymentStatus } from '@/lib/api';

interface CashfreePaymentModalProps {
  visible: boolean;
  checkoutUrl?: string;
  checkoutHtml?: string;
  orderId?: string;
  amount?: number;
  purpose?: string;
  onClose: () => void;
  onSuccess: (details?: any) => void;
  onFailure?: (error: string) => void;
}

export default function CashfreePaymentModal({
  visible,
  checkoutUrl,
  checkoutHtml,
  orderId,
  amount,
  purpose,
  onClose,
  onSuccess,
  onFailure,
}: CashfreePaymentModalProps) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const handleNavigationChange = async (navState: any) => {
    const url = navState?.url || '';

    // Check if Cashfree redirected to return_url or success page
    if (
      url.includes('cashfree-return') ||
      url.includes('payment-success') ||
      url.includes('status=PAID') ||
      url.includes('txStatus=SUCCESS')
    ) {
      setVerifying(true);
      try {
        if (orderId) {
          const statusRes = await checkCashfreePaymentStatus(orderId);
          if (statusRes?.isPaid || statusRes?.orderStatus === 'PAID') {
            onSuccess({ orderId, status: 'PAID', ...statusRes });
            return;
          }
        }
        // If return URL reached, accept as completed
        onSuccess({ orderId, url });
      } catch (e) {
        onSuccess({ orderId, url });
      } finally {
        setVerifying(false);
      }
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'CASHFREE_SUCCESS') {
        onSuccess(data.details);
      } else if (data?.type === 'CASHFREE_ERROR') {
        if (onFailure) onFailure(data.error);
        else Alert.alert('Payment Incomplete', data.error || 'Payment was not completed');
      }
    } catch {}
  };

  const handleSimulateSandboxSuccess = () => {
    Alert.alert(
      'Simulate Test Payment',
      `Complete test payment of ₹${amount || 999} via Cashfree Sandbox?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now (Test Success)',
          onPress: () => {
            onSuccess({
              orderId: orderId || `omni_test_${Date.now()}`,
              status: 'PAID',
              simulated: true,
            });
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment?',
      'Are you sure you want to cancel? You can choose to pay with Cash on delivery instead.',
      [
        { text: 'Continue Payment', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: onClose },
      ]
    );
  };

  if (!visible) return null;

  const source = checkoutUrl
    ? { uri: checkoutUrl }
    : checkoutHtml
    ? { html: checkoutHtml }
    : null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleCancel}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.gatewayBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#00FF97" />
              <Text style={styles.headerTitle}>Cashfree Payments</Text>
            </View>
            <Text style={styles.headerSub}>
              {purpose || 'OmniGo Emergency Tow Service'} · <Text style={{ color: '#00FF97', fontWeight: 'bold' }}>₹{amount || '—'}</Text>
            </Text>
          </View>

          <View style={styles.testModeBadge}>
            <Text style={styles.testModeText}>TEST</Text>
          </View>
        </View>

        {/* WebView */}
        <View style={styles.webviewWrapper}>
          {source ? (
            <WebView
              ref={webViewRef}
              source={source}
              style={styles.webview}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              renderLoading={() => (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color="#00CFFF" />
                  <Text style={styles.loadingText}>Opening Cashfree Gateway...</Text>
                  <Text style={styles.loadingSub}>Loading UPI, GPay, PhonePe & Cards</Text>
                </View>
              )}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              onNavigationStateChange={handleNavigationChange}
              onMessage={handleMessage}
            />
          ) : (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#00CFFF" />
              <Text style={styles.loadingText}>Initializing Payment Gateway...</Text>
            </View>
          )}

          {verifying && (
            <View style={styles.verifyingOverlay}>
              <ActivityIndicator size="large" color="#00FF97" />
              <Text style={styles.verifyingText}>Verifying Payment with Cashfree...</Text>
            </View>
          )}
        </View>

        {/* Sandbox Quick-Test Footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.sandboxNotice}>
            <Ionicons name="flask-outline" size={14} color="#FFD60A" />
            <Text style={styles.sandboxNoticeText}>Cashfree Test Sandbox Active</Text>
          </View>

          <TouchableOpacity
            style={styles.simulateBtn}
            onPress={handleSimulateSandboxSuccess}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-done" size={16} color="#050810" />
            <Text style={styles.simulateBtnText}>Test Instant Pay (Simulate Success)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    paddingVertical: 12,
    backgroundColor: '#0A0E17',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  gatewayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  headerSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  testModeBadge: {
    backgroundColor: 'rgba(255, 214, 10, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 10, 0.3)',
  },
  testModeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    color: '#FFD60A',
    letterSpacing: 0.5,
  },
  webviewWrapper: {
    flex: 1,
    backgroundColor: '#0A0E17',
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  loadingBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#050810',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 10,
  },
  loadingText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: '#00CFFF',
    marginTop: 14,
  },
  loadingSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  verifyingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 8, 16, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  verifyingText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#00FF97',
    marginTop: 14,
  },
  footer: {
    backgroundColor: '#0A0E17',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sandboxNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sandboxNoticeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#FFD60A',
  },
  simulateBtn: {
    backgroundColor: '#00FF97',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  simulateBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#050810',
  },
});
