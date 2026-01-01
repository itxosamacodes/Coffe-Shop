import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function rootlayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
                tabBarActiveTintColor: "#C67C4E",
                tabBarInactiveTintColor: "#8D8D8D",
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <View style={focused ? styles.activeIconWrap : null}>
                            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={focused ? "white" : color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <View style={focused ? styles.activeIconWrap : null}>
                            <Ionicons name={focused ? "heart" : "heart-outline"} size={24} color={focused ? "white" : color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <View style={focused ? styles.activeIconWrap : null}>
                            <Ionicons name={focused ? "bag" : "bag-outline"} size={24} color={focused ? "white" : color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="activity"
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <View style={focused ? styles.activeIconWrap : null}>
                            <Ionicons name={focused ? "notifications" : "notifications-outline"} size={24} color={focused ? "white" : color} />
                        </View>
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
        height: 70,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderTopWidth: 0,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        paddingBottom: 10,
        paddingHorizontal: 20,
    },
    activeIconWrap: {
        backgroundColor: '#C67C4E',
        width: 50,
        height: 50,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    }
});