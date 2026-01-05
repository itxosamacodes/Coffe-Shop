import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
    getCurrentPositionAsync,
    requestForegroundPermissionsAsync,
    reverseGeocodeAsync
} from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    responsiveHeight,
    responsiveWidth
} from "react-native-responsive-dimensions";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { AVAILABLE_CITIES, getCafeLocation } from "../../utils/cafeLocations";
import { supabase } from "../../utils/supabase";


const Checkout = () => {
    const params = useLocalSearchParams();
    const { theme, isDark } = useTheme();
    const insets = useSafeAreaInsets();

    // Safely extract params
    const coffeImg = params.coffeImg;
    const coffeName = (params.coffeName as string) || "Coffee";
    const coffePriceRaw = (params.coffePrice as string) || "0.00";
    const initialLocation = (params.location as string) || "";

    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedCity, setSelectedCity] = useState(AVAILABLE_CITIES[0]);
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [userInfo, setUserInfo] = useState({
        name: "",
        email: "",
        address: initialLocation,
        phone: "",
    });
    const [coords, setCoords] = useState<{ latitude: number | null, longitude: number | null }>({
        latitude: null,
        longitude: null,
    });

    const parsedPrice = parseFloat(coffePriceRaw) || 0;

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const getCurrentLocation = useCallback(async () => {
        setLocationLoading(true);
        console.log("[DEBUG] Starting location fetch process...");
        try {
            console.log("[DEBUG] Requesting foreground permissions...");
            const { status } = await requestForegroundPermissionsAsync();
            console.log("[DEBUG] Permission result:", status);

            if (status !== "granted") {
                Alert.alert("Permission denied", "Allow location access to use this feature");
                return;
            }

            console.log("[DEBUG] Fetching current position (Accuracy: Balanced)...");

            const pos = await getCurrentPositionAsync({
                accuracy: 4,
            });
            console.log("[DEBUG] Position coords:", pos.coords);

            console.log("[DEBUG] Reverse geocoding coords...");
            const reverse = await reverseGeocodeAsync({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
            });
            console.log("[DEBUG] Reverse geocode result:", reverse);

            if (reverse && reverse.length > 0) {
                const addr = reverse[0];
                const formatted = [
                    addr.streetNumber,
                    addr.street,
                    addr.city,
                    addr.region
                ].filter(Boolean).join(", ");

                console.log("[DEBUG] Formatted address:", formatted);
                setUserInfo((prev) => ({ ...prev, address: formatted || prev.address }));
                setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });

                // Calculate delivery fee: $0.2 per km from selected city's cafe
                const cafeLocation = getCafeLocation(selectedCity);
                const distance = calculateDistance(
                    cafeLocation.latitude,
                    cafeLocation.longitude,
                    pos.coords.latitude,
                    pos.coords.longitude
                );
                setDeliveryFee(parseFloat((distance * 0.2).toFixed(2)));
            } else {
                console.log("[DEBUG] No address returned from geocoder.");
                Alert.alert("Location Warning", "Position found, but could not determine a specific street address.");
            }
        } catch (error) {
            console.error("[DEBUG] Location Fetch Error Details:", error);
            Alert.alert("Location Error", `System details: ${error instanceof Error ? error.message : "An unexpected service error occurred"}`);
        } finally {
            setLocationLoading(false);
        }
    }, []);

    const handleOrder = async () => {
        if (!userInfo.name.trim() || !userInfo.email.trim() || !userInfo.address.trim() || !userInfo.phone.trim()) {
            Alert.alert("Missing Fields", "Please fill in all details to proceed");
            return;
        }

        setLoading(true);
        try {
            // Get current user session
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                throw new Error("You must be logged in to place an order");
            }

            const totalAmount = (parsedPrice * quantity + deliveryFee).toFixed(2);

            const { data: orderData, error } = await supabase.from("orders").insert([
                {
                    item_name: coffeName,
                    quantity: quantity,
                    total_price: totalAmount,
                    delivery_fee: deliveryFee,
                    delivery_type: "Deliver",
                    customer_name: userInfo.name,
                    customer_email: userInfo.email,
                    customer_phone: userInfo.phone,
                    delivery_address: userInfo.address,
                    customer_lat: coords.latitude,
                    customer_lng: coords.longitude,
                    customer_city: selectedCity,
                    status: "pending",
                    user_id: user.id
                },
            ]).select();

            if (error) throw error;

            const orderId = orderData?.[0]?.id;

            setModalVisible(false);
            Alert.alert("Success", "Your order has been placed successfully!", [
                {
                    text: "Track Order",
                    onPress: () => router.push({
                        pathname: "/order-tracking",
                        params: { orderId: orderId }
                    })
                },
            ]);
        } catch (error: any) {
            console.error("Order Submission Error:", error);
            Alert.alert("Order Failed", error.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Redesigned Header */}
            <View style={[styles.header, {
                backgroundColor: theme.background,
                paddingTop: insets.top + 10,
                borderBottomWidth: 1,
                borderBottomColor: theme.border
            }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Review Order</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Delivery Address Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Delivery Address</Text>
                    <View style={[styles.addressBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <View style={styles.addressIcon}>
                            <Ionicons name="location" size={22} color={theme.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.addressLabel, { color: theme.textMuted }]}>Delivery Destination</Text>
                            <Text style={[styles.addressText, { color: theme.text }]} numberOfLines={2}>
                                {userInfo.address || "Please select your address"}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.editBtn} onPress={() => setModalVisible(true)}>
                            <Ionicons name="create-outline" size={20} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Order Summary Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Selected Item</Text>
                    <View style={[styles.orderCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        {coffeImg && (
                            <Image
                                source={
                                    typeof coffeImg === 'number'
                                        ? coffeImg
                                        : (typeof coffeImg === 'string' && !isNaN(Number(coffeImg)))
                                            ? Number(coffeImg)
                                            : { uri: coffeImg as string }
                                }
                                style={styles.orderImage}
                                contentFit="cover"
                                transition={200}
                            />
                        )}
                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <Text style={[styles.orderName, { color: theme.text }]}>{coffeName}</Text>
                            <Text style={[styles.orderSub, { color: theme.textMuted }]}>With Deep Foam</Text>
                        </View>
                        <View style={styles.qtyBox}>
                            <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                                <Ionicons name="remove-circle-outline" size={26} color={theme.primary} />
                            </TouchableOpacity>
                            <Text style={[styles.qtyText, { color: theme.text }]}>{quantity}</Text>
                            <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                                <Ionicons name="add-circle-outline" size={26} color={theme.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Pricing Summary Section */}
                <View style={styles.section}>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: theme.text }]}>Items Subtotal</Text>
                        <Text style={[styles.priceValue, { color: theme.text }]}>${(parsedPrice * quantity).toFixed(2)}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: theme.text }]}>Delivery Charge ($0.2/km)</Text>
                        <Text style={[styles.priceValue, { color: theme.text }]}>${deliveryFee.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <View style={styles.priceRow}>
                        <Text style={[styles.totalLabel, { color: theme.text }]}>Total Payment</Text>
                        <Text style={[styles.totalValue, { color: theme.primary }]}>${(parsedPrice * quantity + deliveryFee).toFixed(2)}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Modal for User Details */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Delivery Details</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                            <Text style={[styles.inputLabel, { color: theme.text }]}>Full Name</Text>
                            <View style={[styles.inputContainer, { backgroundColor: theme.searchBg, borderColor: theme.border }]}>
                                <Ionicons name="person-outline" size={20} color={theme.searchIcon} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.textInput, { color: theme.text }]}
                                    placeholder="Full Name"
                                    placeholderTextColor={theme.searchIcon}
                                    value={userInfo.name}
                                    onChangeText={(text) => setUserInfo(p => ({ ...p, name: text }))}
                                />
                            </View>

                            <Text style={[styles.inputLabel, { color: theme.text }]}>Email Address</Text>
                            <View style={[styles.inputContainer, { backgroundColor: theme.searchBg, borderColor: theme.border }]}>
                                <Ionicons name="mail-outline" size={20} color={theme.searchIcon} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.textInput, { color: theme.text }]}
                                    placeholder="Email Address"
                                    placeholderTextColor={theme.searchIcon}
                                    keyboardType="email-address"
                                    value={userInfo.email}
                                    onChangeText={(text) => setUserInfo(p => ({ ...p, email: text }))}
                                />
                            </View>

                            <Text style={[styles.inputLabel, { color: theme.text }]}>Phone Number</Text>
                            <View style={[styles.inputContainer, { backgroundColor: theme.searchBg, borderColor: theme.border }]}>
                                <Ionicons name="call-outline" size={20} color={theme.searchIcon} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.textInput, { color: theme.text }]}
                                    placeholder="Phone Number"
                                    placeholderTextColor={theme.searchIcon}
                                    keyboardType="phone-pad"
                                    value={userInfo.phone}
                                    onChangeText={(text) => setUserInfo(p => ({ ...p, phone: text }))}
                                />
                            </View>

                            <Text style={[styles.inputLabel, { color: theme.text }]}>Select City</Text>
                            <View style={styles.cityPickerRow}>
                                {AVAILABLE_CITIES.map((city) => (
                                    <TouchableOpacity
                                        key={city}
                                        style={[
                                            styles.cityOption,
                                            { backgroundColor: theme.searchBg, borderColor: theme.border },
                                            selectedCity === city && { backgroundColor: isDark ? "rgba(198, 124, 78, 0.2)" : "#F9F2ED", borderColor: theme.primary }
                                        ]}
                                        onPress={() => setSelectedCity(city)}
                                    >
                                        <Text style={[
                                            styles.cityOptionText,
                                            { color: theme.textMuted },
                                            selectedCity === city && { color: theme.primary }
                                        ]}>
                                            {city}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.addressLabelRow}>
                                <Text style={[styles.inputLabel, { color: theme.text }]}>Detailed Address</Text>
                                <TouchableOpacity
                                    onPress={getCurrentLocation}
                                    disabled={locationLoading}
                                    style={styles.locationLink}
                                >
                                    {locationLoading ? (
                                        <ActivityIndicator size="small" color={theme.primary} />
                                    ) : (
                                        <>
                                            <Ionicons name="locate" size={16} color={theme.primary} />
                                            <Text style={[styles.locationLinkText, { color: theme.primary }]}>Use Current</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={[styles.textInput, styles.textArea, { backgroundColor: theme.searchBg, borderColor: theme.border, color: theme.text }]}
                                placeholder="123 Coffee St, Bean Town..."
                                placeholderTextColor={theme.searchIcon}
                                multiline
                                numberOfLines={3}
                                value={userInfo.address}
                                onChangeText={(text) => setUserInfo(p => ({ ...p, address: text }))}
                            />

                            <TouchableOpacity
                                style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
                                onPress={handleOrder}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.confirmBtnText}>Confirm Order</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Persistent Bottom Section */}
            <View style={[styles.footer, { backgroundColor: theme.surface }]}>
                <View style={[styles.paymentPreview, { backgroundColor: theme.searchBg }]}>
                    <View style={[styles.walletBadge, { backgroundColor: isDark ? "rgba(198, 124, 78, 0.2)" : "#F9F2ED" }]}>
                        <Ionicons name="wallet-outline" size={24} color={theme.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.paymentMethod, { color: theme.text }]}>Cash on Delivery</Text>
                        <Text style={[styles.paymentAmount, { color: theme.primary }]}>Total: ${(parsedPrice * quantity + deliveryFee).toFixed(2)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.searchIcon} />
                </View>

                <TouchableOpacity
                    style={styles.mainOrderBtn}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.mainOrderBtnText}>Place My Order</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: responsiveWidth(6),
        paddingBottom: 15,
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    scrollContent: {
        paddingHorizontal: responsiveWidth(5),
        paddingBottom: 140,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#2F2D2C",
        marginBottom: 12,
    },
    addressBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#F0F0F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    addressIcon: {
        width: 44,
        height: 44,
        backgroundColor: "#F9F2ED",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    addressLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#999",
        marginBottom: 2,
    },
    addressText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#2F2D2C",
    },
    editBtn: {
        padding: 4,
    },
    orderCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    orderImage: {
        width: 70,
        height: 70,
        borderRadius: 14,
    },
    orderName: {
        fontSize: 17,
        fontWeight: "700",
        color: "#2F2D2C",
    },
    orderSub: {
        fontSize: 13,
        color: "#999",
        marginTop: 2,
    },
    qtyBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    qtyText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2F2D2C",
        minWidth: 20,
        textAlign: "center",
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    priceLabel: {
        fontSize: 16,
        color: "#2F2D2C",
    },
    priceValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2F2D2C",
    },
    divider: {
        height: 1,
        backgroundColor: "#F0F0F0",
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 17,
        fontWeight: "700",
        color: "#2F2D2C",
    },
    totalValue: {
        fontSize: 18,
        fontWeight: "800",
        color: "#C67C4E",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        padding: 24,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.08,
        shadowRadius: 15,
        elevation: 25,
    },
    paymentPreview: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9F9F9",
        padding: 12,
        borderRadius: 16,
        marginBottom: 20,
    },
    walletBadge: {
        width: 44,
        height: 44,
        backgroundColor: "#F9F2ED",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    paymentMethod: {
        fontSize: 15,
        fontWeight: "700",
        color: "#2F2D2C",
    },
    paymentAmount: {
        fontSize: 13,
        color: "#C67C4E",
        fontWeight: "600",
    },
    mainOrderBtn: {
        backgroundColor: "#C67C4E",
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: "center",
    },
    mainOrderBtnText: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "white",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: responsiveHeight(85),
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#2F2D2C",
    },
    closeBtn: {
        padding: 4,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: "700",
        color: "#2F2D2C",
        marginBottom: 8,
        marginTop: 16,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F7F7F7",
        borderRadius: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#EEE",
    },
    inputIcon: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        height: 54,
        fontSize: 15,
        color: "#2F2D2C",
        fontWeight: "500",
    },
    addressLabelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 8,
        marginTop: 16,
    },
    locationLink: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 2,
        gap: 4,
    },
    locationLinkText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#C67C4E",
    },
    textArea: {
        height: 80,
        backgroundColor: "#F7F7F7",
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingTop: 14,
        textAlignVertical: "top",
        borderWidth: 1,
        borderColor: "#EEE",
    },
    confirmBtn: {
        backgroundColor: "#C67C4E",
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 32,
        shadowColor: "#C67C4E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    confirmBtnText: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
    },
    cityPickerRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 8,
    },
    cityOption: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: "#F7F7F7",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#EEE",
    },
    cityOptionSelected: {
        backgroundColor: "#F9F2ED",
        borderColor: "#C67C4E",
    },
    cityOptionText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },
    cityOptionTextSelected: {
        color: "#C67C4E",
    },
});

export default Checkout;
