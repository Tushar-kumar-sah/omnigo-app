import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { theme, glassStyle } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function AIAssistantScreen() {
  const router = useRouter();
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([{ id: '1', text: 'Hi! I am OmniBot. How can I assist you with your towing needs today?', sender: 'bot' }]);

  const send = () => {
    if (!msg) return;
    setChat([...chat, { id: Date.now().toString(), text: msg, sender: 'user' }, { id: (Date.now()+1).toString(), text: 'I am an AI assistant placeholder. I will help you book a tow soon!', sender: 'bot' }]);
    setMsg('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={28} color={theme.colors.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>OmniBot</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.chatArea}>
        {chat.map(c => (
          <View key={c.id} style={[styles.bubble, c.sender === 'bot' ? styles.botBubble : styles.userBubble]}>
            <Text style={styles.bubbleText}>{c.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputArea}>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Type a message..." placeholderTextColor={theme.colors.textSecondary} value={msg} onChangeText={setMsg} />
        </View>
        <TouchableOpacity onPress={send} style={styles.sendBtn}>
          <LinearGradient colors={['#00CFFF', '#0CF2FF']} style={styles.sendBg}>
            <Ionicons name="send" size={20} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { ...glassStyle, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 15, paddingHorizontal: 20, borderTopWidth: 0, borderRadius: 0 },
  headerTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 20, color: theme.colors.primary },
  chatArea: { padding: 20, gap: 16 },
  bubble: { maxWidth: '80%', padding: 16, borderRadius: 20 },
  botBubble: { ...glassStyle, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleText: { color: theme.colors.text, fontFamily: 'Inter_400Regular', fontSize: 16 },
  inputArea: { flexDirection: 'row', padding: 20, alignItems: 'center', gap: 12 },
  inputContainer: { ...glassStyle, flex: 1, height: 50, paddingHorizontal: 16, justifyContent: 'center' },
  input: { color: theme.colors.text, fontFamily: 'Inter_400Regular' },
  sendBtn: { shadowColor: theme.colors.primary, shadowOpacity: 0.8, shadowRadius: 10 },
  sendBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
});
