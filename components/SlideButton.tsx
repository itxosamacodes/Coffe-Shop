import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
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

interface SlideButtonProps {
    onComplete: () => void;
    title?: string;
    width?: number;
}

const BUTTON_HEIGHT = responsiveHeight(8);
const BUTTON_PADDING = 6;
const HANDLE_SIZE = BUTTON_HEIGHT - BUTTON_PADDING * 2;

const SlideButton: React.FC<SlideButtonProps> = ({
    onComplete,
    title = "Slide to Get Started",
    width = responsiveWidth(84),
}) => {
    const SWIPE_RANGE = width - HANDLE_SIZE - BUTTON_PADDING * 2;
    const translateX = useSharedValue(0);

    // Reset button state whenever the screen is focused
    useFocusEffect(
        useCallback(() => {
            translateX.value = 0;
        }, [])
    );

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
            <View style={[styles.slideButtonTrack, { width }]}>
                <Animated.View style={[styles.slideButtonHandle, animatedHandleStyle]}>
                    <Ionicons name="cafe" size={24} color="#000" />
                </Animated.View>
                <Animated.View style={[styles.slideButtonTextContainer, animatedTextStyle]}>
                    <Text style={styles.slideButtonText}>{title}</Text>
                </Animated.View>
            </View>
        </GestureDetector>
    );
};

export default SlideButton;

const styles = StyleSheet.create({
    slideButtonTrack: {
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
