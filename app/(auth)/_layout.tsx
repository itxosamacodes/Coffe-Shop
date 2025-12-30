import { Stack } from "expo-router";
import React from "react";
export default function rootlayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="signIn" />
      <Stack.Screen name="signUp" />
      <Stack.Screen name="forget" />
      <Stack.Screen name="setNewPass" />
    </Stack>
  );
}
