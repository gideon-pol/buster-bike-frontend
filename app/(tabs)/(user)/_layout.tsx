import { Stack } from "expo-router";

export default function UserStack() {
  return (
    <Stack initialRouteName="user">
      <Stack.Screen name="user" options={{ headerShown: false }} />
      <Stack.Screen name="referral" options={{ headerShown: false }} />
    </Stack>
  );
}