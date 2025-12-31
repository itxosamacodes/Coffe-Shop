import { Stack } from "expo-router";
import React from "react";
export default function rootlayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="home" />
            <Stack.Screen name="detail" />
            <Stack.Screen name="delivery" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="activity" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="favorites" />
        </Stack>
    )
}