import { supabase } from "@/utils/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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

export default function RiderVerificationScreen() {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [otp, setOtp] = useState("");
    const { email, mode, role } = useLocalSearchParams();

    const handleVerify = async () => {
        setErrorMsg("");
        if (!otp) {
            setErrorMsg("Please enter the 6-digit OTP");
            return;
        }
        if (otp.length !== 6) {
            setErrorMsg("The OTP should be exactly 6 digits");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.verifyOtp({
            email: email as string,
            token: otp.trim(),
            type: "email",
        });
        setLoading(false);

        if (error) {
            setErrorMsg(error.message);
        } else {
            if (mode === "signUp") {
                router.replace("/(auth)/pendingApproval");
            } else {
                router.replace({
                    pathname: "/(auth)/riderSetNewPass",
                    params: { email }
                });
            }
        }
    };

    const resendOtp = async () => {
        const { error } = await supabase.auth.signInWithOtp({
            email: email as string,
        });
        if (!error) {
            alert(`A new OTP has been sent to: ${email}`);
        } else {
            alert(error.message);
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
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                <View style={styles.logoContainer}>
                    <View style={styles.logoBackground}>
                        <MaterialIcons name="verified-user" size={50} color="#C87941" />
                    </View>
                </View>

                <Text style={styles.title}>Rider Verification</Text>
                <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <MaterialIcons
                            name="lock-outline"
                            size={20}
                            color="#999"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="000 000"
                            placeholderTextColor="#666"
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.resendBtn} onPress={resendOtp}>
                    <Text style={styles.resendText}>Didn't receive code? Resend</Text>
                </TouchableOpacity>

                {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text style={styles.verifyButtonText}>Verify & Proceed</Text>
                    )}
                </TouchableOpacity>
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
        paddingTop: 80,
        paddingBottom: 40,
        alignItems: 'center',
    },
    backBtn: {
        position: 'absolute',
        top: 50,
        left: 20,
        padding: 10,
    },
    logoContainer: {
        marginBottom: 30,
    },
    logoBackground: {
        width: 90,
        height: 90,
        borderRadius: 25,
        backgroundColor: "#2a2a2a",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#333",
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
        color: "#888",
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 20,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2a2a2a",
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 60,
        borderWidth: 1,
        borderColor: "#333",
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: "#fff",
        fontSize: 20,
        letterSpacing: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    resendBtn: {
        marginBottom: 40,
    },
    resendText: {
        color: "#C87941",
        fontSize: 14,
        fontWeight: '500',
    },
    errorText: {
        color: "#ff4444",
        marginBottom: 20,
        textAlign: "center",
    },
    verifyButton: {
        backgroundColor: "#C87941",
        borderRadius: 12,
        height: 56,
        width: '100%',
        justifyContent: "center",
        alignItems: "center",
    },
    verifyButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
