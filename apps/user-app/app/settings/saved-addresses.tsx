import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

interface Address {
  id: string;
  label: string;
  address: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isDefault: boolean;
}

const initialAddresses: Address[] = [
  {
    id: '1',
    label: 'Home',
    address: '42, Shivaji Nagar, Pune 411005',
    icon: 'home',
    color: '#00FF97',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Office',
    address: 'Tech Park, Hinjewadi Phase 1, Pune 411057',
    icon: 'briefcase',
    color: '#00CFFF',
    isDefault: false,
  },
  {
    id: '3',
    label: 'Garage',
    address: 'AutoFix Service Center, MG Road, Pune 411001',
    icon: 'car',
    color: '#FFB800', // amber
    isDefault: false,
  }
];

export default function SavedAddressesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const handleAddAddress = () => {
    if (newLabel && newAddress) {
      setAddresses([...addresses, {
        id: Math.random().toString(),
        label: newLabel,
        address: newAddress,
        icon: 'location',
        color: '#00CFFF',
        isDefault: false
      }]);
      setNewLabel('');
      setNewAddress('');
      setShowAddModal(false);
    }
  };

  const renderAddressCard = (item: Address) => (
    <View key={item.id} style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>{item.label}</Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardAddressText} numberOfLines={2}>{item.address}</Text>
      </View>
      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="ellipsis-vertical" size={20} color="rgba(255, 255, 255, 0.5)" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050810', '#0a1222', '#050810']} style={StyleSheet.absoluteFillObject} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="#00CFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {addresses.map(renderAddressCard)}
        </View>

        <TouchableOpacity style={styles.addCard} onPress={() => setShowAddModal(true)}>
          <View style={styles.addIconCircle}>
            <Ionicons name="add" size={24} color="#00CFFF" />
          </View>
          <Text style={styles.addText}>Add New Address</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Address Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Address</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Label (e.g., Home, Office)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter label"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    value={newLabel}
                    onChangeText={setNewLabel}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Address</Text>
                <View style={[styles.inputWrapper, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
                  <TextInput
                    style={[styles.input, { textAlignVertical: 'top' }]}
                    placeholder="Enter full address"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    value={newAddress}
                    onChangeText={setNewAddress}
                    multiline
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleAddAddress}>
                <LinearGradient
                  colors={['#00CFFF', '#00FF97']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Save Address</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  listContainer: {
    gap: 16,
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  cardLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  defaultBadge: {
    backgroundColor: 'rgba(0, 255, 151, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 151, 0.3)',
  },
  defaultText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#00FF97',
    textTransform: 'uppercase',
  },
  cardAddressText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  menuButton: {
    padding: 8,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0, 207, 255, 0.3)',
    borderStyle: 'dashed',
    padding: 20,
    gap: 12,
  },
  addIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#00CFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 16, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0a1222',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#00CFFF',
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  modalForm: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: 12,
  },
  saveButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#050810',
  },
});
