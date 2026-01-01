import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveWidth,
} from "react-native-responsive-dimensions";

const notifications = [
    {
        id: "1",
        title: "Order Placed Successfully",
        message: "Your Espresso with Deep Foam is being prepared.",
        time: "Just Now",
        icon: "bag-check",
        color: "#C67C4E",
    },
    {
        id: "2",
        title: "Delivery in Progress",
        message: "Rider is heading to your location.",
        time: "10 mins ago",
        icon: "bicycle",
        color: "#4CAF50",
    },
    {
        id: "3",
        title: "Payment Received",
        message: "Thank you for your payment of $5.53.",
        time: "30 mins ago",
        icon: "card",
        color: "#2196F3",
    },
];

const ActivityScreen = () => {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Activity</Text>
                <View style={{ width: 44 }} />
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.notificationCard}>
                        <View style={[styles.iconContainer, { backgroundColor: item.color + "20" }]}>
                            <Ionicons name={item.icon as any} size={24} color={item.color} />
                        </View>
                        <View style={styles.textContainer}>
                            <View style={styles.topRow}>
                                <Text style={styles.notifTitle}>{item.title}</Text>
                                <Text style={styles.notifTime}>{item.time}</Text>
                            </View>
                            <Text style={styles.notifMessage}>{item.message}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
                        <Text style={styles.emptyText}>No new notifications</Text>
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
        backgroundColor: "#FDFDFD",
        paddingTop: responsiveHeight(7),
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: responsiveWidth(5),
        marginBottom: 20,
    },
    backBtn: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "700",
        color: "#2F2D2C",
    },
    listContent: {
        paddingHorizontal: responsiveWidth(5),
        paddingBottom: 100,
    },
    notificationCard: {
        flexDirection: "row",
        backgroundColor: "white",
        padding: 15,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    textContainer: {
        flex: 1,
        marginLeft: 15,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    notifTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2F2D2C",
    },
    notifTime: {
        fontSize: 12,
        color: "#999",
    },
    notifMessage: {
        fontSize: 14,
        color: "#777",
        lineHeight: 20,
    },
    emptyState: {
        alignItems: "center",
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
        marginTop: 10,
    },
});

