import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

export default function MembershipScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />

      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membership</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.currentPlanContainer}>
          <Text style={styles.currentPlanText}>Your Current Plan:</Text>
          <View style={styles.currentPlanBadge}>
            <Text style={styles.currentPlanBadgeText}>Free Tier</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>Choose a plan that fits your towing needs</Text>

        {/* Basic Tier */}
        <View style={[styles.card, styles.basicCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Basic</Text>
            <Text style={styles.cardPrice}>Free</Text>
          </View>
          <Text style={styles.cardDuration}>Lifetime</Text>
          
          <View style={styles.featuresList}>
            <FeatureItem text="2 Free Tows/month" included={true} />
            <FeatureItem text="Standard Support" included={true} />
            <FeatureItem text="Basic Tracking" included={true} />
            <FeatureItem text="Cash & UPI Payment" included={true} />
            <FeatureItem text="No Priority Dispatch" included={false} />
            <FeatureItem text="No Surge Protection" included={false} />
          </View>
          
          <TouchableOpacity style={[styles.button, styles.disabledButton]} disabled={true}>
            <Text style={styles.disabledButtonText}>Current Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Pro Tier */}
        <View style={[styles.card, styles.proCard]}>
          <LinearGradient
            colors={['rgba(0, 207, 255, 0.1)', 'rgba(0, 207, 255, 0.05)', 'transparent']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.popularBadge}>
            <LinearGradient
              colors={['#00CFFF', '#00FF97']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.popularBadgeGradient}
            >
              <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitlePro}>Pro</Text>
            <Text style={styles.cardPricePro}>₹499<Text style={styles.cardPriceMo}>/mo</Text></Text>
          </View>
          
          <View style={styles.featuresList}>
            <FeatureItem text="5 Free Tows/month" included={true} />
            <FeatureItem text="24/7 Priority Support" included={true} />
            <FeatureItem text="Live GPS Tracking" included={true} />
            <FeatureItem text="Zero Surge Pricing" included={true} />
            <FeatureItem text="All Payment Methods" included={true} />
            <FeatureItem text="Trip Safety Reports" included={true} />
          </View>
          
          <TouchableOpacity style={styles.upgradeButton}>
            <LinearGradient
              colors={['#00CFFF', '#00FF97']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeButtonGradient}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Elite Tier */}
        <View style={[styles.card, styles.eliteCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitleElite}>Elite</Text>
            <Text style={styles.cardPriceElite}>₹999<Text style={styles.cardPriceMo}>/mo</Text></Text>
          </View>
          
          <View style={styles.featuresList}>
            <FeatureItem text="Unlimited Tows" included={true} />
            <FeatureItem text="Dedicated Driver" included={true} />
            <FeatureItem text="Premium 24/7 Support" included={true} />
            <FeatureItem text="Zero Surge + Discounts" included={true} />
            <FeatureItem text="Insurance Coverage" included={true} />
            <FeatureItem text="Priority Everything" included={true} />
            <FeatureItem text="Family Sharing (3 members)" included={true} />
          </View>
          
          <TouchableOpacity style={styles.upgradeButton}>
            <LinearGradient
              colors={['#FFD700', '#FF8C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeButtonGradient}
            >
              <Text style={styles.upgradeButtonTextElite}>Upgrade to Elite</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureItem({ text, included }: { text: string; included: boolean }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        {included ? (
          <Ionicons name="checkmark-circle" size={20} color="#00FF97" />
        ) : (
          <Ionicons name="close-circle" size={20} color="#FF3B30" />
        )}
      </View>
      <Text style={[styles.featureText, !included && styles.featureTextDisabled]}>{text}</Text>
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
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
    fontWeight: '600',
  },
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  currentPlanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(13, 20, 32, 0.6)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  currentPlanText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    marginRight: 10,
  },
  currentPlanBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  currentPlanBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  card: {
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  basicCard: {
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  proCard: {
    borderColor: '#00CFFF',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  eliteCard: {
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderBottomLeftRadius: 14,
    overflow: 'hidden',
  },
  popularBadgeGradient: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  popularBadgeText: {
    color: '#050810',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    flexShrink: 1,
  },
  cardTitlePro: {
    color: '#00CFFF',
    fontSize: 26,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 207, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    flexShrink: 1,
  },
  cardTitleElite: {
    color: '#FFD700',
    fontSize: 28,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
  },
  cardPrice: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Outfit_600SemiBold',
    fontWeight: '600',
  },
  cardPricePro: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
  },
  cardPriceElite: {
    color: '#FFFFFF',
    fontSize: 26,
    fontFamily: 'Outfit_700Bold',
    fontWeight: 'bold',
  },
  cardPriceMo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter_400Regular',
    fontWeight: 'normal',
  },
  cardDuration: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 20,
  },
  featuresList: {
    marginTop: 20,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  featureTextDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
    textDecorationLine: 'line-through',
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  disabledButtonText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  upgradeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  upgradeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonText: {
    color: '#050810',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    fontWeight: 'bold',
  },
  upgradeButtonTextElite: {
    color: '#050810',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    fontWeight: 'bold',
  },
});
