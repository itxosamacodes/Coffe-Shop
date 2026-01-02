import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    interpolate,
    Extrapolate
} from "react-native-reanimated";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import { supabase } from "../utils/supabase";

const OrderTracking = () => {
    const params = useLocalSearchParams();
    const orderId = params.orderId as string;
    const [status, setStatus] = useState<string>("pending");

    // Animation values
    const pulse = useSharedValue(1);
    const rotation = useSharedValue(0);

    useEffect(() => {
        // Start pulsing animation
        pulse.value = withRepeat(withTiming(1.2, { duration: 1000 }), -1, true);
        // Start rotation for radar
        rotation.value = withRepeat(withTiming(360, { duration: 2500 }), -1, false);

        let pollingInterval: any;

        if (orderId) {
            fetchInitialStatus();
            const subscription = subscribeToOrder();

            // Fallback: Poll every 4 seconds in case Realtime fails
            pollingInterval = setInterval(() => {
                fetchInitialStatus();
            }, 4000);

            return () => {
                subscription.unsubscribe();
                clearInterval(pollingInterval);
            };
        }
    }, [orderId]);

    const fetchInitialStatus = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('status')
            .eq('id', orderId)
            .single();

        if (data) {
            handleStatusChange(data.status);
        }
    };

    const subscribeToOrder = () => {
        return supabase
            .channel(`tracking_${orderId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `id=eq.${orderId}`
            }, (payload) => {
                handleStatusChange(payload.new.status);
            })
            .subscribe();
    };

    const handleStatusChange = (newStatus: string) => {
        console.log(`[DEBUG] OrderTracking: Order ${orderId} status changed to: ${newStatus}`);
        setStatus(newStatus);

        const statusLower = newStatus.toLowerCase();

        if (statusLower === 'approved') {
            console.log(`[DEBUG] Redirecting to waiting-for-rider screen`);
            router.replace({
                pathname: "/waiting-for-rider",
                params: { orderId: orderId }
            });
            return;
        }

        // Handle rejection
        if (statusLower === 'rejected') {
            console.log(`[DEBUG] Order was rejected`);
            Alert.alert(
                "Order Rejected",
                "Sorry, your order was rejected by the shop. Please try again later or contact support.",
                [{
                    text: "OK",
                    onPress: () => router.replace("/(tabs)/home")
                }]
            );
            return;
        }

        // If rider accepted, move to delivery screen
        if (['accepted', 'picked_up', 'delivered'].includes(statusLower)) {
            console.log(`[DEBUG] Redirecting to delivery screen for order ${orderId}`);
            router.replace({
                pathname: "/(tabs)/delivery",
                params: { orderId: orderId }
            });
        }
    };

    // Animated Styles
    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
        opacity: interpolate(pulse.value, [1, 1.2], [0.8, 1], Extrapolate.CLAMP)
    }));

    const renderContent = () => {
        // We only handle "pending" here now. "approved" has its own screen.
        return (
            <View style={styles.content}>
                <Animated.View style={[styles.iconCircle, pulseStyle]}>
                    <Ionicons name="cafe" size={80} color="#C67C4E" />
                </Animated.View>
                <Text style={styles.title}>Waiting for Admin Approval</Text>
                <Text style={styles.subtitle}>The shop is reviewing your delicious order. Hang tight!</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.topBack}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
            </View>
            {renderContent()}
            <View style={styles.footer}>
                <Text style={styles.orderIdText}>Order ID: {orderId ? orderId.slice(0, 8).toUpperCase() : "..."}</Text>
            </View>
        </View>
    );
};

export default OrderTracking;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F0F0F",
        justifyContent: "center",
        alignItems: "center",
    },
    topBack: {
        position: "absolute",
        top: responsiveHeight(7),
        right: 20,
    },
    closeBtn: {
        backgroundColor: "rgba(255,255,255,0.1)",
        padding: 10,
        borderRadius: 50,
    },
    content: {
        alignItems: "center",
        paddingHorizontal: 40,
    },
    iconCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: "rgba(198, 124, 78, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
        borderWidth: 1,
        borderColor: "rgba(198, 124, 78, 0.3)",
    },
    radarContainer: {
        width: 220,
        height: 220,
        borderRadius: 110,
        borderWidth: 1,
        borderColor: "rgba(198, 124, 78, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
        overflow: "hidden",
    },
    radarSweep: {
        position: "absolute",
        width: "100%",
        height: "100%",
        borderRadius: 110,
        backgroundColor: "transparent",
        borderTopWidth: 110,
        borderTopColor: "transparent",
        borderRightWidth: 110,
        borderRightColor: "rgba(198, 124, 78, 0.05)",
        borderBottomWidth: 110,
        borderBottomColor: "transparent",
        borderLeftWidth: 110,
        borderLeftColor: "transparent",
        opacity: 0.5,
    },
    innerCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(198, 124, 78, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    dot: {
        position: "absolute",
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#C67C4E",
        opacity: 0.6,
    },
    title: {
        fontSize: responsiveFontSize(3),
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 15,
    },
    subtitle: {
        fontSize: responsiveFontSize(1.8),
        color: "#888",
        textAlign: "center",
        lineHeight: 24,
    },
    footer: {
        position: "absolute",
        bottom: 50,
    },
    orderIdText: {
        color: "#444",
        fontSize: 12,
        letterSpacing: 2,
    },
    closeIcon: {
        padding: 10,
    }
});
