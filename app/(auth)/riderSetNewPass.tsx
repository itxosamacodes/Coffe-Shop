import { supabase } from "@/utils/supabase";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function RiderSetNewPassScreen() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { email } = useLocalSearchParams();

    const handleUpdatePassword = async () => {
        setErrorMsg("");
        if (!password || !confirmPassword) {
            setErrorMsg("Please fill in all fields");
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setErrorMsg("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({
            password: password,
        });
        setLoading(false);

        if (error) {
            setErrorMsg(error.message);
        } else {
            Alert.alert("Success", "Your password has been reset successfully!", [
                { text: "Login Now", onPress: () => router.replace("/(auth)/riderSignIn") }
            ]);
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
                        <MaterialIcons name="lock-reset" size={50} color="#C87941" />
                    </View>
                </View>

                <Text style={styles.title}>Set New Password</Text>
                <Text style={styles.subtitle}>Create a strong password for your rider account</Text>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Feather name="lock" size={20} color="#999" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="New Password"
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

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Feather name="lock" size={20} color="#999" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm New Password"
                            placeholderTextColor="#666"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
                        />
                    </View>
                </View>

                {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleUpdatePassword}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text style={styles.updateButtonText}>Update Password</Text>
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
        marginBottom: 16,
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
        fontSize: 16,
    },
    errorText: {
        color: "#ff4444",
        marginBottom: 20,
        textAlign: "center",
    },
    updateButton: {
        backgroundColor: "#C87941",
        borderRadius: 12,
        height: 56,
        width: '100%',
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    updateButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
