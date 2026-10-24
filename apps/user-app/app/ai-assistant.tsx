import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

// ─── Problem Detection Tree ──────────────────────────────────
const SYMPTOMS = [
  { id: 'wont-start',    label: "Car won't start",   icon: 'key-outline' },
  { id: 'strange-sound', label: 'Strange noise',      icon: 'volume-high-outline' },
  { id: 'warning-light', label: 'Warning light on',   icon: 'warning-outline' },
  { id: 'overheating',   label: 'Overheating',        icon: 'thermometer-outline' },
  { id: 'flat',          label: 'Flat tyre',          icon: 'disc-outline' },
  { id: 'accident',      label: 'Had an accident',    icon: 'car-sport-outline' },
  { id: 'out-of-fuel',   label: 'Out of fuel',        icon: 'water-outline' },
  { id: 'locked-out',    label: 'Locked out',         icon: 'lock-closed-outline' },
];

type ActionButton = {
  label: string;
  route: string;
};

type ChatMsg = {
  from: 'ai' | 'user';
  text: string;
  options?: string[];
  actionBtn?: ActionButton;
  urgency?: 'High' | 'Medium' | 'Low';
};

const INITIAL_MESSAGES: ChatMsg[] = [
  {
    from: 'ai',
    text: "Hi! I'm Omni AI 🤖 — your 24/7 intelligent rescue and vehicle assistant.\n\nWhat's happening with your vehicle right now? Tap a problem below or describe your issue in your own words:",
    options: SYMPTOMS.map((s) => s.label),
  },
];

// ─── Direct Button Taps (Towing Directives) ──────────────────
const SYMPTOM_RESPONSES: Record<
  string,
  {
    diagnosis: string;
    directive: string;
    urgency: 'High' | 'Medium' | 'Low';
    actionLabel: string;
  }
