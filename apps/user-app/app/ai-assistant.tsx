import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { theme } from '../constants/theme';

// ─── Problem Detection Tree ──────────────────────────────────
const SYMPTOMS = [
  { id: 'wont-start',   label: "Car won't start",        icon: 'key-outline' },
  { id: 'strange-sound',label: 'Strange noise',           icon: 'volume-high-outline' },
  { id: 'warning-light',label: 'Warning light on',        icon: 'warning-outline' },
  { id: 'overheating',  label: 'Overheating',             icon: 'thermometer-outline' },
  { id: 'flat',         label: 'Flat tyre',               icon: 'disc-outline' },
  { id: 'accident',     label: 'Had an accident',         icon: 'car-sport-outline' },
  { id: 'out-of-fuel',  label: 'Out of fuel',             icon: 'water-outline' },
  { id: 'locked-out',   label: 'Locked out',              icon: 'lock-closed-outline' },
];

const RECOMMENDATIONS: Record<string, { service: string; reason: string; urgency: 'High' | 'Medium' | 'Low'; icon: string; price: string }> = {
  'wont-start':    { service: 'Battery Jumpstart / Towing', reason: 'Likely dead battery or starter issue. We\'ll test on-site — tow to garage if needed.', urgency: 'High', icon: 'battery-dead-outline', price: '₹350–₹1,500' },
  'strange-sound': { service: 'Roadside Inspection', reason: 'Could be brake, suspension, or engine issue. A technician will assess it on-site.', urgency: 'Medium', icon: 'search-outline', price: '₹200–₹500' },
  'warning-light': { service: 'Diagnostic Scan + Towing', reason: 'Warning lights indicate engine, transmission, or ABS faults. Needs OBD scan at a garage.', urgency: 'High', icon: 'build-outline', price: '₹500–₹2,000' },
  'overheating':   { service: 'Emergency Towing', reason: 'Do NOT drive! Coolant leak or radiator failure. Stop immediately — we\'ll tow to nearest garage.', urgency: 'High', icon: 'thermometer-outline', price: '₹1,200–₹1,800' },
  'flat':          { service: 'Flat Tyre Change / Tow', reason: 'We\'ll change your spare on-site. If no spare, we tow to nearest tyre shop.', urgency: 'Medium', icon: 'disc-outline', price: '₹300–₹1,200' },
  'accident':      { service: 'Accident Recovery Towing', reason: 'Priority dispatch for accident recovery. We handle police documentation support too.', urgency: 'High', icon: 'shield-outline', price: '₹1,500–₹3,500' },
  'out-of-fuel':   { service: 'Fuel Delivery (5L)', reason: 'We\'ll deliver 5L of petrol/diesel to your location so you can get to the nearest station.', urgency: 'Low', icon: 'water-outline', price: '₹150 + fuel cost' },
  'locked-out':    { service: 'Vehicle Lockout Support', reason: 'Our technician will help unlock your vehicle without any damage to the door or lock.', urgency: 'Low', icon: 'key-outline', price: '₹400–₹800' },
};

// ─── Chat Messages ───────────────────────────────────────────
type ChatMsg = { from: 'ai' | 'user'; text: string; options?: string[] };

const INITIAL_MESSAGES: ChatMsg[] = [
  {
    from: 'ai',
    text: "Hi! I'm Omni AI 🤖 — your vehicle assistant. What's happening with your vehicle right now?",
    options: SYMPTOMS.map(s => s.label),
  },
];

