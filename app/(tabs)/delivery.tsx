import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapView, { Marker, Polyline } from "react-native-maps";
import { supabase } from "../../utils/supabase";

// Shop location: 31.5204 N, 74.3587 E (Matched with Rider Dashboard)
const SHOP_LOCATION = {
  latitude: 31.5204,
  longitude: 74.3587,
};

const MapScreen = () => {
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  const deliveryAddress = (params.address as string) || "Jl. Kpg Sutoyo";

  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);
  const snapPoints = useMemo(() => ["20%", "35%"], []);

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [riderLocation, setRiderLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [riderInfo, setRiderInfo] = useState<{ name: string; phone: string } | null>(null);
  const [orderDetails, setOrderDetails] = useState<{ item_name: string; quantity: number; total_price: number } | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("pending");
  const [distance, setDistance] = useState<string>("Calculating...");
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState<"standard" | "satellite" | "hybrid">("standard");

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
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (order) {
      setOrderStatus(order.status);
      setOrderDetails({
        item_name: order.item_name,
        quantity: order.quantity,
        total_price: Number(order.total_price)
      });
      if (order.rider_lat && order.rider_lng) {
        setRiderLocation({
          latitude: Number(order.rider_lat),
          longitude: Number(order.rider_lng)
        });
      }

      if (order.customer_lat && order.customer_lng) {
        // Use stored delivery location instead of current phone location for the marker
        setUserLocation({
          latitude: Number(order.customer_lat),
          longitude: Number(order.customer_lng)
        });
      }

      if (order.rider_id) {
        fetchRiderInfo(order.rider_id);
      }
    }
  };

  const fetchRiderInfo = async (riderUserId: string) => {
    const { data: rider, error } = await supabase
      .from('riders')
      .select('full_name, phone')
      .eq('user_id', riderUserId)
      .single();

    if (rider) {
      setRiderInfo({
        name: rider.full_name,
        phone: rider.phone
      });
    }
  };

  const subscribeToOrder = () => {
    const subscription = supabase
      .channel(`order_tracking_${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      }, (payload) => {
        const newOrder = payload.new;
        setOrderStatus(newOrder.status);
        if (newOrder.rider_id) {
          fetchRiderInfo(newOrder.rider_id);
        }
        if (newOrder.rider_lat && newOrder.rider_lng) {
          setRiderLocation({
            latitude: Number(newOrder.rider_lat),
            longitude: Number(newOrder.rider_lng)
          });
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleReceived = async () => {
    const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
    if (!order) return;

    // 1. Mark as completed
    await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId);

    // 2. Archive to completed_orders
    const { error: archiveError } = await supabase.from('completed_orders').insert({
      order_id: orderId,
      rider_id: order.rider_id,
      user_id: order.user_id,
      item_name: order.item_name,
      total_price: order.total_price
    });

    // 3. Update rider stats
    if (!archiveError && order.rider_id) {
      // Using increment logic via RPC or simple select/update
      const { data: currentStats } = await supabase.from('rider_stats').select('*').eq('rider_id', order.rider_id).single();
      if (currentStats) {
        await supabase.from('rider_stats').update({
          total_earnings: Number(currentStats.total_earnings) + Number(order.total_price),
          total_deliveries: currentStats.total_deliveries + 1,
          last_updated: new Date()
        }).eq('rider_id', order.rider_id);
      } else {
        await supabase.from('rider_stats').insert({
          rider_id: order.rider_id,
          total_earnings: order.total_price,
          total_deliveries: 1
        });
      }
    }

    Alert.alert("Success", "Hope you enjoy your coffee!");
    router.replace("/(tabs)/home");
  };

  // Haversine distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return "0.00";
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const fetchUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const userCoords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      // Only set user location if not already set by order details
      setUserLocation(prev => prev || userCoords);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
      let dist;
      if (riderLocation) {
        dist = calculateDistance(riderLocation.latitude, riderLocation.longitude, userLocation.latitude, userLocation.longitude);
      } else {
        dist = calculateDistance(SHOP_LOCATION.latitude, SHOP_LOCATION.longitude, userLocation.latitude, userLocation.longitude);
      }
      setDistance(`${dist} km`);
    }
  }, [userLocation, riderLocation]);

  const locateSelf = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({ ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
    }
  };

  /* New state for route coordinates */
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);

  /* Import the routing utility at the top of the file - added here for context, ensure it's imported */
  // import { getRoute } from "../../utils/routing"; 

  useEffect(() => {
    /* Fetch route whenever rider or user location changes */
    const updateRoute = async () => {
      let start, end;

      if (riderLocation) start = riderLocation;
      else start = SHOP_LOCATION;

      if (userLocation) end = userLocation;

      if (start && end) {
        /* Dynamically import or assume it is imported */
        const { getRoute } = require("../../utils/routing");
        const coords = await getRoute(start.latitude, start.longitude, end.latitude, end.longitude);
        setRouteCoordinates(coords);
      }
    };

    updateRoute();
  }, [riderLocation, userLocation]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          mapType={mapType}
          initialRegion={{
            ...SHOP_LOCATION,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={SHOP_LOCATION} title="Coffee Shop">
            <View style={styles.markerContainer}>
              <View style={styles.shopMarkerCircle}><Ionicons name="cafe" size={16} color="white" /></View>
            </View>
          </Marker>

          {userLocation && (
            <Marker coordinate={userLocation} title="You">
              <View style={styles.userMarkerCircle}><Ionicons name="person" size={18} color="white" /></View>
            </Marker>
          )}

          {riderLocation && (
            <Marker coordinate={riderLocation} title="Rider">
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
          <TouchableOpacity style={styles.iconBox} onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color="black" /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBox} onPress={locateSelf}><Ionicons name="locate" size={24} color="black" /></TouchableOpacity>
        </View>

        <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} enablePanDownToClose={false}>
          <BottomSheetView style={styles.bttomBar}>
            {loading ? <ActivityIndicator color="#C67C4E" /> : (
              <>
                <Text style={styles.statusTitle}>
                  {orderStatus === 'picked_up' ? "🚴 Rider is on the way with your coffee!" :
                    orderStatus === 'accepted' ? "✅ Rider accepted! Heading to the shop..." :
                      orderStatus === 'delivered' ? "📍 Rider has arrived! Please confirm receipt." : "☕ Preparing your coffee..."}
                </Text>

                {orderDetails && (
                  <View style={styles.orderSummary}>
                    <Text style={styles.orderDetailText}>
                      {orderDetails.quantity}x {orderDetails.item_name}
                    </Text>
                    <Text style={styles.orderPriceText}>
                      ${orderDetails.total_price.toFixed(2)}
                    </Text>
                  </View>
                )}

                <View style={styles.progressRow}>
                  <View style={[styles.dot, { backgroundColor: '#C67C4E' }]} />
                  <View style={[styles.line, { backgroundColor: (orderStatus === 'accepted' || orderStatus === 'picked_up' || orderStatus === 'delivered') ? '#C67C4E' : '#eee' }]} />
                  <View style={[styles.dot, { backgroundColor: (orderStatus === 'accepted' || orderStatus === 'picked_up' || orderStatus === 'delivered') ? '#C67C4E' : '#eee' }]} />
                  <View style={[styles.line, { backgroundColor: orderStatus === 'delivered' ? '#C67C4E' : '#eee' }]} />
                  <View style={[styles.dot, { backgroundColor: orderStatus === 'delivered' ? '#C67C4E' : '#eee' }]} />
                </View>

                <View style={styles.profile}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="bike" size={32} color="#C67C4E" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.cardTitle}>{riderInfo ? riderInfo.name : "Courier Assigned"}</Text>
                    <Text style={styles.cardSub}>{distance} {riderLocation ? "from you" : "to your door"}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => riderInfo && Linking.openURL(`tel:${riderInfo.phone}`)}
                  >
                    <Ionicons name="call" size={20} color="#C67C4E" />
                  </TouchableOpacity>
                </View>

                {orderStatus === 'delivered' && (
                  <TouchableOpacity style={styles.receiveBtn} onPress={handleReceived}>
                    <Text style={styles.receiveBtnText}>Order Received</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </BottomSheetView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  header: {
    flexDirection: "row",
    position: "absolute",
    top: 50,
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'space-between'
  },
  iconBox: {
    height: 44,
    width: 44,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    elevation: 4,
  },
  markerContainer: { alignItems: 'center' },
  shopMarkerCircle: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#C67C4E', borderWidth: 2, borderColor: 'white', alignItems: 'center', justifyContent: 'center'
  },
  userMarkerCircle: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#2F2D2C', alignItems: 'center', justifyContent: 'center'
  },
  riderMarkerCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#C67C4E', alignItems: 'center', justifyContent: 'center', elevation: 5
  },
  bttomBar: { padding: 20, alignItems: "center" },
  statusTitle: { fontSize: 20, fontWeight: "bold", color: "#2F2D2C", marginBottom: 15 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  line: { width: 60, height: 3, marginHorizontal: 5 },
  profile: { flexDirection: "row", alignItems: "center", padding: 15, borderRadius: 16, backgroundColor: "#fafafa", width: "100%" },
  iconContainer: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#F9F2ED', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardSub: { fontSize: 13, color: "grey" },
  callBtn: { borderWidth: 1, borderColor: "#ddd", padding: 8, borderRadius: 12 },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 10,
  },
  orderDetailText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '600',
  },
  orderPriceText: {
    fontSize: 14,
    color: '#C67C4E',
    fontWeight: 'bold',
  },
  receiveBtn: { backgroundColor: "#C67C4E", width: "100%", height: 50, borderRadius: 14, justifyContent: "center", alignItems: "center", marginTop: 20 },
  receiveBtnText: { color: "white", fontSize: 16, fontWeight: "bold" }
});

export default MapScreen;
