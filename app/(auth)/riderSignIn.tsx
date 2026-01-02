import { supabase } from "@/utils/supabase";
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
                .from('riders')
                .select('status')
                .eq('user_id', authData.user.id)
                .single();

            setLoading(false);

            if (riderError && riderError.code !== 'PGRST116') {
                setErrorMsg(riderError.message);
                return;
            }

            if (riderData) {
                if (riderData.status === 'approved') {
                    router.replace("/(rider)/dashboard");
                } else if (riderData.status === 'pending') {
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
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.imageContainer}>
                    <View style={styles.iconOuter}>
                        <MaterialCommunityIcons name="bike" size={60} color={"#C87941"} />
                    </View>
                </View>

                <Text style={styles.welcomeText}>Rider Login</Text>
                <Text style={styles.subtitle}>
                    Securely login to start your delivery shifts.
                </Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Rider Email</Text>
                    <View style={styles.inputWrapper}>
                        <MaterialIcons name="email" size={20} color="#999" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor="#666"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputWrapper}>
                        <Feather name="lock" size={20} color="#999" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor="#666"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#999" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={() => router.push("/(auth)/riderForget")}
                >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.loginButtonText}>
                        {loading ? <ActivityIndicator size="small" color="white" /> : "Login"}
                    </Text>
                </TouchableOpacity>

                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>Not a rider yet? </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/riderSignUp")}>
                        <Text style={styles.registerLink}>Register Here</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a1a",
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingTop: 60,
        paddingBottom: 40,
    },
    imageContainer: {
        alignItems: "center",
        marginBottom: 40,
    },
    iconOuter: {
        width: 100,
        height: 100,
        borderRadius: 60,
        backgroundColor: "#2a2a2a",
        justifyContent: "center",
        alignItems: "center",
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: "#fff",
        marginBottom: 8,
        fontWeight: "500",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2a2a2a",
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: "#fff",
        fontSize: 15,
    },
    error: {
        color: "red",
        textAlign: "center",
        marginBottom: 16,
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: "#C87941",
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: "#C87941",
        borderRadius: 12,
        height: 56,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    registerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    registerText: {
        color: "#999",
        fontSize: 14,
    },
    registerLink: {
        color: "#C87941",
        fontSize: 14,
        fontWeight: "600",
    },
});
