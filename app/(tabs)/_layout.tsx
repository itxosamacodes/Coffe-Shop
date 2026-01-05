import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import {
    responsiveFontSize,
    responsiveHeight,
} from "react-native-responsive-dimensions";
import { useTheme } from "../../context/ThemeContext";

export default function rootlayout() {
    const { theme } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: [styles.tabBar, { backgroundColor: theme.tabBar, borderTopColor: theme.border }],
                tabBarShowLabel: true,
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.tabInactive,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? "home" : "home-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: "Favorites",
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? "heart" : "heart-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: "Orders",
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? "bag" : "bag-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="activity"
                options={{
                    title: "Activity",
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? "notifications" : "notifications-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="detail"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' }
                }}
            />
            <Tabs.Screen
                name="delivery"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' }
                }}
            />
            <Tabs.Screen
                name="checkout"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' }
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        height: responsiveHeight(9),
        borderTopWidth: 1,
        elevation: 0,
        paddingBottom: 15,
        paddingTop: 10,
    },
    tabBarLabel: {
        fontSize: responsiveFontSize(1.4),
        fontWeight: "600",
        marginBottom: 2,
    }
});