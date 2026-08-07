import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0E17' } }}>
      <Stack.Screen name="select-vehicle" />
      <Stack.Screen name="vehicle-details" />
      <Stack.Screen name="confirm" />
      <Stack.Screen name="searching" />
      <Stack.Screen name="driver-assigned" />
      <Stack.Screen name="tracking" />
    </Stack>
  );
}
