import { ServerInfo } from "@/constants/Server";
import { Colors, DefaultStyle } from "@/constants/Style";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "expo-router";
import { useState } from "react";
import React, {
  Text,
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ToastAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");

  const navigation = useNavigation();

  // State variable to track password visibility
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const register = async () => {
    console.log(
      "Registering with username: " +
        username +
        " and password: " +
        password +
        " and referral code: " +
        referral
    );

    const response = await fetch(`${ServerInfo.url}/users/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        referral_code: referral,
      }),
    });

    if (response.status === 200) {
      const body = await response.json();
      await AsyncStorage.setItem("token", body["token"]);
      navigation.navigate("index");
    } else {
      ToastAndroid.showWithGravity(
        `Er is iets misgegaan, heb je de juiste referral code?`,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
    }
  };

  return (
    <SafeAreaView style={DefaultStyle.view}>
      <Text style={DefaultStyle.viewTitle}>Buster Bike</Text>
      <View style={{ justifyContent: "center", flex: 1 }}>
        <Text style={styles.info}>Referral code</Text>
        <TextInput
          placeholder="Referral code"
          placeholderTextColor={"gray"}
          style={[styles.input, { marginBottom: "10%" }]}
          autoCapitalize="none"
          onChangeText={setReferral}
          maxLength={6}
        />
        <Text style={styles.info}>Gebruikersnaam</Text>
        <TextInput
          placeholder="Gebruikersnaam"
          style={styles.input}
          autoCapitalize="none"
          onChangeText={setUsername}
        />
        <Text style={styles.info}>Wachtwoord</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            marginBottom: "1%",
            marginLeft: "4%",
          }}
        >
          <TextInput
            placeholder="Wachtwoord"
            style={styles.input}
            autoCapitalize="none"
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
          />
          <Pressable
            style={{
              borderRadius: 10,
              width: "100%",
              height: 60,
              justifyContent: "center",
              marginLeft: "-9%",
              marginBottom: "2%",
            }}
            onPress={toggleShowPassword}
          >
            <MaterialCommunityIcons
              name={showPassword ? "eye-off" : "eye"}
              size={40}
              style={{
                color: Colors.accent,
                fontSize: 25,
              }}
            />
          </Pressable>
        </View>
        <Pressable style={styles.button} onPress={register}>
          <Text style={styles.buttonText}>Registreer</Text>
        </Pressable>
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
    backgroundColor: "white",
    borderRadius: 10,
    width: "90%",
    left: "5%",
    height: 60,
    justifyContent: "center",
  },
  buttonText: {
    color: "black",
    fontSize: 20,
    textAlign: "center",
  },

  inputDark: {
    color: "white",
    backgroundColor: "black",
    borderWidth: 1,
    borderColor: "white",
    width: "90%",
    left: "5%",
    height: 60,
    marginBottom: "2%",
    padding: "2%",
    borderRadius: 10,
  },

  info: {
    color: Colors.accent,
    fontSize: 15,
    marginLeft: "10%",
    width: "80%",
    marginBottom: "1%",
    borderBottomColor: Colors.accent,
    borderBottomWidth: 2,
  },
});
