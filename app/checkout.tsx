import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { supabase } from "../utils/supabase";

const Checkout = () => {
  const params = useLocalSearchParams() as {
    coffeImg?: string;
    coffeName?: string;
    coffePrice?: string;
  };
  const { coffeImg, coffeName, coffePrice } = params;
  const [deliveryType, setDeliveryType] = useState("Deliver");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Loading...");

  const basePrice = parseFloat(coffePrice as string) || 0;
  const totalPrice = basePrice * quantity;
  const deliveryFee = 1.0;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();
          if (data && data.full_name) {
            setUserName(data.full_name);
          } else {
            setUserName(user.email?.split("@")[0] || "User");
          }
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setUserName("User");
      }
    };
    fetchUser();
  }, []);

  const handleOrder = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            item_name: coffeName,
            quantity: quantity,
            total_price: totalPrice + deliveryFee,
            delivery_type: deliveryType,
            status: "pending",
            user_id: user?.id,
          },
        ])
        .select();

      if (error) {
        console.error("Error placing order:", error);
        alert("Failed to place order: " + error.message);
      } else {
        console.log("Order placed:", data);
        router.push("/(tabs)/map");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery & Pick Up  Button*/}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              deliveryType === "Deliver" && styles.activeToggle,
            ]}
            onPress={() => setDeliveryType("Deliver")}
          >
            <Text
              style={[
                styles.toggleText,
                deliveryType === "Deliver" && styles.activeToggleText,
              ]}
            >
              Deliver
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              deliveryType === "Pick Up" && styles.activeToggle,
            ]}
            onPress={() => setDeliveryType("Pick Up")}
          >
            <Text
              style={[
                styles.toggleText,
                deliveryType === "Pick Up" && styles.activeToggleText,
              ]}
            >
              Pick Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Delivery Adress */}
        {/* <Text style={styles.sectionTitle}>User Info</Text> */}
        <Text style={styles.addressTitle}>{userName}</Text>
        <Text style={styles.addressSubtitle}>
          Pakistan Islamabad
        </Text>
        <View style={styles.addressActions}>
          <TouchableOpacity style={styles.outlineButton}>
            <Ionicons name="create-outline" size={16} color="black" />
            <Text style={styles.outlineButtonText}>Edit Address</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineButton}>
            <Ionicons name="document-text-outline" size={16} color="black" />
            <Text style={styles.outlineButtonText}>Add Note</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Oder Item */}
        <View style={styles.itemContainer}>
          <Image
            source={
              typeof coffeImg === "string" && !isNaN(Number(coffeImg))
                ? Number(coffeImg)
                : typeof coffeImg === "string"
                  ? { uri: coffeImg }
                  : coffeImg
            }
            style={styles.itemImage}
          />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{coffeName}</Text>
            <Text style={styles.itemVariant}>Deep Foam</Text>
          </View>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={styles.qtyBtn}
            >
              <Ionicons name="remove" size={18} color="#AAADB0" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              style={styles.qtyBtn}
            >
              <Ionicons name="add" size={18} color="#AAADB0" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dividerLine} />

        {/* Discount */}
        <TouchableOpacity style={styles.discountContainer}>
          <View style={styles.discountLeftSection}>
            <MaterialCommunityIcons
              name="brightness-percent"
              size={24}
              color="#C67C4E"
            />
            <Text style={styles.discountText}>1 Discount is Applies</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="black" />
        </TouchableOpacity>

        {/* Payment Sumary */}
        <Text style={styles.sectionTitle}>Payment Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Price</Text>
          <Text style={styles.summaryValue}>$ {totalPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <View style={styles.deliveryFeeContainer}>
            <Text style={styles.strikethroughPrice}>$ 2.0</Text>
            <Text style={styles.summaryValue}>$ {deliveryFee.toFixed(1)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom  */}
      <View style={styles.bottomBar}>
        <View style={styles.walletSection}>
          <View style={styles.walletLeftSection}>
            <Text>{"  "}</Text>
            <Ionicons
              name="wallet-outline"
              size={24}
              color="#C67C4E"
              style={styles.walletIcon}
            />
            <View>
              <Text style={styles.walletTitle}>Total Price</Text>
              <Text style={styles.walletBalance}>
                $ {(totalPrice + deliveryFee).toFixed(2)}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-down" size={20} color="black" />
        </View>
        <TouchableOpacity
          style={[styles.orderButton, loading && { opacity: 0.7 }]}
          onPress={handleOrder}
          disabled={loading}
        >
          <Text style={styles.orderButtonText}>
            {loading ? "Placing Order..." : "Order"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Checkout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    paddingTop: StatusBar.currentHeight || 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: responsiveWidth(5),
    width: "100%",
    marginBottom: responsiveHeight(2),
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F2D2C",
  },
  scrollContent: {
    paddingHorizontal: responsiveWidth(5),
    paddingBottom: responsiveHeight(12),
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    padding: 4,
    marginBottom: responsiveHeight(3),
  },
  toggleButton: {
    flex: 1,
    paddingVertical: responsiveHeight(1.2),
    borderRadius: 10,
    alignItems: "center",
  },
  activeToggle: {
    backgroundColor: "#C67C4E",
  },
  toggleText: {
    fontSize: 16,
    color: "#2F2D2C",
    fontWeight: "500",
  },
  activeToggleText: {
    color: "white",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F2D2C",
    marginBottom: responsiveHeight(1.8),
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2F2D2C",
    marginBottom: responsiveHeight(0.6),
  },
  addressSubtitle: {
    fontSize: 14,
    color: "#808080",
    marginBottom: responsiveHeight(1.8),
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: "row",
    gap: responsiveWidth(2.5),
    marginBottom: responsiveHeight(2.5),
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DEDEDE",
    borderRadius: 20,
    paddingVertical: responsiveHeight(0.7),
    paddingHorizontal: responsiveWidth(3),
    gap: 5,
  },
  outlineButtonText: {
    fontSize: 12,
    color: "#303336",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginVertical: responsiveHeight(1.2),
  },
  dividerLine: {
    height: 4,
    backgroundColor: "#F4F4F4",
    marginVertical: responsiveHeight(1.8),
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(1.2),
    marginTop: responsiveHeight(1.2),
  },
  itemImage: {
    width: 54,
    height: 54,
    borderRadius: 12,
  },
  itemDetails: {
    flex: 1,
    marginLeft: responsiveWidth(3.8),
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2F2D2C",
  },
  itemVariant: {
    fontSize: 12,
    color: "#9B9B9B",
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveWidth(2.5),
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2F2D2C",
  },
  discountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: responsiveHeight(1.8),
    paddingHorizontal: responsiveWidth(3.8),
    borderWidth: 1,
    borderColor: "#EAEAEA",
    borderRadius: 14,
    backgroundColor: "white",
    marginBottom: responsiveHeight(2.5),
  },
  discountLeftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  discountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2F2D2C",
    marginLeft: responsiveWidth(2.5),
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: responsiveHeight(1.2),
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 16,
    color: "#2F2D2C",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2F2D2C",
  },
  deliveryFeeContainer: {
    flexDirection: "row",
    gap: responsiveWidth(2),
    alignItems: "center",
  },
  strikethroughPrice: {
    fontSize: 14,
    color: "#2F2D2C",
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1.8),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  walletSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveHeight(1.8),
  },
  walletLeftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletIcon: {
    marginRight: responsiveWidth(2),
  },
  walletTitle: {
    fontSize: 14,
    color: "#2F2D2C",
    fontWeight: "600",
  },
  walletBalance: {
    fontSize: 12,
    color: "#C67C4E",
    fontWeight: "600",
    marginTop: 2,
  },
  orderButton: {
    backgroundColor: "#C67C4E",
    paddingVertical: responsiveHeight(2.2),
    borderRadius: 16,
    alignItems: "center",
  },
  orderButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
