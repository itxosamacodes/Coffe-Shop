import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveWidth
} from "react-native-responsive-dimensions";
import { useFavorites } from "../../context/FavoritesContext";
import { useTheme } from "../../context/ThemeContext";

const FavoritesScreen = () => {
    const { favorites } = useFavorites();
    const { theme, isDark } = useTheme();

    const renderFavoriteItem = ({ item, index }: { item: any; index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 100).duration(500)}>
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
                activeOpacity={0.9}
                onPress={() => router.push({
                    pathname: "/(tabs)/detail",
                    params: {
                        coffeImg: item.image,
                        coffeName: item.name,
                        coffePrice: item.price,
                        location: "islamabad"
                    }
                })}
            >
                <Image
                    source={
                        typeof item.image === "number"
                            ? item.image
                            : typeof item.image === "string" && !isNaN(Number(item.image))
                                ? Number(item.image)
                                : { uri: item.image }
                    }
                    style={styles.cardImage}
                    contentFit="cover"
                />
                <View style={styles.cardInfo}>
                    <View>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                        <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>{item.subTitle}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={[styles.price, { color: theme.text }]}>
                            <Text style={styles.currency}>$ </Text>
                            {item.price}
                        </Text>
                        <TouchableOpacity style={styles.heartBtn}>
                            <Ionicons name="heart" size={22} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.header }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Favorites</Text>
                <View style={{ width: 44 }} />
            </View>

            <FlatList
                data={favorites}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.listContent}
                renderItem={renderFavoriteItem}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: theme.surface }]}>
                            <Ionicons name="heart-outline" size={60} color={isDark ? "#333" : "#DDD"} />
                        </View>
                        <Text style={[styles.emptyText, { color: theme.text }]}>No favorites yet</Text>
                        <Text style={[styles.emptySubText, { color: theme.textMuted }]}>Start favoriting your preferred coffee!</Text>
                        <TouchableOpacity
                            style={styles.shopBtn}
                            onPress={() => router.push("/(tabs)/home")}
                        >
                            <Text style={styles.shopBtnText}>Browse Coffee</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: responsiveHeight(15),
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: responsiveWidth(6),
        paddingTop: responsiveHeight(4),
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(128,128,128,0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: responsiveFontSize(2.2),
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    listContent: {
        paddingHorizontal: responsiveWidth(6),
        paddingTop: 20,
        paddingBottom: 120,
    },
    card: {
        flexDirection: "row",
        borderRadius: 20,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
    },
    cardImage: {
        width: 90,
        height: 90,
        borderRadius: 16,
    },
    cardInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: "space-between",
        paddingVertical: 2,
    },
    cardTitle: {
        fontSize: responsiveFontSize(2),
        fontWeight: "700",
    },
    cardSubtitle: {
        fontSize: responsiveFontSize(1.6),
        marginTop: 2,
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    price: {
        fontSize: responsiveFontSize(2),
        fontWeight: "800",
    },
    currency: {
        color: "#C67C4E",
    },
    heartBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "rgba(198, 124, 78, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    emptyState: {
        alignItems: "center",
        marginTop: responsiveHeight(15),
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    emptyText: {
        fontSize: responsiveFontSize(2.2),
        fontWeight: "700",
    },
    emptySubText: {
        fontSize: responsiveFontSize(1.6),
        marginTop: 8,
        textAlign: "center",
    },
    shopBtn: {
        marginTop: 30,
        backgroundColor: "#C67C4E",
        paddingHorizontal: 30,
        paddingVertical: 14,
        borderRadius: 16,
        shadowColor: "#C67C4E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    shopBtnText: {
        color: "white",
        fontWeight: "700",
        fontSize: 16,
    },
});
