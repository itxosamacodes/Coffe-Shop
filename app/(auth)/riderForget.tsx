import { supabase } from "@/utils/supabase";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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

export default function RiderForgetScreen() {
    const [email, setEmail] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleForget = async () => {
        setErrorMsg("");
        if (!email.trim()) {
            setErrorMsg("Please enter your email address");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim().toLowerCase(),
            options: {
                shouldCreateUser: false,
            },
        });

        setLoading(false);

        if (error) {
            setErrorMsg("No account found with this email.");
            return;
        }

        router.push({
            pathname: "/(auth)/riderVerification",
            params: { email: email.trim().toLowerCase(), mode: "reset", role: 'rider' },
        });
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
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                <Text style={styles.title}>Rider Help</Text>
                <Text style={styles.subtitle}>
                    Enter your registered rider email to receive a password reset OTP.
                </Text>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <MaterialIcons name="email" size={20} color="#999" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Rider Email Address"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleForget}
                    disabled={loading}
                >
                    <Text style={styles.sendButtonText}>
                        {loading ? <ActivityIndicator size="small" color="white" /> : "Send Reset Code"}
                    </Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Found your password? </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/riderSignIn")}>
                        <Text style={styles.footerLink}>Login</Text>
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
        justifyContent: "center",
    },
    backBtn: {
        position: 'absolute',
        top: 50,
        left: 20,
        padding: 10,
    },
    title: {
        fontSize: 28,
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
        paddingHorizontal: 20,
    },
    inputContainer: {
        marginBottom: 20,
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
    sendButton: {
        backgroundColor: "#C87941",
        borderRadius: 12,
        height: 56,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    sendButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    footerText: {
        color: "#999",
        fontSize: 14,
    },
    footerLink: {
        color: "#C87941",
        fontSize: 14,
        fontWeight: "600",
    },
});
