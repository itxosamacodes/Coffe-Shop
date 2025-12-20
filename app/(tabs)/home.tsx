import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

const Home = () => {
  const data = [
    { label: "Lahore, Pakistan", value: "lahore" },
    { label: "Islamabad, Pakistan", value: "islamabad" },
    { label: "Peshawar, Pakistan", value: "peshawar" },
  ];
  const [selectedCategory, setSelectedCategory] = useState("All Coffee");

  const categories = ["All Coffee", "Machiato", "Latte", "American"];
  const [value, setValue] = useState("islamabad");

  const coffeeData = [
    {
      name: "Caffe Mocha",
      subTitle: "Deep Foam",
      price: "4.53",
      rating: 4.8,
      image: require("../../assets/AppImg/coffee2.png"),
    },
    {
      name: "Flat White",
      subTitle: "Espresso",
      price: "3.53",
      rating: 4.5,
      image: require("../../assets/AppImg/coffee1.png"),
    },
    {
      name: "Caffe Mocha",
      subTitle: "Deep Foam",
      price: "4.53",
      rating: 4.8,
      image: require("../../assets/AppImg/coffee2.png"),
    },
    {
      name: "Flat White",
      subTitle: "Espresso",
      price: "3.53",
      rating: 4.5,
      image: require("../../assets/AppImg/coffee1.png"),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#131313" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        style={{ flex: 1 }}
      >
        {/* Header start */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.form}>
              <Text style={styles.title}>Location</Text>
              <View style={styles.dropContainer}>
                <Dropdown
                  data={data}
                  labelField="label"
                  valueField="value"
                  value={value}
                  onChange={(item) => setValue(item.value)}
                  selectedTextStyle={{
                    color: "#D8D8D8",
                    fontWeight: "600",
                    fontSize: responsiveFontSize(2),
                  }}
                  renderRightIcon={() => (
                    <Ionicons
                      style={styles.dropdownIcon}
                      color="white"
                      name="chevron-down"
                      size={20}
                    />
                  )}
                />
              </View>
              {/* Search Row */}
              <View style={styles.searchRow}>
                <View style={styles.searchBar}>
                  <Ionicons
                    name="search-outline"
                    size={responsiveFontSize(2.5)}
                    color="#FFFFFF"
                    style={{ marginLeft: 15 }}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Search coffee"
                    placeholderTextColor="#989898"
                  />
                  <View style={styles.filterBtn}>
                    <Image source={require("../../assets/AppImg/filter.png")} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Banner start */}
        <View style={styles.bannerContainer}>
          <Image
            source={require("../../assets/AppImg/Banner.png")}
            style={styles.banner}
            resizeMode="cover"
          />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.promoTag}>Promo</Text>
            <View>
              <Text style={styles.bannerTitle}>Buy one get one FREE</Text>
            </View>
          </View>
        </View>

        {/* Categories Menu */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.menuScroll}
          contentContainerStyle={styles.menuContainer}
        >
          {categories.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setSelectedCategory(item)}
              style={[
                styles.categoryBtn,
                selectedCategory === item && styles.activeCategory,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.activeCategoryText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Coffee menu */}
        <View style={styles.listContainer}>
          {selectedCategory === "All Coffee" ? (
            <View style={styles.gridContainer}>
              {coffeeData.map((item, index) => (
                <View key={index} style={styles.card}>
                  <View style={styles.ratingBox}>
                    <Ionicons name="star" color="#D17842" size={12} />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                  <Image source={item.image} style={styles.cardImage} />
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSubtitle}>{item.subTitle}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.currency}>
                      $ <Text style={styles.price}>{item.price}</Text>
                    </Text>
                    <TouchableOpacity style={styles.addBtn}>
                      <Ionicons name="add" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                This item is currently out of stock
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      {/* botom menu */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.activeNavIcon}>
            <Ionicons name="home" size={24} color="#ffffff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="heart-outline" size={24} color="#8D8D8D" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="bag-outline" size={24} color="#8D8D8D" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="notifications-outline" size={24} color="#8D8D8D" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9F9F9",
    flex: 1,
  },
  header: {
    backgroundColor: "#131313",
    height: responsiveHeight(35),
    width: "100%",
    paddingTop: StatusBar.currentHeight || 40,
    alignItems: "center",
  },
  headerContent: {
    width: "90%",
  },
  form: {
    marginTop: 20,
  },
  title: {
    color: "#B7B7B7",
    fontSize: responsiveFontSize(1.8),
    marginBottom: 5,
  },
  dropContainer: {
    marginBottom: 20,
    width: 200,
  },
  dropdownIcon: {
    marginLeft: 5,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#313131",
    borderRadius: 16,
    height: 55,
    alignItems: "center",
    flex: 1,
    paddingRight: 5,
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: responsiveFontSize(1.8),
    marginLeft: 10,
  },
  filterBtn: {
    backgroundColor: "#C67C4E",
    height: 44,
    width: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 10,
    marginRight: 6,
  },

  // Banner
  bannerContainer: {
    alignItems: "center",
    marginTop: -responsiveHeight(10),
    marginBottom: 20,
  },
  banner: {
    width: "90%",
    height: responsiveHeight(18),
    borderRadius: 16,
  },
  bannerTextContainer: {
    position: "absolute",
    top: 20,
    left: 40,
  },
  promoTag: {
    backgroundColor: "#ED5151",
    color: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },

  bannerTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    width: 200,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },

  // Menu
  menuScroll: {
    maxHeight: 50,
    marginBottom: 20,
  },
  menuContainer: {
    paddingHorizontal: responsiveWidth(5),
    gap: 15,
  },
  categoryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#E3E3E3",
    justifyContent: "center",
  },
  activeCategory: {
    backgroundColor: "#C67C4E",
  },
  categoryText: {
    fontSize: 16,
    color: "#2F2D2C",
    fontWeight: "600",
  },
  activeCategoryText: {
    color: "white",
  },

  // List
  listContainer: {
    paddingHorizontal: responsiveWidth(5),
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "white",
    width: responsiveWidth(42),
    borderRadius: 16,
    padding: 8,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F2D2C",
    marginLeft: 5,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#9B9B9B",
    marginLeft: 5,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
    marginBottom: 5,
  },
  currency: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F4B4E",
  },
  price: {
    color: "#2F2D2C",
  },
  addBtn: {
    backgroundColor: "#C67C4E",
    padding: 8,
    borderRadius: 10,
  },
  ratingBox: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
  },
  ratingText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  // botom nav
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
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
