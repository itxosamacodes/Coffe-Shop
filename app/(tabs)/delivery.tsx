import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapView, { Marker, Polyline } from "react-native-maps";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useTheme } from "../../context/ThemeContext";
import { CafeLocation, getCafeLocation } from "../../utils/cafeLocations";
import { supabase } from "../../utils/supabase";

const MapScreen = () => {
  const params = useLocalSearchParams();
  const { theme, isDark } = useTheme();
  const orderId = params.orderId as string;
  const deliveryAddress = (params.address as string) || "Jl. Kpg Sutoyo";

  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);
  const snapPoints = useMemo(() => ["20%", "35%"], []);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [riderLocation, setRiderLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [riderInfo, setRiderInfo] = useState<{
    name: string;
    phone: string;
  } | null>(null);
  const [orderDetails, setOrderDetails] = useState<{
    item_name: string;
    quantity: number;
    total_price: number;
  } | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("pending");
  const [distance, setDistance] = useState<string>("Calculating...");
  const [eta, setEta] = useState<string>("...");
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState<"standard" | "satellite" | "hybrid">(
    "standard"
  );
  const [cafeLocation, setCafeLocation] = useState<CafeLocation>(
    getCafeLocation()
  );

  useEffect(() => {
    fetchUserLocation();
    let unsubscribe: any = null;
    if (orderId) {
      fetchOrderDetails();
      unsubscribe = subscribeToOrder();
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [orderId]);

  const fetchOrderDetails = async () => {
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (order) {
      setOrderStatus(order.status);
      setOrderDetails({
        item_name: order.item_name,
        quantity: order.quantity,
        total_price: Number(order.total_price),
      });
      if (order.rider_lat && order.rider_lng) {
        setRiderLocation({
          latitude: Number(order.rider_lat),
          longitude: Number(order.rider_lng),
        });
      }

      if (order.customer_lat && order.customer_lng) {
        // Use stored delivery location instead of current phone location for the marker
        setUserLocation({
          latitude: Number(order.customer_lat),
          longitude: Number(order.customer_lng),
        });
      }

      // Set cafe location based on customer's city
      if (order.customer_city) {
        setCafeLocation(getCafeLocation(order.customer_city));
      }

      if (order.rider_id) {
        fetchRiderInfo(order.rider_id);
      }
    }
  };

  const fetchRiderInfo = async (riderUserId: string) => {
    const { data: rider, error } = await supabase
      .from("riders")
      .select("full_name, phone")
      .eq("user_id", riderUserId)
      .single();

    if (rider) {
      setRiderInfo({
        name: rider.full_name,
        phone: rider.phone,
      });
    }
  };

  const subscribeToOrder = () => {
    const subscription = supabase
      .channel(`order_tracking_${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newOrder = payload.new;
          setOrderStatus(newOrder.status);
          if (newOrder.rider_id) {
            fetchRiderInfo(newOrder.rider_id);
          }
          if (newOrder.rider_lat && newOrder.rider_lng) {
            setRiderLocation({
              latitude: Number(newOrder.rider_lat),
              longitude: Number(newOrder.rider_lng),
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleReceived = async () => {
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (!order) return;

    // 1. Mark as completed
    await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("id", orderId);

    // 2. Archive to completed_orders
    const { error: archiveError } = await supabase
      .from("completed_orders")
      .insert({
        order_id: orderId,
        rider_id: order.rider_id,
        user_id: order.user_id,
        item_name: order.item_name,
        total_price: order.total_price,
      });

    // 3. Update rider stats
    if (!archiveError && order.rider_id) {
      // Using increment logic via RPC or simple select/update
      const { data: currentStats } = await supabase
        .from("rider_stats")
        .select("*")
        .eq("rider_id", order.rider_id)
        .single();
      if (currentStats) {
        await supabase
          .from("rider_stats")
          .update({
            total_earnings:
              Number(currentStats.total_earnings) + Number(order.total_price),
            total_deliveries: currentStats.total_deliveries + 1,
            last_updated: new Date(),
          })
          .eq("rider_id", order.rider_id);
      } else {
        await supabase.from("rider_stats").insert({
          rider_id: order.rider_id,
          total_earnings: order.total_price,
          total_deliveries: 1,
        });
      }
    }

    Alert.alert("Success", "Hope you enjoy your coffee!");
    router.replace("/(tabs)/home");
  };

  // Haversine distance
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return "0.00";
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const fetchUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      // Only set user location if not already set by order details
      setUserLocation((prev) => prev || userCoords);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
      let dist;
      if (riderLocation) {
        dist = calculateDistance(
          riderLocation.latitude,
          riderLocation.longitude,
          userLocation.latitude,
          userLocation.longitude
        );
      } else {
        dist = calculateDistance(
          cafeLocation.latitude,
          cafeLocation.longitude,
          userLocation.latitude,
          userLocation.longitude
        );
      }
      setDistance(`${dist} km`);
      // ETA calculation: dist / 20kmh * 60 min/h
      const minutes = Math.ceil((Number(dist) / 20) * 60);
      setEta(`${minutes} min`);
    }
  }, [userLocation, riderLocation, cafeLocation]);

  const locateSelf = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        { ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        1000
      );
    }
  };

  const fitMap = () => {
    if (!mapRef.current) return;
    const coords = [];
    if (cafeLocation) coords.push(cafeLocation);
    if (userLocation) coords.push(userLocation);
    if (riderLocation) coords.push(riderLocation);

    if (coords.length >= 2) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
        animated: true,
      });
    }
  };

  useEffect(() => {
    if (!loading && (userLocation || riderLocation)) {
      fitMap();
    }
  }, [loading, userLocation, riderLocation, orderStatus]);

  /* New state for route coordinates */
  const [routeCoordinates, setRouteCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  useEffect(() => {
    const updateRoute = async () => {
      let start, end;

      // Logic:
      // 1. Pending/Approved -> Cafe to User
      // 2. Accepted -> Rider to Cafe
      // 3. Picked Up/Delivered -> Rider to User

      if (orderStatus === "pending" || orderStatus === "approved") {
        start = cafeLocation;
        end = userLocation;
      } else if (orderStatus === "accepted") {
        start = riderLocation || cafeLocation;
        end = cafeLocation;
      } else {
        start = riderLocation || cafeLocation;
        end = userLocation;
      }

      if (start && end) {
        const { getRoute } = require("../../utils/routing");
        const coords = await getRoute(
          start.latitude,
          start.longitude,
          end.latitude,
          end.longitude
        );
        setRouteCoordinates(coords);
      }
    };

    updateRoute();
  }, [riderLocation, userLocation, orderStatus, cafeLocation]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          mapType={mapType}
          initialRegion={{
            latitude: cafeLocation.latitude,
            longitude: cafeLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={{
              latitude: cafeLocation.latitude,
              longitude: cafeLocation.longitude,
            }}
            title={cafeLocation.name}
          >
            <View style={styles.markerContainer}>
              <View style={styles.shopMarkerCircle}>
                <Ionicons name="cafe" size={16} color="white" />
              </View>
            </View>
          </Marker>

          {userLocation && (
            <Marker coordinate={userLocation} title="Your Location">
              <View style={styles.userMarkerCircle}>
                <Ionicons name="person" size={18} color="white" />
              </View>
            </Marker>
          )}

          {riderLocation && (
            <Marker coordinate={riderLocation} title="Rider Location">
              <View style={styles.riderMarkerCircle}>
                <MaterialCommunityIcons name="bike" size={24} color="white" />
              </View>
            </Marker>
          )}

          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#C67C4E"
              strokeWidth={4}
            />
          )}
        </MapView>

        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.iconBox, { backgroundColor: theme.surface }]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBox, { backgroundColor: theme.surface }]} onPress={locateSelf}>
            <Ionicons name="locate" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          handleIndicatorStyle={{ backgroundColor: theme.border, width: 40 }}
          backgroundStyle={{ backgroundColor: theme.surface }}
        >
          <BottomSheetView style={[styles.bottomBar, { backgroundColor: theme.surface }]}>
            {loading ? (
              <ActivityIndicator color="#C67C4E" />
            ) : (
              <Animated.View entering={FadeIn.duration(500)}>
                <Animated.View layout={Layout.springify()}>
                  <Text style={[styles.statusTitle, { color: theme.text }]}>
                    {orderStatus === "delivered"
                      ? "📍 Rider has arrived!"
                      : orderStatus === "picked_up"
                        ? "🚴 Rider is on the way!"
                        : orderStatus === "accepted"
                          ? "🏃 Preparing your delivery..."
                          : orderStatus === "approved"
                            ? "☕ Finding the best rider..."
                            : orderStatus === "pending"
                              ? "⏳ Waiting for approval..."
                              : "✨ Your coffee is ready!"}
                  </Text>
                </Animated.View>

                {orderDetails && (
                  <View style={[styles.orderSummary, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <Text style={[styles.orderDetailText, { color: theme.textMuted }]}>
                      {orderDetails.quantity}x {orderDetails.item_name}
                    </Text>
                    <Text style={[styles.orderPriceText, { color: theme.primary }]}>
                      ${orderDetails.total_price.toFixed(2)}
                    </Text>
                  </View>
                )}

                <View style={styles.progressRow}>
                  <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                  <View
                    style={[
                      styles.line,
                      {
                        backgroundColor:
                          ["accepted", "picked_up", "delivered"].includes(orderStatus)
                            ? theme.primary
                            : theme.border,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          ["accepted", "picked_up", "delivered"].includes(orderStatus)
                            ? theme.primary
                            : theme.border,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.line,
                      {
                        backgroundColor:
                          orderStatus === "delivered" ? theme.primary : theme.border,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          orderStatus === "delivered" ? theme.primary : theme.border,
                      },
                    ]}
                  />
                </View>

                <View style={[styles.profile, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <View style={[styles.iconContainer, { backgroundColor: isDark ? "rgba(198, 124, 78, 0.2)" : "#F9F2ED" }]}>
                    <MaterialCommunityIcons
                      name="bike"
                      size={32}
                      color={theme.primary}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: responsiveWidth(4) }}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      {riderInfo ? riderInfo.name : "Finding Courier..."}
                    </Text>
                    <Text style={[styles.cardSub, { color: theme.textMuted }]}>
                      {distance} • {eta} {orderStatus === "accepted" ? "to cafe" : "away"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.callBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() =>
                      riderInfo && Linking.openURL(`tel:${riderInfo.phone}`)
                    }
                  >
                    <Ionicons name="call" size={20} color={theme.primary} />
                  </TouchableOpacity>
                </View>

                {orderStatus === "delivered" && (
                  <TouchableOpacity
                    style={styles.receiveBtn}
                    onPress={handleReceived}
                  >
                    <Text style={styles.receiveBtnText}>Order Received</Text>
                  </TouchableOpacity>
                )}
              </Animated.View>
            )}
          </BottomSheetView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  header: {
    flexDirection: "row",
    position: "absolute",
    top: responsiveHeight(6),
    width: "100%",
    paddingHorizontal: responsiveWidth(5),
    justifyContent: "space-between",
  },
  iconBox: {
    height: 48,
    width: 48,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  markerContainer: { alignItems: "center" },
  shopMarkerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#C67C4E",
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  userMarkerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2F2D2C",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  riderMarkerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#C67C4E",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    borderWidth: 2,
    borderColor: "white",
  },
  bottomBar: {
    padding: responsiveWidth(5),
    alignItems: "center",
  },
  statusTitle: {
    fontSize: responsiveFontSize(2.4),
    fontWeight: "800",
    color: "#2F2D2C",
    marginBottom: responsiveHeight(1.5),
    textAlign: "center",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(3),
    justifyContent: "center"
  },
  dot: { width: 14, height: 14, borderRadius: 7 },
  line: { width: responsiveWidth(15), height: 4, marginHorizontal: 6, borderRadius: 2 },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    padding: responsiveWidth(4),
    borderRadius: 18,
    backgroundColor: "#F9F9F9",
    width: "100%",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 14,
    backgroundColor: "#F9F2ED",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: responsiveFontSize(2), fontWeight: "700", color: "#2F2D2C" },
  cardSub: { fontSize: responsiveFontSize(1.6), color: "#777", marginTop: 2 },
  callBtn: {
    borderWidth: 1,
    borderColor: "#EAEAEA",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "white",
  },
  orderSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
    backgroundColor: "#FDFDFD",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  orderDetailText: {
    fontSize: responsiveFontSize(1.8),
    color: "#555",
    fontWeight: "600",
  },
  orderPriceText: {
    fontSize: responsiveFontSize(1.8),
    color: "#C67C4E",
    fontWeight: "bold",
  },
  receiveBtn: {
    backgroundColor: "#C67C4E",
    width: "100%",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: responsiveHeight(2.5),
    shadowColor: "#C67C4E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  receiveBtnText: {
    color: "white",
    fontSize: responsiveFontSize(2),
    fontWeight: "bold",
  },
});

export default MapScreen;
