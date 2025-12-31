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

export default function CoffeeSignUpScreen() {
  const [Loading, setLoading] = useState(false);
  const [ErrorMsg, setErrorMsg] = useState("");
  const [otp, setOtp] = useState("");
  const { email, mode } = useLocalSearchParams();
  const VarifyHandler = async () => {
    setErrorMsg("");
    if (!otp) {
      setErrorMsg("Enter OTP");
      return;
    }
    if (otp.length > 6 || otp.length < 6) {
      setErrorMsg("The OTP shuold be 6 digits");
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
        router.push("/(tabs)/home");
      } else {
        router.push("/(auth)/setNewPass");
      }
    }
  };
  const resendOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email as string,
    });
    if (!error) {
      alert(`A new OTP has been sent to : ${email}`);
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
        <TouchableOpacity style={styles.ResendOpt} onPress={resendOtp}>
          <Text style={styles.ResendOptText}>Resend</Text>
        </TouchableOpacity>
        {ErrorMsg ? <Text style={styles.error}>{ErrorMsg}</Text> : null}

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            VarifyHandler();
          }}
          disabled={Loading}
        >
          {Loading ? (
            <ActivityIndicator size={"small"} color={"white"} />
          ) : (
            <Text style={styles.createButtonText}>Varify & Proced</Text>
          )}
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
    marginBottom: 60,
  },
  error: {
    color: "red",
    paddingBottom: 16,
    top: -16,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 5,
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
  ResendOpt: {
    alignSelf: "flex-end",
    marginBottom: 34,
  },
  ResendOptText: {
    color: "#C87941",
    fontSize: 16,
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
