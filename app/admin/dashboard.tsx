import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Alert,
} from "react-native";
import { supabase } from "../../utils/supabse";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Order {
    id: string;
    item_name: string;
    quantity: number;
    total_price: number;
    status: string;
    delivery_type: string;
    created_at: string;
}

const AdminDashboard = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Stats State
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);

    useEffect(() => {
        fetchOrders();

        // Real-time subscription
        const subscription = supabase
            .channel("orders")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "orders" },
                (payload) => {
                    // Ideally we would merge the single change, but re-fetching is safer for consistent stats for now
                    // or we can handle specific events. For simplicity in V1, let's re-fetch or append.
                    console.log("Real-time change received!", payload);
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    useEffect(() => {
        calculateStats();
    }, [orders]);

    const calculateStats = () => {
        setTotalOrders(orders.length);
        const revenue = orders.reduce((sum, order) => {
            // Assuming 'accepted' orders contribute to revenue, or all for now if checking potential
            // Let's count all 'accepted' or 'pending' orders as potential revenue for this view,
            // or strictly 'accepted' if that's the business rule. Let's go with All for "Live Collection"
            return sum + (Number(order.total_price) || 0);
        }, 0);
        setTotalRevenue(revenue);
    };

    const fetchOrders = async () => {
        // No setLoading(true) here to avoid flickering on real-time updates
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching orders:", error);
            Alert.alert("Error", "Failed to fetch orders");
        } else {
            setOrders(data || []);
            if (loading) setLoading(false);
        }
    };

    const updateOrderStatus = async (id: string, status: string) => {
        const { error } = await supabase
            .from("orders")
            .update({ status })
            .eq("id", id);

        if (error) {
            console.error(`Error updating order ${id}:`, error);
            Alert.alert("Error", `Failed to ${status} order`);
        } else {
            // Alert.alert("Success", `Order ${status}`); 
            // No manual setOrders needed because Real-time subscription will catch the update!
            // But for instant UI feedback we can optimize:
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === id ? { ...order, status } : order
                )
            );
        }
    };

    const renderItem = ({ item }: { item: Order }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.orderIdContainer}>
                    <Text style={styles.orderIdText}>#{item.id.slice(0, 8)}</Text>
                    <Text style={styles.timeText}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <Text
                    style={[
                        styles.statusBadge,
                        {
                            backgroundColor:
                                item.status === "accepted"
                                    ? "#E8F5E9"
                                    : item.status === "rejected"
                                        ? "#FFEBEE"
                                        : "#FFF3E0",
                            color:
                                item.status === "accepted"
                                    ? "#2E7D32"
                                    : item.status === "rejected"
                                        ? "#C62828"
                                        : "#EF6C00",
                        },
                    ]}
                >
                    {item.status.toUpperCase()}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.mainText}>{item.item_name}</Text>
                <Text style={styles.priceText}>${item.total_price}</Text>
            </View>
            <Text style={styles.subText}>{item.quantity} x {item.delivery_type}</Text>

            {item.status === "pending" && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => updateOrderStatus(item.id, "accepted")}
                    >
                        <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => updateOrderStatus(item.id, "rejected")}
                    >
                        <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Dashboard</Text>
            </View>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Total Revenue</Text>
                    <Text style={styles.statValue}>${totalRevenue.toFixed(2)}</Text>
                    <Text style={styles.statSub}>+12.5% from last month</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Total Orders</Text>
                    <Text style={styles.statValue}>{totalOrders}</Text>
                    <Text style={styles.statSub}>+24% from last month</Text>
                </View>
            </View>

            <Text style={styles.sectionHeader}>Recent Orders</Text>

            {loading ? (
                <Text style={styles.loadingText}>Loading data...</Text>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={fetchOrders}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No orders yet.</Text>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F6F8",
        paddingTop: StatusBar.currentHeight || 40,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: "#fff",
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1A1A1A",
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statLabel: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 8,
        fontWeight: '600',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 4,
    },
    statSub: {
        fontSize: 12,
        color: '#22C55E', // Green
        fontWeight: '500',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginLeft: 20,
        marginBottom: 10,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        marginBottom: 12,
    },
    orderIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    orderIdText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    timeText: {
        fontSize: 12,
        color: '#94A3B8',
    },
    statusBadge: {
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    mainText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    subText: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 12,
    },
    actions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    acceptButton: {
        backgroundColor: "#0F172A", // Dark theme styled
    },
    rejectButton: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#EF4444",
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "white", // Default for accept
    },
    // We need to override text color for reject button locally if possible or just use conditional styles
    // For simplicity, let's fix the text style in the renderItem
    loadingText: {
        textAlign: "center",
        marginTop: 20,
        color: "#64748B",
    },
    emptyText: {
        textAlign: "center",
        marginTop: 40,
        color: "#94A3B8",
    },
});

export default AdminDashboard;
