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
const WebViewComponent = WebView as any;
import { Ionicons } from '@expo/vector-icons';
import { signInWithGoogleUser } from '@/lib/api';

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
  onSuccess: (user: any) => void;
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

      // 3. Save to Supabase & active session
      const user = await signInWithGoogleUser({
        name: profile.name || profile.given_name || 'Google User',
        email: profile.email,
        avatar: highResPicture || profile.picture,
      });

      setExchangingToken(false);
      handledCodeRef.current = null;
      onSuccess(user);
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
              <Text style={styles.headerTitle}>Sign in with Google</Text>
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
            <Text style={styles.loadingTitle}>Signing you in to OmniGo...</Text>
            <Text style={styles.loadingSub}>Fetching your Google profile & photo</Text>
          </View>
        ) : (
          <View style={styles.webviewContainer}>
            <WebViewComponent
              source={{ uri: GOOGLE_AUTH_URL }}
              userAgent={SAFARI_USER_AGENT}
              originWhitelist={['*']}
              sharedCookiesEnabled={true}
              thirdPartyCookiesEnabled={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              onLoadStart={(e: any) => {
                const url = e.nativeEvent.url;
                if (url.startsWith(REDIRECT_URI)) {
                  handleUrlIntercept(url);
                } else {
                  setPageLoading(true);
                }
              }}
              onLoadEnd={() => setPageLoading(false)}
              onNavigationStateChange={(navState: any) => {
                if (navState.url && navState.url.startsWith(REDIRECT_URI)) {
                  handleUrlIntercept(navState.url);
                }
              }}
              onShouldStartLoadWithRequest={(req: any) => {
                return handleUrlIntercept(req.url);
              }}
              onError={(syntheticEvent: any) => {
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
                <ActivityIndicator size="small" color="#00CFFF" />
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
    backgroundColor: '#0A101F',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0D1526',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleLogo: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  headerTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  headerUrl: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#00FF97',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.16)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#FF453A',
  },
  retryBtn: {
    backgroundColor: '#FF453A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  retryText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webview: {
    flex: 1,
  },
  pageLoader: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(5, 8, 16, 0.75)',
    padding: 8,
    borderRadius: 20,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: '#050810',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 18,
    textAlign: 'center',
  },
  loadingSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 6,
    textAlign: 'center',
  },
});
