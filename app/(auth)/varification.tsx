import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CoffeeSignUpScreen() {
  const [otp, setOtp] = useState("");

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>Verify Account</Text>

        {/* Email */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <MaterialIcons
              name="pin"
              size={20}
              color="#999"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter 6 Digite"
              placeholderTextColor="#999"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              autoCapitalize="none"
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            router.push("/(auth)/setNewPass");
          }}
        >
          <Text style={styles.createButtonText}>Varify & Proced</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2a2a2a",
    textAlign: "center",
    marginVertical: 30,
    marginBottom: 8,
  },
  inputContainer: {
    marginVertical: 30,
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#2a2a2a",
    fontSize: 15,
  },
  createButton: {
    backgroundColor: "#C87941",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
