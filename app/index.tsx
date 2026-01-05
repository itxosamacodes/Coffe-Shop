import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from "react-native-reanimated";
import {
  responsiveFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from "react-native-responsive-dimensions";
import SlideButton from "../components/SlideButton";
import { supabase } from "../utils/supabase";

const Index = () => {
  // Animation values
  const imageScale = useSharedValue(1.1);
  const imageOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(40);
  const textOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      console.log("Session found, checking role for:", session.user.id);

      // 1. Check if Rider
      const { data: riderData, error: riderError } = await supabase
        .from("riders")
        .select("status")
        .eq("user_id", session.user.id)
        .single();

      if (riderData) {
        if (riderData.status === "approved") {
          router.replace("/(rider)/dashboard");
          return;
        } else if (riderData.status === "pending") {
          router.replace("/(auth)/pendingApproval");
          return;
        }
      }

      // 2. Check if Admin (via coffee_lovers role)
      const { data: loverData } = await supabase
        .from("coffee_lovers")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (loverData?.role === "admin") {
        router.replace("/(admin)/dashboard");
        return;
      }

      // 3. Default to Customer Home if session exists but not a rider/admin
      router.replace("/(tabs)/home");
    } else {
      // No session, start splash animations
      startAnimations();
    }
  };

  const startAnimations = () => {
    // Sequence of animations
    imageOpacity.value = withTiming(1, { duration: 1200 });
    imageScale.value = withTiming(1, { duration: 2000 });

    textTranslateY.value = withDelay(600, withSpring(0, { damping: 12 }));
    textOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));

    buttonOpacity.value = withDelay(1400, withTiming(1, { duration: 1000 }));
  };

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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
            <SlideButton
              title="Get Started"
              onComplete={() => router.replace("/(auth)/onboarding")}
            />
          </Animated.View>
        </View>
      </View>
    </GestureHandlerRootView>
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
});

export default Index;