// ─── Component ───────────────────────────────────────────────
export default function AIAssistantScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [messages, setMessages]         = useState<ChatMsg[]>(INITIAL_MESSAGES);
  const [input, setInput]               = useState('');
  const [recommendation, setRecommendation] = useState<typeof RECOMMENDATIONS[string] | null>(null);
  const [symptomKey, setSymptomKey]     = useState<string | null>(null);
  const [isTyping, setIsTyping]         = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const typingDots = useRef(new Animated.Value(0)).current;

  // Typing dots animation
  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingDots, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(typingDots, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isTyping]);

  const addUserMsg = (text: string) => {
    setMessages(prev => [...prev, { from: 'user', text }]);
  };

  const addAIMsg = (msg: ChatMsg) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, msg]);
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 1000);
  };

  const handleOptionTap = (option: string) => {
    addUserMsg(option);
    // Map option label to symptom id
    const sym = SYMPTOMS.find(s => s.label === option);
    if (sym) {
      setSymptomKey(sym.id);
      const rec = RECOMMENDATIONS[sym.id];
      setRecommendation(rec);

      addAIMsg({
        from: 'ai',
        text: `Got it — **${option}**. Based on what you've described, here's what I recommend:`,
      });
    } else {
      addAIMsg({
        from: 'ai',
        text: "I'll need a bit more info. Can you describe what's happening in your own words?",
      });
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    addUserMsg(text);
    addAIMsg({
      from: 'ai',
      text: "Thanks for the details! I've noted this. Our team will look into it when a driver is assigned. Would you like to book roadside assistance?",
    });
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setRecommendation(null);
    setSymptomKey(null);
  };

  const urgencyColor = { High: '#FF4D4D', Medium: '#FFD60A', Low: '#00FF97' };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 48) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Omni AI</Text>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
          <Ionicons name="refresh-outline" size={20} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.chatScroll, { paddingBottom: recommendation ? 260 : 90 }]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, i) => (
          <View key={i}>
            {/* Bubble */}
            <View style={[styles.msgRow, msg.from === 'user' && styles.msgRowUser]}>
              {msg.from === 'ai' && (
                <View style={styles.aiAvatar}>
                  <Text style={styles.aiAvatarText}>AI</Text>
                </View>
              )}
              <View style={[styles.bubble, msg.from === 'user' && styles.bubbleUser]}>
                <Text style={[styles.bubbleText, msg.from === 'user' && styles.bubbleTextUser]}>
                  {msg.text}
                </Text>
              </View>
            </View>
            {/* Quick Options */}
            {msg.options && (
              <View style={styles.optionsGrid}>
                {msg.options.map((opt, j) => {
                  const sym = SYMPTOMS.find(s => s.label === opt);
                  return (
                    <TouchableOpacity key={j} style={styles.optionChip} onPress={() => handleOptionTap(opt)} activeOpacity={0.8}>
                      {sym && <Ionicons name={sym.icon as any} size={14} color={theme.colors.primary} />}
                      <Text style={styles.optionChipText}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <View style={styles.msgRow}>
            <View style={styles.aiAvatar}>
              <Text style={styles.aiAvatarText}>AI</Text>
            </View>
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>typing...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Recommendation Card */}
      {recommendation && !isTyping && (
        <View style={styles.recWrapper}>
          <BlurView intensity={30} tint="dark" style={styles.recCard}>
            <View style={styles.recTop}>
              <View style={[styles.urgencyBadge, { backgroundColor: `${urgencyColor[recommendation.urgency]}18`, borderColor: `${urgencyColor[recommendation.urgency]}35` }]}>
                <Text style={[styles.urgencyText, { color: urgencyColor[recommendation.urgency] }]}>{recommendation.urgency} Priority</Text>
              </View>
              <Text style={styles.recPrice}>{recommendation.price}</Text>
            </View>
            <View style={styles.recServiceRow}>
              <Ionicons name={recommendation.icon as any} size={20} color={theme.colors.primary} />
              <Text style={styles.recService}>{recommendation.service}</Text>
            </View>
            <Text style={styles.recReason}>{recommendation.reason}</Text>
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => { router.back(); router.push('/booking/schedule-tow'); }}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#00FF97', '#00CC7A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bookBtnGrad}>
                <Ionicons name="flash" size={18} color="#000" />
                <Text style={styles.bookBtnText}>Book This Service</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </View>
      )}

      {/* Input */}
      {!recommendation && (
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom + 8, 16) }]}>
          <TextInput
            style={styles.input}
            placeholder="Describe your problem..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity onPress={handleSend} style={[styles.sendBtn, !input.trim() && { opacity: 0.4 }]} disabled={!input.trim()} activeOpacity={0.85}>
            <Ionicons name="send" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#050810' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  backBtn:        { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerCenter:   { alignItems: 'center' },
  headerTitle:    { fontFamily: 'Outfit_700Bold', fontSize: 18, color: '#fff' },
  onlineBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot:      { width: 7, height: 7, borderRadius: 4, backgroundColor: '#00FF97' },
  onlineText:     { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#00FF97' },
  resetBtn:       { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },

  chatScroll:     { paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  msgRow:         { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 },
  msgRowUser:     { flexDirection: 'row-reverse' },
  aiAvatar:       { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,207,255,0.12)', borderWidth: 1, borderColor: 'rgba(0,207,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  aiAvatarText:   { fontFamily: 'Outfit_700Bold', fontSize: 9, color: theme.colors.primary },
  bubble:         { maxWidth: '78%', backgroundColor: 'rgba(13,20,32,0.8)', borderRadius: 18, borderBottomLeftRadius: 4, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  bubbleUser:     { backgroundColor: 'rgba(0,207,255,0.12)', borderRadius: 18, borderBottomRightRadius: 4, borderColor: 'rgba(0,207,255,0.2)' },
  bubbleText:     { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  bubbleTextUser: { color: '#fff' },

  optionsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingLeft: 40, marginBottom: 8 },
  optionChip:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100, backgroundColor: 'rgba(0,207,255,0.08)', borderWidth: 1, borderColor: 'rgba(0,207,255,0.2)' },
  optionChipText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  recWrapper:     { position: 'absolute', bottom: 0, left: 0, right: 0 },
  recCard:        { borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', padding: 20, gap: 12, borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(0,207,255,0.2)', backgroundColor: 'rgba(10,16,28,0.97)' },
  recTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  urgencyBadge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
  urgencyText:    { fontFamily: 'Outfit_700Bold', fontSize: 11, letterSpacing: 0.5 },
  recPrice:       { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#00FF97' },
  recServiceRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recService:     { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#fff' },
  recReason:      { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 18 },
  bookBtn:        { borderRadius: 100, overflow: 'hidden', shadowColor: '#00FF97', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  bookBtnGrad:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  bookBtnText:    { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000' },

  inputBar:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 12, backgroundColor: 'rgba(5,8,16,0.97)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  input:          { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 100, paddingHorizontal: 18, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sendBtn:        { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
});
