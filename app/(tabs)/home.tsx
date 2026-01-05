import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Animated, {
  FadeInDown
} from "react-native-reanimated";
import {
  responsiveHeight,
  responsiveWidth
} from "react-native-responsive-dimensions";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../utils/supabase";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BANNERS = [
  {
    id: 1,
    title: "Artisan Brews, Delivered Fresh",
    tag: "Premium",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: "The Perfect Pour Over",
    tag: "Exclusive",
    image: "https://images.unsplash.com/photo-1497933321027-94483ef36b33?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "Morning Fuel: 20% Off",
    tag: "Special",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 4,
    title: "Chilled Bliss Every Day",
    tag: "Featured",
    image: "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&q=80&w=800",
  },
];

const CATEGORIES = ["All Coffee", "Machiato", "Latte", "Americano", "Cappuccino"];

const COFFEE_DATA = [
  {
    id: 1,
    name: "Espresso",
    subTitle: "Deep Foam",
    price: "4.53",
    rating: 4.8,
    image: require("../../assets/ProductImage/cofe3.jpg"),
    category: "All Coffee",
  },
  {
    id: 2,
    name: "Cappuccino",
    subTitle: "Espresso",
    price: "3.73",
    rating: 4.5,
    image: require("../../assets/ProductImage/cofe4.jpg"),
    category: "Cappuccino",
  },
  {
    id: 3,
    name: "Latte",
    subTitle: "Deep Foam",
    price: "5.53",
    rating: 3.8,
    image: require("../../assets/ProductImage/cofe1.png"),
    category: "Latte",
  },
  {
    id: 4,
    name: "Americano",
    subTitle: "Espresso",
    price: "3.21",
    rating: 4.1,
    image: require("../../assets/ProductImage/cofe2.png"),
    category: "Americano",
  },
  {
    id: 5,
    name: "Mocha",
    subTitle: "Deep Foam",
    price: "5.23",
    rating: 4.8,
    image: require("../../assets/ProductImage/cofe5.jpg"),
    category: "Machiato",
  },
  {
    id: 6,
    name: "Flat White",
    subTitle: "Espresso",
    price: "6.73",
    rating: 3.2,
    image: require("../../assets/ProductImage/cofe6.jpg"),
    category: "All Coffee",
  },
  {
    id: 7,
    name: "Macchiato",
    subTitle: "Espresso",
    price: "3.95",
    rating: 4.7,
    image: require("../../assets/ProductImage/cofe7.jpg"),
    category: "Machiato",
  },
  {
    id: 8,
    name: "Cold Brew",
    subTitle: "Smooth",
    price: "4.25",
    rating: 4.9,
    image: require("../../assets/ProductImage/cofe8.jpg"),
    category: "All Coffee",
  },
  {
    id: 9,
    name: "Affogato",
    subTitle: "Vanilla",
    price: "4.75",
    rating: 4.6,
    image: require("../../assets/ProductImage/cofe9.jpg"),
    category: "All Coffee",
  },
];

