import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
    responsiveWidth
} from "react-native-responsive-dimensions";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../utils/supabase";

const OrdersScreen = () => {
    const { theme, isDark } = useTheme();
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

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'completed':
            case 'delivered':
                return { bg: "rgba(76, 175, 80, 0.1)", color: "#4CAF50" };
            case 'cancelled':
            case 'rejected':
                return { bg: "rgba(244, 67, 54, 0.1)", color: "#F44336" };
            default:
                return { bg: "rgba(255, 152, 0, 0.1)", color: "#FF9800" };
        }
    };

    const renderOrderItem = ({ item, index }: { item: any; index: number }) => {
        const { bg, color } = getStatusStyles(item.status);
        return (
            <Animated.View entering={FadeInDown.delay(index * 100).duration(500)}>
                <TouchableOpacity
                    style={[styles.orderCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    activeOpacity={0.9}
                    onPress={() => {
                        if (item.status === 'cancelled' || item.status === 'completed') return;

                        let targetPath: any = "/order-tracking";
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
                        <Ionicons name="cafe" size={30} color={theme.primary} />
                    </View>
                    <View style={styles.orderInfo}>
                        <View style={styles.topRow}>
                            <Text style={[styles.orderName, { color: theme.text }]} numberOfLines={1}>{item.item_name}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                                <Text style={[styles.statusText, { color: color }]}>
                                    {item.status.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <Text style={[styles.orderDate, { color: theme.textMuted }]}>
                            {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <View style={styles.priceRow}>
                            <Text style={[styles.orderPrice, { color: theme.text }]}>
                                <Text style={styles.currencySymbol}>$</Text>
                                {item.total_price}
                            </Text>
                            <View style={styles.actionRow}>
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
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

            <View style={[styles.header, { backgroundColor: theme.header }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Order History</Text>
                <View style={{ width: 44 }} />
            </View>

            {loading && orders.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={renderOrderItem}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIconContainer, { backgroundColor: theme.surface }]}>
                                <Ionicons name="bag-outline" size={60} color={isDark ? "#333" : "#DDD"} />
                            </View>
                            <Text style={[styles.emptyText, { color: theme.text }]}>No orders yet</Text>
                            <Text style={[styles.emptySubText, { color: theme.textMuted }]}>When you order coffee, it will appear here.</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    listContent: {
        paddingHorizontal: responsiveWidth(6),
        paddingTop: 20,
        paddingBottom: 120,
    },
    orderCard: {
        flexDirection: "row",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    orderIconBox: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: "rgba(198, 124, 78, 0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    orderInfo: {
        flex: 1,
        marginLeft: 16,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    orderName: {
        fontSize: responsiveFontSize(1.8),
        fontWeight: "700",
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: "800",
    },
    orderDate: {
        fontSize: 12,
        marginBottom: 12,
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    orderPrice: {
        fontSize: responsiveFontSize(2),
        fontWeight: "800",
    },
    currencySymbol: {
        color: "#C67C4E",
    },
    actionRow: {
        flexDirection: "row",
    },
    reorderBtn: {
        backgroundColor: "#C67C4E",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    reorderText: {
        color: "white",
        fontSize: 12,
        fontWeight: "700",
    },
    cancelBtn: {
        borderWidth: 1,
        borderColor: "rgba(244, 67, 54, 0.5)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    cancelText: {
        color: "#F44336",
        fontSize: 12,
        fontWeight: "700",
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
