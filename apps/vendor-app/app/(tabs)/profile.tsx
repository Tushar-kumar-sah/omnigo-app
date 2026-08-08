import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { THEME } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import { mockDriver } from '../../constants/mock-data';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity>
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <BlurView intensity={20} tint="dark" style={styles.headerCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={THEME.colors.primary} />
          <View style={styles.onlineDot} />
        </View>
        <Text style={styles.name}>{mockDriver.name}</Text>
        <Text style={styles.phone}>{mockDriver.phone}</Text>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{mockDriver.rating}</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{mockDriver.totalTrips}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{mockDriver.acceptanceRate}%</Text>
            <Text style={styles.statLabel}>Acceptance</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{mockDriver.completionRate}%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
        </View>
        <Text style={styles.memberSince}>Member since {mockDriver.memberSince}</Text>
      </BlurView>

      <Text style={styles.sectionTitle}>Vehicle Details</Text>
      <BlurView intensity={20} tint="dark" style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Type</Text>
          <Text style={styles.infoValue}>{mockDriver.vehicle.type}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Make</Text>
          <Text style={styles.infoValue}>{mockDriver.vehicle.make}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Plate</Text>
          <Text style={styles.infoValue}>{mockDriver.vehicle.number}</Text>
        </View>
      </BlurView>

      <Text style={styles.sectionTitle}>Documents</Text>
      <BlurView intensity={20} tint="dark" style={styles.infoCard}>
        <View style={styles.docRow}>
          <View>
            <Text style={styles.infoValue}>Driving License</Text>
            <Text style={styles.verifiedText}>Verified ✓</Text>
          </View>
          <TouchableOpacity style={styles.updateBtn}>
            <Text style={styles.updateBtnText}>Update</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <View style={styles.docRow}>
          <View>
            <Text style={styles.infoValue}>Insurance</Text>
            <Text style={styles.verifiedText}>Verified ✓</Text>
          </View>
          <TouchableOpacity style={styles.updateBtn}>
            <Text style={styles.updateBtnText}>Update</Text>
          </TouchableOpacity>
        </View>
      </BlurView>

      <Text style={styles.sectionTitle}>Bank Account</Text>
      <BlurView intensity={20} tint="dark" style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bank Name</Text>
          <Text style={styles.infoValue}>{mockDriver.bank.bankName}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Account</Text>
          <Text style={styles.infoValue}>{mockDriver.bank.accountNumber}</Text>
        </View>
      </BlurView>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>LOGOUT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 64,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 32,
    color: THEME.colors.text,
  },
  editText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.primary,
  },
  headerCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.glassBorder,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: THEME.colors.success,
    borderWidth: 2,
    borderColor: THEME.colors.glassBg,
  },
  name: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 24,
    color: THEME.colors.text,
    marginBottom: 4,
  },
  phone: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 16,
    color: THEME.colors.textSecondary,
    marginBottom: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  ratingText: {
    fontFamily: THEME.fonts.inter.bold,
    fontSize: 14,
    color: '#FFD700',
    marginLeft: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  statCell: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statValue: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 18,
    color: THEME.colors.text,
  },
  statLabel: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  memberSince: {
    fontFamily: THEME.fonts.inter.regular,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 20,
    color: THEME.colors.text,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  infoValue: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 14,
    color: THEME.colors.text,
  },
  verifiedText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: THEME.colors.success,
    marginTop: 4,
  },
  updateBtn: {
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  updateBtnText: {
    fontFamily: THEME.fonts.inter.medium,
    fontSize: 12,
    color: THEME.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },
  logoutBtn: {
    marginTop: 8,
    padding: 16,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.danger,
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: THEME.fonts.outfit.bold,
    fontSize: 16,
    color: THEME.colors.danger,
    letterSpacing: 1,
  }
});
