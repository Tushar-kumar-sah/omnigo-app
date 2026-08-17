import { Stack } from 'expo-router';
import { THEME } from '../../constants/theme';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: THEME.colors.background } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="otp-verify" />
      <Stack.Screen name="register" />
      <Stack.Screen name="driver-verification" />
      <Stack.Screen name="under-review" />
    </Stack>
  );
}
