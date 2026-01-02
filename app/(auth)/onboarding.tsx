import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState, useRef } from "react";
import {
    Dimensions,
    ScrollView, // Import ScrollView type
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveWidth,
} from "react-native-responsive-dimensions";

const { width } = Dimensions.get("window");

const ONBOARDING_DATA = [
    {
        id: 1,
        title: "Premium Coffee Choice",
        subtitle: "Our beans are carefully selected to ensure the highest quality and richest aroma in every cup.",
        image: require("../../assets/AppImg/onboarding1.png"),
    },
    {
        id: 2,
        title: "Fast & Hot Delivery",
        subtitle: "Experience lightning-fast delivery that keeps your coffee at the perfect temperature.",
        image: require("../../assets/AppImg/onboarding2.png"),
    },
    {
        id: 3,
        title: "Rewards For Every Sip",
        subtitle: "Join our loyalty program and earn points with every purchase for exclusive discounts.",
        image: require("../../assets/AppImg/onboarding3.png"),
    },
];

export default function Onboarding() {
    const scrollX = useSharedValue(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);

    const onScroll = useAnimatedScrollHandler((event) => {
        scrollX.value = event.contentOffset.x;
    });

    const handleNext = () => {
        if (currentIndex < ONBOARDING_DATA.length - 1) {
            scrollRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
            setCurrentIndex(currentIndex + 1);
        } else {
            router.replace("/(auth)/welcome");
        }
    };

    const Pagination = () => {
        return (
            <View style={styles.paginationContainer}>
                {ONBOARDING_DATA.map((_, index) => {
                    const animatedDotStyle = useAnimatedStyle(() => {
                        const dotWidth = interpolate(
                            scrollX.value,
                            [(index - 1) * width, index * width, (index + 1) * width],
                            [10, 24, 10],
                            Extrapolate.CLAMP
                        );
                        const opacity = interpolate(
                            scrollX.value,
                            [(index - 1) * width, index * width, (index + 1) * width],
                            [0.3, 1, 0.3],
                            Extrapolate.CLAMP
                        );
                        return {
                            width: dotWidth,
                            opacity,
                        };
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[styles.dot, animatedDotStyle]}
                        />
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.skipBtn}
                onPress={() => router.replace("/(auth)/welcome")}
            >
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <Animated.ScrollView
                ref={scrollRef as any}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(e) => {
                    setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
                }}
            >
                {ONBOARDING_DATA.map((item, index) => {
                    const animatedImageStyle = useAnimatedStyle(() => {
                        const scale = interpolate(
                            scrollX.value,
                            [(index - 1) * width, index * width, (index + 1) * width],
                            [0.8, 1, 0.8],
                            Extrapolate.CLAMP
                        );
                        return { transform: [{ scale }] };
                    });

                    return (
                        <View key={item.id} style={styles.page}>
                            <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
                                <Image
                                    source={item.image}
                                    style={styles.image}
                                    contentFit="cover"
                                />
                            </Animated.View>
                            <View style={styles.textContainer}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.subtitle}>{item.subtitle}</Text>
                            </View>
                        </View>
                    );
                })}
            </Animated.ScrollView>

            <View style={styles.footer}>
                <Pagination />
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>
                        {currentIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Next"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#050505",
    },
    skipBtn: {
        position: "absolute",
        top: responsiveHeight(6),
        right: responsiveWidth(6),
        zIndex: 10,
        padding: 10,
    },
    skipText: {
        color: "#A2A2A2",
        fontSize: responsiveFontSize(1.8),
        fontWeight: "500",
    },
    page: {
        width: width,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: responsiveWidth(10),
    },
    imageContainer: {
        width: responsiveWidth(85),
        height: responsiveHeight(45),
        borderRadius: 30,
        overflow: "hidden",
        marginBottom: responsiveHeight(5),
        shadowColor: "#C67C4E",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    textContainer: {
        alignItems: "center",
    },
    title: {
        color: "#FFFFFF",
        fontSize: responsiveFontSize(3.5),
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 15,
    },
    subtitle: {
        color: "#A2A2A2",
        fontSize: responsiveFontSize(2),
        textAlign: "center",
        lineHeight: 28,
    },
    footer: {
        paddingHorizontal: responsiveWidth(10),
        paddingBottom: responsiveHeight(5),
    },
    paginationContainer: {
        flexDirection: "row",
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: "#C67C4E",
        marginHorizontal: 5,
    },
    button: {
        backgroundColor: "#C67C4E",
        height: responsiveHeight(7.5),
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: responsiveFontSize(2.2),
        fontWeight: "600",
    },
});

