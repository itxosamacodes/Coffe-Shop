import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Image,
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

const Detail = () => {
  const { coffeImg, coffeName, coffePrice } = useLocalSearchParams();
  const [button, setButton] = useState("M");
  const [price, setPrice] = useState(coffePrice);
  const imgs = [
    { img: require("../../assets/detailsImg/img1.png") },
    { img: require("../../assets/detailsImg/img2.png") },
    { img: require("../../assets/detailsImg/img3.png") },
  ];

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
    <View style={styles.Container}>
      {/* Header  */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="chevron-back" size={32} color={"black"} />
        </TouchableOpacity>
        <Text style={styles.headerTitel}>Detail</Text>
        <Ionicons name="heart-outline" size={32} color={"black"} />
      </View>
      <ScrollView>
        {/* Image  */}
        <View style={styles.img}>
          <Image
            source={coffeImg}
            style={{
              borderRadius: 15,
              resizeMode: "cover",
              height: responsiveHeight(23),
              width: responsiveWidth(87),
            }}
          />
        </View>
        <View style={styles.CoffeContainer}>
          <View style={styles.CoffeeDetails}>
            {/* left side things */}
            <View style={styles.leftsidethings}>
              <Text style={styles.coffeetitel}>{coffeName}</Text>
              <Text style={styles.subTitel}>Ice/Hot</Text>
              <View style={styles.ratingRow}>
                <View style={styles.star}>
                  <Image
                    source={require("../../assets/detailsImg/star.png")}
                    style={{ height: 28, width: 28 }}
                  />
                </View>
                <Text style={styles.rating}>4.8</Text>
                <Text style={styles.ratingSubTitel}>(230)</Text>
              </View>
            </View>
            {/* right side */}
            <View style={styles.rightSide}>
              {imgs.map((item, index) => (
                <View key={index} style={styles.imgBox}>
                  <Image source={item.img} />
                </View>
              ))}
            </View>
          </View>
          <View
            style={{
              top: 22,
              height: 0.8,
              backgroundColor: "grey",
              width: "100%",
            }}
          />
        </View>
        {/* Description start here */}
        <View style={styles.descriptionBox}>
          <Text style={styles.desTitel}>Description</Text>
          <Text style={styles.description}>
            A cappuccino is an approximately 150 ml (5 oz) beverage, with 25 ml
            of espresso coffee and 85ml of fresh milk the fo...
            <TouchableOpacity>
              <Text
                style={{
                  color: "#C67C4E",
                  fontWeight: "600",
                  fontSize: responsiveFontSize(2),
                }}
              >
                Read More
              </Text>
            </TouchableOpacity>
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
                  button === item.size && styles.activeButton,
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
      <View style={styles.bottom}>
        <View style={styles.priceCol}>
          <Text style={styles.Ptitel}>Price</Text>
          <Text style={styles.Price}>${price}</Text>
        </View>
        <View></View>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            router.push("/(tabs)/order");
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
    </View>
  );
};

export default Detail;

const styles = StyleSheet.create({
  Container: {
    backgroundColor: "#F9F9F9",
    flex: 1,
    paddingTop: responsiveHeight(6.5),
    alignItems: "center",
    paddingHorizontal: responsiveWidth(5),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: responsiveHeight(2),
  },
  headerTitel: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "500",
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
    backgroundColor: "#F9F9F9",
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
