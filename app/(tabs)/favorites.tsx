import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveWidth,
} from "react-native-responsive-dimensions";
import { useFavorites } from "../../context/FavoritesContext";

const FavoritesScreen = () => {
    const { favorites } = useFavorites();

    const renderFavoriteItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({
                pathname: "/(tabs)/detail",
                params: {
                    coffeImg: item.image,
                    coffeName: item.name,
                    coffePrice: item.price,
                    location: "islamabad" // default location
                }
            })}
        >
            <Image source={item.image} style={styles.cardImage} />
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>{item.subTitle}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.currency}>$ <Text style={styles.price}>{item.price}</Text></Text>
                    <Ionicons name="heart" size={24} color="#C67C4E" />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Favorites</Text>
                <View style={{ width: 44 }} />
            </View>

            <FlatList
                data={favorites}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.listContent}
                renderItem={renderFavoriteItem}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="heart-outline" size={80} color="#E3E3E3" />
                        <Text style={styles.emptyText}>Your favorites list is empty</Text>
                        <TouchableOpacity
                            style={styles.shopBtn}
                            onPress={() => router.push("/(tabs)/home")}
                        >
                            <Text style={styles.shopBtnText}>Go to Home</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(tabs)/home")}>
                    <Ionicons name="home-outline" size={24} color="#8D8D8D" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <View style={styles.activeNavIcon}>
                        <Ionicons name="heart" size={24} color="#ffffff" />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(tabs)/orders")}>
                    <Ionicons name="bag-outline" size={24} color="#8D8D8D" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(tabs)/activity")}>
                    <Ionicons name="notifications-outline" size={24} color="#8D8D8D" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FDFDFD",
        paddingTop: responsiveHeight(7),
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: responsiveWidth(5),
        marginBottom: 20,
    },
    backBtn: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "700",
        color: "#2F2D2C",
    },
    listContent: {
        paddingHorizontal: responsiveWidth(5),
        paddingBottom: 100,
    },
    card: {
        flexDirection: "row",
        backgroundColor: "white",
        borderRadius: 16,
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#F0F0F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
    },
    cardInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: "space-between",
        paddingVertical: 5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#2F2D2C",
    },
    cardSubtitle: {
        fontSize: 14,
        color: "#999",
        marginTop: 2,
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 5,
    },
    currency: {
        fontSize: 18,
        fontWeight: "700",
        color: "#C67C4E",
    },
    price: {
        color: "#2F2D2C",
    },
    emptyState: {
        alignItems: "center",
        marginTop: 100,
    },
    emptyText: {
        fontSize: 18,
        color: "#999",
        marginTop: 20,
        fontWeight: "600",
    },
    shopBtn: {
        marginTop: 20,
        backgroundColor: "#C67C4E",
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 12,
    },
    shopBtnText: {
        color: "white",
        fontWeight: "700",
        fontSize: 16,
    },
    bottomNav: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        backgroundColor: "#ffffff",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingHorizontal: 40,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    navItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    activeNavIcon: {
        backgroundColor: "#C67C4E",
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
});
