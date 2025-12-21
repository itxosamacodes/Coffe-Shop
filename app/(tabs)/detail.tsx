import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

const Detail = () => {
  const [button, setButton] = useState("M");
  const [price, setPrice] = useState("");
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
        <Ionicons name="chevron-back" size={32} color={"black"} />
        <Text style={styles.headerTitel}>Detail</Text>
        <Ionicons name="heart-outline" size={32} color={"black"} />
      </View>
      {/* Image  */}
      <View style={styles.img}>
        <Image
          source={require("../../assets/AppImg/coffee1.png")}
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
            <Text style={styles.coffeetitel}>Caffe Mocha</Text>
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
            height: 1.2,
            backgroundColor: "grey",
            width: responsiveWidth(75),
          }}
        />
      </View>
      {/* Description start here */}
      <View style={styles.descriptionBox}>
        <Text style={styles.desTitel}>Description</Text>
        <Text style={styles.description}>
          A cappuccino is an approximately 150 ml (5 oz) beverage, with 25 ml of
          espresso coffee and 85ml of fresh milk the fo...
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
                style={{ fontSize: responsiveFontSize(2.5), fontWeight: "500" }}
              >
                {item.size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* Bottom Button */}
      <View style={styles.bottom}>
        <View style={styles.priceCol}>
          <Text style={styles.Ptitel}>Price</Text>
          <Text style={styles.Price}>${price}</Text>
        </View>
        <View></View>
        <TouchableOpacity style={styles.btn}>
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
    backgroundColor: "#E3E3E3",
    flex: 1,
    paddingTop: responsiveHeight(6.5),
    alignItems: "center",
    paddingHorizontal: responsiveWidth(10),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: responsiveWidth(90),
  },
  headerTitel: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "500",
  },
  img: {
    alignItems: "center",
    paddingVertical: responsiveHeight(4),
  },
  // Cofee deatils start here
  CoffeContainer: {
    alignItems: "center",
    height: responsiveHeight(16),
  },
  CoffeeDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leftsidethings: {
    height: responsiveHeight(12),
    justifyContent: "space-between",
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
    gap: 20,
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
    height: 130,
  },
  desTitel: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: "600",
    paddingBottom: 10,
  },
  description: {
    fontSize: responsiveFontSize(2),
    color: "#A2A2A2",
  },
  sizeBox: {
    height: 120,
    width: responsiveWidth(80),
    justifyContent: "space-around",
  },
  sizetitel: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonBox: {
    top: 10,
    borderRadius: 8,
    borderColor: "grey",
    borderWidth: 1.5,
    paddingVertical: 13,
    paddingHorizontal: 43,
    backgroundColor: "#FFFFFF",
  },
  activeButton: {
    backgroundColor: "#F9F2ED",
    borderColor: "#C67C4E",
    borderWidth: 1.5,
  },
  bottom: {
    position: "absolute",
    backgroundColor: "#F9F9F9",
    height: 100,
    width: responsiveWidth(100),
    borderRadius: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    bottom: 0,
    left: 0,
    right: 0,
  },
  priceCol: {
    left: 30,
    alignItems: "flex-start",
    justifyContent: "space-between",
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
    right: 30,
    paddingHorizontal: 68,
    backgroundColor: "#C67C4E",
    paddingVertical: 24,
    borderRadius: 10,
  },
});
