import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme, glassStyle } from '../../constants/theme';
import { bookings } from '../../constants/mock-data';

export default function BookingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Bookings</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {bookings.map(booking => (
          <View key={booking.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.type}>{booking.type}</Text>
              <Text style={[styles.status, { color: booking.status === 'Completed' ? theme.colors.secondary : theme.colors.danger }]}>{booking.status}</Text>
            </View>
            <Text style={styles.text}>{booking.date}</Text>
            <Text style={styles.text}>From: {booking.pickup}</Text>
            <Text style={styles.text}>To: {booking.drop}</Text>
            <View style={[styles.row, { marginTop: 10 }]}>
              <Text style={styles.price}>₹{booking.price}</Text>
              <TouchableOpacity style={styles.rebookBtn}><Text style={styles.rebookText}>Rebook</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 60, paddingHorizontal: 20 },
  header: { fontFamily: 'Outfit_700Bold', fontSize: 28, color: theme.colors.text, marginBottom: 20 },
  list: { paddingBottom: 100 },
  card: { ...glassStyle, padding: 16, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  type: { fontFamily: 'Outfit_600SemiBold', fontSize: 18, color: theme.colors.primary },
  status: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  text: { fontFamily: 'Inter_400Regular', color: theme.colors.textSecondary, marginTop: 4 },
  price: { fontFamily: 'Outfit_600SemiBold', color: theme.colors.text, fontSize: 18 },
  rebookBtn: { backgroundColor: 'rgba(0, 207, 255, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  rebookText: { color: theme.colors.primary, fontFamily: 'Inter_500Medium' },
});
