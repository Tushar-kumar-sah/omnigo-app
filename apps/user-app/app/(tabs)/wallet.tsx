import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { walletTransactions, currentUser } from '../../constants/mock-data';

export default function WalletScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />

      <View style={[styles.headerArea, { paddingTop: Math.max(insets.top + 10, 44) }]}>
        <Text style={styles.headerTitle}>Wallet & History</Text>
        <Text style={styles.headerSubtitle}>Manage balance, credits & payments</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {/* Main Balance Frosted Glass Card */}
        <View style={styles.balanceCardTouch}>
          <BlurView intensity={85} tint="dark" style={styles.balanceCard}>
            <LinearGradient
              colors={['rgba(0, 207, 255, 0.25)', 'rgba(0, 255, 151, 0.10)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={styles.balanceLabel}>Current Wallet Balance</Text>
            <Text style={styles.balanceText}>₹{currentUser.walletBalance}</Text>
            <TouchableOpacity style={styles.addMoneyBtnTouch} activeOpacity={0.8}>
              <LinearGradient colors={['#00CFFF', '#00FF97']} style={styles.addMoneyBtn}>
                <Ionicons name="add-circle-outline" size={18} color="#000000" style={{ marginRight: 6 }} />
                <Text style={styles.addMoneyText}>Add Money</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </View>

        <Text style={styles.subHeader}>Recent Transactions</Text>

        {walletTransactions.map((t) => (
          <View key={t.id} style={styles.txCardTouch}>
            <BlurView intensity={85} tint="dark" style={styles.txCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.08)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor:
                      t.type === 'credit'
                        ? 'rgba(0, 255, 151, 0.15)'
                        : 'rgba(255, 59, 48, 0.15)',
                  },
                ]}
              >
                <Ionicons
                  name={t.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                  size={20}
                  color={t.type === 'credit' ? '#00FF97' : '#FF3B30'}
                />
              </View>
              <View style={styles.txDetails}>
                <Text style={styles.txTitle}>{t.title}</Text>
                <Text style={styles.txDate}>{t.date}</Text>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  { color: t.type === 'credit' ? '#00FF97' : '#FF3B30' },
                ]}
              >
                {t.type === 'credit' ? '+' : '-'}₹{Math.abs(t.amount)}
              </Text>
            </BlurView>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050810' },
  headerArea: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 26, color: '#FFFFFF' },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255, 255, 255, 0.65)', marginTop: 4 },
  list: { padding: 16, paddingBottom: 120 },
  balanceCardTouch: { marginBottom: 24, borderRadius: 24, overflow: 'hidden' },
  balanceCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(10, 28, 60, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    overflow: 'hidden',
  },
  balanceLabel: { color: 'rgba(255, 255, 255, 0.65)', fontFamily: 'Inter_400Regular', fontSize: 13, marginBottom: 6 },
  balanceText: { color: '#FFFFFF', fontFamily: 'Outfit_700Bold', fontSize: 42, marginBottom: 16 },
  addMoneyBtnTouch: { borderRadius: 16, overflow: 'hidden' },
  addMoneyBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 16 },
  addMoneyText: { color: '#000000', fontFamily: 'Outfit_700Bold', fontSize: 14 },
  subHeader: { fontFamily: 'Outfit_600SemiBold', fontSize: 18, color: '#FFFFFF', marginBottom: 14 },
  txCardTouch: { marginBottom: 12, borderRadius: 20, overflow: 'hidden' },
  txCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(14, 24, 48, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  iconBox: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  txDetails: { flex: 1 },
  txTitle: { color: '#FFFFFF', fontFamily: 'Outfit_600SemiBold', fontSize: 15 },
  txDate: { color: 'rgba(255, 255, 255, 0.55)', fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  txAmount: { fontFamily: 'Outfit_700Bold', fontSize: 16 },
});
