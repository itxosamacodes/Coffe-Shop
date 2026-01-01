import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapView, { Marker, Polyline } from "react-native-maps";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";

// Shop location: 33.6323° N, 72.9228° E
const SHOP_LOCATION = {
  latitude: 33.6323,
  longitude: 72.9228,
};

const MapScreen = () => {
  const params = useLocalSearchParams();
  const deliveryAddress = (params.address as string) || "Jl. Kpg Sutoyo";

  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);
  const snapPoints = useMemo(() => ["5%", "28%"], []);

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<string>("Calculating...");
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState<"standard" | "satellite" | "hybrid">("standard");

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  // Distance calculation using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d.toFixed(2);
  };

  const fetchUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(userCoords);

      const dist = calculateDistance(SHOP_LOCATION.latitude, SHOP_LOCATION.longitude, userCoords.latitude, userCoords.longitude);
      setDistance(`${dist} km`);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching location:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserLocation();
  }, []);

  const locateSelf = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    } else {
      fetchUserLocation();
    }
  };

  const toggleMapStyle = () => {
    setMapType((current) => {
      if (current === "standard") return "satellite";
      if (current === "satellite") return "hybrid";
      return "standard";
    });
  };

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
          {/* Shop Marker */}
          <Marker
            coordinate={SHOP_LOCATION}
            title="Coffee Shop"
          >
            <View style={styles.markerContainer}>
              <View style={styles.shopMarkerCircle}>
                <Ionicons name="cafe" size={16} color="white" />
                <View style={styles.riderBadge}>
                  <Ionicons name="bicycle" size={10} color="#C67C4E" />
                </View>
              </View>
              <View style={styles.markerLabelBox}>
                <Text style={styles.markerLabelText}>Coffee Shop</Text>
              </View>
            </View>
          </Marker>

          {/* User Marker */}
          {userLocation && (
            <>
              <Marker
                coordinate={userLocation}
                title="Your Location"
              >
                <View style={styles.markerContainer}>
                  <View style={styles.userMarkerCircle}>
                    <Ionicons name="person-circle" size={32} color="white" />
                  </View>
                </View>
              </Marker>

              {/* Line from Shop to User */}
              <Polyline
                coordinates={[SHOP_LOCATION, userLocation]}
                strokeColor="#C67C4E"
                strokeWidth={4}
                lineDashPattern={[5, 5]}
              />
            </>
          )}
        </MapView>

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconBox}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={styles.iconBox} onPress={toggleMapStyle}>
              <Ionicons
                name={mapType === "satellite" ? "map-outline" : "layers-outline"}
                size={24}
                color="black"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBox} onPress={locateSelf}>
              <Ionicons name="locate-outline" size={28} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          enablePanDownToClose={false}
        >
          <BottomSheetView style={styles.bttomBar}>
            {loading ? (
              <ActivityIndicator size="large" color="#C67C4E" />
            ) : (
              <>
                <Text style={styles.timeText}>{distance} away</Text>

                <View style={styles.addressRow}>
                  <Text style={styles.addressLabel}>Delivery to</Text>
                  <Text style={styles.address} numberOfLines={1}>{deliveryAddress}</Text>
                </View>

                {/* Simplified profile section */}
                <View style={styles.profile}>
                  <Image
                    source={require("../../assets/AppImg/u.jpeg")}
                    style={styles.PimgBox}
                    transition={200}
                  />
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.cardTitle}>Brooklyn Simmons</Text>
                    <Text style={styles.cardSub}>Personal Courier</Text>
                  </View>

                  <TouchableOpacity style={styles.callBtn}>
                    <Ionicons name="call-outline" size={24} color="#C67C4E" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </BottomSheetView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, zIndex: 0 },
  map: { flex: 1 },
  header: {
    flexDirection: "row",
    height: responsiveHeight(12),
    width: "90%",
    position: "absolute",
    top: responsiveHeight(5),
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  iconBox: {
    height: responsiveHeight(6),
    width: responsiveHeight(6),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopMarkerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C67C4E',
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userMarkerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C67C4E', // Changed to primary color
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  riderBadge: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    backgroundColor: 'white',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C67C4E',
  },
  markerLabelBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  markerLabelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2F2D2C',
  },

  bttomBar: {
    padding: responsiveWidth(5),
    alignItems: "center",
    justifyContent: "space-between",
    gap: responsiveHeight(2),
  },

  timeText: {
    fontSize: responsiveFontSize(3),
    fontWeight: "700",
    color: "#2F2D2C",
  },

  addressRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  addressLabel: {
    fontSize: responsiveFontSize(1.8),
    color: "grey",
    marginRight: 5,
  },

  address: {
    fontSize: responsiveFontSize(2),
    fontWeight: "600",
    color: "#2F2D2C",
  },

  deliverd: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: responsiveWidth(4),
    backgroundColor: "#fafafa",
    width: "100%",
  },

  imgBox: {
    width: responsiveWidth(14),
    height: responsiveWidth(14),
    borderRadius: 12,
  },

  profile: {
    flexDirection: "row",
    alignItems: "center",
    padding: responsiveWidth(4),
    borderRadius: 14,
    backgroundColor: "#fafafa",
    width: "100%",
  },

  PimgBox: {
    width: responsiveWidth(14),
    height: responsiveWidth(14),
    borderRadius: 12,
  },

  cardTitle: {
    fontSize: responsiveFontSize(2),
    fontWeight: "600",
    color: "#2F2D2C",
  },

  cardSub: {
    fontSize: responsiveFontSize(1.6),
    color: "grey",
    marginTop: 2,
  },

  callBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: responsiveWidth(2),
    borderRadius: 12,
  },
});

export default MapScreen;
