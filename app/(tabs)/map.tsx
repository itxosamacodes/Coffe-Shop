import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import MapboxGL from "@rnmapbox/maps";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

MapboxGL.setAccessToken(
  "pk.eyJ1Ijoic2hvYWliMjciLCJhIjoiY21qaDBqOXhyMTZtODNjcXpwdzk1a3U5MyJ9.nX11n_uZd8pgvX9PC3IDgA"
);

export default function MapScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["5%", "35%"], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <MapboxGL.MapView style={styles.map}>
          <MapboxGL.Camera
            zoomLevel={12}
            centerCoordinate={[67.0011, 24.8607]}
          />
        </MapboxGL.MapView>

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconBox}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={32} color="black" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBox}>
            <Ionicons name="locate-outline" size={32} color="black" />
          </TouchableOpacity>
        </View>

        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          enablePanDownToClose={false}
        >
          <BottomSheetView style={styles.bttomBar}>
            <Text style={styles.timeText}>10 minutes left</Text>

            <View style={styles.addressRow}>
              <Text style={styles.addressLabel}>Delivery to</Text>
              <Text style={styles.address}>Jl. Kpg Sutoyo</Text>
            </View>

            <View style={styles.deliverd}>
              <Image
                source={require("../../assets/detailsImg/img1.png")}
                style={styles.imgBox}
              />
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.cardTitle}>Delivered your order</Text>
                <Text style={styles.cardSub}>
                  We will deliver your goods in the shortest possible time.
                </Text>
              </View>
            </View>

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
                <Ionicons name="call-outline" size={26} />
              </TouchableOpacity>
            </View>
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
    height: 100,
    width: "90%",
    position: "absolute",
    top: 30,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBox: {
    height: 50,
    width: 50,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },

  bttomBar: {
    padding: 20,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },

  timeText: {
    fontSize: 26,
    fontWeight: "700",
  },

  addressRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  addressLabel: {
    fontSize: 16,
    color: "grey",
    marginRight: 5,
  },

  address: {
    fontSize: 18,
    fontWeight: "600",
  },

  deliverd: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 15,
    backgroundColor: "#fafafa",
    width: "90%",
  },

  imgBox: {
    width: 55,
    height: 55,
    borderRadius: 12,
  },

  profile: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 14,
    backgroundColor: "#fafafa",
    width: "90%",
  },

  PimgBox: {
    width: 55,
    height: 55,
    borderRadius: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  cardSub: {
    fontSize: 14,
    color: "grey",
    marginTop: 2,
  },

  callBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    borderRadius: 12,
  },
});
