import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

const LANGUAGES = [
  { id: 'en', name: 'English', native: 'English' },
  { id: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { id: 'mr', name: 'Marathi', native: 'मराठी' },
  { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { id: 'te', name: 'Telugu', native: 'తెలుగు' },
  { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { id: 'bn', name: 'Bengali', native: 'বাংলা' },
  { id: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { id: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { id: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
];

export default function LanguageSelectorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const initialLanguage = 'en'; // Assuming current saved language is 'en'

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return LANGUAGES;
    return LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.native.includes(searchQuery)
    );
  }, [searchQuery]);

  const handleApply = () => {
    // In a real app, save the language preference here
    router.back();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#050810', '#0a1222', '#050810']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.5)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search languages..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.5)" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.glassCard}>
            {filteredLanguages.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="translate-off"
                  size={48}
                  color="rgba(255, 255, 255, 0.3)"
                />
                <Text style={styles.emptyStateText}>No languages found</Text>
              </View>
            ) : (
              filteredLanguages.map((lang, index) => {
                const isSelected = selectedLanguage === lang.id;
                const isLast = index === filteredLanguages.length - 1;

                return (
                  <TouchableOpacity
                    key={lang.id}
                    style={[
                      styles.languageRow,
                      !isLast && styles.languageRowBorder,
                      isSelected && styles.languageRowSelected
                    ]}
                    onPress={() => setSelectedLanguage(lang.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.languageInfo}>
                      <Text style={[
                        styles.languageName,
                        isSelected && styles.languageNameSelected
                      ]}>
                        {lang.name}
                      </Text>
                      <Text style={styles.nativeName}>{lang.native}</Text>
                    </View>
                    
                    <View style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected
                    ]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="#00FF97" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {selectedLanguage !== initialLanguage && (
        <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#00CFFF', '#007BFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.applyButtonGradient}
            >
              <Text style={styles.applyButtonText}>Apply Changes</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
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
    backgroundColor: 'rgba(5, 8, 16, 0.8)',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Outfit_600SemiBold',
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 20, 32, 0.6)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  glassCard: {
    backgroundColor: 'rgba(13, 20, 32, 0.45)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
    shadowColor: '#00CFFF',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'transparent',
  },
  languageRowSelected: {
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
  },
  languageRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 17,
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
    marginBottom: 4,
  },
  languageNameSelected: {
    color: '#00CFFF',
  },
  nativeName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter_400Regular',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#00FF97',
    backgroundColor: 'rgba(0, 255, 151, 0.1)',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'Inter_500Medium',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(5, 8, 16, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  applyButton: {
    width: '100%',
    shadowColor: '#00CFFF',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  applyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Outfit_700Bold',
    fontWeight: '700',
    marginRight: 8,
  },
});
