import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  responsiveFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from "react-native-responsive-dimensions";

const index = () => {
  return (
    <View style={styles.HomeScreen}>
      <View style={styles.img}>
        <Image source={require("../assets/AppImg/home.png")} />
      </View>
      <View style={styles.textArea}>
        <Text style={styles.titel}>
          Fall in Love with Coffee in Blissful Delight!
        </Text>
        <Text style={styles.subtitel}>
          Welcome to our cozy coffee corner, where every cup is a delightful for
          you.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push("/(auth)/welcome");
          }}
        >
          <Text style={styles.buttonTitel}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { marginTop: 10, backgroundColor: "#333" }]}
          onPress={() => {
            router.push("/admin/dashboard");
          }}
        >
          <Text style={styles.buttonTitel}>Admin Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  HomeScreen: {
    flex: 1,
    backgroundColor: "#050505",

    alignItems: "center",
  },
  img: {
    flex: 1,
  },
  textArea: {
    alignItems: "center",
    flex: 1,
    justifyContent: "space-evenly",
  },
  titel: {
    color: "#FFFFFF",
    fontSize: responsiveFontSize(5),
    textAlign: "center",
    fontWeight: "600",
  },
  subtitel: {
    marginHorizontal: responsiveScreenWidth(10),
    color: "#A2A2A2",
    fontSize: responsiveFontSize(2),
    textAlign: "center",
    fontWeight: "400",
  },
  button: {
    width: responsiveScreenWidth(90),
    height: responsiveScreenHeight(7),
    backgroundColor: "#C67C4E",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: responsiveScreenWidth(4),
  },
  buttonTitel: {
    fontSize: responsiveFontSize(2.1),
    color: "#FFFFFF",
    fontWeight: "500",
  },
});
export default index;
