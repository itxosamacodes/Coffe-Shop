import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveWidth,
} from "react-native-responsive-dimensions";
import { useTheme } from "../../context/ThemeContext";

const notifications = [
    {
        id: "1",
        title: "Order Placed Successfully",
        message: "Your Espresso with Deep Foam is being prepared.",
        time: "Just Now",
        icon: "bag-check" as const,
        color: "#C67C4E",
    },
    {
        id: "2",
        title: "Delivery in Progress",
        message: "Rider is heading to your location.",
        time: "10 mins ago",
        icon: "bicycle" as const,
        color: "#4CAF50",
    },
    {
        id: "3",
        title: "Payment Received",
        message: "Thank you for your payment of $5.53.",
        time: "30 mins ago",
        icon: "card" as const,
        color: "#2196F3",
    },
    {
        id: "4",
        title: "Exclusive Offer!",
        message: "Get 30% off on your next Latte order.",
        time: "2 hours ago",
        icon: "gift" as const,
        color: "#E91E63",
    },
];

const ActivityScreen = () => {
    const { theme, isDark } = useTheme();

    const renderNotification = ({ item, index }: { item: any; index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 100).duration(500)}>
            <TouchableOpacity
                style={[styles.notificationCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                activeOpacity={0.8}
            >
                <View style={[styles.iconContainer, { backgroundColor: item.color + "15" }]}>
                    <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.textContainer}>
                    <View style={styles.topRow}>
                        <Text style={[styles.notifTitle, { color: theme.text }]}>{item.title}</Text>
                        <Text style={[styles.notifTime, { color: theme.textMuted }]}>{item.time}</Text>
                    </View>
                    <Text style={[styles.notifMessage, { color: theme.textMuted }]}>{item.message}</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

            <View style={[styles.header, { backgroundColor: theme.header }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Activity</Text>
                <View style={{ width: 44 }} />
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={renderNotification}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: theme.surface }]}>
                            <Ionicons name="notifications-off-outline" size={60} color={isDark ? "#333" : "#DDD"} />
                        </View>
                        <Text style={[styles.emptyText, { color: theme.text }]}>No notifications yet</Text>
                        <Text style={[styles.emptySubText, { color: theme.textMuted }]}>We'll notify you when something happens!</Text>
                    </View>
                }
            />
        </View>
    );
};

export default ActivityScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: responsiveHeight(15),
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: responsiveWidth(6),
        paddingTop: responsiveHeight(4),
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(128,128,128,0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: responsiveFontSize(2.2),
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    listContent: {
        paddingHorizontal: responsiveWidth(6),
        paddingTop: 20,
        paddingBottom: 120,
    },
    notificationCard: {
        flexDirection: "row",
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        alignItems: "center",
        borderWidth: 1,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    textContainer: {
        flex: 1,
        marginLeft: 16,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 4,
    },
    notifTitle: {
        fontSize: responsiveFontSize(1.8),
        fontWeight: "700",
        flex: 1,
        marginRight: 8,
    },
    notifTime: {
        fontSize: 10,
        fontWeight: "600",
    },
    notifMessage: {
        fontSize: responsiveFontSize(1.6),
        lineHeight: 20,
    },
    emptyState: {
        alignItems: "center",
        marginTop: responsiveHeight(15),
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    emptyText: {
        fontSize: responsiveFontSize(2.2),
        fontWeight: "700",
    },
    emptySubText: {
        fontSize: responsiveFontSize(1.6),
        marginTop: 8,
        textAlign: "center",
    },
});
