import MapboxGL from "@rnmapbox/maps";
import React from "react";
import { StyleSheet, View } from "react-native";

MapboxGL.setAccessToken(process.env.MAPBOX_ACCESS_TOKEN!);

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera zoomLevel={12} centerCoordinate={[67.0011, 24.8607]} />
      </MapboxGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
