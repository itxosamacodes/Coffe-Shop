import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

const Welcome = () => {
  return (
    <View style={styles.container}>
      {/* Decorative Background Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <Animated.View
        entering={FadeInDown.delay(100).duration(1000).springify()}
        style={styles.header}
      >
        <Text style={styles.title}>Choose your Role</Text>
        <Text style={styles.subtitle}>
          Select how youll start your journey with us today.
        </Text>
      </Animated.View>

      <View style={styles.content}>
        <Animated.View
          entering={FadeInDown.delay(300).duration(1000).springify()}
        >
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => router.push("/(auth)/signIn")}
          >
            <View style={styles.iconWrapper}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="coffee" size={32} color="#C67C4E" />
              </View>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Coffee Lover</Text>
              <Text style={styles.cardDesc}>
                Explore menus, place orders, and enjoy your brew.
              </Text>
            </View>
            <MaterialCommunityIcons
              name="arrow-right-circle"
              size={32}
              color="#C67C4E"
            />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(500).duration(1000).springify()}
        >
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => router.push("/(auth)/signIn")}
          >
            <View style={styles.iconWrapper}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="bike" size={36} color="#C67C4E" />
              </View>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Rider</Text>
              <Text style={styles.cardDesc}>
                Join our fleet, deliver happiness, and earn.
              </Text>
            </View>
            <MaterialCommunityIcons
              name="arrow-right-circle"
              size={32}
              color="#C67C4E"
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
    paddingHorizontal: responsiveWidth(6),
    justifyContent: "center",
    position: "relative",
  },
  decorativeCircle1: {
    position: "absolute",
    top: -responsiveHeight(10),
    right: -responsiveWidth(20),
    width: responsiveWidth(80),
    height: responsiveWidth(80),
    borderRadius: responsiveWidth(40),
    backgroundColor: "rgba(198, 124, 78, 0.05)",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -responsiveHeight(5),
    left: -responsiveWidth(20),
    width: responsiveWidth(60),
    height: responsiveWidth(60),
    borderRadius: responsiveWidth(30),
    backgroundColor: "rgba(198, 124, 78, 0.03)",
  },
  header: {
    marginBottom: responsiveHeight(6),
    marginTop: responsiveHeight(5),
    alignItems: "center",
  },
  title: {
    fontSize: responsiveFontSize(4),
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: responsiveHeight(1.5),
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: responsiveFontSize(1.8),
    color: "#A2A2A2",
    textAlign: "center",
    lineHeight: responsiveFontSize(2.8),
    paddingHorizontal: responsiveWidth(5),
  },
  content: {
    gap: responsiveHeight(2.5),
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    padding: responsiveWidth(5),
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  iconWrapper: {
    marginRight: responsiveWidth(4),
  },
  iconContainer: {
    width: responsiveWidth(16),
    height: responsiveWidth(16),
    backgroundColor: "rgba(198, 124, 78, 0.1)",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(198, 124, 78, 0.2)",
  },
  textContainer: {
    flex: 1,
    paddingRight: responsiveWidth(2),
  },
  cardTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: responsiveHeight(0.5),
  },
  cardDesc: {
    fontSize: responsiveFontSize(1.6),
    color: "#888888",
    lineHeight: responsiveFontSize(2.2),
  },
});
