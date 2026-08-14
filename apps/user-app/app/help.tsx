import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, UIManager, LayoutAnimation } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_DATA = [
  { id: '1', question: 'How do I book a tow?', answer: '1. Enter your pickup and drop-off locations.\n2. Select your vehicle type.\n3. Choose the service required.\n4. Confirm your booking.\nA nearby driver will be assigned immediately.' },
  { id: '2', question: 'What are the pricing rates?', answer: 'Our standard base fare is ₹500, which covers the first 5km. After that, it is ₹15 per km. Additional charges may apply for specialized recovery equipment.' },
  { id: '3', question: 'How do I cancel a booking?', answer: 'You can cancel your booking for free within 2 minutes of confirmation. After 2 minutes, a standard cancellation fee of ₹150 will be charged.' },
  { id: '4', question: 'What payment methods are accepted?', answer: 'We accept all major UPI apps (GPay, PhonePe, Paytm), Credit/Debit Cards, Cash on delivery, and the integrated OmniGo Wallet.' },
  { id: '5', question: 'How does Emergency SOS work?', answer: 'Pressing the SOS button alerts our 24/7 monitoring center and automatically dispatches the nearest priority tow truck to your exact GPS coordinates.' },
  { id: '6', question: 'How to track my tow truck?', answer: 'Once a driver accepts your request, you can see their real-time location, route, and estimated time of arrival (ETA) on the live map in the app.' },
];

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.5)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Quick Contact Cards */}
        <View style={styles.quickContactContainer}>
          <TouchableOpacity style={styles.contactCard} activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(0, 255, 151, 0.15)' }]}>
              <Ionicons name="call" size={22} color="#00FF97" />
            </View>
            <Text style={styles.contactTitle} numberOfLines={1}>Call Support</Text>
            <Text style={styles.contactSubtitle} numberOfLines={1}>24/7 Helpline</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(0, 207, 255, 0.15)' }]}>
              <Ionicons name="mail" size={22} color="#00CFFF" />
            </View>
            <Text style={styles.contactTitle} numberOfLines={1}>Email Us</Text>
            <Text style={styles.contactSubtitle} numberOfLines={1}>support@omnigo.in</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 214, 10, 0.15)' }]}>
              <Ionicons name="chatbubbles" size={22} color="#FFD60A" />
            </View>
            <Text style={styles.contactTitle} numberOfLines={1}>Live Chat</Text>
            <Text style={styles.contactSubtitle} numberOfLines={1}>Chat Now</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        <View style={styles.faqContainer}>
          {FAQ_DATA.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.faqItem, isExpanded && styles.faqItemExpanded]}
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQuestion, isExpanded && { color: '#00CFFF' }]}>
                    {item.question}
                  </Text>
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={isExpanded ? "#00CFFF" : "rgba(255, 255, 255, 0.7)"} 
                  />
                </View>
                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Emergency Banner */}
        <TouchableOpacity style={styles.emergencyCard}>
          <View style={styles.emergencyIconContainer}>
            <Ionicons name="warning" size={28} color="#FF3B30" />
          </View>
          <View style={styles.emergencyTextContainer}>
            <Text style={styles.emergencyTitle}>Emergency? Call 112</Text>
            <Text style={styles.emergencySubtitle}>National Emergency Helpline</Text>
          </View>
          <Ionicons name="call" size={24} color="#FF3B30" />
        </TouchableOpacity>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  quickContactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  contactCard: {
    flex: 1,
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 2,
    textAlign: 'center',
  },
  contactSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  faqContainer: {
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  faqItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  faqItemExpanded: {
    backgroundColor: 'rgba(0, 207, 255, 0.05)',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
    paddingRight: 16,
  },
  faqAnswerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  faqAnswer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 59, 48, 0.5)',
  },
  emergencyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emergencyTextContainer: {
    flex: 1,
  },
  emergencyTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
