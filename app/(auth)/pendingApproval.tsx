import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../utils/supabase";

export default function PendingApprovalScreen() {
    const checkStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('riders')
            .select('status')
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error(error);
            return;
        }

        if (data && data.status === 'approved') {
            router.replace("/(rider)/dashboard");
        } else if (data && data.status === 'rejected') {
            alert("Your account has been rejected. Please contact support.");
        } else {
            alert("Your account is still under review.");
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.replace("/(auth)/riderSignIn");
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="clock-check-outline" size={80} color="#C87941" />
                </View>

                <Text style={styles.title}>Registration Pending</Text>
                <Text style={styles.subtitle}>
                    Thank you for joining us! Your application is currently under review by our administration team.
                </Text>

                <View style={styles.infoCard}>
                    <Ionicons name="information-circle-outline" size={24} color="#C87941" />
                    <Text style={styles.infoText}>
                        This process usually takes 24-48 hours. You will be notified via email once approved.
                    </Text>
                </View>

                <TouchableOpacity style={styles.refreshBtn} onPress={checkStatus}>
                    <Text style={styles.refreshBtnText}>Check Status</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a1a",
        justifyContent: "center",
        paddingHorizontal: 30,
    },
    content: {
        alignItems: "center",
    },
    iconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "rgba(200, 121, 65, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 30,
        borderWidth: 1,
        borderColor: "rgba(200, 121, 65, 0.2)",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 16,
        color: "#999",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 30,
    },
    infoCard: {
        flexDirection: "row",
        backgroundColor: "#2a2a2a",
        padding: 20,
        borderRadius: 16,
        alignItems: "center",
        marginBottom: 40,
    },
    infoText: {
        flex: 1,
        color: "#bbb",
        fontSize: 14,
        marginLeft: 15,
        lineHeight: 20,
    },
    refreshBtn: {
        backgroundColor: "#C87941",
        width: "100%",
        height: 56,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    refreshBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    logoutBtn: {
        padding: 15,
    },
    logoutText: {
        color: "#C87941",
        fontSize: 16,
        fontWeight: "500",
    },
});
