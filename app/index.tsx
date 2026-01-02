import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate
} from "react-native-reanimated";
import {
  responsiveFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from "react-native-responsive-dimensions";

const Index = () => {
  // Animation values
  const imageScale = useSharedValue(1.1);
  const imageOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(40);
  const textOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    // Sequence of animations
    imageOpacity.value = withTiming(1, { duration: 1200 });
    imageScale.value = withTiming(1, { duration: 2000 });

    textTranslateY.value = withDelay(600, withSpring(0, { damping: 12 }));
    textOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));

    buttonOpacity.value = withDelay(1400, withTiming(1, { duration: 1000 }));

    const timer = setTimeout(() => {
      // Automatic redirect after animations
      // router.replace("/(auth)/onboarding"); 
      // Keeping it interactive or slightly longer for the "WOW" effect
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
    opacity: imageOpacity.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textTranslateY.value }],
    opacity: textOpacity.value,
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: interpolate(buttonOpacity.value, [0, 1], [20, 0], Extrapolate.CLAMP) }]
  }));

  return (
    <View style={styles.container}>
      {/* Background Image Area */}
      <Animated.View style={[styles.imgContainer, animatedImageStyle]}>
        <Image
          source={require("../assets/AppImg/home.png")}
          style={styles.image}
          contentFit="cover"
          priority="high"
        />
        <View style={styles.gradientOverlay} />
      </Animated.View>

      {/* Text & Content Area */}
      <View style={styles.contentArea}>
        <Animated.View style={[styles.textArea, animatedTextStyle]}>
          <Text style={styles.title}>
            Fall in Love with Coffee in <Text style={styles.highlight}>Blissful</Text> Delight!
          </Text>
          <Text style={styles.subtitle}>
            Welcome to our cozy coffee corner, where every cup is a delightful moment for you.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
          <TouchableOpacity
            style={styles.mainBtn}
            onPress={() => router.push("/(auth)/onboarding")}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  imgContainer: {
    width: responsiveScreenWidth(100),
    height: responsiveScreenHeight(65),
    position: 'absolute',
    top: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)', // Subtle darkening
    // In a real app, you'd use Expo LinearGradient here for a smoother transition
  },
  contentArea: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: responsiveScreenHeight(8),
    paddingHorizontal: responsiveScreenWidth(8),
  },
  textArea: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    color: "#FFFFFF",
    fontSize: responsiveFontSize(4.2),
    textAlign: "center",
    fontWeight: "700",
    lineHeight: responsiveFontSize(5.5),
  },
  highlight: {
    color: "#C67C4E", // Branding color
  },
  subtitle: {
    color: "#A2A2A2",
    fontSize: responsiveFontSize(1.8),
    textAlign: "center",
    fontWeight: "400",
    marginTop: 15,
    lineHeight: 24,
  },
  buttonWrapper: {
    width: '100%',
  },
  mainBtn: {
    backgroundColor: "#C67C4E",
    height: 62,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#C67C4E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  btnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default Index;
