import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFavorites } from "../../context/FavoritesContext";
import { useTheme } from "../../context/ThemeContext";

const Detail = () => {
  const { coffeImg, coffeName, coffePrice, location } =
    useLocalSearchParams() as {
      coffeImg: any;
      coffeName: string;
      coffePrice: string;
      location: string;
    };
  const { toggleFavorite, isFavorite } = useFavorites();
  const [button, setButton] = useState("M");
  const [price, setPrice] = useState(coffePrice);
  const imgs = [
    { img: require("../../assets/detailsImg/img1.png") },
    { img: require("../../assets/detailsImg/img2.png") },
    { img: require("../../assets/detailsImg/img3.png") },
  ];

  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const Size = [
    {
      size: "S",
      Price: "3.48",
    },
    {
      size: "M",
      Price: "4.48",
    },
    {
      size: "L",
      Price: "6.48",
    },
  ];
  return (
    <View style={[styles.Container, { backgroundColor: theme.background }]}>
      {/* Redesigned Header */}
      <View style={[styles.header, {
        backgroundColor: theme.background,
        paddingTop: insets.top + 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.border
      }]}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
          style={styles.headerBtn}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Detail</Text>
        <TouchableOpacity
          onPress={() => toggleFavorite({ name: coffeName, subTitle: "Hot", price: coffePrice, image: coffeImg })}
          style={styles.headerBtn}
        >
          <Ionicons
            name={isFavorite(coffeName) ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite(coffeName) ? theme.primary : theme.text}
          />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Image  */}
        <View style={styles.img}>
          <Image
            source={
              typeof coffeImg === "number"
                ? coffeImg
                : typeof coffeImg === "string" && !isNaN(Number(coffeImg))
                  ? Number(coffeImg)
                  : { uri: coffeImg as string }
            }
            style={{
              borderRadius: 15,
              height: responsiveHeight(23),
              width: responsiveWidth(87),
            }}
            contentFit="cover"
            transition={200}
          />
        </View>
        <View style={styles.CoffeContainer}>
          <View style={styles.CoffeeDetails}>
            {/* left side things */}
            <View style={styles.leftsidethings}>
              <Text style={[styles.coffeetitel, { color: theme.text }]}>{coffeName}</Text>
              <Text style={[styles.subTitel, { color: theme.textMuted }]}>Hot</Text>
            </View>
            {/* right side */}
            <View style={styles.rightSide}>
              {imgs.map((item, index) => (
                <View key={index} style={styles.imgBox}>
                  <Image source={item.img} style={{ width: 30, height: 30 }} contentFit="contain" />
                </View>
              ))}
            </View>
          </View>
          <View
            style={{
              top: 22,
              height: 0.8,
              backgroundColor: theme.border,
              width: "100%",
            }}
          />
        </View>
        {/* Description start here */}
        <View style={styles.descriptionBox}>
          <Text style={[styles.desTitel, { color: theme.text }]}>Description</Text>
          <Text style={[styles.description, { color: theme.textMuted }]}>
            A cappuccino is an approximately 150 ml (5 oz) beverage, with 25 ml
            of espresso coffee and 85ml of fresh milk the fo...
            <Text
              style={{
                color: theme.primary,
                fontWeight: "600",
                fontSize: responsiveFontSize(2),
              }}
            >
              Read More
            </Text>
          </Text>
        </View>
        <View style={styles.sizeBox}>
          <Text style={styles.sizetitel}>Size</Text>
          <View style={styles.buttonRow}>
            {Size.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.buttonBox,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  button === item.size && { backgroundColor: isDark ? "rgba(198, 124, 78, 0.2)" : "#F9F2ED", borderColor: theme.primary, borderWidth: 1.5 },
                ]}
                onPress={() => {
                  setButton(item.size);
                  setPrice(item.Price);
                }}
              >
                <Text
                  style={{
                    fontSize: responsiveFontSize(2.5),
                    fontWeight: "500",
                    color: button === item.size ? theme.primary : theme.text,
                  }}
                >
                  {item.size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      {/* Bottom Button */}
      <View style={[styles.bottom, { backgroundColor: theme.surface }]}>
        <View style={styles.priceCol}>
          <Text style={[styles.Ptitel, { color: theme.textMuted }]}>Price</Text>
          <Text style={[styles.Price, { color: theme.primary }]}>${price}</Text>
        </View>
        <View></View>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            router.push({
              pathname: "/(tabs)/checkout",
              params: { coffeImg, coffeName, coffePrice: price, location },
            });
          }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(2.7),
              fontWeight: "600",
              color: "white",
            }}
          >
            Buy Now
          </Text>
        </TouchableOpacity>
      </View>
    </View >
  );
};

export default Detail;

const styles = StyleSheet.create({
  Container: {
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
    paddingHorizontal: responsiveWidth(6.5),
    paddingBottom: responsiveHeight(12),
  },
  img: {
    alignItems: "center",
    paddingVertical: responsiveHeight(2),
  },
  // Cofee deatils start here
  CoffeContainer: {
    width: "100%",
    marginBottom: responsiveHeight(2),
  },
  CoffeeDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftsidethings: {
    justifyContent: "center",
    gap: 5,
  },
  coffeetitel: {
    fontSize: responsiveFontSize(3),
    fontWeight: "600",
  },
  subTitel: {
    fontFamily: "sora",
    color: "grey",
    fontSize: responsiveFontSize(2.3),
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
  },
  star: {
    alignItems: "flex-start",
    justifyContent: "center",
    height: 28,
    width: 33,
    elevation: 15,
  },
  rating: {
    fontSize: responsiveFontSize(2.7),
    fontWeight: "600",
  },
  ratingSubTitel: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "500",
    color: "grey",
  },
  rightSide: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  imgBox: {
    height: responsiveHeight(6),
    width: responsiveWidth(13),
    backgroundColor: "#EDEDED59",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  // Description Box design start here
  descriptionBox: {
    width: "100%",
    marginVertical: responsiveHeight(2),
  },
  desTitel: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: "600",
    paddingBottom: 10,
  },
  description: {
    fontSize: responsiveFontSize(2),
    color: "#A2A2A2",
    lineHeight: responsiveFontSize(2.8),
  },
  sizeBox: {
    width: "100%",
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(12),
  },
  sizetitel: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: "600",
    marginBottom: 35,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonBox: {
    borderRadius: 20,
    borderColor: "grey",
    borderWidth: 1,
    paddingVertical: 10,
    width: responsiveWidth(28),
    alignItems: "center",
    backgroundColor: "white",
  },
  activeButton: {
    backgroundColor: "#F9F2ED",
    borderColor: "#C67C4E",
    borderWidth: 1.5,
  },
  bottom: {
    position: "absolute",
    height: responsiveHeight(11),
    width: "110%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: responsiveWidth(8),
    bottom: 0,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  priceCol: {
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 5,
  },
  Ptitel: {
    fontSize: responsiveFontSize(2.5),
    color: "grey",
  },
  Price: {
    fontSize: responsiveFontSize(3.2),
    color: "#C67C4E",
    fontWeight: "600",
  },
  btn: {
    backgroundColor: "#C67C4E",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    elevation: 10,
  },
});
