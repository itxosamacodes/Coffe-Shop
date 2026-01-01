import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
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
    responsiveHeight,
    responsiveWidth
} from "react-native-responsive-dimensions";

const recentOrders = [
    {
        id: "1",
        name: "Espresso",
        subTitle: "With Deep Foam",
        price: "4.53",
        image: require("../../assets/ProductImage/cofe3.jpg"),
        status: "Delivered",
        date: "Today, 4:30 PM",
    },
    {
        id: "2",
        name: "Latte",
        subTitle: "With Deep Foam",
        price: "5.53",
        image: require("../../assets/ProductImage/cofe1.png"),
        status: "Processing",
        date: "Today, 2:15 PM",
    },
];

const OrdersScreen = () => {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order History</Text>
                <View style={{ width: 44 }} />
            </View>

            <FlatList
                data={recentOrders}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.orderCard}>
                        <Image source={item.image} style={styles.orderImage} contentFit="cover" transition={200} />
                        <View style={styles.orderInfo}>
                            <View style={styles.topRow}>
                                <Text style={styles.orderName}>{item.name}</Text>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: item.status === "Delivered" ? "#E8F5E9" : "#FFF3E0" }
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        { color: item.status === "Delivered" ? "#4CAF50" : "#FF9800" }
                                    ]}>{item.status}</Text>
                                </View>
                            </View>
                            <Text style={styles.orderDate}>{item.date}</Text>
                            <View style={styles.priceRow}>
                                <Text style={styles.orderPrice}>${item.price}</Text>
                                <TouchableOpacity style={styles.reorderBtn}>
                                    <Text style={styles.reorderText}>Reorder</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="bag-outline" size={60} color="#ccc" />
                        <Text style={styles.emptyText}>No orders yet</Text>
                    </View>
                }
            />

        </View>
    );
};

export default OrdersScreen;

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
    orderCard: {
        flexDirection: "row",
        backgroundColor: "white",
        borderRadius: 16,
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#F0F0F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    orderImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    orderInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: "space-between",
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    orderName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2F2D2C",
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: "700",
    },
    orderDate: {
        fontSize: 12,
        color: "#999",
        marginTop: 2,
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 5,
    },
    orderPrice: {
        fontSize: 16,
        fontWeight: "800",
        color: "#C67C4E",
    },
    reorderBtn: {
        backgroundColor: "#C67C4E",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    reorderText: {
        color: "white",
        fontSize: 12,
        fontWeight: "700",
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

