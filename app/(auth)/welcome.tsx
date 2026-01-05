import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  FadeInDown,
  FadeInUp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

const BUTTON_WIDTH = responsiveWidth(84);
const BUTTON_HEIGHT = responsiveHeight(8);
const BUTTON_PADDING = 6;
const HANDLE_SIZE = BUTTON_HEIGHT - BUTTON_PADDING * 2;
const SWIPE_RANGE = BUTTON_WIDTH - HANDLE_SIZE - BUTTON_PADDING * 2;

const SlideButton = ({ onComplete }: { onComplete: () => void }) => {
  const translateX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = Math.max(0, Math.min(event.translationX, SWIPE_RANGE));
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_RANGE * 0.8) {
        translateX.value = withSpring(SWIPE_RANGE);
        runOnJS(onComplete)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: 1 - translateX.value / SWIPE_RANGE,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.slideButtonTrack}>
        <Animated.View style={[styles.slideButtonHandle, animatedHandleStyle]}>
          <Ionicons name="cafe" size={24} color="#000" />
        </Animated.View>
        <Animated.View style={[styles.slideButtonTextContainer, animatedTextStyle]}>
          <Text style={styles.slideButtonText}>Slide to Get Started</Text>
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

const Welcome = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ImageBackground
          source={require("../../assets/AppImg/cofe2.jpeg")}
          style={styles.background}
          imageStyle={{
            resizeMode: "cover",
          }}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.8)", "#12100E"]}
            style={styles.gradient}
          >
            <View style={styles.content}>
              {/* Logo and Name */}
              <Animated.View
                entering={FadeInDown.delay(200).duration(800)}
                style={styles.logoContainer}
              >
                <View style={styles.logoIcon}>
                  <Ionicons name="cafe" size={32} color="#C67C4E" />
                </View>
                <Text style={styles.logoText}>CoffeeApp</Text>
              </Animated.View>

              {/* Main Content */}
              <View style={styles.mainTextContainer}>
                <Animated.Text
                  entering={FadeInDown.delay(400).duration(800)}
                  style={styles.title}
                >
                  Wake up to{"\n"}
                  <Text style={styles.highlightText}>fresh brewing.</Text>
                </Animated.Text>

                <Animated.Text
                  entering={FadeInDown.delay(600).duration(800)}
                  style={styles.subtitle}
                >
                  Experience coffee like never before.{"\n"}
                  Slide to begin your journey.
                </Animated.Text>
              </View>

              {/* Buttons Area */}
              <View style={styles.buttonArea}>
                <Animated.View entering={FadeInUp.delay(800).duration(800).springify()}>
                  <SlideButton onComplete={() => router.push("/(auth)/signIn")} />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(1000).duration(800).springify()}>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    activeOpacity={0.8}
                    onPress={() => router.push("/(auth)/riderSignIn")}
                  >
                    <View
                      style={[styles.btnIconContainer, { backgroundColor: "#2A2A2A" }]}
                    >
                      <MaterialCommunityIcons name="bike" size={24} color="#FFF" />
                    </View>
                    <Text style={styles.secondaryBtnText}>Start as a Rider</Text>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View
                  entering={FadeInUp.delay(1200).duration(800)}
                  style={styles.loginContainer}
                >
                  <Text style={styles.loginText}>
                    Already have an account?{" "}
                    <Text
                      style={styles.loginLink}
                      onPress={() => router.replace("/(auth)/signIn")}
                    >
                      Log In
                    </Text>
                  </Text>
                </Animated.View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    </GestureHandlerRootView>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: responsiveWidth(8),
    paddingBottom: responsiveHeight(5),
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: responsiveHeight(8),
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logoText: {
    fontSize: responsiveFontSize(3),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  mainTextContainer: {
    marginTop: responsiveHeight(15),
    alignItems: "center",
  },
  title: {
    fontSize: responsiveFontSize(5.5),
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: responsiveFontSize(6.5),
  },
  highlightText: {
    color: "#C67C4E",
  },
  subtitle: {
    fontSize: responsiveFontSize(1.8),
    color: "#A2A2A2",
    textAlign: "center",
    lineHeight: responsiveFontSize(2.8),
    marginTop: responsiveHeight(2.5),
  },
  buttonArea: {
    gap: responsiveHeight(2),
  },
  secondaryBtn: {
    backgroundColor: "#24201D",
    flexDirection: "row",
    alignItems: "center",
    height: responsiveHeight(8),
    borderRadius: 24,
    paddingHorizontal: 15,
  },
  secondaryBtnText: {
    fontSize: responsiveFontSize(2),
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
    marginRight: 20,
  },
  btnIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  loginContainer: {
    alignItems: "center",
    marginTop: responsiveHeight(1),
  },
  loginText: {
    fontSize: responsiveFontSize(1.8),
    color: "#A2A2A2",
  },
  loginLink: {
    color: "#FFFFFF",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  // Slide Button Styles
  slideButtonTrack: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: BUTTON_HEIGHT / 2,
    padding: BUTTON_PADDING,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  slideButtonHandle: {
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    backgroundColor: "#C67C4E",
    borderRadius: HANDLE_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  slideButtonTextContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1,
  },
  slideButtonText: {
    color: "#FFFFFF",
    fontSize: responsiveFontSize(2),
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