> = {
  'wont-start': {
    diagnosis:
      "A vehicle that won't start is typically caused by a discharged 12V battery, faulty starter motor, or alternator failure. If you hear rapid clicking, the battery is dead. If it cranks freely without starting, fuel delivery or ignition has failed.",
    directive:
      "🚨 Immediate Action Recommended: Please book our tow service directly right now. Our nearest driver partner is on standby and will reach you with jumpstart boosters or a flatbed to safely transport your car to a verified workshop.",
    urgency: 'High',
    actionLabel: 'Book Tow Service Directly',
  },
  'strange-sound': {
    diagnosis:
      "Unusual noises signal critical mechanical wear:\n• High-pitched squeal: Worn brake pads or loose serpentine belt.\n• Deep grinding: Metal-on-metal brake contact or failing wheel bearing.\n• Metallic knocking: Low engine oil or internal rod bearing wear.\n• Clunking: Damaged suspension strut or ball joint.",
    directive:
      "🚨 Immediate Action Recommended: Driving with abnormal mechanical noises risks sudden axle or engine failure. Please book our tow service directly now so a qualified flatbed can transport your car safely.",
    urgency: 'High',
    actionLabel: 'Book Tow Service Directly',
  },
  'warning-light': {
    diagnosis:
      "Dashboard indicators denote safety status:\n• 🔴 Red Lights (Oil, Battery, Temp, Brake): Critical emergency! Pull over and turn off the engine immediately.\n• 🟡 Amber Lights (Check Engine, ABS, Transmission): System malfunction requiring a professional OBD-II diagnostic scan.",
    directive:
      "🚨 Immediate Action Recommended: If you see red or flashing warning lights, do NOT drive further. Please book our tow service directly now for safe vehicle recovery to the nearest garage.",
    urgency: 'High',
    actionLabel: 'Book Tow Service Directly',
  },
  overheating: {
    diagnosis:
      "⚠️ CRITICAL HAZARD: Overheating can warp cylinder heads or cause complete engine seizure within minutes!\n1. Turn off AC and switch cabin heat to maximum to bleed engine heat.\n2. Pull over to the shoulder safely and shut down the engine immediately.\n3. NEVER open the radiator pressure cap while hot — pressurized boiling coolant causes severe burns!",
    directive:
      "🚨 Immediate Action Recommended: Please book our tow service directly right now. An emergency flatbed tow truck will be dispatched immediately to transport your car.",
    urgency: 'High',
    actionLabel: 'Book Emergency Flatbed Tow',
  },
  flat: {
    diagnosis:
      "Driving on a flat tyre ruins the alloy rim and suspension. Pull safely to the highway shoulder, switch on hazard lights, and position yourself away from traffic.",
    directive:
      "🚨 Immediate Action Recommended: If you lack a working spare, are on a busy road, or need on-site assistance, please book our tow service directly now. We'll dispatch a rescue truck for on-site tyre replacement or towing.",
    urgency: 'Medium',
    actionLabel: 'Book Tow Service Directly',
  },
  accident: {
    diagnosis:
      "🚨 PRIORITY EMERGENCY PROTOCOL:\n1. Switch off vehicle ignition immediately.\n2. Check all passengers for injuries. Call 112 if anyone needs medical assistance.\n3. Turn on hazard blinkers and step safely behind highway crash barriers.\n4. Take clear photos of vehicle positions and license plates for insurance claims.",
    directive:
      "🚨 Immediate Action Recommended: Please book our tow service directly right now. We give priority dispatch to accident vehicles and assist with insurance documentation and authorized garage drop-offs.",
    urgency: 'High',
    actionLabel: 'Book Priority Accident Tow',
  },
  'out-of-fuel': {
    diagnosis:
      "Running out of fuel can overheat the submerged electric fuel pump and draw tank sediment into your injectors. Avoid prolonged starter cranking.",
    directive:
      "🚨 Immediate Action Recommended: Please book our service directly now. We will dispatch 5L of emergency fuel (petrol/diesel) or a tow truck to bring your vehicle to the nearest fuel station.",
    urgency: 'Low',
    actionLabel: 'Book Fuel Assistance / Tow',
  },
  'locked-out': {
    diagnosis:
      "Keys locked inside or key fob battery depleted. Do not attempt to force window seals or pry door frames, as this causes costly weatherstripping and lock motor damage.",
    directive:
      "🚨 Immediate Action Recommended: Please book our service directly right now. A certified technician with specialized non-destructive vehicle entry tools will be dispatched to safely unlock your car.",
    urgency: 'Low',
    actionLabel: 'Book Lockout Service Directly',
  },
};

