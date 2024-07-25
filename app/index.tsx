import { ServerInfo } from "@/constants/Server";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authenticatedFetch } from "@/app/fetch";
import { useNavigation } from "expo-router";
import { Colors, DefaultStyle } from "@/constants/Style";

export default function LoginScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        navigation.reset({
          index: 0,
          routes: [{ name: "(tabs)" }],
        });
        navigation.navigate("(tabs)");
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "(tabs)" }, { name: "login" }],
        });
        navigation.navigate("login");
      }
    };

    checkToken();
  }, [navigation]);

  return (
    <SafeAreaView
      style={[
        DefaultStyle.view,
        { flex: 1, justifyContent: "center", alignItems: "center" },
      ]}
    >
      <Text
        style={[
          DefaultStyle.viewTitle,
          { color: Colors.text, fontStyle: "italic", fontSize: 100 },
        ]}
      >
        BB
      </Text>
    </SafeAreaView>
  );
}
