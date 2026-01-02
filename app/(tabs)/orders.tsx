import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
import { supabase } from "../../utils/supabase";

const OrdersScreen = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();

        const subscription = supabase
            .channel('orders_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchOrders();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (!error) setOrders(data || []);
        setLoading(false);
    };

    const cancelOrder = async (orderId: string) => {
        Alert.alert(
            "Cancel Order",
            "Are you sure you want to cancel this order?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: async () => {
                        const { error } = await supabase
                            .from('orders')
                            .update({ status: 'cancelled' })
                            .eq('id', orderId);

                        if (error) {
                            Alert.alert("Error", "Could not cancel order");
                        } else {
                            fetchOrders();
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'delivered': return "#E8F5E9";
            case 'cancelled':
            case 'rejected': return "#FFEBEE";
            default: return "#FFF3E0";
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'delivered': return "#4CAF50";
            case 'cancelled':
            case 'rejected': return "#F44336";
            default: return "#FF9800";
        }
    };

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

            {loading && orders.length === 0 ? (
                <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color="#C67C4E" />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.orderCard}
                            onPress={() => {
                                if (item.status === 'cancelled' || item.status === 'completed') return;

                                let targetPath: any = "/order-tracking"; // Default for pending
                                if (item.status === 'approved') {
                                    targetPath = "/waiting-for-rider";
                                } else if (['accepted', 'picked_up', 'delivered'].includes(item.status)) {
                                    targetPath = "/(tabs)/delivery";
                                }

                                router.push({
                                    pathname: targetPath,
                                    params: { orderId: item.id }
                                });
                            }}
                        >
                            <View style={styles.orderIconBox}>
                                <Ionicons name="cafe" size={32} color="#C67C4E" />
                            </View>
                            <View style={styles.orderInfo}>
                                <View style={styles.topRow}>
                                    <Text style={styles.orderName}>{item.item_name}</Text>
                                    <View style={[
                                        styles.statusBadge,
                                        { backgroundColor: getStatusColor(item.status) }
                                    ]}>
                                        <Text style={[
                                            styles.statusText,
                                            { color: getStatusTextColor(item.status) }
                                        ]}>{item.status.toUpperCase()}</Text>
                                    </View>
                                </View>
                                <Text style={styles.orderDate}>
                                    {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <View style={styles.priceRow}>
                                    <Text style={styles.orderPrice}>${item.total_price}</Text>
                                    {(item.status === 'pending' || item.status === 'approved') ? (
                                        <TouchableOpacity
                                            style={styles.cancelBtn}
                                            onPress={() => cancelOrder(item.id)}
                                        >
                                            <Text style={styles.cancelText}>Cancel</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.reorderBtn}
                                            onPress={() => router.push("/(tabs)/home")}
                                        >
                                            <Text style={styles.reorderText}>Reorder</Text>
                                        </TouchableOpacity>
                                    )}
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
                    onRefresh={fetchOrders}
                    refreshing={loading}
                />
            )}
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
    orderIconBox: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: "#F9F2ED",
        alignItems: "center",
        justifyContent: "center",
    },
    orderInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: "space-between",
        paddingVertical: 2,
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
        fontSize: 9,
        fontWeight: "800",
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
    cancelBtn: {
        borderWidth: 1,
        borderColor: "#F44336",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    cancelText: {
        color: "#F44336",
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

