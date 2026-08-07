import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme, glassStyle } from '../../constants/theme';
import { walletTransactions, currentUser } from '../../constants/mock-data';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function WalletScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Wallet</Text>
      
      <LinearGradient colors={['rgba(0, 207, 255, 0.2)', 'transparent']} style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceText}>₹{currentUser.walletBalance}</Text>
      </LinearGradient>

      <Text style={styles.subHeader}>Recent Transactions</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {walletTransactions.map(t => (
          <View key={t.id} style={styles.txCard}>
            <View style={styles.iconBox}>
              <Ionicons name={t.type === 'credit' ? 'arrow-down' : 'arrow-up'} size={20} color={t.type === 'credit' ? theme.colors.secondary : theme.colors.danger} />
            </View>
            <View style={styles.txDetails}>
              <Text style={styles.txTitle}>{t.title}</Text>
              <Text style={styles.txDate}>{t.date}</Text>
            </View>
            <Text style={[styles.txAmount, { color: t.type === 'credit' ? theme.colors.secondary : theme.colors.danger }]}>
              {t.type === 'credit' ? '+' : '-'}₹{Math.abs(t.amount)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 60, paddingHorizontal: 20 },
  header: { fontFamily: 'Outfit_700Bold', fontSize: 28, color: theme.colors.text, marginBottom: 20 },
  balanceCard: { ...glassStyle, padding: 24, alignItems: 'center', marginBottom: 24 },
  balanceLabel: { color: theme.colors.textSecondary, fontFamily: 'Inter_400Regular', marginBottom: 8 },
  balanceText: { color: theme.colors.text, fontFamily: 'Outfit_700Bold', fontSize: 40 },
  subHeader: { fontFamily: 'Outfit_600SemiBold', fontSize: 20, color: theme.colors.text, marginBottom: 16 },
  list: { paddingBottom: 100 },
  txCard: { ...glassStyle, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txDetails: { flex: 1 },
  txTitle: { color: theme.colors.text, fontFamily: 'Inter_500Medium', fontSize: 16 },
  txDate: { color: theme.colors.textSecondary, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  txAmount: { fontFamily: 'Outfit_600SemiBold', fontSize: 16 },
});
