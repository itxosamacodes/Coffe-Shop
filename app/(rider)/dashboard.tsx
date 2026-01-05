import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveWidth,
} from "react-native-responsive-dimensions";
import { RoutePolyline } from "../../components/RoutePolyline";
import { riderService } from "../../services/riderService";
import { supabase } from "../../utils/supabase";

export default function RiderDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [riderLocation, setRiderLocation] = useState<any>(null);
    const [stats, setStats] = useState({ daily: 0, weekly: 0, monthly: 0 });
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [trackingModalVisible, setTrackingModalVisible] = useState(false);

    useEffect(() => {
        fetchOrders();
        fetchStats();
        getCurrentLocation();

        // Real-time subscription for new orders
        const subscription = supabase
            .channel('public:orders_rider')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                fetchOrders();
                if (selectedOrder && (payload.new as any).id === selectedOrder.id) {
                    setSelectedOrder(payload.new);
                }
            })
            .subscribe();

        // Real-time location streaming
        let locationSubscription: any = null;
        const startTracking = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 10,
                },
                (location) => {
                    setRiderLocation(location.coords);
                    updateRiderLocationInDB(location.coords);
                }
            );
        };
        startTracking();

        return () => {
            subscription.unsubscribe();
            if (locationSubscription) locationSubscription.remove();
        };
    }, [selectedOrder]);

    const updateRiderLocationInDB = async (coords: any) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Update rider location for orders that are accepted or picked_up
        await supabase
            .from('orders')
            .update({
                rider_lat: coords.latitude,
                rider_lng: coords.longitude
            })
            .eq('rider_id', user.id)
            .in('status', ['accepted', 'picked_up']);
    };

    const fetchStats = async () => {
        try {
            const user = await riderService.getRiderUser();
            const statsData = await riderService.fetchStats(user.id);
            setStats(statsData);
        } catch (error) {
            console.error("Stats Error:", error);
        }
    };

    const getCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        let location = await Location.getCurrentPositionAsync({});
        setRiderLocation(location.coords);
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const user = await riderService.getRiderUser();
            const data = await riderService.fetchActiveOrders(user.id);
            setOrders(data);
        } catch (error) {
            console.error("Fetch Orders Error:", error);
        }
        setLoading(false);
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const user = await riderService.getRiderUser();
            if (newStatus === 'accepted') {
                await riderService.acceptOrder(user.id, orderId);
            } else {
                await riderService.updateStatus(orderId, newStatus);
            }

            if (newStatus === 'delivered') {
                Alert.alert("Delivered!", "Waiting for customer to confirm receipt.");
            }
            fetchOrders();
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (error: any) {
            Alert.alert("Order Update Failed", error.message || "Something went wrong");
        }
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return "0.00";
        const R = 6371; // km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(2);
    };

    const renderOrderItem = ({ item }: { item: any }) => {
        const status = item.status?.trim().toLowerCase();
        const dist = riderLocation && item.customer_lat && item.customer_lng
            ? calculateDistance(riderLocation.latitude, riderLocation.longitude, item.customer_lat, item.customer_lng)
            : null;

        return (
            <View style={styles.orderCard}>
                <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                        <Text style={styles.statusText}>{status?.replace('_', ' ').toUpperCase()}</Text>
                    </View>
                    <Text style={styles.timeText}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>

                <View style={styles.productInfo}>
                    <View style={styles.iconBox}>
                        <Ionicons name="cafe" size={24} color="#C67C4E" />
                    </View>
                    <View style={styles.details}>
                        <Text style={styles.productName}>{item.item_name}</Text>
                        <Text style={styles.qtyText}>Quantity: {item.quantity}</Text>
                    </View>
                    <Text style={styles.priceText}>${item.total_price}</Text>
                </View>

                {dist && (
                    <View style={styles.distanceInfo}>
                        <Ionicons name="navigate-circle-outline" size={16} color="#C67C4E" />
                        <Text style={styles.distanceText}>{dist} km away from you</Text>
                    </View>
                )}

                <View style={styles.divider} />

                <View style={styles.customerSection}>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={18} color="#888" />
                        <Text style={styles.infoValue}>{item.customer_name || "N/A"}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={18} color="#888" />
                        <Text style={styles.addressValue} numberOfLines={1}>{item.delivery_address || "N/A"}</Text>
                    </View>
                </View>

                <View style={styles.buttonRow}>
                    {renderActionButton(item)}
                    {(status === 'accepted' || status === 'picked_up') && (
                        <TouchableOpacity
                            style={styles.trackBtn}
                            onPress={() => {
                                setSelectedOrder(item);
                                setTrackingModalVisible(true);
                            }}
                        >
                            <Ionicons name="map-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'rgba(198, 124, 78, 0.2)';
            case 'accepted': return 'rgba(0, 150, 255, 0.2)';
            case 'picked_up': return 'rgba(255, 200, 0, 0.2)';
            case 'delivered': return 'rgba(0, 255, 150, 0.2)';
            default: return 'rgba(128,128,128,0.2)';
        }
    };

    const renderActionButton = (item: any) => {
        if (!item) return null;
        const status = item.status?.trim().toLowerCase();

        if (status === 'approved') {
            return (
                <TouchableOpacity style={styles.actionBtn} onPress={() => updateOrderStatus(item.id, 'accepted')}>
                    <Text style={styles.actionBtnText}>Accept Order</Text>
                </TouchableOpacity>
            );
        }
        if (status === 'accepted') {
            return (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#C87941', flex: 1 }]} onPress={() => updateOrderStatus(item.id, 'picked_up')}>
                    <Text style={styles.actionBtnText}>Pick Up Order</Text>
                </TouchableOpacity>
            );
        }
        if (status === 'picked_up') {
            return (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#4CAF50', flex: 1 }]} onPress={() => updateOrderStatus(item.id, 'delivered')}>
                    <Text style={styles.actionBtnText}>Mark as Delivered</Text>
                </TouchableOpacity>
            );
        }
        if (status === 'delivered') {
            return (
                <View style={styles.waitingBadge}>
                    <Text style={styles.waitingText}>Waiting for confirmation...</Text>
                </View>
            );
        }
        return (
            <View style={styles.waitingBadge}>
                <Text style={styles.waitingText}>{status?.toUpperCase() || "..."}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Rider Portal</Text>
                    <Text style={styles.subWelcome}>Track and manage your earnings</Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace("/(auth)/riderSignIn")}>
                    <Ionicons name="log-out-outline" size={24} color="#C67C4E" />
                </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Today</Text>
                    <Text style={styles.statValue}>${stats.daily.toFixed(1)}</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Weekly</Text>
                    <Text style={styles.statValue}>${stats.weekly.toFixed(1)}</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Monthly</Text>
                    <Text style={styles.statValue}>${stats.monthly.toFixed(1)}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Active Orders</Text>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#C67C4E" />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrderItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="cafe-outline" size={60} color="#333" />
                            <Text style={styles.emptyText}>No active orders</Text>
                        </View>
                    }
                    onRefresh={() => { fetchOrders(); fetchStats(); }}
                    refreshing={loading}
                />
            )}

            {/* Tracking Modal */}
            <Modal
                visible={trackingModalVisible}
                animationType="slide"
                onRequestClose={() => setTrackingModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setTrackingModalVisible(false)}>
                            <Ionicons name="close-circle" size={32} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Order Tracking</Text>
                        <View style={{ width: 32 }} />
                    </View>

                    {selectedOrder && (
                        <MapView
                            style={styles.modalMap}
                            initialRegion={{
                                latitude: (riderLocation?.latitude + Number(selectedOrder.customer_lat)) / 2 || 33.6323,
                                longitude: (riderLocation?.longitude + Number(selectedOrder.customer_lng)) / 2 || 72.9228,
                                latitudeDelta: 0.05,
                                longitudeDelta: 0.05,
                            }}
                        >
                            {/* Route Path Polyline */}
                            <RoutePolyline
                                start={{ latitude: riderLocation?.latitude, longitude: riderLocation?.longitude }}
                                end={{ latitude: Number(selectedOrder.customer_lat), longitude: Number(selectedOrder.customer_lng) }}
                            />

                            {riderLocation && (
                                <Marker coordinate={riderLocation} title="You">
                                    <View style={styles.riderMarker}>
                                        <MaterialCommunityIcons name="bike" size={24} color="white" />
                                    </View>
                                </Marker>
                            )}
                            {selectedOrder.customer_lat && selectedOrder.customer_lng && (
                                <Marker
                                    coordinate={{
                                        latitude: Number(selectedOrder.customer_lat),
                                        longitude: Number(selectedOrder.customer_lng)
                                    }}
                                    title="Customer"
                                >
                                    <View style={styles.customerMarker}>
                                        <Ionicons name="person" size={20} color="white" />
                                    </View>
                                </Marker>
                            )}
                        </MapView>
                    )}

                    <View style={styles.modalFooter}>
                        <View style={styles.modalInfo}>
                            <Text style={styles.modalCustomer}>{selectedOrder?.customer_name}</Text>
                            <Text style={styles.modalAddress}>{selectedOrder?.delivery_address}</Text>
                            <Text style={styles.modalDist}>
                                Distance: {riderLocation && selectedOrder
                                    ? calculateDistance(riderLocation.latitude, riderLocation.longitude, selectedOrder.customer_lat, selectedOrder.customer_lng)
                                    : "0.00"} km
                            </Text>
                        </View>
                        {renderActionButton(selectedOrder)}
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F0F0F",
        paddingTop: responsiveHeight(7),
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: responsiveWidth(6),
        marginBottom: 15,
    },
    welcomeText: {
        fontSize: responsiveFontSize(3),
        fontWeight: "bold",
        color: "#fff",
    },
    subWelcome: {
        fontSize: responsiveFontSize(1.6),
        color: "#888",
    },
    logoutBtn: {
        backgroundColor: "#1A1A1A",
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: responsiveWidth(5),
        gap: 10,
        marginBottom: 25,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1A1A1A',
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
        alignItems: 'center',
    },
    statLabel: {
        color: '#888',
        fontSize: 12,
        marginBottom: 5,
    },
    statValue: {
        color: '#C67C4E',
        fontSize: 18,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        paddingHorizontal: responsiveWidth(6),
        marginBottom: 15,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    listContainer: {
        paddingHorizontal: responsiveWidth(5),
        paddingBottom: 30,
    },
    orderCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#333",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        color: "#C67C4E",
        fontSize: 10,
        fontWeight: "bold",
    },
    timeText: {
        color: "#666",
        fontSize: 12,
    },
    productInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    iconBox: {
        width: 44,
        height: 44,
        backgroundColor: "#222",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    details: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    qtyText: {
        fontSize: 12,
        color: "#888",
    },
    priceText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#C67C4E",
    },
    divider: {
        height: 1,
        backgroundColor: "#222",
        marginVertical: 12,
    },
    customerSection: {
        gap: 6,
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    infoValue: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
    },
    addressValue: {
        color: "#888",
        fontSize: 13,
        flex: 1,
    },
    distanceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 10,
    },
    distanceText: {
        color: '#C67C4E',
        fontSize: 12,
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
    },
    actionBtn: {
        backgroundColor: "#C67C4E",
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    actionBtnText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "bold",
    },
    trackBtn: {
        backgroundColor: "#333",
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#444",
    },
    waitingBadge: {
        backgroundColor: '#222',
        width: "100%",
        height: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: '#333',
    },
    waitingText: {
        color: '#888',
        fontSize: 14,
        fontStyle: 'italic',
    },
    emptyState: {
        alignItems: "center",
        marginTop: 60,
    },
    emptyText: {
        color: "#333",
        marginTop: 15,
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#0F0F0F',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#1A1A1A',
        paddingTop: responsiveHeight(6),
    },
    modalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalMap: {
        flex: 1,
    },
    modalFooter: {
        backgroundColor: '#1A1A1A',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
    },
    modalInfo: {
        marginBottom: 20,
    },
    modalCustomer: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    modalAddress: {
        color: '#888',
        fontSize: 14,
        marginBottom: 10,
    },
    modalDist: {
        color: '#C67C4E',
        fontSize: 16,
        fontWeight: 'bold',
    },
    riderMarker: {
        width: 40,
        height: 40,
        backgroundColor: '#C67C4E',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    customerMarker: {
        width: 32,
        height: 32,
        backgroundColor: '#2A2A2A',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
});
