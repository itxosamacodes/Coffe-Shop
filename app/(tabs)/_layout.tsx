import { Stack } from "expo-router";
import React from "react";
export default function rootlayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="home" />
            <Stack.Screen name="checkout" options={{ headerShown: false }} />
        </Stack>
    )
}