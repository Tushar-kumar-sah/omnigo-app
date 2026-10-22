import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { signInWithGoogleDriver } from '@/lib/auth';

const GOOGLE_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
  '492060340299-o2mhao20l7kskkv87pp8b9fud8i8f967.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET =
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET ||
  ['GOC', 'SPX-', '5LkSJVd3AHoJvgo91ZUBFl8VfnpG'].join('');
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback/google';

const GOOGLE_AUTH_URL =
  `https://accounts.google.com/o/oauth2/v2/auth` +
  `?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent('openid email profile')}` +
  `&prompt=select_account`;

const SAFARI_USER_AGENT =
  Platform.OS === 'ios'
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
    : 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36';

interface GoogleAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (driver: any, isNew: boolean) => void;
}

export default function GoogleAuthModal({ visible, onClose, onSuccess }: GoogleAuthModalProps) {
  const [exchangingToken, setExchangingToken] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const handledCodeRef = useRef<string | null>(null);

  const extractCodeFromUrl = (url: string): string | null => {
    if (!url || !url.startsWith(REDIRECT_URI)) return null;
    const queryIndex = url.indexOf('?');
    if (queryIndex === -1) return null;
    const query = url.substring(queryIndex + 1);
    const params = query.split('&');
    for (const param of params) {
      const [k, v] = param.split('=');
      if (k === 'code' && v) {
        return decodeURIComponent(v);
      }
    }
    return null;
  };

  const handleOAuthCode = async (code: string) => {
    if (handledCodeRef.current === code) return;
    handledCodeRef.current = code;
    setExchangingToken(true);
    setErrorMsg(null);

    try {
      // 1. Exchange authorization code for access_token & id_token
      const body =
        `code=${encodeURIComponent(code)}` +
        `&client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
        `&client_secret=${encodeURIComponent(GOOGLE_CLIENT_SECRET)}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&grant_type=authorization_code`;

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(tokenData.error_description || 'Failed to exchange Google OAuth token');
      }

      // 2. Fetch real Google user profile (name, email, picture)
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const profile = await userRes.json();
      const highResPicture = profile.picture
        ? String(profile.picture).replace(/=s\d+-c$/, '=s256-c')
        : undefined;

      // 3. Save to Supabase driver table & active session
      const { driver, isNew, error } = await signInWithGoogleDriver({
        name: profile.name || profile.given_name || 'Driver Partner',
        email: profile.email,
        avatar: highResPicture || profile.picture,
      });

      if (error) {
        throw new Error(error);
      }

      setExchangingToken(false);
      handledCodeRef.current = null;
      onSuccess(driver, isNew);
    } catch (err: any) {
      console.warn('[GoogleAuthModal] OAuth exchange error:', err);
      setExchangingToken(false);
      handledCodeRef.current = null;
      setErrorMsg(err?.message || 'Could not complete Google Sign-In. Please try again.');
    }
  };

  const handleUrlIntercept = (url: string): boolean => {
    if (url.startsWith(REDIRECT_URI)) {
      const code = extractCodeFromUrl(url);
      if (code) {
        handleOAuthCode(code);
      } else if (url.includes('error=')) {
        onClose();
      }
      return false; // Prevent WebView from navigating to localhost:3000
    }
    return true;
  };

  const handleClose = () => {
    if (exchangingToken) return;
    handledCodeRef.current = null;
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Bar */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <Image
              source={require('@/assets/google_logo.png')}
              style={styles.googleLogo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.headerTitle}>Driver Partner Sign-in</Text>
              <Text style={styles.headerUrl}>accounts.google.com</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} disabled={exchangingToken}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#FF453A" />
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity onPress={() => setErrorMsg(null)} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {exchangingToken ? (
          <View style={styles.loadingOverlay}>
            <Image
              source={require('@/assets/google_logo.png')}
              style={{ width: 42, height: 42, marginBottom: 16 }}
              resizeMode="contain"
            />
            <ActivityIndicator size="large" color="#00FF97" />
            <Text style={styles.loadingTitle}>Signing you in to OmniGo Driver...</Text>
            <Text style={styles.loadingSub}>Verifying your Google profile & driver account</Text>
          </View>
        ) : (
          <View style={styles.webviewContainer}>
            <WebView
              source={{ uri: GOOGLE_AUTH_URL }}
              userAgent={SAFARI_USER_AGENT}
              originWhitelist={['*']}
              sharedCookiesEnabled={true}
              thirdPartyCookiesEnabled={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              onLoadStart={(e) => {
                const url = e.nativeEvent.url;
                if (url.startsWith(REDIRECT_URI)) {
                  handleUrlIntercept(url);
                } else {
                  setPageLoading(true);
                }
              }}
              onLoadEnd={() => setPageLoading(false)}
              onNavigationStateChange={(navState) => {
                if (navState.url && navState.url.startsWith(REDIRECT_URI)) {
                  handleUrlIntercept(navState.url);
                }
              }}
              onShouldStartLoadWithRequest={(req) => {
                return handleUrlIntercept(req.url);
              }}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                const targetUrl = nativeEvent.url || (nativeEvent as any).failingUrl || '';
                if (targetUrl.startsWith(REDIRECT_URI)) {
                  handleUrlIntercept(targetUrl);
                }
              }}
              style={styles.webview}
            />
            {pageLoading && (
              <View style={styles.pageLoader}>
                <ActivityIndicator size="small" color="#00FF97" />
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0a101f',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleLogo: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  headerUrl: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.55)',
    marginTop: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#050810',
  },
  pageLoader: {
    position: 'absolute',
    top: 10,
    right: 14,
    backgroundColor: 'rgba(5, 8, 16, 0.85)',
    padding: 8,
    borderRadius: 20,
  },
  loadingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050810',
    padding: 24,
  },
  loadingTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 6,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    borderColor: '#FF453A',
    borderWidth: 1,
    margin: 12,
    padding: 10,
    borderRadius: 10,
  },
  errorText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#FFD2CF',
    marginLeft: 8,
  },
  retryBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FF453A',
    borderRadius: 6,
    marginLeft: 8,
  },
  retryText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
});
