import { supabase } from "@/utils/supabse";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
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

export default function CoffeeLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [ErrorMsg, setErrorMsg] = useState("");

  const SignUpHandler = async () => {
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Please fill all the fildes");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      router.replace("/(auth)/varification");
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
        {/* Coffee Cup Image */}
        <View style={styles.imageContainer}>
          <View style={styles.cupOuter}>
            <Ionicons name="cafe" size={60} color={"#C87941"} />
          </View>
        </View>

        {/* Welcome Text */}
        <Text style={styles.welcomeText}>Welcome Back!</Text>
        <Text style={styles.subtitle}>
          Login to your account to enjoy your favorite coffee.
        </Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons
              name="email"
              size={20}
              color="#999"
              style={styles.inputIcon}
            />
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

        {/* Password Input */}
        <View style={styles.inputContainer}>
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
          onPress={() => router.push("/(auth)/forget")}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        {ErrorMsg ? <Text style={styles.error}>{ErrorMsg}</Text> : null}

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={SignUpHandler}
          disabled={Loading}
        >
          <Text style={styles.loginButtonText}>
            {Loading ? (
              <ActivityIndicator size={"small"} color={"white"} />
            ) : (
              "Login"
            )}
          </Text>
        </TouchableOpacity>

        {/* signIn with Google */}
        <Text style={styles.continueText}>Or continue with</Text>

        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-google" size={30} color={"#C87941"} />
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            SignIn With Google
          </Text>
        </TouchableOpacity>

        {/* if already have Register */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signUp")}>
            <Text style={styles.registerLink}>Register</Text>
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
  cupOuter: {
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
  eyeIcon: {
    padding: 4,
  },
  error: {
    color: "red",
    paddingBottom: 16,
    top: -16,
    textAlign: "center",
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
  continueText: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  socialButton: {
    alignItems: "center",
    flexDirection: "row",
    height: 56,
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    justifyContent: "center",
    marginBottom: 24,
    gap: 25,
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
