import { supabase } from "@/utils/supabase";
import { Feather, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveWidth,
} from "react-native-responsive-dimensions";

export default function RiderLoginScreen() {
    const [email, setEmail] = useState("syedusama4435@gmail.com");
    const [password, setPassword] = useState("123123");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = async () => {
        setErrorMsg("");
        if (!email || !password) {
            setErrorMsg("Please fill all fields");
            return;
        }

        setLoading(true);
        const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            setLoading(false);
            setErrorMsg(error.message);
            return;
        }

        if (authData.user) {
            // Check if user is a rider
            const { data: riderData, error: riderError } = await supabase
                .from("riders")
                .select("status")
                .eq("user_id", authData.user.id)
                .single();

            setLoading(false);

            if (riderError && riderError.code !== "PGRST116") {
                setErrorMsg(riderError.message);
                return;
            }

            if (riderData) {
                if (riderData.status === "approved") {
                    router.replace("/(rider)/dashboard");
                } else if (riderData.status === "pending") {
                    router.replace("/(auth)/pendingApproval");
                } else {
                    setErrorMsg("Your application was rejected. Please contact support.");
                }
            } else {
                // Not a rider, maybe a customer trying to login here?
                setErrorMsg("This account is not registered as a rider.");
            }
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={["#000000", "#0F1210"]}
                style={StyleSheet.absoluteFillObject}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section */}
                    <Animated.View
                        entering={FadeInDown.delay(200).duration(800)}
                        style={styles.headerContainer}
                    >
                        <View style={styles.logoIcon}>
                            <MaterialCommunityIcons name="bike" size={32} color="#C67C4E" />
                        </View>
                        <Text style={styles.welcomeText}>Rider Portal</Text>
                        <Text style={styles.subtitle}>
                            Log in to start your delivery shift.
                        </Text>
                    </Animated.View>

                    {/* Form Section */}
                    <Animated.View
                        entering={FadeInDown.delay(400).duration(800)}
                        style={styles.formContainer}
                    >
                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Rider Email</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons
                                    name="email"
                                    size={20}
                                    color="#999"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="rider@coffeeapp.com"
                                    placeholderTextColor="#666"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <Feather
                                    name="lock"
                                    size={20}
                                    color="#999"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#666"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Feather
                                        name={showPassword ? "eye" : "eye-off"}
                                        size={20}
                                        color="#999"
                                        style={styles.eyeIcon}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Forgot Password */}
                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={() => router.push("/(auth)/riderForget")}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

                        {/* Login Button */}
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size={"small"} color={"white"} />
                            ) : (
                                <Text style={styles.loginButtonText}>Login to Dashboard</Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Footer Section */}
                    <Animated.View
                        entering={FadeInUp.delay(600).duration(800)}
                        style={styles.footerContainer}
                    >
                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>Not a rider yet? </Text>
                            <TouchableOpacity onPress={() => router.push("/(auth)/riderSignUp")}>
                                <Text style={styles.registerLink}>Register Here</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: responsiveWidth(8),
        paddingTop: responsiveHeight(10),
        paddingBottom: responsiveHeight(5),
    },
    headerContainer: {
        alignItems: "center",
        marginBottom: responsiveHeight(6),
    },
    logoIcon: {
        width: 60,
        height: 60,
        borderRadius: 15,
        backgroundColor: "rgba(198, 124, 78, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(198, 124, 78, 0.2)",
    },
    welcomeText: {
        fontSize: responsiveFontSize(4),
        fontWeight: "800",
        color: "#fff",
        textAlign: "center",
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: responsiveFontSize(1.8),
        color: "#A2A2A2",
        textAlign: "center",
        lineHeight: 22,
    },
    formContainer: {
        marginBottom: responsiveHeight(4),
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: responsiveFontSize(1.6),
        color: "#fff",
        marginBottom: 8,
        fontWeight: "600",
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 60,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: "#fff",
        fontSize: responsiveFontSize(1.8),
    },
    eyeIcon: {
        padding: 4,
    },
    error: {
        color: "#FF4B4B",
        textAlign: "center",
        marginBottom: 16,
        fontSize: responsiveFontSize(1.6),
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: 30,
    },
    forgotPasswordText: {
        color: "#C67C4E",
        fontSize: responsiveFontSize(1.6),
        fontWeight: "600",
    },
    loginButton: {
        backgroundColor: "#C67C4E",
        borderRadius: 16,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#C67C4E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    loginButtonText: {
        color: "#fff",
        fontSize: responsiveFontSize(2),
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    footerContainer: {
        alignItems: "center",
    },
    registerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    registerText: {
        color: "#A2A2A2",
        fontSize: responsiveFontSize(1.8),
    },
    registerLink: {
        color: "#C67C4E",
        fontSize: responsiveFontSize(1.8),
        fontWeight: "700",
    },
});
