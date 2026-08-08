import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const renderRow = (icon: any, title: string, value?: string, onPress?: () => void) => (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={styles.rowLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color="#00CFFF" />
        </View>
        <Text style={styles.rowTitle}>{title}</Text>
      </View>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
      </View>
    </TouchableOpacity>
  );

  const renderToggleRow = (icon: any, title: string, value: boolean, onValueChange: (val: boolean) => void) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color="#00CFFF" />
        </View>
        <Text style={styles.rowTitle}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#00CFFF' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="rgba(255, 255, 255, 0.2)"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>
        
        {/* Account Section */}
        {renderSectionHeader('Account')}
        <View style={styles.cardContainer}>
          {renderRow('person-outline', 'Edit Profile', '', () => router.push('/settings/edit-profile'))}
          <View style={styles.divider} />
          {renderRow('lock-closed-outline', 'Change Password', '', () => router.push('/settings/change-password'))}
          <View style={styles.divider} />
          {renderRow('location-outline', 'Saved Addresses', '', () => router.push('/settings/saved-addresses'))}
        </View>

        {/* Notifications Section */}
        {renderSectionHeader('Notifications')}
        <View style={styles.cardContainer}>
          {renderToggleRow('notifications-outline', 'Push Notifications', pushEnabled, setPushEnabled)}
          <View style={styles.divider} />
          {renderToggleRow('mail-outline', 'Email Alerts', emailEnabled, setEmailEnabled)}
          <View style={styles.divider} />
          {renderToggleRow('chatbubble-outline', 'SMS Alerts', smsEnabled, setSmsEnabled)}
        </View>

        {/* Preferences Section */}
        {renderSectionHeader('Preferences')}
        <View style={styles.cardContainer}>
          {renderRow('language-outline', 'Language', 'English', () => router.push('/settings/language'))}
          <View style={styles.divider} />
          {renderRow('speedometer-outline', 'Units', 'Kilometers', () => {})}
        </View>

        {/* About Section */}
        {renderSectionHeader('About')}
        <View style={styles.cardContainer}>
          {renderRow('information-circle-outline', 'App Version', 'v1.0.0')}
          <View style={styles.divider} />
          {renderRow('document-text-outline', 'Terms of Service', '', () => router.push('/settings/terms'))}
          <View style={styles.divider} />
          {renderRow('shield-checkmark-outline', 'Privacy Policy', '', () => router.push('/settings/privacy'))}
          <View style={styles.divider} />
          {renderRow('star-outline', 'Rate Us', '', () => {})}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutCard}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" style={{ marginRight: 10 }} />
          <Text style={styles.signOutText}>Sign Out</Text>
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
  sectionTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
    marginLeft: 4,
  },
  cardContainer: {
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 24,
    shadowColor: '#00CFFF',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rowTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 68,
  },
  signOutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 59, 48, 0.5)',
    marginTop: 12,
    marginBottom: 24,
  },
  signOutText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#FF3B30',
  },
});