// ─── Query Knowledge Engine (Technical & Non-Technical) ───────
function getKnowledgeResponse(input: string): { text: string; actionBtn?: ActionButton; urgency?: 'High' | 'Medium' | 'Low' } {
  const query = input.toLowerCase().trim();

  // 1. Pricing & Fares
  if (
    query.includes('price') ||
    query.includes('cost') ||
    query.includes('fare') ||
    query.includes('rate') ||
    query.includes('charge') ||
    query.includes('fee') ||
    query.includes('how much') ||
    query.includes('bill') ||
    query.includes('expensive')
  ) {
    return {
      text:
        "💰 **Transparent Pricing on OmniGo:**\n\n• **Base Fare:** Starts from **₹350** + transparent per-km rate based on vehicle category (Hatchback, Sedan, SUV, Heavy).\n• **Upfront Estimates:** Exact fares are calculated before you confirm your booking — zero hidden charges.\n• **Waiting Time:** First 5 minutes are 100% complimentary; subsequent waiting is ₹10/min.\n• **No-Show Fee:** ₹150 cancellation fee applies only if driver arrives and customer is unreachable after 5 minutes.\n\nWould you like to book a tow truck now?",
      actionBtn: { label: 'Book Tow Service Directly', route: '/booking/select-vehicle' },
      urgency: 'Low',
    };
  }

  // 2. Payment Methods
  if (
    query.includes('payment') ||
    query.includes('pay') ||
    query.includes('upi') ||
    query.includes('cash') ||
    query.includes('card') ||
    query.includes('gpay') ||
    query.includes('phonepe') ||
    query.includes('paytm') ||
    query.includes('wallet')
  ) {
    return {
      text:
        "💳 **Accepted Payment Methods:**\n\n• **UPI:** Instant payment via Google Pay, PhonePe, Paytm, or BHIM.\n• **Cards:** Visa, MasterCard, RuPay, and American Express via 256-bit secure gateway.\n• **Cash on Delivery:** Pay directly to the driver partner upon drop-off.\n• **OmniGo In-App Wallet:** 1-tap instant payment and instant cancellation refunds.",
      actionBtn: { label: 'Book Tow Service Directly', route: '/booking/select-vehicle' },
      urgency: 'Low',
    };
  }

  // 3. ETA & Arrival Time
  if (
    query.includes('eta') ||
    query.includes('how long') ||
    query.includes('when will') ||
    query.includes('arrival') ||
    query.includes('reach') ||
    query.includes('time take') ||
    query.includes('minutes') ||
    query.includes('fast')
  ) {
    return {
      text:
        "⏱️ **Rapid Dispatch & ETA:**\n\n• **Driver Matching:** Assigned within **60 to 120 seconds**.\n• **Average Arrival Time:** **12 to 18 minutes** across city zones and expressways.\n• **Live Tracking:** You will see the driver's live GPS location, truck number, and exact route moving towards you on the map.",
      actionBtn: { label: 'Book Tow Service Directly', route: '/booking/select-vehicle' },
      urgency: 'Medium',
    };
  }

  // 4. Cancellation & Refunds
  if (
    query.includes('cancel') ||
    query.includes('cancellation') ||
    query.includes('refund') ||
    query.includes('change mind')
  ) {
    return {
      text:
        "🔄 **Cancellation & Refund Policy:**\n\n• **Free Cancellation:** You can cancel 100% free within **2 minutes** of a driver being assigned.\n• If cancelled after the driver has traveled significant distance, a nominal compensation fee is deducted to cover partner fuel.\n• Pre-paid amounts are refunded instantly to your OmniGo Wallet or within 24–48 hours to your original bank/UPI account.",
      urgency: 'Low',
    };
  }

  // 5. Electric Vehicle (EV)
  if (
    query.includes('ev') ||
    query.includes('electric') ||
    query.includes('tesla') ||
    query.includes('nexon') ||
    query.includes('battery empty') ||
    query.includes('range')
  ) {
    return {
      text:
        "⚡ **Specialized Electric Vehicle (EV) Towing:**\n\n• **SAFETY WARNING:** EVs must NEVER be towed with wheels on the road, as regenerative motors generate high voltage that destroys vehicle electronics!\n• OmniGo automatically dispatches **Hydraulic Flatbed Tow Trucks** for EVs where the car is fully lifted and secured.\n• We also support 12V auxiliary battery jumpstarts if your EV doors or screens won't turn on.",
      actionBtn: { label: 'Book Flatbed Tow for EV', route: '/booking/select-vehicle' },
      urgency: 'High',
    };
  }

  // 6. Overheating & Coolant
  if (
    query.includes('overheat') ||
    query.includes('coolant') ||
    query.includes('radiator') ||
    query.includes('steam') ||
    query.includes('hot engine')
  ) {
    return {
      text:
        "🌡️ **Engine Overheating Advice:**\n\n• **DO NOT open the radiator cap** — boiling coolant will spray under high pressure and cause severe burns!\n• Turn on cabin heating to maximum to bleed engine heat, pull over, and shut off the engine.\n\n🚨 **Immediate Action:** Driving with high temperature will warp your engine block. Please book our tow service directly now.",
      actionBtn: { label: 'Book Tow Service Directly', route: '/booking/select-vehicle' },
      urgency: 'High',
    };
  }

  // 7. Dead Battery / Jumpstart
  if (
    query.includes('battery') ||
    query.includes('jumpstart') ||
    query.includes('jump start') ||
    query.includes('starter') ||
    query.includes('crank') ||
    query.includes('clicking')
  ) {
    return {
      text:
        "🔋 **Battery & Starting Diagnosis:**\n\n• Rapid clicking sound when turning key: Depleted 12V battery.\n• No lights or sound at all: Loose battery terminal or dead cell.\n• Cranks fast but won't start: Fuel pump or ignition problem.\n\n🚨 **Immediate Action:** We provide on-site heavy-duty battery jumpstarts or towing to your trusted mechanic. Book our tow service directly now.",
      actionBtn: { label: 'Book Tow Service Directly', route: '/booking/select-vehicle' },
      urgency: 'High',
    };
  }

  // 8. Brakes / Soft Pedal
  if (
    query.includes('brake') ||
    query.includes('stopping') ||
    query.includes('pedal') ||
    query.includes('pad') ||
    query.includes('abs')
  ) {
    return {
      text:
        "🛑 **Brake System Hazard:**\n\n• A spongy or sinking brake pedal indicates brake fluid loss or air in the lines.\n• Metal grinding sounds indicate completely worn pads contacting the brake disc rotor.\n\n🚨 **Immediate Action:** Driving with compromised brakes is dangerous to your life. Stop immediately and book our tow service directly now.",
      actionBtn: { label: 'Book Tow Service Directly', route: '/booking/select-vehicle' },
      urgency: 'High',
    };
  }

  // 9. Tyre / Flat / Puncture
  if (
    query.includes('tyre') ||
    query.includes('tire') ||
    query.includes('puncture') ||
    query.includes('flat') ||
    query.includes('stepney')
  ) {
    return {
      text:
        "🛞 **Tyre Puncture & Replacement:**\n\n• Driving even 50 meters on a flat tyre ruins both the rubber sidewall and alloy wheel rim.\n• Our partners arrive equipped with hydraulic jacks and torque wrenches to fit your spare wheel on-site.\n• If you do not have a working spare, we tow your vehicle to the nearest tyre workshop.",
      actionBtn: { label: 'Book Tow Service Directly', route: '/booking/select-vehicle' },
      urgency: 'Medium',
    };
  }

  // 10. Smoke or Burning Smell
  if (
    query.includes('smoke') ||
    query.includes('burning') ||
    query.includes('fire') ||
    query.includes('smell') ||
    query.includes('fumes')
  ) {
    return {
      text:
        "⚠️ **Smoke & Burning Hazard Protocol:**\n\n• **White sweet-smelling smoke:** Coolant leak or head gasket breach.\n• **Blueish-grey smoke:** Burning engine oil.\n• **Acrid burning plastic smell:** Electrical wiring short-circuit.\n\n🚨 **Safety First:** Evacuate passengers behind the highway barrier. Please book our tow service directly now for emergency flatbed recovery.",
      actionBtn: { label: 'Book Tow Service Directly', route: '/booking/select-vehicle' },
      urgency: 'High',
    };
  }

  // 11. Safety & Highway Protocol
  if (
    query.includes('safe') ||
    query.includes('highway') ||
    query.includes('sos') ||
    query.includes('police') ||
    query.includes('emergency')
  ) {
    return {
      text:
        "🛡️ **Highway Breakdown Safety Steps:**\n\n1. Turn on vehicle hazard blinkers.\n2. Park as far left on the shoulder as possible.\n3. Exit the vehicle from the passenger side and stand safely behind the highway crash barrier.\n4. Use the in-app **SOS** button for immediate emergency helpline dispatch.",
      actionBtn: { label: 'Book Tow Service Directly', route: '/booking/select-vehicle' },
      urgency: 'High',
    };
  }

  // 12. Support & Contact Information
  if (
    query.includes('support') ||
    query.includes('contact') ||
    query.includes('phone') ||
    query.includes('call') ||
    query.includes('helpline') ||
    query.includes('human') ||
    query.includes('agent') ||
    query.includes('number') ||
    query.includes('customer care')
  ) {
    return {
      text:
        "📞 **OmniGo 24/7 Customer Support:**\n\n• **Direct Phone Helpline:** +91 7569743173\n• **Email Support:** info@omnigo.si\n• **In-App SOS:** Available anytime via the bottom SOS tab.",
      actionBtn: { label: 'Book Tow Service Directly', route: '/booking/select-vehicle' },
      urgency: 'Low',
    };
  }

  // 13. Invoices & Receipts
  if (
    query.includes('invoice') ||
    query.includes('receipt') ||
    query.includes('gst') ||
    query.includes('tax')
  ) {
    return {
      text:
        "📄 **Tax Invoices & Receipts:**\n\n• A GST-compliant digital invoice is automatically generated for every completed booking.\n• To view or download: Open the **Bookings** tab at the bottom $\rightarrow$ Tap your completed trip $\rightarrow$ Tap **Download Invoice PDF**.\n• A copy is also sent to your registered email address.",
      urgency: 'Low',
    };
  }

  // 14. Greetings & General Help
  if (
    query === 'hi' ||
    query === 'hello' ||
    query === 'hey' ||
    query === 'help' ||
    query.includes('who are you') ||
    query.includes('what can you do')
  ) {
    return {
      text:
        "Hello! I'm **Omni AI 🤖**, your 24/7 intelligent vehicle diagnostic & rescue assistant.\n\nI can assist you with:\n1. Instant Vehicle Troubleshooting & Diagnostic Advice\n2. Direct Towing & Flatbed Dispatch Booking\n3. Fares, Payments & Real-Time Driver Tracking\n4. Highway Breakdown Safety & SOS Protocols\n\nHow can I help your vehicle right now?",
      actionBtn: { label: 'Book Tow Service Directly', route: '/booking/select-vehicle' },
      urgency: 'Low',
    };
  }

  // 15. Default Fallback
  return {
    text: `I've analyzed your question: "${input}".\n\nOur 24/7 roadside assistance network is active with nearby verified tow trucks and flatbeds ready to reach your location.\n\n🚨 **Recommended Action:** Please book our tow service directly below for immediate assistance, or feel free to ask any specific technical or booking questions!`,
    actionBtn: { label: 'Book Tow Service Directly', route: '/booking/select-vehicle' },
    urgency: 'Medium',
  };
}

