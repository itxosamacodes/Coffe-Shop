import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import MapboxGL from "@rnmapbox/maps";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";

MapboxGL.setAccessToken(
  "pk.eyJ1Ijoic2hvYWliMjciLCJhIjoiY21qaDBqOXhyMTZtODNjcXpwdzk1a3U5MyJ9.nX11n_uZd8pgvX9PC3IDgA"
);

// Shop location: 33.6323° N, 72.9228° E
const SHOP_LOCATION: [number, number] = [72.9228, 33.6323];

export default function MapScreen() {
  const params = useLocalSearchParams();
  const deliveryAddress = (params.address as string) || "Jl. Kpg Sutoyo";

  const bottomSheetRef = useRef<BottomSheet>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const snapPoints = useMemo(() => ["5%", "28%"], []);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<string>("Calculating...");
  const [loading, setLoading] = useState(true);
  const [mapStyleIndex, setMapStyleIndex] = useState(0);

  const mapStyles = [
    MapboxGL.StyleURL.Light,
    MapboxGL.StyleURL.Satellite,
    MapboxGL.StyleURL.Street,
  ];

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
      const userCoords: [number, number] = [location.coords.longitude, location.coords.latitude];
      setUserLocation(userCoords);

      const dist = calculateDistance(SHOP_LOCATION[1], SHOP_LOCATION[0], userCoords[1], userCoords[0]);
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
    if (userLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: userLocation,
        zoomLevel: 14,
        animationDuration: 1000,
      });
    } else {
      fetchUserLocation();
    }
  };

  const toggleMapStyle = () => {
    setMapStyleIndex((current) => (current + 1) % mapStyles.length);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <MapboxGL.MapView style={styles.map} styleURL={mapStyles[mapStyleIndex]}>
          <MapboxGL.Camera
            ref={cameraRef}
            zoomLevel={12}
            centerCoordinate={SHOP_LOCATION}
          />

          {/* Shop Marker */}
          <MapboxGL.PointAnnotation
            id="shopMarker"
            coordinate={SHOP_LOCATION}
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
          </MapboxGL.PointAnnotation>

          {/* User Marker */}
          {userLocation && (
            <>
              <MapboxGL.PointAnnotation
                id="userMarker"
                coordinate={userLocation}
              >
                <View style={styles.markerContainer}>
                  <View style={styles.userMarkerCircle}>
                    <Ionicons name="person-circle" size={32} color="white" />
                  </View>
                </View>
              </MapboxGL.PointAnnotation>

              {/* Line from Shop to User */}
              <MapboxGL.ShapeSource
                id="routeSource"
                shape={{
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: [SHOP_LOCATION, userLocation],
                  },
                  properties: {},
                }}
              >
                <MapboxGL.LineLayer
                  id="routeLayer"
                  style={{
                    lineColor: "#C67C4E",
                    lineWidth: 4,
                    lineJoin: "round",
                    lineCap: "round",
                    lineDasharray: [2, 2], // Optional: make it dashed
                  }}
                />
              </MapboxGL.ShapeSource>
            </>
          )}
        </MapboxGL.MapView>

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
                name={mapStyleIndex === 1 ? "map-outline" : "layers-outline"}
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
    width: 40,
    height: 40,
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
    zIndex: 10,
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
