import { Stack } from 'expo-router';
import { THEME } from '../../constants/theme';

export default function JobLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: THEME.colors.background } }}>
      <Stack.Screen name="incoming" options={{ presentation: 'transparentModal', animation: 'fade' }} />
      <Stack.Screen name="navigation" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
