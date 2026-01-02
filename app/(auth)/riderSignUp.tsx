import { Feather, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../../utils/supabase";

export default function RiderSignUpScreen() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [vehicleType, setVehicleType] = useState("");
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSignUp = async () => {
        if (!fullName || !email || !password || !confirmPassword || !phone || !vehicleType || !vehicleNumber) {
            setErrorMsg("Please fill all fields");
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match");
            return;
        }

        setErrorMsg("");
        setLoading(true);

        try {
            // 1. Auth Signup
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: 'rider'
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // Check if user already exists (identity check for Supabase)
                if (authData.user.identities?.length === 0) {
                    setErrorMsg("This email is already registered. Please sign in.");
                    setLoading(false);
                    return;
                }

                // 2. Insert into Riders table
                const { error: riderError } = await supabase.from('riders').insert([
                    {
                        user_id: authData.user.id,
                        full_name: fullName,
                        email: email,
                        phone: phone,
                        vehicle_type: vehicleType,
                        vehicle_number: vehicleNumber,
                        status: 'pending'
                    }
                ]);

                if (riderError) {
                    console.error("Rider Insert Error:", riderError);
                    if (riderError.code === '23503') {
                        throw new Error("Database link failed. Please contact support.");
                    }
                    throw riderError;
                }

                // 3. Initialize Rider Stats
                const { error: statsError } = await supabase.from('rider_stats').insert([
                    {
                        rider_id: authData.user.id,
                        total_earnings: 0,
                        total_deliveries: 0
                    }
                ]);

                if (statsError) {
                    console.error("Stats Insert Error:", statsError);
                    // We don't necessarily want to block registration if stats fail, 
                    // but we should know about it.
                }

                router.replace({
                    pathname: "/(auth)/riderVerification",
                    params: { email, mode: "signUp", role: "rider" },
                });
            }
        } catch (error: any) {
            console.error("Signup Catch Error:", error);
            setErrorMsg(error.message || "An error occurred during signup");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.logoContainer}>
                    <View style={styles.logoBackground}>
                        <MaterialCommunityIcons name="bike" size={60} color={"#C87941"} />
                    </View>
                </View>

                <Text style={styles.title}>Rider Registration</Text>
                <Text style={styles.subtitle}>Join our fleet and start earning</Text>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Feather name="user" size={20} color="#999" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            placeholderTextColor="#999"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <MaterialIcons name="email" size={20} color="#999" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Feather name="phone" size={20} color="#999" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            placeholderTextColor="#999"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="car-cog" size={20} color="#999" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Vehicle"
                                placeholderTextColor="#999"
                                value={vehicleType}
                                onChangeText={setVehicleType}
                            />
                        </View>
                    </View>
                    <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="numeric" size={20} color="#999" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Number"
                                placeholderTextColor="#999"
                                value={vehicleNumber}
                                onChangeText={setVehicleNumber}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Feather name="lock" size={20} color="#999" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#999" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Feather name="lock" size={20} color="#999" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            placeholderTextColor="#999"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
                        />
                    </View>
                </View>

                {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                <TouchableOpacity
                    style={styles.registerButton}
                    onPress={handleSignUp}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.registerButtonText}>Register as Rider</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/riderSignIn")}>
                        <Text style={styles.loginLink}>Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    scrollContent: {
        paddingHorizontal: 30,
        paddingTop: 60,
        paddingBottom: 40,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    logoBackground: {
        width: 100,
        height: 100,
        borderRadius: 20,
        backgroundColor: "#2a2a2a",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#2a2a2a",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 16,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: "#2a2a2a",
        fontSize: 15,
    },
    errorText: {
        color: "red",
        textAlign: "center",
        marginBottom: 16,
    },
    registerButton: {
        backgroundColor: "#C87941",
        borderRadius: 12,
        height: 56,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 24,
    },
    registerButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    loginText: {
        color: "#666",
        fontSize: 14,
    },
    loginLink: {
        color: "#C87941",
        fontSize: 14,
        fontWeight: "600",
    },
});
