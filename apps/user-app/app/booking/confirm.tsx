import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

export default function BookingConfirmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [selectedPayment, setSelectedPayment] = useState('UPI');
  const [promoCode, setPromoCode] = useState('');

  const paymentMethods = [
    { id: 'UPI', icon: 'qrcode-scan', title: 'UPI (GPay, PhonePe)' },
    { id: 'Card', icon: 'credit-card-outline', title: 'Credit / Debit Card' },
    { id: 'Cash', icon: 'cash', title: 'Cash on Delivery' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />
      
      <View style={[styles.inner, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Booking</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDotCompleted} />
          <View style={styles.progressLineCompleted} />
          <View style={styles.progressDotCompleted} />
          <View style={styles.progressLineCompleted} />
          <View style={styles.progressDotActive} />
          <View style={styles.progressLinePending} />
          <View style={styles.progressDotPending} />
        </View>
        <Text style={styles.stepText}>Step 3 of 4</Text>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          
          {/* Booking Summary */}
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.glassCard}>
            <View style={styles.serviceRow}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="tow-truck" size={24} color="#00CFFF" />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceTitle}>Flatbed Tow</Text>
                <Text style={styles.vehicleText}>Maruti Suzuki Swift Dzire</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.locationContainer}>
              <View style={styles.locationLine}>
                <View style={styles.dotGreen} />
                <View style={styles.dashedLine} />
                <View style={styles.dotRed} />
              </View>
              <View style={styles.locationDetails}>
                <View style={styles.locationBox}>
                  <Text style={styles.locationLabel}>Pickup</Text>
                  <Text style={styles.locationAddress} numberOfLines={1}>123, MG Road, Andheri West</Text>
                </View>
                <View style={{ height: 24 }} />
                <View style={styles.locationBox}>
                  <Text style={styles.locationLabel}>Drop-off</Text>
                  <Text style={styles.locationAddress} numberOfLines={1}>AutoFix Garage, Bandra</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Fare Breakdown */}
          <Text style={styles.sectionTitle}>Fare Breakdown</Text>
          <View style={styles.glassCard}>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Base Fare</Text>
              <Text style={styles.fareValue}>₹500</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Distance (8.5 km × ₹15)</Text>
              <Text style={styles.fareValue}>₹128</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Platform Fee</Text>
              <Text style={styles.fareValue}>₹25</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>GST (18%)</Text>
              <Text style={styles.fareValue}>₹117</Text>
            </View>
            <View style={[styles.divider, { marginVertical: 12 }]} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹770</Text>
            </View>
          </View>

          {/* Promo Code */}
          <View style={styles.promoContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Promo Code"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={promoCode}
              onChangeText={setPromoCode}
            />
            <TouchableOpacity style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>

          {/* Payment Method */}
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentContainer}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentOption,
                  selectedPayment === method.id && styles.paymentOptionSelected
                ]}
                onPress={() => setSelectedPayment(method.id)}
                activeOpacity={0.7}
              >
                <View style={styles.paymentIconBox}>
                  <MaterialCommunityIcons 
                    name={method.icon as any} 
                    size={22} 
                    color={selectedPayment === method.id ? '#00CFFF' : '#FFF'} 
                  />
                </View>
                <Text style={styles.paymentTitle}>{method.title}</Text>
                <View style={styles.radioOutline}>
                  {selectedPayment === method.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Footer Action */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => router.push('/booking/tracking')}
          >
            <LinearGradient
              colors={['#00CFFF', '#00FF97']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmBtn}
            >
              <Text style={styles.confirmBtnText}>CONFIRM & FIND DRIVER</Text>
              <Ionicons name="search" size={20} color="#050810" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
  },
  inner: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 20,
    color: '#FFF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 10,
    marginBottom: 5,
  },
  progressDotCompleted: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00FF97',
    shadowColor: '#00FF97',
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  progressDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00CFFF',
    borderWidth: 2,
    borderColor: '#050810',
    shadowColor: '#00CFFF',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  progressDotPending: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressLineCompleted: {
    flex: 1,
    height: 2,
    backgroundColor: '#00FF97',
    marginHorizontal: 4,
  },
  progressLinePending: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 4,
  },
  stepText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#00CFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 18,
    color: '#FFF',
    marginBottom: 12,
    marginTop: 8,
  },
  glassCard: {
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#00CFFF',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 18,
    color: '#FFF',
  },
  vehicleText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  locationContainer: {
    flexDirection: 'row',
  },
  locationLine: {
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 6,
  },
  dotGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00FF97',
  },
  dashedLine: {
    width: 2,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
    marginVertical: 4,
  },
  dotRed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
  },
  locationDetails: {
    flex: 1,
  },
  locationBox: {
    justifyContent: 'center',
  },
  locationLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  locationAddress: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#FFF',
    marginTop: 4,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fareLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  fareValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#FFF',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 18,
    color: '#FFF',
  },
  totalValue: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: '#00FF97',
  },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
  },
  promoInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#FFF',
    height: '100%',
  },
  applyBtn: {
    backgroundColor: 'rgba(0, 207, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyBtnText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#00CFFF',
  },
  paymentContainer: {
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: '#00CFFF',
    backgroundColor: 'rgba(0, 207, 255, 0.05)',
  },
  paymentIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentTitle: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#FFF',
  },
  radioOutline: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00CFFF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: 'rgba(5, 8, 16, 0.9)',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
  },
  confirmBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#050810',
    marginRight: 8,
  },
});
