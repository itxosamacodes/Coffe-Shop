import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  View,
  TouchableOpacity,
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
  return (
    <View style={styles.Container}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <View style={styles.header}>
        {/* search Area */}
        <View style={styles.form}>
          {/* Tietel start */}
          <Text style={styles.titel}>Location</Text>
          {/* Drop down Item strt */}
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
                fontSize: responsiveFontSize(2.5),
              }}
            />
          </View>
          {/* search row */}
          <View style={styles.searchRow}>
            <View style={styles.SearchBar}>
              <Ionicons
                name="search-outline"
                size={responsiveFontSize(2)}
                color="#FFFFFF"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Search coffee"
                placeholderTextColor="#A2A2A2"
              />
            </View>
            <View style={styles.fitlerImg}>
              <Image source={require("../../assets/AppImg/filter.png")} />
            </View>
          </View>
        </View>
      </View>
      {/* slide image */}
      <View style={styles.slideImge}>
        <Image
          source={require("../../assets/AppImg/Banner.png")}
          style={styles.banner}
        />
        <View style={styles.bannertxt}>
          <Text style={styles.Promo}>Promo</Text>
          <Text style={styles.bigTitel}>Buy one get one FREE</Text>
        </View>
      </View>
      {/* menu buttons start here */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={styles.menu}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => {
                setSelectedCategory(item);
              }}
              style={[
                styles.categoryBtn,
                selectedCategory === item && styles.activeCategory,
              ]}
            >
              <Text
                style={[
                  styles.buttontitel,
                  selectedCategory === item && styles.actbtntitel,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* start here product */}
        {selectedCategory !== "All Coffee" && (
          <View style={styles.outOfStockBox}>
            <Text style={styles.outOfStockText}>
              This item is currently out of stock
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  Container: {
    backgroundColor: "#F9F9F9",
    flex: 1,
    alignItems: "center",
  },
  header: {
    backgroundColor: "#111111",
    width: responsiveWidth(100),
    height: responsiveHeight(33.33),
    alignItems: "center",
  },
  form: {
    alignItems: "flex-start",
    left: responsiveWidth(0.8),
    top: responsiveWidth(15),
    right: responsiveWidth(8),
  },
  titel: {
    color: "#A2A2A2",
    fontWeight: "400",
    letterSpacing: 1,
    left: responsiveWidth(-3),
    fontSize: responsiveFontSize(2.2),
  },
  dropContainer: {
    left: responsiveWidth(-3),
    top: responsiveHeight(1.5),
    width: responsiveWidth(52),
  },
  searchRow: {
    flexDirection: "row",
    left: responsiveWidth(-3),
    top: responsiveWidth(13),
  },
  SearchBar: {
    flexDirection: "row",
    width: responsiveWidth(69),
    height: responsiveHeight(5.5),
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
  },
  icon: {
    left: responsiveWidth(4),
  },
  input: {
    left: responsiveWidth(6),
    fontSize: responsiveFontSize(1.7),
    color: "white",
  },
  fitlerImg: {
    left: responsiveWidth(4.8),
  },
  //   banner design
  slideImge: {
    position: "absolute",
    top: responsiveHeight(27),
  },
  banner: {
    borderRadius: responsiveWidth(2.3),
    width: responsiveWidth(85),
    height: responsiveHeight(16),
  },
  bannertxt: {
    top: responsiveHeight(-14),
    left: responsiveHeight(4),
  },
  Promo: {
    fontWeight: "600",
    backgroundColor: "#ED5151",
    borderRadius: 5,
    fontSize: responsiveFontSize(2),
    padding: 3,
    color: "#FFFFFF",
    width: responsiveWidth(18),
    textAlign: "center",
  },
  bigTitel: {
    fontWeight: "600",
    top: responsiveHeight(1.1),
    fontSize: responsiveFontSize(3.5),
    color: "#FFFFFF",
    width: responsiveWidth(40),
    textShadowColor: "black",
    textShadowOffset: { width: 3.5, height: 3.5 },
    textShadowRadius: 4,
  },
  //   categories
  menu: {
    top: responsiveHeight(11),
    height: 50,
    flexDirection: "row",
    gap: 10,
  },
  categoryBtn: {
    paddingHorizontal: responsiveWidth(4),
    height: 34,
    backgroundColor: "rgba(255, 255, 255, 0.81)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    left: responsiveWidth(2),
  },
  buttontitel: {
    fontSize: responsiveFontSize(2),
    fontWeight: "400",
  },

  activeCategory: {
    backgroundColor: "#c67c4f",
  },

  outOfStockBox: {
    marginTop: 30,
    alignItems: "center",
  },
  outOfStockText: {
    color: "#999",
    fontSize: 16,
    fontStyle: "italic",
  },
  actbtntitel: {
    color: "white",
  },
});
