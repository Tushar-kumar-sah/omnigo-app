import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  showChips?: boolean;
}

const QUICK_ACTIONS = [
  { id: '1', title: 'Book Towing', icon: 'truck-outline', route: '/booking/select-vehicle' },
  { id: '2', title: 'Roadside Help', icon: 'key-outline', query: 'I need roadside help for my vehicle' },
  { id: '3', title: 'Send Parcel', icon: 'cube-outline', query: 'How do I send a parcel with OmniGo?' },
  { id: '4', title: 'Track Booking', icon: 'location-outline', route: '/booking/tracking' },
  { id: '5', title: 'Check Fares', icon: 'cash-outline', query: 'What are the towing and service rates?' },
  { id: '6', title: 'Support', icon: 'headset-outline', query: 'Connect me with customer support' },
];

export default function AIAssistantScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hi! I'm OMNI-AI 👋\nYour smart mobility assistant. I'm here to help you anytime, anywhere.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showChips: true,
    },
  ]);

  const handleSend = (customText?: string) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim()) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgObj: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: userTime,
    };

    setMessages((prev) => [...prev, userMsgObj]);
    if (!customText) setInputMsg('');

    // Generate intelligent AI response
    setTimeout(() => {
      let responseText = "I'm processing your request. How else can I assist your vehicle today?";
      const lower = textToSend.toLowerCase();

      if (lower.includes('book') || lower.includes('tow')) {
        responseText = "⚡ I can dispatch a flatbed tow truck to your GPS location right now. Tap below to select your vehicle and confirm!";
      } else if (lower.includes('roadside') || lower.includes('help') || lower.includes('battery') || lower.includes('flat tire')) {
        responseText = "🔧 Roadside Support: We provide battery jumpstarts, flat tire replacements, and emergency fuel delivery within 15 mins!";
      } else if (lower.includes('parcel') || lower.includes('send')) {
        responseText = "📦 OmniGo Parcel Express: Send packages locally with 100% live GPS tracking and secure OTP delivery.";
      } else if (lower.includes('track') || lower.includes('booking') || lower.includes('status')) {
        responseText = "📍 Active Service Status: Driver Ramesh Kumar is 4.2 km away in a Silver Flatbed Tow Truck (MH-12-AB-4321). ETA: 8 mins.";
      } else if (lower.includes('fare') || lower.includes('rate') || lower.includes('price')) {
        responseText = "💳 Pricing Transparency: Flatbed Towing starts at ₹499 base + ₹35/km. Zero surge pricing guaranteed during emergencies!";
      } else if (lower.includes('support') || lower.includes('contact') || lower.includes('helpdesk')) {
        responseText = "📞 24/7 Emergency Support: Call our toll-free hotline at 1800-OMNIGO or stay right here for instant live chat resolution.";
      }

      const aiMsgObj: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsgObj]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 600);
  };

  const handleActionClick = (action: typeof QUICK_ACTIONS[0]) => {
    if (action.route) {
      router.push(action.route as any);
    } else if (action.query) {
      handleSend(action.query);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />

      {/* 1. Header Bar */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 44) }]}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View style={styles.avatarWrapper}>
            <Image source={require('../assets/ai_mascot.png')} style={styles.headerAvatar} resizeMode="contain" />
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.headerTitle}>OMNI-AI</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineBadgeDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.headerMenuBtn} activeOpacity={0.7}>
          <Ionicons name="ellipsis-vertical" size={20} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? (insets.top + 55) : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Top Quick Action Grid (2x3 Grid) */}
        <View style={styles.gridContainer}>
          {QUICK_ACTIONS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridCardTouch}
              onPress={() => handleActionClick(item)}
              activeOpacity={0.8}
            >
              <BlurView intensity={75} tint="dark" style={styles.gridCard}>
                <LinearGradient
                  colors={['rgba(0, 207, 255, 0.15)', 'rgba(255, 255, 255, 0.03)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFillObject, { borderRadius: 16 }]}
                />
                <Ionicons name={item.icon as any} size={22} color="#00CFFF" style={{ marginBottom: 6 }} />
                <Text style={styles.gridCardTitle} numberOfLines={1} adjustsFontSizeToFit>{item.title}</Text>
              </BlurView>
            </TouchableOpacity>
          ))}
        </View>

        {/* 3. Messages Stream */}
        <View style={styles.messagesList}>
          {messages.map((msg) => (
            <View key={msg.id} style={styles.msgWrapper}>
              {msg.sender === 'ai' ? (
                <View style={styles.aiMsgRow}>
                  <View style={styles.msgAvatarWrapper}>
                    <Image source={require('../assets/ai_mascot.png')} style={styles.msgAvatar} resizeMode="contain" />
                  </View>
                  <View style={styles.aiBubbleCol}>
                    <View style={styles.aiBubbleContainer}>
                      <BlurView intensity={85} tint="dark" style={styles.aiBubble}>
                        <LinearGradient
                          colors={['rgba(0, 207, 255, 0.22)', 'rgba(10, 28, 60, 0.85)']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={StyleSheet.absoluteFillObject}
                        />
                        <Text style={styles.aiBubbleText}>{msg.text}</Text>
                      </BlurView>
                    </View>
                    <Text style={styles.timestampText}>{msg.time}</Text>

                    {/* Interactive Quick Action Chips below greeting message */}
                    {msg.showChips && (
                      <View style={styles.chipsGrid}>
                        {QUICK_ACTIONS.map((action) => (
                          <TouchableOpacity
                            key={action.id}
                            style={styles.chipBadge}
                            onPress={() => handleActionClick(action)}
                            activeOpacity={0.75}
                          >
                            <LinearGradient
                              colors={['rgba(0, 207, 255, 0.25)', 'rgba(0, 207, 255, 0.05)']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={[StyleSheet.absoluteFillObject, { borderRadius: 15 }]}
                            />
                            <Text style={styles.chipText} numberOfLines={1} adjustsFontSizeToFit>{action.title}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                /* User Message Bubble */
                <View style={styles.userMsgRow}>
                  <View style={styles.userBubbleCol}>
                    <LinearGradient
                      colors={['#00CFFF', '#0099FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.userBubble}
                    >
                      <Text style={styles.userBubbleText}>{msg.text}</Text>
                    </LinearGradient>
                    <Text style={[styles.timestampText, { alignSelf: 'flex-end' }]}>{msg.time}</Text>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 4. Bottom Input Bar */}
      <View style={[styles.inputBarContainer, { paddingBottom: keyboardVisible ? 8 : Math.max(insets.bottom, 12) }]}>
        <View style={styles.inputBarWrapper}>
          <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFillObject} />
          <TextInput
            style={styles.inputField}
            placeholder="Type your message..."
            placeholderTextColor="rgba(255, 255, 255, 0.45)"
            value={inputMsg}
            onChangeText={setInputMsg}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButtonTouch} onPress={() => handleSend()} activeOpacity={0.8}>
            <LinearGradient colors={['#00CFFF', '#00FF97']} style={styles.sendButtonGradient}>
              <Ionicons name="send" size={16} color="#000000" style={{ marginLeft: 2 }} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(5, 8, 16, 0.85)',
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  avatarWrapper: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(13, 28, 60, 0.65)',
    borderWidth: 1.5,
    borderColor: '#00CFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  headerAvatar: {
    width: 36,
    height: 36,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#00FF97',
    borderWidth: 2,
    borderColor: '#050810',
  },
  headerTextCol: {
    marginLeft: 10,
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  onlineBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF97',
    marginRight: 4,
  },
  onlineText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#00FF97',
  },
  headerMenuBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  /* 2. Top Quick Action Grid (2x3 Grid) */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridCardTouch: {
    width: '31.5%',
    height: 80,
    marginBottom: 10,
    borderRadius: 18,
    overflow: 'hidden',
  },
  gridCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(10, 28, 60, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 207, 255, 0.35)',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  gridCardTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 2,
  },

  /* 3. Messages Stream */
  messagesList: {
    gap: 16,
  },
  msgWrapper: {
    marginBottom: 6,
  },
  aiMsgRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  msgAvatarWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(10, 28, 60, 0.75)',
    borderWidth: 1.5,
    borderColor: '#00CFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  msgAvatar: {
    width: 32,
    height: 32,
  },
  aiBubbleCol: {
    flex: 1,
  },
  aiBubbleContainer: {
    borderRadius: 20,
    borderTopLeftRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 207, 255, 0.55)',
    overflow: 'hidden',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  aiBubble: {
    padding: 14,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    backgroundColor: 'rgba(10, 28, 60, 0.75)',
    overflow: 'hidden',
  },
  aiBubbleText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  timestampText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 4,
    marginLeft: 2,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  chipBadge: {
    width: '48.5%',
    height: 34,
    marginBottom: 8,
    borderRadius: 17,
    backgroundColor: 'rgba(10, 28, 60, 0.75)',
    borderWidth: 1.5,
    borderColor: '#00CFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    overflow: 'hidden',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  chipText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 11,
    color: '#00CFFF',
    textAlign: 'center',
  },

  userMsgRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  userBubbleCol: {
    maxWidth: '80%',
    alignItems: 'flex-end',
  },
  userBubble: {
    padding: 14,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  userBubbleText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },

  /* 4. Bottom Input Bar */
  inputBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#050810',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 28, 60, 0.85)',
    minHeight: 48,
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: '#00CFFF',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  inputField: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 10,
  },
  sendButtonTouch: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
