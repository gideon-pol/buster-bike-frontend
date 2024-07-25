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

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const gotoMainScreen = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "(tabs)" }],
    });
    navigation.navigate("(tabs)");
  };

  const attemptLogin = async () => {
    console.log("Attempting login");
    const response = await authenticatedFetch(
      `${ServerInfo.url}/users/login/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      }
    );

    if (response.ok) {
      const body = await response.json();
      await AsyncStorage.setItem("token", body["token"]);
      console.log("Got token", body["token"]);
      gotoMainScreen();
      // navigation.navigate('(tabs)');
    } else {
      console.log("Login failed", response.body);
    }
  };

  return (
    <SafeAreaView style={[DefaultStyle.view, { flex: 1 }]}>
      <Text style={[DefaultStyle.viewTitle, { color: Colors.text }]}>
        Buster Bike
      </Text>
      <View style={{ justifyContent: "center", flex: 1 }}>
        <Text style={styles.info}>Gebruikersnaam</Text>
        <TextInput
          placeholder="Gebruikersnaam"
          style={styles.input}
          autoCapitalize="none"
          onChangeText={setUsername}
        />
        <Text style={styles.info}>Wachtwoord</Text>
        <TextInput
          placeholder="Wachtwoord"
          style={styles.input}
          autoCapitalize="none"
          secureTextEntry={true}
          onChangeText={setPassword}
        />
        <Pressable style={styles.button} onPress={attemptLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
        <Text
          style={{ textAlign: "center", marginTop: "2%", color: Colors.text }}
        >
          Nog geen account? Registreer{" "}
          <Text
            style={{ color: "blue" }}
            onPress={() => navigation.navigate("register")}
          >
            hier
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: Colors.text,
    color: Colors.text,
    width: "90%",
    left: "5%",
    height: 60,
    marginBottom: "2%",
    padding: "2%",
    borderRadius: 10,
  },

  button: {
    color: Colors.primary,
    backgroundColor: Colors.text,
    borderRadius: 10,
    width: "90%",
    left: "5%",
    height: 60,
    justifyContent: "center",
  },
  buttonText: {
    color: Colors.primary,
    fontSize: 20,
    textAlign: "center",
  },
  info: {
    color: Colors.accent,
    fontSize: 15,
    marginLeft: "10%",
    width: "80%",
    marginBottom: "1%",
    borderBottomColor: "teal",
    borderBottomWidth: 2,
  },
});
