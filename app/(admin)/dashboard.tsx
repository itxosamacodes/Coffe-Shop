import { Ionicons } from "@expo/vector-icons";
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
    responsiveFontSize,
    responsiveHeight,
    responsiveWidth
} from "react-native-responsive-dimensions";
import { supabase } from "../../utils/supabase";

export default function AdminDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'all'>('pending');

    useEffect(() => {
        fetchOrders();

        // Real-time subscription for order updates
        const subscription = supabase
            .channel('admin_orders_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchOrders();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [filter]);

    const fetchOrders = async () => {
        setLoading(true);
        let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (filter === 'pending') {
            query = query.eq('status', 'pending');
        }

        const { data, error } = await query;

        if (!error) setOrders(data || []);
        setLoading(false);
    };

    const approveOrder = async (orderId: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: 'approved' })
            .eq('id', orderId);

        if (error) {
            Alert.alert("Error", "Could not approve order");
        } else {
            Alert.alert("Success", "Order approved! Riders can now see it.");
            fetchOrders();
        }
    };

    const rejectOrder = async (orderId: string) => {
        Alert.alert(
            "Reject Order",
            "Are you sure you want to reject this order?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reject",
                    style: "destructive",
                    onPress: async () => {
                        const { error } = await supabase
                            .from('orders')
                            .update({ status: 'rejected' })
                            .eq('id', orderId);

                        if (error) {
                            Alert.alert("Error", "Could not reject order");
                        } else {
                            Alert.alert("Success", "Order rejected");
                            fetchOrders();
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return "#FFF3E0";
            case 'approved': return "#E8F5E9";
            case 'rejected': return "#FFEBEE";
            case 'accepted': return "#E3F2FD";
            case 'picked_up': return "#FFF9C4";
            case 'delivered': return "#C8E6C9";
            case 'completed': return "#B2DFDB";
            default: return "#F5F5F5";
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'pending': return "#FF9800";
            case 'approved': return "#4CAF50";
            case 'rejected': return "#F44336";
            case 'accepted': return "#2196F3";
            case 'picked_up': return "#FBC02D";
            case 'delivered': return "#66BB6A";
            case 'completed': return "#26A69A";
            default: return "#757575";
        }
    };

    const renderOrderItem = ({ item }: { item: any }) => (
        <View style={styles.orderCard}>
            <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusTextColor(item.status) }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.timeText}>
                    {new Date(item.created_at).toLocaleString()}
                </Text>
            </View>

            <View style={styles.orderInfo}>
                <View style={styles.iconBox}>
                    <Ionicons name="cafe" size={28} color="#C67C4E" />
                </View>
                <View style={styles.details}>
                    <Text style={styles.itemName}>{item.item_name}</Text>
                    <Text style={styles.quantity}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.price}>${item.total_price}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.customerInfo}>
                <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{item.customer_name}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{item.customer_phone}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.infoText} numberOfLines={1}>
                        {item.delivery_address}
                    </Text>
                </View>
            </View>

            {item.status === 'pending' && (
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => rejectOrder(item.id)}
                    >
                        <Ionicons name="close-circle" size={20} color="#F44336" />
                        <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => approveOrder(item.id)}
                    >
                        <Ionicons name="checkmark-circle" size={20} color="white" />
                        <Text style={styles.approveText}>Approve</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Admin Dashboard</Text>
                    <Text style={styles.headerSubtitle}>Manage Orders</Text>
                </View>
                <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={() => router.replace("/(auth)/signIn")}
                >
                    <Ionicons name="log-out-outline" size={24} color="#C67C4E" />
                </TouchableOpacity>
            </View>

            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={[styles.filterBtn, filter === 'pending' && styles.filterBtnActive]}
                    onPress={() => setFilter('pending')}
                >
                    <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
                        Pending
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                        All Orders
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#C67C4E" />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="document-text-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>
                                {filter === 'pending' ? 'No pending orders' : 'No orders found'}
                            </Text>
                        </View>
                    }
                    onRefresh={fetchOrders}
                    refreshing={loading}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        paddingTop: responsiveHeight(7),
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: responsiveWidth(5),
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: responsiveFontSize(3),
        fontWeight: "bold",
        color: "#2F2D2C",
    },
    headerSubtitle: {
        fontSize: responsiveFontSize(1.8),
        color: "#888",
        marginTop: 4,
    },
    logoutBtn: {
        backgroundColor: "#FFF",
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    filterRow: {
        flexDirection: "row",
        paddingHorizontal: responsiveWidth(5),
        marginBottom: 20,
        gap: 10,
    },
    filterBtn: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        alignItems: "center",
    },
    filterBtnActive: {
        backgroundColor: "#C67C4E",
        borderColor: "#C67C4E",
    },
    filterText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#666",
    },
    filterTextActive: {
        color: "#FFF",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    listContent: {
        paddingHorizontal: responsiveWidth(5),
        paddingBottom: 30,
    },
    orderCard: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "bold",
    },
    timeText: {
        fontSize: 12,
        color: "#999",
    },
    orderInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    iconBox: {
        width: 50,
        height: 50,
        backgroundColor: "#F9F2ED",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    details: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2F2D2C",
    },
    quantity: {
        fontSize: 13,
        color: "#888",
        marginTop: 2,
    },
    price: {
        fontSize: 18,
        fontWeight: "800",
        color: "#C67C4E",
    },
    divider: {
        height: 1,
        backgroundColor: "#F0F0F0",
        marginVertical: 12,
    },
    customerInfo: {
        gap: 8,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: "#666",
        flex: 1,
    },
    actionRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 15,
    },
    actionBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    rejectBtn: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#F44336",
    },
    approveBtn: {
        backgroundColor: "#4CAF50",
    },
    rejectText: {
        color: "#F44336",
        fontSize: 15,
        fontWeight: "700",
    },
    approveText: {
        color: "#FFF",
        fontSize: 15,
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
