import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Hooks = () => {
  // ✅ useState must have an initial VALUE
  const [count, setCount] = useState(0);

  // ✅ useRef for TextInput
  const inputRef = useRef(null);

  // runs on every render
  useEffect(() => {
    console.log("calling again and again when reload");
  });

  // runs once when screen loads
  useEffect(() => {
    console.log("calling it once when screen load");
  }, []);

  // runs when count changes
  useEffect(() => {
    console.log("calling on counter value update:", count);
  }, [count]);

  return (
    <View style={styles.container}>
      {/* Counter */}
      <View style={styles.counter}>
        <TouchableOpacity
          style={styles.btnBox}
          onPress={() => setCount(count + 1)}
        >
          <Ionicons name="add" size={35} />
        </TouchableOpacity>

        <Text style={styles.countText}>{count}</Text>

        <TouchableOpacity
          style={styles.btnBox}
          onPress={() => setCount(count - 1)}
        >
          <Ionicons name="remove" size={35} />
        </TouchableOpacity>
      </View>

      {/* TextInput with useRef */}
      <TextInput
        ref={inputRef} // ✅ correct way
        placeholder="Enter something"
        style={styles.input}
      />

      {/* Button to focus input */}
      <TouchableOpacity
        style={styles.focusBtn}
        onPress={() => inputRef.current?.focus()}
      >
        <Text style={{ color: "#fff" }}>Focus Input</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.focusBtn}
        onPress={() => inputRef.current?.clear()}
      >
        <Text style={{ color: "#fff" }}>clear</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Hooks;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    height: 120,
    width: "80%",
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 12,
    justifyContent: "space-around",
    marginBottom: 30,
  },
  btnBox: {
    height: 60,
    width: 60,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "grey",
    justifyContent: "center",
    borderRadius: 10,
  },
  countText: {
    fontSize: 24,
    fontWeight: "600",
  },
  input: {
    height: 50,
    width: 200,
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  focusBtn: {
    height: 45,
    width: 140,
    backgroundColor: "#C67C4E",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
});