// ─── Component ───────────────────────────────────────────────
export default function AIAssistantScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
    setMessages((prev) => [...prev, { from: 'user', text }]);
  };

  const addAIMsg = (msg: ChatMsg) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 600);
  };

  const handleOptionTap = (option: string) => {
    addUserMsg(option);
    const sym = SYMPTOMS.find((s) => s.label === option);

    if (sym && SYMPTOM_RESPONSES[sym.id]) {
      const resp = SYMPTOM_RESPONSES[sym.id];
      addAIMsg({
        from: 'ai',
        text: `Got it — **${option}**.\n\n${resp.diagnosis}\n\n${resp.directive}`,
        actionBtn: {
          label: resp.actionLabel,
          route: '/booking/select-vehicle',
        },
        urgency: resp.urgency,
      });
    } else {
      addAIMsg({
        from: 'ai',
        text: `Got it — **${option}**.\n\n🚨 Immediate Action Recommended: Please book our tow service directly right now so our nearest driver partner can reach your vehicle safely.`,
        actionBtn: {
          label: 'Book Tow Service Directly',
          route: '/booking/select-vehicle',
        },
        urgency: 'High',
      });
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    addUserMsg(text);

    const response = getKnowledgeResponse(text);
    addAIMsg({
      from: 'ai',
      text: response.text,
      actionBtn: response.actionBtn,
      urgency: response.urgency,
    });
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
  };

  const urgencyColors = {
    High: '#FF4D4D',
    Medium: '#FFD60A',
    Low: '#00FF97',
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 48) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Omni AI</Text>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleReset} style={styles.resetBtn} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.chatScroll, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, i) => (
          <View key={i} style={styles.messageBlock}>
            {/* Message Bubble Row */}
            <View style={[styles.msgRow, msg.from === 'user' && styles.msgRowUser]}>
              {msg.from === 'ai' && (
                <View style={styles.aiAvatar}>
                  <Text style={styles.aiAvatarText}>AI</Text>
                </View>
              )}
              <View style={[styles.bubble, msg.from === 'user' && styles.bubbleUser]}>
                {msg.urgency && (
                  <View
                    style={[
                      styles.urgencyPill,
                      {
                        backgroundColor: `${urgencyColors[msg.urgency]}18`,
                        borderColor: `${urgencyColors[msg.urgency]}40`,
                      },
                    ]}
                  >
                    <View
                      style={[styles.urgencyDot, { backgroundColor: urgencyColors[msg.urgency] }]}
                    />
                    <Text
                      style={[styles.urgencyPillText, { color: urgencyColors[msg.urgency] }]}
                    >
                      {msg.urgency} Priority
                    </Text>
                  </View>
                )}

                <Text style={[styles.bubbleText, msg.from === 'user' && styles.bubbleTextUser]}>
                  {msg.text}
                </Text>

                {/* In-Message Direct Booking Action Button */}
                {msg.actionBtn && (
                  <TouchableOpacity
                    style={styles.directBookBtn}
                    onPress={() => router.push(msg.actionBtn!.route as any)}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={['#00FF97', '#00CC7A']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.directBookGradient}
                    >
                      <Ionicons name="flash" size={17} color="#000000" />
                      <Text style={styles.directBookBtnText}>{msg.actionBtn.label}</Text>
                      <Ionicons name="arrow-forward" size={16} color="#000000" />
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Quick Option Buttons */}
            {msg.options && (
              <View style={styles.optionsGrid}>
                {msg.options.map((opt, j) => {
                  const sym = SYMPTOMS.find((s) => s.label === opt);
                  return (
                    <TouchableOpacity
                      key={j}
                      style={styles.optionChip}
                      onPress={() => handleOptionTap(opt)}
                      activeOpacity={0.8}
                    >
                      {sym && (
                        <Ionicons
                          name={sym.icon as any}
                          size={14}
                          color={theme.colors.primary}
                        />
                      )}
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
            <View style={[styles.bubble, { paddingVertical: 10, paddingHorizontal: 16 }]}>
              <Text style={[styles.bubbleText, { color: theme.colors.primary }]}>
                Omni AI is thinking...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Bar (Always Available) */}
      <View
        style={[
          styles.inputBar,
          { paddingBottom: Math.max(insets.bottom + 8, 16) },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="Describe your problem or ask anything..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[styles.sendBtn, !input.trim() && { opacity: 0.4 }]}
          disabled={!input.trim()}
          activeOpacity={0.85}
        >
          <Ionicons name="send" size={18} color="#000" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#fff',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#00FF97',
  },
  onlineText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#00FF97',
  },
  resetBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatScroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },
  messageBlock: {
    marginBottom: 4,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 6,
  },
  msgRowUser: {
    flexDirection: 'row-reverse',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,207,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0,207,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 9,
    color: theme.colors.primary,
  },
  bubble: {
    maxWidth: '84%',
    backgroundColor: 'rgba(13,20,32,0.92)',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bubbleUser: {
    backgroundColor: 'rgba(0,207,255,0.15)',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    borderColor: 'rgba(0,207,255,0.3)',
  },
  urgencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    borderWidth: 1,
    marginBottom: 8,
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  urgencyPillText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  bubbleText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 21,
  },
  bubbleTextUser: {
    color: '#fff',
  },
  directBookBtn: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#00FF97',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  directBookGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  directBookBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#000000',
    letterSpacing: 0.3,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingLeft: 40,
    marginTop: 4,
    marginBottom: 8,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: 'rgba(0,207,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,207,255,0.25)',
  },
  optionChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(5,8,16,0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 100,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
