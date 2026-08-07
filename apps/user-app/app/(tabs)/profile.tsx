import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { theme, glassStyle } from '../../constants/theme';
import { currentUser } from '../../constants/mock-data';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      
      <View style={styles.profileCard}>
        <View style={styles.avatarPlaceholder}><Ionicons name="person" size={40} color="#fff" /></View>
        <View style={styles.info}>
          <Text style={styles.name}>{currentUser.name}</Text>
          <Text style={styles.phone}>{currentUser.phone}</Text>
          <View style={styles.badge}><Ionicons name="checkmark-circle" size={14} color={theme.colors.secondary} /><Text style={styles.badgeText}>Verified</Text></View>
        </View>
      </View>

      <View style={styles.menu}>
        {['Membership', 'Settings', 'Notifications', 'Help & Support'].map(item => (
          <TouchableOpacity key={item} style={styles.menuItem}>
            <Text style={styles.menuText}>{item}</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 60, paddingHorizontal: 20 },
  header: { fontFamily: 'Outfit_700Bold', fontSize: 28, color: theme.colors.text, marginBottom: 20 },
  profileCard: { ...glassStyle, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  info: { flex: 1 },
  name: { fontFamily: 'Outfit_600SemiBold', fontSize: 24, color: theme.colors.text },
  phone: { fontFamily: 'Inter_400Regular', color: theme.colors.textSecondary, marginTop: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: 'rgba(0, 255, 151, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { color: theme.colors.secondary, fontFamily: 'Inter_500Medium', fontSize: 12, marginLeft: 4 },
  menu: { ...glassStyle, padding: 8 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.glassBorder },
  menuText: { color: theme.colors.text, fontFamily: 'Inter_500Medium', fontSize: 16 },
});