const Home = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("All Coffee");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [location, setLocation] = useState("islamabad");
  const [filteredData, setFilteredData] = useState(COFFEE_DATA);

  const bannerRef = useRef<FlatList>(null);

  const locations = [
    { label: "Lahore, Pakistan", value: "lahore" },
    { label: "Islamabad, Pakistan", value: "islamabad" },
    { label: "Peshawar, Pakistan", value: "peshawar" },
  ];

  // Auto-play for banners
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeBannerIndex + 1) % BANNERS.length;
      bannerRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveBannerIndex(nextIndex);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeBannerIndex]);

  // Filtering Logic
  useEffect(() => {
    const filtered = COFFEE_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === "All Coffee" || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    setFilteredData(filtered);
  }, [selectedCategory, searchQuery]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      router.replace("/");
    }
  };

  const renderProduct = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(500)}
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            params: {
              coffeImg: item.image,
              coffeName: item.name,
              coffePrice: item.price,
              location: location,
            },
            pathname: "/(tabs)/detail",
          })
        }
      >
        <Image source={item.image} style={styles.cardImage} contentFit="cover" />
        <View style={styles.ratingBox}>
          <Ionicons name="star" color="#D17842" size={10} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.cardSubtitle, { color: theme.textMuted }]} numberOfLines={1}>{item.subTitle}</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.text }]}>
              <Text style={styles.currency}>$ </Text>
              {item.price}
            </Text>
            <TouchableOpacity style={styles.addBtn}>
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

      {/* Background Header Layer */}
      <View style={[styles.headerBackground, { backgroundColor: theme.header }]} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.locationLabel}>Location</Text>
            <View style={styles.locationDropdownContainer}>
              <Dropdown
                style={styles.dropdown}
                data={locations}
                labelField="label"
                valueField="value"
                value={location}
                onChange={(item) => setLocation(item.value)}
                selectedTextStyle={[styles.dropdownSelectedText, { color: theme.text }]}
                renderRightIcon={() => (
                  <Ionicons name="chevron-down" size={16} color={theme.text} style={{ marginLeft: 4 }} />
                )}
              />
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
              <Ionicons name={isDark ? "sunny" : "moon"} size={22} color={theme.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignOut} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar Row */}
        <View style={styles.searchRow}>
          <View style={[styles.searchBar, { backgroundColor: theme.searchBg }]}>
            <Ionicons name="search" size={20} color={theme.searchIcon} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search coffee..."
              placeholderTextColor={theme.searchIcon}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Banner Slider */}
        <View style={styles.bannerListContainer}>
          <FlatList
            ref={bannerRef}
            data={BANNERS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setActiveBannerIndex(Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH * 0.9)));
            }}
            renderItem={({ item }) => (
              <View style={styles.bannerSlide}>
                <Image
                  source={item.image}
                  style={styles.bannerImage}
                  contentFit="cover"
                  transition={1000}
                  placeholder={{ uri: "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&q=10&w=100" }}
                />
                <View style={styles.bannerOverlay}>
                  <Text style={styles.promoTag}>{item.tag}</Text>
                  <Text style={styles.bannerTitle}>{item.title}</Text>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
          {/* Banner Dots */}
          <View style={styles.bannerDots}>
            {BANNERS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  { backgroundColor: isDark ? "#333" : "#DDD" },
                  activeBannerIndex === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryBtn,
                { backgroundColor: theme.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", borderColor: theme.border },
                selectedCategory === cat && styles.activeCategoryBtn,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: theme.text },
                  selectedCategory === cat && styles.activeCategoryText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Grid of Results */}
        <View style={styles.gridContainer}>
          {filteredData.length > 0 ? (
            <FlatList
              data={filteredData}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.columnWrapper}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No coffee found matching your search</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: responsiveHeight(32),
  },
  scrollContent: {
    paddingTop: responsiveHeight(6),
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(6),
    marginBottom: responsiveHeight(3),
  },
  locationLabel: {
    color: "#666",
    fontSize: 12,
    marginBottom: 4,
  },
  locationDropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdown: {
    width: 160,
  },
  dropdownSelectedText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  themeBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  logoutBtn: {
    padding: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(6),
    gap: 12,
    marginBottom: responsiveHeight(3),
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    height: 55,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterBtn: {
    width: 55,
    height: 55,
    backgroundColor: "#C67C4E",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  // Banner Slider
  bannerListContainer: {
    marginBottom: responsiveHeight(3),
  },
  bannerSlide: {
    width: SCREEN_WIDTH * 0.9,
    height: responsiveHeight(18),
    marginHorizontal: SCREEN_WIDTH * 0.05,
    borderRadius: 20,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 20,
    justifyContent: "center",
  },
  promoTag: {
    backgroundColor: "#ED5151",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    width: "70%",
  },
  bannerDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: "#C67C4E",
  },
  // Categories
  categoryScroll: {
    marginBottom: responsiveHeight(3),
  },
  categoryContainer: {
    paddingHorizontal: responsiveWidth(6),
    gap: 12,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  activeCategoryBtn: {
    backgroundColor: "#C67C4E",
    borderColor: "#C67C4E",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  activeCategoryText: {
    color: "#fff",
  },
  // Products
  gridContainer: {
    paddingHorizontal: responsiveWidth(4),
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    width: responsiveWidth(44),
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    // Professional shadow for light mode
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardImage: {
    width: "100%",
    height: responsiveHeight(15),
    borderRadius: 16,
    marginBottom: 12,
  },
  ratingBox: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 3,
  },
  cardContent: {
    paddingHorizontal: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
  },
  currency: {
    color: "#C67C4E",
  },
  addBtn: {
    backgroundColor: "#C67C4E",
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});
